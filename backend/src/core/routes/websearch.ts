import { randomUUID } from "crypto"
import { getSubject } from "../../utils/subjects/subjects"
import { runWebSearch } from "../../services/websearch"
import type { SearchMode, WebSearchProgress } from "../../services/websearch"
import { emitToAll } from "../../utils/chat/ws"
import { config } from "../../config/env"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const sockets = new Map<string, Set<any>>()
const pendingJobs = new Map<string, () => Promise<void>>()

// Rate limiting: per-subject cooldowns
const cooldowns = new Map<string, number>()
const QUICK_COOLDOWN = 5000
const DEEP_COOLDOWN = 30000

function emit(id: string, msg: any) {
  emitToAll(sockets.get(id), msg)
}

async function startJobIfReady(jobId: string) {
  const job = pendingJobs.get(jobId)
  const hasSockets = sockets.has(jobId) && sockets.get(jobId)!.size > 0
  if (job && hasSockets) {
    pendingJobs.delete(jobId)
    try {
      await job()
    } catch (err: any) {
      emit(jobId, { type: "error", error: err?.message || String(err) })
    }
  }
}

export function websearchRoutes(app: any) {
  app.ws("/ws/websearch", (ws: any, req: any) => {
    const u = new URL(req.url, config.baseUrl || "http://dummy")
    const jobId = u.searchParams.get("jobId")

    if (!jobId) {
      return ws.close(1008, "jobId required")
    }

    let set = sockets.get(jobId)
    if (!set) {
      set = new Set()
      sockets.set(jobId, set)
    }
    set.add(ws)

    ws.on("close", () => {
      set!.delete(ws)
      if (set!.size === 0) sockets.delete(jobId)
    })

    ws.send(JSON.stringify({ type: "ready", jobId }))

    setTimeout(() => {
      startJobIfReady(jobId).catch(err => {
        console.error("[WebSearch WS] Error starting job:", err)
      })
    }, 100)
  })

  app.post("/subjects/:id/websearch", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) {
        return res.status(400).send({ ok: false, error: "invalid id" })
      }

      const subject = await getSubject(subjectId)
      if (!subject) {
        return res.status(404).send({ ok: false, error: "subject not found" })
      }

      const query = String(req.body?.query || "").trim()
      if (!query) {
        return res.status(400).send({ ok: false, error: "query required" })
      }
      if (query.length > 500) {
        return res.status(400).send({ ok: false, error: "Query must be under 500 characters" })
      }

      const mode: SearchMode = req.body?.mode === "deep" ? "deep" : "quick"

      // Check cooldown
      const lastRun = cooldowns.get(subjectId) || 0
      const cooldown = mode === "deep" ? DEEP_COOLDOWN : QUICK_COOLDOWN
      const elapsed = Date.now() - lastRun
      if (elapsed < cooldown) {
        const waitSec = Math.ceil((cooldown - elapsed) / 1000)
        return res.status(429).send({ ok: false, error: `Please wait ${waitSec}s before searching again.` })
      }

      if (!config.tavily_api_key) {
        return res.status(503).send({ ok: false, error: "Web search is not configured. Set TAVILY_API_KEY in .env." })
      }

      const jobId = randomUUID()
      cooldowns.set(subjectId, Date.now())

      res.status(202).send({
        ok: true,
        jobId,
        stream: `/ws/websearch?jobId=${jobId}`,
      })

      const job = async () => {
        try {
          await runWebSearch(subjectId, query, mode, (evt: WebSearchProgress) => {
            emit(jobId, evt)
          })
        } catch (err: any) {
          emit(jobId, { type: "error", error: err?.message || "Web search failed" })
        }
      }

      pendingJobs.set(jobId, job)
      // Abandon job if WebSocket never connects within 60s
      setTimeout(() => { pendingJobs.delete(jobId) }, 60000)
      startJobIfReady(jobId).catch(err => {
        console.error("[WebSearch POST] Error starting job:", err)
      })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "failed" })
    }
  })
}
