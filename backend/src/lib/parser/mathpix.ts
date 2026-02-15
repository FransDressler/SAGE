import fs from "fs"
import path from "path"
import yauzl from "yauzl"
import { config } from "../../config/env"

const API_BASE = "https://api.mathpix.com/v3/pdf"
const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 120_000
const FETCH_TIMEOUT_MS = 30_000

export type MathpixImage = { filename: string; ref: string }

function headers(): Record<string, string> {
  return {
    app_id: config.mathpix_app_id,
    app_key: config.mathpix_app_key,
  }
}

export function isMathpixConfigured(): boolean {
  return !!(config.mathpix_app_id && config.mathpix_app_key)
}

async function submitPdf(filePath: string, withImages: boolean): Promise<string> {
  const filename = path.basename(filePath)
  const blob = new Blob([fs.readFileSync(filePath)], { type: "application/pdf" })

  const formats = withImages ? { "md.zip": true } : { md: true }

  const form = new FormData()
  form.append("file", blob, filename)
  form.append("options_json", JSON.stringify({ conversion_formats: formats }))

  const res = await fetch(API_BASE, {
    method: "POST",
    headers: headers(),
    body: form,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Mathpix submit failed (${res.status}): ${body}`)
  }

  const json = (await res.json()) as { pdf_id?: string }
  if (!json.pdf_id) throw new Error("Mathpix submit returned no pdf_id")
  return json.pdf_id
}

async function pollUntilDone(pdfId: string): Promise<void> {
  const deadline = Date.now() + POLL_TIMEOUT_MS

  while (Date.now() < deadline) {
    const res = await fetch(`${API_BASE}/${pdfId}`, { headers: headers() })
    if (!res.ok) {
      throw new Error(`Mathpix poll failed (${res.status})`)
    }

    const json = (await res.json()) as { status?: string; error?: string }

    if (json.status === "completed") return
    if (json.status === "error") {
      throw new Error(`Mathpix processing error: ${json.error || "unknown"}`)
    }

    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
  }

  throw new Error(`Mathpix polling timed out after ${POLL_TIMEOUT_MS / 1000}s`)
}

async function downloadMarkdown(pdfId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/${pdfId}.md`, { headers: headers(), signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
  if (!res.ok) {
    throw new Error(`Mathpix download failed (${res.status})`)
  }
  return res.text()
}

async function downloadZip(pdfId: string): Promise<Buffer> {
  const res = await fetch(`${API_BASE}/${pdfId}.md.zip`, {
    headers: headers(),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!res.ok) {
    throw new Error(`Mathpix ZIP download failed (${res.status})`)
  }
  return Buffer.from(await res.arrayBuffer())
}

const MAX_UNCOMPRESSED_BYTES = 100 * 1024 * 1024 // 100 MB

function extractZip(zipBuffer: Buffer, imagesDir: string): Promise<{ markdown: string; images: MathpixImage[] }> {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(zipBuffer, { lazyEntries: true }, (err, zipFile) => {
      if (err || !zipFile) return reject(err || new Error("Failed to open ZIP"))

      let markdown = ""
      const images: MathpixImage[] = []
      let totalBytes = 0
      let aborted = false

      zipFile.readEntry()
      zipFile.on("entry", (entry: yauzl.Entry) => {
        const name = entry.fileName

        // Defense-in-depth: reject path traversal attempts
        if (name.includes("..") || path.isAbsolute(name)) {
          zipFile.readEntry()
          return
        }

        // Skip directories
        if (/\/$/.test(name)) {
          zipFile.readEntry()
          return
        }

        zipFile.openReadStream(entry, (streamErr, readStream) => {
          if (streamErr || !readStream) {
            zipFile.readEntry()
            return
          }

          const chunks: Buffer[] = []
          readStream.on("data", (chunk: Buffer) => {
            totalBytes += chunk.length
            if (totalBytes > MAX_UNCOMPRESSED_BYTES) {
              if (!aborted) {
                aborted = true
                zipFile.close()
                reject(new Error("ZIP extraction exceeded size limit"))
              }
              return
            }
            chunks.push(chunk)
          })
          readStream.on("error", () => zipFile.readEntry())
          readStream.on("end", () => {
            if (aborted) return
            const buf = Buffer.concat(chunks)

            if (name.endsWith(".md")) {
              markdown = buf.toString("utf-8")
            } else if (/^images\//i.test(name) && /\.(jpg|jpeg|png|gif|webp)$/i.test(name)) {
              const imgFilename = path.basename(name)
              const imgPath = path.join(imagesDir, imgFilename)
              fs.mkdirSync(imagesDir, { recursive: true })
              fs.writeFileSync(imgPath, buf)
              images.push({ filename: imgFilename, ref: `./${name}` })
            }

            zipFile.readEntry()
          })
        })
      })

      zipFile.on("end", () => { if (!aborted) resolve({ markdown, images }) })
      zipFile.on("error", reject)
    })
  })
}

export async function extractWithMathpix(
  filePath: string,
  imagesDir?: string
): Promise<{ text: string; pages: null; images: MathpixImage[] }> {
  const basename = path.basename(filePath)
  const withImages = !!imagesDir

  console.log(`[mathpix] Submitting ${basename} (format: ${withImages ? "md.zip" : "md"})...`)
  const pdfId = await submitPdf(filePath, withImages)
  console.log(`[mathpix] PDF accepted (id: ${pdfId}), polling...`)

  await pollUntilDone(pdfId)
  console.log(`[mathpix] Processing complete, downloading...`)

  if (withImages && imagesDir) {
    const zipBuffer = await downloadZip(pdfId)
    const { markdown, images } = await extractZip(zipBuffer, imagesDir)

    if (!markdown || markdown.trim().length === 0) {
      throw new Error("Mathpix returned empty content")
    }
    console.log(`[mathpix] Got ${markdown.length} chars + ${images.length} images for ${basename}`)
    return { text: markdown, pages: null, images }
  }

  // Fallback: plain markdown (no images)
  const text = await downloadMarkdown(pdfId)
  if (!text || text.trim().length === 0) {
    throw new Error("Mathpix returned empty content")
  }
  console.log(`[mathpix] Got ${text.length} chars for ${basename}`)
  return { text, pages: null, images: [] }
}
