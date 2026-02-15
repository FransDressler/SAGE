import fs from "fs"
import path from "path"
import llm, { embeddings } from "../../utils/llm/llm"
import type { LLM } from "../../utils/llm/models/types"
import { normalizeTopic } from "../../utils/text/normalize"
import { getLocale } from "../../lib/prompts/locale"
import { formatInstructions } from "../../lib/prompts/instructions"
import { getRetrieverWithParents } from "../../utils/database/db"
import { getSubjectGraph } from "../subjectgraph"
import { fetchWikipediaForTopics } from "./wikipedia"
import { extractImageUrls, buildImageParts } from "../../lib/ai/imageUtils"
import type { UserInstructions } from "../../types/instructions"

export type SmartNotesMode = "summary" | "deep" | "study-guide"
export type SmartNotesOptions = {
  topic?: any
  notes?: string
  filePath?: string
  length?: string
  mode?: SmartNotesMode
  subjectId?: string
  sourceIds?: string[]
  instructions?: UserInstructions
  onProgress?: (phase: string, detail?: string) => void
}
export type SmartNotesResult = { ok: boolean; file: string }

type ProgressFn = (phase: string, detail?: string) => void

// --- Outline types ---

type SectionOutline = { heading: string; description: string; keyTerms: string[] }
type Outline = { title: string; sections: SectionOutline[] }

// --- Section context ---

type SectionContext = {
  ragText: string
  imageUrls: string[]
  wikiText: string
}

// --- Helpers ---

function toText(out: any): string {
  if (!out) return ""
  if (typeof out === "string") return out
  if (typeof out?.content === "string") return out.content
  if (Array.isArray(out?.content)) return out.content.map((p: any) => (typeof p === "string" ? p : p?.text ?? "")).join("")
  return String(out ?? "")
}

function stripCodeFences(text: string): string {
  let s = text.trim()
  s = s.replace(/^```(?:markdown|md)?\s*\n?/i, "")
  s = s.replace(/\n?```\s*$/i, "")
  return s.trim()
}

function tryParseJson<T = unknown>(s: string): T | null {
  // Try raw parse first
  try { return JSON.parse(s) as T } catch {}
  // Extract first JSON object
  let depth = 0, start = -1
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "{") { if (depth === 0) start = i; depth++ }
    else if (s[i] === "}") { depth--; if (depth === 0 && start !== -1) {
      try { return JSON.parse(s.slice(start, i + 1)) as T } catch { return null }
    }}
  }
  return null
}

const LENGTH_SECTIONS: Record<string, number> = { short: 3, medium: 5, long: 8 }
const MAX_CONTEXT_PER_SECTION = 12000

async function readInput(opts: SmartNotesOptions): Promise<string> {
  if (opts.notes) return opts.notes
  if (opts.filePath) return await fs.promises.readFile(opts.filePath, "utf8")
  if (opts.topic) return normalizeTopic(String(opts.topic))
  throw new Error("No input")
}

// ============================================================
// Phase 1: PLAN — Graph context + outline generation
// ============================================================

async function getGraphContext(subjectId: string | undefined, topic: string): Promise<string> {
  if (!subjectId) return ""
  try {
    const graph = await getSubjectGraph(subjectId)
    if (!graph || !graph.nodes.length) return ""

    const topicLower = topic.toLowerCase()
    const topicTerms = topicLower.split(/\s+/).filter(t => t.length > 2)

    // Find nodes that match the topic
    const matchedIds = new Set<string>()
    for (const node of graph.nodes) {
      const label = node.label.toLowerCase()
      if (label.includes(topicLower) || topicTerms.some(t => label.includes(t))) {
        matchedIds.add(node.id)
      }
    }

    if (matchedIds.size === 0) return ""

    // 1-hop neighbors
    const neighborIds = new Set<string>()
    for (const edge of graph.edges) {
      if (matchedIds.has(edge.source)) neighborIds.add(edge.target)
      if (matchedIds.has(edge.target)) neighborIds.add(edge.source)
    }

    // Collect relevant concepts
    const concepts: string[] = []
    for (const node of graph.nodes) {
      if (matchedIds.has(node.id) || neighborIds.has(node.id)) {
        const relation = matchedIds.has(node.id) ? "direct" : "related"
        concepts.push(`- ${node.label} (${relation}, ${node.category}): ${node.description}`)
      }
    }

    // Collect relevant relationships
    const relationships: string[] = []
    const allRelevant = new Set([...matchedIds, ...neighborIds])
    for (const edge of graph.edges) {
      if (allRelevant.has(edge.source) && allRelevant.has(edge.target)) {
        const fromLabel = graph.nodes.find(n => n.id === edge.source)?.label || edge.source
        const toLabel = graph.nodes.find(n => n.id === edge.target)?.label || edge.target
        relationships.push(`- ${fromLabel} → ${edge.label} → ${toLabel}`)
      }
    }

    if (concepts.length === 0) return ""

    return `KNOWLEDGE GRAPH CONTEXT:\nConcepts:\n${concepts.join("\n")}\n\nRelationships:\n${relationships.join("\n")}`
  } catch (e) {
    console.warn("[smartnotes] graph context failed:", e)
    return ""
  }
}

async function generateOutline(
  topic: string,
  graphContext: string,
  model: LLM,
  length?: string,
  mode?: SmartNotesMode
): Promise<Outline> {
  const sectionCount = LENGTH_SECTIONS[length || "medium"] || 5
  const { instruction: lang } = getLocale()

  const modeGuide = mode === "study-guide"
    ? "Focus on exam preparation: include practice questions, key definitions, and common pitfalls."
    : mode === "summary"
    ? "Keep it concise — focus on the most important points only."
    : "Be comprehensive and detailed — explain concepts in depth with examples."

  const prompt = `You are planning detailed study notes on: "${topic}"

${graphContext ? graphContext + "\n\n" : ""}${modeGuide}
${lang}

Generate a structured outline with exactly ${sectionCount} sections.
Return ONLY a JSON object:
{
  "title": "Notes title",
  "sections": [
    { "heading": "Section heading", "description": "What this section covers", "keyTerms": ["term1", "term2"] }
  ]
}

Guidelines:
- Use the knowledge graph context to identify related topics and connections
- Each section should cover a distinct aspect of the topic
- keyTerms should be specific search terms for retrieving relevant material
- Use the same language as the topic`

  const res = await model.invoke([{ role: "user", content: prompt }] as any)
  const raw = toText(res)
  const parsed = tryParseJson<any>(raw)

  if (parsed?.title && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
    return {
      title: parsed.title,
      sections: parsed.sections.filter((s: any) => s?.heading).map((s: any) => ({
        heading: String(s.heading),
        description: String(s.description || ""),
        keyTerms: Array.isArray(s.keyTerms) ? s.keyTerms.map(String) : [],
      })),
    }
  }

  // Fallback: single section
  return {
    title: topic,
    sections: [{ heading: topic, description: `Comprehensive notes on ${topic}`, keyTerms: [topic] }],
  }
}

// ============================================================
// Phase 2: GATHER — RAG retrieval + Wikipedia (parallel)
// ============================================================

async function retrieveForSection(
  section: SectionOutline,
  subjectId: string,
  sourceIds?: string[]
): Promise<{ text: string; imageUrls: string[] }> {
  const ns = `subject:${subjectId}`
  const query = [section.heading, ...section.keyTerms].join(" ")

  try {
    const retriever = await getRetrieverWithParents(ns, embeddings as any, { k: 8 })
    let docs = await retriever.invoke(query)

    // Filter by sourceIds if specified
    if (sourceIds?.length) {
      const allowed = new Set(sourceIds)
      const filtered = docs.filter(d => d.metadata?.sourceId && allowed.has(d.metadata.sourceId))
      if (filtered.length > 0) docs = filtered
    }

    // Sort by source file + chunk index
    docs.sort((a, b) => {
      const fA = a.metadata?.sourceFile || ""
      const fB = b.metadata?.sourceFile || ""
      if (fA !== fB) return fA.localeCompare(fB)
      return (a.metadata?.chunkIndex || 0) - (b.metadata?.chunkIndex || 0)
    })

    const imageUrls: string[] = []
    const text = docs.map(d => {
      const m = d.metadata
      const source = m?.sourceFile
        ? `[Source: ${m.sourceFile}${m.pageNumber ? `, p.${m.pageNumber}` : ""}]`
        : ""

      // Collect image URLs
      const imgs = extractImageUrls(d.pageContent)
      imageUrls.push(...imgs)

      return `${source}\n${d.pageContent}`.trim()
    }).join("\n\n---\n\n")

    return { text: text.slice(0, MAX_CONTEXT_PER_SECTION), imageUrls: [...new Set(imageUrls)] }
  } catch (e) {
    console.warn(`[smartnotes] RAG retrieval failed for "${section.heading}":`, e)
    return { text: "", imageUrls: [] }
  }
}

async function gatherContext(
  outline: Outline,
  subjectId: string | undefined,
  sourceIds: string[] | undefined,
  emit: ProgressFn
): Promise<Map<string, SectionContext>> {
  const contexts = new Map<string, SectionContext>()

  if (!subjectId) {
    for (const section of outline.sections) {
      contexts.set(section.heading, { ragText: "", imageUrls: [], wikiText: "" })
    }
    return contexts
  }

  // Parallel: RAG retrieval for all sections + Wikipedia for key terms
  emit("gathering", "Retrieving study material...")

  const allKeyTerms = [
    outline.title,
    ...outline.sections.flatMap(s => [s.heading, ...s.keyTerms]),
  ]

  const [ragResults, wikiResults] = await Promise.all([
    // RAG retrieval per section
    Promise.all(outline.sections.map(async (section, i) => {
      emit("gathering", `Retrieving: ${section.heading} (${i + 1}/${outline.sections.length})`)
      return {
        heading: section.heading,
        result: await retrieveForSection(section, subjectId, sourceIds),
      }
    })),
    // Wikipedia for topics
    fetchWikipediaForTopics(allKeyTerms).catch(() => new Map<string, string>()),
  ])

  for (const { heading, result } of ragResults) {
    // Find best matching wiki content for this section
    const section = outline.sections.find(s => s.heading === heading)!
    const wikiParts: string[] = []
    for (const term of [heading, ...section.keyTerms]) {
      const wiki = wikiResults.get(term)
      if (wiki) wikiParts.push(wiki)
    }

    contexts.set(heading, {
      ragText: result.text,
      imageUrls: result.imageUrls,
      wikiText: wikiParts.join("\n\n"),
    })
  }

  return contexts
}

// ============================================================
// Phase 3: GENERATE — Parallel section generation + formula sheet
// ============================================================

async function generateSection(
  section: SectionOutline,
  context: SectionContext,
  model: LLM,
  opts: SmartNotesOptions,
  totalSections: number
): Promise<string> {
  const { instruction: lang } = getLocale()
  const depthGuide = opts.length === "long"
    ? "Be comprehensive and thorough. Include examples, edge cases, and detailed explanations."
    : opts.length === "short"
    ? "Be concise. Focus on the most important points."
    : "Balance depth and brevity. Cover key concepts with clear explanations."

  const modeGuide = opts.mode === "study-guide"
    ? "\n- Include 2-3 practice questions at the end of this section with answers"
    : ""

  const imageInstruction = context.imageUrls.length > 0
    ? `\nIMAGES\nThe following images from the study material are relevant. Include them in your notes using the exact markdown syntax where they help explain concepts:\n${context.imageUrls.map(url => `![](${url})`).join("\n")}`
    : ""

  const prompt = `Write the "${section.heading}" section for study notes.
Section description: ${section.description}

${depthGuide}${modeGuide}
${lang}
${formatInstructions(opts.instructions)}

RULES:
- Output ONLY well-formatted Markdown for this single section
- Start with ## ${section.heading}
- Use sub-headings (###), bullet points, bold terms, tables where appropriate
- Write ALL math using LaTeX: inline $...$ and display $$...$$
- Never use \\(...\\) or \\[...\\] delimiters${imageInstruction}
- Do not wrap output in code fences
- Do not add preamble or commentary

STUDY MATERIAL:
${context.ragText || "(No material retrieved for this section)"}

${context.wikiText ? `SUPPLEMENTARY INFORMATION (from Wikipedia — use to add context, not as primary source):\n${context.wikiText}` : ""}`

  // Build message content — include images if LLM supports vision
  const messageParts: any[] = [{ type: "text", text: prompt }]
  if (context.imageUrls.length > 0) {
    const imgParts = buildImageParts(context.imageUrls, 5)
    messageParts.push(...imgParts)
  }

  const res = await model.invoke([{ role: "user", content: messageParts.length > 1 ? messageParts : prompt }] as any)
  return stripCodeFences(toText(res))
}

async function generateFormulaSheet(
  contexts: Map<string, SectionContext>,
  model: LLM
): Promise<string> {
  // Collect all RAG text and scan for formulas
  const allText = [...contexts.values()].map(c => c.ragText).join("\n")

  // Check if there are any formulas worth extracting
  const inlineCount = (allText.match(/\$[^$]+\$/g) || []).length
  const displayCount = (allText.match(/\$\$[^$]+\$\$/g) || []).length
  if (inlineCount + displayCount < 2) return ""

  const { instruction: lang } = getLocale()

  const prompt = `Extract and organize ALL important formulas and equations from the following study material.

${lang}

OUTPUT FORMAT:
## Quick Reference: Key Formulas

Organize formulas by topic in a table or list format:
- Formula name / description
- The formula in LaTeX ($$...$$)
- Brief one-line explanation of variables

RULES:
- Use LaTeX with dollar-sign delimiters only
- Include every distinct formula found
- Group related formulas together
- Do not add formulas not found in the material
- No code fences, no preamble

MATERIAL:
${allText.slice(0, 15000)}`

  const res = await model.invoke([{ role: "user", content: prompt }] as any)
  const result = stripCodeFences(toText(res))

  if (!result || result.length < 20) return ""
  return result
}

async function generateSections(
  outline: Outline,
  contexts: Map<string, SectionContext>,
  model: LLM,
  opts: SmartNotesOptions,
  emit: ProgressFn
): Promise<string[]> {
  const MAX_CONCURRENT = 3
  const results: string[] = new Array(outline.sections.length).fill("")

  for (let i = 0; i < outline.sections.length; i += MAX_CONCURRENT) {
    const batch = outline.sections.slice(i, i + MAX_CONCURRENT)
    const batchResults = await Promise.all(
      batch.map(async (section, j) => {
        const idx = i + j
        emit("generating", `Writing section ${idx + 1}/${outline.sections.length}: ${section.heading}`)
        const ctx = contexts.get(section.heading) || { ragText: "", imageUrls: [], wikiText: "" }
        return generateSection(section, ctx, model, opts, outline.sections.length)
      })
    )
    batchResults.forEach((text, j) => { results[i + j] = text })
  }

  return results
}

// ============================================================
// Phase 4: ASSEMBLE — Combine everything into final markdown
// ============================================================

function assembleMarkdown(
  outline: Outline,
  sections: string[],
  formulaSheet: string,
  mode?: SmartNotesMode
): string {
  const parts: string[] = []

  // Title
  parts.push(`# ${outline.title}`)
  parts.push("")

  // Sections
  for (let i = 0; i < sections.length; i++) {
    const text = sections[i]
    if (text.trim()) {
      // Ensure section starts with ## heading
      if (!text.startsWith("## ")) {
        parts.push(`## ${outline.sections[i]?.heading || `Section ${i + 1}`}`)
        parts.push("")
      }
      parts.push(text)
      parts.push("")
    }
  }

  // Formula quick reference
  if (formulaSheet) {
    parts.push("---")
    parts.push("")
    parts.push(formulaSheet)
    parts.push("")
  }

  return parts.join("\n")
}

async function writeMarkdownFile(markdown: string, outDir: string, title: string): Promise<string> {
  await fs.promises.mkdir(outDir, { recursive: true })
  const safeTitle = (title || "notes").replace(/[^a-z0-9]/gi, "_").slice(0, 50)
  const ts = new Date().toISOString().replace(/[:.]/g, "-")
  const outPath = path.join(outDir, `${safeTitle || "notes"}_${ts}.md`)
  await fs.promises.writeFile(outPath, markdown, "utf8")
  return outPath
}

// ============================================================
// Main entry point
// ============================================================

export async function handleSmartNotes(opts: SmartNotesOptions, llmOverride?: LLM): Promise<SmartNotesResult> {
  const model = llmOverride || llm
  const emit: ProgressFn = opts.onProgress || (() => {})
  const mode = opts.mode || "deep"

  // For "summary" mode or when notes/filePath are provided, use simplified single-call path
  if (mode === "summary" || opts.notes || opts.filePath) {
    return handleSimpleNotes(opts, model, emit)
  }

  const topic = normalizeTopic(String(opts.topic || ""))
  if (!topic) throw new Error("No topic provided")

  // Phase 1: Plan
  emit("planning", "Analyzing topic and connections...")
  const graphContext = await getGraphContext(opts.subjectId, topic)
  const outline = await generateOutline(topic, graphContext, model, opts.length, mode)

  // Phase 2: Gather
  emit("gathering", "Retrieving material and external sources...")
  const contexts = await gatherContext(outline, opts.subjectId, opts.sourceIds, emit)

  // Phase 3: Generate (sections + formula sheet in parallel)
  emit("generating", "Writing notes...")
  const [sections, formulaSheet] = await Promise.all([
    generateSections(outline, contexts, model, opts, emit),
    generateFormulaSheet(contexts, model),
  ])

  // Phase 4: Assemble
  emit("assembling", "Finalizing notes...")
  const markdown = assembleMarkdown(outline, sections, formulaSheet, mode)

  const outDir = opts.subjectId
    ? path.join(process.cwd(), "subjects", opts.subjectId, "smartnotes")
    : path.join(process.cwd(), "storage", "smartnotes")

  const outPath = await writeMarkdownFile(markdown, outDir, outline.title)
  emit("done")

  return { ok: true, file: outPath }
}

// Backward-compatible simple notes generation (for "summary" mode or raw text input)
async function handleSimpleNotes(opts: SmartNotesOptions, model: LLM, emit: ProgressFn): Promise<SmartNotesResult> {
  emit("generating", "Writing notes...")

  let input = ""
  if (opts.notes) input = opts.notes
  else if (opts.filePath) input = await fs.promises.readFile(opts.filePath, "utf8")
  else if (opts.topic) input = normalizeTopic(String(opts.topic))
  else throw new Error("No input")

  // Try to get RAG context if subjectId is provided
  if (opts.subjectId && !opts.notes && !opts.filePath) {
    try {
      const ns = `subject:${opts.subjectId}`
      const retriever = await getRetrieverWithParents(ns, embeddings as any, { k: 12 })
      const docs = await retriever.invoke(input)
      let filtered = docs
      if (opts.sourceIds?.length) {
        const allowed = new Set(opts.sourceIds)
        const f = docs.filter(d => d.metadata?.sourceId && allowed.has(d.metadata.sourceId))
        if (f.length > 0) filtered = f
      }
      const context = filtered.map(d => {
        const m = d.metadata
        const source = m?.sourceFile ? `[Source: ${m.sourceFile}${m.pageNumber ? `, p.${m.pageNumber}` : ""}]` : ""
        return `${source}\n${d.pageContent}`.trim()
      }).join("\n\n---\n\n")
      if (context) input = `Topic: ${input}\n\nSource material:\n${context}`
    } catch (e) {
      console.warn("[smartnotes] simple mode RAG failed:", e)
    }
  }

  const { instruction: lang } = getLocale()
  const lengthGuide: Record<string, string> = {
    short: "Keep notes concise and focused on key points only. Include 3-5 review questions.",
    medium: "Generate standard detailed study notes covering all important topics. Include 5-8 review questions.",
    long: "Generate comprehensive, in-depth notes covering every concept thoroughly with examples and explanations. Include 8-12 review questions.",
  }

  const prompt = `ROLE
You are a study note generator producing well-structured Markdown notes.

OBJECTIVE
${lengthGuide[opts.length || "medium"] || lengthGuide.medium}

OUTPUT FORMAT
Return ONLY well-formatted Markdown. Structure the output with:
- A top-level heading (# Title) summarizing the topic
- ## Notes section with the main study content
- ## Summary section with key takeaways
- ## Review Questions section with numbered Q&A

LANGUAGE
${lang}

RULES
- Do not wrap the output in code fences.
- Start directly with the # heading.
- Use standard Markdown syntax.
- Write math using LaTeX: $inline$ and $$display$$
${formatInstructions(opts.instructions)}

INPUT:
${input}`

  const res = await model.invoke([{ role: "user", content: prompt }] as any)
  const markdown = stripCodeFences(toText(res))
  const final = markdown.startsWith("#") ? markdown : `# Notes\n\n${markdown}`

  const outDir = opts.subjectId
    ? path.join(process.cwd(), "subjects", opts.subjectId, "smartnotes")
    : path.join(process.cwd(), "storage", "smartnotes")

  const title = String(opts.topic || "notes")
  const outPath = await writeMarkdownFile(final, outDir, title)
  emit("done")

  return { ok: true, file: outPath }
}
