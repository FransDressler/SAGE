import type { UserInstructions } from "../../types/instructions"

export type ResearchDepth = "quick" | "standard" | "comprehensive"

export type ResearchOptions = {
  topic: string
  subjectId: string
  sourceIds?: string[]
  depth?: ResearchDepth
  instructions?: UserInstructions
  onProgress?: (phase: string, detail?: string) => void
}

export type ResearchResult = {
  ok: boolean
  file: string
}

export type ResearchPlan = {
  title: string
  abstract: string
  subQuestions: SubQuestion[]
  externalTopics: string[]
}

export type SubQuestion = {
  id: string
  question: string
  searchTerms: string[]
  expectedSources: ("rag" | "wikipedia" | "arxiv" | "pubmed" | "web")[]
}

export type GatheredContext = {
  questionId: string
  ragText: string
  wikiText: string
  arxivAbstracts: ArxivResult[]
  pubmedAbstracts: PubmedResult[]
  webResults: string
}

export type ArxivResult = {
  title: string
  authors: string[]
  abstract: string
  published: string
  arxivId: string
  pdfUrl: string
}

export type PubmedResult = {
  title: string
  authors: string[]
  abstract: string
  published: string
  pmid: string
  doi?: string
}

export type ResearchEvent =
  | { type: "ready"; researchId: string }
  | { type: "phase"; value: string; detail?: string }
  | { type: "plan"; plan: ResearchPlan }
  | { type: "file"; file: string }
  | { type: "done" }
  | { type: "error"; error: string }
  | { type: "ping"; t: number }
