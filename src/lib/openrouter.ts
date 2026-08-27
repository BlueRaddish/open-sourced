import type { GeneratedSet } from '../types'

const KEY_STORAGE = 'open-source-ed.openrouter.session-key'
const VERIFIER_STORAGE = 'open-source-ed.openrouter.pkce-verifier'
const FREE_MODEL = 'openrouter/free'

type GenerationInput = { topic: string; resource: string; count: number; difficulty: string }
type RouterResponse = { choices?: { message?: { content?: string } }[]; error?: { message?: string } }

function base64Url(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

export function hasOpenRouterSession() {
  return Boolean(sessionStorage.getItem(KEY_STORAGE))
}

export function disconnectOpenRouter() {
  sessionStorage.removeItem(KEY_STORAGE)
}

export async function beginOpenRouterOAuth() {
  const verifier = base64Url(crypto.getRandomValues(new Uint8Array(48)))
  const challenge = base64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))))
  sessionStorage.setItem(VERIFIER_STORAGE, verifier)
  const callback = `${window.location.origin}${window.location.pathname}`
  const url = new URL('https://openrouter.ai/auth')
  url.searchParams.set('callback_url', callback)
  url.searchParams.set('code_challenge', challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  window.location.assign(url)
}

export async function completeOpenRouterOAuth() {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  if (!code) return false
  const verifier = sessionStorage.getItem(VERIFIER_STORAGE)
  if (!verifier) throw new Error('The OpenRouter connection expired. Please connect again.')
  const response = await fetch('https://openrouter.ai/api/v1/auth/keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, code_verifier: verifier, code_challenge_method: 'S256' }),
  })
  const body = await response.json().catch(() => ({})) as { key?: string; error?: { message?: string } }
  if (!response.ok || !body.key) throw new Error(body.error?.message || 'OpenRouter could not be connected.')
  sessionStorage.setItem(KEY_STORAGE, body.key)
  sessionStorage.removeItem(VERIFIER_STORAGE)
  history.replaceState(null, '', window.location.pathname)
  return true
}

export async function generateWithOpenRouter({ topic, resource, count, difficulty }: GenerationInput): Promise<GeneratedSet> {
  const key = sessionStorage.getItem(KEY_STORAGE)
  if (!key) throw new Error('Connect your free OpenRouter quota first.')
  const schema = {
    type: 'object', additionalProperties: false,
    properties: {
      title: { type: 'string' }, subject: { type: 'string' }, description: { type: 'string' },
      cards: { type: 'array', minItems: count, maxItems: count, items: { type: 'object', additionalProperties: false, properties: { term: { type: 'string' }, definition: { type: 'string' }, note: { type: 'string' } }, required: ['term', 'definition', 'note'] } },
    },
    required: ['title', 'subject', 'description', 'cards'],
  }
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'HTTP-Referer': window.location.origin, 'X-Title': 'Open SourceED' },
    body: JSON.stringify({
      model: FREE_MODEL,
      messages: [
        { role: 'system', content: `Create accurate, retrieval-focused flashcards only from the supplied resource. Never invent unsupported facts. Produce exactly ${count} cards at ${difficulty} difficulty. Keep definitions concise and notes useful.` },
        { role: 'user', content: `Requested topic: ${topic}\n\nSOURCE MATERIAL:\n${resource}` },
      ],
      response_format: { type: 'json_schema', json_schema: { name: 'study_set', strict: true, schema } },
      provider: { require_parameters: true },
    }),
  })
  const body = await response.json().catch(() => ({})) as RouterResponse
  if (!response.ok) {
    if (response.status === 429) throw new Error('Your free OpenRouter quota or rate limit is used up. Try again after it resets.')
    if (response.status === 402) throw new Error('Free capacity is unavailable. Paid credits are disabled; try again later.')
    throw new Error(body.error?.message || 'Free OpenRouter generation failed.')
  }
  const content = body.choices?.[0]?.message?.content
  if (!content) throw new Error('The free model returned no study material.')
  return JSON.parse(content) as GeneratedSet
}
