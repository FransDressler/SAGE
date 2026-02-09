import fs from "fs"
import path from "path"
import mammoth from "mammoth"
import { extractText as unpdfExtract, getDocumentProxy } from "unpdf"
import Busboy from "busboy"
import { embedTextFromFile, type EmbedMeta } from "../ai/embed"

const uploadsDir = path.join(process.cwd(), "storage", "uploads")
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

export type UpFile = { path: string; filename: string; mimeType: string }

export function parseMultipart(req: any): Promise<{ q: string; chatId?: string; provider?: string; model?: string; files: UpFile[] }> {
  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers: req.headers, limits: { fileSize: 20 * 1024 * 1024, files: 10 } })
    let q = ""
    let chatId = ""
    let provider = ""
    let model = ""
    const files: UpFile[] = []
    let pending = 0
    let ended = false
    let failed = false
    const done = () => { if (!failed && ended && pending === 0) resolve({ q, chatId: chatId || undefined, provider: provider || undefined, model: model || undefined, files }) }

    bb.on("field", (n, v) => { if (n === "q") q = v; if (n === "chatId") chatId = v; if (n === "provider") provider = v; if (n === "model") model = v })
    bb.on("file", (_n, file, info: any) => {
      pending++
      const filename = info?.filename || "file"
      const mimeType = info?.mimeType || info?.mime || "application/octet-stream"
      const safeFn = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_")
      const fp = path.join(uploadsDir, `${Date.now()}-${safeFn}`)
      const ws = fs.createWriteStream(fp)
      file.on("error", e => { failed = true; reject(e) })
      ws.on("error", e => { failed = true; reject(e) })
      ws.on("finish", () => { files.push({ path: fp, filename, mimeType }); pending--; done() })
      file.pipe(ws)
    })
    bb.on("error", e => { failed = true; reject(e) })
    bb.on("finish", () => { ended = true; done() })
    req.pipe(bb)
  })
}

export type UploadOpts = {
  filePath: string
  filename?: string
  contentType?: string
  namespace?: string
  sourceId?: string
  subjectId?: string
  sourceType?: string
}

export type PreparedFile = {
  txtPath: string
  pages: { page: number; text: string }[] | null
}

export async function extractAndPrepare(filePath: string, contentType?: string): Promise<PreparedFile> {
  const mime = contentType || ""
  const { text, pages } = await extractText(filePath, mime)
  if (!text?.trim()) throw new Error("No valid content extracted from file.")

  const cleaned = deduplicateText(text)
  if (!cleaned.trim()) throw new Error("No valid content after deduplication.")

  const out = `${filePath}.txt`
  fs.writeFileSync(out, cleaned)
  return { txtPath: out, pages }
}

export async function embedPreparedFile(
  prepared: PreparedFile,
  namespace: string,
  meta: EmbedMeta
): Promise<void> {
  await embedTextFromFile(prepared.txtPath, namespace, meta, prepared.pages)
}

export async function handleUpload(a: UploadOpts): Promise<{ stored: string }> {
  const prepared = await extractAndPrepare(a.filePath, a.contentType)
  const ns = a.namespace || "pagelm"

  const meta: EmbedMeta = {
    sourceId: a.sourceId,
    sourceFile: a.filename,
    mimeType: a.contentType || "",
    subjectId: a.subjectId,
    ...(a.sourceType && { sourceType: a.sourceType }),
  }

  await embedPreparedFile(prepared, ns, meta)
  return { stored: prepared.txtPath }
}

/**
 * Remove repeated boilerplate lines (e.g. copyright headers/footers repeated
 * on every page of a DRM-protected PDF). Lines that appear more than 2 times
 * and are shorter than 300 characters are collapsed to a single occurrence.
 * Consecutive blank lines are capped at 2.
 */
export function deduplicateText(text: string): string {
  const lines = text.split("\n")
  const seen = new Map<string, number>() // norm → occurrence count so far
  const result: string[] = []
  let consecutiveBlanks = 0

  for (const line of lines) {
    const norm = line.trim().replace(/\s+/g, " ").toLowerCase()

    if (!norm) {
      consecutiveBlanks++
      if (consecutiveBlanks <= 2) result.push("")
      continue
    }

    consecutiveBlanks = 0
    const count = (seen.get(norm) || 0) + 1
    seen.set(norm, count)

    // Repeated short lines (boilerplate) — keep only first 2 occurrences
    if (count > 2 && norm.length < 300) continue

    result.push(line)
  }

  return result.join("\n")
}

type ExtractResult = { text: string; pages: { page: number; text: string }[] | null }

async function extractText(filePath: string, mime: string): Promise<ExtractResult> {
  const raw = fs.readFileSync(filePath)

  if (mime.includes("pdf")) {
    const pdf = await getDocumentProxy(new Uint8Array(raw))
    const { totalPages, text: pageTexts } = await unpdfExtract(pdf, { mergePages: false })
    const pages = (pageTexts as string[]).map((t, i) => ({ page: i + 1, text: t.trim() }))
    const fullText = pages.map(p => p.text).join("\n\n")
    return { text: fullText, pages }
  }

  if (mime.includes("markdown")) {
    return { text: raw.toString(), pages: null }
  }

  if (mime.includes("plain")) {
    return { text: raw.toString(), pages: null }
  }

  if (mime.includes("wordprocessingml") || mime.includes("msword") || mime.includes("vnd.oasis.opendocument.text")) {
    const r = await mammoth.convertToMarkdown({ buffer: raw })
    return { text: r.value, pages: null }
  }

  throw new Error("unsupported file type")
}
