import fs from "fs"
import path from "path"
import { Chroma } from "@langchain/community/vectorstores/chroma"
import { BM25Retriever } from "@langchain/community/retrievers/bm25"
import { Document } from "@langchain/core/documents"
import { EmbeddingsInterface } from "@langchain/core/embeddings"
import { EnsembleRetriever } from "langchain/retrievers/ensemble"
import { config } from "../../config/env"
import { getParents, clearParentStore, deleteParentsBySource } from "./parentStore"

const memoryStores: Record<string, any> = {}
const retrieverCache: Record<string, any> = {}

const collectionLocks: Record<string, Promise<void>> = {}

async function withLock<T>(collection: string, fn: () => Promise<T>): Promise<T> {
  const prev = collectionLocks[collection] ?? Promise.resolve()
  let release: () => void
  collectionLocks[collection] = new Promise<void>(r => { release = r })
  await prev
  try {
    return await fn()
  } finally {
    release!()
  }
}

function jsonPath(collection: string): string {
  return path.join(process.cwd(), "storage", "json", `${collection}.json`)
}

function loadJsonDocs(collection: string): any[] {
  const file = jsonPath(collection)
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf-8")) : []
}

function toDocuments(raw: any[]): Document[] {
  return raw.map(d => new Document({
    pageContent: typeof d.pageContent === "string" ? d.pageContent : String(d.pageContent ?? ""),
    metadata: d.metadata || {},
  }))
}

function invalidateCache(collection: string) {
  delete memoryStores[collection]
  delete retrieverCache[collection]
}

export async function saveDocuments(
  collection: string,
  docs: Document[],
  embeddings: EmbeddingsInterface
) {
  if (config.db_mode === "json") {
    await withLock(collection, async () => {
      const file = jsonPath(collection)
      const dir = path.dirname(file)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

      const existing = loadJsonDocs(collection)
      const newEntries = docs.map(d => ({
        pageContent: typeof d.pageContent === "string" ? d.pageContent : String(d.pageContent ?? ""),
        metadata: d.metadata || {}
      }))

      fs.writeFileSync(file, JSON.stringify([...existing, ...newEntries], null, 2))
      invalidateCache(collection)
    })
  } else {
    const store = new Chroma(embeddings, {
      collectionName: collection,
      collectionMetadata: { "hnsw:space": "cosine" },
      url: "http://localhost:8000",
    })
    await store.addDocuments(docs)
    invalidateCache(collection)
  }
}

export async function getRetriever(
  collection: string,
  embeddings: EmbeddingsInterface,
  opts: { k?: number } = {}
) {
  if (retrieverCache[collection]) return retrieverCache[collection]

  const k = opts.k ?? 8

  if (config.db_mode === "json") {
    const docsRaw = loadJsonDocs(collection)
    const docs = toDocuments(docsRaw)

    if (docs.length === 0) {
      if (!memoryStores[collection]) {
        const { MemoryVectorStore } = await import("langchain/vectorstores/memory")
        memoryStores[collection] = await MemoryVectorStore.fromDocuments([], embeddings)
      }
      retrieverCache[collection] = memoryStores[collection].asRetriever({ k })
      return retrieverCache[collection]
    }

    if (!memoryStores[collection]) {
      const { MemoryVectorStore } = await import("langchain/vectorstores/memory")
      memoryStores[collection] = await MemoryVectorStore.fromDocuments(docs, embeddings)
    }

    const vectorRetriever = memoryStores[collection].asRetriever({ k })
    const bm25Retriever = BM25Retriever.fromDocuments(docs, { k })

    const ensemble = new EnsembleRetriever({
      retrievers: [vectorRetriever, bm25Retriever],
      weights: [0.5, 0.5],
    })

    retrieverCache[collection] = ensemble
    return ensemble
  } else {
    const store = new Chroma(embeddings, {
      collectionName: collection,
      url: "http://localhost:8000",
    })

    const chromaDocs = await store.collection.get({ limit: 10000 })
    const docs = (chromaDocs.documents || []).map((text: string | null, i: number) => new Document({
      pageContent: text || "",
      metadata: chromaDocs.metadatas?.[i] || {},
    }))

    if (docs.length === 0) {
      retrieverCache[collection] = store.asRetriever({ k })
      return retrieverCache[collection]
    }

    const vectorRetriever = store.asRetriever({ k })
    const bm25Retriever = BM25Retriever.fromDocuments(docs, { k })

    const ensemble = new EnsembleRetriever({
      retrievers: [vectorRetriever, bm25Retriever],
      weights: [0.5, 0.5],
    })

    retrieverCache[collection] = ensemble
    return ensemble
  }
}

export async function getRetrieverWithParents(
  collection: string,
  embeddings: EmbeddingsInterface,
  opts: { k?: number } = {}
): Promise<{ invoke(query: string): Promise<Document[]> }> {
  const k = opts.k ?? 8

  if (!config.parent_retrieval) {
    return getRetriever(collection, embeddings, opts)
  }

  const baseRetriever = await getRetriever(collection, embeddings, { k: k * 2 })

  return {
    async invoke(query: string): Promise<Document[]> {
      const childDocs = await baseRetriever.invoke(query)

      // Collect parentIds from matched children
      const parentIds: string[] = []
      for (const doc of childDocs) {
        const pid = doc.metadata?.parentId
        if (pid && !parentIds.includes(pid)) parentIds.push(pid)
      }

      if (parentIds.length === 0) {
        // No parent metadata (old data) — return children directly
        return childDocs.slice(0, k)
      }

      const parentMap = await getParents(collection, parentIds)

      // Resolve children to parents, deduplicating by parentId
      const seen = new Set<string>()
      const results: Document[] = []

      for (const child of childDocs) {
        const pid = child.metadata?.parentId

        if (!pid) {
          // Fallback: old data without parentId
          results.push(child)
          continue
        }

        if (seen.has(pid)) continue
        seen.add(pid)

        const parent = parentMap.get(pid)
        if (parent) {
          results.push(new Document({
            pageContent: parent.pageContent,
            metadata: { ...parent.metadata, resolvedFromChild: true },
          }))
        } else {
          // Parent not found — return child as fallback
          results.push(child)
        }

        if (results.length >= k) break
      }

      return results.slice(0, k)
    },
  }
}

export async function deleteDocumentsBySource(
  collection: string,
  sourceId: string,
  embeddings: EmbeddingsInterface
) {
  if (config.db_mode === "json") {
    await withLock(collection, async () => {
      const file = jsonPath(collection)
      if (!fs.existsSync(file)) return

      const docsRaw = loadJsonDocs(collection)
      const filtered = docsRaw.filter((d: any) => d.metadata?.sourceId !== sourceId)
      fs.writeFileSync(file, JSON.stringify(filtered, null, 2))
      invalidateCache(collection)
    })
  } else {
    const store = new Chroma(embeddings, {
      collectionName: collection,
      url: "http://localhost:8000",
    })
    await store.collection.delete({ where: { sourceId } })
    invalidateCache(collection)
  }
  await deleteParentsBySource(collection, sourceId)
}

export async function getAllDocuments(
  collection: string,
  embeddings: EmbeddingsInterface,
  filter?: { sourceIds?: string[] }
): Promise<Document[]> {
  let docs: Document[]

  if (config.db_mode === "json") {
    const raw = loadJsonDocs(collection)
    docs = toDocuments(raw)
  } else {
    const store = new Chroma(embeddings, {
      collectionName: collection,
      url: "http://localhost:8000",
    })
    const result = await store.collection.get({ limit: 50000 })
    docs = (result.documents || []).map((text: string | null, i: number) => new Document({
      pageContent: text || "",
      metadata: result.metadatas?.[i] || {},
    }))
  }

  if (filter?.sourceIds && filter.sourceIds.length > 0) {
    const allowed = new Set(filter.sourceIds)
    docs = docs.filter(d => d.metadata?.sourceId && allowed.has(d.metadata.sourceId))
  }

  return docs
}

export async function clearCollection(
  collection: string,
  embeddings: EmbeddingsInterface
) {
  if (config.db_mode === "json") {
    await withLock(collection, async () => {
      const file = jsonPath(collection)
      if (fs.existsSync(file)) fs.writeFileSync(file, "[]")
      invalidateCache(collection)
    })
  } else {
    const store = new Chroma(embeddings, {
      collectionName: collection,
      url: "http://localhost:8000",
    })
    const all = await store.collection.get({ limit: 50000 })
    if (all.ids?.length) await store.collection.delete({ ids: all.ids })
    invalidateCache(collection)
  }
  await clearParentStore(collection)
}
