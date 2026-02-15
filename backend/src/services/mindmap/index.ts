import llm from "../../utils/llm/llm"
import { embeddings } from "../../utils/llm/llm"
import { getRetriever } from "../../utils/database/db"
import type { LLM } from "../../utils/llm/models/types"
import type { ConceptNode, ConceptEdge, MindmapData } from "./types"
import { formatInstructions } from "../../lib/prompts/instructions"
import type { UserInstructions } from "../../types/instructions"

export type MindmapOptions = {
  topic?: string
  sourceIds?: string[]
  instructions?: UserInstructions
}

const NODES_PER_SOURCE = 15
const EDGES_PER_SOURCE = 45
const MIN_NODES = 30
const MIN_EDGES = 90
const BATCH_SIZE = 10

function maxNodes(sourceCount: number): number {
  return Math.max(MIN_NODES, sourceCount * NODES_PER_SOURCE)
}
function maxEdges(sourceCount: number): number {
  return Math.max(MIN_EDGES, sourceCount * EDGES_PER_SOURCE)
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9äöüß]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

function normalizeLabel(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ")
}

const NODE_COLORS = ["#FFCBE1", "#D6E5BD", "#F9E1A8", "#BCD8EC", "#DCCCEC", "#FFDAB4"]

const EXTRACTION_PROMPT = `Extract key concepts and their relationships from the following text.
Return ONLY a JSON object with this exact structure (no markdown, no code fences):
{
  "concepts": [
    {
      "label": "concept name",
      "description": "1-2 sentence summary",
      "category": "theory|person|event|term|process|principle|method",
      "importance": "high|medium|low",
      "color": "#HEX"
    }
  ],
  "relationships": [
    {
      "from": "concept label (exact match)",
      "to": "concept label (exact match)",
      "label": "relationship type (causes, part-of, contrasts, supports, leads-to, example-of, subtopic-of, etc.)",
      "weight": 0.5
    }
  ]
}

Guidelines:
- Extract 5-15 concepts per batch
- Focus on the most important concepts, theories, and connections
- Use the same language as the source material
- Weight should be 0-1 (1 = strongest relationship)
- Each concept needs a clear, concise description
- Only create relationships between concepts you extracted
- Create parent/umbrella concepts that group related child concepts (e.g. "Thermodynamics" as parent of "Entropy" and "Enthalpy"). Use "part-of" or "subtopic-of" relationships to connect children to parents
- Mark parent/umbrella concepts as importance "high", key concepts as "medium", and supporting details as "low"
- Identify bridging concepts that connect different topic areas or categories — these help readers see cross-topic relationships
- Assign a color to each concept from ONLY these 6 colors: ${NODE_COLORS.join(", ")}
- Use the SAME color for thematically related concepts (e.g. all biology concepts share one color, all physics concepts share another)
- Spread colors across different thematic clusters so each cluster is visually distinct`

const AI_EDIT_PROMPT = `You are a knowledge graph editor. You receive a knowledge graph and an editing instruction.
Apply the requested changes and return the COMPLETE updated graph as JSON.

Rules:
- Keep all existing nodes/edges unless explicitly asked to remove them
- New nodes need: id (lowercase-slugified-label), label, description, category (theory|person|event|term|process|principle|method), importance (high|medium|low), color (hex from palette)
- New edges need: source (node id), target (node id), label (relationship type), weight (0-1)
- Preserve the original language of existing content
- Assign colors ONLY from this palette: ${NODE_COLORS.join(", ")}. Use the same color for thematically related nodes.
- Return ONLY a JSON object (no markdown, no code fences):
{
  "nodes": [{ "id": "...", "label": "...", "description": "...", "category": "...", "importance": "high|medium|low", "color": "#HEX", "sources": [] }],
  "edges": [{ "source": "node-id", "target": "node-id", "label": "...", "weight": 0.5 }]
}`

const CONSOLIDATION_PROMPT = `You are given a knowledge graph with many nodes. Consolidate it:
1. Merge near-duplicate concepts (keep the best description)
2. Remove trivial or overly generic concepts
3. Keep the most meaningful relationships
4. Aim for a clean, navigable graph with clear hierarchy
5. Ensure each category has at least one high-importance parent/umbrella node that child concepts connect to via "part-of" or "subtopic-of" edges
6. Add bridging edges between clusters where concepts from different categories are related — these help connect topic areas
7. Use "part-of", "subtopic-of" for parent-child; "relates-to", "causes", "supports" etc. for cross-category bridges
8. Assign colors ONLY from this palette: ${NODE_COLORS.join(", ")}. Use the same color for thematically related concepts so each cluster is visually distinct.

Return ONLY a JSON object (no markdown, no code fences):
{
  "concepts": [{ "label": "...", "description": "...", "category": "...", "importance": "high|medium|low", "color": "#HEX" }],
  "relationships": [{ "from": "...", "to": "...", "label": "...", "weight": 0.5 }]
}`

function stripFences(s: string): string {
  return s.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, "").trim()
}

function extractJsonObject(s: string): string {
  let depth = 0, start = -1
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "{") { if (depth === 0) start = i; depth++ }
    else if (s[i] === "}") { depth--; if (depth === 0 && start !== -1) return s.slice(start, i + 1) }
  }
  return ""
}

function tryParse<T = unknown>(s: string): T | null {
  try { return JSON.parse(s) as T } catch { return null }
}

function toText(out: any): string {
  if (!out) return ""
  if (typeof out === "string") return out
  if (typeof out?.content === "string") return out.content
  if (Array.isArray(out?.content)) return out.content.map((p: any) => (typeof p === "string" ? p : p?.text ?? "")).join("")
  return String(out ?? "")
}

type RawExtraction = {
  concepts: Array<{ label: string; description: string; category: string; importance: string; color?: string }>
  relationships: Array<{ from: string; to: string; label: string; weight: number }>
}

function validColor(c: unknown): string {
  if (typeof c === "string" && NODE_COLORS.includes(c.toUpperCase())) return c.toUpperCase()
  return NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)]
}

async function extractBatch(text: string, model: LLM, topic?: string, instructions?: UserInstructions): Promise<RawExtraction> {
  const topicPrefix = topic ? `Topic focus: ${topic}\n\n` : ""
  const instructionSuffix = formatInstructions(instructions)
  const msgs = [
    { role: "system", content: EXTRACTION_PROMPT + instructionSuffix },
    { role: "user", content: topicPrefix + text + "\n\nReturn only the JSON object." },
  ]
  const res = await model.invoke([...msgs] as any)
  const raw = stripFences(toText(res))
  const json = extractJsonObject(raw) || raw
  const parsed = tryParse<any>(json)
  if (!parsed || !Array.isArray(parsed.concepts)) return { concepts: [], relationships: [] }
  return {
    concepts: parsed.concepts.filter((c: any) => c?.label).map((c: any) => ({ ...c, color: c.color })),
    relationships: Array.isArray(parsed.relationships) ? parsed.relationships.filter((r: any) => r?.from && r?.to) : [],
  }
}

type ChunkDoc = { text: string; sourceFile?: string; sourceId?: string; pageNumber?: number }

async function retrieveChunks(subjectId: string, sourceIds?: string[]): Promise<ChunkDoc[]> {
  const collection = `subject:${subjectId}`
  const retriever = await getRetriever(collection, embeddings, { k: 100 })
  const docs = await retriever.invoke("*")
  let chunks = docs.map((d: any) => ({
    text: typeof d.pageContent === "string" ? d.pageContent : String(d.pageContent ?? ""),
    sourceFile: d.metadata?.sourceFile,
    sourceId: d.metadata?.sourceId as string | undefined,
    pageNumber: d.metadata?.pageNumber,
  }))
  if (sourceIds && sourceIds.length > 0) {
    const allowed = new Set(sourceIds)
    chunks = chunks.filter(c => c.sourceId && allowed.has(c.sourceId))
  }
  return chunks
}

function batchChunks(chunks: ChunkDoc[]): string[][] {
  const batches: string[][] = []
  let current: string[] = []
  for (const chunk of chunks) {
    current.push(chunk.text)
    if (current.length >= BATCH_SIZE) {
      batches.push(current)
      current = []
    }
  }
  if (current.length > 0) batches.push(current)
  return batches
}

function buildSourceMap(chunks: ChunkDoc[]): Map<string, { file: string; page?: number }[]> {
  const map = new Map<string, { file: string; page?: number }[]>()
  for (const chunk of chunks) {
    if (!chunk.sourceFile) continue
    const words = chunk.text.toLowerCase().split(/\s+/)
    for (const word of words) {
      if (word.length < 4) continue
      const key = word.slice(0, 20)
      if (!map.has(key)) map.set(key, [])
      const arr = map.get(key)!
      if (!arr.some(s => s.file === chunk.sourceFile && s.page === chunk.pageNumber)) {
        arr.push({ file: chunk.sourceFile, page: chunk.pageNumber })
      }
    }
  }
  return map
}

function findSources(label: string, sourceMap: Map<string, { file: string; page?: number }[]>): { file: string; page?: number }[] {
  const words = label.toLowerCase().split(/\s+/)
  const counts = new Map<string, { file: string; page?: number; count: number }>()
  for (const word of words) {
    if (word.length < 4) continue
    const key = word.slice(0, 20)
    const sources = sourceMap.get(key) || []
    for (const s of sources) {
      const sk = `${s.file}::${s.page ?? "_"}`
      const existing = counts.get(sk)
      if (existing) existing.count++
      else counts.set(sk, { ...s, count: 1 })
    }
  }
  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(({ file, page }) => ({ file, ...(page != null && { page }) }))
}

type ProgressFn = (phase: string, detail?: string) => void

export async function generateMindmap(
  subjectId: string,
  llmOverride?: LLM,
  onProgress?: ProgressFn,
  options?: MindmapOptions
): Promise<MindmapData> {
  const model = llmOverride || llm
  const emit = onProgress || (() => {})

  emit("retrieving", "Fetching document chunks...")
  const chunks = await retrieveChunks(subjectId, options?.sourceIds)
  if (chunks.length === 0) throw new Error("No documents found for this subject")

  const sourceMap = buildSourceMap(chunks)
  const sourceCount = new Set(chunks.map(c => c.sourceFile).filter(Boolean)).size

  emit("extracting", `Processing ${chunks.length} chunks in batches...`)
  const batches = batchChunks(chunks)

  const allConcepts: RawExtraction["concepts"] = []
  const allRelationships: RawExtraction["relationships"] = []

  for (let i = 0; i < batches.length; i++) {
    emit("extracting", `Batch ${i + 1}/${batches.length}`)
    const text = batches[i].join("\n\n---\n\n")
    try {
      const result = await extractBatch(text, model, options?.topic, options?.instructions)
      allConcepts.push(...result.concepts)
      allRelationships.push(...result.relationships)
    } catch (e: any) {
      console.warn(`[mindmap] batch ${i + 1} failed:`, e?.message)
    }
  }

  emit("merging", "Deduplicating and merging concepts...")

  const nodeMap = new Map<string, ConceptNode>()
  const labelToId = new Map<string, string>()

  for (const c of allConcepts) {
    const norm = normalizeLabel(c.label)
    if (labelToId.has(norm)) {
      const existing = nodeMap.get(labelToId.get(norm)!)!
      if (c.description.length > existing.description.length) existing.description = c.description
      const newSources = findSources(c.label, sourceMap)
      for (const s of newSources) {
        if (!existing.sources.some(es => es.file === s.file && es.page === s.page)) {
          existing.sources.push(s)
        }
      }
      if (c.importance === "high") existing.importance = "high"
      else if (c.importance === "medium" && existing.importance === "low") existing.importance = "medium"
    } else {
      const id = slugify(c.label) || `node-${nodeMap.size}`
      const importance = (["high", "medium", "low"].includes(c.importance) ? c.importance : "medium") as ConceptNode["importance"]
      labelToId.set(norm, id)
      nodeMap.set(id, {
        id,
        label: c.label.trim(),
        description: c.description?.trim() || "",
        category: c.category?.trim() || "term",
        importance,
        color: validColor(c.color),
        sources: findSources(c.label, sourceMap),
      })
    }
  }

  const edgeMap = new Map<string, ConceptEdge>()
  for (const r of allRelationships) {
    const fromNorm = normalizeLabel(r.from)
    const toNorm = normalizeLabel(r.to)
    const fromId = labelToId.get(fromNorm)
    const toId = labelToId.get(toNorm)
    if (!fromId || !toId || fromId === toId) continue

    const edgeKey = `${fromId}->${toId}:${r.label}`
    if (edgeMap.has(edgeKey)) {
      const existing = edgeMap.get(edgeKey)!
      existing.weight = (existing.weight + (r.weight || 0.5)) / 2
    } else {
      edgeMap.set(edgeKey, {
        source: fromId,
        target: toId,
        label: r.label?.trim() || "relates-to",
        weight: typeof r.weight === "number" ? Math.max(0, Math.min(1, r.weight)) : 0.5,
      })
    }
  }

  let nodes = Array.from(nodeMap.values())
  let edges = Array.from(edgeMap.values())

  if (nodes.length > 50) {
    emit("consolidating", "Refining graph with LLM...")
    try {
      const graphSummary = JSON.stringify({
        concepts: nodes.map(n => ({ label: n.label, description: n.description, category: n.category, importance: n.importance, color: n.color })),
        relationships: edges.map(e => {
          const from = nodeMap.get(e.source)?.label || e.source
          const to = nodeMap.get(e.target)?.label || e.target
          return { from, to, label: e.label, weight: e.weight }
        }),
      })

      const msgs = [
        { role: "system", content: CONSOLIDATION_PROMPT },
        { role: "user", content: `Current graph (${nodes.length} nodes, ${edges.length} edges):\n${graphSummary}\n\nReturn only the JSON object.` },
      ]
      const res = await model.invoke([...msgs] as any)
      const raw = stripFences(toText(res))
      const json = extractJsonObject(raw) || raw
      const parsed = tryParse<any>(json)

      if (parsed?.concepts?.length > 0) {
        const newNodeMap = new Map<string, ConceptNode>()
        const newLabelToId = new Map<string, string>()

        for (const c of parsed.concepts) {
          if (!c?.label) continue
          const norm = normalizeLabel(c.label)
          const oldId = labelToId.get(norm)
          const oldNode = oldId ? nodeMap.get(oldId) : undefined
          const id = oldId || slugify(c.label) || `node-${newNodeMap.size}`
          newLabelToId.set(norm, id)
          newNodeMap.set(id, {
            id,
            label: c.label.trim(),
            description: c.description?.trim() || oldNode?.description || "",
            category: c.category?.trim() || oldNode?.category || "term",
            importance: (["high", "medium", "low"].includes(c.importance) ? c.importance : "medium") as ConceptNode["importance"],
            color: validColor(c.color) || oldNode?.color || validColor(null),
            sources: oldNode?.sources || findSources(c.label, sourceMap),
          })
        }

        const newEdges: ConceptEdge[] = []
        if (Array.isArray(parsed.relationships)) {
          for (const r of parsed.relationships) {
            if (!r?.from || !r?.to) continue
            const fromId = newLabelToId.get(normalizeLabel(r.from))
            const toId = newLabelToId.get(normalizeLabel(r.to))
            if (!fromId || !toId || fromId === toId) continue
            newEdges.push({
              source: fromId,
              target: toId,
              label: r.label?.trim() || "relates-to",
              weight: typeof r.weight === "number" ? Math.max(0, Math.min(1, r.weight)) : 0.5,
            })
          }
        }

        nodes = Array.from(newNodeMap.values())
        edges = newEdges
      }
    } catch (e: any) {
      console.warn("[mindmap] consolidation failed, using raw graph:", e?.message)
    }
  }

  const nodeLimit = maxNodes(sourceCount)
  const edgeLimit = maxEdges(sourceCount)

  if (nodes.length > nodeLimit) {
    nodes = nodes
      .sort((a, b) => {
        const rank = { high: 0, medium: 1, low: 2 }
        return rank[a.importance] - rank[b.importance]
      })
      .slice(0, nodeLimit)
    const nodeIds = new Set(nodes.map(n => n.id))
    edges = edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
  }

  if (edges.length > edgeLimit) {
    edges = edges
      .sort((a, b) => b.weight - a.weight)
      .slice(0, edgeLimit)
  }

  emit("done")

  return {
    nodes,
    edges,
    generatedAt: Date.now(),
    sourceCount,
  }
}

export async function editMindmapWithAI(
  currentData: MindmapData,
  instruction: string,
  subjectId: string,
  llmOverride?: LLM
): Promise<MindmapData> {
  const trimmed = instruction.trim()
  if (!trimmed) throw new Error("Instruction cannot be empty")
  if (trimmed.length > 2000) throw new Error("Instruction too long (max 2000 chars)")

  const model = llmOverride || llm

  // Retrieve relevant chunks for the instruction
  const collection = `subject:${subjectId}`
  const retriever = await getRetriever(collection, embeddings, { k: 20 })
  const docs = await retriever.invoke(instruction)
  const chunks: ChunkDoc[] = docs.map((d: any) => ({
    text: typeof d.pageContent === "string" ? d.pageContent : String(d.pageContent ?? ""),
    sourceFile: d.metadata?.sourceFile,
    sourceId: d.metadata?.sourceId as string | undefined,
    pageNumber: d.metadata?.pageNumber,
  }))
  const sourceMap = buildSourceMap(chunks)
  const context = chunks.map(c => c.text).join("\n\n---\n\n")

  const graphJson = JSON.stringify({
    nodes: currentData.nodes.slice(0, 500),
    edges: currentData.edges.slice(0, 2000),
  })

  const userContent = context
    ? `Current graph:\n${graphJson}\n\nRelevant source material:\n${context}\n\nInstruction: ${instruction}\n\nReturn only the JSON object.`
    : `Current graph:\n${graphJson}\n\nInstruction: ${instruction}\n\nReturn only the JSON object.`

  const msgs = [
    { role: "system", content: AI_EDIT_PROMPT },
    { role: "user", content: userContent },
  ]

  const res = await model.invoke([...msgs] as any)
  const raw = stripFences(toText(res))
  const json = extractJsonObject(raw) || raw
  const parsed = tryParse<any>(json)

  if (!parsed || !Array.isArray(parsed.nodes)) {
    throw new Error("AI returned invalid graph structure")
  }

  // Build lookup of existing node sources to preserve them
  const existingSources = new Map<string, ConceptNode["sources"]>()
  for (const n of currentData.nodes) {
    if (n.sources?.length) existingSources.set(n.id, n.sources)
  }
  const existingIds = new Set(currentData.nodes.map(n => n.id))

  // Build lookup of existing node colors to preserve them
  const existingColors = new Map<string, string>()
  for (const n of currentData.nodes) {
    if (n.color) existingColors.set(n.id, n.color)
  }

  const nodes: ConceptNode[] = parsed.nodes
    .filter((n: any) => n?.id && n?.label)
    .map((n: any) => {
      const id = n.id
      const label = n.label.trim()
      // Existing nodes keep their sources; new nodes get source-matched
      const sources = existingSources.get(id) || (existingIds.has(id) ? [] : findSources(label, sourceMap))
      return {
        id,
        label,
        description: n.description?.trim() || "",
        category: n.category?.trim() || "term",
        importance: (["high", "medium", "low"].includes(n.importance) ? n.importance : "medium") as ConceptNode["importance"],
        color: existingColors.get(id) || validColor(n.color),
        sources,
      }
    })

  const nodeIds = new Set(nodes.map(n => n.id))
  const edges: ConceptEdge[] = (Array.isArray(parsed.edges) ? parsed.edges : [])
    .filter((e: any) => e?.source && e?.target && nodeIds.has(e.source) && nodeIds.has(e.target))
    .map((e: any) => ({
      source: e.source,
      target: e.target,
      label: e.label?.trim() || "relates-to",
      weight: typeof e.weight === "number" ? Math.max(0, Math.min(1, e.weight)) : 0.5,
    }))

  return {
    nodes,
    edges,
    generatedAt: Date.now(),
    sourceCount: currentData.sourceCount,
  }
}
