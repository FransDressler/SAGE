export type SearchMode = "quick" | "deep"

export type WebSearchResult = {
  title: string
  url: string
  content: string
  score?: number
}

export type WebSearchProgress =
  | { type: "phase"; value: string }
  | { type: "result"; result: WebSearchResult }
  | { type: "done"; sourceId: string }
  | { type: "error"; error: string }
