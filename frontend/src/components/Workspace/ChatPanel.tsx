import { useEffect, useRef, useState } from "react";
import { useSubject } from "../../context/SubjectContext";
import { useModels } from "../../context/ModelContext";
import CollapsedColumn from "./CollapsedColumn";
import { chatJSON, getChatDetail, connectChatStream, type ChatMessage, type FlashCard, type ChatEvent, type RagSource } from "../../lib/api";
import MarkdownView from "../Chat/MarkdownView";
import SourcesList from "../Chat/SourcesList";
import LoadingIndicator from "../Chat/LoadingIndicator";
import ModelSelector from "./ModelSelector";

function extractFirstJsonObject(s: string): string {
  let depth = 0, start = -1;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "{") { if (depth === 0) start = i; depth++; }
    else if (ch === "}") { depth--; if (depth === 0 && start !== -1) return s.slice(start, i + 1); }
  }
  return "";
}

type NormalizedPayload = { md: string; flashcards: FlashCard[]; sources: RagSource[] };

function normalizePayload(payload: unknown): NormalizedPayload {
  if (typeof payload === "string") {
    const s = payload.trim();
    if (s.startsWith("{") && s.endsWith("}")) {
      try { const obj = JSON.parse(s); return { md: String(obj?.answer || ""), flashcards: Array.isArray(obj?.flashcards) ? obj.flashcards : [], sources: Array.isArray(obj?.sources) ? obj.sources : [] }; } catch {}
    }
    const inner = extractFirstJsonObject(s);
    if (inner) {
      try { const obj = JSON.parse(inner); return { md: String(obj?.answer || ""), flashcards: Array.isArray(obj?.flashcards) ? obj.flashcards : [], sources: Array.isArray(obj?.sources) ? obj.sources : [] }; } catch {}
    }
    return { md: s, flashcards: [], sources: [] };
  }
  if (payload && typeof payload === "object") {
    const o = payload as any;
    return { md: String(o?.answer || o?.html || ""), flashcards: Array.isArray(o?.flashcards) ? o.flashcards : [], sources: Array.isArray(o?.sources) ? o.sources : [] };
  }
  return { md: "", flashcards: [], sources: [] };
}

export default function ChatPanel({ collapsed, onToggleCollapse }: { collapsed?: boolean; onToggleCollapse?: () => void }) {
  const { subject, chats, activeChatId, setActiveChatId, refreshChats } = useSubject();
  const { chatModel, setChatModel } = useModels();
  type DisplayMessage = ChatMessage & { sources?: RagSource[] };
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [awaiting, setAwaiting] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const closeRef = useRef<(() => void) | null>(null);
  const wsForChatRef = useRef<string | null>(null);

  // Load chat messages when active chat changes
  useEffect(() => {
    if (!subject || !activeChatId) {
      setMessages([]);
      return;
    }
    getChatDetail(subject.id, activeChatId).then(res => {
      if (res?.ok && Array.isArray(res.messages)) {
        setMessages(res.messages.map(m => {
          if (m.role === "assistant") {
            const norm = normalizePayload(m.content);
            return { ...m, content: norm.md, sources: norm.sources };
          }
          return m;
        }));
      }
    }).catch(() => {});
  }, [subject, activeChatId]);

  const onWsEvent = (ev: ChatEvent) => {
    if (ev.type === "answer") {
      const norm = normalizePayload(ev.answer);
      setMessages(prev => [...prev, { role: "assistant", content: norm.md, at: Date.now(), sources: norm.sources }]);
      setAwaiting(false);
      setBusy(false);
    }
    if (ev.type === "error") {
      setAwaiting(false);
      setBusy(false);
    }
  };

  // Connect WebSocket for active chat (skip if already connected inline by send())
  useEffect(() => {
    if (!activeChatId) return;
    if (wsForChatRef.current === activeChatId) return;
    const { close } = connectChatStream(activeChatId, onWsEvent);
    closeRef.current = close;
    return () => {
      close();
      closeRef.current = null;
      if (wsForChatRef.current === activeChatId) wsForChatRef.current = null;
    };
  }, [activeChatId]);

  // Auto-scroll
  useEffect(() => {
    const el = messagesRef.current;
    if (el) setTimeout(() => { el.scrollTop = el.scrollHeight; }, 50);
  }, [messages.length, awaiting]);

  const send = async (text?: string) => {
    const msg = text ?? inputRef.current?.value.trim();
    if (!msg || !subject || busy) return;

    if (!text && inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.style.height = "auto";
    }

    setMessages(prev => [...prev, { role: "user", content: msg, at: Date.now() }]);
    setAwaiting(true);
    setBusy(true);
    setEditingIdx(null);

    try {
      const res = await chatJSON(subject.id, {
        q: msg,
        chatId: activeChatId || undefined,
        provider: chatModel.provider || undefined,
        model: chatModel.model || undefined,
      });
      if (res?.chatId && res.chatId !== activeChatId) {
        // Connect WS inline before setActiveChatId so we don't miss events
        if (closeRef.current) closeRef.current();
        const { close } = connectChatStream(res.chatId, onWsEvent);
        closeRef.current = close;
        wsForChatRef.current = res.chatId;
        setActiveChatId(res.chatId);
        refreshChats();
      }
    } catch {
      setAwaiting(false);
      setBusy(false);
    }
  };

  const stopGenerating = () => {
    if (closeRef.current) {
      closeRef.current();
      closeRef.current = null;
    }
    setAwaiting(false);
    setBusy(false);
  };

  const startEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditText(messages[idx].content);
  };

  const cancelEdit = () => {
    setEditingIdx(null);
    setEditText("");
  };

  const submitEdit = (idx: number) => {
    const text = editText.trim();
    if (!text) return;
    // Remove this message and everything after it, then resend
    setMessages(prev => prev.slice(0, idx));
    setEditingIdx(null);
    setEditText("");
    send(text);
  };

  const retry = (idx: number) => {
    const text = messages[idx].content;
    // Remove this message and everything after it, then resend
    setMessages(prev => prev.slice(0, idx));
    send(text);
  };

  const newChat = () => {
    stopGenerating();
    setActiveChatId(null);
    setMessages([]);
    setEditingIdx(null);
  };

  if (collapsed && onToggleCollapse) return <CollapsedColumn label="Chat" side="center" onExpand={onToggleCollapse} />;

  return (
    <div className="h-full flex flex-col bg-stone-950 min-h-0">
      {/* Chat header */}
      <div className="px-4 py-2 border-b border-stone-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {onToggleCollapse && (
            <button onClick={onToggleCollapse} className="p-1 rounded hover:bg-stone-800 text-stone-500 hover:text-stone-300 transition-colors" aria-label="Collapse Chat" title="Collapse Chat">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
            </button>
          )}
          {chats.length > 0 && (
            <select
              value={activeChatId || ""}
              onChange={e => setActiveChatId(e.target.value || null)}
              className="bg-stone-900 border border-stone-800 rounded-md px-2 py-1 text-sm text-bone outline-none max-w-[200px]"
            >
              <option value="">New chat</option>
              {chats.map(c => (
                <option key={c.id} value={c.id}>{c.title || "Untitled"}</option>
              ))}
            </select>
          )}
          <ModelSelector
            value={chatModel.provider}
            onChange={(provider, model) => setChatModel({ provider, model })}
          />
        </div>
        <button
          onClick={newChat}
          className="text-xs px-2.5 py-1 bg-stone-800 hover:bg-stone-700 rounded-md text-stone-300 transition-colors"
        >
          + New
        </button>
      </div>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 custom-scroll">
        <div className="max-w-6xl mx-auto space-y-4">
        {messages.length === 0 && !awaiting ? (
          <div className="flex flex-col items-center justify-center h-full text-stone-600 text-sm">
            <svg className="w-10 h-10 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            <p>Ask a question about your sources</p>
          </div>
        ) : (
          messages.map((m, i) => (
            m.role === "assistant" ? (
              <div key={i} className="w-full">
                <div className="rounded-2xl bg-stone-950/90 border border-stone-800 px-5 py-4">
                  <MarkdownView md={m.content} />
                </div>
                {m.sources && m.sources.length > 0 && (
                  <SourcesList sources={m.sources} />
                )}
              </div>
            ) : (
              <div key={i} className="w-full">
                {editingIdx === i ? (
                  /* Editing mode */
                  <div className="max-w-[85%] space-y-2">
                    <textarea
                      autoFocus
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitEdit(i); }
                        if (e.key === "Escape") cancelEdit();
                      }}
                      rows={3}
                      className="w-full bg-stone-900 border border-stone-600 rounded-xl px-4 py-3 text-bone outline-none resize-none text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => submitEdit(i)}
                        disabled={!editText.trim()}
                        className="px-3 py-1.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-stone-950 rounded-lg text-xs font-medium transition-colors"
                      >
                        Send
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1.5 text-stone-400 hover:text-stone-300 text-xs transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display mode */
                  <div className="group">
                    <div className="inline-block max-w-[85%] bg-stone-800 border border-stone-700 rounded-2xl px-4 py-3">
                      <div className="text-bone-light whitespace-pre-wrap leading-relaxed">{m.content}</div>
                    </div>
                    {/* Edit / Retry buttons */}
                    {!busy && (
                      <div className="flex gap-1 mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(i)}
                          className="p-1 text-stone-600 hover:text-stone-300 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button
                          onClick={() => retry(i)}
                          className="p-1 text-stone-600 hover:text-stone-300 transition-colors"
                          title="Retry"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          ))
        )}

        {/* Loading with stop button */}
        {awaiting && (
          <div className="w-full space-y-2">
            <LoadingIndicator label="Thinking..." />
            <div className="flex justify-center">
              <button
                onClick={stopGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-lg text-xs text-stone-300 hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                Stop generating
              </button>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Composer */}
      <div className="px-4 py-3 border-t border-stone-800 shrink-0">
        <div className="max-w-6xl mx-auto flex items-end gap-2">
          <textarea
            ref={inputRef}
            placeholder="Ask about your sources..."
            rows={1}
            className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-bone placeholder:text-stone-600 outline-none focus:border-stone-700 resize-none overflow-y-auto max-h-32 text-sm"
            onInput={e => { const el = e.target as HTMLTextAreaElement; el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 128) + "px"; }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <button
            onClick={() => send()}
            disabled={busy}
            className="p-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 rounded-xl text-stone-950 transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
