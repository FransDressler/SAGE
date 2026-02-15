import fs from "fs"
import path from "path"
import llm, { embeddings } from "../../utils/llm/llm"
import type { LLM } from "../../utils/llm/models/types"
import { normalizeTopic } from "../../utils/text/normalize"
import { getLocale } from "../../lib/prompts/locale"
import { formatInstructions } from "../../lib/prompts/instructions"
import { getRetrieverWithParents } from "../../utils/database/db"
import { getSubjectGraph } from "../subjectgraph"
import { fetchWikipediaForTopics } from "../smartnotes/wikipedia"
import { searchArxiv } from "./arxiv"
import { searchPubmed } from "./pubmed"
import { config } from "../../config/env"
import type {
  ResearchOptions, ResearchResult, ResearchPlan,
  SubQuestion, GatheredContext, ArxivResult, PubmedResult,
} from "./types"

type ProgressFn = (phase: string, detail?: string) => void

const MAX_CONTEXT_PER_QUESTION = 15000
const MAX_CONCURRENT = 3

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
  try { return JSON.parse(s) as T } catch {}
  let depth = 0, start = -1
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "{") { if (depth === 0) start = i; depth++ }
    else if (s[i] === "}") { depth--; if (depth === 0 && start !== -1) {
      try { return JSON.parse(s.slice(start, i + 1)) as T } catch { return null }
    }}
  }
  return null
}

function truncate(text: string, maxChars: number): string {
  return text.length > maxChars ? text.slice(0, maxChars) + "\n[...truncated]" : text
}

// ============================================================
// Phase 1: ANALYZE — Read knowledge graph + RAG overview
// ============================================================

async function analyzeSubject(subjectId: string, topic: string, sourceIds?: string[]) {
  let graphContext = ""
  try {
    const graph = await getSubjectGraph(subjectId)
    if (graph?.nodes?.length) {
      const topicLower = topic.toLowerCase()
      const topicTerms = topicLower.split(/\s+/).filter(t => t.length > 2)

      const matchedIds = new Set<string>()
      for (const node of graph.nodes) {
        const label = node.label.toLowerCase()
        if (label.includes(topicLower) || topicTerms.some(t => label.includes(t)))
          matchedIds.add(node.id)
      }

      const neighborIds = new Set<string>()
      for (const edge of graph.edges) {
        if (matchedIds.has(edge.source)) neighborIds.add(edge.target)
        if (matchedIds.has(edge.target)) neighborIds.add(edge.source)
      }

      const concepts: string[] = []
      for (const node of graph.nodes) {
        if (matchedIds.has(node.id) || neighborIds.has(node.id)) {
          const relation = matchedIds.has(node.id) ? "direct" : "related"
          concepts.push(`- ${node.label} (${relation}, ${node.category}): ${node.description}`)
        }
      }

      const allRelevant = new Set([...matchedIds, ...neighborIds])
      const relationships: string[] = []
      for (const edge of graph.edges) {
        if (allRelevant.has(edge.source) && allRelevant.has(edge.target)) {
          const from = graph.nodes.find((n: any) => n.id === edge.source)?.label || edge.source
          const to = graph.nodes.find((n: any) => n.id === edge.target)?.label || edge.target
          relationships.push(`- ${from} → ${edge.label} → ${to}`)
        }
      }

      if (concepts.length > 0) {
        graphContext = `KNOWLEDGE GRAPH CONTEXT:\nConcepts:\n${concepts.join("\n")}\n\nRelationships:\n${relationships.join("\n")}`
      }
    }
  } catch (e) {
    console.warn("[research] graph context failed:", e)
  }

  // Broad RAG retrieval for topic
  let ragOverview = ""
  try {
    const ns = `subject:${subjectId}`
    const retriever = await getRetrieverWithParents(ns, embeddings as any, { k: 12 })
    let docs = await retriever.invoke(topic)

    if (sourceIds?.length) {
      const allowed = new Set(sourceIds)
      const filtered = docs.filter(d => d.metadata?.sourceId && allowed.has(d.metadata.sourceId))
      if (filtered.length > 0) docs = filtered
    }

    docs.sort((a, b) => {
      const fA = a.metadata?.sourceFile || ""
      const fB = b.metadata?.sourceFile || ""
      if (fA !== fB) return fA.localeCompare(fB)
      return (a.metadata?.chunkIndex || 0) - (b.metadata?.chunkIndex || 0)
    })

    ragOverview = docs.map(d => {
      const m = d.metadata
      const source = m?.sourceFile
        ? `[Source: ${m.sourceFile}${m.pageNumber ? `, p.${m.pageNumber}` : ""}]`
        : ""
      return `${source}\n${d.pageContent}`.trim()
    }).join("\n\n---\n\n")
  } catch (e) {
    console.warn("[research] RAG overview failed:", e)
  }

  return { graphContext, ragOverview }
}

// ============================================================
// Phase 2: PLAN — LLM generates research plan
// ============================================================

async function generateResearchPlan(
  topic: string,
  landscape: string,
  depth: string,
  model: LLM,
  instructions?: ResearchOptions["instructions"]
): Promise<ResearchPlan> {
  const { instruction: lang } = getLocale()

  const depthConfig: Record<string, { min: number; max: number; sources: string }> = {
    quick: { min: 3, max: 4, sources: "rag, wikipedia" },
    standard: { min: 5, max: 6, sources: "rag, wikipedia, arxiv, pubmed, web" },
    comprehensive: { min: 7, max: 8, sources: "rag, wikipedia, arxiv, pubmed, web" },
  }
  const dc = depthConfig[depth] || depthConfig.standard

  const prompt = `You are a research planning assistant. Given a topic and existing knowledge landscape,
create a research plan.

TOPIC: "${topic}"

${landscape ? landscape + "\n\n" : ""}

TASK:
1. Identify what is already known from the subject materials
2. Identify gaps in the current knowledge
3. Formulate ${dc.min}-${dc.max} sub-questions to investigate
4. For each sub-question, suggest which sources to query from: ${dc.sources}
5. Write a preliminary title and abstract

${lang}
${formatInstructions(instructions)}

Return ONLY a JSON object:
{
  "title": "Research paper title",
  "abstract": "Brief abstract of the planned research",
  "subQuestions": [
    {
      "id": "q1",
      "question": "The sub-question to investigate",
      "searchTerms": ["term1", "term2"],
      "expectedSources": ["rag", "wikipedia"]
    }
  ],
  "externalTopics": ["broad topic 1", "broad topic 2"]
}`

  const res = await model.invoke([{ role: "user", content: prompt }] as any)
  const raw = toText(res)
  const parsed = tryParseJson<any>(raw)

  if (parsed?.title && Array.isArray(parsed.subQuestions) && parsed.subQuestions.length > 0) {
    return {
      title: parsed.title,
      abstract: parsed.abstract || "",
      subQuestions: parsed.subQuestions
        .filter((q: any) => q?.question)
        .slice(0, config.research_max_sub_questions)
        .map((q: any, i: number) => ({
          id: q.id || `q${i + 1}`,
          question: String(q.question),
          searchTerms: Array.isArray(q.searchTerms) ? q.searchTerms.map(String) : [topic],
          expectedSources: Array.isArray(q.expectedSources) ? q.expectedSources : ["rag", "wikipedia"],
        })),
      externalTopics: Array.isArray(parsed.externalTopics) ? parsed.externalTopics.map(String) : [topic],
    }
  }

  // Fallback
  return {
    title: `Research: ${topic}`,
    abstract: `A research paper on ${topic}`,
    subQuestions: [{ id: "q1", question: `What are the key aspects of ${topic}?`, searchTerms: [topic], expectedSources: ["rag", "wikipedia"] }],
    externalTopics: [topic],
  }
}

// ============================================================
// Phase 3: GATHER — Parallel external research per question
// ============================================================

async function gatherForQuestion(
  q: SubQuestion,
  subjectId: string,
  sourceIds?: string[]
): Promise<GatheredContext> {
  const searchQuery = q.searchTerms.join(" ")
  const expects = new Set(q.expectedSources)

  const tasks: Promise<any>[] = []

  // RAG
  const ragPromise = expects.has("rag") ? (async () => {
    try {
      const ns = `subject:${subjectId}`
      const retriever = await getRetrieverWithParents(ns, embeddings as any, { k: 8 })
      let docs = await retriever.invoke(searchQuery)
      if (sourceIds?.length) {
        const allowed = new Set(sourceIds)
        const filtered = docs.filter(d => d.metadata?.sourceId && allowed.has(d.metadata.sourceId))
        if (filtered.length > 0) docs = filtered
      }
      return docs.map(d => {
        const m = d.metadata
        const source = m?.sourceFile ? `[Source: ${m.sourceFile}${m.pageNumber ? `, p.${m.pageNumber}` : ""}]` : ""
        return `${source}\n${d.pageContent}`.trim()
      }).join("\n\n---\n\n")
    } catch { return "" }
  })() : Promise.resolve("")

  // Wikipedia
  const wikiPromise = expects.has("wikipedia") ? (async () => {
    try {
      const results = await fetchWikipediaForTopics(q.searchTerms)
      return [...results.values()].join("\n\n")
    } catch { return "" }
  })() : Promise.resolve("")

  // arXiv
  const arxivPromise = expects.has("arxiv") ? searchArxiv(searchQuery).catch(() => []) : Promise.resolve([])

  // PubMed
  const pubmedPromise = expects.has("pubmed") ? searchPubmed(searchQuery).catch(() => []) : Promise.resolve([])

  // Web
  const webPromise = (expects.has("web") && config.tavily_api_key) ? (async () => {
    try {
      const { searchWeb } = await import("../websearch/search")
      const results = await searchWeb(searchQuery, "quick")
      return results.map(r => `[${r.title}](${r.url})\n${r.content}`).join("\n\n")
    } catch { return "" }
  })() : Promise.resolve("")

  const [ragText, wikiText, arxivAbstracts, pubmedAbstracts, webResults] = await Promise.all([
    ragPromise, wikiPromise, arxivPromise, pubmedPromise, webPromise,
  ])

  return {
    questionId: q.id,
    ragText: truncate(ragText, MAX_CONTEXT_PER_QUESTION / 3),
    wikiText: truncate(wikiText, MAX_CONTEXT_PER_QUESTION / 5),
    arxivAbstracts: arxivAbstracts as ArxivResult[],
    pubmedAbstracts: pubmedAbstracts as PubmedResult[],
    webResults: truncate(webResults, MAX_CONTEXT_PER_QUESTION / 5),
  }
}

async function gatherAll(
  questions: SubQuestion[],
  subjectId: string,
  sourceIds: string[] | undefined,
  emit: ProgressFn
): Promise<Map<string, GatheredContext>> {
  const contexts = new Map<string, GatheredContext>()

  for (let i = 0; i < questions.length; i += MAX_CONCURRENT) {
    const batch = questions.slice(i, i + MAX_CONCURRENT)
    const results = await Promise.all(
      batch.map(async (q, j) => {
        const idx = i + j
        emit("gathering", `Researching: ${q.question} (${idx + 1}/${questions.length})`)
        return gatherForQuestion(q, subjectId, sourceIds)
      })
    )
    for (const ctx of results) {
      contexts.set(ctx.questionId, ctx)
    }
  }

  return contexts
}

// ============================================================
// Phase 4: SYNTHESIZE — Per-question analysis
// ============================================================

function formatArxivContext(abstracts: ArxivResult[]): string {
  if (!abstracts.length) return ""
  return abstracts.map(a =>
    `[arXiv: ${a.arxivId}] ${a.title}\nAuthors: ${a.authors.join(", ")}\nPublished: ${a.published}\n${a.abstract}`
  ).join("\n\n")
}

function formatPubmedContext(abstracts: PubmedResult[]): string {
  if (!abstracts.length) return ""
  return abstracts.map(p =>
    `[PubMed: ${p.pmid}${p.doi ? `, DOI: ${p.doi}` : ""}] ${p.title}\nAuthors: ${p.authors.join(", ")}\nPublished: ${p.published}\n${p.abstract}`
  ).join("\n\n")
}

async function synthesizeQuestion(
  q: SubQuestion,
  ctx: GatheredContext,
  model: LLM
): Promise<string> {
  const { instruction: lang } = getLocale()

  const prompt = `Analyze the following research context to answer: "${q.question}"

${ctx.ragText ? `CONTEXT FROM SUBJECT MATERIALS:\n${ctx.ragText}\n\n` : ""}${ctx.wikiText ? `CONTEXT FROM WIKIPEDIA:\n${ctx.wikiText}\n\n` : ""}${formatArxivContext(ctx.arxivAbstracts) ? `CONTEXT FROM ARXIV:\n${formatArxivContext(ctx.arxivAbstracts)}\n\n` : ""}${formatPubmedContext(ctx.pubmedAbstracts) ? `CONTEXT FROM PUBMED:\n${formatPubmedContext(ctx.pubmedAbstracts)}\n\n` : ""}${ctx.webResults ? `CONTEXT FROM WEB:\n${ctx.webResults}\n\n` : ""}
${lang}

Write a detailed analysis with proper citations [Author, Year] or [Source: filename] or [arXiv: id] or [PubMed: id].
Identify: key findings, contradictions, open questions, and significance.
Do not wrap output in code fences. Start directly with the content.`

  const res = await model.invoke([{ role: "user", content: prompt }] as any)
  return stripCodeFences(toText(res))
}

async function synthesizeAll(
  questions: SubQuestion[],
  contexts: Map<string, GatheredContext>,
  model: LLM,
  emit: ProgressFn
): Promise<Map<string, string>> {
  const syntheses = new Map<string, string>()

  for (let i = 0; i < questions.length; i += MAX_CONCURRENT) {
    const batch = questions.slice(i, i + MAX_CONCURRENT)
    const results = await Promise.all(
      batch.map(async (q, j) => {
        const idx = i + j
        emit("synthesizing", `Analyzing: ${q.question} (${idx + 1}/${questions.length})`)
        const ctx = contexts.get(q.id)
        if (!ctx) return { id: q.id, text: "" }
        return { id: q.id, text: await synthesizeQuestion(q, ctx, model) }
      })
    )
    for (const r of results) syntheses.set(r.id, r.text)
  }

  return syntheses
}

// ============================================================
// Phase 5: COMPOSE — Write research paper
// ============================================================

async function composeResearchPaper(
  plan: ResearchPlan,
  syntheses: Map<string, string>,
  allContexts: Map<string, GatheredContext>,
  model: LLM,
  instructions?: ResearchOptions["instructions"]
): Promise<string> {
  const { instruction: lang } = getLocale()

  // Collect all source references for bibliography
  const allArxiv: ArxivResult[] = []
  const allPubmed: PubmedResult[] = []
  for (const ctx of allContexts.values()) {
    allArxiv.push(...ctx.arxivAbstracts)
    allPubmed.push(...ctx.pubmedAbstracts)
  }

  const sectionAnalyses = plan.subQuestions.map(q => {
    const synthesis = syntheses.get(q.id) || ""
    return `### ${q.question}\n\n${synthesis}`
  }).join("\n\n")

  const refSection = [
    ...allArxiv.map(a => `- [arXiv: ${a.arxivId}] ${a.authors.slice(0, 3).join(", ")}${a.authors.length > 3 ? " et al." : ""}. "${a.title}." ${a.published}. ${a.pdfUrl}`),
    ...allPubmed.map(p => `- [PubMed: ${p.pmid}] ${p.authors.slice(0, 3).join(", ")}${p.authors.length > 3 ? " et al." : ""}. "${p.title}." ${p.published}.${p.doi ? ` DOI: ${p.doi}` : ""}`),
  ].join("\n")

  const prompt = `Write a structured research paper based on the following plan and section analyses.

Title: ${plan.title}
Abstract: ${plan.abstract}

SECTION ANALYSES:
${sectionAnalyses}

AVAILABLE REFERENCES:
${refSection || "(No academic references found)"}

${lang}
${formatInstructions(instructions)}

STRUCTURE:
1. **Title & Abstract** — # Title, then a concise abstract
2. **Introduction** — background, motivation, scope
3. **Main Sections** — one per sub-question, with citations
4. **Discussion** — cross-cutting themes, contradictions, limitations
5. **Future Directions** — open questions, promising research avenues
6. **References** — full bibliography of all cited sources

RULES:
- Use academic markdown formatting
- Include [citations] throughout
- Write in a scholarly but accessible tone
- Write all math using LaTeX: $inline$ and $$display$$
- Do not wrap output in code fences
- Start directly with # Title`

  const res = await model.invoke([{ role: "user", content: prompt }] as any)
  return stripCodeFences(toText(res))
}

// ============================================================
// Phase 6: ASSEMBLE — Write file + persist
// ============================================================

async function assembleAndSave(subjectId: string, title: string, paper: string): Promise<string> {
  const outDir = path.join(process.cwd(), "subjects", subjectId, "research")
  await fs.promises.mkdir(outDir, { recursive: true })

  const safeTitle = (title || "research").replace(/[^a-z0-9]/gi, "_").slice(0, 50)
  const ts = new Date().toISOString().replace(/[:.]/g, "-")
  const outPath = path.join(outDir, `${safeTitle}_${ts}.md`)
  await fs.promises.writeFile(outPath, paper, "utf8")

  return outPath
}

// ============================================================
// Main entry point
// ============================================================

export async function handleResearch(
  opts: ResearchOptions,
  llmOverride?: LLM
): Promise<ResearchResult> {
  const model = llmOverride || llm
  const emit: ProgressFn = opts.onProgress || (() => {})
  const depth = opts.depth || "standard"

  const topic = normalizeTopic(String(opts.topic || ""))
  if (!topic) throw new Error("No topic provided")

  // Phase 1: Analyze
  emit("analyzing", "Analyzing subject and knowledge graph...")
  const { graphContext, ragOverview } = await analyzeSubject(opts.subjectId, topic, opts.sourceIds)

  const landscape = [graphContext, ragOverview ? `EXISTING MATERIAL OVERVIEW:\n${truncate(ragOverview, 8000)}` : ""]
    .filter(Boolean).join("\n\n")

  // Phase 2: Plan
  emit("planning", "Generating research plan...")
  const plan = await generateResearchPlan(topic, landscape, depth, model, opts.instructions)
  emit("planning", `Plan: ${plan.subQuestions.length} sub-questions`)

  // Phase 3: Gather
  emit("gathering", "Searching external sources...")
  const contexts = await gatherAll(plan.subQuestions, opts.subjectId, opts.sourceIds, emit)

  // Phase 4: Synthesize
  emit("synthesizing", "Analyzing findings...")
  const syntheses = await synthesizeAll(plan.subQuestions, contexts, model, emit)

  // Phase 5: Compose
  emit("composing", "Writing research paper...")
  const paper = await composeResearchPaper(plan, syntheses, contexts, model, opts.instructions)

  // Phase 6: Assemble
  emit("assembling", "Saving research paper...")
  const outPath = await assembleAndSave(opts.subjectId, plan.title, paper)
  emit("done")

  return { ok: true, file: outPath }
}
