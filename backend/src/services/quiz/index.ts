import llm from "../../utils/llm/llm"
import type { LLM } from "../../utils/llm/models/types"
import { normalizeTopic } from "../../utils/text/normalize"
import { getLocale } from "../../lib/prompts/locale"
import { formatInstructions } from "../../lib/prompts/instructions"
import type { UserInstructions } from "../../types/instructions"

export type QuizItem = {
  id: number
  question: string
  options: string[]
  correct: number
  hint: string
  explanation: string
}

export type QuizOpts = {
  difficulty?: "easy" | "medium" | "hard"
  length?: number
  instructions?: UserInstructions
}

const DIFFICULTY_GUIDE: Record<string, string> = {
  easy: "Focus on straightforward recall and basic comprehension. Questions should test fundamental concepts and definitions.",
  medium: "Focus on application and understanding. Questions should require applying concepts to scenarios.",
  hard: "Focus on analysis, evaluation, and synthesis. Questions should require critical thinking and connecting multiple concepts.",
}

function buildSysPrompt(opts?: QuizOpts) {
  const count = Math.max(3, Math.min(20, opts?.length || 5))
  const diff = opts?.difficulty || "medium"
  const diffGuide = DIFFICULTY_GUIDE[diff] || DIFFICULTY_GUIDE.medium

  return `PRIMARY OBJECTIVE
Generate exactly ${count} multiple-choice questions about the given topic.

DIFFICULTY: ${diff.toUpperCase()}
${diffGuide}

OUTPUT CONTRACT
Return only a JSON array with ${count} objects.
No markdown, no code fences, no prose outside the JSON.

SCHEMA
"id": 1..${count}
"question": plain text, 12..160 chars, unambiguous
"options": array of exactly 4 distinct strings; each 6..80 chars; each prefixed with A) , B) , C) , D)  OR  1) , 2) , 3) , 4)
"correct": 1|2|3|4 (1-based index into options)
"hint": 6..120 chars
"explanation": 12..200 chars

STYLE
Plain text only. ASCII. No LaTeX. No extra keys or nesting.

VALIDATION
Exactly ${count} items
Each item has all 6 keys
options length is 4
correct in [1,2,3,4]
All strings trimmed and non-empty
All options should have Oppropriate content, actual options.

LANGUAGE
${getLocale().instruction}

FAIL-SAFE
If uncertain, pick the standard interpretation of the topic.
Output only the JSON array.${formatInstructions(opts?.instructions)}`
}

function buildStrictPrompt(count: number) {
  return `RETRY: STRICT FORMAT ONLY

OUTPUT
Only a JSON array with ${count} objects. No markdown. No extra text.

FIELDS
id 1..${count}
question 12..160 chars
options exactly 4 strings; prefixed A) , B) , C) , D)  OR  1) , 2) , 3) , 4)
correct 1|2|3|4
hint 6..120 chars
explanation 12..200 chars`
}

function stripFences(s: string) { return s.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, "").trim() }
function extractArray(s: string) { const m = s.match(/\[[\s\S]*\]/); return m ? m[0] : s }
function tryParse<T = unknown>(s: string): T | null { try { return JSON.parse(s) as T } catch { return null } }
function nstr(x: any, min = 1, max = 240) { const t = String(x ?? "").replace(/\s+/g, " ").trim(); return t.length < min ? "" : t.slice(0, max) }
function to1_4(v: any) {
  if (typeof v === "number") return v < 1 ? 1 : v > 4 ? 4 : v
  const t = String(v ?? "").trim().toUpperCase()
  if (/^[1-4]$/.test(t)) return Number(t)
  if (t.startsWith("A")) return 1
  if (t.startsWith("B")) return 2
  if (t.startsWith("C")) return 3
  if (t.startsWith("D")) return 4
  const d = t.match(/\d/); if (d) { const n = Number(d[0]); if (n >= 1 && n <= 4) return n }
  return 1
}
function splitOptions(v: any) { if (Array.isArray(v)) return v; if (typeof v === "string") return v.split(/[,;|]\s*/).map(s => s.trim()).filter(Boolean); return [] }
function cleanOptions(v: any) {
  let o = splitOptions(v).map(s => s.replace(/^\s*(?:[A-D]\)|[1-4]\))\s*/i, "").trim())
  const seen = new Set<string>(), out: string[] = []
  for (const x of o) { const k = x.toLowerCase(); if (!k || seen.has(k)) continue; seen.add(k); out.push(x); if (out.length === 4) break }
  while (out.length < 4) out.push(`Option ${out.length + 1}`)
  const pref = Math.random() < 0.5 ? ["A) ", "B) ", "C) ", "D) "] : ["1) ", "2) ", "3) ", "4) "]
  return out.slice(0, 4).map((t, i) => (pref[i] + t).trim())
}
function coerce(items: any): QuizItem[] {
  const arr = Array.isArray(items) ? items : []
  return arr.map((o: any, i: number): QuizItem => {
    const q = nstr(o?.question, 12, 160) || `Question ${i + 1}`
    const opts = cleanOptions(o?.options)
    const correct = to1_4(o?.correct)
    const hint = nstr(o?.hint, 6, 120) || "Use the core idea."
    const explanation = nstr(o?.explanation, 12, 200) || "The correct option matches the main idea; others do not."
    return { id: i + 1, question: q, options: opts, correct, hint, explanation }
  })
}
function validItem(x: any) {
  return x && typeof x.id === "number" && typeof x.question === "string"
    && Array.isArray(x.options) && x.options.length === 4 && x.options.every((o: any) => typeof o === "string")
    && typeof x.correct === "number" && x.correct >= 1 && x.correct <= 4
    && typeof x.hint === "string" && typeof x.explanation === "string"
}
function validQuiz(a: any): a is QuizItem[] { return Array.isArray(a) && a.length > 0 && a.every(validItem) }

async function ask(topicIn: any, sys: string, model: LLM) {
  const topic = normalizeTopic(topicIn)
  const msgs = [
    { role: "system", content: sys },
    { role: "user", content: `Topic:\n${topic}\nReturn only the JSON array.` }
  ] as const
  const r = await model.invoke([...msgs] as any)
  const raw = typeof r === "string" ? r : String((r as any)?.content ?? "")
  const txt = extractArray(stripFences(raw))
  return tryParse<any>(txt)
}

export async function handleQuiz(topic: string, llmOverride?: LLM, opts?: QuizOpts): Promise<QuizItem[]> {
  const model = llmOverride || llm
  const count = Math.max(3, Math.min(20, opts?.length || 5))
  const sys = buildSysPrompt(opts)
  const parsed = await ask(topic, sys, model)
  if (parsed) {
    const out = coerce(parsed)
    if (validQuiz(out)) return out
  }
  const parsed2 = await ask(topic, buildStrictPrompt(count), model)
  const out2 = coerce(parsed2)
  if (!validQuiz(out2)) throw new Error("Invalid quiz JSON from model")
  return out2
}