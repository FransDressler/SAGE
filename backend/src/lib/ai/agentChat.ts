import fs from "fs"
import { ToolMessage, HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages"
import llm, { embeddings } from "../../utils/llm/llm"
import type { LLM } from "../../utils/llm/models/types"
import { buildTools } from "./tools/chatTools"
import { normalizeTopic } from "../../utils/text/normalize"
import { extractFirstJsonObject } from "./extract"
import { getLocale } from "../prompts/locale"
import type { AskPayload, AskCard, RagSource } from "./ask"

const CONTEXT_BUDGET = Number(process.env.LLM_CONTEXT_BUDGET) || 12000
const MAX_ITERATIONS = 4
const generateFlashcards = process.env.CHAT_GENERATE_FLASHCARDS === "true"

const EXERCISE_RULES = `EXERCISE SOURCE RULES:
- Some retrieved results come from practice problems, exams, or exercises (sourceType: "exercise").
- NEVER reveal solutions, final answers, or worked-out steps from exercise sources.
- Instead: identify the core concept, explain the underlying principle, guide via Socratic questioning.
- If asked for a solution directly, redirect: "This comes from your exercise materials. Let me help you understand the concept instead..."
- You may explain the general method or technique needed, but never apply it to the specific exercise problem.`

type HistoryMessage = { role: string; content: any }

export type AgentPhase =
  | "thinking"
  | "searching_sources"
  | "searching_web"
  | "reading_results"
  | "generating"

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

function toConversationHistory(history?: HistoryMessage[]) {
  if (!history?.length) return []
  return history.slice(-8)
    .filter(m => m?.role === "user" || m?.role === "assistant")
    .map(msg => {
      const text = toMessageContent(msg.content)
      if (msg.role === "assistant") {
        return new AIMessage(text.slice(0, 300) + (text.length > 300 ? "\n..." : ""))
      }
      return new HumanMessage(text.slice(0, 500))
    })
}

function buildAgentSystemPrompt(customPrompt?: string): string {
  const { instruction: lang } = getLocale()
  const fcSchema = generateFlashcards
    ? `,\n  "flashcards": [{"q": "string", "a": "string", "tags": ["deep","transfer","metacognition"]}]`
    : ""
  const fcRules = generateFlashcards
    ? `\nFLASHCARDS\n- 3-5 cards per response. Never test pure recall — require reasoning, application, or "why?" thinking.\n- Tags: deep, transfer, metacognition, troubleshoot, synthesis, anti_rote.`
    : ""

  const custom = customPrompt?.trim() || ""

  return `You are PageLM, an AI tutor with access to tools.

TOOL USAGE:
- For ANY knowledge question, ALWAYS call source_search first to check the user's study materials.
- Only use web_search if source_search returned no useful results OR the question is about current events/external information.
- For greetings, simple follow-ups, or meta-questions, you may answer directly without tools.
- You may call tools multiple times if initial results are insufficient.

TEACHING APPROACH
- Explain concepts simply enough for a curious 12-year-old (Feynman technique). Build intuition before formulas.
- Never encourage rote memorization. Instead of "memorize X = Y", say "X works like Y because..."
- Use concrete analogies, real-world connections, and surprising examples.
- Structure answers with progressive depth: core idea → mechanism → edge cases.
- Use tables, diagrams, and visual scaffolding where helpful.
${fcRules}
${lang}
${custom ? `\nADDITIONAL INSTRUCTIONS:\n${custom}` : ""}

OUTPUT
- Return ONLY a JSON object: {"topic": "string", "answer": "GitHub-Flavored Markdown"${fcSchema}}
- No prose, no backticks, no code fences outside the JSON.`
}

function extractSources(collected: any[]): RagSource[] {
  const seen = new Set<string>()
  const sources: RagSource[] = []
  for (const d of collected) {
    // Web search results: { title, url, content }
    if (d?.url && d?.title) {
      if (seen.has(d.url)) continue
      seen.add(d.url)
      sources.push({
        sourceFile: d.title,
        sourceType: "websearch",
        url: d.url,
      })
      continue
    }
    // Source search results: { text, source, page, ... }
    if (!d?.source) continue
    const key = `${d.source}::${d.page !== undefined ? d.page : "_"}`
    if (seen.has(key)) continue
    seen.add(key)
    sources.push({
      sourceFile: d.source,
      ...(d.sourceId && { sourceId: d.sourceId }),
      ...(d.page != null && { pageNumber: d.page }),
      ...(d.heading && { heading: d.heading }),
      ...(d.sourceType && { sourceType: d.sourceType }),
    })
  }
  return sources
}

function parseAgentResponse(text: string, collectedSources: any[]): AskPayload {
  const raw = typeof text === "string" ? text : String(text ?? "")
  const jsonStr = extractFirstJsonObject(raw) || raw
  let parsed: any = null
  try { parsed = JSON.parse(jsonStr) } catch {}

  const sources = extractSources(collectedSources)

  if (parsed && typeof parsed === "object") {
    return {
      topic: typeof parsed.topic === "string" ? parsed.topic : "General",
      answer: typeof parsed.answer === "string" ? parsed.answer : raw,
      flashcards: Array.isArray(parsed.flashcards) ? (parsed.flashcards as AskCard[]) : [],
      sources,
    }
  }

  return { topic: "General", answer: raw, flashcards: [], sources }
}

function toText(msg: any): string {
  if (!msg) return ""
  const c = msg.content
  if (typeof c === "string") return c
  if (Array.isArray(c)) return c.map((p: any) => (typeof p === "string" ? p : p?.text ?? "")).join("")
  return String(c ?? "")
}

function buildHumanMessage(text: string, images?: { path: string; mimeType: string }[]): HumanMessage {
  if (!images?.length) return new HumanMessage(text)
  const content: any[] = [{ type: "text", text }]
  for (const img of images) {
    try {
      const data = fs.readFileSync(img.path)
      const b64 = data.toString("base64")
      content.push({
        type: "image_url",
        image_url: { url: `data:${img.mimeType};base64,${b64}` },
      })
    } catch (err) {
      console.warn("[agentChat] failed to read image:", img.path, err)
    }
  }
  return new HumanMessage({ content })
}

export async function handleAgentChat(opts: {
  question: string
  namespace: string
  history?: HistoryMessage[]
  llmOverride?: LLM
  systemPrompt?: string
  images?: { path: string; mimeType: string }[]
  onPhase?: (phase: AgentPhase, detail?: string) => void
}): Promise<AskPayload> {
  const { question, namespace, history, llmOverride, systemPrompt, images, onPhase } = opts

  const safeQ = normalizeTopic(question)
  const tools = buildTools(namespace, embeddings as any)

  const baseLlm = (llmOverride || llm).raw()

  let llmWithTools: any
  try {
    llmWithTools = baseLlm.bindTools(tools)
  } catch {
    onPhase?.("generating")
    const { handleAsk } = await import("./ask")
    return handleAsk({ q: question, namespace, history, llmOverride, systemPrompt })
  }

  onPhase?.("thinking")

  const messages: any[] = [
    new SystemMessage(buildAgentSystemPrompt(systemPrompt)),
    ...toConversationHistory(history),
    buildHumanMessage(safeQ, images),
  ]

  const collectedSources: any[] = []
  let exerciseDetected = false

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await llmWithTools.invoke(messages)
    messages.push(response)

    if (!response.tool_calls?.length) {
      return parseAgentResponse(toText(response), collectedSources)
    }

    let needExerciseRules = false
    for (const tc of response.tool_calls) {
      const toolName = tc.name as string
      if (toolName === "source_search") {
        onPhase?.("searching_sources", tc.args?.query)
      } else if (toolName === "web_search") {
        onPhase?.("searching_web", tc.args?.query)
      }

      const toolObj = tools.find(t => t.name === toolName)
      if (!toolObj) {
        messages.push(new ToolMessage({ content: `Tool "${toolName}" not found`, tool_call_id: tc.id }))
        continue
      }

      try {
        const result = await toolObj.invoke(tc.args)
        const resultStr = typeof result === "string" ? result : JSON.stringify(result)

        try {
          const parsed = JSON.parse(resultStr)
          if (Array.isArray(parsed)) {
            collectedSources.push(...parsed)
            if (toolName === "source_search" && !exerciseDetected && parsed.some((d: any) => d.sourceType === "exercise")) {
              exerciseDetected = true
              needExerciseRules = true
            }
          }
        } catch {}

        onPhase?.("reading_results")
        const capped = resultStr.length > CONTEXT_BUDGET
          ? resultStr.slice(0, CONTEXT_BUDGET) + "\n[...truncated]"
          : resultStr
        messages.push(new ToolMessage({ content: capped, tool_call_id: tc.id }))
      } catch (err: any) {
        messages.push(new ToolMessage({ content: `Tool error: ${err?.message || err}`, tool_call_id: tc.id }))
      }
    }
    // Inject exercise rules after all ToolMessages so we don't break the tool_call→ToolMessage pairing
    if (needExerciseRules) {
      messages.push(new SystemMessage(EXERCISE_RULES))
    }

    onPhase?.("generating")
  }

  // Hit max iterations — one final call without tools
  onPhase?.("generating")
  try {
    const finalResponse = await baseLlm.invoke(messages)
    return parseAgentResponse(toText(finalResponse), collectedSources)
  } catch {
    return {
      topic: "General",
      answer: "I gathered some information but encountered an error generating the final answer. Please try again.",
      flashcards: [],
      sources: extractSources(collectedSources),
    }
  }
}
