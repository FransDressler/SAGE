import fs from "fs"
import path from "path"
import Busboy from "busboy"
import {
  createSubject,
  listSubjects,
  getSubject,
  renameSubject,
  updateSubjectPrompt,
  deleteSubject,
  listSources,
  addSource,
  removeSource,
  getSourcesDir,
  getSubjectDir,
  listTools,
  deleteTool,
} from "../../utils/subjects/subjects"
import { config } from "../../config/env"
import { extractAndPrepare, embedPreparedFile, finalizeImages, type PreparedFile } from "../../lib/parser/upload"
import { embedTextFromFile, type EmbedMeta } from "../../lib/ai/embed"
import { clearCollection } from "../../utils/database/db"
import { embeddings } from "../../utils/llm/llm"
import { expandSubjectGraph } from "../../services/subjectgraph"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function safeName(name: string): string {
  return path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "_")
}

export function subjectRoutes(app: any) {
  app.get("/subjects", async (_req: any, res: any) => {
    try {
      const subjects = await listSubjects()
      const out: any[] = []
      for (const s of subjects) {
        const sources = await listSources(s.id)
        out.push({ ...s, sourceCount: sources.length })
      }
      res.send({ ok: true, subjects: out })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "failed" })
    }
  })

  app.post("/subjects", async (req: any, res: any) => {
    try {
      const name = String(req.body?.name || "").trim()
      if (!name) return res.status(400).send({ ok: false, error: "name required" })
      const subject = await createSubject(name)
      res.send({ ok: true, subject })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "failed" })
    }
  })

  app.get("/subjects/:id", async (req: any, res: any) => {
    try {
      if (!UUID_RE.test(req.params.id)) return res.status(400).send({ ok: false, error: "invalid id" })
      const subject = await getSubject(req.params.id)
      if (!subject) return res.status(404).send({ ok: false, error: "not found" })
      const sources = await listSources(subject.id)
      res.send({ ok: true, subject, sources })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "failed" })
    }
  })

  app.patch("/subjects/:id", async (req: any, res: any) => {
    try {
      if (!UUID_RE.test(req.params.id)) return res.status(400).send({ ok: false, error: "invalid id" })
      const name = req.body?.name !== undefined ? String(req.body.name).trim() : undefined
      if (req.body?.systemPrompt !== undefined && typeof req.body.systemPrompt !== "string") {
        return res.status(400).send({ ok: false, error: "systemPrompt must be a string" })
      }
      const systemPrompt = typeof req.body?.systemPrompt === "string" ? req.body.systemPrompt : undefined
      if (name === undefined && systemPrompt === undefined) {
        return res.status(400).send({ ok: false, error: "name or systemPrompt required" })
      }
      const subject = await getSubject(req.params.id)
      if (!subject) return res.status(404).send({ ok: false, error: "not found" })
      if (name !== undefined && name) {
        await renameSubject(req.params.id, name)
      }
      if (systemPrompt !== undefined) {
        await updateSubjectPrompt(req.params.id, systemPrompt)
      }
      const updated = await getSubject(req.params.id)
      res.send({ ok: true, subject: updated })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "failed" })
    }
  })

  app.delete("/subjects/:id", async (req: any, res: any) => {
    try {
      if (!UUID_RE.test(req.params.id)) return res.status(400).send({ ok: false, error: "invalid id" })
      const ok = await deleteSubject(req.params.id)
      if (!ok) return res.status(404).send({ ok: false, error: "not found" })
      res.send({ ok: true })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "failed" })
    }
  })

  app.post("/subjects/:id/sources", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const subject = await getSubject(subjectId)
      if (!subject) return res.status(404).send({ ok: false, error: "subject not found" })

      const ct = String(req.headers["content-type"] || "")
      if (!ct.includes("multipart/form-data")) {
        return res.status(400).send({ ok: false, error: "multipart/form-data required" })
      }

      const sourcesDir = getSourcesDir(subjectId)
      if (!fs.existsSync(sourcesDir)) fs.mkdirSync(sourcesDir, { recursive: true })

      const bb = Busboy({ headers: req.headers, defParamCharset: "utf8" })
      const uploaded: { filename: string; originalName: string; mimeType: string; path: string }[] = []
      let pending = 0
      let ended = false
      let failed = false
      let sourceType: "material" | "exercise" | "websearch" = "material"

      bb.on("field", (name: string, val: string) => {
        if (name === "sourceType" && (val === "material" || val === "exercise" || val === "websearch")) {
          sourceType = val
        }
      })

      const finish = async () => {
        if (failed || !ended || pending > 0) return
        try {
          const ns = `subject:${subjectId}`

          // Phase 1: Extract text & validate all files BEFORE responding
          const prepared: { file: typeof uploaded[0]; prep: PreparedFile }[] = []
          const errors: string[] = []

          for (const f of uploaded) {
            try {
              const prep = await extractAndPrepare(f.path, f.mimeType, subjectId)
              prepared.push({ file: f, prep })
            } catch (err: any) {
              errors.push(`${f.originalName}: ${err?.message || "extraction failed"}`)
            }
          }

          // If ALL files failed, return error
          if (prepared.length === 0) {
            return res.status(400).send({ ok: false, error: errors.join("; ") })
          }

          // Register only the successfully extracted files as sources
          const sources: any[] = []
          const embedJobs: { source: any; prep: PreparedFile; file: typeof uploaded[0] }[] = []

          for (const { file: f, prep } of prepared) {
            const source = await addSource(subjectId, f, sourceType)
            finalizeImages(prep, subjectId, source.id)
            sources.push(source)
            embedJobs.push({ source, prep, file: f })
          }

          // Respond with sources + any extraction warnings
          res.send({
            ok: true,
            sources,
            ...(errors.length > 0 && { warnings: errors }),
          })

          // Phase 2: Run embedding in the background, then expand knowledge graph
          const embedPromises = embedJobs.map(({ source, prep, file: f }) => {
            const meta: EmbedMeta = {
              sourceId: source.id,
              sourceFile: f.originalName,
              mimeType: f.mimeType,
              subjectId,
              sourceType,
            }
            return embedPreparedFile(prep, ns, meta).catch(err =>
              console.error(`[embed] background embedding failed for ${f.originalName}:`, err?.message || err)
            )
          })

          // After all embeddings complete, expand the subject knowledge graph
          Promise.all(embedPromises).then(() => {
            const sourceIds = embedJobs.map(j => j.source.id)
            expandSubjectGraph(subjectId, sourceIds).catch(err =>
              console.error(`[subjectgraph] background expand failed:`, err?.message || err)
            )
          })
        } catch (e: any) {
          if (!failed) { failed = true; res.status(500).send({ ok: false, error: e?.message || "upload failed" }) }
        }
      }

      bb.on("file", (_name: string, file: any, info: any) => {
        pending++
        const originalName = info?.filename || "file"
        const mimeType = info?.mimeType || "application/octet-stream"
        const filename = `${Date.now()}-${safeName(originalName)}`
        const fp = path.join(sourcesDir, filename)
        const ws = fs.createWriteStream(fp)
        file.on("error", (e: any) => { if (!failed) { failed = true; res.status(500).send({ ok: false, error: e?.message }) } })
        ws.on("error", (e: any) => { if (!failed) { failed = true; res.status(500).send({ ok: false, error: e?.message }) } })
        ws.on("finish", () => {
          uploaded.push({ filename, originalName, mimeType, path: fp })
          pending--
          finish()
        })
        file.pipe(ws)
      })

      bb.on("error", (e: any) => { if (!failed) { failed = true; res.status(500).send({ ok: false, error: e?.message }) } })
      bb.on("finish", () => { ended = true; finish() })
      req.pipe(bb)
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "failed" })
    }
  })

  app.get("/subjects/:id/sources/:sourceId/content", async (req: any, res: any) => {
    try {
      const { id: subjectId, sourceId } = req.params
      if (!UUID_RE.test(subjectId) || !UUID_RE.test(sourceId)) {
        return res.status(400).send({ ok: false, error: "invalid id" })
      }
      const sources = await listSources(subjectId)
      const source = sources.find((s: any) => s.id === sourceId)
      if (!source) return res.status(404).send({ ok: false, error: "source not found" })

      const sourcesDir = getSourcesDir(subjectId)
      const origPath = path.join(sourcesDir, source.filename)

      if (!fs.existsSync(origPath)) {
        return res.status(404).send({ ok: false, error: "Source file not found" })
      }

      const stat = fs.statSync(origPath)
      const contentType = source.mimeType || "application/octet-stream"
      res.setHeader("Content-Type", contentType)
      res.setHeader("Content-Length", stat.size)
      res.setHeader("Content-Disposition", `inline; filename*=UTF-8''${encodeURIComponent(source.originalName)}`)
      res.setHeader("X-Content-Type-Options", "nosniff")
      fs.createReadStream(origPath).pipe(res)
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "failed" })
    }
  })

  app.delete("/subjects/:id/sources/:sourceId", async (req: any, res: any) => {
    try {
      if (!UUID_RE.test(req.params.id) || !UUID_RE.test(req.params.sourceId)) {
        return res.status(400).send({ ok: false, error: "invalid id" })
      }
      const ok = await removeSource(req.params.id, req.params.sourceId)
      if (!ok) return res.status(404).send({ ok: false, error: "source not found" })

      // Clean up extracted images for this source
      const imagesDir = path.join(getSubjectDir(req.params.id), "images", req.params.sourceId)
      if (fs.existsSync(imagesDir)) fs.rmSync(imagesDir, { recursive: true, force: true })

      res.send({ ok: true })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "failed" })
    }
  })

  app.post("/subjects/:id/reindex", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const subject = await getSubject(subjectId)
      if (!subject) return res.status(404).send({ ok: false, error: "not found" })

      const reextract = req.query?.reextract === "true"
      const sources = await listSources(subjectId)
      const ns = `subject:${subjectId}`
      const sourcesDir = getSourcesDir(subjectId)

      await clearCollection(ns, embeddings)

      let reindexed = 0
      const errors: { sourceId: string; name: string; error: string }[] = []

      for (const source of sources) {
        try {
          const srcPath = path.join(sourcesDir, source.filename)
          let txtPath = path.join(sourcesDir, source.filename + ".txt")

          // Re-extract from original file if requested and original exists
          if (reextract && fs.existsSync(srcPath)) {
            try {
              const prep = await extractAndPrepare(srcPath, source.mimeType, subjectId)
              finalizeImages(prep, subjectId, source.id)
              txtPath = prep.txtPath
            } catch (extractErr: any) {
              console.warn(`[reindex] Re-extraction failed for ${source.originalName}:`, extractErr?.message)
              // Fall through to use existing .txt if available
            }
          }

          if (!fs.existsSync(txtPath)) {
            errors.push({ sourceId: source.id, name: source.originalName, error: "No extracted text file found" })
            continue
          }

          await embedTextFromFile(txtPath, ns, {
            sourceId: source.id,
            sourceFile: source.originalName,
            mimeType: source.mimeType,
            subjectId,
            sourceType: source.sourceType || "material",
          })
          reindexed++
        } catch (err: any) {
          console.error(`[reindex] Failed for ${source.originalName}:`, err?.message || err)
          errors.push({ sourceId: source.id, name: source.originalName, error: err?.message || "embedding failed" })
        }
      }

      res.send({
        ok: true,
        reindexed,
        total: sources.length,
        ...(errors.length > 0 && { errors }),
      })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "reindex failed" })
    }
  })

  app.get("/subjects/:id/tools", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })

      const tools = await listTools(subjectId)
      const enriched = tools.map(t => {
        if (t.result.type === "podcast") {
          return { ...t, result: { ...t.result, url: `${config.baseUrl}/subjects/${subjectId}/podcast/download/${t.result.pid}/${t.result.filename}` } }
        }
        if (t.result.type === "smartnotes") {
          return { ...t, result: { ...t.result, url: `${config.baseUrl}/subjects/${subjectId}/smartnotes/${t.result.filename}` } }
        }
        if (t.result.type === "research") {
          return { ...t, result: { ...t.result, url: `${config.baseUrl}/subjects/${subjectId}/research/${t.result.filename}` } }
        }
        return t
      })

      res.send({ ok: true, tools: enriched })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "failed" })
    }
  })

  app.delete("/subjects/:id/tools/:toolId", async (req: any, res: any) => {
    try {
      const { id: subjectId, toolId } = req.params
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const ok = await deleteTool(subjectId, toolId)
      if (!ok) return res.status(404).send({ ok: false, error: "tool not found" })
      res.send({ ok: true })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "failed" })
    }
  })

  app.get("/subjects/:id/images/:sourceId/:filename", async (req: any, res: any) => {
    try {
      const { id: subjectId, sourceId, filename: rawFilename } = req.params
      if (!UUID_RE.test(subjectId) || !UUID_RE.test(sourceId)) {
        return res.status(400).send({ ok: false, error: "invalid id" })
      }
      const filename = path.basename(rawFilename)
      const imagesDir = path.join(getSubjectDir(subjectId), "images", sourceId)
      const filePath = path.resolve(imagesDir, filename)
      if (!filePath.startsWith(imagesDir)) return res.status(403).send({ ok: false, error: "forbidden" })
      if (!fs.existsSync(filePath)) return res.status(404).send({ ok: false, error: "not found" })

      const ext = path.extname(filename).toLowerCase()
      const ALLOWED_IMAGE_EXTS: Record<string, string> = {
        ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
        ".gif": "image/gif", ".webp": "image/webp",
      }
      if (!ALLOWED_IMAGE_EXTS[ext]) return res.status(400).send({ ok: false, error: "unsupported image type" })
      res.setHeader("Content-Type", ALLOWED_IMAGE_EXTS[ext])
      res.setHeader("X-Content-Type-Options", "nosniff")
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable")
      res.setHeader("Content-Length", fs.statSync(filePath).size)
      fs.createReadStream(filePath).pipe(res)
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "failed" })
    }
  })

  app.get("/subjects/:id/smartnotes/:filename", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const filename = path.basename(req.params.filename)
      const smartnotesDir = path.join(getSubjectDir(subjectId), "smartnotes")
      const filePath = path.resolve(smartnotesDir, filename)
      if (!filePath.startsWith(smartnotesDir)) return res.status(403).send({ ok: false, error: "forbidden" })
      if (!fs.existsSync(filePath)) return res.status(404).send({ ok: false, error: "not found" })

      const stat = fs.statSync(filePath)
      const contentType = filename.endsWith(".md") ? "text/markdown; charset=utf-8" : "application/pdf"
      res.setHeader("Content-Type", contentType)
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`)
      res.setHeader("Content-Length", stat.size)
      res.setHeader("X-Content-Type-Options", "nosniff")
      fs.createReadStream(filePath).pipe(res)
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "failed" })
    }
  })

  app.get("/subjects/:id/research/:filename", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const filename = path.basename(req.params.filename)
      const researchDir = path.join(getSubjectDir(subjectId), "research")
      const filePath = path.resolve(researchDir, filename)
      if (!filePath.startsWith(researchDir)) return res.status(403).send({ ok: false, error: "forbidden" })
      if (!fs.existsSync(filePath)) return res.status(404).send({ ok: false, error: "not found" })

      const stat = fs.statSync(filePath)
      res.setHeader("Content-Type", "text/markdown; charset=utf-8")
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`)
      res.setHeader("Content-Length", stat.size)
      res.setHeader("X-Content-Type-Options", "nosniff")
      fs.createReadStream(filePath).pipe(res)
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "failed" })
    }
  })
}
