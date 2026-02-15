import { config } from "../../config/env"
import type { ArxivResult } from "./types"

const ARXIV_API = "https://export.arxiv.org/api/query"
const USER_AGENT = "PageLM/1.0 (study-tool)"
const MAX_RESPONSE_SIZE = 1024 * 1024 // 1MB

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function extractText(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)
  const m = xml.match(re)
  return m ? decodeEntities(stripTags(m[1])).trim() : ""
}

function extractAll(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "g")
  const results: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(xml)) !== null) results.push(decodeEntities(stripTags(m[1])).trim())
  return results
}

function parseEntry(entryXml: string): ArxivResult | null {
  const title = extractText(entryXml, "title").replace(/\s+/g, " ")
  const abstract = extractText(entryXml, "summary").replace(/\s+/g, " ")
  const published = extractText(entryXml, "published")

  const authorNames = extractAll(entryXml, "name")

  const idUrl = extractText(entryXml, "id")
  const arxivId = idUrl.replace(/.*\/abs\//, "").replace(/v\d+$/, "")

  const pdfMatch = entryXml.match(/href="([^"]*)"[^>]*title="pdf"/i)
  const pdfUrl = pdfMatch ? pdfMatch[1] : `https://arxiv.org/pdf/${arxivId}`

  if (!title || !abstract) return null

  return { title, authors: authorNames, abstract, published, arxivId, pdfUrl }
}

export async function searchArxiv(
  query: string,
  maxResults?: number
): Promise<ArxivResult[]> {
  const limit = maxResults ?? config.research_max_arxiv_results
  const url = `${ARXIV_API}?search_query=all:${encodeURIComponent(query)}&max_results=${limit}&sortBy=submittedDate&sortOrder=descending`

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": USER_AGENT },
    })
    if (!res.ok) return []

    const xml = await res.text()
    if (xml.length > MAX_RESPONSE_SIZE) {
      console.warn("[research/arxiv] response too large:", xml.length)
      return []
    }

    const entries: ArxivResult[] = []
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
    let match: RegExpExecArray | null
    while ((match = entryRegex.exec(xml)) !== null) {
      const parsed = parseEntry(match[1])
      if (parsed) entries.push(parsed)
    }

    return entries
  } catch (e) {
    console.warn("[research/arxiv] search failed:", (e as Error).message || e)
    return []
  }
}
