import fs from "fs"
import path from "path"
import { searchWeb } from "./search"
import { cleanResults } from "./extract"
import { buildMarkdown } from "./structure"
import { embedTextFromFile } from "../../lib/ai/embed"
import { addSource, getSourcesDir } from "../../utils/subjects/subjects"
import type { SearchMode, WebSearchProgress } from "./types"

export type { SearchMode, WebSearchProgress, WebSearchResult } from "./types"

/**
 * Full web search pipeline: search → clean → structure → write → embed.
 * Emits progress events via the `onProgress` callback.
 */
export async function runWebSearch(
  subjectId: string,
  query: string,
  mode: SearchMode,
  onProgress: (evt: WebSearchProgress) => void
): Promise<string> {
  onProgress({ type: "phase", value: "Searching the web..." })

  const raw = await searchWeb(query, mode)
  if (raw.length === 0) {
    throw new Error("No search results found. Try a different query.")
  }

  for (const r of raw) {
    onProgress({ type: "result", result: r })
  }

  onProgress({ type: "phase", value: "Extracting content..." })
  const cleaned = cleanResults(raw)
  if (cleaned.length === 0) {
    throw new Error("Search results had insufficient content after filtering.")
  }

  onProgress({ type: "phase", value: "Structuring document..." })
  const markdown = buildMarkdown(query, cleaned)

  // Write markdown file to sources directory
  const sourcesDir = getSourcesDir(subjectId)
  if (!fs.existsSync(sourcesDir)) fs.mkdirSync(sourcesDir, { recursive: true })

  const slug = query.replace(/[^a-zA-Z0-9]+/g, "_").slice(0, 50).replace(/_+$/, "")
  const filename = `${Date.now()}-websearch-${slug}.md`
  const filePath = path.join(sourcesDir, filename)
  fs.writeFileSync(filePath, markdown)

  // Also write .txt for embedding pipeline consistency
  const txtPath = filePath + ".txt"
  fs.writeFileSync(txtPath, markdown)

  // Register source record
  const originalName = `Web: ${query.slice(0, 80)}`
  const source = await addSource(
    subjectId,
    { filename, originalName, mimeType: "text/markdown", path: filePath },
    "websearch",
    { searchQuery: query, searchMode: mode }
  )

  onProgress({ type: "phase", value: "Embedding for retrieval..." })

  const ns = `subject:${subjectId}`
  await embedTextFromFile(txtPath, ns, {
    sourceId: source.id,
    sourceFile: originalName,
    mimeType: "text/markdown",
    subjectId,
    sourceType: "websearch",
  })

  onProgress({ type: "done", sourceId: source.id })
  return source.id
}
