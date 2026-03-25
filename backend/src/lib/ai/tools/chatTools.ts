import { randomUUID } from "crypto"
import { StructuredTool } from "@langchain/core/tools"
import { z } from "zod"
import { getRetrieverWithParents, getAllDocuments } from "../../../utils/database/db"
import { getLinkedSourceFiles } from "../../../services/subjectgraph"
import { listSources } from "../../../utils/subjects/subjects"
import { searchWeb } from "../../../services/websearch/search"
import { getStudyPlan } from "../../../services/studyplan"
import { addCard } from "../../../services/ankideck"
import { config } from "../../../config/env"
import type { EmbeddingsInterface } from "@langchain/core/embeddings"
import type { AnkiCard } from "../../../services/ankideck/types"

function extractImageUrls(text: string): string[] {
  const re = /!\[([^\]]*)\]\(([^)]+)\)/g
  const urls: string[] = []
  let m
  while ((m = re.exec(text)) !== null) urls.push(m[2])
  return urls
}

const sourceSearchSchema = z.object({
  query: z.string().describe("The search query"),
  k: z.number().optional().default(10).describe("Number of results (max 10)"),
  sourceFilter: z.string().max(200).optional().describe(
    "Optional: only return results from sources whose filename contains this string, e.g. 'Blatt_3' or 'Vorlesung'"
  ),
})

class SourceSearchTool extends StructuredTool {
  name = "source_search"
  description = "Search through the user's uploaded study materials, documents, and notes. ALWAYS try this tool first for any knowledge question. Returns relevant passages with source attribution."
  schema = sourceSearchSchema as any
  private ns: string
  private embeddings: EmbeddingsInterface

  constructor(ns: string, embeddings: EmbeddingsInterface) {
    super()
    this.ns = ns
    this.embeddings = embeddings
  }

  async _call({ query, k, sourceFilter }: z.infer<typeof sourceSearchSchema>) {
    const safeQuery = typeof query === "string" ? query.trim().slice(0, 500) : ""
    if (!safeQuery) return JSON.stringify([])
    const safeK = Math.min(Math.max(k || 10, 1), 10)
    // Fetch extra docs upfront so graph expansion can draw from the wider pool
    const retriever = await getRetrieverWithParents(this.ns, this.embeddings, { k: safeK * 2 })
    let docs = await retriever.invoke(safeQuery)

    // Explicit sourceFilter: restrict to sources whose filename contains the filter
    if (sourceFilter) {
      const filterLower = sourceFilter.toLowerCase().replace(/[_\-]/g, " ")
      const filtered = docs.filter(d => {
        const name = (d.metadata?.sourceFile || "").toLowerCase().replace(/[_\-]/g, " ")
        return name.includes(filterLower)
      })
      if (filtered.length > 0) docs = filtered
    }

    // Automatic filename pre-filter: boost chunks from filename-matched sources
    const subjectId = this.ns.replace(/^subject:/, "")
    try {
      const sources = await listSources(subjectId)
      const STOP_WORDS = new Set(["about", "which", "these", "given", "solve", "their", "where", "there", "would", "could", "should", "welche", "diese", "meine", "einen", "einer", "brauche", "lösen"])
      const queryTerms = safeQuery.toLowerCase().split(/\s+/).filter(t => t.length > 1 && !STOP_WORDS.has(t))
      const matchingSourceIds = new Set<string>()
      for (const s of sources) {
        const normalized = s.originalName.toLowerCase().replace(/[_\-\.]/g, " ")
        const matches = queryTerms.filter(t => normalized.includes(t))
        if (matches.length >= 2 || (matches.length === 1 && matches[0].length > 4)) {
          matchingSourceIds.add(s.id)
        }
      }
      if (matchingSourceIds.size > 0) {
        const boosted = docs.filter(d => matchingSourceIds.has(d.metadata?.sourceId))
        const rest = docs.filter(d => !matchingSourceIds.has(d.metadata?.sourceId))
        docs = [...boosted, ...rest]
      }
    } catch (err: any) {
      console.warn("[source_search] filename pre-filter failed:", err?.message || err)
    }

    const toResult = (d: any) => {
      const images = extractImageUrls(d.pageContent)
      return {
        text: d.pageContent,
        source: d.metadata?.sourceFile,
        page: d.metadata?.pageNumber,
        sourceType: d.metadata?.sourceType,
        sourceId: d.metadata?.sourceId,
        heading: d.metadata?.heading,
        ...(images.length > 0 && { images }),
      }
    }

    const results = docs.slice(0, safeK).map(toResult)

    // Graph-enhanced retrieval: expand via knowledge graph links
    try {
      const initialFiles = [...new Set(
        results.map(r => r.source).filter((s): s is string => typeof s === "string" && s.length > 0)
      )]
      if (initialFiles.length > 0) {
        const linkedFiles = await getLinkedSourceFiles(subjectId, initialFiles)
        if (linkedFiles.length > 0) {
          const linkedSet = new Set(linkedFiles)
          const existingKeys = new Set(results.map(r => `${r.source}::${r.page ?? "_"}`))
          const maxExpand = Math.min(3, safeK)
          let added = 0
          // Scan the extra docs (beyond safeK) for graph-linked sources
          for (const d of docs.slice(safeK)) {
            if (added >= maxExpand) break
            const file = d.metadata?.sourceFile
            if (!file || !linkedSet.has(file)) continue
            const key = `${file}::${d.metadata?.pageNumber ?? "_"}`
            if (existingKeys.has(key)) continue
            existingKeys.add(key)
            results.push(toResult(d))
            added++
          }
        }
      }
    } catch (err: any) {
      console.warn("[source_search] graph expansion failed:", err?.message || err)
    }

    return JSON.stringify(results)
  }
}

class ListSourcesTool extends StructuredTool {
  name = "list_sources"
  description = "List all uploaded source documents for this subject. Returns filename, type, and id for each source. Use this when the user references a specific document by name (e.g. 'Blatt 3', 'Vorlesung 5') to find the correct source before searching, or when you need to know what materials are available."
  schema = z.object({}) as any
  private subjectId: string

  constructor(subjectId: string) {
    super()
    this.subjectId = subjectId
  }

  async _call() {
    const sources = await listSources(this.subjectId)
    return JSON.stringify(sources.map(s => ({
      id: s.id,
      name: s.originalName,
      type: s.sourceType,
    })))
  }
}

const webSearchSchema = z.object({
  query: z.string().describe("The web search query"),
})

class WebSearchTool extends StructuredTool {
  name = "web_search"
  description = "Search the internet for current events, general knowledge, or topics NOT found in the user's study materials. Only use this when source_search returns insufficient results or the question is clearly about external/current information."
  schema = webSearchSchema as any

  async _call({ query }: z.infer<typeof webSearchSchema>) {
    const safeQuery = typeof query === "string" ? query.trim().slice(0, 500) : ""
    if (!safeQuery) return JSON.stringify([])
    const results = await searchWeb(safeQuery, "quick")
    return JSON.stringify(results.slice(0, 5).map(r => ({
      title: r.title,
      url: r.url,
      content: r.content,
    })))
  }
}

const FULL_DOC_BUDGET = Number(process.env.FULL_DOC_BUDGET) || 80000

const getFullDocumentSchema = z.object({
  sourceId: z.string().describe("The source ID (from list_sources) of the document to retrieve in full"),
})

class GetFullDocumentTool extends StructuredTool {
  name = "get_full_document"
  description = "Retrieve the FULL text of a single document by its sourceId. Use this when the user's question is about one specific document (e.g. summarize, explain, translate a whole document) and RAG chunks would lose important context. Call list_sources first to get the sourceId. WARNING: Only use for single-document questions — for cross-document or topic questions, use source_search instead."
  schema = getFullDocumentSchema as any
  private ns: string
  private embeddings: EmbeddingsInterface

  constructor(ns: string, embeddings: EmbeddingsInterface) {
    super()
    this.ns = ns
    this.embeddings = embeddings
  }

  async _call({ sourceId }: z.infer<typeof getFullDocumentSchema>) {
    const safeId = typeof sourceId === "string" ? sourceId.trim() : ""
    if (!safeId) return JSON.stringify({ error: "sourceId is required" })

    const docs = await getAllDocuments(this.ns, this.embeddings, { sourceIds: [safeId] })
    if (docs.length === 0) return JSON.stringify({ error: "No content found for this sourceId" })

    docs.sort((a, b) => {
      const ai = a.metadata?.chunkIndex ?? a.metadata?.pageNumber ?? 0
      const bi = b.metadata?.chunkIndex ?? b.metadata?.pageNumber ?? 0
      return ai - bi
    })

    const sourceFile = docs[0]?.metadata?.sourceFile || "unknown"
    const sourceType = docs[0]?.metadata?.sourceType || "material"
    const fullText = docs.map(d => d.pageContent).join("\n\n")

    const truncated = fullText.length > FULL_DOC_BUDGET
    const text = truncated ? fullText.slice(0, FULL_DOC_BUDGET) + "\n\n[...truncated]" : fullText

    return JSON.stringify({
      sourceFile,
      sourceId: safeId,
      sourceType,
      totalChunks: docs.length,
      totalChars: fullText.length,
      truncated,
      text,
    })
  }
}

class ListStudyTopicsTool extends StructuredTool {
  name = "list_study_topics"
  description = "List all topics and subtopics from the study plan. Use this BEFORE creating Anki cards to know which topics exist, so you can assign cards to the correct topic/subtopic."
  schema = z.object({}) as any
  private subjectId: string

  constructor(subjectId: string) {
    super()
    this.subjectId = subjectId
  }

  async _call() {
    const plan = await getStudyPlan(this.subjectId)
    if (!plan?.topics?.length) return JSON.stringify({ error: "No study plan found" })
    return JSON.stringify(plan.topics.map(t => ({
      id: t.id,
      name: t.title,
      subtopics: (t.subtopics || []).map(s => ({ id: s.id, name: s.title })),
    })))
  }
}

const createAnkiCardSchema = z.object({
  front: z.string().describe("The question/prompt side of the flashcard"),
  back: z.string().describe("The answer side of the flashcard"),
  tags: z.array(z.string()).optional().describe("Tags for the card"),
  topicName: z.string().describe("The name of the study plan topic this card belongs to (must match an existing topic from list_study_topics)"),
  subtopicName: z.string().optional().describe("The name of the subtopic within the topic (must match an existing subtopic from list_study_topics)"),
})

class CreateAnkiCardTool extends StructuredTool {
  name = "create_anki_card"
  description = `Create an Anki flashcard from the current conversation. Use when the user asks to save something as a flashcard, create an Anki card, or says they want to remember something. You MUST call list_study_topics first to get available topics, then assign the card to the most relevant topic/subtopic.`
  schema = createAnkiCardSchema as any
  private subjectId: string

  constructor(subjectId: string) {
    super()
    this.subjectId = subjectId
  }

  async _call({ front, back, tags, topicName, subtopicName }: z.infer<typeof createAnkiCardSchema>) {
    const plan = await getStudyPlan(this.subjectId)
    let topicId: string | undefined
    let subtopicId: string | undefined

    if (plan?.topics) {
      // Exact match
      let topic = plan.topics.find(t => t.title.toLowerCase() === topicName.toLowerCase())
      // Fuzzy fallback
      if (!topic) {
        topic = plan.topics.find(t =>
          t.title.toLowerCase().includes(topicName.toLowerCase()) ||
          topicName.toLowerCase().includes(t.title.toLowerCase())
        )
      }
      if (topic) {
        topicId = topic.id
        if (subtopicName) {
          let sub = topic.subtopics.find(s => s.title.toLowerCase() === subtopicName.toLowerCase())
          if (!sub) {
            sub = topic.subtopics.find(s =>
              s.title.toLowerCase().includes(subtopicName.toLowerCase()) ||
              subtopicName.toLowerCase().includes(s.title.toLowerCase())
            )
          }
          if (sub) subtopicId = sub.id
        }
      }
    }

    const card: AnkiCard = {
      id: randomUUID(),
      front,
      back,
      tags: [...(tags || []), "chat-created"],
      topicId,
      subtopicId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    await addCard(this.subjectId, card)
    return JSON.stringify({
      success: true,
      card: { front, back, tags: card.tags, topic: topicName, subtopic: subtopicName || null },
    })
  }
}

export function buildTools(ns: string, embeddings: EmbeddingsInterface) {
  const subjectId = ns.replace(/^subject:/, "")
  const tools: StructuredTool[] = [
    new SourceSearchTool(ns, embeddings),
    new ListSourcesTool(subjectId),
    new GetFullDocumentTool(ns, embeddings),
  ]
  if (config.tavily_api_key) {
    tools.push(new WebSearchTool())
  }
  tools.push(new ListStudyTopicsTool(subjectId))
  tools.push(new CreateAnkiCardTool(subjectId))
  return tools
}
