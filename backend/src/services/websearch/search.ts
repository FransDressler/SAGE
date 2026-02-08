import { config } from "../../config/env"
import type { WebSearchResult, SearchMode } from "./types"

export async function searchWeb(query: string, mode: SearchMode): Promise<WebSearchResult[]> {
  if (!config.tavily_api_key) {
    throw new Error("TAVILY_API_KEY is not configured. Set it in your .env file.")
  }

  const maxResults = mode === "deep"
    ? config.websearch_max_results_deep
    : config.websearch_max_results_quick
  const searchDepth = mode === "deep" ? "advanced" : "basic"

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: config.tavily_api_key,
      query,
      search_depth: searchDepth,
      max_results: maxResults,
      include_answer: false,
      include_raw_content: false,
    }),
    signal: AbortSignal.timeout(config.websearch_timeout),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Tavily search failed (${res.status}): ${text || res.statusText}`)
  }

  const data = await res.json() as {
    results: Array<{ title: string; url: string; content: string; score?: number }>
  }

  return (data.results || []).map(r => ({
    title: r.title || "",
    url: r.url || "",
    content: r.content || "",
    score: r.score,
  }))
}
