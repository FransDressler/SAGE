import fs from "fs"
import path from "path"
import llm from "../../utils/llm/llm"
import type { LLM } from "../../utils/llm/models/types"
import { getSourcesDir, listSources, type Source } from "../../utils/subjects/subjects"
import { getLocale } from "../../lib/prompts/locale"
import { formatInstructions } from "../../lib/prompts/instructions"
import type { UserInstructions } from "../../types/instructions"

export type ExamQuestion = {
  id: number
  question: string
  type: "open" | "mcq"
  options?: string[]
  correctAnswer?: string
  hint: string
  solution: string
  points: number
  source: string
}

export type ExamConfig = {
  sourceIds: string[]
  timeLimit?: number
  shuffle?: boolean
  maxQuestions?: number
  instructions?: UserInstructions
}

export type ExamResult = {
  type: "exam"
  questions: ExamQuestion[]
  totalPoints: number
  timeLimit: number
}

function buildGenerationPrompt(instructions?: UserInstructions) {
  return `ROLE
You are a university professor writing a NEW practice exam. You are given example questions from a previous exam ONLY to understand what topics to cover and at what depth. Your exam must be completely original.

ORIGINALITY REQUIREMENTS — THIS IS CRITICAL
- NEVER reuse a question, scenario, or phrasing from the reference material
- If the original asks "What is X?", you might ask "Compare X and Y" or "Why does X fail when…?" or "Given this scenario, which principle applies?"
- If the original uses specific numbers (e.g. 5 kg, 300 K), use COMPLETELY different values and a different physical setup
- If the original asks to calculate A from B, ask to calculate B from A, or derive a different quantity from the same topic
- Invert, combine, or reframe — test the same knowledge from a different angle
- Your questions should surprise a student who memorized the old exam

FOR EACH QUESTION, FOLLOW THIS 3-STEP PROCESS:
1. Write the question
2. Write a detailed step-by-step solution
3. SELF-CHECK: Re-read your question. Does it contain ALL information (values, constants, context, definitions) needed to solve it? If anything is missing, add it to the question text before finalizing.

OUTPUT CONTRACT
Return only a JSON array of objects. No markdown, no code fences, no prose outside the JSON.

SCHEMA
"id": sequential number starting at 1
"question": your original question. Use markdown: **bold**, $...$ inline math, $$...$$ display math. Include all necessary data, values, and constants directly in the question text so it is fully self-contained and solvable.
"type": "mcq" if multiple-choice, "open" otherwise
"options": array of exactly 4 plausible answer strings (mcq only, omit for open). Distractors must represent real misconceptions.
"correctAnswer": for mcq: the correct option text verbatim. For open: the final answer (concise).
"hint": 1-2 sentences that nudge the student toward the right approach WITHOUT revealing the answer. E.g. "Think about conservation of energy" or "Consider the boundary conditions".
"solution": a detailed step-by-step walkthrough of how to solve the question, including all intermediate steps, formulas used, and the final result. Use markdown and LaTeX. This should be a complete model answer that would earn full marks.
"points": 1 = recall, 2 = application, 3 = analysis/synthesis
"source": leave as empty string

LANGUAGE
${getLocale().instruction}

OUTPUT
Only the JSON array.${formatInstructions(instructions)}`
}

function buildStrictPrompt() {
  return `RETRY: STRICT FORMAT ONLY

Generate completely ORIGINAL exam questions inspired by the topics in the source material. Do NOT copy or closely paraphrase the original questions. Use different angles, scenarios, and values.

For each question: write it, write the full solution, then self-check that the question contains all info needed to solve it.

OUTPUT
Only a JSON array of question objects. No markdown fences. No extra text.

FIELDS
id: sequential number
question: original question (markdown/$LaTeX$, fully self-contained with all needed data)
type: "mcq" or "open"
options: array of exactly 4 strings (mcq only, omit for open)
correctAnswer: correct answer (mcq: exact option text, open: concise final answer)
hint: 1-2 sentence nudge toward the approach (don't reveal answer)
solution: detailed step-by-step walkthrough with formulas and intermediate steps
points: number (1-3)
source: empty string`
}

function stripFences(s: string) { return s.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, "").trim() }
function extractArray(s: string) { const m = s.match(/\[[\s\S]*\]/); return m ? m[0] : s }
function tryParse<T = unknown>(s: string): T | null { try { return JSON.parse(s) as T } catch { return null } }

function coerceQuestion(raw: any, idx: number): ExamQuestion {
  const q: ExamQuestion = {
    id: idx + 1,
    question: String(raw?.question ?? `Question ${idx + 1}`).trim(),
    type: raw?.type === "mcq" ? "mcq" : "open",
    points: typeof raw?.points === "number" && raw.points > 0 ? raw.points : 1,
    hint: typeof raw?.hint === "string" ? raw.hint.trim() : "Review the core concepts related to this topic.",
    solution: typeof raw?.solution === "string" ? raw.solution.trim() : "",
    source: String(raw?.source ?? ""),
  }
  if (q.type === "mcq" && Array.isArray(raw?.options) && raw.options.length >= 2) {
    q.options = raw.options.map((o: any) => String(o).trim())
  } else if (q.type === "mcq") {
    q.type = "open"
  }
  if (raw?.correctAnswer != null) {
    q.correctAnswer = String(raw.correctAnswer).trim()
  }
  return q
}

function validQuestion(q: any): boolean {
  return q && typeof q.question === "string" && q.question.length > 3
    && (q.type === "open" || q.type === "mcq")
}

async function readSourceText(subjectId: string, source: Source): Promise<string> {
  const sourcesDir = getSourcesDir(subjectId)
  const txtPath = path.join(sourcesDir, source.filename + ".txt")
  if (fs.existsSync(txtPath)) {
    return fs.readFileSync(txtPath, "utf-8")
  }
  const rawPath = path.join(sourcesDir, source.filename)
  if (fs.existsSync(rawPath)) {
    return fs.readFileSync(rawPath, "utf-8")
  }
  return ""
}

async function generateQuestions(
  text: string,
  sourceName: string,
  model: LLM,
  instructions?: UserInstructions
): Promise<ExamQuestion[]> {
  const sys = buildGenerationPrompt(instructions)
  const msgs = [
    { role: "system", content: sys },
    { role: "user", content: `Here are example exam/exercise questions for reference. Study the topics and difficulty, then generate NEW original questions:\n\n${text}\n\nReturn only the JSON array of your newly created questions.` },
  ] as const

  const r = await model.invoke([...msgs] as any)
  const raw = typeof r === "string" ? r : String((r as any)?.content ?? "")
  const txt = extractArray(stripFences(raw))
  let parsed = tryParse<any[]>(txt)

  if (!parsed || !Array.isArray(parsed)) {
    const r2 = await model.invoke([
      { role: "system", content: buildStrictPrompt() },
      { role: "user", content: `Example questions for topic reference:\n\n${text}\n\nGenerate NEW original questions. Return only the JSON array.` },
    ] as any)
    const raw2 = typeof r2 === "string" ? r2 : String((r2 as any)?.content ?? "")
    parsed = tryParse<any[]>(extractArray(stripFences(raw2)))
  }

  if (!Array.isArray(parsed)) return []

  return parsed
    .map((item, i) => coerceQuestion(item, i))
    .filter(validQuestion)
    .map(q => ({ ...q, source: sourceName }))
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export async function handleExam(
  subjectId: string,
  config: ExamConfig,
  llmOverride?: LLM,
  onPhase?: (phase: string) => void
): Promise<ExamResult> {
  const model = llmOverride || llm
  const allSources = await listSources(subjectId)
  const exerciseSources = allSources.filter(
    s => config.sourceIds.includes(s.id) && (s.sourceType || "material") === "exercise"
  )

  if (exerciseSources.length === 0) {
    const anySources = allSources.filter(s => config.sourceIds.includes(s.id))
    if (anySources.length === 0) throw new Error("No matching sources found")
    exerciseSources.push(...anySources)
  }

  onPhase?.("generating")

  const allQuestions: ExamQuestion[] = []
  for (const source of exerciseSources) {
    const text = await readSourceText(subjectId, source)
    if (!text.trim()) continue
    const questions = await generateQuestions(text, source.originalName, model, config.instructions)
    allQuestions.push(...questions)
  }

  if (allQuestions.length === 0) {
    throw new Error("No questions could be generated from the selected sources")
  }

  onPhase?.("assembling")

  let questions = config.shuffle ? shuffle(allQuestions) : allQuestions
  if (config.maxQuestions && config.maxQuestions > 0) {
    questions = questions.slice(0, config.maxQuestions)
  }

  questions = questions.map((q, i) => ({ ...q, id: i + 1 }))
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)

  return {
    type: "exam",
    questions,
    totalPoints,
    timeLimit: config.timeLimit || 0,
  }
}
