import {
  getStudyPlan,
  saveStudyPlan,
  deleteStudyPlan,
  addTopic,
  deleteTopic,
  addSubtopic,
  deleteSubtopic,
  generatePlanStructure,
  generateSubtopicContent,
  generateAllContent,
} from "../../services/studyplan"
import { getSubject } from "../../utils/subjects/subjects"
import { emitToAll } from "../../utils/chat/ws"
import { resolveOverride } from "../../utils/llm/models"

const sessions = new Map<string, Set<any>>()
const slog = (...a: any) => console.log("[studyplan]", ...a)

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function studyPlanRoutes(app: any) {
  // WebSocket endpoint
  app.ws("/ws/studyplan", (ws: any, req: any) => {
    const u = new URL(req.url, "http://localhost")
    const subjectId = u.searchParams.get("subjectId")
    if (!subjectId) return ws.close(1008, "subjectId required")

    const key = `studyplan:${subjectId}`
    let s = sessions.get(key)
    if (!s) {
      s = new Set()
      sessions.set(key, s)
    }
    s.add(ws)

    slog("ws open", subjectId, "clients:", s.size)
    ws.send(JSON.stringify({ type: "ready", subjectId }))

    ws.on("error", (e: any) => slog("ws err", subjectId, e?.message || e))
    ws.on("close", () => {
      const set = sessions.get(key)
      if (set) {
        set.delete(ws)
        if (set.size === 0) sessions.delete(key)
        slog("ws close", subjectId, "left:", set.size)
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
    return `studyplan:${subjectId}`
  }

  // GET /subjects/:id/studyplan
  app.get("/subjects/:id/studyplan", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const plan = await getStudyPlan(subjectId)
      res.send({ ok: true, plan: plan || null })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  // DELETE /subjects/:id/studyplan
  app.delete("/subjects/:id/studyplan", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const ok = await deleteStudyPlan(subjectId)
      if (!ok) return res.status(404).send({ ok: false, error: "no plan found" })
      res.send({ ok: true })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  // PUT /subjects/:id/studyplan
  app.put("/subjects/:id/studyplan", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const plan = req.body
      if (!plan || !Array.isArray(plan.topics)) return res.status(400).send({ ok: false, error: "invalid plan" })
      await saveStudyPlan(subjectId, plan)
      res.send({ ok: true })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  // POST /subjects/:id/studyplan/generate — generate plan structure
  app.post("/subjects/:id/studyplan/generate", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const subject = await getSubject(subjectId)
      if (!subject) return res.status(404).send({ ok: false, error: "subject not found" })

      const llmOverride = resolveOverride(req.body)
      const { primarySourceIds, backgroundSourceIds, prompt } = req.body || {}
      res.status(202).send({ ok: true })

      setImmediate(async () => {
        try {
          const plan = await generatePlanStructure(subjectId, llmOverride, (phase, detail) => {
            emitToAll(sessions.get(wsKey(subjectId)), { type: "phase", value: phase, detail })
          }, { primarySourceIds, backgroundSourceIds, prompt })
          emitToAll(sessions.get(wsKey(subjectId)), { type: "plan", plan })
          emitToAll(sessions.get(wsKey(subjectId)), { type: "done" })
          slog("generate structure done", subjectId, "topics:", plan.topics.length)
        } catch (e: any) {
          slog("generate structure error", subjectId, e?.message || e)
          emitToAll(sessions.get(wsKey(subjectId)), { type: "error", error: e?.message || "failed" })
        }
      })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  // POST /subjects/:id/studyplan/topics — add topic
  app.post("/subjects/:id/studyplan/topics", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const { title } = req.body || {}
      if (!title || typeof title !== "string") return res.status(400).send({ ok: false, error: "title required" })
      const topic = await addTopic(subjectId, title.trim())
      res.send({ ok: true, topic })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  // DELETE /subjects/:id/studyplan/topics/:topicId
  app.delete("/subjects/:id/studyplan/topics/:topicId", async (req: any, res: any) => {
    try {
      const { id: subjectId, topicId } = req.params
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const ok = await deleteTopic(subjectId, topicId)
      if (!ok) return res.status(404).send({ ok: false, error: "not found" })
      res.send({ ok: true })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  // POST /subjects/:id/studyplan/topics/:topicId/subtopics — add subtopic
  app.post("/subjects/:id/studyplan/topics/:topicId/subtopics", async (req: any, res: any) => {
    try {
      const { id: subjectId, topicId } = req.params
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const { title } = req.body || {}
      if (!title || typeof title !== "string") return res.status(400).send({ ok: false, error: "title required" })
      const subtopic = await addSubtopic(subjectId, topicId, title.trim())
      if (!subtopic) return res.status(404).send({ ok: false, error: "topic not found" })
      res.send({ ok: true, subtopic })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  // DELETE /subjects/:id/studyplan/topics/:topicId/subtopics/:subtopicId
  app.delete("/subjects/:id/studyplan/topics/:topicId/subtopics/:subtopicId", async (req: any, res: any) => {
    try {
      const { id: subjectId, topicId, subtopicId } = req.params
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const ok = await deleteSubtopic(subjectId, topicId, subtopicId)
      if (!ok) return res.status(404).send({ ok: false, error: "not found" })
      res.send({ ok: true })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  // POST /subjects/:id/studyplan/subtopic/:topicId/:subtopicId/generate — generate single subtopic content
  app.post("/subjects/:id/studyplan/subtopic/:topicId/:subtopicId/generate", async (req: any, res: any) => {
    try {
      const { id: subjectId, topicId, subtopicId } = req.params
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })

      const llmOverride = resolveOverride(req.body)
      res.status(202).send({ ok: true })

      setImmediate(async () => {
        try {
          const content = await generateSubtopicContent(subjectId, topicId, subtopicId, llmOverride, (phase, detail) => {
            emitToAll(sessions.get(wsKey(subjectId)), { type: "phase", value: phase, detail })
          })
          emitToAll(sessions.get(wsKey(subjectId)), { type: "subtopic-content", topicId, subtopicId, content })
          emitToAll(sessions.get(wsKey(subjectId)), { type: "done" })
        } catch (e: any) {
          slog("subtopic generate error", subtopicId, e?.message || e)
          emitToAll(sessions.get(wsKey(subjectId)), { type: "error", error: e?.message || "failed" })
        }
      })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  // POST /subjects/:id/studyplan/generate-all-content — generate all empty subtopics
  app.post("/subjects/:id/studyplan/generate-all-content", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })

      const llmOverride = resolveOverride(req.body)
      res.status(202).send({ ok: true })

      setImmediate(async () => {
        try {
          const plan = await generateAllContent(subjectId, llmOverride, (phase, detail) => {
            emitToAll(sessions.get(wsKey(subjectId)), { type: "phase", value: phase, detail })
          })
          emitToAll(sessions.get(wsKey(subjectId)), { type: "plan", plan })
          emitToAll(sessions.get(wsKey(subjectId)), { type: "done" })
          slog("generate-all done", subjectId)
        } catch (e: any) {
          slog("generate-all error", subjectId, e?.message || e)
          emitToAll(sessions.get(wsKey(subjectId)), { type: "error", error: e?.message || "failed" })
        }
      })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })
}
