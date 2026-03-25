export type AnkiCard = {
  id: string
  front: string
  back: string
  tags: string[]
  topicId?: string
  subtopicId?: string
  imageUrl?: string
  sourceId?: string
  sourceType?: "material" | "exercise"
  createdAt: number
  updatedAt: number
  // SRS review state
  ankiNoteId?: number
  interval?: number       // days until next review (0 = new/learning)
  due?: number            // next review timestamp (epoch seconds)
  ease?: number           // ease factor in permille (default 2500 = 2.5x)
  reps?: number           // total successful reviews
  lapses?: number         // times card was forgotten
  queue?: number          // 0=new, 1=learning, 2=review, 3=day-learn, -1=suspended
  cardType?: number       // 0=new, 1=learning, 2=review, 3=relearn
}

export type AnkiDeck = {
  cards: AnkiCard[]
  lastGenerated?: number
  lastSyncedFromAnki?: number
}

export type ExtractedCard = {
  guid: string
  front: string
  back: string
  tags: string[]
  interval: number
  due: number
  ease: number
  reps: number
  lapses: number
  queue: number
  cardType: number
  modifiedAt: number
}
