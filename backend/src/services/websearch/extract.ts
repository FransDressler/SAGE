import { config } from "../../config/env"
import type { WebSearchResult } from "./types"

const MIN_CONTENT_LENGTH = 200

/**
 * Clean and filter search results for embedding quality.
 * Removes short/empty content, strips HTML remnants, caps total chars.
 */
export function cleanResults(results: WebSearchResult[]): WebSearchResult[] {
  const maxChars = config.websearch_max_content_chars
  let totalChars = 0

  return results
    .map(r => ({
      ...r,
      content: stripHtml(r.content).trim(),
    }))
    .filter(r => r.content.length >= MIN_CONTENT_LENGTH)
    .filter(r => {
      if (totalChars >= maxChars) return false
      totalChars += r.content.length
      return true
    })
}

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s{2,}/g, " ")
}
