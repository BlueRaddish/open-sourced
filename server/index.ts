import cors from 'cors'
import express from 'express'
import { generateStudySet, publicError } from './generate.js'

const app = express()
const port = Number(process.env.PORT || 8787)
app.use(cors({ origin: process.env.ALLOWED_ORIGIN?.split(',') || false }))
app.use(express.json({ limit: '100kb' }))
app.get('/api/health', (_request, response) => response.json({ configured: Boolean(process.env.OPENROUTER_API_KEY), mode: 'free-only' }))
app.post('/api/generate', async (request, response) => {
  try { response.json(await generateStudySet(request.body)) }
  catch (error) { const result = publicError(error); console.error(error); response.status(result.status).json({ error: result.message }) }
})
app.listen(port, () => console.log(`Open SourcED AI server listening on http://localhost:${port}`))
