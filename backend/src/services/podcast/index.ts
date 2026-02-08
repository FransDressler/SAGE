import fs from "fs"
import llm from "../../utils/llm/llm"
import type { LLM } from "../../utils/llm/models/types"
import { tts, type TSeg } from "../../utils/tts"
import { execDirect } from "../../agents/runtime"
import { normalizeTopic } from "../../utils/text/normalize"
import { getLocale } from "../../lib/prompts/locale"
import { formatInstructions } from "../../lib/prompts/instructions"
import { extractFirstJsonObject } from "../../lib/ai/extract"
import type { UserInstructions } from "../../types/instructions"

export type PSeg = { spk: string; voice?: string; md: string }
export type POut = { title: string; summary: string; segments: PSeg[] }

const SEGMENT_COUNTS: Record<string, string> = {
  short: "4–8",
  medium: "8–16",
  long: "14–24",
}

const TONE_GUIDE: Record<string, string> = {
  casual: "casual, flowing, interactive — like two people thinking together, not lecturing",
  formal: "formal, academic, and precise — like two scholars discussing research with clarity and rigor",
  debate: "debate-style — speakers take opposing perspectives and argue their positions with evidence",
  "teacher-student": "teacher-student dynamic — one speaker explains while the other asks clarifying questions",
  storytelling: "narrative storytelling — weaving concepts into engaging stories and anecdotes",
}

function buildPodcastPrompt(length?: string, instructions?: UserInstructions) {
  const segRange = SEGMENT_COUNTS[length || "medium"] || SEGMENT_COUNTS.medium
  const tone = TONE_GUIDE[instructions?.tone || "casual"] || TONE_GUIDE.casual

  return `ROLE
You are a professional podcast scriptwriter.
You craft highly engaging, interactive, and natural-sounding scripts where two speakers explore ideas in a way that feels lively, curious, and practical.
The conversation should discourage rote learning and instead highlight real-world applications, relatable daily problems, and thought-provoking examples.

OUTPUT
Return only one valid JSON object in this format:
{
 "title": "string",
 "summary": "string",
 "segments": [
   {"spk":"A|B","voice":"optional voice id","md":"markdown text of spoken dialogue"},
   ...
 ]
}

RULES
- ${segRange} segments total
- Alternate speakers A and B consistently
- Each segment = 1–3 sentences max (natural spoken rhythm)
- Tone: ${tone}
- Use markdown for clarity (lists, emphasis, short paragraphs, bullet points when helpful)
- Speakers should:
  * Ask and answer questions
  * Use analogies, metaphors, and relatable daily examples
  * Tie abstract ideas to concrete real-world scenarios
  * Highlight common mistakes and misconceptions
  * Encourage curiosity and exploration over memorization
- Summary: concise and enticing, like show notes
- Avoid filler; every segment should add value, humor, or a new perspective
- Make it sound alive: energy, curiosity, humor, and quick reactions
- No code fences or extra text outside the JSON

LANGUAGE
${getLocale().instruction}

GOAL
The script should feel ready to record for a professional podcast that makes listeners think, laugh, and connect ideas to their daily lives — surpassing rote-learning style and beating competitors in engagement and clarity.${formatInstructions(instructions)}`
}

export async function makeScript(input: string, topic?: string, llmOverride?: LLM, length?: string, instructions?: UserInstructions): Promise<POut> {
  const top = normalizeTopic(topic || "general")
  const prompt = buildPodcastPrompt(length, instructions)

  const plan = {
    steps: [
      {
        tool: "podcast.script",
        input: { prompt, material: input, topic: top },
        timeoutMs: 20000,
        retries: 1
      }
    ]
  }

  try {
    const r = await execDirect({ agent: "podcaster", plan, ctx: {} })
    const out = r?.result
    if (out && typeof out === "object" && Array.isArray((out as any).segments)) {
      return out as POut
    }
  } catch (err) {
    console.warn("[podcast] agent fallback:", (err as any)?.message || err)
  }

  const m = [
    { role: "system", content: prompt },
    { role: "user", content: `topic: ${top}\n\nmaterial:\n${input}\n\nreturn only json` }
  ] as any

  const model = llmOverride || llm
  const r = await model.invoke(m)
  const t = (typeof r === "string" ? r : String((r as any)?.content || "")).trim()
  const s = extractFirstJsonObject(t) || t
  try {
    const o = JSON.parse(s)
    if (!Array.isArray(o.segments)) o.segments = []
    return o as POut
  } catch {
    throw new Error("Failed to parse podcast script from LLM response")
  }
}

export async function makeAudio(o: POut, dir: string, base: string, emit?: (m: any) => void) {
  await fs.promises.mkdir(dir, { recursive: true })
  const segs: TSeg[] = o.segments.map((x) => ({ text: x.md, voice: x.voice }))
  const out = await tts(segs, dir, base, emit)
  return out
}