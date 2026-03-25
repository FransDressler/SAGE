import type { AnkiCard } from "./types"

export type Rating = "again" | "hard" | "good" | "easy"

const MIN_EASE = 1300
const DEFAULT_EASE = 2500
const LEARN_STEPS = [1, 10]  // minutes

export function reviewCard(card: AnkiCard, rating: Rating): AnkiCard {
  const now = Math.floor(Date.now() / 1000)
  const ease = card.ease || DEFAULT_EASE
  const interval = card.interval || 0
  const isNew = (card.cardType ?? 0) === 0 && (card.reps ?? 0) === 0

  let newInterval: number
  let newEase: number
  let newQueue: number
  let newType: number
  let newReps = (card.reps ?? 0)
  let newLapses = card.lapses ?? 0

  if (isNew || interval === 0) {
    // New or learning card
    switch (rating) {
      case "again":
        newInterval = 0
        newEase = Math.max(ease - 200, MIN_EASE)
        newQueue = 1  // learning
        newType = 1
        newLapses++
        break
      case "hard":
        newInterval = 1  // 1 day
        newEase = Math.max(ease - 150, MIN_EASE)
        newQueue = 2  // review
        newType = 2
        newReps++
        break
      case "good":
        newInterval = 1  // graduate to 1 day
        newEase = ease
        newQueue = 2
        newType = 2
        newReps++
        break
      case "easy":
        newInterval = 4  // graduate to 4 days
        newEase = ease + 150
        newQueue = 2
        newType = 2
        newReps++
        break
    }
  } else {
    // Review card
    switch (rating) {
      case "again":
        newInterval = 1
        newEase = Math.max(ease - 200, MIN_EASE)
        newQueue = 1  // back to learning
        newType = 3   // relearn
        newLapses++
        break
      case "hard":
        newInterval = Math.max(Math.round(interval * 1.2), interval + 1)
        newEase = Math.max(ease - 150, MIN_EASE)
        newQueue = 2
        newType = 2
        newReps++
        break
      case "good":
        newInterval = Math.max(Math.round(interval * (ease / 1000)), interval + 1)
        newEase = ease
        newQueue = 2
        newType = 2
        newReps++
        break
      case "easy":
        newInterval = Math.max(Math.round(interval * (ease / 1000) * 1.3), interval + 1)
        newEase = ease + 150
        newQueue = 2
        newType = 2
        newReps++
        break
    }
  }

  const dueSec = now + newInterval * 86400

  return {
    ...card,
    interval: newInterval,
    due: dueSec,
    ease: newEase,
    reps: newReps,
    lapses: newLapses,
    queue: newQueue,
    cardType: newType,
    updatedAt: Date.now(),
  }
}

export function getStudyQueue(cards: AnkiCard[], limit = 20): AnkiCard[] {
  const nowSec = Math.floor(Date.now() / 1000)

  const due: AnkiCard[] = []
  const newCards: AnkiCard[] = []

  for (const card of cards) {
    if (card.queue === -1) continue  // suspended

    const isNew = (card.cardType ?? 0) === 0 && (card.reps ?? 0) === 0
    if (isNew) {
      newCards.push(card)
    } else if ((card.due ?? 0) <= nowSec || (card.queue ?? 0) === 1) {
      due.push(card)
    }
  }

  // Sort due cards: most overdue first
  due.sort((a, b) => (a.due ?? 0) - (b.due ?? 0))

  // Combine: due cards first, then new cards
  const queue = [...due, ...newCards]
  return queue.slice(0, limit)
}

export function getStudyStats(cards: AnkiCard[]): { newCount: number; learningCount: number; dueCount: number } {
  const nowSec = Math.floor(Date.now() / 1000)
  let newCount = 0, learningCount = 0, dueCount = 0

  for (const card of cards) {
    if (card.queue === -1) continue
    const isNew = (card.cardType ?? 0) === 0 && (card.reps ?? 0) === 0
    if (isNew) {
      newCount++
    } else if ((card.queue ?? 0) === 1) {
      learningCount++
    } else if ((card.due ?? 0) <= nowSec) {
      dueCount++
    }
  }

  return { newCount, learningCount, dueCount }
}
