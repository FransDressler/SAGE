import { handleAsk } from "../../lib/ai/ask";
import { parseMultipart, handleUpload } from "../../lib/parser/upload";
import {
  mkChat,
  getChat,
  addMsg,
  listChats,
  getMsgs,
} from "../../utils/chat/chat";
import { emitToAll } from "../../utils/chat/ws";
import { resolveOverride } from "../../utils/llm/models";
import { getSubject } from "../../utils/subjects/subjects";

type UpFile = { path: string; filename: string; mimeType: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const chatSockets = new Map<string, Set<any>>();

export function chatRoutes(app: any) {
  app.ws("/ws/chat", (ws: any, req: any) => {
    const url = new URL(req.url, "http://localhost");
    const chatId = url.searchParams.get("chatId");
    if (!chatId) {
      return ws.close(1008, "chatId required");
    }

    let set = chatSockets.get(chatId);
    if (!set) {
      set = new Set();
      chatSockets.set(chatId, set);
    }
    set.add(ws);

    ws.on("close", (code: number, reason: string) => {
      set!.delete(ws);
      if (set!.size === 0) chatSockets.delete(chatId);
    });

    ws.send(JSON.stringify({ type: "ready", chatId }));
  });

  app.post("/subjects/:id/chat", async (req: any, res: any, next: any) => {
    const t0 = Date.now();
    const subjectId = req.params.id;
    if (!UUID_RE.test(subjectId)) {
      return res.status(400).send({ error: "invalid subject id" });
    }
    try {
      const ct = String(req.headers["content-type"] || "");
      const isMp = ct.includes("multipart/form-data");

      let q = "";
      let chatId: string | undefined;
      let files: UpFile[] = [];

      let llmOverride: ReturnType<typeof resolveOverride>;

      if (isMp) {
        const { q: mq, chatId: mcid, files: mf } = await parseMultipart(req);
        q = mq;
        chatId = mcid;
        files = mf || [];
        if (!q)
          return res.status(400).send({ error: "q required for file uploads" });
      } else {
        q = req.body?.q || "";
        chatId = req.body?.chatId;
        llmOverride = resolveOverride(req.body);
        if (!q) return res.status(400).send({ error: "q required" });
      }

      let chat = chatId ? await getChat(subjectId, chatId) : undefined;
      if (!chat) chat = await mkChat(subjectId, q);
      const id = chat.id;
      const ns = `subject:${subjectId}`;
      const subjectMeta = await getSubject(subjectId);
      const customPrompt = subjectMeta?.systemPrompt?.trim() || undefined;

      res
        .status(202)
        .send({ ok: true, chatId: id, stream: `/ws/chat?chatId=${id}` });
      setImmediate(async () => {
        try {
          if (isMp) {
            emitToAll(chatSockets.get(id), {
              type: "phase",
              value: "upload_start",
            });
            for (const f of files) {
              emitToAll(chatSockets.get(id), {
                type: "file",
                filename: f.filename,
                mime: f.mimeType,
              });
              await handleUpload({
                filePath: f.path,
                filename: f.filename,
                contentType: f.mimeType,
                namespace: ns,
              });
            }
            emitToAll(chatSockets.get(id), {
              type: "phase",
              value: "upload_done",
            });
          }

          await addMsg(subjectId, id, { role: "user", content: q, at: Date.now() });
          emitToAll(chatSockets.get(id), {
            type: "phase",
            value: "generating",
          });

          let answer: any = "";

          const msgHistory = await getMsgs(subjectId, id);
          const relevantHistory = msgHistory.slice(-20);

          answer = await handleAsk({
            q,
            namespace: ns,
            history: relevantHistory,
            llmOverride,
            systemPrompt: customPrompt,
          });

          const stored = {
            role: "assistant" as const,
            content: typeof answer?.answer === "string" ? answer.answer : String(answer ?? ""),
            at: Date.now(),
            ...(answer?.sources?.length && { sources: answer.sources }),
          }
          await addMsg(subjectId, id, stored);
          emitToAll(chatSockets.get(id), { type: "answer", answer });
          emitToAll(chatSockets.get(id), { type: "done" });
        } catch (err: any) {
          const msg = err?.message || "failed";
          const stack = err?.stack || String(err);
          console.error("[chat] err inner", { chatId: id, msg, stack });
          emitToAll(chatSockets.get(id), { type: "error", error: msg });
        }
      });
    } catch (e: any) {
      console.error("[chat] err outer", e?.message || e);
      next(e);
    }
  });

  app.get("/subjects/:id/chats", async (req: any, res: any) => {
    const subjectId = req.params.id;
    const chats = await listChats(subjectId);
    res.send({ ok: true, chats });
  });

  app.get("/subjects/:id/chats/:chatId", async (req: any, res: any) => {
    const subjectId = req.params.id;
    const chatId = req.params.chatId;
    const chat = await getChat(subjectId, chatId);
    if (!chat) {
      return res.status(404).send({ error: "not found" });
    }
    const messages = await getMsgs(subjectId, chatId);
    res.send({ ok: true, chat, messages });
  });
}
