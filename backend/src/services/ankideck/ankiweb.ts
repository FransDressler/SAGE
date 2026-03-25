import { zstdCompressSync, zstdDecompressSync } from "zlib"
import JSZip from "jszip"
import db from "../../utils/database/keyv"
import { config } from "../../config/env"
import type { MediaFile } from "./merge"

const SYNC_VERSION = 11
const CLIENT_VERSION_SHORT = "25.02,abcdef,mac"  // header c field: version,buildhash,platform
const CLIENT_VERSION_LONG = "anki,25.02 (abcdef),mac"  // meta cv field: anki,version (buildhash),platform
const DEFAULT_ENDPOINT = "https://sync.ankiweb.net/"

function getEndpoint(): string {
  return config.ankiweb_endpoint || DEFAULT_ENDPOINT
}

function randomSessionKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

function zstdCompress(data: Buffer | string): Buffer {
  const input = typeof data === "string" ? Buffer.from(data, "utf-8") : data
  return zstdCompressSync(input)
}

function zstdDecompress(data: Buffer): Buffer {
  return zstdDecompressSync(data) as Buffer
}

async function syncRequest(
  method: string,
  hkey: string,
  sessionKey: string,
  body: Buffer,
  maxRedirects = 3
): Promise<Buffer> {
  const base = getEndpoint()
  const header = JSON.stringify({ v: SYNC_VERSION, k: hkey, c: CLIENT_VERSION_SHORT, s: sessionKey })

  let url = `${base}sync/${method}`

  for (let attempt = 0; attempt <= maxRedirects; attempt++) {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "anki-sync": header,
        "Content-Type": "application/octet-stream",
      },
      body,
      redirect: "manual",
    })

    // Follow redirects manually (301/302/307/308) — re-POST to new location
    if ([301, 302, 307, 308].includes(resp.status)) {
      const location = resp.headers.get("location")
      if (!location) throw new Error(`AnkiWeb ${method}: redirect without Location header`)
      // Location may be a new base URL (e.g. https://sync28.ankiweb.net/) — append sync/method
      if (location.endsWith("/") || !location.includes(`/sync/`)) {
        const newBase = location.endsWith("/") ? location : location + "/"
        resolvedEndpoint = newBase  // save for subsequent requests in same session
        url = `${newBase}sync/${method}`
      } else {
        url = location
      }
      console.log(`[ankiweb] ${method} redirected to: ${url}`)
      continue
    }

    // 303 in Anki protocol means "see other" — check for redirect or read body
    if (resp.status === 303) {
      const location = resp.headers.get("location")
      if (location) { url = location; continue }
      // 303 without location — log headers and body for debugging
      const text = await resp.text().catch(() => "")
      const hdrs = Object.fromEntries(resp.headers.entries())
      console.log(`[ankiweb] 303 response for ${method}:`, { headers: hdrs, body: text.slice(0, 500) })
      throw new Error(`AnkiWeb ${method}: unexpected 303 — ${text.slice(0, 200)}`)
    }

    if (!resp.ok) {
      const text = await resp.text().catch(() => "")
      throw new Error(`AnkiWeb ${method} failed: HTTP ${resp.status} ${text.slice(0, 200)}`)
    }

    const respBuf = Buffer.from(await resp.arrayBuffer())

    // Server sends anki-original-size header when response is zstd-compressed
    const originalSize = resp.headers.get("anki-original-size")
    if (originalSize) {
      return zstdDecompress(respBuf)
    }
    return respBuf
  }

  throw new Error(`AnkiWeb ${method}: too many redirects`)
}

// --- Public API ---

export type AnkiWebAuth = {
  hkey: string
  username: string
  deckName: string
  lastSync?: number
}

function authKey(subjectId: string): string {
  return `subject:${subjectId}:ankiweb`
}

export async function getAnkiWebAuth(subjectId: string): Promise<AnkiWebAuth | null> {
  return (await db.get(authKey(subjectId))) || null
}

export async function saveAnkiWebAuth(subjectId: string, auth: AnkiWebAuth): Promise<void> {
  await db.set(authKey(subjectId), auth)
}

export async function deleteAnkiWebAuth(subjectId: string): Promise<void> {
  await db.delete(authKey(subjectId))
}

export async function login(username: string, password: string): Promise<string> {
  const sessionKey = randomSessionKey()
  const body = zstdCompress(JSON.stringify({ u: username, p: password }))
  const resp = await syncRequest("hostKey", "", sessionKey, body)
  const respStr = resp.toString("utf-8")
  console.log("[ankiweb] hostKey response length:", resp.length, "raw:", respStr.slice(0, 100))
  const json = JSON.parse(respStr)
  if (!json.key) throw new Error("Login failed — no hkey returned")
  console.log("[ankiweb] hkey length:", json.key.length, "starts with:", json.key.slice(0, 5))
  return json.key
}

// Track the resolved endpoint after meta redirect
let resolvedEndpoint: string | null = null

async function syncMeta(hkey: string, sessionKey: string): Promise<any> {
  const metaPayload = {
    v: SYNC_VERSION,
    cv: CLIENT_VERSION_LONG,
  }
  const body = zstdCompress(JSON.stringify(metaPayload))
  const resp = await syncRequest("meta", hkey, sessionKey, body)
  const json = JSON.parse(resp.toString("utf-8"))
  console.log("[ankiweb] meta response:", JSON.stringify(json).slice(0, 300))
  return json
}

// Make a request to the resolved endpoint (after meta redirect)
async function syncRequestResolved(
  method: string,
  hkey: string,
  sessionKey: string,
  body: Buffer
): Promise<Buffer> {
  if (resolvedEndpoint) {
    // Temporarily override the base URL
    const origGetEndpoint = getEndpoint
    const base = resolvedEndpoint
    const header = JSON.stringify({ v: SYNC_VERSION, k: hkey, c: CLIENT_VERSION_SHORT, s: sessionKey })
    const url = `${base}sync/${method}`

    console.log(`[ankiweb] ${method} using resolved endpoint: ${url}`)

    const resp = await fetch(url, {
      method: "POST",
      headers: { "anki-sync": header, "Content-Type": "application/octet-stream" },
      body,
      redirect: "manual",
    })

    if (!resp.ok) {
      const text = await resp.text().catch(() => "")
      throw new Error(`AnkiWeb ${method} failed: HTTP ${resp.status} ${text.slice(0, 200)}`)
    }

    const respBuf = Buffer.from(await resp.arrayBuffer())
    const originalSize = resp.headers.get("anki-original-size")
    if (originalSize) return zstdDecompress(respBuf)
    return respBuf
  }
  return syncRequest(method, hkey, sessionKey, body)
}

export async function downloadCollection(hkey: string): Promise<Buffer> {
  const sessionKey = randomSessionKey()
  resolvedEndpoint = null

  // Step 1: meta exchange — establishes session, may redirect to shard
  const meta = await syncMeta(hkey, sessionKey)

  // Step 2: download using same session (and resolved endpoint)
  const body = zstdCompress("{}")
  return syncRequestResolved("download", hkey, sessionKey, body)
}

export async function uploadCollection(hkey: string, collectionDb: Buffer): Promise<void> {
  const sessionKey = randomSessionKey()
  resolvedEndpoint = null

  // Step 1: meta exchange
  await syncMeta(hkey, sessionKey)

  // Step 2: upload
  const body = zstdCompress(collectionDb)
  const resp = await syncRequestResolved("upload", hkey, sessionKey, body)
  const result = resp.toString("utf-8")
  if (result !== "OK") {
    throw new Error(`AnkiWeb upload failed: ${result}`)
  }
}

// --- Media Sync ---

async function msyncRequest(
  method: string,
  hkey: string,
  sessionKey: string,
  body: Buffer
): Promise<Buffer> {
  const base = resolvedEndpoint || getEndpoint()
  const header = JSON.stringify({ v: SYNC_VERSION, k: hkey, c: CLIENT_VERSION_SHORT, s: sessionKey })
  let url = `${base}msync/${method}`

  console.log(`[ankiweb] msync/${method} → ${url}`)

  const resp = await fetch(url, {
    method: "POST",
    headers: { "anki-sync": header, "Content-Type": "application/octet-stream" },
    body,
    redirect: "manual",
  })

  // Handle redirects
  if ([301, 302, 307, 308].includes(resp.status)) {
    const location = resp.headers.get("location")
    if (location) {
      const newBase = location.endsWith("/") ? location : location + "/"
      url = `${newBase}msync/${method}`
      console.log(`[ankiweb] msync/${method} redirected to: ${url}`)
      const resp2 = await fetch(url, {
        method: "POST",
        headers: { "anki-sync": header, "Content-Type": "application/octet-stream" },
        body,
        redirect: "manual",
      })
      if (!resp2.ok) throw new Error(`AnkiWeb msync/${method} failed after redirect: HTTP ${resp2.status}`)
      const buf = Buffer.from(await resp2.arrayBuffer())
      const origSize = resp2.headers.get("anki-original-size")
      return origSize ? zstdDecompress(buf) : buf
    }
  }

  if (!resp.ok) {
    const text = await resp.text().catch(() => "")
    throw new Error(`AnkiWeb msync/${method} failed: HTTP ${resp.status} ${text.slice(0, 200)}`)
  }

  const respBuf = Buffer.from(await resp.arrayBuffer())
  const origSize = resp.headers.get("anki-original-size")
  return origSize ? zstdDecompress(respBuf) : respBuf
}

export async function uploadMedia(hkey: string, mediaFiles: MediaFile[]): Promise<void> {
  if (mediaFiles.length === 0) return

  const sessionKey = randomSessionKey()

  // Step 1: begin media sync
  const beginBody = zstdCompress(JSON.stringify({ v: CLIENT_VERSION_LONG }))
  const beginResp = await msyncRequest("begin", hkey, sessionKey, beginBody)
  const beginJson = JSON.parse(beginResp.toString("utf-8"))
  console.log("[ankiweb] media begin:", JSON.stringify(beginJson).slice(0, 200))

  // Step 2: upload in batches of 25
  const BATCH_SIZE = 25
  for (let i = 0; i < mediaFiles.length; i += BATCH_SIZE) {
    const batch = mediaFiles.slice(i, i + BATCH_SIZE)

    // Build ZIP with _meta and numbered entries
    const zip = new JSZip()
    const meta: [string, string][] = []
    for (let j = 0; j < batch.length; j++) {
      const idx = String(j)
      zip.file(idx, batch[j].data, { compression: "STORE" })
      meta.push([batch[j].name, idx])
    }
    zip.file("_meta", JSON.stringify(meta))

    const zipBuf = await zip.generateAsync({ type: "nodebuffer", compression: "STORE" })
    const compressedZip = zstdCompress(zipBuf)

    const uploadResp = await msyncRequest("uploadChanges", hkey, sessionKey, compressedZip)
    const uploadJson = JSON.parse(uploadResp.toString("utf-8"))
    console.log(`[ankiweb] media upload batch ${Math.floor(i / BATCH_SIZE) + 1}:`, JSON.stringify(uploadJson).slice(0, 200))

    if (uploadJson.err) {
      throw new Error(`AnkiWeb media upload failed: ${uploadJson.err}`)
    }
  }

  // Step 3: sanity check (optional but good practice)
  try {
    const sanityBody = zstdCompress(JSON.stringify({ local: mediaFiles.length }))
    const sanityResp = await msyncRequest("mediaSanity", hkey, sessionKey, sanityBody)
    console.log("[ankiweb] media sanity:", sanityResp.toString("utf-8").slice(0, 100))
  } catch (e: any) {
    console.warn("[ankiweb] media sanity check failed (non-fatal):", e?.message)
  }
}
