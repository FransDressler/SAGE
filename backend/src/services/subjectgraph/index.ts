import llm from "../../utils/llm/llm"
import { embeddings } from "../../utils/llm/llm"
import { getAllDocuments } from "../../utils/database/db"
import db from "../../utils/database/keyv"
import type { LLM } from "../../utils/llm/models/types"
import type { ConceptNode, ConceptEdge, MindmapData } from "../mindmap/types"
import { editMindmapWithAI } from "../mindmap"

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
const NODE_COLORS = ["#FFCBE1", "#D6E5BD", "#F9E1A8", "#BCD8EC", "#DCCCEC", "#FFDAB4"]

function validColor(c: unknown): string {
  if (typeof c === "string" && NODE_COLORS.includes(c.toUpperCase())) return c.toUpperCase()
  return NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)]
}

function dbKey(subjectId: string): string {
  return `subject:${subjectId}:graph`
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

const EXTRACTION_PROMPT = `Extract key concepts and their relationships from the following text chunks.
Each chunk is annotated with its source file and page number in a [Source: ...] header.
For each concept, include the "sources" array listing which source files and pages it appears in.

Return ONLY a JSON object with this exact structure (no markdown, no code fences):
{
  "concepts": [
    {
      "label": "concept name",
      "description": "1-2 sentence summary",
      "category": "theory|person|event|term|process|principle|method",
      "importance": "high|medium|low",
      "color": "#HEX",
      "sources": [{"file": "filename.pdf", "page": 3}]
    }
  ],
  "relationships": [
    {
      "from": "concept label (exact match)",
      "to": "concept label (exact match)",
      "label": "relationship type (causes, part-of, contrasts, supports, leads-to, example-of, etc.)",
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
- sources: list ONLY the files/pages where the concept actually appears
- Assign a color to each concept from ONLY these 6 colors: ${NODE_COLORS.join(", ")}
- Use the SAME color for thematically related concepts so each cluster is visually distinct`

const CONNECTION_PROMPT = `You are given two sets of concepts from a knowledge graph:
- EXISTING: concepts already in the graph
- NEW: concepts just extracted from new material

Identify relationships between NEW concepts and EXISTING concepts.
Return ONLY a JSON object (no markdown, no code fences):
{
  "relationships": [
    {
      "from": "concept label (exact match from either set)",
      "to": "concept label (exact match from either set)",
      "label": "relationship type",
      "weight": 0.5
    }
  ]
}

Only create cross-set relationships (between a new and existing concept).
Do NOT duplicate relationships that may already exist.`

const CONSOLIDATION_PROMPT = `You are given a knowledge graph with many nodes. Consolidate it:
1. Merge near-duplicate concepts (keep the best description)
2. Remove trivial or overly generic concepts
3. Keep the most meaningful relationships
4. Aim for a clean, navigable graph
5. Assign colors ONLY from this palette: ${NODE_COLORS.join(", ")}. Use the same color for thematically related concepts.

Return ONLY a JSON object (no markdown, no code fences):
{
  "concepts": [{ "label": "...", "description": "...", "category": "...", "importance": "high|medium|low", "color": "#HEX" }],
  "relationships": [{ "from": "...", "to": "...", "label": "...", "weight": 0.5 }]
}`

type RawExtraction = {
  concepts: Array<{ label: string; description: string; category: string; importance: string; color?: string; sources?: { file: string; page?: number }[] }>
  relationships: Array<{ from: string; to: string; label: string; weight: number }>
}

type ChunkDoc = { text: string; sourceFile?: string; sourceId?: string; pageNumber?: number }

type ProgressFn = (phase: string, detail?: string) => void

// --- DB access ---

export async function getSubjectGraph(subjectId: string): Promise<MindmapData | null> {
  const data = await db.get(dbKey(subjectId))
  return data || null
}

export async function updateSubjectGraph(subjectId: string, data: MindmapData): Promise<void> {
  await db.set(dbKey(subjectId), data)
}

export async function deleteSubjectGraph(subjectId: string): Promise<void> {
  await db.delete(dbKey(subjectId))
}

// --- Chunk retrieval ---

async function retrieveChunks(subjectId: string, sourceIds?: string[]): Promise<ChunkDoc[]> {
  const collection = `subject:${subjectId}`
  const docs = await getAllDocuments(collection, embeddings, sourceIds ? { sourceIds } : undefined)
  return docs.map((d: any) => ({
    text: typeof d.pageContent === "string" ? d.pageContent : String(d.pageContent ?? ""),
    sourceFile: d.metadata?.sourceFile,
    sourceId: d.metadata?.sourceId as string | undefined,
    pageNumber: d.metadata?.pageNumber,
  }))
}

function batchChunks(chunks: ChunkDoc[]): ChunkDoc[][] {
  const batches: ChunkDoc[][] = []
  let current: ChunkDoc[] = []
  for (const chunk of chunks) {
    current.push(chunk)
    if (current.length >= BATCH_SIZE) {
      batches.push(current)
      current = []
    }
  }
  if (current.length > 0) batches.push(current)
  return batches
}

function batchSources(batch: ChunkDoc[]): { file: string; page?: number }[] {
  const seen = new Set<string>()
  const sources: { file: string; page?: number }[] = []
  for (const c of batch) {
    if (!c.sourceFile) continue
    const key = `${c.sourceFile}::${c.pageNumber ?? "_"}`
    if (seen.has(key)) continue
    seen.add(key)
    sources.push({ file: c.sourceFile, ...(c.pageNumber != null && { page: c.pageNumber }) })
  }
  return sources
}

function formatBatchText(batch: ChunkDoc[]): string {
  return batch.map(c => {
    const src = c.sourceFile ? `[Source: ${c.sourceFile}${c.pageNumber != null ? `, p.${c.pageNumber}` : ""}]` : ""
    return src ? `${src}\n${c.text}` : c.text
  }).join("\n\n---\n\n")
}

// --- LLM extraction ---

async function extractBatch(batch: ChunkDoc[], model: LLM): Promise<RawExtraction> {
  const text = formatBatchText(batch)
  const fallbackSources = batchSources(batch)
  const msgs = [
    { role: "system", content: EXTRACTION_PROMPT },
    { role: "user", content: text + "\n\nReturn only the JSON object." },
  ]
  const res = await model.invoke([...msgs] as any)
  const raw = stripFences(toText(res))
  const json = extractJsonObject(raw) || raw
  const parsed = tryParse<any>(json)
  if (!parsed || !Array.isArray(parsed.concepts)) return { concepts: [], relationships: [] }
  return {
    concepts: parsed.concepts.filter((c: any) => c?.label).map((c: any) => ({
      ...c,
      // Use LLM-attributed sources if provided, otherwise fall back to all batch sources
      sources: Array.isArray(c.sources) && c.sources.length > 0
        ? c.sources.filter((s: any) => s?.file).map((s: any) => ({ file: s.file, ...(s.page != null && { page: s.page }) }))
        : fallbackSources,
    })),
    relationships: Array.isArray(parsed.relationships) ? parsed.relationships.filter((r: any) => r?.from && r?.to) : [],
  }
}

async function connectNewToExisting(
  existingLabels: string[],
  newLabels: string[],
  model: LLM
): Promise<RawExtraction["relationships"]> {
  if (existingLabels.length === 0 || newLabels.length === 0) return []

  const msgs = [
    { role: "system", content: CONNECTION_PROMPT },
    {
      role: "user",
      content: `EXISTING concepts: ${JSON.stringify(existingLabels.slice(0, 100))}\n\nNEW concepts: ${JSON.stringify(newLabels.slice(0, 50))}\n\nReturn only the JSON object.`,
    },
  ]
  try {
    const res = await model.invoke([...msgs] as any)
    const raw = stripFences(toText(res))
    const json = extractJsonObject(raw) || raw
    const parsed = tryParse<any>(json)
    if (!parsed || !Array.isArray(parsed.relationships)) return []
    return parsed.relationships.filter((r: any) => r?.from && r?.to)
  } catch (e: any) {
    console.warn("[subjectgraph] connection step failed:", e?.message)
    return []
  }
}

// --- Core operations ---

export async function expandSubjectGraph(
  subjectId: string,
  sourceIds: string[],
  llmOverride?: LLM,
  onProgress?: ProgressFn
): Promise<MindmapData> {
  const model = llmOverride || llm
  const emit = onProgress || (() => {})

  emit("loading", "Loading existing graph...")
  const existing = await getSubjectGraph(subjectId) || {
    nodes: [] as ConceptNode[],
    edges: [] as ConceptEdge[],
    generatedAt: 0,
    sourceCount: 0,
  }

  emit("retrieving", "Fetching chunks for new sources...")
  const chunks = await retrieveChunks(subjectId, sourceIds)
  if (chunks.length === 0) {
    emit("done")
    return existing
  }

  const batches = batchChunks(chunks)

  emit("extracting", `Processing ${chunks.length} chunks in ${batches.length} batches...`)

  const allConcepts: RawExtraction["concepts"] = []
  const allRelationships: RawExtraction["relationships"] = []

  for (let i = 0; i < batches.length; i++) {
    emit("extracting", `Batch ${i + 1}/${batches.length}`)
    try {
      const result = await extractBatch(batches[i], model)
      allConcepts.push(...result.concepts)
      allRelationships.push(...result.relationships)
    } catch (e: any) {
      console.warn(`[subjectgraph] batch ${i + 1} failed:`, e?.message)
    }
  }

  emit("merging", "Merging new concepts into graph...")

  // Build lookup of existing nodes
  const nodeMap = new Map<string, ConceptNode>()
  const labelToId = new Map<string, string>()
  for (const n of existing.nodes) {
    nodeMap.set(n.id, { ...n })
    labelToId.set(normalizeLabel(n.label), n.id)
  }

  const existingLabelsBefore = existing.nodes.map(n => n.label)
  const newLabels: string[] = []

  // Merge new concepts
  for (const c of allConcepts) {
    const norm = normalizeLabel(c.label)
    const conceptSources = c.sources || []
    if (labelToId.has(norm)) {
      // Update existing node: enrich description, add sources
      const node = nodeMap.get(labelToId.get(norm)!)!
      if (c.description.length > node.description.length) node.description = c.description
      for (const s of conceptSources) {
        if (!node.sources.some(es => es.file === s.file && es.page === s.page)) {
          node.sources.push(s)
        }
      }
      if (c.importance === "high") node.importance = "high"
      else if (c.importance === "medium" && node.importance === "low") node.importance = "medium"
    } else {
      // New node
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
        sources: conceptSources,
      })
      newLabels.push(c.label.trim())
    }
  }

  // Build edge map from existing edges
  const edgeMap = new Map<string, ConceptEdge>()
  for (const e of existing.edges) {
    edgeMap.set(`${e.source}->${e.target}:${e.label}`, e)
  }

  // Add intra-new relationships
  for (const r of allRelationships) {
    const fromId = labelToId.get(normalizeLabel(r.from))
    const toId = labelToId.get(normalizeLabel(r.to))
    if (!fromId || !toId || fromId === toId) continue
    const key = `${fromId}->${toId}:${r.label}`
    if (!edgeMap.has(key)) {
      edgeMap.set(key, {
        source: fromId,
        target: toId,
        label: r.label?.trim() || "relates-to",
        weight: typeof r.weight === "number" ? Math.max(0, Math.min(1, r.weight)) : 0.5,
      })
    }
  }

  // Connect new nodes to existing ones via LLM
  if (existingLabelsBefore.length > 0 && newLabels.length > 0) {
    emit("connecting", "Finding connections between new and existing concepts...")
    const crossRels = await connectNewToExisting(existingLabelsBefore, newLabels, model)
    for (const r of crossRels) {
      const fromId = labelToId.get(normalizeLabel(r.from))
      const toId = labelToId.get(normalizeLabel(r.to))
      if (!fromId || !toId || fromId === toId) continue
      const key = `${fromId}->${toId}:${r.label}`
      if (!edgeMap.has(key)) {
        edgeMap.set(key, {
          source: fromId,
          target: toId,
          label: r.label?.trim() || "relates-to",
          weight: typeof r.weight === "number" ? Math.max(0, Math.min(1, r.weight)) : 0.5,
        })
      }
    }
  }

  let nodes = Array.from(nodeMap.values())
  let edges = Array.from(edgeMap.values())

  // Compute sourceCount before trimming so dynamic limits are available
  const sourceCount = new Set([
    ...existing.nodes.flatMap(n => n.sources.map(s => s.file)),
    ...chunks.map(c => c.sourceFile).filter(Boolean),
  ]).size
  const nodeLimit = maxNodes(sourceCount)
  const edgeLimit = maxEdges(sourceCount)

  // Consolidation if too many nodes
  if (nodes.length > nodeLimit) {
    emit("consolidating", "Consolidating large graph...")
    try {
      const graphSummary = JSON.stringify({
        concepts: nodes.map(n => ({ label: n.label, description: n.description, category: n.category, importance: n.importance })),
        relationships: edges.map(e => {
          const from = nodeMap.get(e.source)?.label || e.source
          const to = nodeMap.get(e.target)?.label || e.target
          return { from, to, label: e.label, weight: e.weight }
        }),
      })
      const msgs = [
        { role: "system", content: CONSOLIDATION_PROMPT },
        { role: "user", content: `Current graph (${nodes.length} nodes, ${edges.length} edges). Target size: ~${nodeLimit} nodes, ~${edgeLimit} edges.\n${graphSummary}\n\nReturn only the JSON object.` },
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
            sources: oldNode?.sources || [],
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
      console.warn("[subjectgraph] consolidation failed:", e?.message)
      // Fallback: trim by importance
      nodes = nodes
        .sort((a, b) => {
          const rank = { high: 0, medium: 1, low: 2 }
          return rank[a.importance] - rank[b.importance]
        })
        .slice(0, nodeLimit)
      const nodeIds = new Set(nodes.map(n => n.id))
      edges = edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
    }
  }

  // Trim edges by weight if over limit
  if (edges.length > edgeLimit) {
    edges = edges
      .sort((a, b) => b.weight - a.weight)
      .slice(0, edgeLimit)
  }

  const graph: MindmapData = {
    nodes,
    edges,
    generatedAt: Date.now(),
    sourceCount,
  }

  await updateSubjectGraph(subjectId, graph)
  emit("done")
  return graph
}

export async function rebuildSubjectGraph(
  subjectId: string,
  llmOverride?: LLM,
  onProgress?: ProgressFn
): Promise<MindmapData> {
  // Clear existing graph and rebuild from all sources
  await db.delete(dbKey(subjectId))

  const model = llmOverride || llm
  const emit = onProgress || (() => {})

  emit("retrieving", "Fetching all document chunks...")
  const chunks = await retrieveChunks(subjectId)
  if (chunks.length === 0) throw new Error("No documents found for this subject")

  const sourceCount = new Set(chunks.map(c => c.sourceFile).filter(Boolean)).size
  const batches = batchChunks(chunks)

  emit("extracting", `Processing ${chunks.length} chunks in ${batches.length} batches...`)

  const allConcepts: RawExtraction["concepts"] = []
  const allRelationships: RawExtraction["relationships"] = []

  for (let i = 0; i < batches.length; i++) {
    emit("extracting", `Batch ${i + 1}/${batches.length}`)
    try {
      const result = await extractBatch(batches[i], model)
      allConcepts.push(...result.concepts)
      allRelationships.push(...result.relationships)
    } catch (e: any) {
      console.warn(`[subjectgraph] rebuild batch ${i + 1} failed:`, e?.message)
    }
  }

  emit("merging", "Building graph...")

  const nodeMap = new Map<string, ConceptNode>()
  const labelToId = new Map<string, string>()

  for (const c of allConcepts) {
    const norm = normalizeLabel(c.label)
    const conceptSources = c.sources || []
    if (labelToId.has(norm)) {
      const node = nodeMap.get(labelToId.get(norm)!)!
      if (c.description.length > node.description.length) node.description = c.description
      for (const s of conceptSources) {
        if (!node.sources.some(es => es.file === s.file && es.page === s.page)) {
          node.sources.push(s)
        }
      }
      if (c.importance === "high") node.importance = "high"
      else if (c.importance === "medium" && node.importance === "low") node.importance = "medium"
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
        sources: conceptSources,
      })
    }
  }

  const edgeMap = new Map<string, ConceptEdge>()
  for (const r of allRelationships) {
    const fromId = labelToId.get(normalizeLabel(r.from))
    const toId = labelToId.get(normalizeLabel(r.to))
    if (!fromId || !toId || fromId === toId) continue
    const key = `${fromId}->${toId}:${r.label}`
    if (!edgeMap.has(key)) {
      edgeMap.set(key, {
        source: fromId,
        target: toId,
        label: r.label?.trim() || "relates-to",
        weight: typeof r.weight === "number" ? Math.max(0, Math.min(1, r.weight)) : 0.5,
      })
    }
  }

  let nodes = Array.from(nodeMap.values())
  let edges = Array.from(edgeMap.values())

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

  const graph: MindmapData = {
    nodes,
    edges,
    generatedAt: Date.now(),
    sourceCount,
  }

  await updateSubjectGraph(subjectId, graph)
  emit("done")
  return graph
}

export async function getLinkedSourceFiles(
  subjectId: string,
  sourceFiles: string[]
): Promise<string[]> {
  const graph = await getSubjectGraph(subjectId)
  if (!graph || !graph.nodes.length) return []

  const inputSet = new Set(sourceFiles)

  // Find nodes whose sources overlap with the input files
  const matchedNodeIds = new Set<string>()
  for (const node of graph.nodes) {
    if (node.sources.some(s => inputSet.has(s.file))) {
      matchedNodeIds.add(node.id)
    }
  }

  if (matchedNodeIds.size === 0) return []

  // 1-hop: find neighbor node IDs via edges (both directions)
  const neighborIds = new Set<string>()
  for (const edge of graph.edges) {
    if (matchedNodeIds.has(edge.source) && !matchedNodeIds.has(edge.target)) {
      neighborIds.add(edge.target)
    }
    if (matchedNodeIds.has(edge.target) && !matchedNodeIds.has(edge.source)) {
      neighborIds.add(edge.source)
    }
  }

  if (neighborIds.size === 0) return []

  // Collect source files from neighbors that aren't in the original set
  const linkedFiles = new Set<string>()
  for (const node of graph.nodes) {
    if (!neighborIds.has(node.id)) continue
    for (const s of node.sources) {
      if (!inputSet.has(s.file)) linkedFiles.add(s.file)
    }
  }

  return Array.from(linkedFiles)
}

export { editMindmapWithAI }
