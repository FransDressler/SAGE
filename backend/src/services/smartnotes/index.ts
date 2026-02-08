import fs from "fs"
import path from "path"
import llm from "../../utils/llm/llm"
import type { LLM } from "../../utils/llm/models/types"
import { normalizeTopic } from "../../utils/text/normalize"
import { execDirect } from "../../agents/runtime"
import { getLocale } from "../../lib/prompts/locale"
import { formatInstructions } from "../../lib/prompts/instructions"
import type { UserInstructions } from "../../types/instructions"

export type SmartNotesOptions = { topic?: any; notes?: string; filePath?: string; length?: string; subjectId?: string; sourceIds?: string[]; instructions?: UserInstructions }
export type SmartNotesResult = { ok: boolean; file: string }

async function readInput(opts: SmartNotesOptions) {
  if (opts.notes) return opts.notes
  if (opts.filePath) return await fs.promises.readFile(opts.filePath, "utf8")
  if (opts.topic) return `Generate detailed study notes on: ${normalizeTopic(opts.topic)}`
  throw new Error("No input")
}

const LENGTH_GUIDE: Record<string, string> = {
  short: "Keep notes concise and focused on key points only. Include 3-5 review questions.",
  medium: "Generate standard detailed study notes covering all important topics. Include 5-8 review questions.",
  long: "Generate comprehensive, in-depth notes covering every concept thoroughly with examples and explanations. Include 8-12 review questions.",
}

function stripCodeFences(text: string): string {
  let s = text.trim()
  // Remove leading ```markdown or ``` and trailing ```
  s = s.replace(/^```(?:markdown|md)?\s*\n?/i, "")
  s = s.replace(/\n?```\s*$/i, "")
  // Remove any preamble before the first heading
  const headingIdx = s.indexOf("\n#")
  if (headingIdx > 0 && s[0] !== "#") {
    s = s.slice(headingIdx + 1)
  } else if (s[0] !== "#") {
    // If the very first character could be a heading after trimming
    const trimmed = s.trimStart()
    if (trimmed[0] === "#") s = trimmed
  }
  return s.trim()
}

async function generateNotes(text: string, model: LLM, length?: string, instructions?: UserInstructions): Promise<string> {
  const lengthGuide = LENGTH_GUIDE[length || "medium"] || LENGTH_GUIDE.medium
  const prompt = `
ROLE
You are a study note generator producing well-structured Markdown notes.

OBJECTIVE
${lengthGuide}

OUTPUT FORMAT
Return ONLY well-formatted Markdown. Structure the output with:
- A top-level heading (# Title) summarizing the topic
- ## Notes section with the main study content, using sub-headings (###), bullet points, bold terms, and tables where appropriate
- ## Summary section with a concise overview of the key takeaways
- ## Review Questions section with numbered questions and their answers

LANGUAGE
${getLocale().instruction}

RULES
- Do not wrap the output in code fences.
- Do not add commentary or preamble before the Markdown.
- Start directly with the # heading.
- Use standard Markdown syntax (headings, lists, bold, tables, blockquotes).
${formatInstructions(instructions)}`.trim()

  const r1 = await model.invoke([{ role: "user", content: prompt + "\n\nINPUT:\n" + text }] as any)
  const raw1 = typeof r1 === "string" ? r1 : String((r1 as any)?.content ?? "")
  const md1 = stripCodeFences(raw1)
  if (md1.startsWith("#")) return md1

  // Retry once
  const r2 = await model.invoke([
    { role: "system", content: "Return only Markdown. Start with a # heading. No code fences. No extra text." },
    { role: "user", content: prompt + "\n\nINPUT:\n" + text }
  ] as any)
  const raw2 = typeof r2 === "string" ? r2 : String((r2 as any)?.content ?? "")
  const md2 = stripCodeFences(raw2)
  if (md2.startsWith("#")) return md2

  // Fallback: return whatever we got, ensure it starts with a heading
  const fallback = md2 || md1 || raw1
  return fallback.startsWith("#") ? fallback : `# Notes\n\n${fallback}`
}

async function writeMarkdownFile(markdown: string, outDir: string, title: string): Promise<string> {
  await fs.promises.mkdir(outDir, { recursive: true })
  const safeTitle = (title || "notes").replace(/[^a-z0-9]/gi, "_").slice(0, 50)
  const ts = new Date().toISOString().replace(/[:.]/g, "-")
  const outPath = path.join(outDir, `${safeTitle || "notes"}_${ts}.md`)
  await fs.promises.writeFile(outPath, markdown, "utf8")
  return outPath
}

async function retrieveContext(topic: string, subjectId: string, sourceIds?: string[]): Promise<string> {
  try {
    const safeQ = normalizeTopic(topic)
    const rag = await execDirect({
      agent: "researcher",
      plan: { steps: [{ tool: "rag.search", input: { q: safeQ, ns: subjectId, k: 12 }, timeoutMs: 8000, retries: 1 }] },
      ctx: { ns: subjectId }
    })

    const ragResult = (rag as any)?.result
    let docs: Array<{ text?: string; meta?: any }> = Array.isArray(ragResult) ? ragResult : []

    if (sourceIds && sourceIds.length > 0) {
      const allowed = new Set(sourceIds)
      docs = docs.filter(d => d?.meta?.sourceId && allowed.has(d.meta.sourceId))
    }

    docs.sort((a, b) => {
      const fileA = a?.meta?.sourceFile || ""
      const fileB = b?.meta?.sourceFile || ""
      if (fileA !== fileB) return fileA.localeCompare(fileB)
      return (a?.meta?.chunkIndex || 0) - (b?.meta?.chunkIndex || 0)
    })

    return docs.map(d => {
      const m = d?.meta
      const source = m?.sourceFile
        ? `[Source: ${m.sourceFile}${m.pageNumber ? `, p.${m.pageNumber}` : ""}]`
        : ""
      return `${source}\n${d?.text || ""}`.trim()
    }).join("\n\n---\n\n")
  } catch (e) {
    console.warn("[smartnotes] RAG retrieval failed, proceeding without context:", e)
    return ""
  }
}

export async function handleSmartNotes(opts: SmartNotesOptions, llmOverride?: LLM): Promise<SmartNotesResult> {
  let input = await readInput(opts)

  if (opts.subjectId && !opts.notes && !opts.filePath) {
    const context = await retrieveContext(String(opts.topic || ""), opts.subjectId, opts.sourceIds)
    if (context) {
      input = `Topic: ${normalizeTopic(String(opts.topic || ""))}\n\nSource material:\n${context}`
    }
  }

  const model = llmOverride || llm
  const markdown = await generateNotes(input, model, opts.length, opts.instructions)

  const outDir = opts.subjectId
    ? path.join(process.cwd(), "subjects", opts.subjectId, "smartnotes")
    : path.join(process.cwd(), "storage", "smartnotes")

  const title = String(opts.topic || "notes")
  const outPath = await writeMarkdownFile(markdown, outDir, title)
  return { ok: true, file: outPath }
}
