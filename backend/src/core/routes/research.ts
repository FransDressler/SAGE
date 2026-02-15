import { handleResearch } from "../../services/research"
import { parseInstructions } from "../../lib/prompts/instructions"
import { emitToAll } from "../../utils/chat/ws"
import { withTimeout } from "../../utils/quiz/promise"
import { resolveOverride } from "../../utils/llm/models"
import { addTool } from "../../utils/subjects/subjects"
import { config } from "../../config/env"
import crypto from "crypto"
import path from "path"

const ns = new Map<string, Set<any>>()
const rlog = (...a: any) => console.log("[research]", ...a)

export function researchRoutes(app: any) {
  app.ws("/ws/research", (ws: any, req: any) => {
    const u = new URL(req.url, "http://localhost")
    const id = u.searchParams.get("researchId")
    if (!id) return ws.close(1008, "researchId required")

    let s = ns.get(id)
    if (!s) {
      s = new Set()
      ns.set(id, s)
    }
    s.add(ws)

    rlog("ws open", id, "clients:", s.size)
    ws.send(JSON.stringify({ type: "ready", researchId: id }))

    ws.on("error", (e: any) => rlog("ws err", id, e?.message || e))
    ws.on("close", () => {
      s!.delete(ws)
      if (s!.size === 0) ns.delete(id)
      rlog("ws close", id, "left:", s!.size)
    })

    const iv = setInterval(() => {
      try {
        if (ws.readyState === 1)
          ws.send(JSON.stringify({ type: "ping", t: Date.now() }))
      } catch {}
    }, 15000)
    ws.on("close", () => clearInterval(iv))
  })

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  app.post("/subjects/:id/research", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const { topic, depth, sourceIds } = req.body || {}
      const instructions = parseInstructions(req.body?.instructions)
      if (!topic || typeof topic !== "string" || topic.length > 500) {
        return res.status(400).send({ ok: false, error: "Provide a topic (max 500 chars)" })
      }

      const VALID_DEPTHS = ["quick", "standard", "comprehensive"]
      const validDepth = VALID_DEPTHS.includes(depth) ? depth : "standard"

      let validSourceIds: string[] | undefined
      if (Array.isArray(sourceIds)) {
        validSourceIds = sourceIds.filter((id: any) => typeof id === "string" && UUID_RE.test(id)).slice(0, 100)
        if (validSourceIds.length === 0) validSourceIds = undefined
      }

      const llmOverride = resolveOverride(req.body)
      const researchId = crypto.randomUUID()
      rlog("start", researchId, "input:", { topic, depth: validDepth, sourceIds: validSourceIds })

      res.status(202).send({ ok: true, researchId, stream: `/ws/research?researchId=${researchId}` })

      setImmediate(async () => {
        try {
          const result = await withTimeout(
            handleResearch({
              topic, depth: validDepth, subjectId, sourceIds: validSourceIds, instructions,
              onProgress: (phase, detail) => {
                emitToAll(ns.get(researchId), { type: "phase", value: phase, detail })
              },
            }, llmOverride),
            600000,
            "handleResearch"
          )
          const filename = path.basename(result.file)
          rlog("generated", researchId, result.file)
          emitToAll(ns.get(researchId), {
            type: "file",
            file: `${config.baseUrl}/subjects/${subjectId}/research/${filename}`,
          })

          try {
            await addTool(subjectId, {
              id: researchId,
              tool: "research",
              topic: topic || "Research",
              config: { depth },
              createdAt: Date.now(),
              result: { type: "research", filename },
            })
          } catch (pe) { rlog("persist failed", researchId, pe) }

          emitToAll(ns.get(researchId), { type: "done" })
          ns.delete(researchId)
          rlog("done", researchId)
        } catch (e: any) {
          rlog("error", researchId, e?.message || e)
          emitToAll(ns.get(researchId), {
            type: "error",
            error: e?.message || "failed",
          })
          ns.delete(researchId)
        }
      })
    } catch (e: any) {
      rlog("500 route err", e?.message || e)
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })
}
