import { generateMindmap, editMindmapWithAI } from "../../services/mindmap"
import { parseInstructions } from "../../lib/prompts/instructions"
import { emitToAll } from "../../utils/chat/ws"
import { resolveOverride } from "../../utils/llm/models"
import { addTool, listTools, getSubject, updateTool } from "../../utils/subjects/subjects"
import crypto from "crypto"

const sessions = new Map<string, Set<any>>()
const mlog = (...a: any) => console.log("[mindmap]", ...a)

export function mindmapRoutes(app: any) {
  app.ws("/ws/mindmap", (ws: any, req: any) => {
    const u = new URL(req.url, "http://localhost")
    const id = u.searchParams.get("mindmapId")
    if (!id) return ws.close(1008, "mindmapId required")

    let s = sessions.get(id)
    if (!s) {
      s = new Set()
      sessions.set(id, s)
    }
    s.add(ws)

    mlog("ws open", id, "clients:", s.size)
    ws.send(JSON.stringify({ type: "ready", mindmapId: id }))

    ws.on("error", (e: any) => mlog("ws err", id, e?.message || e))
    ws.on("close", () => {
      const set = sessions.get(id)
      if (set) {
        set.delete(ws)
        if (set.size === 0) sessions.delete(id)
        mlog("ws close", id, "left:", set.size)
      }
    })

    const iv = setInterval(() => {
      try {
        if (ws.readyState === 1) ws.send(JSON.stringify({ type: "ping", t: Date.now() }))
      } catch {}
    }, 15000)
    ws.on("close", () => clearInterval(iv))
  })

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  app.post("/subjects/:id/mindmap", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })

      const subject = await getSubject(subjectId)
      if (!subject) return res.status(404).send({ ok: false, error: "subject not found" })

      const llmOverride = resolveOverride(req.body)
      const topic = req.body?.topic as string | undefined
      const sourceIds = req.body?.sourceIds as string[] | undefined
      const instructions = parseInstructions(req.body?.instructions)
      const mindmapId = crypto.randomUUID()
      mlog("start", mindmapId, "subject:", subjectId)

      res.status(202).send({ ok: true, mindmapId, stream: `/ws/mindmap?mindmapId=${mindmapId}` })

      setImmediate(async () => {
        try {
          const data = await generateMindmap(subjectId, llmOverride, (phase, detail) => {
            emitToAll(sessions.get(mindmapId), { type: "phase", value: phase, detail })
          }, { topic, sourceIds, instructions })

          emitToAll(sessions.get(mindmapId), { type: "mindmap", data })
          emitToAll(sessions.get(mindmapId), { type: "done" })

          try {
            await addTool(subjectId, {
              id: mindmapId,
              tool: "mindmap",
              topic: topic || "Knowledge Map",
              config: { nodeCount: String(data.nodes.length), edgeCount: String(data.edges.length) },
              createdAt: Date.now(),
              result: { type: "mindmap", data },
            })
          } catch (pe) { mlog("persist failed", mindmapId, pe) }

          mlog("done", mindmapId, "nodes:", data.nodes.length, "edges:", data.edges.length)
        } catch (e: any) {
          mlog("error", mindmapId, e?.message || e)
          emitToAll(sessions.get(mindmapId), { type: "error", error: e?.message || "failed" })
        }
      })
    } catch (e: any) {
      mlog("500 route err", e?.message || e)
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  app.get("/subjects/:id/mindmap", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })

      const tools = await listTools(subjectId)
      const mindmap = tools.find(t => t.tool === "mindmap")
      if (!mindmap) return res.status(404).send({ ok: false, error: "no mindmap generated" })

      res.send({ ok: true, data: (mindmap.result as any).data })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  function validateMindmapData(data: any): string | null {
    if (!Array.isArray(data?.nodes)) return "nodes must be an array"
    if (!Array.isArray(data?.edges)) return "edges must be an array"
    if (data.nodes.length > 500) return "too many nodes (max 500)"
    if (data.edges.length > 2000) return "too many edges (max 2000)"
    for (const n of data.nodes) {
      if (!n?.id || typeof n.id !== "string") return "invalid node id"
      if (typeof n.label === "string" && n.label.length > 200) return "node label too long"
      if (typeof n.description === "string" && n.description.length > 2000) return "node description too long"
    }
    return null
  }

  app.patch("/subjects/:id/mindmap", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })

      const { toolId, data } = req.body || {}
      if (!toolId || typeof toolId !== "string") {
        return res.status(400).send({ ok: false, error: "toolId required" })
      }
      if (!UUID_RE.test(toolId)) return res.status(400).send({ ok: false, error: "invalid toolId" })

      const err = validateMindmapData(data)
      if (err) return res.status(400).send({ ok: false, error: err })

      const updated = await updateTool(subjectId, toolId, { type: "mindmap", data })
      if (!updated) return res.status(404).send({ ok: false, error: "tool not found" })

      res.send({ ok: true })
    } catch (e: any) {
      mlog("patch err", e?.message || e)
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  app.patch("/subjects/:id/mindmap/ai-edit", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })

      const { toolId, instruction, currentData } = req.body || {}
      if (!instruction || typeof instruction !== "string") {
        return res.status(400).send({ ok: false, error: "instruction required" })
      }
      if (instruction.length > 2000) {
        return res.status(400).send({ ok: false, error: "instruction too long (max 2000 chars)" })
      }
      if (toolId && !UUID_RE.test(toolId)) {
        return res.status(400).send({ ok: false, error: "invalid toolId" })
      }

      const dataErr = validateMindmapData(currentData)
      if (dataErr) return res.status(400).send({ ok: false, error: dataErr })

      const llmOverride = resolveOverride(req.body)
      const newData = await editMindmapWithAI(currentData, instruction, llmOverride)

      if (toolId) {
        await updateTool(subjectId, toolId, { type: "mindmap", data: newData }).catch(e =>
          mlog("ai-edit persist failed", e?.message)
        )
      }

      res.send({ ok: true, data: newData })
    } catch (e: any) {
      mlog("ai-edit err", e?.message || e)
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  app.delete("/subjects/:id/mindmap", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })

      const tools = await listTools(subjectId)
      const mindmap = tools.find(t => t.tool === "mindmap")
      if (!mindmap) return res.status(404).send({ ok: false, error: "no mindmap found" })

      const { deleteTool } = await import("../../utils/subjects/subjects")
      await deleteTool(subjectId, mindmap.id)
      res.send({ ok: true })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })
}
