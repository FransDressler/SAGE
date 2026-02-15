import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useSubject } from "../../context/SubjectContext";
import { useModels } from "../../context/ModelContext";
import CollapsedColumn from "./CollapsedColumn";
import ChatSidebar from "./ChatSidebar";
import DropOverlay from "./DropOverlay";
import { useDragZone } from "../../hooks/useDragZone";
import { chatJSON, chatMultipart, getChatDetail, connectChatStream, type ChatMessage, type FlashCard, type ChatEvent, type RagSource, type AgentStep } from "../../lib/api";
import MarkdownView from "../Chat/MarkdownView";
import SourcesList from "../Chat/SourcesList";
import LoadingIndicator from "../Chat/LoadingIndicator";
import ModelSelector from "./ModelSelector";

function extractFirstJsonObject(s: string): string {
  let depth = 0, start = -1, inString = false, escape = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inString) {
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (ch === '"') { inString = false; }
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === "{") { if (depth === 0) start = i; depth++; }
    else if (ch === "}") { depth--; if (depth === 0 && start !== -1) return s.slice(start, i + 1); }
  }
  return "";
}

type NormalizedPayload = { md: string; flashcards: FlashCard[]; sources: RagSource[] };

/** Escape literal control chars inside JSON string values so JSON.parse succeeds */
function sanitizeJsonString(s: string): string {
  let out = "", inStr = false, esc = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) { esc = false; out += ch; continue; }
      if (ch === "\\") { esc = true; out += ch; continue; }
      if (ch === '"') { inStr = false; out += ch; continue; }
      if (ch === "\n") { out += "\\n"; continue; }
      if (ch === "\r") { out += "\\r"; continue; }
      if (ch === "\t") { out += "\\t"; continue; }
      out += ch;
    } else {
      if (ch === '"') inStr = true;
      out += ch;
    }
  }
  return out;
}

function tryParseJson(s: string): any {
  try { return JSON.parse(s); } catch {}
  try { return JSON.parse(sanitizeJsonString(s)); } catch {}
  return null;
}

function fromParsed(obj: any): NormalizedPayload | null {
  if (!obj || typeof obj !== "object") return null;
  return {
    md: String(obj.answer || obj.html || ""),
    flashcards: Array.isArray(obj.flashcards) ? obj.flashcards : [],
    sources: Array.isArray(obj.sources) ? obj.sources : [],
  };
}

function normalizePayload(payload: unknown): NormalizedPayload {
  if (typeof payload === "string") {
    const s = payload.trim();
    // Try direct parse
    const direct = tryParseJson(s);
    if (direct) { const r = fromParsed(direct); if (r) return r; }
    // Try extracting JSON object from surrounding text
    const inner = extractFirstJsonObject(s);
    if (inner) {
      const extracted = tryParseJson(inner);
      if (extracted) { const r = fromParsed(extracted); if (r) return r; }
    }
    return { md: s, flashcards: [], sources: [] };
  }
  if (payload && typeof payload === "object") {
    return fromParsed(payload) || { md: "", flashcards: [], sources: [] };
  }
  return { md: "", flashcards: [], sources: [] };
}

type ToolChatContext = { tool: string; topic: string; content: string };

export type ChatPanelHandle = {
  newChat: () => void;
  send: () => void;
  stopGenerating: () => void;
  focusInput: () => void;
};

const ChatPanel = forwardRef<ChatPanelHandle, { collapsed?: boolean; onToggleCollapse?: () => void; toolChatContext?: ToolChatContext | null; onToolChatConsumed?: () => void }>(function ChatPanel({ collapsed, onToggleCollapse, toolChatContext, onToolChatConsumed }, ref) {
  const { subject, chats, activeChatId, setActiveChatId, refreshChats } = useSubject();
  const { chatModel, setChatModel } = useModels();
  type DisplayMessage = ChatMessage & { sources?: RagSource[]; agentSteps?: AgentStep[] };
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [awaiting, setAwaiting] = useState(false);
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [pendingImages, setPendingImages] = useState<{ file: File; url: string }[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const closeRef = useRef<(() => void) | null>(null);
  const wsForChatRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    newChat: () => newChat(),
    send: () => send(),
    stopGenerating: () => stopGenerating(),
    focusInput: () => inputRef.current?.focus(),
  }));

  // Auto-focus chat input when user starts typing and chat is visible
  useEffect(() => {
    if (collapsed) return;
    const handler = (e: KeyboardEvent) => {
      // Skip if already in an input, or if modifier keys are held (shortcuts)
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // Skip non-printable keys
      if (e.key.length !== 1) return;
      // Skip if a modal/overlay is open (z-50 elements like command palette)
      if (document.querySelector(".fixed.z-50")) return;
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [collapsed]);

  const acceptImages = useCallback((e: DragEvent) => {
    if (!e.dataTransfer?.items) return false;
    for (const item of Array.from(e.dataTransfer.items)) {
      if (item.kind === "file" && item.type.startsWith("image/")) return true;
    }
    return false;
  }, []);

  const { dragActive, handlers: dragHandlers } = useDragZone({
    onDrop: files => addImages(files),
    accept: acceptImages,
  });

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
            // Prefer sources already stored on the message over parsed ones
            const storedSources = (m as any).sources;
            const sources = (Array.isArray(storedSources) && storedSources.length) ? storedSources : norm.sources;
            return { ...m, content: norm.md, sources };
          }
          return m;
        }));
      }
    }).catch(() => {});
  }, [subject, activeChatId]);

  const onWsEvent = (ev: ChatEvent) => {
    if (ev.type === "phase") {
      const stepId = ev.stepId ?? Date.now();
      setAgentSteps(prev => {
        const updated = prev.map(s => s.status === "active" ? { ...s, status: "done" as const } : s);
        return [...updated, { stepId, phase: ev.value, detail: ev.detail, status: "active" as const }];
      });
    }
    if (ev.type === "answer") {
      const norm = normalizePayload(ev.answer);
      setAgentSteps(prev => {
        const finalized = prev.map(s => s.status === "active" ? { ...s, status: "done" as const } : s);
        setMessages(old => [...old, { role: "assistant", content: norm.md, at: Date.now(), sources: norm.sources, agentSteps: finalized.length ? finalized : undefined }]);
        return [];
      });
      setAwaiting(false);
      setBusy(false);
    }
    if (ev.type === "done") {
      setAgentSteps([]);
    }
    if (ev.type === "error") {
      setAwaiting(false);
      setBusy(false);
      setAgentSteps([]);
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

  // Handle tool chat context: start new chat with tool content
  useEffect(() => {
    if (!toolChatContext || !subject) return;
    if (busy) return; // Will retry when busy changes
    const toolLabel = { quiz: "quiz", podcast: "podcast", smartnotes: "notes", mindmap: "mindmap", exam: "exam" }[toolChatContext.tool] || toolChatContext.tool;
    const truncated = toolChatContext.content.length > 3000
      ? toolChatContext.content.slice(0, 3000) + "\n...[truncated]"
      : toolChatContext.content;
    const msg = `I just generated a ${toolLabel} about "${toolChatContext.topic}". Here's the content:\n\n${truncated}\n\nHelp me understand and study this material.`;
    newChat();
    onToolChatConsumed?.();
    const timer = setTimeout(() => send(msg), 100);
    return () => clearTimeout(timer);
  }, [toolChatContext, busy]);

  // Auto-scroll
  useEffect(() => {
    const el = messagesRef.current;
    if (el) setTimeout(() => { el.scrollTop = el.scrollHeight; }, 50);
  }, [messages.length, awaiting]);

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

  const addImages = (files: FileList | File[]) => {
    const valid = Array.from(files).filter(f => IMAGE_TYPES.includes(f.type) && f.size <= MAX_IMAGE_SIZE).slice(0, 4);
    const withUrls = valid.map(f => ({ file: f, url: URL.createObjectURL(f) }));
    setPendingImages(prev => [...prev, ...withUrls].slice(0, 4));
  };

  const removeImage = (idx: number) => {
    setPendingImages(prev => {
      const removed = prev[idx];
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const send = async (text?: string) => {
    const msg = text ?? inputRef.current?.value.trim();
    if (!msg || !subject || busy) return;

    if (!text && inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.style.height = "auto";
    }

    const images = pendingImages.map(p => p.file);
    for (const p of pendingImages) URL.revokeObjectURL(p.url);
    setPendingImages([]);

    setMessages(prev => [...prev, { role: "user", content: msg, at: Date.now() }]);
    setAwaiting(true);
    setBusy(true);
    setEditingIdx(null);

    try {
      const res = images.length
        ? await chatMultipart(subject.id, msg, images, {
            chatId: activeChatId || undefined,
            provider: chatModel.provider || undefined,
            model: chatModel.model || undefined,
          })
        : await chatJSON(subject.id, {
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
    setAgentSteps([]);
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
    <div className="h-full flex flex-col bg-stone-900 min-h-0 min-w-0 overflow-hidden relative" {...dragHandlers}>
      {dragActive && <DropOverlay icon="image" message="Drop images here" />}
      {/* Chat sidebar */}
      <ChatSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={newChat}
      />

      {/* Chat header */}
      <div className="px-4 h-12 border-b border-stone-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {onToggleCollapse && (
            <button onClick={onToggleCollapse} className="p-1 rounded hover:bg-stone-800 text-stone-500 hover:text-stone-300 transition-colors" aria-label="Collapse Chat" title="Collapse Chat">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
            </button>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-500 hover:text-stone-300 transition-colors"
            aria-label="Chat history"
            title="Chat history"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <ModelSelector
            value={chatModel.provider}
            onChange={(provider, model) => setChatModel({ provider, model })}
          />
        </div>
        <button
          onClick={newChat}
          className="sunset-fill-btn border border-stone-500 text-[11px] text-stone-500 font-medium px-2.5 py-0.5"
        >
          + New
        </button>
      </div>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 min-h-0 overflow-y-auto p-4 custom-scroll">
        <div className={`max-w-6xl mx-auto ${messages.length === 0 && !awaiting ? "flex flex-col h-full" : "space-y-4"}`}>
        {messages.length === 0 && !awaiting ? (
          <div className="flex flex-col items-center justify-center flex-1 text-stone-600 text-sm">
            <svg className="w-10 h-10 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            <p>Ask a question about your sources</p>
          </div>
        ) : (
          messages.map((m, i) => (
            m.role === "assistant" ? (
              <div key={i} className="w-full">
                {m.agentSteps && m.agentSteps.length > 0 && (
                  <LoadingIndicator steps={m.agentSteps} finished />
                )}
                <div className="rounded-2xl bg-stone-900/90 border border-stone-800 px-5 py-4">
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
            <LoadingIndicator label="Thinking..." steps={agentSteps} />
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
        <div className="max-w-6xl mx-auto">
          {/* Image preview */}
          {pendingImages.length > 0 && (
            <div className="flex gap-2 mb-2 flex-wrap">
              {pendingImages.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img.url} alt="" className="w-16 h-16 object-cover rounded-lg border border-stone-700" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-stone-800 border border-stone-600 text-stone-400 hover:text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              multiple
              className="hidden"
              onChange={e => { if (e.target.files) addImages(e.target.files); e.target.value = ""; }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-[38px] w-[38px] flex items-center justify-center text-stone-500 hover:text-stone-300 transition-colors shrink-0"
              title="Attach image"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
            </button>
            <textarea
              ref={inputRef}
              placeholder="Ask about your sources..."
              rows={1}
              className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-bone placeholder:text-stone-600 outline-none focus:border-stone-700 resize-none overflow-y-auto custom-scroll max-h-64 text-sm"
              onInput={e => { const el = e.target as HTMLTextAreaElement; el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 256) + "px"; }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              onPaste={e => {
                const items = Array.from(e.clipboardData.items);
                const imageItems = items.filter(i => i.type.startsWith("image/"));
                if (imageItems.length) {
                  e.preventDefault();
                  const files = imageItems.map(i => i.getAsFile()).filter(Boolean) as File[];
                  addImages(files);
                }
              }}
            />
            <button
              onClick={() => send()}
              disabled={busy}
              className="h-[38px] w-[38px] flex items-center justify-center bg-accent hover:bg-accent-hover disabled:opacity-50 rounded-xl text-stone-950 transition-colors shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ChatPanel;
