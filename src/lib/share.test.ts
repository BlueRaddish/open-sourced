import { describe, expect, it } from 'vitest'
import { demoSet } from '../data/demo'
import { createShareUrl, decodeShareToken } from './share'

describe('zero-server share links', () => {
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
})
