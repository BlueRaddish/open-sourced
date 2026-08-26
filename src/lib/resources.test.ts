import { describe, expect, it } from 'vitest'
import { parseDelimited } from './resources'

describe('resource imports', () => {
  it('parses tab-separated flashcards', () => {
    const cards = parseDelimited('Term one\tDefinition one\tHelpful note\nTerm two\tDefinition two')
    expect(cards).toHaveLength(2)
    expect(cards[0]).toMatchObject({ term: 'Term one', definition: 'Definition one', note: 'Helpful note' })
  })

  it('ignores incomplete rows', () => {
    expect(parseDelimited('Only a term\nGood,Complete')).toHaveLength(1)
  })
})
