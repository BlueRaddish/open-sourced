import { CompressionStream as NodeCompressionStream, DecompressionStream as NodeDecompressionStream } from 'node:stream/web'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { demoSet } from '../data/demo'
import { caDmvSet } from '../data/caDmv'
import { createShareUrl, decodeShareToken } from './share'

describe('zero-server share links', () => {
  beforeAll(() => {
    vi.stubGlobal('CompressionStream', NodeCompressionStream)
    vi.stubGlobal('DecompressionStream', NodeDecompressionStream)
  })

  afterAll(() => vi.unstubAllGlobals())

  it('round-trips a complete study set through a URL fragment', async () => {
    const url = await createShareUrl(demoSet)
    const token = url.split('#share=')[1]
    const decoded = await decodeShareToken(token)
    expect(decoded).toMatchObject({ title: demoSet.title, subject: demoSet.subject, description: demoSet.description, color: demoSet.color })
    expect(decoded.cards.map((card) => card.term)).toEqual(demoSet.cards.map((card) => card.term))
    expect(url.length).toBeLessThan(24_000)
  })

  it('rejects malformed tokens', async () => {
    await expect(decodeShareToken('r.not-valid-base64')).rejects.toThrow()
  })

  it('preserves the DMV mock-test configuration in a shareable link', async () => {
    const url = await createShareUrl(caDmvSet)
    const decoded = await decodeShareToken(url.split('#share=')[1])
    expect(decoded).toMatchObject({ testSize: 36 })
    expect(decoded.cards).toHaveLength(64)
    expect(decoded.cards[0]).toMatchObject({ category: 'Signals & signs', choices: caDmvSet.cards[0].choices })
    expect(url.length).toBeLessThan(24_000)
  })
})
