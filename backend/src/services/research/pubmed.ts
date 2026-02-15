import { config } from "../../config/env"
import type { PubmedResult } from "./types"

const ESEARCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
const EFETCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
const USER_AGENT = "PageLM/1.0 (study-tool)"
const MAX_RESPONSE_SIZE = 2 * 1024 * 1024 // 2MB

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

function parseArticle(articleXml: string): PubmedResult | null {
  const title = extractText(articleXml, "article-title").replace(/\s+/g, " ")
  const abstract = extractText(articleXml, "abstract")

  const contribs = extractAll(articleXml, "contrib")
  const authors = contribs
    .map(c => {
      const surname = extractText(c, "surname")
      const given = extractText(c, "given-names")
      return surname ? (given ? `${given} ${surname}` : surname) : ""
    })
    .filter(Boolean)

  const pubDate = extractText(articleXml, "pub-date")
  const year = extractText(pubDate, "year")
  const month = extractText(pubDate, "month")
  const published = month ? `${year}-${month.padStart(2, "0")}` : year

  const pmidMatch = articleXml.match(/article-id[^>]*pub-id-type="pmid"[^>]*>(\d+)</)
  const pmid = pmidMatch ? pmidMatch[1] : ""
  const doiMatch = articleXml.match(/article-id[^>]*pub-id-type="doi"[^>]*>([^<]+)</)
  const doi = doiMatch ? doiMatch[1] : undefined

  if (!title) return null

  return { title, authors, abstract, published, pmid, doi }
}

export async function searchPubmed(
  query: string,
  maxResults?: number
): Promise<PubmedResult[]> {
  const limit = maxResults ?? config.research_max_pubmed_results

  try {
    // Step 1: ESearch
    const searchUrl = `${ESEARCH}?db=pmc&term=${encodeURIComponent(query)}&retmax=${limit}&retmode=json&sort=date`
    const searchRes = await fetch(searchUrl, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": USER_AGENT },
    })
    if (!searchRes.ok) return []

    const searchData = await searchRes.json() as any
    const ids: string[] = searchData?.esearchresult?.idlist || []
    if (ids.length === 0) return []

    // Step 2: EFetch
    const fetchUrl = `${EFETCH}?db=pmc&id=${ids.join(",")}&retmode=xml`
    const fetchRes = await fetch(fetchUrl, {
      signal: AbortSignal.timeout(15000),
      headers: { "User-Agent": USER_AGENT },
    })
    if (!fetchRes.ok) return []

    const xml = await fetchRes.text()
    if (xml.length > MAX_RESPONSE_SIZE) {
      console.warn("[research/pubmed] response too large:", xml.length)
      return []
    }

    const results: PubmedResult[] = []
    const articleRegex = /<article[\s>]([\s\S]*?)<\/article>/g
    let match: RegExpExecArray | null
    while ((match = articleRegex.exec(xml)) !== null) {
      const parsed = parseArticle(match[1])
      if (parsed) results.push(parsed)
    }

    return results
  } catch (e) {
    console.warn("[research/pubmed] search failed:", (e as Error).message || e)
    return []
  }
}
