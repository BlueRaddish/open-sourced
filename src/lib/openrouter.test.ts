import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { completeOpenRouterOAuth, generateWithOpenRouter, hasOpenRouterSession } from './openrouter'

describe('per-user free OpenRouter connection', () => {
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

  it('exchanges OAuth and always generates through the free router', async () => {
    const request = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ key: 'user-session-key' }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ title: 'Cells', subject: 'Biology', description: 'Basics', cards: Array.from({ length: 4 }, (_, index) => ({ term: `T${index}`, definition: `D${index}`, note: '' })) }) } }] }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', request)
    expect(await completeOpenRouterOAuth()).toBe(true)
    expect(hasOpenRouterSession()).toBe(true)
    await generateWithOpenRouter({ topic: 'Cells', resource: 'A'.repeat(120), count: 4, difficulty: 'beginner' })
    const body = JSON.parse(request.mock.calls[1][1].body as string)
    expect(body.model).toBe('openrouter/free')
    expect(body.provider).toEqual({ require_parameters: true })
  })

  it('surfaces free quota exhaustion without retrying another model', async () => {
    const request = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ key: 'user-session-key' }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { message: 'Rate limited' } }), { status: 429, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', request)
    await completeOpenRouterOAuth()
    await expect(generateWithOpenRouter({ topic: 'Cells', resource: 'A'.repeat(120), count: 4, difficulty: 'beginner' })).rejects.toThrow(/free OpenRouter quota/i)
    expect(request).toHaveBeenCalledTimes(2)
  })
})
