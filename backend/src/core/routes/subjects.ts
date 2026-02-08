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
import { extractAndPrepare, embedPreparedFile, type PreparedFile } from "../../lib/parser/upload"
import { embedTextFromFile, type EmbedMeta } from "../../lib/ai/embed"
import { clearCollection } from "../../utils/database/db"
import { embeddings } from "../../utils/llm/llm"

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

      const bb = Busboy({ headers: req.headers })
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
              const prep = await extractAndPrepare(f.path, f.mimeType)
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
            sources.push(source)
            embedJobs.push({ source, prep, file: f })
          }

          // Respond with sources + any extraction warnings
          res.send({
            ok: true,
            sources,
            ...(errors.length > 0 && { warnings: errors }),
          })

          // Phase 2: Run embedding in the background
          for (const { source, prep, file: f } of embedJobs) {
            const meta: EmbedMeta = {
              sourceId: source.id,
              sourceFile: f.originalName,
              mimeType: f.mimeType,
              subjectId,
              sourceType,
            }
            embedPreparedFile(prep, ns, meta).catch(err =>
              console.error(`[embed] background embedding failed for ${f.originalName}:`, err?.message || err)
            )
          }
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

  app.delete("/subjects/:id/sources/:sourceId", async (req: any, res: any) => {
    try {
      if (!UUID_RE.test(req.params.id) || !UUID_RE.test(req.params.sourceId)) {
        return res.status(400).send({ ok: false, error: "invalid id" })
      }
      const ok = await removeSource(req.params.id, req.params.sourceId)
      if (!ok) return res.status(404).send({ ok: false, error: "source not found" })
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

      const sources = await listSources(subjectId)
      const ns = `subject:${subjectId}`
      const sourcesDir = getSourcesDir(subjectId)

      await clearCollection(ns, embeddings)

      let reindexed = 0
      for (const source of sources) {
        const txtPath = path.join(sourcesDir, source.filename + ".txt")
        if (!fs.existsSync(txtPath)) continue

        await embedTextFromFile(txtPath, ns, {
          sourceId: source.id,
          sourceFile: source.originalName,
          mimeType: source.mimeType,
          subjectId,
          sourceType: source.sourceType || "material",
        })
        reindexed++
      }

      res.send({ ok: true, reindexed })
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

  app.get("/subjects/:id/smartnotes/:filename", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const filename = path.basename(req.params.filename)
      const filePath = path.join(getSubjectDir(subjectId), "smartnotes", filename)
      if (!fs.existsSync(filePath)) return res.status(404).send({ ok: false, error: "not found" })

      const stat = fs.statSync(filePath)
      const contentType = filename.endsWith(".md") ? "text/markdown; charset=utf-8" : "application/pdf"
      res.setHeader("Content-Type", contentType)
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`)
      res.setHeader("Content-Length", stat.size)
      fs.createReadStream(filePath).pipe(res)
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "failed" })
    }
  })
}
