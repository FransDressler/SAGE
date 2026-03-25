import Anthropic from "@anthropic-ai/sdk"
import { config } from "../../../config/env"

let client: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: config.claude || process.env.ANTHROPIC_API_KEY,
    })
  }
  return client
}

export type ClaudeStreamCallbacks = {
  onThinking?: (text: string) => void
  onText?: (text: string) => void
  onCitation?: (citation: any) => void
  onDone?: (fullMessage: any) => void
  onError?: (error: Error) => void
}

export async function streamClaudeResponse(opts: {
  system: string
  messages: Array<{ role: "user" | "assistant"; content: string | any[] }>
  maxTokens?: number
  callbacks: ClaudeStreamCallbacks
}): Promise<{ text: string; thinking: string; citations: any[] }> {
  const anthropic = getAnthropicClient()

  const thinkingConfig = config.claude_thinking
  const effort = config.claude_effort
  const maxTokens = opts.maxTokens || config.max_tokens || 16384

  const requestBody: Record<string, any> = {
    model: config.claude_model || "claude-sonnet-4-6-20250514",
    max_tokens: maxTokens,
    system: opts.system,
    messages: opts.messages,
  }

  if (effort !== "high") {
    requestBody.effort = effort
  }

  if (thinkingConfig === "adaptive") {
    requestBody.thinking = { type: "adaptive", display: "summarized" }
  } else if (thinkingConfig === "enabled") {
    requestBody.thinking = {
      type: "enabled",
      budget_tokens: Math.min(10000, maxTokens - 1),
      display: "summarized",
    }
  }

  if (thinkingConfig !== "off") {
    delete requestBody.temperature
  }

  let fullText = ""
  let thinkingText = ""
  const citations: any[] = []

  const stream = anthropic.messages.stream(requestBody as any)

  stream.on("text", (textDelta) => {
    fullText += textDelta
    opts.callbacks.onText?.(textDelta)
  })

  stream.on("thinking", (thinkingDelta) => {
    thinkingText += thinkingDelta
    opts.callbacks.onThinking?.(thinkingDelta)
  })

  stream.on("citation", (citation) => {
    citations.push(citation)
    opts.callbacks.onCitation?.(citation)
  })

  const finalMessage = await stream.finalMessage()
  opts.callbacks.onDone?.(finalMessage)

  return { text: fullText, thinking: thinkingText, citations }
}

export function buildCitableDocument(opts: {
  title: string
  text: string
}): Record<string, any> {
  return {
    type: "document",
    source: {
      type: "text",
      media_type: "text/plain",
      data: opts.text,
    },
    title: opts.title.slice(0, 100),
    citations: { enabled: true },
  }
}
