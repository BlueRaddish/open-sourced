import { act, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CardProgress, StudyCard } from '../types'
import { demoSet } from '../data/demo'
import { recordAnswer } from '../lib/study'
import { LearnMode } from './LearnMode'

const shown = () => demoSet.cards.find((card) => card.definition === screen.getByRole('heading', { level: 1 }).textContent)!
const start = () => fireEvent.click(screen.getByRole('button', { name: 'Start round 1' }))
const settle = () => act(() => { vi.advanceTimersByTime(1000) })
const mastered = () => recordAnswer(recordAnswer(undefined, true), true)
const familiarOnly = (id: string) => { const progress = Object.fromEntries(demoSet.cards.map((card) => [card.id, mastered()])); progress[id] = recordAnswer(undefined, true); return progress }

function Harness() {
  const [progress, setProgress] = useState<Record<string, CardProgress>>({})
  const answer = (card: StudyCard, correct: boolean) => setProgress((current) => ({ ...current, [card.id]: recordAnswer(current[card.id], correct) }))
  return <LearnMode set={demoSet} progress={progress} back={vi.fn()} answer={answer} />
}

describe('learn mode', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('shows every card once per round even as progress updates after each answer', () => {
    render(<Harness />)
    start()
    const seen: string[] = []
    for (let i = 0; i < 7; i += 1) {
      const card = shown()
      seen.push(card.id)
      fireEvent.click(screen.getByText(card.term))
      settle()
    }
    expect(new Set(seen).size).toBe(7)
    expect(screen.getByText('Round 1 complete')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '7 of 7 on the first try' })).toBeInTheDocument()
  })

  it('re-asks a missed card later in the same round', () => {
    const answer = vi.fn()
    render(<LearnMode set={demoSet} progress={{}} back={vi.fn()} answer={answer} />)
    start()
    const missed = shown()
    fireEvent.click(screen.getByRole('button', { name: 'Don’t know' }))
    expect(answer).toHaveBeenLastCalledWith(missed, false)
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    for (let i = 0; i < 2; i += 1) {
      const card = shown()
      expect(card.id).not.toBe(missed.id)
      fireEvent.click(screen.getByText(card.term))
      settle()
    }
    expect(shown().id).toBe(missed.id)
    expect(screen.getByText('Round 1 · 4 of 8')).toBeInTheDocument()
    fireEvent.click(screen.getByText(missed.term))
    expect(answer).toHaveBeenLastCalledWith(missed, true)
  })

  it('asks familiar cards in writing and retypes the answer after a miss', () => {
    const answer = vi.fn()
    const nucleus = demoSet.cards[1]
    render(<LearnMode set={demoSet} progress={familiarOnly(nucleus.id)} back={vi.fn()} answer={answer} />)
    start()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(nucleus.definition)
    fireEvent.change(screen.getByLabelText('Your answer'), { target: { value: 'Ribosome' } })
    fireEvent.click(screen.getByRole('button', { name: 'Check' }))
    expect(answer).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Type the correct answer to continue'), { target: { value: 'nucleus' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(answer).toHaveBeenCalledWith(nucleus, false)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(nucleus.definition)
    expect(screen.getByText('Multiple choice')).toBeInTheDocument()
  })

  it('lets the learner override a written miss', () => {
    const answer = vi.fn()
    const nucleus = demoSet.cards[1]
    render(<LearnMode set={demoSet} progress={familiarOnly(nucleus.id)} back={vi.fn()} answer={answer} />)
    start()
    fireEvent.change(screen.getByLabelText('Your answer'), { target: { value: 'the nucleus' } })
    fireEvent.click(screen.getByRole('button', { name: 'Check' }))
    fireEvent.click(screen.getByRole('button', { name: 'Override: I was right' }))
    expect(answer).toHaveBeenCalledWith(nucleus, true)
    expect(screen.getByText('Round 1 complete')).toBeInTheDocument()
  })

  it('can answer with definitions instead of terms', () => {
    render(<LearnMode set={demoSet} progress={{}} back={vi.fn()} answer={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Definition' }))
    start()
    const card = demoSet.cards.find((item) => item.term === screen.getByRole('heading', { level: 1 }).textContent)!
    expect(screen.getByText(card.definition)).toBeInTheDocument()
  })
})
