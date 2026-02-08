import db from '../../utils/database/keyv'

export function flashcardRoutes(app: any) {
  app.post('/subjects/:id/flashcards', async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      const { question, answer, tag } = req.body
      if (!question || !answer || !tag) return res.status(400).send({ error: 'question, answer, tag required' })
      const id = crypto.randomUUID()
      const card = { id, question, answer, tag, created: Date.now() }
      let cards = await db.get(`subject:${subjectId}:flashcards`) || []
      cards.push(card)
      await db.set(`subject:${subjectId}:flashcards`, cards)
      res.send({ ok: true, flashcard: card })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || 'failed' })
    }
  })

  app.get('/subjects/:id/flashcards', async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      res.send({ ok: true, flashcards: await db.get(`subject:${subjectId}:flashcards`) || [] })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || 'failed' })
    }
  })

  app.delete('/subjects/:id/flashcards/:cardId', async (req: any, res: any) => {
    try {
      const subjectId = req.params.id
      const cardId = req.params.cardId
      if (!cardId) return res.status(400).send({ error: 'id required' })
      let cards = await db.get(`subject:${subjectId}:flashcards`) || []
      cards = cards.filter((c: any) => c.id !== cardId)
      await db.set(`subject:${subjectId}:flashcards`, cards)
      res.send({ ok: true })
    } catch (e: any) {
      res.status(500).send({ ok: false, error: e?.message || 'failed' })
    }
  })
}
