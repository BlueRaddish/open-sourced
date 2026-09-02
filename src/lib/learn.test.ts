import { describe, expect, it } from 'vitest'
import { buildRound, defaultSide, questionKind, requeue, stageCounts, stageOf } from './learn'
import { recordAnswer } from './study'
import { demoSet } from '../data/demo'
import { caDmvSet } from '../data/caDmv'

const byTerm = { side: 'term', types: 'adaptive' } as const
const day = (offset: number) => new Date(Date.UTC(2026, 0, 1 + offset, 12))

describe('learn rounds', () => {
  it('derives the stage from the answer streak', () => {
    expect(stageOf(undefined)).toBe(0)
    const once = recordAnswer(undefined, true)
    expect(stageOf(once)).toBe(1)
    expect(stageOf(recordAnswer(once, true))).toBe(2)
    expect(stageOf(recordAnswer(once, false))).toBe(0)
  })

  it('asks multiple choice first, then written for short answers only', () => {
    const card = demoSet.cards[0]
    expect(questionKind(card, 0, byTerm)).toBe('choice')
    expect(questionKind(card, 1, byTerm)).toBe('written')
    expect(questionKind(card, 1, { side: 'definition', types: 'adaptive' })).toBe('choice')
    expect(questionKind(card, 0, { side: 'term', types: 'written' })).toBe('written')
  })

  it('answers with the shorter side unless the set has curated choices', () => {
    expect(defaultSide(demoSet)).toBe('term')
    expect(defaultSide(caDmvSet)).toBe('definition')
  })

  it('caps a round and puts familiar cards before new ones', () => {
    const progress = { [demoSet.cards[3].id]: recordAnswer(undefined, true) }
    const round = buildRound(demoSet, progress, byTerm, 3)
    expect(round).toHaveLength(3)
    expect(round[0]).toEqual({ card: demoSet.cards[3], kind: 'written' })
    expect(round.slice(1).map((question) => question.card.id)).toEqual(['cell-1', 'cell-2'])
  })

  it('leaves mastered cards out until their review is due, then reviews them first', () => {
    const mastered = recordAnswer(recordAnswer(undefined, true, day(0)), true, day(0))
    const progress = { [demoSet.cards[5].id]: mastered }
    expect(buildRound(demoSet, progress, byTerm, 99, day(1)).map((question) => question.card.id)).not.toContain('cell-6')
    expect(buildRound(demoSet, progress, byTerm, 99, day(9))[0].card.id).toBe('cell-6')
  })

  it('brings a missed question back a few questions later as multiple choice', () => {
    const round = buildRound(demoSet, {}, byTerm, 5)
    const early = requeue(round, 0, byTerm)
    expect(early).toHaveLength(6)
    expect(early[3]).toEqual({ card: round[0].card, kind: 'choice' })
    expect(requeue(round, 4, byTerm)[5].card).toBe(round[4].card)
  })

  it('counts cards by stage', () => {
    const progress = { 'cell-1': recordAnswer(undefined, true), 'cell-2': recordAnswer(recordAnswer(undefined, true), true) }
    expect(stageCounts(demoSet, progress)).toEqual({ learning: 6, familiar: 1, mastered: 1 })
  })
})
