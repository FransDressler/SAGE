import { createHash, randomUUID } from "crypto"
import fs from "fs"
import path from "path"
import Database from "better-sqlite3"
import type { AnkiCard, ExtractedCard } from "./types"

const SUBJECTS_ROOT = path.join(process.cwd(), "subjects")

export type MediaFile = { name: string; data: Buffer }

function resolveImagePath(imageUrl: string, subjectId: string): { localPath: string; name: string } | null {
  const match = imageUrl.match(/\/subjects\/[^/]+\/images\/(.+)/)
  if (!match) return null
  const localPath = path.join(SUBJECTS_ROOT, subjectId, "images", match[1])
  if (!fs.existsSync(localPath)) return null
  // Create a unique safe filename: pagelm_<hash>.<ext>
  const hash = createHash("md5").update(match[1]).digest("hex").slice(0, 8)
  const ext = path.extname(localPath)
  const name = `pagelm_${hash}${ext}`
  return { localPath, name }
}

function imageTag(card: AnkiCard, subjectId: string): string {
  if (!card.imageUrl) return ""
  const resolved = resolveImagePath(card.imageUrl, subjectId)
  if (resolved) return `<br><img src="${resolved.name}">`
  return ""
}

// Collect all media files referenced by cards
export function collectMediaFiles(cards: AnkiCard[], subjectId: string): MediaFile[] {
  const seen = new Set<string>()
  const files: MediaFile[] = []
  for (const card of cards) {
    if (!card.imageUrl) continue
    const resolved = resolveImagePath(card.imageUrl, subjectId)
    if (!resolved || seen.has(resolved.name)) continue
    seen.add(resolved.name)
    files.push({ name: resolved.name, data: fs.readFileSync(resolved.localPath) })
  }
  return files
}

function ankiChecksum(s: string): number {
  const hash = createHash("sha1").update(s, "utf8").digest("hex")
  return parseInt(hash.slice(0, 8), 16)
}

function mdToHtml(s: string): string {
  return s
    .replace(/\$\$(.*?)\$\$/g, '\\[$1\\]')
    .replace(/\$(.*?)\$/g, '\\($1\\)')
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

function randomGuid(): string {
  return randomUUID().replace(/-/g, "").slice(0, 10)
}

function stripHtml(s: string): string {
  return s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<b>(.*?)<\/b>/gi, "**$1**")
    .replace(/<i>(.*?)<\/i>/gi, "*$1*")
    .replace(/<code>(.*?)<\/code>/gi, "`$1`")
    .replace(/\\\[(.*?)\\\]/g, '$$$$$1$$$$')
    .replace(/\\\((.*?)\\\)/g, '$$$1$$')
    .replace(/<img[^>]*>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

function patchUnicase(tmpPath: string): void {
  let raw = fs.readFileSync(tmpPath)
  const search = Buffer.from("unicase")
  const replace = Buffer.from("nocase ")
  let offset = 0
  while ((offset = raw.indexOf(search, offset)) !== -1) {
    replace.copy(raw, offset)
    offset += search.length
  }
  fs.writeFileSync(tmpPath, raw)
}

export function extractCardsFromCollection(
  collectionBuf: Buffer,
  deckName: string
): ExtractedCard[] {
  const tmpPath = path.join(process.cwd(), "storage", "cache", `anki-extract-${Date.now()}.anki2`)
  fs.mkdirSync(path.dirname(tmpPath), { recursive: true })
  fs.writeFileSync(tmpPath, collectionBuf)

  try {
    patchUnicase(tmpPath)
    const db = new Database(tmpPath, { readonly: true })

    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[]
    const tableNames = tables.map(t => t.name)
    const isV18 = tableNames.includes("notetypes")

    // Find deck ID by name
    let deckId: number | null = null

    if (isV18) {
      const rows = db.prepare("SELECT id, name FROM decks").all() as { id: number; name: string }[]
      for (const r of rows) { if (r.name === deckName) { deckId = r.id; break } }
    } else {
      const colRow = db.prepare("SELECT decks FROM col").get() as any
      const decks: Record<string, any> = JSON.parse(colRow.decks)
      for (const [id, deck] of Object.entries(decks) as [string, any][]) {
        if (deck.name === deckName) { deckId = Number(id); break }
      }
    }

    if (deckId === null) {
      db.close()
      fs.unlinkSync(tmpPath)
      return []
    }

    // Query all cards + notes in this deck
    const rows = db.prepare(`
      SELECT n.guid, n.flds, n.tags, n.mod AS noteMod,
             c.type AS ctype, c.queue, c.due, c.ivl, c.factor, c.reps, c.lapses, c.mod AS cardMod
      FROM cards c
      JOIN notes n ON c.nid = n.id
      WHERE c.did = ?
    `).all(deckId) as any[]

    const extracted: ExtractedCard[] = []
    for (const row of rows) {
      const fields = (row.flds as string).split("\x1f")
      const front = stripHtml(fields[0] || "")
      const back = stripHtml(fields[1] || "")
      if (!front) continue

      const tags = (row.tags as string || "").trim().split(/\s+/).filter(Boolean)

      extracted.push({
        guid: row.guid,
        front,
        back,
        tags,
        interval: row.ivl || 0,
        due: row.due || 0,
        ease: row.factor || 2500,
        reps: row.reps || 0,
        lapses: row.lapses || 0,
        queue: row.queue || 0,
        cardType: row.ctype || 0,
        modifiedAt: Math.max(row.noteMod || 0, row.cardMod || 0),
      })
    }

    db.close()
    fs.unlinkSync(tmpPath)
    return extracted
  } catch (e) {
    try { fs.unlinkSync(tmpPath) } catch {}
    throw e
  }
}

export function mergeIntoCollection(
  collectionBuf: Buffer,
  cards: AnkiCard[],
  deckName: string,
  subjectId: string
): Buffer {
  // Write collection to temp file (better-sqlite3 needs a file path)
  const tmpPath = path.join(process.cwd(), "storage", "cache", `anki-merge-${Date.now()}.anki2`)
  fs.mkdirSync(path.dirname(tmpPath), { recursive: true })
  fs.writeFileSync(tmpPath, collectionBuf)

  try {
    patchUnicase(tmpPath)

    const db = new Database(tmpPath)
    db.pragma("journal_mode = WAL")

    const now = Math.floor(Date.now() / 1000)

    // Check schema version
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[]
    const tableNames = tables.map(t => t.name)
    console.log("[ankiweb-merge] tables:", tableNames.join(", "))

    // V18+ has separate notetypes/decks tables; V11 stores them as JSON in col
    // If notetypes table exists, use V18 even if col also exists (hybrid schema)
    const isV18 = tableNames.includes("notetypes")

    if (isV18) {
      console.log("[ankiweb-merge] V18 schema detected — using V18 merge logic")
      return mergeV18(db, tmpPath, cards, deckName, subjectId, now)
    }

    // --- V11 Schema ---
    const colRow = db.prepare("SELECT decks, models FROM col").get() as any
    let decks: Record<string, any> = JSON.parse(colRow.decks)
    let models: Record<string, any> = JSON.parse(colRow.models)

    // Find existing deck by name
    let deckId: number | null = null
    for (const [id, deck] of Object.entries(decks) as [string, any][]) {
      if (deck.name === deckName) {
        deckId = Number(id)
        break
      }
    }

    // Create deck if not found
    if (deckId === null) {
      deckId = now * 1000 + Math.floor(Math.random() * 1000)
      decks[String(deckId)] = {
        id: deckId,
        name: deckName,
        mod: now,
        usn: -1,
        lrnToday: [0, 0],
        revToday: [0, 0],
        newToday: [0, 0],
        timeToday: [0, 0],
        collapsed: false,
        browserCollapsed: false,
        desc: `Synced from PageLM`,
        dyn: 0,
        conf: 1,
        extendNew: 0,
        extendRev: 0,
      }
    }

    // --- Find or create model (notetype) ---
    const MODEL_NAME = "PageLM Basic"
    let modelId: number | null = null
    for (const [id, model] of Object.entries(models) as [string, any][]) {
      if (model.name === MODEL_NAME) {
        modelId = Number(id)
        break
      }
    }

    if (modelId === null) {
      modelId = now * 1000 + Math.floor(Math.random() * 1000) + 1
      models[String(modelId)] = {
        id: modelId,
        name: MODEL_NAME,
        type: 0,
        mod: now,
        usn: -1,
        sortf: 0,
        did: deckId,
        tmpls: [{
          name: "Card 1",
          ord: 0,
          qfmt: "{{Front}}",
          afmt: '{{FrontSide}}<hr id="answer">{{Back}}',
          bqfmt: "", bafmt: "", did: null, bfont: "", bsize: 0,
        }],
        flds: [
          { name: "Front", ord: 0, sticky: false, rtl: false, font: "Arial", size: 20, media: [] },
          { name: "Back", ord: 1, sticky: false, rtl: false, font: "Arial", size: 20, media: [] },
        ],
        css: ".card { font-family: arial; font-size: 20px; text-align: center; color: black; background-color: white; } code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; }",
        latexPre: "\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n",
        latexPost: "\\end{document}",
        latexsvg: false,
        req: [[0, "any", [0]]],
      }
    }

    // Update col with new decks/models
    db.prepare("UPDATE col SET decks = ?, models = ?, mod = ?, usn = -1").run(
      JSON.stringify(decks), JSON.stringify(models), now
    )

    // --- Collect existing note guids to avoid duplicates ---
    const existingGuids = new Set<string>()
    const guidRows = db.prepare("SELECT guid FROM notes WHERE mid = ?").all(modelId) as { guid: string }[]
    for (const row of guidRows) existingGuids.add(row.guid)

    // --- Build media map from existing collection ---
    // Anki stores media in a separate media DB, not in the collection itself.
    // For sync, images in cards should reference filenames that exist in Anki's media folder.
    // We'll embed image references as HTML; the user needs to have media synced separately.

    // --- Insert cards ---
    const insertNote = db.prepare(
      "INSERT OR IGNORE INTO notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    const insertCard = db.prepare(
      "INSERT OR IGNORE INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )

    // Get max existing IDs to avoid collisions
    const maxNoteId = (db.prepare("SELECT MAX(id) as m FROM notes").get() as any)?.m || 0
    const maxCardId = (db.prepare("SELECT MAX(id) as m FROM cards").get() as any)?.m || 0
    let noteIdCounter = Math.max(maxNoteId + 1, now * 1000)
    let cardIdCounter = Math.max(maxCardId + 1, now * 1000)

    const insertMany = db.transaction(() => {
      for (const card of cards) {
        // Use a deterministic guid based on card ID so re-sync updates rather than duplicates
        const guid = card.id.replace(/-/g, "").slice(0, 10)
        const cType = card.cardType ?? 0
        const cQueue = card.queue ?? 0
        const cDue = card.due ?? 0
        const cIvl = card.interval ?? 0
        const cFactor = card.ease ?? 0
        const cReps = card.reps ?? 0
        const cLapses = card.lapses ?? 0

        if (existingGuids.has(guid)) {
          // Update existing note content
          let front = mdToHtml(card.front)
          let back = mdToHtml(card.back)
          back += imageTag(card, subjectId)
          const flds = `${front}\x1f${back}`
          const sfld = card.front.slice(0, 100)
          const tags = card.tags.map(t => t.replace(/\s+/g, "_")).join(" ")

          db.prepare("UPDATE notes SET flds = ?, sfld = ?, csum = ?, tags = ?, mod = ?, usn = -1 WHERE guid = ? AND mid = ?").run(
            flds, sfld, ankiChecksum(sfld), tags ? ` ${tags} ` : "", now, guid, modelId
          )
          // Update card scheduling state
          if (cReps > 0 || cIvl > 0) {
            db.prepare(
              "UPDATE cards SET type = ?, queue = ?, due = ?, ivl = ?, factor = ?, reps = ?, lapses = ?, mod = ?, usn = -1 WHERE nid = (SELECT id FROM notes WHERE guid = ? AND mid = ?)"
            ).run(cType, cQueue, cDue, cIvl, cFactor, cReps, cLapses, now, guid, modelId)
          }
          continue
        }

        const noteId = noteIdCounter++
        const cardId = cardIdCounter++

        let front = mdToHtml(card.front)
        let back = mdToHtml(card.back)
        back += imageTag(card, subjectId)

        const flds = `${front}\x1f${back}`
        const sfld = card.front.slice(0, 100)
        const tags = card.tags.map(t => t.replace(/\s+/g, "_")).join(" ")

        insertNote.run(noteId, guid, modelId, now, -1, tags ? ` ${tags} ` : "", flds, sfld, ankiChecksum(sfld), 0, "")
        insertCard.run(cardId, noteId, deckId, 0, now, -1, cType, cQueue, cDue || noteIdCounter, cIvl, cFactor, cReps, cLapses, 0, 0, 0, 0, "")

        existingGuids.add(guid)
      }
    })
    insertMany()

    db.close()

    // Read back the merged DB
    const result = fs.readFileSync(tmpPath)
    fs.unlinkSync(tmpPath)
    // Clean up WAL/SHM files
    try { fs.unlinkSync(tmpPath + "-wal") } catch {}
    try { fs.unlinkSync(tmpPath + "-shm") } catch {}

    return result
  } catch (e) {
    try { fs.unlinkSync(tmpPath) } catch {}
    try { fs.unlinkSync(tmpPath + "-wal") } catch {}
    try { fs.unlinkSync(tmpPath + "-shm") } catch {}
    throw e
  }
}

// --- V18 Schema Merge ---
// V18 uses separate tables for decks, notetypes, fields, templates instead of JSON blobs in col

function mergeV18(
  db: ReturnType<typeof Database>,
  tmpPath: string,
  cards: AnkiCard[],
  deckName: string,
  subjectId: string,
  now: number
): Buffer {
  try {
    // --- Find or create deck ---
    let deckId: number | null = null
    const deckRows = db.prepare("SELECT id, name FROM decks").all() as { id: number; name: string }[]
    for (const dr of deckRows) {
      if (dr.name === deckName) { deckId = dr.id; break }
    }

    if (deckId === null) {
      deckId = now * 1000 + Math.floor(Math.random() * 1000)
      // V18 decks table: id, name, mtime_secs, usn, common (blob), kind (blob)
      // common = DeckCommon protobuf: field 1 (bool study_collapsed) = false, field 2 (bool browser_collapsed) = false
      //   → empty protobuf is valid (all defaults false), but some Anki builds expect at least the wire bytes
      // kind = NormalDeck protobuf wrapped in DeckKind oneof field 1:
      //   NormalDeck has field 1 = config_id (int64), default config = 1
      //   Protobuf encoding: field 1, wire type 0 (varint), value 1 → bytes [0x08, 0x01]
      const deckCommon = Buffer.alloc(0) // all-defaults DeckCommon is valid empty protobuf
      // kind = DeckKind oneof field 1 (NormalDeck), length-delimited:
      //   0x0a = field 1, wire type 2 (length-delimited)
      //   0x02 = length 2
      //   0x08 0x01 = NormalDeck { config_id = 1 }
      const normalDeck = Buffer.from([0x0a, 0x02, 0x08, 0x01])
      db.prepare("INSERT INTO decks (id, name, mtime_secs, usn, common, kind) VALUES (?, ?, ?, -1, ?, ?)")
        .run(deckId, deckName, now, deckCommon, normalDeck)
      console.log("[ankiweb-merge] created deck:", deckName, "id:", deckId)
    }

    // --- Find a usable notetype (reuse existing "Basic" type with Front/Back fields) ---
    let notetypeId: number | null = null
    const ntRows = db.prepare("SELECT id, name FROM notetypes").all() as { id: number; name: string }[]

    // First look for our own notetype from previous syncs
    for (const nr of ntRows) {
      if (nr.name === "PageLM Basic") { notetypeId = nr.id; break }
    }

    // If not found, find any existing notetype that has Front+Back fields (the standard "Basic" type)
    if (notetypeId === null) {
      for (const nr of ntRows) {
        const fields = db.prepare("SELECT name FROM fields WHERE ntid = ? ORDER BY ord").all(nr.id) as { name: string }[]
        const fieldNames = fields.map(f => f.name.toLowerCase())
        if (fieldNames.includes("front") && fieldNames.includes("back")) {
          notetypeId = nr.id
          console.log("[ankiweb-merge] reusing existing notetype:", nr.name, "id:", nr.id)
          break
        }
      }
    }

    // If still not found, use the first notetype with at least 2 fields
    if (notetypeId === null) {
      for (const nr of ntRows) {
        const fields = db.prepare("SELECT COUNT(*) as c FROM fields WHERE ntid = ?").get(nr.id) as { c: number }
        if (fields.c >= 2) {
          notetypeId = nr.id
          console.log("[ankiweb-merge] using fallback notetype:", nr.name, "id:", nr.id)
          break
        }
      }
    }

    if (notetypeId === null) {
      throw new Error("No suitable notetype found in Anki collection")
    }

    // --- Collect existing guids ---
    const existingGuids = new Set<string>()
    const guidRows = db.prepare("SELECT guid FROM notes WHERE mid = ?").all(notetypeId) as { guid: string }[]
    for (const row of guidRows) existingGuids.add(row.guid)

    // --- Insert/update notes and cards ---
    const insertNote = db.prepare(
      "INSERT OR IGNORE INTO notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    const insertCard = db.prepare(
      "INSERT OR IGNORE INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )

    const maxNoteId = (db.prepare("SELECT MAX(id) as m FROM notes").get() as any)?.m || 0
    const maxCardId = (db.prepare("SELECT MAX(id) as m FROM cards").get() as any)?.m || 0
    let noteIdCounter = Math.max(maxNoteId + 1, now * 1000)
    let cardIdCounter = Math.max(maxCardId + 1, now * 1000)

    const insertMany = db.transaction(() => {
      for (const card of cards) {
        const guid = card.id.replace(/-/g, "").slice(0, 10)

        const cType = card.cardType ?? 0
        const cQueue = card.queue ?? 0
        const cDue = card.due ?? 0
        const cIvl = card.interval ?? 0
        const cFactor = card.ease ?? 0
        const cReps = card.reps ?? 0
        const cLapses = card.lapses ?? 0

        let front = mdToHtml(card.front)
        let back = mdToHtml(card.back)
        back += imageTag(card, subjectId)
        const flds = `${front}\x1f${back}`
        const sfld = card.front.slice(0, 100)
        const tags = card.tags.map(t => t.replace(/\s+/g, "_")).join(" ")

        if (existingGuids.has(guid)) {
          db.prepare("UPDATE notes SET flds = ?, sfld = ?, csum = ?, tags = ?, mod = ?, usn = -1 WHERE guid = ? AND mid = ?")
            .run(flds, sfld, ankiChecksum(sfld), tags ? ` ${tags} ` : "", now, guid, notetypeId)
          // Update card scheduling state
          if (cReps > 0 || cIvl > 0) {
            db.prepare(
              "UPDATE cards SET type = ?, queue = ?, due = ?, ivl = ?, factor = ?, reps = ?, lapses = ?, mod = ?, usn = -1 WHERE nid = (SELECT id FROM notes WHERE guid = ? AND mid = ?)"
            ).run(cType, cQueue, cDue, cIvl, cFactor, cReps, cLapses, now, guid, notetypeId)
          }
          continue
        }

        const noteId = noteIdCounter++
        const cardId = cardIdCounter++

        insertNote.run(noteId, guid, notetypeId, now, -1, tags ? ` ${tags} ` : "", flds, sfld, ankiChecksum(sfld), 0, "")
        insertCard.run(cardId, noteId, deckId, 0, now, -1, cType, cQueue, cDue || noteIdCounter, cIvl, cFactor, cReps, cLapses, 0, 0, 0, 0, "")
        existingGuids.add(guid)
      }
    })
    insertMany()

    console.log("[ankiweb-merge] V18 merge done. Cards:", cards.length)

    db.close()
    const result = fs.readFileSync(tmpPath)
    fs.unlinkSync(tmpPath)
    try { fs.unlinkSync(tmpPath + "-wal") } catch {}
    try { fs.unlinkSync(tmpPath + "-shm") } catch {}
    return result
  } catch (e) {
    try { db.close() } catch {}
    throw e
  }
}
