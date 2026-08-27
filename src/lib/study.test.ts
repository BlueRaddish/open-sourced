import { describe, expect, it } from 'vitest'
import { activityStreak, choicesFor, mastery, recordAnswer, setMastery } from './study'
import { demoSet } from '../data/demo'
import { caDmvSet } from '../data/caDmv'

describe('study engine', () => {
  it('raises mastery with repeated correct retrieval', () => {
    let progress = recordAnswer(undefined, true, new Date('2026-01-01T12:00:00Z'))
    progress = recordAnswer(progress, true, new Date('2026-01-02T12:00:00Z'))
    expect(mastery(progress)).toBeGreaterThan(70)
    expect(progress.streak).toBe(2)
    expect(progress.intervalDays).toBeGreaterThan(1)
  })

  it('resets the interval after a missed answer', () => {
    const known = recordAnswer(recordAnswer(undefined, true), true)
    const missed = recordAnswer(known, false)
    expect(missed.streak).toBe(0)
    expect(missed.intervalDays).toBe(0)
    expect(missed.incorrect).toBe(1)
  })

  it('creates unique multiple-choice options', () => {
    const options = choicesFor(demoSet.cards[0], demoSet.cards)
    expect(options).toHaveLength(4)
    expect(new Set(options).size).toBe(4)
    expect(options).toContain(demoSet.cards[0].definition)
  })

  it('preserves curated choices for specialized sets', () => {
    const card = caDmvSet.cards[0]
    expect(choicesFor(card, caDmvSet.cards)).toEqual(expect.arrayContaining(card.choices!))
    expect(choicesFor(card, caDmvSet.cards)).toHaveLength(4)
  })

  it('averages mastery across every card in a set', () => {
    const progress = { [demoSet.cards[0].id]: recordAnswer(undefined, true) }
    expect(setMastery(demoSet, progress)).toBeGreaterThan(0)
    expect(setMastery(demoSet, progress)).toBeLessThan(mastery(progress[demoSet.cards[0].id]))
  })

  it('counts a consecutive activity streak', () => {
    const today = new Date()
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
    expect(activityStreak([today.toISOString().slice(0, 10), yesterday.toISOString().slice(0, 10)])).toBe(2)
  })
})
