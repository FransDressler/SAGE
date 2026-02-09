import { StructuredTool } from "@langchain/core/tools"
import { z } from "zod"
import { getRetrieverWithParents } from "../../../utils/database/db"
import { getLinkedSourceFiles } from "../../../services/subjectgraph"
import { searchWeb } from "../../../services/websearch/search"
import { config } from "../../../config/env"
import type { EmbeddingsInterface } from "@langchain/core/embeddings"

const sourceSearchSchema = z.object({
  query: z.string().describe("The search query"),
  k: z.number().optional().default(10).describe("Number of results (max 10)"),
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

  async _call({ query, k }: z.infer<typeof sourceSearchSchema>) {
    const safeQuery = typeof query === "string" ? query.trim().slice(0, 500) : ""
    if (!safeQuery) return JSON.stringify([])
    const safeK = Math.min(Math.max(k || 10, 1), 10)
    // Fetch extra docs upfront so graph expansion can draw from the wider pool
    const retriever = await getRetrieverWithParents(this.ns, this.embeddings, { k: safeK * 2 })
    const docs = await retriever.invoke(safeQuery)

    const toResult = (d: any) => ({
      text: d.pageContent,
      source: d.metadata?.sourceFile,
      page: d.metadata?.pageNumber,
      sourceType: d.metadata?.sourceType,
      sourceId: d.metadata?.sourceId,
      heading: d.metadata?.heading,
    })

    const results = docs.slice(0, safeK).map(toResult)

    // Graph-enhanced retrieval: expand via knowledge graph links
    try {
      const subjectId = this.ns.replace(/^subject:/, "")
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
  const tools: StructuredTool[] = [new SourceSearchTool(ns, embeddings)]
  if (config.tavily_api_key) {
    tools.push(new WebSearchTool())
  }
  return tools
}
