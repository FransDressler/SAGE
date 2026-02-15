import { randomUUID } from "crypto"
import fs from "fs"
import path from "path"
import db from "../database/keyv"
import { deleteDocumentsBySource, clearCollection } from "../database/db"
import { embeddings } from "../llm/llm"

export type SubjectMeta = {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  systemPrompt?: string
}

export type SourceType = "material" | "exercise" | "websearch"

export type Source = {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  uploadedAt: number
  sourceType: SourceType
  searchQuery?: string
  searchMode?: "quick" | "deep"
  sourceUrl?: string
}

export type QuizResult = { type: "quiz"; questions: any[] }
export type PodcastResult = { type: "podcast"; pid: string; filename: string }
export type NotesResult = { type: "smartnotes"; filename: string }
export type MindmapResult = { type: "mindmap"; data: any }
export type ExamResult = { type: "exam"; questions: any[]; totalPoints: number; timeLimit: number }
export type ResearchResult = { type: "research"; filename: string }

export type ToolRecord = {
  id: string
  tool: "quiz" | "podcast" | "smartnotes" | "mindmap" | "exam" | "research"
  topic: string
  config: Record<string, string | undefined>
  createdAt: number
  result: QuizResult | PodcastResult | NotesResult | MindmapResult | ExamResult | ResearchResult
}

const SUBJECTS_ROOT = path.join(process.cwd(), "subjects")

function subjectDir(id: string) {
  return path.join(SUBJECTS_ROOT, id)
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

export async function createSubject(name: string): Promise<SubjectMeta> {
  const id = randomUUID()
  const now = Date.now()
  const meta: SubjectMeta = { id, name: name.trim(), createdAt: now, updatedAt: now }

  const dir = subjectDir(id)
  ensureDir(path.join(dir, "sources"))
  ensureDir(path.join(dir, "chats"))
  ensureDir(path.join(dir, "podcasts"))
  ensureDir(path.join(dir, "smartnotes"))

  await db.set(`subject:${id}`, meta)
  await db.set(`subject:${id}:sources`, [] as Source[])
  const idx = ((await db.get("subject:index")) as string[]) || []
  idx.unshift(id)
  await db.set("subject:index", idx)

  return meta
}

export async function listSubjects(): Promise<SubjectMeta[]> {
  const idx = ((await db.get("subject:index")) as string[]) || []
  const out: SubjectMeta[] = []
  for (const id of idx) {
    const m = (await db.get(`subject:${id}`)) as SubjectMeta | undefined
    if (m) out.push(m)
  }
  return out.sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function getSubject(id: string): Promise<SubjectMeta | null> {
  const m = (await db.get(`subject:${id}`)) as SubjectMeta | undefined
  return m || null
}

export async function renameSubject(id: string, name: string): Promise<SubjectMeta | null> {
  const m = (await db.get(`subject:${id}`)) as SubjectMeta | undefined
  if (!m) return null
  m.name = name.trim()
  m.updatedAt = Date.now()
  await db.set(`subject:${id}`, m)
  return m
}

const MAX_PROMPT_LENGTH = 4000

export async function updateSubjectPrompt(id: string, prompt: string): Promise<SubjectMeta | null> {
  const m = (await db.get(`subject:${id}`)) as SubjectMeta | undefined
  if (!m) return null
  const trimmed = prompt.trim()
  if (trimmed.length > MAX_PROMPT_LENGTH) {
    throw new Error(`System prompt exceeds ${MAX_PROMPT_LENGTH} characters`)
  }
  m.systemPrompt = trimmed
  m.updatedAt = Date.now()
  await db.set(`subject:${id}`, m)
  return m
}

export async function deleteSubject(id: string): Promise<boolean> {
  const m = (await db.get(`subject:${id}`)) as SubjectMeta | undefined
  if (!m) return false

  await clearCollection(`subject:${id}`, embeddings)

  const dir = subjectDir(id)
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true })

  await db.delete(`subject:${id}`)
  await db.delete(`subject:${id}:sources`)
  await db.delete(`subject:${id}:tools`)

  const idx = ((await db.get("subject:index")) as string[]) || []
  await db.set("subject:index", idx.filter(i => i !== id))

  return true
}

export async function listSources(subjectId: string): Promise<Source[]> {
  const raw = ((await db.get(`subject:${subjectId}:sources`)) as Source[]) || []
  return raw.map(s => ({ ...s, sourceType: s.sourceType || "material" }))
}

export async function addSource(
  subjectId: string,
  file: { filename: string; originalName: string; mimeType: string; path: string },
  sourceType: SourceType = "material",
  extra?: { searchQuery?: string; searchMode?: "quick" | "deep"; sourceUrl?: string }
): Promise<Source> {
  const stat = fs.statSync(file.path)
  const source: Source = {
    id: randomUUID(),
    filename: file.filename,
    originalName: file.originalName,
    mimeType: file.mimeType,
    size: stat.size,
    uploadedAt: Date.now(),
    sourceType,
    ...(extra?.searchQuery && { searchQuery: extra.searchQuery }),
    ...(extra?.searchMode && { searchMode: extra.searchMode }),
    ...(extra?.sourceUrl && { sourceUrl: extra.sourceUrl }),
  }

  const sources = ((await db.get(`subject:${subjectId}:sources`)) as Source[]) || []
  sources.push(source)
  await db.set(`subject:${subjectId}:sources`, sources)

  const m = (await db.get(`subject:${subjectId}`)) as SubjectMeta | undefined
  if (m) {
    m.updatedAt = Date.now()
    await db.set(`subject:${subjectId}`, m)
  }

  return source
}

export async function removeSource(subjectId: string, sourceId: string): Promise<boolean> {
  const sources = ((await db.get(`subject:${subjectId}:sources`)) as Source[]) || []
  const source = sources.find(s => s.id === sourceId)
  if (!source) return false

  const filePath = path.join(subjectDir(subjectId), "sources", source.filename)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)

  const txtPath = filePath + ".txt"
  if (fs.existsSync(txtPath)) fs.unlinkSync(txtPath)

  await deleteDocumentsBySource(`subject:${subjectId}`, sourceId, embeddings)
  await db.set(`subject:${subjectId}:sources`, sources.filter(s => s.id !== sourceId))

  const m = (await db.get(`subject:${subjectId}`)) as SubjectMeta | undefined
  if (m) {
    m.updatedAt = Date.now()
    await db.set(`subject:${subjectId}`, m)
  }

  return true
}

export function getSubjectDir(subjectId: string) {
  return subjectDir(subjectId)
}

export function getSourcesDir(subjectId: string) {
  return path.join(subjectDir(subjectId), "sources")
}

const MAX_TOOLS = 50

export async function listTools(subjectId: string): Promise<ToolRecord[]> {
  return ((await db.get(`subject:${subjectId}:tools`)) as ToolRecord[]) || []
}

export async function addTool(subjectId: string, record: ToolRecord): Promise<void> {
  const tools = await listTools(subjectId)
  tools.unshift(record)
  if (tools.length > MAX_TOOLS) {
    const evicted = tools.splice(MAX_TOOLS)
    for (const t of evicted) {
      try {
        if (t.result.type === "smartnotes") {
          const safeName = path.basename(t.result.filename)
          const expectedDir = path.join(subjectDir(subjectId), "smartnotes")
          const fp = path.resolve(expectedDir, safeName)
          if (fp.startsWith(expectedDir) && fs.existsSync(fp)) fs.unlinkSync(fp)
        }
        if (t.result.type === "podcast") {
          const dir = path.join(subjectDir(subjectId), "podcasts", t.result.pid)
          if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true })
        }
        if (t.result.type === "research") {
          const safeName = path.basename(t.result.filename)
          const expectedDir = path.join(subjectDir(subjectId), "research")
          const fp = path.resolve(expectedDir, safeName)
          if (fp.startsWith(expectedDir) && fs.existsSync(fp)) fs.unlinkSync(fp)
        }
      } catch {}
    }
  }
  await db.set(`subject:${subjectId}:tools`, tools)
}

export async function updateTool(subjectId: string, toolId: string, result: any): Promise<boolean> {
  const tools = await listTools(subjectId)
  const idx = tools.findIndex(t => t.id === toolId)
  if (idx === -1) return false
  tools[idx].result = result
  await db.set(`subject:${subjectId}:tools`, tools)
  return true
}

export async function deleteTool(subjectId: string, toolId: string): Promise<boolean> {
  const tools = await listTools(subjectId)
  const idx = tools.findIndex(t => t.id === toolId)
  if (idx === -1) return false

  const [removed] = tools.splice(idx, 1)
  await db.set(`subject:${subjectId}:tools`, tools)

  if (removed.result.type === "smartnotes") {
    const safeName = path.basename(removed.result.filename)
    const expectedDir = path.join(subjectDir(subjectId), "smartnotes")
    const fp = path.resolve(expectedDir, safeName)
    if (fp.startsWith(expectedDir) && fs.existsSync(fp)) fs.unlinkSync(fp)
  }
  if (removed.result.type === "podcast") {
    const dir = path.join(subjectDir(subjectId), "podcasts", removed.result.pid)
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true })
  }
  if (removed.result.type === "research") {
    const safeName = path.basename(removed.result.filename)
    const expectedDir = path.join(subjectDir(subjectId), "research")
    const fp = path.resolve(expectedDir, safeName)
    if (fp.startsWith(expectedDir) && fs.existsSync(fp)) fs.unlinkSync(fp)
  }

  return true
}
