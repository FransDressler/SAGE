import { handleSmartNotes } from "../../services/smartnotes";
import { parseInstructions } from "../../lib/prompts/instructions";
import { emitToAll } from "../../utils/chat/ws";
import { withTimeout } from "../../utils/quiz/promise";
import { resolveOverride } from "../../utils/llm/models";
import { addTool } from "../../utils/subjects/subjects";
import { config } from "../../config/env";
import crypto from "crypto";
import path from "path";

const ns = new Map<string, Set<any>>();
const nlog = (...a: any) => console.log("[smartnotes]", ...a);

export function smartnotesRoutes(app: any) {
  app.ws("/ws/smartnotes", (ws: any, req: any) => {
    const u = new URL(req.url, "http://localhost");
    const id = u.searchParams.get("noteId");
    if (!id) return ws.close(1008, "noteId required");

    let s = ns.get(id);
    if (!s) {
      s = new Set();
      ns.set(id, s);
    }
    s.add(ws);

    nlog("ws open", id, "clients:", s.size);
    ws.send(JSON.stringify({ type: "ready", noteId: id }));

    ws.on("error", (e: any) => nlog("ws err", id, e?.message || e));
    ws.on("close", () => {
      s!.delete(ws);
      if (s!.size === 0) ns.delete(id);
      nlog("ws close", id, "left:", s!.size);
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

  app.post("/subjects/:id/smartnotes", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id;
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" });
      const { topic, notes, filePath, length, sourceIds } = req.body || {};
      const instructions = parseInstructions(req.body?.instructions);
      if (!topic && !notes && !filePath) {
        return res
          .status(400)
          .send({ ok: false, error: "Provide topic, notes, or filePath" });
      }

      const llmOverride = resolveOverride(req.body);
      const noteId = crypto.randomUUID();
      nlog("start", noteId, "input:", { topic, notes, filePath, length, sourceIds });

      res
        .status(202)
        .send({ ok: true, noteId, stream: `/ws/smartnotes?noteId=${noteId}` });

      setImmediate(async () => {
        try {
          emitToAll(ns.get(noteId), { type: "phase", value: "generating" });
          const result = await withTimeout(
            handleSmartNotes({ topic, notes, filePath, length, subjectId, sourceIds, instructions }, llmOverride),
            120000,
            "handleSmartNotes"
          );
          const filename = path.basename(result.file);
          nlog("generated", noteId, result.file);
          emitToAll(ns.get(noteId), {
            type: "file",
            file: `${config.baseUrl}/subjects/${subjectId}/smartnotes/${filename}`,
          });

          try {
            await addTool(subjectId, {
              id: noteId,
              tool: "smartnotes",
              topic: topic || "Notes",
              config: { length },
              createdAt: Date.now(),
              result: { type: "smartnotes", filename },
            });
          } catch (pe) { nlog("persist failed", noteId, pe); }

          emitToAll(ns.get(noteId), { type: "done" });
          nlog("done", noteId);
        } catch (e: any) {
          nlog("error", noteId, e?.message || e);
          emitToAll(ns.get(noteId), {
            type: "error",
            error: e?.message || "failed",
          });
        }
      });
    } catch (e: any) {
      nlog("500 route err", e?.message || e);
      res.status(500).send({ ok: false, error: e?.message || "internal" });
    }
  });
}
