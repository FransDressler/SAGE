import type { WebSearchResult } from "./types"

/**
 * Build a structured markdown document from search results.
 * This format works well with the semantic chunker since each
 * result becomes its own heading-delimited section.
 */
export function buildMarkdown(query: string, results: WebSearchResult[]): string {
  const sections = results.map(r => {
    const domain = extractDomain(r.url)
    return `## ${r.title} (source: ${domain})\n\n${r.content}`
  })

  return `# Web Research: ${query}\n\n${sections.join("\n\n---\n\n")}\n`
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}
