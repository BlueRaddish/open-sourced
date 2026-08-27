import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { completeOpenRouterOAuth, generateWithOpenRouter, hasOpenRouterSession, listGenerationModels, resolveGenerationModel } from './openrouter'

describe('per-user OpenRouter connection', () => {
  beforeEach(() => {
    sessionStorage.clear()
    history.replaceState(null, '', '/open-source-ed/?code=test-code')
    sessionStorage.setItem('open-source-ed.openrouter.pkce-verifier', 'test-verifier')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    sessionStorage.clear()
    history.replaceState(null, '', '/open-source-ed/')
  })

  it('exchanges OAuth and defaults generation to the free router', async () => {
    const request = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ key: 'user-session-key' }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ title: 'Cells', subject: 'Biology', description: 'Basics', cards: Array.from({ length: 4 }, (_, index) => ({ term: `T${index}`, definition: `D${index}`, note: '' })) }) } }] }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', request)
    expect(await completeOpenRouterOAuth()).toBe(true)
    expect(hasOpenRouterSession()).toBe(true)
    await generateWithOpenRouter({ topic: 'Cells', resource: 'A'.repeat(120), instructions: 'Focus on organelle comparisons.' })
    const body = JSON.parse(request.mock.calls[1][1].body as string)
    expect(body.model).toBe('openrouter/free')
    expect(body.provider).toEqual({ require_parameters: true, data_collection: 'deny' })
    expect(body.messages[1].content).toContain('Focus on organelle comparisons.')
    expect(body.messages[0].content).toContain('Choose the number of cards from the source itself.')
    expect(body.messages[0].content).toContain('Infer the appropriate depth')
    expect(body.response_format.json_schema.schema.properties.cards).toMatchObject({ minItems: 2, maxItems: 100 })
  })

  it('surfaces free quota exhaustion without retrying another model', async () => {
    const request = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ key: 'user-session-key' }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { message: 'Rate limited' } }), { status: 429, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', request)
    await completeOpenRouterOAuth()
    await expect(generateWithOpenRouter({ topic: 'Cells', resource: 'A'.repeat(120) })).rejects.toThrow(/free OpenRouter quota/i)
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('uses an explicitly selected provider model with the visitor-owned key', async () => {
    const request = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ key: 'user-session-key' }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ title: 'Cells', subject: 'Biology', description: 'Basics', cards: [] }) } }] }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', request)
    await completeOpenRouterOAuth()
    await generateWithOpenRouter({ topic: 'Cells', resource: 'A'.repeat(120), count: 17, model: 'anthropic/claude-sonnet-4.5' })
    const body = JSON.parse(request.mock.calls[1][1].body as string)
    expect(body.model).toBe('anthropic/claude-sonnet-4.5')
    expect(body.provider.data_collection).toBe('deny')
    expect(body.messages[0].content).toContain('Produce exactly 17 cards')
    expect(body.response_format.json_schema.schema.properties.cards).toMatchObject({ minItems: 17, maxItems: 17 })
  })

  it('rejects model identifiers outside supported families', () => {
    expect(() => resolveGenerationModel('vendor/unknown')).toThrow(/supported GPT, Claude, Gemini/i)
  })

  it('loads only current text models with structured output support', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [
      { id: 'openai/gpt-current', name: 'GPT Current', created: 20, pricing: { prompt: '0.000001', completion: '0.000002' }, supported_parameters: ['structured_outputs'], architecture: { output_modalities: ['text'] } },
      { id: 'google/gemini-image', name: 'Image only', created: 30, pricing: {}, supported_parameters: ['structured_outputs'], architecture: { output_modalities: ['image'] } },
      { id: 'anthropic/claude-old', name: 'No schema', created: 10, pricing: {}, supported_parameters: [], architecture: { output_modalities: ['text'] } },
    ] }), { status: 200, headers: { 'Content-Type': 'application/json' } })))
    await expect(listGenerationModels()).resolves.toEqual([{ id: 'openai/gpt-current', name: 'GPT Current', family: 'openai', contextLength: 0, promptPerMillion: 1, completionPerMillion: 2 }])
  })
})
