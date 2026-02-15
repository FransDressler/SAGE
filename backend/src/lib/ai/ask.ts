import fs from "fs"
import path from "path"
import crypto from "crypto"
import llm from "../../utils/llm/llm"
import type { LLM } from "../../utils/llm/models/types"
import { execDirect } from "../../agents/runtime"
import { normalizeTopic } from "../../utils/text/normalize"
import { extractFirstJsonObject, sanitizeJsonString } from "./extract"
import { getLocale } from "../prompts/locale"

export type AskCard = { q: string; a: string; tags?: string[] }
export type RagSource = { sourceFile: string; sourceId?: string; pageNumber?: number; heading?: string; sourceType?: string; url?: string }
export type AskPayload = { topic: string; answer: string; flashcards: AskCard[]; sources?: RagSource[] }

function toText(out: any): string {
  if (!out) return ""
  if (typeof out === "string") return out
  if (typeof out?.content === "string") return out.content
  if (Array.isArray(out?.content)) return out.content.map((p: any) => (typeof p === "string" ? p : p?.text ?? "")).join("")
  if (Array.isArray(out?.generations) && out.generations[0]?.text) return out.generations[0].text
  return String(out ?? "")
}

function guessTopic(q: string): string {
  const t = String(q ?? "").trim().replace(/\s+/g, " ")
  if (t.length <= 80) return t
  const m = t.match(/\babout\s+([^?.!]{3,80})/i) || t.match(/\b(on|of|for|in)\s+([^?.!]{3,80})/i)
  return (m?.[2] || m?.[1] || t.slice(0, 80)).trim()
}

function tryParse<T = unknown>(s: string): T | null {
  try { return JSON.parse(s) as T } catch {}
  try { return JSON.parse(sanitizeJsonString(s)) as T } catch { return null }
}

function extractSources(docs: Array<{ text?: string; meta?: any }>): RagSource[] {
  const seen = new Set<string>()
  const sources: RagSource[] = []
  for (const d of docs) {
    const m = d?.meta
    if (!m?.sourceFile) continue
    const key = `${m.sourceFile}::${m.pageNumber !== undefined ? m.pageNumber : "_"}`
    if (seen.has(key)) continue
    seen.add(key)
    sources.push({
      sourceFile: m.sourceFile,
      ...(m.sourceId && { sourceId: m.sourceId }),
      ...(m.pageNumber != null && { pageNumber: m.pageNumber }),
      ...(m.heading && { heading: m.heading }),
      ...(m.sourceType && { sourceType: m.sourceType }),
    })
  }
  return sources
}

const FLASHCARD_SCHEMA = `,
  "flashcards": [{"q": "string", "a": "string", "tags": ["deep","transfer","metacognition"]}]`

const FLASHCARD_RULES = `
FLASHCARDS
- 3-5 cards per response. Never test pure recall — require reasoning, application, or "why?" thinking.
- Tags: deep, transfer, metacognition, troubleshoot, synthesis, anti_rote.`

const generateFlashcards = process.env.CHAT_GENERATE_FLASHCARDS === "true"

function buildSystemPrompt(): string {
  const { instruction: lang } = getLocale()
  const schema = generateFlashcards ? FLASHCARD_SCHEMA : ""
  const fcRules = generateFlashcards ? FLASHCARD_RULES : ""

  return `You are PageLM, an AI tutor. Return ONLY a JSON object:
{"topic": "string", "answer": "GitHub-Flavored Markdown with LaTeX math"${schema}}

TEACHING APPROACH
- Explain concepts simply enough for a curious 12-year-old (Feynman technique). Build intuition before formulas.
- Never encourage rote memorization. Instead of "memorize X = Y", say "X works like Y because..."
- Use concrete analogies, real-world connections, and surprising examples.
- Structure answers with progressive depth: core idea → mechanism → edge cases.
- Use tables, diagrams, and visual scaffolding where helpful.
${fcRules}
${lang}

MATH & FORMULAS
- Write ALL math using LaTeX with dollar-sign delimiters.
- Inline math: $E = mc^2$ (single dollar signs).
- Display/block math: $$\\int_0^\\infty f(x)\\,dx$$ (double dollar signs, on its own line).
- NEVER use \\(...\\) or \\[...\\] delimiters.
- NEVER use plain-text formulas — always wrap in LaTeX.
- Inside JSON strings, backslashes must be escaped: write \\\\frac not \\frac, \\\\alpha not \\alpha, etc.

IMAGES & DIAGRAMS
- When context contains image URLs (markdown ![alt](url) syntax), include relevant images in your answer using the exact URL from the context.
- Do not fabricate image URLs. Only use URLs that appear in the provided context.
- Add a brief caption or description below each image.
- Only include images that directly help explain the answer.

OUTPUT
- Return ONLY the JSON object: {"topic": "string", "answer": "GitHub-Flavored Markdown with LaTeX math"${schema}}
- The "answer" value must be a valid JSON string. Escape all backslashes (\\\\), newlines (\\n), and quotes (\\").
- No prose, no backticks, no code fences outside the JSON.`
}

export const BASE_SYSTEM_PROMPT = buildSystemPrompt()

const CONTEXT_BUDGET = Number(process.env.LLM_CONTEXT_BUDGET) || 12000

function budgetChunks(chunks: Array<{ text?: string; meta?: any }>): typeof chunks {
  let total = 0
  return chunks.filter(c => {
    const len = (c?.text || "").length
    if (total + len > CONTEXT_BUDGET && total > 0) return false
    total += len
    return true
  })
}

const cacheDir = path.join(process.cwd(), "storage", "cache", "ask")
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true })
const keyOf = (x: any) => crypto.createHash("sha256").update(typeof x === "string" ? x : JSON.stringify(x)).digest("hex")
const readCache = (k: any) => { const f = path.join(cacheDir, keyOf(k) + ".json"); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null }
const writeCache = (k: any, v: any) => { const f = path.join(cacheDir, keyOf(k) + ".json"); fs.writeFileSync(f, JSON.stringify(v)) }

type HistoryMessage = { role: string; content: any }

function toMessageContent(content: any): string {
  if (content == null) return ""
  if (typeof content === "string") return content
  if (typeof content === "object") {
    const cand = (content as any).answer ?? (content as any).content
    if (typeof cand === "string" && cand.trim()) return cand
    try { return JSON.stringify(content) } catch { return String(content) }
  }
  return String(content)
}

function serializeHistoryForCache(history?: HistoryMessage[]): string[] {
  if (!history || !history.length) return []
  return history
    .slice(-4)
    .filter((m) => m?.role === "user" || m?.role === "assistant")
    .map((m) => `${m.role}:${toMessageContent(m.content).slice(0, 120)}`)
}

function toConversationHistory(history?: HistoryMessage[]): Array<{ role: string; content: string }> {
  if (!history || !history.length) return []
  return history.slice(-8)
    .filter(m => m?.role === "user" || m?.role === "assistant")
    .map(msg => {
      const text = toMessageContent(msg.content)
      if (msg.role === "assistant") {
        return { role: msg.role, content: text.slice(0, 300) + (text.length > 300 ? "\n..." : "") }
      }
      return { role: msg.role, content: text.slice(0, 500) }
    })
}

type AskWithContextOptions = {
  question: string
  context: string
  topic?: string
  systemPrompt?: string
  history?: HistoryMessage[]
  cacheScope?: string
  llmOverride?: LLM
}

export async function askWithContext(opts: AskWithContextOptions): Promise<AskPayload> {
  const rawQuestion = typeof opts.question === "string" ? opts.question : String(opts.question ?? "")
  const safeQ = normalizeTopic(rawQuestion)
  const ctx = typeof opts.context === "string" && opts.context.trim() ? opts.context : "NO_CONTEXT"
  const topic = typeof opts.topic === "string" && opts.topic.trim()
    ? opts.topic.trim()
    : guessTopic(safeQ) || "General"
  const systemPrompt = opts.systemPrompt?.trim() || BASE_SYSTEM_PROMPT
  const historyArr = Array.isArray(opts.history) ? opts.history : undefined
  const historyCache = serializeHistoryForCache(historyArr)

  const ck = { t: opts.cacheScope || "ask_ctx", q: safeQ, ctx, topic, sys: systemPrompt, hist: historyCache }
  const cached = readCache(ck)
  if (cached) return cached

  const messages: any[] = [{ role: "system", content: systemPrompt }]
  for (const msg of toConversationHistory(historyArr)) messages.push(msg)

  messages.push({
    role: "user",
    content: `<question>${safeQ}</question>\n\n<topic>${topic}</topic>\n\n<context>\n${ctx}\n</context>\n\nAnswer the question using the provided context. Return only the JSON object.`
  })

  const model = opts.llmOverride || llm
  const res = await model.call(messages as any)
  const draft = toText(res).trim()
  const jsonStr = extractFirstJsonObject(draft) || draft
  const parsed = tryParse<any>(jsonStr)

  const out: AskPayload =
    parsed && typeof parsed === "object"
      ? {
        topic: typeof parsed.topic === "string" ? parsed.topic : topic,
        answer: typeof parsed.answer === "string" ? parsed.answer : "",
        flashcards: Array.isArray(parsed.flashcards) ? (parsed.flashcards as AskCard[]) : [],
      }
      : { topic, answer: draft, flashcards: [] }

  writeCache(ck, out)
  return out
}

export async function handleAsk(
  q: string | { q: string; namespace?: string; history?: any[]; llmOverride?: LLM; systemPrompt?: string },
  ns?: string,
  k = 6,
  historyArg?: any[],
  llmOverride?: LLM,
  systemPromptArg?: string
): Promise<AskPayload> {
  if (typeof q === "object" && q !== null) {
    const params = q
    return handleAsk(params.q, params.namespace ?? ns, k, params.history ?? historyArg, params.llmOverride ?? llmOverride, params.systemPrompt ?? systemPromptArg)
  }

  const questionRaw = typeof q === "string" ? q : String(q ?? "")
  const safeQ = normalizeTopic(questionRaw)
  const nsFinal = typeof ns === "string" && ns.trim() ? ns : "pagelm"

  const rag = await execDirect({
    agent: "researcher",
    plan: { steps: [{ tool: "rag.search", input: { q: safeQ, ns: nsFinal, k }, timeoutMs: 8000, retries: 1 }] },
    ctx: { ns: nsFinal }
  })

  const ragResult = (rag as any)?.result
  const ctxDocs: Array<{ text?: string; meta?: any }> = budgetChunks(
    Array.isArray(ragResult) ? ragResult : []
  )

  ctxDocs.sort((a, b) => {
    const fileA = a?.meta?.sourceFile || ""
    const fileB = b?.meta?.sourceFile || ""
    if (fileA !== fileB) return fileA.localeCompare(fileB)
    return (a?.meta?.chunkIndex || 0) - (b?.meta?.chunkIndex || 0)
  })

  const hasExerciseContext = ctxDocs.some(d => d?.meta?.sourceType === "exercise")

  const ctx = ctxDocs.map(d => {
    const m = d?.meta
    const typeMarker = m?.sourceType === "exercise" ? " [TYPE: EXERCISE]" : ""
    const source = m?.sourceFile
      ? `[Source: ${m.sourceFile}${m.pageNumber ? `, p.${m.pageNumber}` : ""}${typeMarker}]`
      : ""
    return `${source}\n${d?.text || ""}`.trim()
  }).join("\n\n---\n\n") || "NO_CONTEXT"
  const topic = guessTopic(safeQ) || "General"

  const sources = extractSources(ctxDocs)

  let effectivePrompt = systemPromptArg || BASE_SYSTEM_PROMPT
  if (hasExerciseContext) {
    effectivePrompt += `\n\nEXERCISE SOURCE RULES:
- Chunks marked [TYPE: EXERCISE] come from practice problems, exams, or exercises.
- NEVER reveal solutions, final answers, or worked-out steps from exercise sources.
- Instead: identify the core concept, explain the underlying principle, guide via Socratic questioning.
- If asked for a solution directly, redirect: "This comes from your exercise materials. Let me help you understand the concept instead..."
- You may explain the general method or technique needed, but never apply it to the specific exercise problem.`
  }

  const result = await askWithContext({
    question: questionRaw,
    context: ctx,
    topic,
    history: historyArg,
    systemPrompt: effectivePrompt,
    cacheScope: `ans:${nsFinal}`,
    llmOverride,
  })

  return { ...result, sources }
}
