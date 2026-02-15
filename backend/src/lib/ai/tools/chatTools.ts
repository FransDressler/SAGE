import { StructuredTool } from "@langchain/core/tools"
import { z } from "zod"
import { getRetrieverWithParents } from "../../../utils/database/db"
import { getLinkedSourceFiles } from "../../../services/subjectgraph"
import { listSources } from "../../../utils/subjects/subjects"
import { searchWeb } from "../../../services/websearch/search"
import { config } from "../../../config/env"
import type { EmbeddingsInterface } from "@langchain/core/embeddings"

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

export function buildTools(ns: string, embeddings: EmbeddingsInterface) {
  const subjectId = ns.replace(/^subject:/, "")
  const tools: StructuredTool[] = [
    new SourceSearchTool(ns, embeddings),
    new ListSourcesTool(subjectId),
  ]
  if (config.tavily_api_key) {
    tools.push(new WebSearchTool())
  }
  return tools
}
