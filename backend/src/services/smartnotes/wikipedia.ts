import { getLocale } from "../../lib/prompts/locale"

export type WikiSummary = { title: string; extract: string; thumbnail?: string }

const VALID_LANG_RE = /^[a-z]{2,3}$/

function sanitizeLang(lang?: string): string {
  const code = lang || getLocale().code.split("-")[0] || "en"
  return VALID_LANG_RE.test(code) ? code : "en"
}

/** Fetch a Wikipedia article summary by title. Returns null if not found. */
export async function fetchWikipediaSummary(topic: string, lang?: string): Promise<WikiSummary | null> {
  const langCode = sanitizeLang(lang)
  const encoded = encodeURIComponent(topic.replace(/\s+/g, "_"))
  const url = `https://${langCode}.wikipedia.org/api/rest_v1/page/summary/${encoded}`
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "PageLM/1.0 (study-tool)" },
    })
    if (!res.ok) {
      // Try English fallback if locale fails
      if (langCode !== "en") return fetchWikipediaSummary(topic, "en")
      return null
    }
    const data = await res.json() as any
    if (data.type === "disambiguation" || !data.extract) return null
    return {
      title: data.title || topic,
      extract: data.extract || "",
      thumbnail: data.thumbnail?.source,
    }
  } catch {
    return null
  }
}

/** Search Wikipedia for article titles matching a query */
export async function searchWikipedia(query: string, lang?: string): Promise<string[]> {
  const langCode = sanitizeLang(lang)
  const url = `https://${langCode}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=3&format=json&origin=*`
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "PageLM/1.0 (study-tool)" },
    })
    if (!res.ok) return []
    const data = await res.json() as any[]
    return Array.isArray(data?.[1]) ? data[1] : []
  } catch {
    return []
  }
}

/** Fetch Wikipedia context for a list of topics. Returns a combined string. */
export async function fetchWikipediaForTopics(topics: string[]): Promise<Map<string, string>> {
  const results = new Map<string, string>()
  const unique = [...new Set(topics.map(t => t.trim()).filter(Boolean))]

  const fetches = unique.map(async (topic) => {
    // First try direct fetch, then search
    let summary = await fetchWikipediaSummary(topic)
    if (!summary) {
      const titles = await searchWikipedia(topic)
      if (titles.length > 0) {
        summary = await fetchWikipediaSummary(titles[0])
      }
    }
    if (summary) {
      results.set(topic, `[Wikipedia: ${summary.title}]\n${summary.extract}`)
    }
  })

  await Promise.allSettled(fetches)
  return results
}
