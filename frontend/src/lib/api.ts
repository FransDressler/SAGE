import { env } from "../config/env";

// --- Types ---

export type Subject = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  sourceCount: number;
  systemPrompt?: string;
};

export type SourceType = "material" | "exercise" | "websearch";

export type Source = {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: number;
  sourceType: SourceType;
  searchQuery?: string;
  searchMode?: "quick" | "deep";
  sourceUrl?: string;
};

export type ChatStartResponse = { ok: true; chatId: string; stream: string };
export type ChatMessage = { role: "user" | "assistant"; content: string; at: number };
export type ChatInfo = { id: string; title?: string; at?: number };
export type ChatsList = { ok: true; chats: ChatInfo[] };
export type ChatDetail = { ok: true; chat: ChatInfo; messages: ChatMessage[] };
export type ChatJSONBody = { q: string; chatId?: string; provider?: string; model?: string };
export type ChatPhase = "upload_start" | "upload_done" | "generating" | "thinking" | "listing_sources" | "searching_sources" | "searching_web" | "reading_results";
export type AgentStep = { stepId: number; phase: ChatPhase; detail?: string; status: "active" | "done" };
export type FlashCard = { q: string; a: string; tags?: string[] };
export type Question = { id: number; question: string; options: string[]; correct: number; hint: string; explanation: string; imageHtml?: string };
export type UA = { questionId: number; selectedAnswer: number; correct: boolean; question: string; selectedOption: string; correctOption: string; explanation: string };
export type QuizStartResponse = { ok: true; quizId: string; stream: string };
export type QuizEvent = { type: "ready" | "phase" | "quiz" | "done" | "error" | "ping"; quizId?: string; value?: string; quiz?: unknown; error?: string; t?: number };
export type SmartNotesStart = { ok: true; noteId: string; stream: string };
export type SmartNotesMode = "summary" | "deep" | "study-guide"
export type SmartNotesEvent =
  | { type: "ready"; noteId: string }
  | { type: "phase"; value: string; detail?: string }
  | { type: "file"; file: string }
  | { type: "done" }
  | { type: "error"; error: string }
  | { type: "ping"; t: number };
export type PodcastEvent =
  | { type: "ready"; pid: string }
  | { type: "phase"; value: string }
  | { type: "file"; filename: string; mime: string }
  | { type: "warn"; message: string }
  | { type: "script"; data: any }
  | { type: "audio"; file: string; filename?: string; staticUrl?: string }
  | { type: "done" }
  | { type: "error"; error: string };
export type SavedFlashcard = {
  id: string;
  question: string;
  answer: string;
  tag: string;
  created: number;
};
export type ChatEvent =
  | { type: "ready"; chatId: string }
  | { type: "phase"; value: ChatPhase; detail?: string; stepId?: number }
  | { type: "file"; filename: string; mime: string }
  | { type: "answer"; answer: AnswerPayload }
  | { type: "done" }
  | { type: "error"; error: string };

export type TranscriptionResponse = {
  ok: boolean;
  transcription?: string;
  provider?: string;
  confidence?: number;
  error?: string;
};

export type RagSource = { sourceFile: string; sourceId?: string; pageNumber?: number; heading?: string; sourceType?: SourceType; url?: string };
type AnswerPayload = string | { answer: string; flashcards?: FlashCard[]; sources?: RagSource[] };

// --- HTTP helpers ---

const timeoutCtl = (ms: number) => {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return { signal: c.signal, done: () => clearTimeout(t) };
};

async function req<T = unknown>(
  url: string,
  init: RequestInit & { timeout?: number } = {}
): Promise<T> {
  const { timeout = env.timeout, ...rest } = init;
  const { signal, done } = timeoutCtl(timeout);
  try {
    const r = await fetch(url, { signal, ...rest });
    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      throw new Error(`http ${r.status}: ${txt || r.statusText}`);
    }
    const ct = r.headers.get("content-type") || "";
    if (ct.includes("application/json")) return (await r.json()) as T;
    return (await r.text()) as unknown as T;
  } finally {
    done();
  }
}

const jsonHeaders = () => {
  const h = new Headers();
  h.set("content-type", "application/json");
  return h;
};

function wsURL(path: string) {
  const u = new URL(env.backend);
  const proto = u.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${u.host}${path}`;
}

// --- Subject CRUD ---

export function listSubjects() {
  return req<{ ok: true; subjects: Subject[] }>(`${env.backend}/subjects`);
}

export function createSubject(name: string) {
  return req<{ ok: true; subject: Subject }>(`${env.backend}/subjects`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ name }),
  });
}

export function getSubject(id: string) {
  return req<{ ok: true; subject: Subject; sources: Source[] }>(
    `${env.backend}/subjects/${encodeURIComponent(id)}`
  );
}

export function renameSubject(id: string, name: string) {
  return req<{ ok: true; subject: Subject }>(
    `${env.backend}/subjects/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify({ name }),
    }
  );
}

export function updateSubjectPrompt(id: string, systemPrompt: string) {
  return req<{ ok: true; subject: Subject }>(
    `${env.backend}/subjects/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify({ systemPrompt }),
    }
  );
}

export function deleteSubject(id: string) {
  return req<{ ok: true }>(`${env.backend}/subjects/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// --- Sources ---

export function uploadSources(subjectId: string, files: File[], sourceType: SourceType = "material") {
  const f = new FormData();
  f.append("sourceType", sourceType);
  for (const file of files) f.append("file", file, file.name);
  return req<{ ok: true; sources: Source[]; warnings?: string[] }>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/sources`,
    {
      method: "POST",
      body: f,
      timeout: Math.max(env.timeout, 300000),
    }
  );
}

export function removeSource(subjectId: string, sourceId: string) {
  return req<{ ok: true }>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/sources/${encodeURIComponent(sourceId)}`,
    { method: "DELETE" }
  );
}

export function getSourceContentUrl(subjectId: string, sourceId: string): string {
  return `${env.backend}/subjects/${encodeURIComponent(subjectId)}/sources/${encodeURIComponent(sourceId)}/content`;
}

export async function getSourceContentText(subjectId: string, sourceId: string): Promise<string> {
  const r = await fetch(getSourceContentUrl(subjectId, sourceId));
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(txt || `Failed to fetch source content: ${r.status}`);
  }
  return r.text();
}

// --- Chat ---

export async function chatJSON(subjectId: string, body: ChatJSONBody) {
  return req<ChatStartResponse>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/chat`,
    {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(body),
    }
  );
}

export async function chatMultipart(subjectId: string, q: string, files: File[], opts?: { chatId?: string; provider?: string; model?: string }) {
  const f = new FormData();
  f.append("q", q);
  if (opts?.chatId) f.append("chatId", opts.chatId);
  if (opts?.provider) f.append("provider", opts.provider);
  if (opts?.model) f.append("model", opts.model);
  for (const file of files) f.append("file", file, file.name);
  return req<ChatStartResponse>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/chat`,
    {
      method: "POST",
      body: f,
      timeout: Math.max(env.timeout, 300000),
    }
  );
}

export function connectChatStream(chatId: string, onEvent: (ev: ChatEvent) => void) {
  const url = wsURL(`/ws/chat?chatId=${encodeURIComponent(chatId)}`);
  const ws = new WebSocket(url);
  ws.onmessage = (m) => {
    try {
      const data = JSON.parse(m.data as string) as ChatEvent;
      onEvent(data);
    } catch {}
  };
  ws.onerror = () => {
    onEvent({ type: "error", error: "stream_error" });
  };
  return { ws, close: () => { try { ws.close(); } catch {} } };
}

export function getChats(subjectId: string) {
  return req<ChatsList>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/chats`
  );
}

export function getChatDetail(subjectId: string, id: string) {
  return req<ChatDetail>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/chats/${encodeURIComponent(id)}`
  );
}

export function renameChat(subjectId: string, chatId: string, title: string) {
  return req<{ ok: true; chat: ChatInfo }>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/chats/${encodeURIComponent(chatId)}`,
    {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify({ title }),
    }
  );
}

export function deleteChat(subjectId: string, chatId: string) {
  return req<{ ok: true }>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/chats/${encodeURIComponent(chatId)}`,
    { method: "DELETE" }
  );
}

// --- Quiz ---

export async function quizStart(subjectId: string, payload: { topic: string; difficulty?: string; length?: number; sourceIds?: string[]; instructions?: { focusArea?: string; additionalInstructions?: string }; provider?: string; model?: string }) {
  return req<QuizStartResponse>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/quiz`,
    {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    }
  );
}

export function connectQuizStream(quizId: string, onEvent: (ev: QuizEvent) => void) {
  const url = wsURL(`/ws/quiz?quizId=${encodeURIComponent(quizId)}`);
  const ws = new WebSocket(url);
  ws.onmessage = (m) => {
    try {
      onEvent(JSON.parse(m.data as string) as QuizEvent);
    } catch {}
  };
  ws.onerror = () => onEvent({ type: "error", error: "stream_error" } as any);
  return { ws, close: () => { try { ws.close(); } catch {} } };
}

// --- Podcast ---

export async function podcastStart(subjectId: string, payload: { topic: string; sourceIds?: string[]; length?: string; instructions?: { focusArea?: string; additionalInstructions?: string; tone?: string }; provider?: string; model?: string }) {
  const url = `${env.backend}/subjects/${encodeURIComponent(subjectId)}/podcast`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to start podcast");
  return data;
}

export function connectPodcastStream(pid: string, onEvent: (ev: PodcastEvent) => void) {
  const wsUrl = `${env.backend.replace(/^http/, "ws")}/ws/podcast?pid=${pid}`;
  const ws = new WebSocket(wsUrl);
  ws.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data);
      onEvent(msg);
    } catch {
      onEvent({ type: "error", error: "invalid_message" });
    }
  };
  ws.onerror = () => onEvent({ type: "error", error: "stream_error" });
  return { ws, close: () => { try { ws.close(); } catch {} } };
}

// --- SmartNotes ---

export async function smartnotesStart(subjectId: string, input: { topic?: string; notes?: string; filePath?: string; sourceIds?: string[]; length?: string; mode?: SmartNotesMode; instructions?: { focusArea?: string; additionalInstructions?: string }; provider?: string; model?: string }) {
  return req<SmartNotesStart>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/smartnotes`,
    {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(input),
    }
  );
}

export function connectSmartnotesStream(noteId: string, onEvent: (ev: SmartNotesEvent) => void) {
  const url = wsURL(`/ws/smartnotes?noteId=${encodeURIComponent(noteId)}`);
  const ws = new WebSocket(url);
  ws.onmessage = (m) => {
    try {
      onEvent(JSON.parse(m.data as string) as SmartNotesEvent);
    } catch {}
  };
  ws.onerror = () => onEvent({ type: "error", error: "stream_error" });
  return { ws, close: () => { try { ws.close(); } catch {} } };
}

// --- Research ---

export async function researchStart(
  subjectId: string,
  body: { topic: string; depth?: ResearchDepth; sourceIds?: string[]; instructions?: { focusArea?: string; additionalInstructions?: string }; provider?: string; model?: string }
): Promise<ResearchStart> {
  return req<ResearchStart>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/research`,
    {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(body),
    }
  );
}

export function connectResearchStream(researchId: string, onEvent: (ev: ResearchEvent) => void) {
  const url = wsURL(`/ws/research?researchId=${encodeURIComponent(researchId)}`);
  const ws = new WebSocket(url);
  ws.onmessage = (m) => {
    try {
      onEvent(JSON.parse(m.data as string) as ResearchEvent);
    } catch {}
  };
  ws.onerror = () => onEvent({ type: "error", error: "stream_error" });
  return { ws, close: () => { try { ws.close(); } catch {} } };
}

// --- Flashcards ---

export async function createFlashcard(subjectId: string, input: { question: string; answer: string; tag: string }) {
  return req<{ ok: true; flashcard: SavedFlashcard }>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/flashcards`,
    {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(input),
    }
  );
}

export async function listFlashcards(subjectId: string) {
  return req<{ ok: true; flashcards: SavedFlashcard[] }>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/flashcards`
  );
}

export async function deleteFlashcard(subjectId: string, id: string) {
  return req<{ ok: true }>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/flashcards/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}

// --- Transcriber ---

export async function transcribeAudio(subjectId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return req<TranscriptionResponse>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/transcriber`,
    {
      method: "POST",
      body: formData,
      timeout: Math.max(env.timeout, 180000),
    }
  );
}

// --- Models ---

export type ProviderInfo = { id: string; name: string; defaultModel: string };
export type ModelsResponse = { ok: true; providers: ProviderInfo[]; defaultProvider: string };

export function getModels() {
  return req<ModelsResponse>(`${env.backend}/models`);
}

// --- Tools ---

export type MindmapEvent =
  | { type: "ready"; mindmapId: string }
  | { type: "phase"; value: string; detail?: string }
  | { type: "mindmap"; data: any }
  | { type: "done" }
  | { type: "error"; error: string }
  | { type: "ping"; t: number };

export type ExamQuestion = {
  id: number;
  question: string;
  type: "open" | "mcq";
  options?: string[];
  correctAnswer?: string;
  hint: string;
  solution: string;
  points: number;
  source: string;
};

export type ExamEvent =
  | { type: "ready"; examId: string }
  | { type: "phase"; value: string }
  | { type: "exam"; exam: { questions: ExamQuestion[]; totalPoints: number; timeLimit: number } }
  | { type: "done" }
  | { type: "error"; error: string }
  | { type: "ping"; t: number };

export type ResearchDepth = "quick" | "standard" | "comprehensive";
export type ResearchStart = { ok: true; researchId: string; stream: string };
export type ResearchEvent =
  | { type: "ready"; researchId: string }
  | { type: "phase"; value: string; detail?: string }
  | { type: "plan"; plan: any }
  | { type: "file"; file: string }
  | { type: "done" }
  | { type: "error"; error: string }
  | { type: "ping"; t: number };

export type ToolRecord = {
  id: string;
  tool: "quiz" | "podcast" | "smartnotes" | "mindmap" | "exam" | "research";
  topic: string;
  config: Record<string, string | undefined>;
  createdAt: number;
  result: any;
};

export function listTools(subjectId: string) {
  return req<{ ok: true; tools: ToolRecord[] }>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/tools`
  );
}

export function deleteTool(subjectId: string, toolId: string) {
  return req<{ ok: true }>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/tools/${encodeURIComponent(toolId)}`,
    { method: "DELETE" }
  );
}

// --- Mindmap ---

export async function mindmapStart(subjectId: string, payload?: { topic?: string; sourceIds?: string[]; instructions?: { focusArea?: string; additionalInstructions?: string }; provider?: string; model?: string }) {
  return req<{ ok: true; mindmapId: string; stream: string }>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/mindmap`,
    {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(payload || {}),
    }
  );
}

export function connectMindmapStream(mindmapId: string, onEvent: (ev: MindmapEvent) => void) {
  const url = wsURL(`/ws/mindmap?mindmapId=${encodeURIComponent(mindmapId)}`);
  const ws = new WebSocket(url);
  ws.onmessage = (m) => {
    try {
      onEvent(JSON.parse(m.data as string) as MindmapEvent);
    } catch {}
  };
  ws.onerror = () => onEvent({ type: "error", error: "stream_error" });
  return { ws, close: () => { try { ws.close(); } catch {} } };
}

export function getMindmap(subjectId: string) {
  return req<{ ok: true; data: any }>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/mindmap`
  );
}

export function deleteMindmap(subjectId: string) {
  return req<{ ok: true }>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/mindmap`,
    { method: "DELETE" }
  );
}

export function saveMindmap(subjectId: string, toolId: string, data: any) {
  return req<{ ok: true }>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/mindmap`,
    {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify({ toolId, data }),
    }
  );
}

export function aiEditMindmap(
  subjectId: string,
  toolId: string,
  instruction: string,
  currentData: any,
  model?: { provider?: string; model?: string }
) {
  return req<{ ok: true; data: any }>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/mindmap/ai-edit`,
    {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify({ toolId, instruction, currentData, ...model }),
      timeout: 120000,
    }
  );
}

// --- Web Search ---

export type WebSearchEvent =
  | { type: "ready"; jobId: string }
  | { type: "phase"; value: string }
  | { type: "result"; result: { title: string; url: string; content: string; score?: number } }
  | { type: "done"; sourceId: string }
  | { type: "error"; error: string };

export async function webSearchStart(subjectId: string, query: string, mode: "quick" | "deep") {
  return req<{ ok: true; jobId: string; stream: string }>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/websearch`,
    {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ query, mode }),
    }
  );
}

export function connectWebSearchStream(jobId: string, onEvent: (ev: WebSearchEvent) => void) {
  const url = wsURL(`/ws/websearch?jobId=${encodeURIComponent(jobId)}`);
  const ws = new WebSocket(url);
  ws.onmessage = (m) => {
    try {
      onEvent(JSON.parse(m.data as string) as WebSearchEvent);
    } catch {}
  };
  ws.onerror = () => onEvent({ type: "error", error: "stream_error" });
  return { ws, close: () => { try { ws.close(); } catch {} } };
}

// --- Exam ---

export async function examStart(subjectId: string, payload: { sourceIds: string[]; timeLimit?: number; shuffle?: boolean; maxQuestions?: number; instructions?: { focusArea?: string; additionalInstructions?: string }; provider?: string; model?: string }) {
  return req<{ ok: true; examId: string; stream: string }>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/exam`,
    {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    }
  );
}

export function connectExamStream(examId: string, onEvent: (ev: ExamEvent) => void) {
  const url = wsURL(`/ws/exam?examId=${encodeURIComponent(examId)}`);
  const ws = new WebSocket(url);
  ws.onmessage = (m) => {
    try {
      onEvent(JSON.parse(m.data as string) as ExamEvent);
    } catch {}
  };
  ws.onerror = () => onEvent({ type: "error", error: "stream_error" });
  return { ws, close: () => { try { ws.close(); } catch {} } };
}

// --- Markdown ---

export async function fetchMarkdownContent(url: string): Promise<string> {
  const backend = new URL(env.backend);
  const parsed = new URL(url, env.backend);
  if (parsed.origin !== backend.origin) {
    throw new Error("Refusing to fetch markdown from untrusted origin");
  }
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Failed to fetch markdown: ${r.status}`);
  return r.text();
}

// --- Subject Graph ---

export type SubjectGraphEvent =
  | { type: "ready"; subjectId: string }
  | { type: "phase"; value: string; detail?: string }
  | { type: "graph"; data: any }
  | { type: "done" }
  | { type: "error"; error: string }
  | { type: "ping"; t: number };

export function getSubjectGraph(subjectId: string) {
  return req<{ ok: true; data: any | null }>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/graph`
  );
}

export function rebuildSubjectGraph(subjectId: string, model?: { provider?: string; model?: string }) {
  return req<{ ok: true; graphId: string }>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/graph/rebuild`,
    {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(model || {}),
    }
  );
}

export function expandSubjectGraph(subjectId: string, sourceIds: string[]) {
  return req<{ ok: true; graphId: string }>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/graph/expand`,
    {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ sourceIds }),
    }
  );
}

export function aiEditSubjectGraph(subjectId: string, instruction: string, currentData: any, model?: { provider?: string; model?: string }) {
  return req<{ ok: true; data: any }>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/graph/ai-edit`,
    {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify({ instruction, currentData, ...model }),
      timeout: 120000,
    }
  );
}

export function connectSubjectGraphStream(subjectId: string, onEvent: (ev: SubjectGraphEvent) => void) {
  const url = wsURL(`/ws/subjectgraph?subjectId=${encodeURIComponent(subjectId)}`);
  const ws = new WebSocket(url);
  ws.onmessage = (m) => {
    try {
      onEvent(JSON.parse(m.data as string) as SubjectGraphEvent);
    } catch {}
  };
  ws.onerror = () => onEvent({ type: "error", error: "stream_error" });
  return { ws, close: () => { try { ws.close(); } catch {} } };
}

// --- Util ---

export function err(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}
