import path from "path"
import fs from "fs"
import { makeScript, makeAudio } from "../../services/podcast"
import { parseInstructions } from "../../lib/prompts/instructions"
import { emitToAll } from "../../utils/chat/ws"
import { resolveOverride } from "../../utils/llm/models"
import { addTool } from "../../utils/subjects/subjects"
import { config } from "../../config/env"

const sockets = new Map<string, Set<any>>()
const pendingJobs = new Map<string, () => Promise<void>>()

function emit(id: string, msg: any) {
  const s = sockets.get(id)
  emitToAll(s, msg)
}

async function startJobIfReady(pid: string) {
  const job = pendingJobs.get(pid)
  const hasSockets = sockets.has(pid) && sockets.get(pid)!.size > 0

  if (job && hasSockets) {
    pendingJobs.delete(pid)
    try {
      await job()
    } catch (err) {
      emit(pid, { type: "error", error: String(err) })
    }
  }
}

export function podcastRoutes(app: any) {
  app.ws("/ws/podcast", (ws: any, req: any) => {
    const u = new URL(req.url, config.baseUrl || "http://dummy")
    const pid = u.searchParams.get("pid")

    if (!pid) {
      return ws.close(1008, "pid required")
    }

    let set = sockets.get(pid)
    if (!set) {
      set = new Set()
      sockets.set(pid, set)
    }
    set.add(ws)

    ws.on("close", () => {
      set!.delete(ws)
      if (set!.size === 0) {
        sockets.delete(pid)
      }
    })

    const readyMsg = JSON.stringify({ type: "ready", pid })
    ws.send(readyMsg)

    setTimeout(() => {
      startJobIfReady(pid).catch(err => {
        console.error(`[Podcast WS] Error starting job:`, err)
      })
    }, 100)
  })

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  app.post("/subjects/:id/podcast", async (req: any, res: any, next: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const topic = String(req.body?.topic || req.body?.title || "").trim()

      if (!topic) {
        return res.status(400).send({ error: "topic required" })
      }

      const llmOverride = resolveOverride(req.body)
      const length = req.body?.length as string | undefined
      const instructions = parseInstructions(req.body?.instructions)
      const pid = cryptoRandom()
      const dir = path.join(process.cwd(), "subjects", subjectId, "podcasts", pid)
      const base = topic.replace(/[^a-z0-9]/gi, "_").slice(0, 50) || "podcast"

      res.status(202).send({ ok: true, pid, stream: `/ws/podcast?pid=${pid}` })

      const job = async () => {
        try {
          const script = await makeScript(topic, topic, llmOverride, length, instructions)
          emit(pid, { type: "script", data: script })

          const outPath = await makeAudio(script, dir, base, (m) => {
            emit(pid, m)
          })
          if (!fs.existsSync(outPath)) {
            throw new Error(`Audio file not created at ${outPath}`)
          }
          const filename = path.basename(outPath)
          const downloadUrl = `${config.baseUrl}/subjects/${subjectId}/podcast/download/${pid}/${filename}`
          const rel = path.relative(process.cwd(), outPath).split(path.sep).join("/")
          const staticUrl = `${config.baseUrl}/${rel}`

          const audioMessage = {
            type: "audio",
            file: downloadUrl,
            staticUrl: staticUrl,
            filename: filename,
          }
          emit(pid, audioMessage)

          try {
            await addTool(subjectId, {
              id: pid,
              tool: "podcast",
              topic,
              config: { length },
              createdAt: Date.now(),
              result: { type: "podcast", pid, filename },
            })
          } catch (pe) { console.error("[podcast] persist failed", pid, pe) }

          emit(pid, { type: "done" })
        } catch (e: any) {
          emit(pid, { type: "error", error: e?.message || "failed" })
        }
      }

      pendingJobs.set(pid, job)

      startJobIfReady(pid).catch(err => {
        console.error(`[Podcast POST] Error starting job:`, err)
      })
    } catch (e) {
      next(e)
    }
  })

  app.get("/subjects/:id/podcast/download/:pid/:filename", async (req: any, res: any, next: any) => {
    try {
      const { id: subjectId, pid } = req.params
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const filename = path.basename(req.params.filename)
      const dirPath = path.join(process.cwd(), "subjects", subjectId, "podcasts", pid)
      if (fs.existsSync(dirPath)) {
        const filesInDir = fs.readdirSync(dirPath)
        const actualFilename = filesInDir.find(f => f.toLowerCase() === filename.toLowerCase())
        if (actualFilename) {
          const filePath = path.join(dirPath, actualFilename)
          const fileStats = fs.statSync(filePath)

          res.setHeader('Content-Type', 'audio/mpeg')
          res.setHeader('Content-Disposition', `attachment; filename="${actualFilename}"`)
          res.setHeader('Content-Length', fileStats.size)

          const fileStream = fs.createReadStream(filePath)
          fileStream.pipe(res)
          fileStream.on('error', (err) => {
            if (!res.headersSent) {
              res.status(500).send({ error: 'Download failed' })
            }
          })
          return
        }
      }

      return res.status(404).send({ error: "File not found" })
    } catch (e) {
      next(e)
    }
  })
}

function cryptoRandom() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
