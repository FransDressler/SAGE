import type { UserInstructions } from "../../types/instructions"

const ALLOWED_TONES = ["casual", "formal", "debate", "teacher-student", "storytelling"]

/** Validates and sanitizes raw instructions from request body. */
export function parseInstructions(raw: unknown): UserInstructions | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined
  const obj = raw as Record<string, unknown>
  const result: UserInstructions = {}
  if (typeof obj.focusArea === "string") result.focusArea = obj.focusArea
  if (typeof obj.additionalInstructions === "string") result.additionalInstructions = obj.additionalInstructions
  if (typeof obj.tone === "string" && ALLOWED_TONES.includes(obj.tone)) result.tone = obj.tone
  return Object.keys(result).length > 0 ? result : undefined
}

export function formatInstructions(inst?: UserInstructions): string {
  if (!inst) return ""
  const parts: string[] = []
  if (inst.focusArea?.trim())
    parts.push(`FOCUS AREA\n${inst.focusArea.trim().slice(0, 300)}`)
  if (inst.additionalInstructions?.trim())
    parts.push(`ADDITIONAL GUIDANCE\n${inst.additionalInstructions.trim().slice(0, 500)}`)
  return parts.length > 0 ? "\n\n" + parts.join("\n\n") : ""
}
