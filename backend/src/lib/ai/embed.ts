import fs from "fs"
import crypto from "crypto"
import { Document } from "@langchain/core/documents"
import { embeddings } from "../../utils/llm/llm"
import { saveDocuments } from "../../utils/database/db"
import { saveParents } from "../../utils/database/parentStore"
import { semanticChunk, semanticChunkWithChildren } from "./chunker"
import { config } from "../../config/env"

export type EmbedMeta = {
  sourceId?: string
  sourceFile?: string
  mimeType?: string
  subjectId?: string
  pageNumber?: number
  sourceType?: string
}

const HEADING_RE = /^(?:#{1,6}\s+.+|[A-Z][A-Z ]{4,80}[A-Z]$)/

function propagateHeadings(docs: Document[], raw: string): void {
  const lines = raw.split("\n")
  const headings: { offset: number; text: string }[] = []

  let offset = 0
  for (const line of lines) {
    const trimmed = line.trim()
    if (HEADING_RE.test(trimmed) && !trimmed.endsWith(".") && !trimmed.endsWith("!") && !trimmed.endsWith("?")) {
      headings.push({ offset, text: trimmed.replace(/^#+\s*/, "") })
    }
    offset += line.length + 1
  }

  let searchFrom = 0
  for (const doc of docs) {
    const snippet = doc.pageContent.slice(0, 60)
    const chunkStart = raw.indexOf(snippet, searchFrom)
    if (chunkStart === -1) continue

    searchFrom = chunkStart + snippet.length

    let nearest = ""
    for (const h of headings) {
      if (h.offset <= chunkStart) nearest = h.text
      else break
    }
    if (nearest) doc.metadata.heading = nearest
  }
}

const BOILERPLATE_PATTERNS = [
  /copyright\s*©?\s*\d{4}/i,
  /all\s+rights\s+reserved/i,
  /proquest\s+ebook\s+central/i,
  /created\s+from\s+\w+\s+on\s+\d{4}/i,
  /ebookcentral\.proquest\.com/i,
  /reproduction.{0,50}prohibited/i,
  /unauthorized\s+use/i,
]

function estimateContentRatio(text: string): number {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean)
  if (lines.length === 0) return 0

  let boilerplateLines = 0
  for (const line of lines) {
    if (BOILERPLATE_PATTERNS.some(re => re.test(line))) {
      boilerplateLines++
    }
  }

  return (lines.length - boilerplateLines) / lines.length
}

function filterLowQualityChunks(docs: Document[]): Document[] {
  return docs.filter(doc => {
    const text = doc.pageContent.trim()
    if (text.length < 100) return false
    return estimateContentRatio(text) > 0.3
  })
}

type PageInfo = { page: number; text: string }

function assignPageNumbers(docs: Document[], raw: string, pages: PageInfo[]): void {
  const offsets: { page: number; start: number; end: number }[] = []
  let cursor = 0
  for (const p of pages) {
    const idx = raw.indexOf(p.text.slice(0, 60), cursor)
    const start = idx >= 0 ? idx : cursor
    const end = start + p.text.length
    offsets.push({ page: p.page, start, end })
    cursor = end
  }

  let searchFrom = 0
  for (const doc of docs) {
    const snippet = doc.pageContent.slice(0, 60)
    const chunkStart = raw.indexOf(snippet, searchFrom)
    if (chunkStart === -1) continue
    searchFrom = chunkStart + snippet.length
    for (const o of offsets) {
      if (chunkStart >= o.start && chunkStart < o.end) {
        doc.metadata.pageNumber = o.page
        break
      }
    }
  }
}

function generateParentId(namespace: string, sourceId: string, parentIndex: number): string {
  return crypto
    .createHash("sha256")
    .update(`${namespace}:${sourceId}:${parentIndex}`)
    .digest("hex")
    .slice(0, 32)
}

function applyMeta(docs: Document[], meta: EmbedMeta): void {
  const now = Date.now()
  for (const doc of docs) {
    doc.metadata = {
      ...doc.metadata,
      ...(meta.sourceId && { sourceId: meta.sourceId }),
      ...(meta.sourceFile && { sourceFile: meta.sourceFile }),
      ...(meta.mimeType && { mimeType: meta.mimeType }),
      ...(meta.subjectId && { subjectId: meta.subjectId }),
      ...(meta.sourceType && { sourceType: meta.sourceType }),
      ingestedAt: now,
    }
  }
}

function augmentContentWithMeta(docs: Document[]): void {
  for (const doc of docs) {
    const file = doc.metadata.sourceFile
    if (file) {
      const cleanName = file.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ")
      doc.pageContent = `[Document: ${cleanName}]\n${doc.pageContent}`
    }
  }
}

export async function embedTextFromFile(
  filePath: string,
  namespace: string,
  meta: EmbedMeta = {},
  pages?: PageInfo[] | null
): Promise<string> {
  const raw = fs.readFileSync(filePath, "utf-8")

  if (!config.parent_retrieval) {
    // Legacy path: no parent/child splitting
    let docs = await semanticChunk(raw, embeddings)
    docs = filterLowQualityChunks(docs)
    if (docs.length === 0) throw new Error("No meaningful content chunks after quality filtering.")
    applyMeta(docs, meta)
    if (pages?.length) assignPageNumbers(docs, raw, pages)
    propagateHeadings(docs, raw)
    augmentContentWithMeta(docs)
    await saveDocuments(namespace, docs, embeddings)
    return "Uploaded successfully."
  }

  // Two-tier chunking: parents for context, children for retrieval
  const { parents, children } = await semanticChunkWithChildren(raw, embeddings)

  // Filter at parent level, then remove orphaned children
  const filteredParents = filterLowQualityChunks(parents)
  if (filteredParents.length === 0) throw new Error("No meaningful content chunks after quality filtering.")

  const validParentIndices = new Set(filteredParents.map(p => p.metadata.chunkIndex as number))
  const filteredChildren = children.filter(c => validParentIndices.has(c.metadata.parentIndex as number))

  // Apply source metadata to parents
  applyMeta(filteredParents, meta)

  // Assign page numbers and headings on parents
  if (pages?.length) assignPageNumbers(filteredParents, raw, pages)
  propagateHeadings(filteredParents, raw)

  // Generate parentIds and propagate parent metadata to children
  const sourceId = meta.sourceId || "unknown"

  const parentEntries: { parentId: string; pageContent: string; metadata: Record<string, any> }[] = []
  const parentIdByIndex = new Map<number, string>()

  for (const parent of filteredParents) {
    const parentIndex = parent.metadata.chunkIndex as number
    const parentId = generateParentId(namespace, sourceId, parentIndex)
    parentIdByIndex.set(parentIndex, parentId)
    parentEntries.push({
      parentId,
      pageContent: parent.pageContent,
      metadata: { ...parent.metadata },
    })
  }

  // Propagate parent metadata (heading, pageNumber, source info, parentId) to children
  const now = Date.now()
  for (const child of filteredChildren) {
    const parentIndex = child.metadata.parentIndex as number
    const parentId = parentIdByIndex.get(parentIndex)
    const parent = filteredParents.find(p => p.metadata.chunkIndex === parentIndex)

    child.metadata.parentId = parentId
    child.metadata.ingestedAt = now
    if (meta.sourceId) child.metadata.sourceId = meta.sourceId
    if (meta.sourceFile) child.metadata.sourceFile = meta.sourceFile
    if (meta.mimeType) child.metadata.mimeType = meta.mimeType
    if (meta.subjectId) child.metadata.subjectId = meta.subjectId
    if (meta.sourceType) child.metadata.sourceType = meta.sourceType

    if (parent?.metadata.heading) child.metadata.heading = parent.metadata.heading
    if (parent?.metadata.pageNumber != null) child.metadata.pageNumber = parent.metadata.pageNumber
  }

  // Augment children with document name for BM25 discoverability
  augmentContentWithMeta(filteredChildren)

  // Store parents and embed children
  await saveParents(namespace, parentEntries)
  await saveDocuments(namespace, filteredChildren, embeddings)

  return "Uploaded successfully."
}
