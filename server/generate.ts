import OpenAI from 'openai'
import { z } from 'zod'

const requestSchema = z.object({
  topic: z.string().trim().min(2).max(120),
  resource: z.string().trim().min(100).max(60_000),
  count: z.number().int().min(4).max(50),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
})

const outputSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    subject: { type: 'string' },
    description: { type: 'string' },
    cards: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          term: { type: 'string' },
          definition: { type: 'string' },
          note: { type: 'string' },
        },
        required: ['term', 'definition', 'note'],
      },
    },
  },
  required: ['title', 'subject', 'description', 'cards'],
} as const

export type GenerationResult = { title: string; subject: string; description: string; cards: { term: string; definition: string; note: string }[] }

export async function generateStudySet(input: unknown): Promise<GenerationResult> {
  const parsed = requestSchema.parse(input)
  if (!process.env.OPENAI_API_KEY) throw new Error('AI generation is not configured on this server.')
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || 'gpt-5.4-mini',
    instructions: `You create accurate, retrieval-focused flashcards only from the supplied resource. Cover the most important concepts without duplicates. Keep terms focused and definitions concise but complete. Notes should add a brief mnemonic, example, distinction, or source-grounded context; use an empty string when none helps. Never invent facts not supported by the resource. Produce exactly ${parsed.count} cards at ${parsed.difficulty} difficulty.`,
    input: `Requested topic: ${parsed.topic}\n\nSOURCE MATERIAL:\n${parsed.resource}`,
    text: { format: { type: 'json_schema', name: 'study_set', strict: true, schema: outputSchema } },
  })
  if (!response.output_text) throw new Error('The model returned no study material.')
  const result = JSON.parse(response.output_text) as GenerationResult
  if (!Array.isArray(result.cards) || result.cards.length < 2) throw new Error('The generated study set was incomplete.')
  return result
}

export function publicError(error: unknown) {
  if (error instanceof z.ZodError) return { status: 400, message: error.issues[0]?.message || 'Invalid generation request.' }
  const message = error instanceof Error ? error.message : 'Generation failed.'
  if (message.includes('not configured')) return { status: 503, message }
  return { status: 500, message: 'Generation failed. Check the server log and try again.' }
}
