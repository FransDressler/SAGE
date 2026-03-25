import { randomUUID } from "crypto"
import db from "../../utils/database/keyv"
import { getAllDocuments, getRetrieverWithParents } from "../../utils/database/db"
import { embeddings } from "../../utils/llm/llm"
import llm from "../../utils/llm/llm"
import { listSources } from "../../utils/subjects/subjects"
import type { LLM } from "../../utils/llm/models/types"

// --- Types ---

export type StudyPlanSubtopic = {
  id: string
  title: string
  order: number
  content: string
  status: "empty" | "generating" | "ready" | "error"
  generatedAt?: number
}

export type StudyPlanTopic = {
  id: string
  title: string
  order: number
  subtopics: StudyPlanSubtopic[]
}

export type StudyPlan = {
  topics: StudyPlanTopic[]
  generatedAt?: number
  sourceCount: number
  backgroundSourceIds?: string[]
  prompt?: string
}

type ProgressFn = (phase: string, detail?: string) => void

// --- DB helpers ---

function dbKey(subjectId: string): string {
  return `subject:${subjectId}:studyplan`
}

export async function getStudyPlan(subjectId: string): Promise<StudyPlan | null> {
  return (await db.get(dbKey(subjectId))) || null
}

export async function saveStudyPlan(subjectId: string, plan: StudyPlan): Promise<void> {
  await db.set(dbKey(subjectId), plan)
}

export async function deleteStudyPlan(subjectId: string): Promise<boolean> {
  const plan = await getStudyPlan(subjectId)
  if (!plan) return false
  await db.delete(dbKey(subjectId))
  return true
}

// --- CRUD ---

export async function addTopic(subjectId: string, title: string): Promise<StudyPlanTopic> {
  const plan = (await getStudyPlan(subjectId)) || { topics: [], sourceCount: 0 }
  const topic: StudyPlanTopic = {
    id: randomUUID(),
    title,
    order: plan.topics.length,
    subtopics: [],
  }
  plan.topics.push(topic)
  await saveStudyPlan(subjectId, plan)
  return topic
}

export async function deleteTopic(subjectId: string, topicId: string): Promise<boolean> {
  const plan = await getStudyPlan(subjectId)
  if (!plan) return false
  const idx = plan.topics.findIndex(t => t.id === topicId)
  if (idx === -1) return false
  plan.topics.splice(idx, 1)
  plan.topics.forEach((t, i) => { t.order = i })
  await saveStudyPlan(subjectId, plan)
  return true
}

export async function addSubtopic(subjectId: string, topicId: string, title: string): Promise<StudyPlanSubtopic | null> {
  const plan = await getStudyPlan(subjectId)
  if (!plan) return null
  const topic = plan.topics.find(t => t.id === topicId)
  if (!topic) return null
  const sub: StudyPlanSubtopic = {
    id: randomUUID(),
    title,
    order: topic.subtopics.length,
    content: "",
    status: "empty",
  }
  topic.subtopics.push(sub)
  await saveStudyPlan(subjectId, plan)
  return sub
}

export async function deleteSubtopic(subjectId: string, topicId: string, subtopicId: string): Promise<boolean> {
  const plan = await getStudyPlan(subjectId)
  if (!plan) return false
  const topic = plan.topics.find(t => t.id === topicId)
  if (!topic) return false
  const idx = topic.subtopics.findIndex(s => s.id === subtopicId)
  if (idx === -1) return false
  topic.subtopics.splice(idx, 1)
  topic.subtopics.forEach((s, i) => { s.order = i })
  await saveStudyPlan(subjectId, plan)
  return true
}

// --- AI Generation ---

function stripFences(s: string): string {
  return s.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, "").trim()
}

function extractJsonObject(s: string): string {
  let depth = 0, start = -1
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "{") { if (depth === 0) start = i; depth++ }
    else if (s[i] === "}") { depth--; if (depth === 0 && start !== -1) return s.slice(start, i + 1) }
  }
  return ""
}

function toText(out: any): string {
  if (!out) return ""
  if (typeof out === "string") return out
  if (typeof out?.content === "string") return out.content
  if (Array.isArray(out?.content)) return out.content.map((p: any) => (typeof p === "string" ? p : p?.text ?? "")).join("")
  return String(out ?? "")
}

const MAX_CONTEXT_PER_SUBTOPIC = 12000

const EXTRACT_TOPICS_PROMPT = `You are a pedagogical expert extracting key topics from a single document.
Analyze the document and extract the main topics and subtopics it covers.

Return ONLY a JSON object (no markdown, no code fences):
{
  "topics": [
    {
      "title": "Main Topic Title",
      "subtopics": [
        { "title": "Subtopic Title" }
      ]
    }
  ]
}

Guidelines:
- Extract all distinct topics covered in this document
- Each main topic should have 1-5 subtopics
- Use the same language as the source material
- Subtopic titles should be specific and descriptive
- Focus on key concepts, definitions, and important points`

const MERGE_TOPICS_PROMPT = `You are a pedagogical expert organizing a study plan.
You are given extracted topics from multiple documents. Merge them into a single coherent study plan.

Return ONLY a JSON object (no markdown, no code fences):
{
  "topics": [
    {
      "title": "Main Topic Title",
      "subtopics": [
        { "title": "Subtopic Title" }
      ]
    }
  ]
}

Guidelines:
- Merge duplicate or overlapping topics
- Order topics from foundational to advanced
- Use the same language as the source material
- Keep subtopic titles specific and descriptive
- Aim for 4-10 main topics total`

const SUBTOPIC_CONTENT_PROMPT = `You are a pedagogical expert writing comprehensive study material.
Write a thorough, clear explanation of the given subtopic based on the provided source material.

Guidelines:
- Write in the same language as the source material
- Use clear, educational language suitable for studying
- Include key definitions, concepts, and relationships
- Use markdown formatting (headings, bold, lists, etc.)
- Be comprehensive but focused on the subtopic
- Reference specific facts and details from the source material
- Aim for 300-800 words`

const MAX_CHARS_PER_DOC = 50000

async function loadSourceDocs(subjectId: string, sourceIds: string[]): Promise<Map<string, { text: string; sourceFile: string }>> {
  const collection = `subject:${subjectId}`
  const docs = await getAllDocuments(collection, embeddings, { sourceIds })
  const bySource = new Map<string, { text: string; sourceFile: string }>()
  for (const d of docs) {
    const sid = d.metadata?.sourceId
    if (!sid) continue
    const existing = bySource.get(sid)
    const chunk = typeof d.pageContent === "string" ? d.pageContent : String(d.pageContent ?? "")
    if (existing) {
      existing.text += "\n\n" + chunk
    } else {
      bySource.set(sid, { text: chunk, sourceFile: d.metadata?.sourceFile || "unknown" })
    }
  }
  return bySource
}

export type GenerateOpts = {
  primarySourceIds?: string[]
  backgroundSourceIds?: string[]
  prompt?: string
}

export async function generatePlanStructure(
  subjectId: string,
  llmOverride?: LLM,
  onProgress?: ProgressFn,
  opts?: GenerateOpts,
): Promise<StudyPlan> {
  const model = llmOverride || llm
  const emit = onProgress || (() => {})
  const { primarySourceIds, backgroundSourceIds, prompt: userPrompt } = opts || {}

  emit("retrieving", "Loading source material...")

  // Determine which sources are primary (define structure)
  let primaryIds: string[]
  if (primarySourceIds?.length) {
    primaryIds = primarySourceIds
  } else {
    // Fallback: use all sources as primary
    const allSources = await listSources(subjectId)
    primaryIds = allSources.map(s => s.id)
  }

  const primaryDocs = await loadSourceDocs(subjectId, primaryIds)
  if (primaryDocs.size === 0) throw new Error("No documents found for selected sources")

  const customInstr = userPrompt?.trim()
    ? `\n\nADDITIONAL INSTRUCTIONS FROM USER:\n${userPrompt.trim()}`
    : ""

  // Phase 1: Extract topics from each primary document individually
  const allExtracted: { docName: string; topics: any[] }[] = []
  let docIdx = 0
  for (const [, doc] of primaryDocs) {
    docIdx++
    emit("analyzing", `Extracting topics from ${doc.sourceFile} (${docIdx}/${primaryDocs.size})...`)

    const docText = doc.text.slice(0, MAX_CHARS_PER_DOC)
    const msgs = [
      { role: "system", content: EXTRACT_TOPICS_PROMPT + customInstr },
      { role: "user", content: `Document: "${doc.sourceFile}"\n\n${docText}\n\nExtract the key topics. Return only the JSON object.` },
    ]

    try {
      const res = await model.invoke([...msgs] as any)
      const raw = stripFences(toText(res))
      const json = extractJsonObject(raw) || raw
      const parsed = JSON.parse(json)
      if (parsed?.topics && Array.isArray(parsed.topics)) {
        allExtracted.push({ docName: doc.sourceFile, topics: parsed.topics })
      }
    } catch (e: any) {
      console.warn(`[studyplan] failed to extract from "${doc.sourceFile}":`, e?.message)
    }
  }

  if (allExtracted.length === 0) throw new Error("Failed to extract topics from any document")

  // Phase 2: Merge topics across documents
  let mergedTopics: any[]
  if (allExtracted.length === 1) {
    mergedTopics = allExtracted[0].topics
  } else {
    emit("analyzing", "Merging topics across documents...")
    const extractedSummary = allExtracted
      .map(e => `From "${e.docName}":\n${JSON.stringify(e.topics, null, 2)}`)
      .join("\n\n---\n\n")

    const msgs = [
      { role: "system", content: MERGE_TOPICS_PROMPT + customInstr },
      { role: "user", content: `Extracted topics from ${allExtracted.length} documents:\n\n${extractedSummary}\n\nMerge into a single study plan. Return only the JSON object.` },
    ]

    const res = await model.invoke([...msgs] as any)
    const raw = stripFences(toText(res))
    const json = extractJsonObject(raw) || raw
    const parsed = JSON.parse(json)
    if (!parsed?.topics || !Array.isArray(parsed.topics)) {
      throw new Error("Failed to merge topics")
    }
    mergedTopics = parsed.topics
  }

  const plan: StudyPlan = {
    topics: mergedTopics.map((t: any, ti: number) => ({
      id: randomUUID(),
      title: t.title || `Topic ${ti + 1}`,
      order: ti,
      subtopics: (t.subtopics || []).map((s: any, si: number) => ({
        id: randomUUID(),
        title: s.title || `Subtopic ${si + 1}`,
        order: si,
        content: "",
        status: "empty" as const,
      })),
    })),
    generatedAt: Date.now(),
    sourceCount: primaryDocs.size,
    backgroundSourceIds: backgroundSourceIds?.length ? backgroundSourceIds : undefined,
    prompt: userPrompt?.trim() || undefined,
  }

  await saveStudyPlan(subjectId, plan)
  emit("done")
  return plan
}

export async function generateSubtopicContent(
  subjectId: string,
  topicId: string,
  subtopicId: string,
  llmOverride?: LLM,
  onProgress?: ProgressFn
): Promise<string> {
  const model = llmOverride || llm
  const emit = onProgress || (() => {})
  const plan = await getStudyPlan(subjectId)
  if (!plan) throw new Error("No study plan found")

  const topic = plan.topics.find(t => t.id === topicId)
  if (!topic) throw new Error("Topic not found")
  const subtopic = topic.subtopics.find(s => s.id === subtopicId)
  if (!subtopic) throw new Error("Subtopic not found")

  subtopic.status = "generating"
  await saveStudyPlan(subjectId, plan)

  emit("generating", `Generating: ${subtopic.title}`)

  // Use RAG retrieval targeted at the subtopic title instead of loading all docs
  const collection = `subject:${subjectId}`
  const query = `${topic.title} ${subtopic.title}`
  const retriever = await getRetrieverWithParents(collection, embeddings, { k: 16 })
  let docs = await retriever.invoke(query)

  // If background sources are configured, prioritize them for context
  if (plan.backgroundSourceIds?.length) {
    const bgSet = new Set(plan.backgroundSourceIds)
    const bgDocs = docs.filter(d => d.metadata?.sourceId && bgSet.has(d.metadata.sourceId))
    const otherDocs = docs.filter(d => !d.metadata?.sourceId || !bgSet.has(d.metadata.sourceId))
    // Background sources first (they provide the explanation), then primary sources for specifics
    docs = [...bgDocs, ...otherDocs]
  }

  const context = docs
    .map(d => {
      const file = d.metadata?.sourceFile || "unknown"
      const page = d.metadata?.pageNumber ? `, p.${d.metadata.pageNumber}` : ""
      return `[Source: ${file}${page}]\n${d.pageContent}`
    })
    .join("\n\n---\n\n")
    .slice(0, MAX_CONTEXT_PER_SUBTOPIC)

  const customInstr = plan.prompt?.trim()
    ? `\n\nADDITIONAL INSTRUCTIONS FROM USER:\n${plan.prompt.trim()}`
    : ""

  const msgs = [
    { role: "system", content: SUBTOPIC_CONTENT_PROMPT + customInstr },
    {
      role: "user",
      content: `Main topic: ${topic.title}\nSubtopic: ${subtopic.title}\n\nRelevant source material:\n${context}\n\nWrite a comprehensive explanation of "${subtopic.title}" in the context of "${topic.title}".`,
    },
  ]

  try {
    const res = await model.invoke([...msgs] as any)
    const content = toText(res).trim()
    subtopic.content = content
    subtopic.status = "ready"
    subtopic.generatedAt = Date.now()
    await saveStudyPlan(subjectId, plan)
    return content
  } catch (e: any) {
    subtopic.status = "error"
    await saveStudyPlan(subjectId, plan)
    throw e
  }
}

export async function generateAllContent(
  subjectId: string,
  llmOverride?: LLM,
  onProgress?: ProgressFn
): Promise<StudyPlan> {
  const model = llmOverride || llm
  const emit = onProgress || (() => {})
  const plan = await getStudyPlan(subjectId)
  if (!plan) throw new Error("No study plan found")

  let total = 0
  let done = 0
  for (const t of plan.topics) {
    for (const s of t.subtopics) {
      if (s.status === "empty" || s.status === "error") total++
    }
  }

  if (total === 0) {
    emit("done")
    return plan
  }

  for (const topic of plan.topics) {
    for (const subtopic of topic.subtopics) {
      if (subtopic.status !== "empty" && subtopic.status !== "error") continue
      try {
        emit("generating", `(${done + 1}/${total}) ${subtopic.title}`)
        await generateSubtopicContent(subjectId, topic.id, subtopic.id, model, () => {})
        done++
      } catch (e: any) {
        console.warn(`[studyplan] failed to generate content for "${subtopic.title}":`, e?.message)
        done++
      }
    }
  }

  emit("done")
  return (await getStudyPlan(subjectId))!
}
