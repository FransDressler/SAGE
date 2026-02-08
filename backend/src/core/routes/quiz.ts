import { handleQuiz } from "../../services/quiz";
import { parseInstructions } from "../../lib/prompts/instructions";
import { emitToAll } from "../../utils/chat/ws";
import { withTimeout } from "../../utils/quiz/promise";
import { resolveOverride } from "../../utils/llm/models";
import { addTool } from "../../utils/subjects/subjects";
import crypto from "crypto";

const qs = new Map<string, Set<any>>();
const qlog = (...a: any) => console.log("[quiz]", ...a);

export function quizRoutes(app: any) {
  app.ws("/ws/quiz", (ws: any, req: any) => {
    const u = new URL(req.url, "http://localhost");
    const id = u.searchParams.get("quizId");
    if (!id) return ws.close(1008, "quizId required");

    let s = qs.get(id);
    if (!s) {
      s = new Set();
      qs.set(id, s);
    }
    s.add(ws);

    qlog("ws open", id, "clients:", s.size);
    ws.send(JSON.stringify({ type: "ready", quizId: id }));

    ws.on("error", (e: any) => qlog("ws err", id, e?.message || e));
    ws.on("close", () => {
      s!.delete(ws);
      if (s!.size === 0) qs.delete(id);
      qlog("ws close", id, "left:", s!.size);
    });

    const iv = setInterval(() => {
      try {
        if (ws.readyState === 1)
          ws.send(JSON.stringify({ type: "ping", t: Date.now() }));
      } catch {}
    }, 15000);
    ws.on("close", () => clearInterval(iv));
  });

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  app.post("/subjects/:id/quiz", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id;
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" });
      const topic = String(req.body?.topic || "").trim();
      if (!topic)
        return res.status(400).send({ ok: false, error: "topic required" });

      const difficulty = req.body?.difficulty;
      const length = req.body?.length ? Number(req.body.length) : undefined;
      const instructions = parseInstructions(req.body?.instructions);
      const llmOverride = resolveOverride(req.body);
      const quizId = crypto.randomUUID();
      qlog("start", quizId, "topic:", topic, "difficulty:", difficulty, "length:", length);

      res
        .status(202)
        .send({ ok: true, quizId, stream: `/ws/quiz?quizId=${quizId}` });

      const count = length || 5;
      const timeoutMs = Math.max(120000, count * 20000);
      setImmediate(async () => {
        try {
          emitToAll(qs.get(quizId), { type: "phase", value: "generating" });
          const qz = await withTimeout(handleQuiz(topic, llmOverride, { difficulty, length, instructions }), timeoutMs, "handleQuiz");
          qlog("generated", quizId, Array.isArray(qz) ? qz.length : "n/a");
          emitToAll(qs.get(quizId), { type: "quiz", quiz: qz });
          emitToAll(qs.get(quizId), { type: "done" });

          try {
            await addTool(subjectId, {
              id: quizId,
              tool: "quiz",
              topic,
              config: { difficulty, length: length != null ? String(length) : undefined },
              createdAt: Date.now(),
              result: { type: "quiz", questions: Array.isArray(qz) ? qz : [] },
            });
          } catch (pe) { qlog("persist failed", quizId, pe); }

          qlog("done", quizId);
        } catch (e: any) {
          qlog("error", quizId, e?.message || e);
          emitToAll(qs.get(quizId), {
            type: "error",
            error: e?.message || "failed",
          });
        }
      });
    } catch (e: any) {
      qlog("500 route err", e?.message || e);
      res.status(500).send({ ok: false, error: e?.message || "internal" });
    }
  });
}
