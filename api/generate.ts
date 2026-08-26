import { generateStudySet, publicError } from '../server/generate.js'

type ApiRequest = { method?: string; body?: unknown }
type ApiResponse = { status: (code: number) => ApiResponse; json: (body: unknown) => unknown }

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' })
  try { return response.status(200).json(await generateStudySet(request.body)) }
  catch (error) { const result = publicError(error); console.error(error); return response.status(result.status).json({ error: result.message }) }
}
