import { randomUUID } from "crypto"
import {
  getDeck,
  addCard,
  updateCard,
  deleteCard,
  clearDeck,
  generateCardsForSubtopic,
  generateCardsForTopic,
  generateFullDeck,
  exportDeckApkg,
  syncFromAnki,
} from "../../services/ankideck"
import type { AnkiCard } from "../../services/ankideck/types"
import { reviewCard, getStudyQueue, getStudyStats, type Rating } from "../../services/ankideck/study"
import {
  login as ankiwebLogin,
  downloadCollection,
  uploadCollection,
  uploadMedia,
  getAnkiWebAuth,
  saveAnkiWebAuth,
  deleteAnkiWebAuth,
} from "../../services/ankideck/ankiweb"
import { mergeIntoCollection, collectMediaFiles, extractCardsFromCollection } from "../../services/ankideck/merge"
import { getSubject } from "../../utils/subjects/subjects"
import { emitToAll } from "../../utils/chat/ws"

const sessions = new Map<string, Set<any>>()
const slog = (...a: any) => console.log("[ankideck]", ...a)

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function ankideckRoutes(app: any) {
  // WebSocket endpoint
  app.ws("/ws/ankideck", (ws: any, req: any) => {
    const u = new URL(req.url, "http://localhost")
    const generationId = u.searchParams.get("generationId")
    if (!generationId) return ws.close(1008, "generationId required")

    const key = `ankideck:${generationId}`
    let s = sessions.get(key)
    if (!s) { s = new Set(); sessions.set(key, s) }
    s.add(ws)

    slog("ws open", generationId, "clients:", s.size)
    ws.send(JSON.stringify({ type: "ready", generationId }))

    ws.on("error", (e: any) => slog("ws err", generationId, e?.message || e))
    ws.on("close", () => {
      const set = sessions.get(key)
      if (set) {
        set.delete(ws)
        if (set.size === 0) sessions.delete(key)
      }
    })

    const iv = setInterval(() => {
      try { if (ws.readyState === 1) ws.send(JSON.stringify({ type: "ping", t: Date.now() })) } catch {}
    }, 15000)
    ws.on("close", () => clearInterval(iv))
  })

  // GET /subjects/:id/ankideck — list all cards
  app.get("/subjects/:id/ankideck", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const deck = await getDeck(subjectId)
      res.send({ ok: true, cards: deck.cards, lastGenerated: deck.lastGenerated })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  // DELETE /subjects/:id/ankideck — delete all cards
  app.delete("/subjects/:id/ankideck", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const deleted = await clearDeck(subjectId)
      res.send({ ok: true, deleted })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  // POST /subjects/:id/ankideck/cards — manually add a card
  app.post("/subjects/:id/ankideck/cards", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const { front, back, tags, topicId, subtopicId, imageUrl } = req.body
      if (!front || !back) return res.status(400).send({ ok: false, error: "front and back required" })

      const now = Date.now()
      const card: AnkiCard = {
        id: randomUUID(),
        front,
        back,
        tags: Array.isArray(tags) ? tags : [],
        topicId,
        subtopicId,
        imageUrl,
        createdAt: now,
        updatedAt: now,
      }
      await addCard(subjectId, card)
      res.send({ ok: true, card })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  // PUT /subjects/:id/ankideck/cards/:cardId — edit a card
  app.put("/subjects/:id/ankideck/cards/:cardId", async (req: any, res: any) => {
    try {
      const { id: subjectId, cardId } = req.params
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const card = await updateCard(subjectId, cardId, req.body)
      if (!card) return res.status(404).send({ ok: false, error: "card not found" })
      res.send({ ok: true, card })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  // DELETE /subjects/:id/ankideck/cards/:cardId — delete a card
  app.delete("/subjects/:id/ankideck/cards/:cardId", async (req: any, res: any) => {
    try {
      const { id: subjectId, cardId } = req.params
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const ok = await deleteCard(subjectId, cardId)
      if (!ok) return res.status(404).send({ ok: false, error: "card not found" })
      res.send({ ok: true })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  // POST /subjects/:id/ankideck/generate — generate cards (by subtopic, topic, or full deck)
  app.post("/subjects/:id/ankideck/generate", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const subject = await getSubject(subjectId)
      if (!subject) return res.status(404).send({ ok: false, error: "subject not found" })

      const { topicId, subtopicId, count, prompt: userPrompt } = req.body
      const generationId = randomUUID()
      const wsKey = `ankideck:${generationId}`

      res.send({ ok: true, generationId, stream: `/ws/ankideck?generationId=${generationId}` })

      setImmediate(async () => {
        const emit = (phase: string, detail?: string) => {
          emitToAll(sessions.get(wsKey), { type: "phase", value: phase, detail })
        }

        try {
          let cards: AnkiCard[]

          if (subtopicId && topicId) {
            cards = await generateCardsForSubtopic(subjectId, topicId, subtopicId, count || 5, emit, userPrompt)
          } else if (topicId) {
            cards = await generateCardsForTopic(subjectId, topicId, count || 5, emit, userPrompt)
          } else {
            cards = await generateFullDeck(subjectId, count || 5, emit, userPrompt)
          }

          emitToAll(sessions.get(wsKey), { type: "cards", cards })
          emitToAll(sessions.get(wsKey), { type: "done" })
          slog("generate done", subjectId, "cards:", cards.length)
        } catch (e: any) {
          slog("generate error", subjectId, e?.message || e)
          emitToAll(sessions.get(wsKey), { type: "error", error: e?.message || "generation failed" })
        }
      })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  // GET /subjects/:id/ankideck/export — download as Anki-importable file
  app.get("/subjects/:id/ankideck/export", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const subject = await getSubject(subjectId)
      const deckName = subject?.name || "AnkiDeck"

      const buf = await exportDeckApkg(subjectId, deckName)
      const safeName = deckName.replace(/[^a-zA-Z0-9_-]/g, "_")
      res.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${safeName}.apkg"`,
        "Content-Length": buf.length,
      })
      res.end(buf)
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "export failed" })
    }
  })

  // --- AnkiWeb Sync ---

  // POST /subjects/:id/ankideck/ankiweb-login — login to AnkiWeb
  app.post("/subjects/:id/ankideck/ankiweb-login", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const { username, password, deckName } = req.body
      if (!username || !password) return res.status(400).send({ ok: false, error: "username and password required" })

      const hkey = await ankiwebLogin(username, password)
      await saveAnkiWebAuth(subjectId, {
        hkey,
        username,
        deckName: deckName || "PageLM",
      })
      slog("ankiweb login ok", subjectId, username)
      res.send({ ok: true, username })
    } catch (e: any) {
      slog("ankiweb login error", e?.message)
      res.status(401).send({ ok: false, error: e?.message || "login failed" })
    }
  })

  // GET /subjects/:id/ankideck/ankiweb-status — check connection status
  app.get("/subjects/:id/ankideck/ankiweb-status", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const auth = await getAnkiWebAuth(subjectId)
      if (!auth) return res.send({ ok: true, connected: false })
      res.send({ ok: true, connected: true, username: auth.username, deckName: auth.deckName, lastSync: auth.lastSync })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  // PUT /subjects/:id/ankideck/ankiweb-deckname — update deck name
  app.put("/subjects/:id/ankideck/ankiweb-deckname", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const auth = await getAnkiWebAuth(subjectId)
      if (!auth) return res.status(400).send({ ok: false, error: "not connected to AnkiWeb" })
      const { deckName } = req.body
      if (!deckName) return res.status(400).send({ ok: false, error: "deckName required" })
      auth.deckName = deckName
      await saveAnkiWebAuth(subjectId, auth)
      res.send({ ok: true })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  // DELETE /subjects/:id/ankideck/ankiweb — disconnect
  app.delete("/subjects/:id/ankideck/ankiweb", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      await deleteAnkiWebAuth(subjectId)
      res.send({ ok: true })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  // POST /subjects/:id/ankideck/sync — sync deck to AnkiWeb
  app.post("/subjects/:id/ankideck/sync", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const auth = await getAnkiWebAuth(subjectId)
      if (!auth) return res.status(400).send({ ok: false, error: "not connected to AnkiWeb — login first" })

      const syncId = randomUUID()
      const wsKey = `ankideck:${syncId}`

      res.send({ ok: true, syncId, stream: `/ws/ankideck?generationId=${syncId}` })

      setImmediate(async () => {
        const emit = (phase: string, detail?: string) => {
          emitToAll(sessions.get(wsKey), { type: "phase", value: phase, detail })
        }

        try {
          emit("downloading", "Downloading collection from AnkiWeb...")
          const collectionBuf = await downloadCollection(auth.hkey)
          slog("downloaded collection", collectionBuf.length, "bytes")

          // Bidirectional: extract Anki cards and sync back to PageLM
          emit("extracting", "Reading cards from Anki collection...")
          const extractedCards = extractCardsFromCollection(collectionBuf, auth.deckName)
          slog("extracted", extractedCards.length, "cards from Anki")

          let syncStats = { updated: 0, added: 0, deleted: 0 }
          if (extractedCards.length > 0) {
            emit("syncing-back", `Syncing ${extractedCards.length} card(s) from Anki...`)
            syncStats = await syncFromAnki(subjectId, extractedCards)
            slog("sync-back stats:", syncStats)
          }

          // Re-read deck after sync-back (now includes Anki changes + review state)
          const deck = await getDeck(subjectId)

          if (deck.cards.length > 0) {
            emit("merging", `Merging ${deck.cards.length} cards into "${auth.deckName}"...`)
            const merged = mergeIntoCollection(collectionBuf, deck.cards, auth.deckName, subjectId)
            slog("merged collection", merged.length, "bytes")

            emit("uploading", "Uploading collection to AnkiWeb...")
            await uploadCollection(auth.hkey, merged)
            slog("upload complete")

            // Upload media (images)
            const mediaFiles = collectMediaFiles(deck.cards, subjectId)
            if (mediaFiles.length > 0) {
              emit("media", `Uploading ${mediaFiles.length} image(s)...`)
              await uploadMedia(auth.hkey, mediaFiles)
              slog("media upload complete:", mediaFiles.length, "files")
            }
          }

          auth.lastSync = Date.now()
          await saveAnkiWebAuth(subjectId, auth)

          emitToAll(sessions.get(wsKey), { type: "done", stats: syncStats })
          slog("sync done", subjectId, "stats:", syncStats)
        } catch (e: any) {
          slog("sync error", subjectId, e?.message || e)
          emitToAll(sessions.get(wsKey), { type: "error", error: e?.message || "sync failed" })
        }
      })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  // --- Study Mode ---

  // GET /subjects/:id/ankideck/study-queue — get cards due for study
  app.get("/subjects/:id/ankideck/study-queue", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100)
      const deck = await getDeck(subjectId)
      const queue = getStudyQueue(deck.cards, limit)
      const stats = getStudyStats(deck.cards)
      res.send({ ok: true, queue, stats })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })

  // POST /subjects/:id/ankideck/review — review a card
  app.post("/subjects/:id/ankideck/review", async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      if (!UUID_RE.test(subjectId)) return res.status(400).send({ ok: false, error: "invalid id" })
      const { cardId, rating } = req.body
      if (!cardId || !rating) return res.status(400).send({ ok: false, error: "cardId and rating required" })
      const validRatings: Rating[] = ["again", "hard", "good", "easy"]
      if (!validRatings.includes(rating)) return res.status(400).send({ ok: false, error: "rating must be again|hard|good|easy" })

      const deck = await getDeck(subjectId)
      const idx = deck.cards.findIndex(c => c.id === cardId)
      if (idx === -1) return res.status(404).send({ ok: false, error: "card not found" })

      deck.cards[idx] = reviewCard(deck.cards[idx], rating as Rating)
      const { saveDeck } = await import("../../services/ankideck")
      await saveDeck(subjectId, deck)

      const stats = getStudyStats(deck.cards)
      res.send({ ok: true, card: deck.cards[idx], stats })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || "internal" })
    }
  })
}
