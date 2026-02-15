export function extractFirstJsonObject(s: string): string {
  let depth = 0, start = -1, inString = false, escape = false
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (inString) {
      if (escape) { escape = false; continue }
      if (ch === "\\") { escape = true; continue }
      if (ch === '"') { inString = false }
      continue
    }
    if (ch === '"') { inString = true; continue }
    if (ch === "{") { if (depth === 0) start = i; depth++ }
    else if (ch === "}") { depth--; if (depth === 0 && start !== -1) return s.slice(start, i + 1) }
  }
  return ""
}

/**
 * Sanitize a JSON string so JSON.parse succeeds even when the LLM emits
 * literal newlines, tabs, or carriage returns inside string values.
 */
export function sanitizeJsonString(s: string): string {
  let out = "", inString = false, escape = false
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (inString) {
      if (escape) { escape = false; out += ch; continue }
      if (ch === "\\") { escape = true; out += ch; continue }
      if (ch === '"') { inString = false; out += ch; continue }
      // Escape literal control characters that break JSON.parse
      if (ch === "\n") { out += "\\n"; continue }
      if (ch === "\r") { out += "\\r"; continue }
      if (ch === "\t") { out += "\\t"; continue }
      out += ch
    } else {
      if (ch === '"') inString = true
      out += ch
    }
  }
  return out
}
