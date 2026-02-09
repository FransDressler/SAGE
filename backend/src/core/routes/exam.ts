import { handleExam, type ExamConfig } from "../../services/exam"
import { parseInstructions } from "../../lib/prompts/instructions"
import { emitToAll } from "../../utils/chat/ws"
import { withTimeout } from "../../utils/quiz/promise"
import { resolveOverride } from "../../utils/llm/models"
import { addTool } from "../../utils/subjects/subjects"
import crypto from "crypto"

const es = new Map<string, Set<any>>()
const elog = (...a: any) => console.log("[exam]", ...a)

export function examRoutes(app: any) {
  app.ws("/ws/exam", (ws: any, req: any) => {
    const u = new URL(req.url, "http://localhost")
    const id = u.searchParams.get("examId")
    if (!id) return ws.close(1008, "examId required")

    let s = es.get(id)
    if (!s) {
      s = new Set()
      es.set(id, s)
    }
    s.add(ws)

    elog("ws open", id, "clients:", s.size)
    ws.send(JSON.stringify({ type: "ready", examId: id }))

    ws.on("error", (e: any) => elog("ws err", id, e?.message || e))
    ws.on("close", () => {
      s!.delete(ws)
      if (s!.size === 0) es.delete(id)
      elog("ws close", id, "left:", s!.size)
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

  app.post("/subjects/:id/exam", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })

      const sourceIds = req.body?.sourceIds
      if (!Array.isArray(sourceIds) || sourceIds.length === 0) {
        return res.status(400).send({ ok: false, error: "sourceIds required (at least one)" })
      }

      const timeLimit = typeof req.body?.timeLimit === "number" ? req.body.timeLimit : 0
      const shuffleQ = !!req.body?.shuffle
      const maxQuestions = typeof req.body?.maxQuestions === "number" ? req.body.maxQuestions : undefined
      const instructions = parseInstructions(req.body?.instructions)
      const llmOverride = resolveOverride(req.body)
      const examId = crypto.randomUUID()

      elog("start", examId, "sources:", sourceIds.length, "timeLimit:", timeLimit, "shuffle:", shuffleQ)

      res
        .status(202)
        .send({ ok: true, examId, stream: `/ws/exam?examId=${examId}` })

      const config: ExamConfig = {
        sourceIds,
        timeLimit,
        shuffle: shuffleQ,
        maxQuestions,
        instructions,
      }

      const timeoutMs = Math.max(180000, sourceIds.length * 60000)
      setImmediate(async () => {
        try {
          const result = await withTimeout(
            handleExam(subjectId, config, llmOverride, (phase) => {
              emitToAll(es.get(examId), { type: "phase", value: phase })
            }),
            timeoutMs,
            "handleExam"
          )

          elog("generated", examId, result.questions.length, "questions")
          emitToAll(es.get(examId), { type: "exam", exam: result })
          emitToAll(es.get(examId), { type: "done" })

          try {
            await addTool(subjectId, {
              id: examId,
              tool: "exam",
              topic: `Exam (${result.questions.length} questions)`,
              config: {
                timeLimit: String(timeLimit),
                shuffle: String(shuffleQ),
                maxQuestions: maxQuestions != null ? String(maxQuestions) : undefined,
              },
              createdAt: Date.now(),
              result: {
                type: "exam",
                questions: result.questions,
                totalPoints: result.totalPoints,
                timeLimit: result.timeLimit,
              },
            })
          } catch (pe) { elog("persist failed", examId, pe) }

          elog("done", examId)
        } catch (e: any) {
          elog("error", examId, e?.message || e)
          emitToAll(es.get(examId), { type: "error", error: e?.message || "failed" })
        }
      })
    } catch (e: any) {
      elog("500 route err", e?.message || e)
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })
}
