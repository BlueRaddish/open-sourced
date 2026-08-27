import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateStudySet, resolveFreeModel } from './generate.js'

afterEach(() => {
  delete process.env.OPENROUTER_API_KEY
  delete process.env.OPENROUTER_MODEL
  vi.unstubAllGlobals()
})

describe('free-only model enforcement', () => {
  it('defaults to the OpenRouter free router', () => {
    expect(resolveFreeModel(undefined)).toBe('openrouter/free')
  })

  it('allows explicit free variants', () => {
    expect(resolveFreeModel('provider/example:free')).toBe('provider/example:free')
  })

  it('rejects every paid model identifier before a request is made', () => {
    expect(() => resolveFreeModel('openai/gpt-5')).toThrow(/locked to free/i)
  })

  it('stops with a quota error instead of falling back to paid inference', async () => {
    process.env.OPENROUTER_API_KEY = 'test-key'
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { message: 'Rate limited' } }), { status: 429, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', request)
    await expect(generateStudySet({ topic: 'Cells', resource: 'A'.repeat(120), count: 8, difficulty: 'beginner' })).rejects.toThrow(/free OpenRouter quota/i)
    const body = JSON.parse(request.mock.calls[0][1].body as string)
    expect(body.model).toBe('openrouter/free')
    expect(body.provider).toEqual({ require_parameters: true, data_collection: 'deny' })
  })

  it('keeps author directions separate from source material', async () => {
    process.env.OPENROUTER_API_KEY = 'test-key'
    const generated = { title: 'Cells', subject: 'Biology', description: 'Basics', cards: [{ term: 'Cell', definition: 'Basic unit', note: '' }, { term: 'Nucleus', definition: 'Contains DNA', note: '' }] }
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(generated) } }] }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', request)
    await generateStudySet({ topic: 'Cells', resource: 'A'.repeat(120), count: 8, difficulty: 'beginner', instructions: 'Use scenario questions.' })
    const body = JSON.parse(request.mock.calls[0][1].body as string)
    expect(body.messages[1].content).toContain('AUTHOR DIRECTIONS (style and emphasis only):\nUse scenario questions.')
    expect(body.messages[1].content).toContain('SOURCE MATERIAL:')
  })
})
