import { randomUUID, createHash } from "crypto"
import fs from "fs"
import path from "path"
import OpenAI from "openai"
import Database from "better-sqlite3"
import JSZip from "jszip"
import db from "../../utils/database/keyv"
import { getAllDocuments } from "../../utils/database/db"
import { embeddings } from "../../utils/llm/llm"
import { getStudyPlan, type StudyPlanTopic, type StudyPlanSubtopic } from "../studyplan"
import { extractImageUrls } from "../../lib/ai/imageUtils"
import { config } from "../../config/env"
import type { AnkiCard, AnkiDeck, ExtractedCard } from "./types"

export type { AnkiCard, AnkiDeck, ExtractedCard } from "./types"

type ProgressFn = (phase: string, detail?: string) => void

const SUBJECTS_ROOT = path.join(process.cwd(), "subjects")

function dbKey(subjectId: string): string {
  return `subject:${subjectId}:ankideck`
}

function getDgptClient(): OpenAI {
  const baseURL = config.dgpt_url
  const apiKey = config.dgpt_api_key
  if (!baseURL || !apiKey) throw new Error("DGPT_URL and DGPT_API_KEY must be set in .env")
  return new OpenAI({ baseURL, apiKey })
}

// --- DB helpers ---

export async function getDeck(subjectId: string): Promise<AnkiDeck> {
  return (await db.get(dbKey(subjectId))) || { cards: [] }
}

export async function saveDeck(subjectId: string, deck: AnkiDeck): Promise<void> {
  await db.set(dbKey(subjectId), deck)
}

export async function clearDeck(subjectId: string): Promise<number> {
  const deck = await getDeck(subjectId)
  const count = deck.cards.length
  deck.cards = []
  deck.lastGenerated = undefined
  await saveDeck(subjectId, deck)
  return count
}

export async function addCard(subjectId: string, card: AnkiCard): Promise<void> {
  const deck = await getDeck(subjectId)
  deck.cards.push(card)
  await saveDeck(subjectId, deck)
}

export async function updateCard(subjectId: string, cardId: string, updates: Partial<AnkiCard>): Promise<AnkiCard | null> {
  const deck = await getDeck(subjectId)
  const card = deck.cards.find(c => c.id === cardId)
  if (!card) return null
  if (updates.front !== undefined) card.front = updates.front
  if (updates.back !== undefined) card.back = updates.back
  if (updates.tags !== undefined) card.tags = updates.tags
  if (updates.topicId !== undefined) card.topicId = updates.topicId
  if (updates.subtopicId !== undefined) card.subtopicId = updates.subtopicId
  if (updates.imageUrl !== undefined) card.imageUrl = updates.imageUrl
  card.updatedAt = Date.now()
  await saveDeck(subjectId, deck)
  return card
}

export async function deleteCard(subjectId: string, cardId: string): Promise<boolean> {
  const deck = await getDeck(subjectId)
  const idx = deck.cards.findIndex(c => c.id === cardId)
  if (idx === -1) return false
  deck.cards.splice(idx, 1)
  await saveDeck(subjectId, deck)
  return true
}

function cardGuid(card: AnkiCard): string {
  return card.id.replace(/-/g, "").slice(0, 10)
}

export async function syncFromAnki(
  subjectId: string,
  extractedCards: ExtractedCard[]
): Promise<{ updated: number; added: number; deleted: number }> {
  const deck = await getDeck(subjectId)
  let updated = 0, added = 0, deleted = 0

  // Build lookup: guid → existing PageLM card
  const guidToCard = new Map<string, AnkiCard>()
  for (const card of deck.cards) {
    guidToCard.set(cardGuid(card), card)
  }

  // Build set of guids present in Anki
  const ankiGuids = new Set(extractedCards.map(e => e.guid))

  // Update existing cards & add new ones from Anki
  for (const ext of extractedCards) {
    const existing = guidToCard.get(ext.guid)

    if (existing) {
      // Update review state always (Anki is authoritative for SRS)
      existing.interval = ext.interval
      existing.due = ext.due
      existing.ease = ext.ease
      existing.reps = ext.reps
      existing.lapses = ext.lapses
      existing.queue = ext.queue
      existing.cardType = ext.cardType

      // Update content only if modified in Anki after PageLM's last update
      const existingModSec = Math.floor(existing.updatedAt / 1000)
      if (ext.modifiedAt > existingModSec) {
        if (ext.front !== existing.front || ext.back !== existing.back) {
          existing.front = ext.front
          existing.back = ext.back
          existing.updatedAt = ext.modifiedAt * 1000
        }
        if (ext.tags.length > 0) {
          // Merge tags: keep PageLM-only tags, add Anki tags
          const plTags = new Set(existing.tags)
          for (const t of ext.tags) plTags.add(t)
          existing.tags = [...plTags]
        }
      }
      updated++
    } else {
      // New card added in Anki — import it
      const now = Date.now()
      deck.cards.push({
        id: randomUUID(),
        front: ext.front,
        back: ext.back,
        tags: [...ext.tags, "anki-imported"],
        interval: ext.interval,
        due: ext.due,
        ease: ext.ease,
        reps: ext.reps,
        lapses: ext.lapses,
        queue: ext.queue,
        cardType: ext.cardType,
        createdAt: now,
        updatedAt: now,
      })
      added++
    }
  }

  // Detect deletions: cards that were synced before but no longer in Anki
  const beforeCount = deck.cards.length
  deck.cards = deck.cards.filter(card => {
    const guid = cardGuid(card)
    // Keep if: still in Anki, OR never synced (no ankiNoteId and not matching any known guid)
    if (ankiGuids.has(guid)) return true
    // If card has SRS state, it was synced before → Anki deleted it
    if (card.reps !== undefined && card.reps > 0) return false
    if (card.ankiNoteId !== undefined) return false
    // Never-synced card — keep it (will be pushed on next sync)
    return true
  })
  deleted = beforeCount - deck.cards.length

  deck.lastSyncedFromAnki = Date.now()
  await saveDeck(subjectId, deck)

  return { updated, added, deleted }
}

// --- RAG helpers ---

type Chunk = { text: string; sourceFile?: string; sourceType?: string }

async function retrieveChunks(subjectId: string): Promise<Chunk[]> {
  const collection = `subject:${subjectId}`
  const docs = await getAllDocuments(collection, embeddings)
  return docs.map((d: any) => ({
    text: typeof d.pageContent === "string" ? d.pageContent : String(d.pageContent ?? ""),
    sourceFile: d.metadata?.sourceFile,
    sourceType: d.metadata?.sourceType,
  }))
}

function listSubjectImages(subjectId: string): string[] {
  const imagesDir = path.join(SUBJECTS_ROOT, subjectId, "images")
  if (!fs.existsSync(imagesDir)) return []
  const urls: string[] = []
  try {
    for (const sourceDir of fs.readdirSync(imagesDir)) {
      const full = path.join(imagesDir, sourceDir)
      if (!fs.statSync(full).isDirectory()) continue
      for (const file of fs.readdirSync(full)) {
        if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(file)) {
          urls.push(`/subjects/${subjectId}/images/${sourceDir}/${file}`)
        }
      }
    }
  } catch {}
  return urls
}

// --- Prompt builders ---

function stripFences(s: string): string {
  return s.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, "").trim()
}

function extractJsonArray(s: string): string {
  let depth = 0, start = -1, inString = false, escape = false
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (escape) { escape = false; continue }
    if (ch === "\\") { escape = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === "[") { if (depth === 0) start = i; depth++ }
    else if (ch === "]") { depth--; if (depth === 0 && start !== -1) return s.slice(start, i + 1) }
  }
  return ""
}

function buildDupeBlock(
  existingQuestions: string[],
  targetTopicId?: string,
  targetSubtopicId?: string,
  allCards?: AnkiCard[]
): string {
  if (existingQuestions.length === 0) return ""

  const MAX_DUPE_BUDGET = 4000

  // If we have full card data, do two-tier scoping
  if (allCards && targetTopicId) {
    const sameSubtopic: string[] = []
    const otherCards: string[] = []

    for (const card of allCards) {
      const front = card.front
      if (targetSubtopicId && card.topicId === targetTopicId && card.subtopicId === targetSubtopicId) {
        sameSubtopic.push(front.slice(0, 120))
      } else {
        otherCards.push(front.slice(0, 60))
      }
    }

    let block = ""
    if (sameSubtopic.length > 0) {
      block += `\nExistierende Karten IN DIESEM Unterthema (NICHT wiederholen):\n${sameSubtopic.map(q => `- ${q}`).join("\n")}\n`
    }

    // Fill remaining budget with other cards
    const remaining = MAX_DUPE_BUDGET - block.length
    if (otherCards.length > 0 && remaining > 100) {
      let otherBlock = `\nKarten in anderen Themen (ähnliche vermeiden):\n`
      for (const q of otherCards) {
        const line = `- ${q}\n`
        if (otherBlock.length + line.length > remaining) break
        otherBlock += line
      }
      block += otherBlock
    }

    return block
  }

  // Fallback: flat list, budget-capped
  let block = `\nBereits existierende Fragen (NICHT wiederholen):\n`
  for (const q of existingQuestions) {
    const line = `- ${q.slice(0, 120)}\n`
    if (block.length + line.length > MAX_DUPE_BUDGET) break
    block += line
  }
  return block
}

function buildPrompt(
  topicTitle: string,
  subtopicTitle: string,
  materialContext: string,
  exerciseContext: string,
  imageUrls: string[],
  count: number,
  existingQuestions: string[],
  userPrompt?: string,
  targetTopicId?: string,
  targetSubtopicId?: string,
  allCards?: AnkiCard[]
): string {
  const imageList = imageUrls.length > 0
    ? `\nVerfügbare Diagramme/Bilder:\n${imageUrls.map(u => `- ${u}`).join("\n")}`
    : ""

  const dupeBlock = buildDupeBlock(existingQuestions, targetTopicId, targetSubtopicId, allCards)

  const shortRule = `WICHTIG: Halte Antworten KURZ (max 2-3 Sätze + Formel). Keine langen Herleitungen. Gib NUR valides JSON aus, keine Erklärungen davor/danach.`

  const focusBlock = userPrompt
    ? `\nFOKUS: ${userPrompt}\nErstelle die Karten mit diesem Fokus. Passe den Kartentyp entsprechend an.\n`
    : ""

  if (exerciseContext && materialContext) {
    const defaultRules = userPrompt
      ? `Regeln: Keine Duplikate. Folge dem angegebenen Fokus. Vorderseite=Frage, Rückseite=kurze Antwort+Formel. LaTeX: $...$`
      : `Regeln: Keine Duplikate. ~60% Klausur-Karten, ~40% Konzept-Karten. Vorderseite=Frage, Rückseite=kurze Antwort+Formel. LaTeX: $...$`

    return `Erstelle ${count} Anki-Karten. Thema: ${topicTitle} > ${subtopicTitle}
${shortRule}
${focusBlock}${dupeBlock}
VORLESUNGSMATERIAL:
${materialContext}

ALTKLAUSUREN (stärker gewichten):
${exerciseContext}
${imageList}

${defaultRules}

JSON-Array:
[{"front":"...","back":"...","tags":["${topicTitle}","${subtopicTitle}","Klausur"],"imageUrl":null}]`
  }

  if (exerciseContext) {
    return `Erstelle ${count} Anki-Karten aus Altklausuren. Thema: ${topicTitle} > ${subtopicTitle}
${shortRule}
${focusBlock}${dupeBlock}
Klausuraufgaben:
${exerciseContext}
${imageList}

Regeln: Keine Duplikate. Extrahiere Lösungsmethoden. Vorderseite="Wie löst man...", Rückseite=Methode+Formel (kurz!). LaTeX: $...$

JSON-Array:
[{"front":"...","back":"...","tags":["${topicTitle}","${subtopicTitle}","Klausur"],"imageUrl":null}]`
  }

  const defaultMaterialRules = userPrompt
    ? `Regeln: Keine Duplikate. Folge dem angegebenen Fokus. 1 Konzept pro Karte. Vorderseite=Frage, Rückseite=kurze Antwort+Formel. LaTeX: $...$`
    : `Regeln: Keine Duplikate. 1 Konzept pro Karte. Vorderseite=Frage, Rückseite=kurze Antwort+Formel. LaTeX: $...$. Variiere: Definition, Formel, Konzept.`

  return `Erstelle ${count} Anki-Karten. Thema: ${topicTitle} > ${subtopicTitle}
${shortRule}
${focusBlock}${dupeBlock}
Vorlesungsmaterial:
${materialContext}
${imageList}

${defaultMaterialRules}

JSON-Array:
[{"front":"...","back":"...","tags":["${topicTitle}","${subtopicTitle}","Vorlesung"],"imageUrl":null}]`
}

// --- Generation ---

const MAX_CONTEXT = 12000

export async function generateCardsForSubtopic(
  subjectId: string,
  topicId: string,
  subtopicId: string,
  count = 5,
  onProgress?: ProgressFn,
  userPrompt?: string
): Promise<AnkiCard[]> {
  const emit = onProgress || (() => {})
  const plan = await getStudyPlan(subjectId)
  if (!plan) throw new Error("No study plan found — generate one first")

  const topic = plan.topics.find(t => t.id === topicId)
  if (!topic) throw new Error("Topic not found in study plan")
  const subtopic = topic.subtopics.find(s => s.id === subtopicId)
  if (!subtopic) throw new Error("Subtopic not found in study plan")

  // Load existing questions to avoid duplicates
  const existingDeck = await getDeck(subjectId)
  const existingQuestions = existingDeck.cards.map(c => c.front)

  emit("retrieving", `RAG: ${topic.title} > ${subtopic.title}`)
  const chunks = await retrieveChunks(subjectId)

  const materialChunks = chunks.filter(c => c.sourceType !== "exercise")
  const exerciseChunks = chunks.filter(c => c.sourceType === "exercise")

  const query = `${topic.title} ${subtopic.title}`.toLowerCase()
  const scoreChunk = (c: Chunk) => {
    const text = c.text.toLowerCase()
    const words = query.split(/\s+/)
    return words.filter(w => text.includes(w)).length
  }

  const sortedMaterial = materialChunks.sort((a, b) => scoreChunk(b) - scoreChunk(a))
  const sortedExercise = exerciseChunks.sort((a, b) => scoreChunk(b) - scoreChunk(a))

  let materialContext = ""
  for (const c of sortedMaterial) {
    if (materialContext.length + c.text.length > MAX_CONTEXT) break
    materialContext += c.text + "\n\n---\n\n"
  }

  let exerciseContext = ""
  for (const c of sortedExercise) {
    if (exerciseContext.length + c.text.length > MAX_CONTEXT) break
    exerciseContext += c.text + "\n\n---\n\n"
  }

  if (!materialContext && !exerciseContext) {
    throw new Error("No source material found for this topic")
  }

  const imageUrls = listSubjectImages(subjectId)
  const contextImages = [...materialContext, ...exerciseContext]
    .toString()
    .match(/!\[.*?\]\((.*?)\)/g)
    ?.map(m => m.replace(/!\[.*?\]\(/, "").replace(/\)$/, "")) || []
  const allImages = [...new Set([...imageUrls.slice(0, 10), ...contextImages.slice(0, 5)])]

  const prompt = buildPrompt(topic.title, subtopic.title, materialContext, exerciseContext, allImages, count, existingQuestions, userPrompt, topicId, subtopicId, existingDeck.cards)

  emit("generating", `Generating: ${topic.title} > ${subtopic.title}`)

  const client = getDgptClient()
  const response = await client.chat.completions.create({
    model: config.dgpt_model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 16384,
  })

  const rawContent = response.choices[0]?.message?.content || ""
  const raw = stripFences(rawContent)
  let jsonStr = extractJsonArray(raw)

  // Attempt to repair common LaTeX-in-JSON issues before parsing
  if (jsonStr) {
    try { JSON.parse(jsonStr) } catch {
      // Fix unescaped backslashes in strings (common with LaTeX)
      jsonStr = jsonStr.replace(/"((?:[^"\\]|\\.)*)"/g, (match) => {
        try { JSON.parse(match); return match } catch {
          // Re-escape backslashes that aren't already valid JSON escapes
          const inner = match.slice(1, -1)
          const fixed = inner.replace(/\\(?!["\\/bfnrtu])/g, "\\\\")
          return `"${fixed}"`
        }
      })
    }
  }

  // Fallback: try to repair truncated array or extract individual objects
  if (!jsonStr) {
    // Try the whole raw string
    try { const t = JSON.parse(raw); jsonStr = Array.isArray(t) ? raw : `[${raw}]` } catch {
      // Try to extract individual complete JSON objects (string-aware to handle LaTeX braces)
      const objects: string[] = []
      let depth = 0, start = -1, inStr = false, esc = false
      for (let i = 0; i < raw.length; i++) {
        const ch = raw[i]
        if (esc) { esc = false; continue }
        if (ch === "\\") { esc = true; continue }
        if (ch === '"') { inStr = !inStr; continue }
        if (inStr) continue
        if (ch === "{") { if (depth === 0) start = i; depth++ }
        else if (ch === "}") { depth--; if (depth === 0 && start !== -1) { objects.push(raw.slice(start, i + 1)); start = -1 } }
      }
      if (objects.length > 0) jsonStr = `[${objects.join(",")}]`
    }
  }

  if (!jsonStr) {
    console.warn("[ankideck] failed to parse LLM response:", rawContent.slice(0, 500))
    // Retry once with stricter prompt
    const retryResp = await client.chat.completions.create({
      model: config.dgpt_model,
      messages: [
        { role: "user", content: prompt },
        { role: "assistant", content: rawContent },
        { role: "user", content: "Die Ausgabe war kein valides JSON-Array. Bitte gib NUR ein JSON-Array zurück, ohne Markdown oder Erklärung:\n[{\"front\": \"...\", \"back\": \"...\", \"tags\": [...], \"imageUrl\": null}]" },
      ],
      temperature: 0.3,
      max_tokens: 16384,
    })
    const retryRaw = stripFences(retryResp.choices[0]?.message?.content || "")
    jsonStr = extractJsonArray(retryRaw) || retryRaw
  }

  let parsed: any[]
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    // Last resort: try to salvage by extracting complete objects from jsonStr
    const salvaged: string[] = []
    let d = 0, s = -1, inS = false, e = false
    for (let i = 0; i < jsonStr.length; i++) {
      const c = jsonStr[i]
      if (e) { e = false; continue }
      if (c === "\\") { e = true; continue }
      if (c === '"') { inS = !inS; continue }
      if (inS) continue
      if (c === "{") { if (d === 0) s = i; d++ }
      else if (c === "}") { d--; if (d === 0 && s !== -1) { salvaged.push(jsonStr.slice(s, i + 1)); s = -1 } }
    }
    if (salvaged.length > 0) {
      try {
        parsed = JSON.parse(`[${salvaged.join(",")}]`)
        console.warn(`[ankideck] salvaged ${parsed.length} cards from truncated response`)
      } catch {
        console.error("[ankideck] final parse failure. Raw:", rawContent.slice(0, 300))
        throw new Error("Failed to parse Anki cards from AI response")
      }
    } else {
      console.error("[ankideck] final parse failure. Raw:", rawContent.slice(0, 300))
      throw new Error("Failed to parse Anki cards from AI response")
    }
  }

  if (!Array.isArray(parsed)) parsed = [parsed]

  const now = Date.now()
  const cards: AnkiCard[] = parsed
    .filter(c => c.front && c.back)
    .map(c => ({
      id: randomUUID(),
      front: String(c.front),
      back: String(c.back),
      tags: Array.isArray(c.tags) ? c.tags.map(String) : [topic.title, subtopic.title],
      topicId,
      subtopicId,
      imageUrl: c.imageUrl || undefined,
      sourceType: (c.tags?.includes("Klausur") ? "exercise" : "material") as "material" | "exercise",
      createdAt: now,
      updatedAt: now,
    }))

  const deck = await getDeck(subjectId)
  deck.cards.push(...cards)
  deck.lastGenerated = now
  await saveDeck(subjectId, deck)

  return cards
}

export async function generateCardsForTopic(
  subjectId: string,
  topicId: string,
  countPerSubtopic = 5,
  onProgress?: ProgressFn,
  userPrompt?: string
): Promise<AnkiCard[]> {
  const plan = await getStudyPlan(subjectId)
  if (!plan) throw new Error("No study plan found")
  const topic = plan.topics.find(t => t.id === topicId)
  if (!topic) throw new Error("Topic not found")

  const allCards: AnkiCard[] = []
  for (let i = 0; i < topic.subtopics.length; i++) {
    const sub = topic.subtopics[i]
    onProgress?.("generating", `(${i + 1}/${topic.subtopics.length}) ${topic.title} > ${sub.title}`)
    try {
      const cards = await generateCardsForSubtopic(subjectId, topicId, sub.id, countPerSubtopic, undefined, userPrompt)
      allCards.push(...cards)
    } catch (e: any) {
      console.warn(`[ankideck] failed for subtopic "${sub.title}":`, e?.message)
    }
  }
  return allCards
}

export async function generateFullDeck(
  subjectId: string,
  countPerSubtopic = 5,
  onProgress?: ProgressFn,
  userPrompt?: string
): Promise<AnkiCard[]> {
  const plan = await getStudyPlan(subjectId)
  if (!plan) throw new Error("No study plan found")

  const allCards: AnkiCard[] = []
  let total = 0
  let done = 0
  for (const t of plan.topics) total += t.subtopics.length

  for (const topic of plan.topics) {
    for (const sub of topic.subtopics) {
      done++
      onProgress?.("generating", `(${done}/${total}) ${topic.title} > ${sub.title}`)
      try {
        const cards = await generateCardsForSubtopic(subjectId, topic.id, sub.id, countPerSubtopic, undefined, userPrompt)
        allCards.push(...cards)
      } catch (e: any) {
        console.warn(`[ankideck] failed for "${topic.title} > ${sub.title}":`, e?.message)
      }
    }
  }
  return allCards
}

// --- Export (.apkg) ---

function mdToHtml(s: string): string {
  return s
    .replace(/\$\$(.*?)\$\$/g, '\\[$1\\]')
    .replace(/\$(.*?)\$/g, '\\($1\\)')
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

function ankiChecksum(s: string): number {
  const hash = createHash("sha1").update(s, "utf8").digest("hex")
  return parseInt(hash.slice(0, 8), 16)
}

export async function exportDeckApkg(subjectId: string, deckName: string): Promise<Buffer> {
  const deck = await getDeck(subjectId)
  if (deck.cards.length === 0) throw new Error("Deck is empty")

  const tmpDir = path.join(process.cwd(), "storage", "cache", `apkg-${Date.now()}`)
  fs.mkdirSync(tmpDir, { recursive: true })

  try {
    // Collect media files
    const mediaMap: Record<string, string> = {} // { "0": "image_name.png", ... }
    const mediaFiles: { idx: string; data: Buffer }[] = []
    let mediaIdx = 0

    for (const card of deck.cards) {
      if (!card.imageUrl) continue
      // Resolve local path from URL like /subjects/:id/images/:sourceId/:filename
      const match = card.imageUrl.match(/\/subjects\/[^/]+\/images\/(.+)/)
      if (!match) continue
      const localPath = path.join(SUBJECTS_ROOT, subjectId, "images", match[1])
      if (!fs.existsSync(localPath)) continue

      const ext = path.extname(localPath)
      const mediaName = `img_${mediaIdx}${ext}`
      const data = fs.readFileSync(localPath)

      mediaMap[String(mediaIdx)] = mediaName
      mediaFiles.push({ idx: String(mediaIdx), data })
      // Rewrite card imageUrl to just the media filename for Anki
      card.imageUrl = mediaName
      mediaIdx++
    }

    // Build SQLite database (Anki 2.1 schema)
    const dbPath = path.join(tmpDir, "collection.anki21")
    const db = new Database(dbPath)

    db.pragma("journal_mode = WAL")

    // Anki schema
    db.exec(`
      CREATE TABLE col (
        id integer PRIMARY KEY,
        crt integer NOT NULL,
        mod integer NOT NULL,
        scm integer NOT NULL,
        ver integer NOT NULL,
        dty integer NOT NULL,
        usn integer NOT NULL,
        ls integer NOT NULL,
        conf text NOT NULL,
        models text NOT NULL,
        decks text NOT NULL,
        dconf text NOT NULL,
        tags text NOT NULL
      );
      CREATE TABLE notes (
        id integer PRIMARY KEY,
        guid text NOT NULL,
        mid integer NOT NULL,
        mod integer NOT NULL,
        usn integer NOT NULL,
        tags text NOT NULL,
        flds text NOT NULL,
        sfld text NOT NULL,
        csum integer NOT NULL,
        flags integer NOT NULL,
        data text NOT NULL
      );
      CREATE TABLE cards (
        id integer PRIMARY KEY,
        nid integer NOT NULL,
        did integer NOT NULL,
        ord integer NOT NULL,
        mod integer NOT NULL,
        usn integer NOT NULL,
        type integer NOT NULL,
        queue integer NOT NULL,
        due integer NOT NULL,
        ivl integer NOT NULL,
        factor integer NOT NULL,
        reps integer NOT NULL,
        lapses integer NOT NULL,
        left integer NOT NULL,
        odue integer NOT NULL,
        odid integer NOT NULL,
        flags integer NOT NULL,
        data text NOT NULL
      );
      CREATE TABLE revlog (
        id integer PRIMARY KEY,
        cid integer NOT NULL,
        usn integer NOT NULL,
        ease integer NOT NULL,
        ivl integer NOT NULL,
        lastIvl integer NOT NULL,
        factor integer NOT NULL,
        time integer NOT NULL,
        type integer NOT NULL
      );
      CREATE TABLE graves (
        usn integer NOT NULL,
        oid integer NOT NULL,
        type integer NOT NULL
      );
    `)

    const now = Math.floor(Date.now() / 1000)
    const deckId = now * 1000 + Math.floor(Math.random() * 1000)
    const modelId = now * 1000 + Math.floor(Math.random() * 1000) + 1

    // Model: Basic (Front/Back)
    const models: Record<string, any> = {
      [String(modelId)]: {
        id: modelId, name: "PageLM Anki", type: 0, mod: now, usn: -1, sortf: 0,
        did: deckId, tmpls: [{
          name: "Card 1", ord: 0, qfmt: "{{Front}}", afmt: '{{FrontSide}}<hr id="answer">{{Back}}',
          bqfmt: "", bafmt: "", did: null, bfont: "", bsize: 0,
        }],
        flds: [
          { name: "Front", ord: 0, sticky: false, rtl: false, font: "Arial", size: 20, media: [] },
          { name: "Back", ord: 1, sticky: false, rtl: false, font: "Arial", size: 20, media: [] },
        ],
        css: ".card { font-family: arial; font-size: 20px; text-align: center; color: black; background-color: white; } code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; }",
        latexPre: "\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n",
        latexPost: "\\end{document}",
        latexsvg: false, req: [[0, "any", [0]]],
      },
    }

    const decks: Record<string, any> = {
      [String(deckId)]: {
        id: deckId, name: deckName, mod: now, usn: -1, lrnToday: [0, 0],
        revToday: [0, 0], newToday: [0, 0], timeToday: [0, 0],
        collapsed: false, browserCollapsed: false,
        desc: `Exported from PageLM - ${deckName}`,
        dyn: 0, conf: 1, extendNew: 0, extendRev: 0,
      },
    }

    const dconf: Record<string, any> = {
      "1": {
        id: 1, name: "Default", mod: 0, usn: 0, maxTaken: 60, autoplay: true,
        timer: 0, replayq: true,
        new: { delays: [1, 10], ints: [1, 4, 0], initialFactor: 2500, order: 1, perDay: 20 },
        rev: { perDay: 200, ease4: 1.3, fuzz: 0.05, minSpace: 1, ivlFct: 1, maxIvl: 36500 },
        lapse: { delays: [10], mult: 0, minInt: 1, leechFails: 8, leechAction: 0 },
        dyn: false,
      },
    }

    const conf = {
      activeDecks: [deckId], curDeck: deckId, newSpread: 0, collapseTime: 1200,
      timeLim: 0, estTimes: true, dueCounts: true, curModel: String(modelId),
      nextPos: deck.cards.length + 1, sortType: "noteFld", sortBackwards: false,
      addToCur: true,
    }

    db.prepare(`INSERT INTO col VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      1, now, now, now * 1000, 11, 0, -1, 0,
      JSON.stringify(conf),
      JSON.stringify(models),
      JSON.stringify(decks),
      JSON.stringify(dconf),
      "{}"
    )

    const insertNote = db.prepare(`INSERT INTO notes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    const insertCard = db.prepare(`INSERT INTO cards VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)

    const insertMany = db.transaction(() => {
      for (let i = 0; i < deck.cards.length; i++) {
        const c = deck.cards[i]
        const noteId = modelId + i + 1
        const cardId = modelId + deck.cards.length + i + 1
        const guid = randomUUID().slice(0, 10)

        let front = mdToHtml(c.front)
        let back = mdToHtml(c.back)
        if (c.imageUrl) {
          back += `<br><img src="${c.imageUrl}">`
        }

        const tags = c.tags.map(t => t.replace(/\s+/g, "_")).join(" ")
        const flds = `${front}\x1f${back}`
        const sfld = c.front.slice(0, 100)

        insertNote.run(noteId, guid, modelId, now, -1, tags ? ` ${tags} ` : "", flds, sfld, ankiChecksum(sfld), 0, "")
        insertCard.run(cardId, noteId, deckId, 0, now, -1, 0, 0, i, 0, 0, 0, 0, 0, 0, 0, 0, "")
      }
    })
    insertMany()

    db.close()

    // Build ZIP with JSZip
    const zip = new JSZip()
    zip.file("collection.anki21", fs.readFileSync(dbPath))
    zip.file("media", JSON.stringify(mediaMap))
    for (const mf of mediaFiles) {
      zip.file(mf.idx, mf.data)
    }

    const apkgBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "STORE" })

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true })

    return apkgBuffer
  } catch (e) {
    // Cleanup on error
    try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch {}
    throw e
  }
}
