import { Document } from "@langchain/core/documents"
import { EmbeddingsInterface } from "@langchain/core/embeddings"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { getLocale } from "../prompts/locale"
import { config } from "../../config/env"

const MIN_CHUNK = 200
const MAX_CHUNK = 2048
const BUFFER_SIZE = 3
const BREAKPOINT_PERCENTILE = 25
const EMBED_BATCH_SIZE = 512

const STRUCTURAL_BOUNDARY = /^(?:#{1,6}\s|---+\s*$|```)/

function splitSentences(text: string): string[] {
  const segmenter = new Intl.Segmenter(getLocale().code, { granularity: "sentence" })
  return [...segmenter.segment(text)]
    .map(s => s.segment.trim())
    .filter(s => s.length > 0)
}

function slidingWindow(sentences: string[], size: number): string[][] {
  const groups: string[][] = []
  for (let i = 0; i < sentences.length; i++) {
    const start = Math.max(0, i - Math.floor(size / 2))
    const end = Math.min(sentences.length, start + size)
    groups.push(sentences.slice(start, end))
  }
  return groups
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}

function percentile(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const idx = Math.floor((p / 100) * sorted.length)
  return sorted[Math.min(idx, sorted.length - 1)]
}

async function fallbackChunk(text: string): Promise<Document[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1024,
    chunkOverlap: 128,
  })
  return splitter.createDocuments([text])
}

async function batchEmbed(model: EmbeddingsInterface, texts: string[]): Promise<number[][]> {
  const vectors: number[][] = []
  for (let i = 0; i < texts.length; i += EMBED_BATCH_SIZE) {
    const batch = texts.slice(i, i + EMBED_BATCH_SIZE)
    const batchVectors = await model.embedDocuments(batch)
    vectors.push(...batchVectors)
  }
  return vectors
}

function structuralSegment(text: string): string[] {
  const lines = text.split("\n")
  const segments: string[] = []
  let buf: string[] = []

  for (const line of lines) {
    if (STRUCTURAL_BOUNDARY.test(line) && buf.length > 0) {
      const seg = buf.join("\n").trim()
      if (seg) segments.push(seg)
      buf = []
    }
    buf.push(line)
  }
  const last = buf.join("\n").trim()
  if (last) segments.push(last)
  return segments
}

async function chunkSegment(
  text: string,
  embeddingsModel: EmbeddingsInterface,
  minChunk: number,
  maxChunk: number,
  bufferSize: number,
  bpPercentile: number
): Promise<string[]> {
  const sentences = splitSentences(text)
  if (sentences.length < 5) {
    const docs = await fallbackChunk(text)
    return docs.map(d => d.pageContent)
  }

  const groups = slidingWindow(sentences, bufferSize)
  const groupTexts = groups.map(g => g.join(" "))
  const vectors = await batchEmbed(embeddingsModel, groupTexts)

  const similarities: number[] = []
  for (let i = 1; i < vectors.length; i++) {
    similarities.push(cosineSimilarity(vectors[i - 1], vectors[i]))
  }

  if (similarities.length === 0) {
    const docs = await fallbackChunk(text)
    return docs.map(d => d.pageContent)
  }

  const threshold = percentile(similarities, bpPercentile)
  const breakpoints = new Set<number>()
  for (let i = 0; i < similarities.length; i++) {
    if (similarities[i] < threshold) breakpoints.add(i + 1)
  }

  const chunks: string[] = []
  let current: string[] = []
  for (let i = 0; i < sentences.length; i++) {
    current.push(sentences[i])
    if (breakpoints.has(i + 1) || i === sentences.length - 1) {
      chunks.push(current.join(" ").trim())
      current = []
    }
  }

  return enforceMinMax(chunks, minChunk, maxChunk)
}

export async function semanticChunk(
  text: string,
  embeddingsModel: EmbeddingsInterface,
  opts: { minChunk?: number; maxChunk?: number; bufferSize?: number; percentile?: number } = {}
): Promise<Document[]> {
  const minChunk = opts.minChunk ?? MIN_CHUNK
  const maxChunk = opts.maxChunk ?? MAX_CHUNK
  const bufferSize = opts.bufferSize ?? BUFFER_SIZE
  const bpPercentile = opts.percentile ?? BREAKPOINT_PERCENTILE

  const segments = structuralSegment(text)
  const allChunks: string[] = []

  for (const seg of segments) {
    const chunks = await chunkSegment(seg, embeddingsModel, minChunk, maxChunk, bufferSize, bpPercentile)
    allChunks.push(...chunks)
  }

  return allChunks.map((content, i) => new Document({
    pageContent: content,
    metadata: { chunkIndex: i, totalChunks: allChunks.length },
  }))
}

export type ChunkResult = {
  parents: Document[]
  children: Document[]
}

export async function semanticChunkWithChildren(
  text: string,
  embeddingsModel: EmbeddingsInterface,
  opts: {
    minChunk?: number; maxChunk?: number; bufferSize?: number; percentile?: number
    childChunkSize?: number; childChunkOverlap?: number
  } = {}
): Promise<ChunkResult> {
  const childSize = opts.childChunkSize ?? config.child_chunk_size
  const childOverlap = opts.childChunkOverlap ?? config.child_chunk_overlap

  const parents = await semanticChunk(text, embeddingsModel, opts)

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: childSize,
    chunkOverlap: childOverlap,
  })

  const children: Document[] = []
  let childIdx = 0

  for (const parent of parents) {
    const parentIndex = parent.metadata.chunkIndex as number

    // If parent is already small enough, it becomes its own child
    if (parent.pageContent.length <= childSize) {
      children.push(new Document({
        pageContent: parent.pageContent,
        metadata: {
          chunkIndex: childIdx++,
          parentIndex,
          childIndex: 0,
          totalChildren: 1,
        },
      }))
      continue
    }

    const subDocs = await splitter.createDocuments([parent.pageContent])
    const totalChildren = subDocs.length

    for (let ci = 0; ci < subDocs.length; ci++) {
      children.push(new Document({
        pageContent: subDocs[ci].pageContent,
        metadata: {
          chunkIndex: childIdx++,
          parentIndex,
          childIndex: ci,
          totalChildren,
        },
      }))
    }
  }

  return { parents, children }
}

async function enforceMinMax(chunks: string[], min: number, max: number): Promise<string[]> {
  const merged: string[] = []
  let buffer = ""

  for (const chunk of chunks) {
    if (buffer.length > 0) {
      buffer += " " + chunk
    } else {
      buffer = chunk
    }

    if (buffer.length >= min) {
      merged.push(buffer)
      buffer = ""
    }
  }

  if (buffer.length > 0) {
    if (merged.length > 0 && buffer.length < min) {
      merged[merged.length - 1] += " " + buffer
    } else {
      merged.push(buffer)
    }
  }

  const result: string[] = []
  for (const chunk of merged) {
    if (chunk.length <= max) {
      result.push(chunk)
    } else {
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: max,
        chunkOverlap: 64,
      })
      const subDocs = await splitter.createDocuments([chunk])
      result.push(...subDocs.map(d => d.pageContent))
    }
  }

  return result
}
