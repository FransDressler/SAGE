import fs from "fs"
import path from "path"

/** Extract markdown image URLs from text: ![alt](url) */
export function extractImageUrls(text: string): string[] {
  const re = /!\[([^\]]*)\]\(([^)]+)\)/g
  const urls: string[] = []
  let m
  while ((m = re.exec(text)) !== null) urls.push(m[2])
  return urls
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Resolve a served image URL like /subjects/:id/images/:sourceId/file.png to a local file path */
export function resolveImagePath(url: string): string | null {
  const m = url.match(/\/subjects\/([^/]+)\/images\/([^/]+)\/([^/?#]+)/)
  if (!m) return null
  const [, subjectId, sourceId, filename] = m
  if (!UUID_RE.test(subjectId) || !UUID_RE.test(sourceId)) return null
  const safeName = path.basename(filename)
  if (!safeName || safeName.startsWith(".") || safeName !== filename) return null
  const filePath = path.join(process.cwd(), "subjects", subjectId, "images", sourceId, safeName)
  const expectedDir = path.join(process.cwd(), "subjects", subjectId, "images", sourceId)
  if (!filePath.startsWith(expectedDir + path.sep)) return null
  return filePath
}

export function mimeFromExt(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  if (ext === ".png") return "image/png"
  if (ext === ".gif") return "image/gif"
  if (ext === ".webp") return "image/webp"
  return "image/jpeg"
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

/** Read a local image file and return base64-encoded data with MIME type */
export function readImageAsBase64(localPath: string): { b64: string; mime: string } | null {
  try {
    if (!fs.existsSync(localPath)) return null
    const stat = fs.statSync(localPath)
    if (stat.size > MAX_IMAGE_SIZE) return null
    const data = fs.readFileSync(localPath)
    return { b64: data.toString("base64"), mime: mimeFromExt(localPath) }
  } catch {
    return null
  }
}

/** Build LLM image content parts from a list of served image URLs */
export function buildImageParts(imageUrls: string[], maxImages = 5): Array<{ type: "image_url"; image_url: { url: string } }> {
  const parts: Array<{ type: "image_url"; image_url: { url: string } }> = []
  for (const url of imageUrls.slice(0, maxImages)) {
    const localPath = resolveImagePath(url)
    if (!localPath) continue
    const img = readImageAsBase64(localPath)
    if (!img) continue
    parts.push({ type: "image_url", image_url: { url: `data:${img.mime};base64,${img.b64}` } })
  }
  return parts
}
