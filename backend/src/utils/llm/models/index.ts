import * as ollama from './ollama'
import * as gemini from './gemini'
import * as openai from './openai'
import * as grok from './grok'
import * as claude from './claude'
import * as openrouter from './openrouter'
import { config } from '../../../config/env'
import type { EmbeddingsLike, LLM } from './types'

type Pair = { llm: LLM; embeddings: EmbeddingsLike }

export type AvailableProvider = { id: string; name: string; defaultModel: string }

function pick(p: string) {
  switch (p) {
    case 'ollama': return ollama
    case 'gemini': return gemini
    case 'openai': return openai
    case 'grok': return grok
    case 'claude': return claude
    case 'openrouter': return openrouter
    default: return gemini
  }
}

export function makeModels(): Pair {
  const mod = pick(config.provider)
  const llm = mod.makeLLM(config)

  const embMod = config.embeddings_provider
    ? pick(config.embeddings_provider)
    : mod

  let embeddings: EmbeddingsLike
  try {
    embeddings = embMod.makeEmbeddings(config)
  } catch {
    const d = pick('openai')
    embeddings = d.makeEmbeddings(config)
  }

  return { llm, embeddings }
}

const providerMeta: { id: string; name: string; keyField: string; modelField: string }[] = [
  { id: 'gemini',     name: 'Gemini',     keyField: 'gemini',    modelField: 'gemini_model' },
  { id: 'openai',     name: 'OpenAI',     keyField: 'openai',    modelField: 'openai_model' },
  { id: 'claude',     name: 'Claude',     keyField: 'claude',    modelField: 'claude_model' },
  { id: 'grok',       name: 'Grok',       keyField: 'grok',      modelField: 'grok_model' },
  { id: 'openrouter', name: 'OpenRouter', keyField: 'openrouter', modelField: 'openrouter_model' },
  { id: 'ollama',     name: 'Ollama',     keyField: '',          modelField: '' },
]

export function getAvailableProviders(): AvailableProvider[] {
  const out: AvailableProvider[] = []
  for (const p of providerMeta) {
    if (p.id === 'ollama') {
      out.push({ id: 'ollama', name: 'Ollama', defaultModel: (config.ollama as any)?.model || 'llama4' })
      continue
    }
    const key = (config as any)[p.keyField]
    if (key && typeof key === 'string' && key.trim()) {
      out.push({ id: p.id, name: p.name, defaultModel: (config as any)[p.modelField] || '' })
    }
  }
  return out
}

export function makeLLMFromOverride(provider: string, model?: string): LLM {
  const mod = pick(provider)
  const cfgClone = { ...config }
  if (model) {
    const meta = providerMeta.find(p => p.id === provider)
    if (meta && meta.modelField) {
      ;(cfgClone as any)[meta.modelField] = model
    }
    if (provider === 'ollama') {
      ;(cfgClone as any).ollama = { ...(config.ollama as any), model }
    }
  }
  return mod.makeLLM(cfgClone)
}

export function resolveOverride(body: any): LLM | undefined {
  const provider = typeof body?.provider === 'string' ? body.provider.trim() : ''
  if (!provider) return undefined
  const model = typeof body?.model === 'string' ? body.model.trim() : undefined
  return makeLLMFromOverride(provider, model || undefined)
}