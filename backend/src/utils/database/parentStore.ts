import fs from "fs"
import path from "path"
import { config } from "../../config/env"

type ParentDoc = {
  pageContent: string
  metadata: Record<string, any>
}

type ParentStoreData = Record<string, ParentDoc>

const collectionLocks: Record<string, Promise<void>> = {}

async function withLock<T>(collection: string, fn: () => Promise<T>): Promise<T> {
  const key = `parent:${collection}`
  const prev = collectionLocks[key] ?? Promise.resolve()
  let release: () => void
  collectionLocks[key] = new Promise<void>(r => { release = r })
  await prev
  try {
    return await fn()
  } finally {
    release!()
  }
}

function parentJsonPath(collection: string): string {
  return path.join(process.cwd(), "storage", "json", `${collection}__parents.json`)
}

function loadParentStore(collection: string): ParentStoreData {
  const file = parentJsonPath(collection)
  if (!fs.existsSync(file)) return {}
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"))
  } catch {
    return {}
  }
}

function writeParentStore(collection: string, data: ParentStoreData): void {
  const file = parentJsonPath(collection)
  const dir = path.dirname(file)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const tmp = file + ".tmp"
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2))
  fs.renameSync(tmp, file)
}

export async function saveParents(
  collection: string,
  parents: { parentId: string; pageContent: string; metadata: Record<string, any> }[]
): Promise<void> {
  if (config.db_mode !== "json") {
    // For ChromaDB, store in a separate :parents collection as a simple JSON file
    // (ChromaDB is only used for vector search; parent store is always JSON)
  }
  await withLock(collection, async () => {
    const store = loadParentStore(collection)
    for (const p of parents) {
      store[p.parentId] = { pageContent: p.pageContent, metadata: p.metadata }
    }
    writeParentStore(collection, store)
  })
}

export async function getParent(
  collection: string,
  parentId: string
): Promise<ParentDoc | null> {
  const store = loadParentStore(collection)
  return store[parentId] ?? null
}

export async function getParents(
  collection: string,
  parentIds: string[]
): Promise<Map<string, ParentDoc>> {
  const store = loadParentStore(collection)
  const result = new Map<string, ParentDoc>()
  for (const id of parentIds) {
    if (store[id]) result.set(id, store[id])
  }
  return result
}

export async function clearParentStore(collection: string): Promise<void> {
  await withLock(collection, async () => {
    const file = parentJsonPath(collection)
    if (fs.existsSync(file)) fs.writeFileSync(file, "{}")
  })
}

export async function deleteParentsBySource(
  collection: string,
  sourceId: string
): Promise<void> {
  await withLock(collection, async () => {
    const store = loadParentStore(collection)
    const filtered: ParentStoreData = {}
    for (const [id, doc] of Object.entries(store)) {
      if (doc.metadata?.sourceId !== sourceId) {
        filtered[id] = doc
      }
    }
    writeParentStore(collection, filtered)
  })
}
