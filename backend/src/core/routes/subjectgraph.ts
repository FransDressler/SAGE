import {
  getSubjectGraph,
  expandSubjectGraph,
  rebuildSubjectGraph,
  editMindmapWithAI,
  updateSubjectGraph,
} from "../../services/subjectgraph"
import { getSubject } from "../../utils/subjects/subjects"
import { emitToAll } from "../../utils/chat/ws"
import { resolveOverride } from "../../utils/llm/models"
import crypto from "crypto"

const sessions = new Map<string, Set<any>>()
const glog = (...a: any) => console.log("[subjectgraph]", ...a)

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function subjectGraphRoutes(app: any) {
  // WebSocket endpoint
  app.ws("/ws/subjectgraph", (ws: any, req: any) => {
    const u = new URL(req.url, "http://localhost")
    const subjectId = u.searchParams.get("subjectId")
    if (!subjectId) return ws.close(1008, "subjectId required")

    const key = `graph:${subjectId}`
    let s = sessions.get(key)
    if (!s) {
      s = new Set()
      sessions.set(key, s)
    }
    s.add(ws)

    glog("ws open", subjectId, "clients:", s.size)
    ws.send(JSON.stringify({ type: "ready", subjectId }))

    ws.on("error", (e: any) => glog("ws err", subjectId, e?.message || e))
    ws.on("close", () => {
      const set = sessions.get(key)
      if (set) {
        set.delete(ws)
        if (set.size === 0) sessions.delete(key)
        glog("ws close", subjectId, "left:", set.size)
      }
    })

    const iv = setInterval(() => {
      try {
        if (ws.readyState === 1) ws.send(JSON.stringify({ type: "ping", t: Date.now() }))
      } catch {}
    }, 15000)
    ws.on("close", () => clearInterval(iv))
  })

  function wsKey(subjectId: string) {
    return `graph:${subjectId}`
  }

  // GET /subjects/:id/graph — return current graph
  app.get("/subjects/:id/graph", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })

      const graph = await getSubjectGraph(subjectId)
      if (!graph) return res.send({ ok: true, data: null })
      res.send({ ok: true, data: graph })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  // POST /subjects/:id/graph/expand — incremental expand
  app.post("/subjects/:id/graph/expand", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })

      const subject = await getSubject(subjectId)
      if (!subject) return res.status(404).send({ ok: false, error: "subject not found" })

      const sourceIds = req.body?.sourceIds as string[] | undefined
      if (!sourceIds || !Array.isArray(sourceIds) || sourceIds.length === 0) {
        return res.status(400).send({ ok: false, error: "sourceIds required" })
      }

      const llmOverride = resolveOverride(req.body)
      const graphId = crypto.randomUUID()
      glog("expand start", graphId, "subject:", subjectId, "sources:", sourceIds.length)

      res.status(202).send({ ok: true, graphId })

      setImmediate(async () => {
        try {
          const data = await expandSubjectGraph(subjectId, sourceIds, llmOverride, (phase, detail) => {
            emitToAll(sessions.get(wsKey(subjectId)), { type: "phase", value: phase, detail })
          })
          emitToAll(sessions.get(wsKey(subjectId)), { type: "graph", data })
          emitToAll(sessions.get(wsKey(subjectId)), { type: "done" })
          glog("expand done", graphId, "nodes:", data.nodes.length)
        } catch (e: any) {
          glog("expand error", graphId, e?.message || e)
          emitToAll(sessions.get(wsKey(subjectId)), { type: "error", error: e?.message || "failed" })
        }
      })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  // POST /subjects/:id/graph/rebuild — full rebuild
  app.post("/subjects/:id/graph/rebuild", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })

      const subject = await getSubject(subjectId)
      if (!subject) return res.status(404).send({ ok: false, error: "subject not found" })

      const llmOverride = resolveOverride(req.body)
      const graphId = crypto.randomUUID()
      glog("rebuild start", graphId, "subject:", subjectId)

      res.status(202).send({ ok: true, graphId })

      setImmediate(async () => {
        try {
          const data = await rebuildSubjectGraph(subjectId, llmOverride, (phase, detail) => {
            emitToAll(sessions.get(wsKey(subjectId)), { type: "phase", value: phase, detail })
          })
          emitToAll(sessions.get(wsKey(subjectId)), { type: "graph", data })
          emitToAll(sessions.get(wsKey(subjectId)), { type: "done" })
          glog("rebuild done", graphId, "nodes:", data.nodes.length)
        } catch (e: any) {
          glog("rebuild error", graphId, e?.message || e)
          emitToAll(sessions.get(wsKey(subjectId)), { type: "error", error: e?.message || "failed" })
        }
      })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  // PATCH /subjects/:id/graph/ai-edit — AI edit
  app.patch("/subjects/:id/graph/ai-edit", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })

      const { instruction, currentData } = req.body || {}
      if (!instruction || typeof instruction !== "string") {
        return res.status(400).send({ ok: false, error: "instruction required" })
      }
      if (instruction.length > 2000) {
        return res.status(400).send({ ok: false, error: "instruction too long (max 2000 chars)" })
      }
      if (!currentData || !Array.isArray(currentData.nodes)) {
        return res.status(400).send({ ok: false, error: "currentData required" })
      }

      const llmOverride = resolveOverride(req.body)
      const newData = await editMindmapWithAI(currentData, instruction, subjectId, llmOverride)

      await updateSubjectGraph(subjectId, newData)

      res.send({ ok: true, data: newData })
    } catch (e: any) {
      glog("ai-edit err", e?.message || e)
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })
}

// Exported for use in source upload hook
export function emitGraphUpdate(subjectId: string, data: any) {
  emitToAll(sessions.get(`graph:${subjectId}`), { type: "graph", data })
}
