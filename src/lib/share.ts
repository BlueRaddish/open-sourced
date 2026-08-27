import type { StudySet } from '../types'
import { makeId } from './study'

type CompactSet = {
  v: 1
  t: string
  s: string
  d: string
  c: string
  q?: number
  cards: [string, string, string, string[]?, string?][]
}

const MAX_TOKEN_LENGTH = 24_000
const MAX_JSON_LENGTH = 180_000

function toBase64Url(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function fromBase64Url(value: string) {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/')
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

async function compress(bytes: Uint8Array) {
  if (typeof CompressionStream === 'undefined') return { prefix: 'r', bytes }
  const stream = new Response(bytes as BodyInit).body!.pipeThrough(new CompressionStream('gzip'))
  return { prefix: 'g', bytes: new Uint8Array(await new Response(stream).arrayBuffer()) }
}

async function decompress(prefix: string, bytes: Uint8Array) {
  if (prefix === 'r') return bytes
  if (prefix !== 'g' || typeof DecompressionStream === 'undefined') throw new Error('This browser cannot open that compressed share link.')
  const stream = new Response(bytes as BodyInit).body!.pipeThrough(new DecompressionStream('gzip'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

export async function createShareUrl(set: StudySet) {
  const compact: CompactSet = { v: 1, t: set.title, s: set.subject, d: set.description, c: set.color, q: set.testSize, cards: set.cards.map((card) => [card.term, card.definition, card.note, card.choices, card.category]) }
  const encoded = await compress(new TextEncoder().encode(JSON.stringify(compact)))
  const token = `${encoded.prefix}.${toBase64Url(encoded.bytes)}`
  if (token.length > MAX_TOKEN_LENGTH) throw new Error('This set is too large for a reliable share link. Export it as CSV instead.')
  return `${window.location.origin}${window.location.pathname}#share=${token}`
}

export async function decodeShareToken(token: string): Promise<StudySet> {
  if (!token || token.length > MAX_TOKEN_LENGTH) throw new Error('That share link is invalid or too large.')
  const [prefix, value] = token.split('.', 2)
  const json = new TextDecoder().decode(await decompress(prefix, fromBase64Url(value || '')))
  if (json.length > MAX_JSON_LENGTH) throw new Error('That shared set is too large to open safely.')
  const parsed = JSON.parse(json) as Partial<CompactSet>
  if (parsed.v !== 1 || typeof parsed.t !== 'string' || !Array.isArray(parsed.cards) || parsed.cards.length < 2 || parsed.cards.length > 100) throw new Error('That is not a valid Open SourceED share link.')
  const clean = (value: unknown, max: number) => typeof value === 'string' ? value.slice(0, max) : ''
  const cards = parsed.cards.map((card) => {
    const definition = clean(card?.[1], 3_000)
    const choices = Array.isArray(card?.[3]) ? [...new Set(card[3].map((choice) => clean(choice, 3_000)).filter(Boolean))].slice(0, 4) : undefined
    return { id: makeId(), term: clean(card?.[0], 1_000), definition, note: clean(card?.[2], 2_000), choices: choices?.length === 4 && choices.includes(definition) ? choices : undefined, category: clean(card?.[4], 100) || undefined }
  }).filter((card) => card.term && card.definition)
  if (cards.length < 2) throw new Error('That shared set does not contain enough valid cards.')
  const now = new Date().toISOString()
  const testSize = typeof parsed.q === 'number' && Number.isInteger(parsed.q) ? Math.min(100, Math.max(4, parsed.q)) : undefined
  return { id: makeId(), title: clean(parsed.t, 120), subject: clean(parsed.s, 80) || 'General', description: clean(parsed.d, 500), color: typeof parsed.c === 'string' && /^#[0-9a-f]{6}$/i.test(parsed.c) ? parsed.c : '#f26b4e', cards, testSize, sources: ['Shared link'], createdAt: now, updatedAt: now }
}
