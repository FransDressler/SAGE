import fs from "fs"
import path from "path"
import { randomUUID } from "crypto"
import { ToolMessage, HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages"
import llm, { embeddings } from "../../utils/llm/llm"
import type { LLM } from "../../utils/llm/models/types"
import { buildTools } from "./tools/chatTools"
import { normalizeTopic } from "../../utils/text/normalize"
import { extractFirstJsonObject, sanitizeJsonString } from "./extract"
import { getLocale } from "../prompts/locale"
import { resolveImagePath, mimeFromExt } from "./imageUtils"
import type { AskPayload, AskCard, RagSource } from "./ask"
import { debugBus } from "../../utils/debug/debugBus"

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
  | "listing_sources"
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

// resolveImagePath and mimeFromExt imported from ./imageUtils

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
- When the user references a specific document by name (e.g. "Blatt 3", "Vorlesung 5", "Übungsblatt"), call list_sources FIRST to find the correct filename, then use source_search with the sourceFilter parameter to search within that specific document.
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

MATH & FORMULAS
- Write ALL math using LaTeX with dollar-sign delimiters.
- Inline math: $E = mc^2$ (single dollar signs).
- Display/block math: $$\\int_0^\\infty f(x)\\,dx$$ (double dollar signs, on its own line).
- NEVER use \\(...\\) or \\[...\\] delimiters.
- NEVER use plain-text formulas like "F(R) = -dU/dR" — always wrap in LaTeX: $F(R) = -\\frac{dU}{dR}$.
- Inside JSON strings, backslashes must be escaped: write \\\\frac not \\frac, \\\\alpha not \\alpha, etc.

IMAGES & DIAGRAMS
- When source_search retrieves chunks with image references, the actual images may be provided to you visually.
- If images are provided, analyze their visual content and explain what they show in your answer.
- Include the image in your answer using the exact markdown URL from source_search results: ![description](url)
- Do not fabricate image URLs. Only use URLs returned by source_search.
- Add a brief caption or description below each image.

OUTPUT
- Return ONLY a JSON object: {"topic": "string", "answer": "GitHub-Flavored Markdown with LaTeX math"${fcSchema}}
- The "answer" value must be a valid JSON string. Escape all backslashes (\\\\), newlines (\\n), and quotes (\\").
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

/** Extract the "answer" value from a JSON-ish string when JSON.parse fails */
function extractAnswerField(s: string): string | null {
  const marker = '"answer"'
  const idx = s.indexOf(marker)
  if (idx === -1) return null
  let i = idx + marker.length
  while (i < s.length && (s[i] === ":" || s[i] === " ")) i++
  if (s[i] !== '"') return null
  i++
  let result = ""
  while (i < s.length) {
    if (s[i] === "\\") { result += s[i] + (s[i + 1] ?? ""); i += 2; continue }
    if (s[i] === '"') break
    result += s[i]; i++
  }
  try { return JSON.parse(`"${result}"`) } catch { return result }
}

function parseAgentResponse(text: string, collectedSources: any[]): AskPayload {
  const raw = typeof text === "string" ? text : String(text ?? "")
  const jsonStr = extractFirstJsonObject(raw) || raw
  let parsed: any = null
  try { parsed = JSON.parse(jsonStr) } catch {}
  // LLMs often emit literal newlines inside JSON strings — sanitize and retry
  if (!parsed) {
    try { parsed = JSON.parse(sanitizeJsonString(jsonStr)) } catch {}
  }

  const sources = extractSources(collectedSources)

  if (parsed && typeof parsed === "object") {
    return {
      topic: typeof parsed.topic === "string" ? parsed.topic : "General",
      answer: typeof parsed.answer === "string" ? parsed.answer : raw,
      flashcards: Array.isArray(parsed.flashcards) ? (parsed.flashcards as AskCard[]) : [],
      sources,
    }
  }

  // Fallback: try to extract answer field from malformed JSON
  const fallback = extractAnswerField(raw)
  if (fallback) return { topic: "General", answer: fallback, flashcards: [], sources }

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
  onPhase?: (phase: AgentPhase, detail?: string, stepId?: number) => void
  chatId?: string
}): Promise<AskPayload> {
  const { question, namespace, history, llmOverride, systemPrompt, images, onPhase, chatId } = opts

  let stepCounter = 0
  const emitPhase = (phase: AgentPhase, detail?: string) => {
    onPhase?.(phase, detail, ++stepCounter)
  }

  const requestId = randomUUID()
  const requestT0 = Date.now()
  debugBus.debugEmit({ type: "request_start", requestId, chatId, question, namespace })

  const safeQ = normalizeTopic(question)
  const tools = buildTools(namespace, embeddings as any)

  const baseLlm = (llmOverride || llm).raw()

  let llmWithTools: any
  try {
    llmWithTools = baseLlm.bindTools(tools)
  } catch {
    emitPhase("generating")
    const { handleAsk } = await import("./ask")
    return handleAsk({ q: question, namespace, history, llmOverride, systemPrompt })
  }

  emitPhase("thinking")

  const sysPromptText = buildAgentSystemPrompt(systemPrompt)
  const messages: any[] = [
    new SystemMessage(sysPromptText),
    ...toConversationHistory(history),
    buildHumanMessage(safeQ, images),
  ]

  debugBus.debugEmit({ type: "system_prompt", requestId, prompt: sysPromptText })
  debugBus.debugEmit({
    type: "history", requestId,
    messages: (history || []).slice(-8).map(m => ({ role: m.role, content: toMessageContent(m.content).slice(0, 200) })),
  })

  const collectedSources: any[] = []
  let exerciseDetected = false
  const sentImageUrls = new Set<string>()

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const t0 = Date.now()
    debugBus.debugEmit({ type: "llm_call_start", requestId, iteration: i, messageCount: messages.length })

    const response = await llmWithTools.invoke(messages)
    messages.push(response)

    const rawText = toText(response)
    const toolCalls = (response.tool_calls || []).map((tc: any) => ({ name: tc.name, args: tc.args, id: tc.id }))
    debugBus.debugEmit({
      type: "llm_call_end", requestId, iteration: i, durationMs: Date.now() - t0,
      rawContent: rawText.slice(0, 2000),
      toolCalls,
    })

    if (!response.tool_calls?.length) {
      const result = parseAgentResponse(rawText, collectedSources)
      debugBus.debugEmit({ type: "final_parse", requestId, parsed: { topic: result.topic, answer: result.answer.slice(0, 500), sourceCount: result.sources?.length || 0 } })
      debugBus.debugEmit({ type: "request_end", requestId, durationMs: Date.now() - requestT0 })
      return result
    }

    let needExerciseRules = false
    for (const tc of response.tool_calls) {
      const toolName = tc.name as string
      if (toolName === "source_search") {
        emitPhase("searching_sources", tc.args?.query)
      } else if (toolName === "list_sources") {
        emitPhase("listing_sources")
      } else if (toolName === "web_search") {
        emitPhase("searching_web", tc.args?.query)
      }

      const toolObj = tools.find(t => t.name === toolName)
      if (!toolObj) {
        messages.push(new ToolMessage({ content: `Tool "${toolName}" not found`, tool_call_id: tc.id }))
        continue
      }

      try {
        debugBus.debugEmit({ type: "tool_call_start", requestId, toolName, args: tc.args, toolCallId: tc.id })
        const tt0 = Date.now()

        const result = await toolObj.invoke(tc.args)
        const resultStr = typeof result === "string" ? result : JSON.stringify(result)

        debugBus.debugEmit({
          type: "tool_call_end", requestId, toolName, toolCallId: tc.id,
          result: resultStr.slice(0, 3000), durationMs: Date.now() - tt0,
        })

        try {
          const parsed = JSON.parse(resultStr)
          if (Array.isArray(parsed)) {
            collectedSources.push(...parsed)
            if (toolName === "source_search" && !exerciseDetected && parsed.some((d: any) => d.sourceType === "exercise")) {
              exerciseDetected = true
              needExerciseRules = true
              debugBus.debugEmit({ type: "exercise_detected", requestId })
            }
          }
        } catch {}

        emitPhase("reading_results")
        const capped = resultStr.length > CONTEXT_BUDGET
          ? resultStr.slice(0, CONTEXT_BUDGET) + "\n[...truncated]"
          : resultStr
        messages.push(new ToolMessage({ content: capped, tool_call_id: tc.id }))
      } catch (err: any) {
        debugBus.debugEmit({ type: "tool_error", requestId, toolName, toolCallId: tc.id, error: err?.message || String(err) })
        messages.push(new ToolMessage({ content: `Tool error: ${err?.message || err}`, tool_call_id: tc.id }))
      }
    }
    // Inject exercise rules after all ToolMessages so we don't break the tool_call→ToolMessage pairing
    if (needExerciseRules) {
      messages.push(new SystemMessage(EXERCISE_RULES))
    }

    // Inject retrieved images as visual content so the LLM can actually see diagrams
    const MAX_IMAGES_PER_ITER = 5
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB per image
    const imageUrls: string[] = []
    for (const src of collectedSources) {
      if (!Array.isArray(src.images)) continue
      for (const url of src.images) {
        if (typeof url === "string" && !sentImageUrls.has(url)) imageUrls.push(url)
      }
    }
    if (imageUrls.length > 0) {
      const imageParts: any[] = []
      for (const url of imageUrls.slice(0, MAX_IMAGES_PER_ITER)) {
        const localPath = resolveImagePath(url)
        if (!localPath || !fs.existsSync(localPath)) continue
        try {
          const stat = fs.statSync(localPath)
          if (stat.size > MAX_IMAGE_SIZE) continue
          const data = fs.readFileSync(localPath)
          const b64 = data.toString("base64")
          const mime = mimeFromExt(localPath)
          imageParts.push({
            type: "image_url",
            image_url: { url: `data:${mime};base64,${b64}` },
          })
          sentImageUrls.add(url)
        } catch (err) {
          console.warn("[agentChat] failed to read retrieved image:", localPath, err)
        }
      }
      if (imageParts.length > 0) {
        messages.push(new HumanMessage({
          content: [
            { type: "text", text: `Here are ${imageParts.length} image(s) referenced in the retrieved sources. Analyze their visual content to inform your answer.` },
            ...imageParts,
          ],
        }))
        debugBus.debugEmit({ type: "images_injected", requestId, count: imageParts.length })
      }
    }

    emitPhase("generating")
  }

  // Hit max iterations — one final call without tools
  emitPhase("generating")
  debugBus.debugEmit({ type: "llm_call_start", requestId, iteration: MAX_ITERATIONS, messageCount: messages.length })
  try {
    const t0 = Date.now()
    const finalResponse = await baseLlm.invoke(messages)
    debugBus.debugEmit({ type: "llm_call_end", requestId, iteration: MAX_ITERATIONS, durationMs: Date.now() - t0, rawContent: toText(finalResponse).slice(0, 2000), toolCalls: [] })
    const result = parseAgentResponse(toText(finalResponse), collectedSources)
    debugBus.debugEmit({ type: "final_parse", requestId, parsed: { topic: result.topic, answer: result.answer.slice(0, 500), sourceCount: result.sources?.length || 0 } })
    debugBus.debugEmit({ type: "request_end", requestId, durationMs: Date.now() - requestT0 })
    return result
  } catch (err: any) {
    debugBus.debugEmit({ type: "request_error", requestId, error: err?.message || String(err) })
    return {
      topic: "General",
      answer: "I gathered some information but encountered an error generating the final answer. Please try again.",
      flashcards: [],
      sources: extractSources(collectedSources),
    }
  }
}
