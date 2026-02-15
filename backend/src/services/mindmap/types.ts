export type ConceptNode = {
  id: string
  label: string
  description: string
  category: string
  importance: "high" | "medium" | "low"
  color: string
  sources: { file: string; page?: number }[]
}

export type ConceptEdge = {
  source: string
  target: string
  label: string
  weight: number
}

export type MindmapData = {
  nodes: ConceptNode[]
  edges: ConceptEdge[]
  generatedAt: number
  sourceCount: number
}
