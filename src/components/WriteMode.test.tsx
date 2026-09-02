import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { demoSet } from '../data/demo'
import { MatchMode } from './MatchMode'
import { WriteMode, writtenAnswerMatches } from './WriteMode'

describe('written recall', () => {
  it('normalizes casing, accents, punctuation, and slash alternatives', () => {
    expect(writtenAnswerMatches('Hello!', 'Hello / good afternoon')).toBe(true)
    expect(writtenAnswerMatches('café', 'Cafe')).toBe(true)
    expect(writtenAnswerMatches('almost right', 'the exact answer')).toBe(false)
  })

  it('checks a typed answer before recording the learner’s chosen grade', () => {
    const answer = vi.fn()
    render(<WriteMode set={demoSet} progress={{}} answer={answer} back={vi.fn()} />)
    fireEvent.change(screen.getByLabelText('Your answer'), { target: { value: demoSet.cards[0].definition } })
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    expect(screen.getByRole('heading', { name: 'That matches' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Count as correct' }))
    expect(answer).toHaveBeenCalledWith(demoSet.cards[0], true)
  })
})

describe('matching', () => {
  it('records a correct pair and marks both tiles complete', () => {
    const answer = vi.fn()
    render(<MatchMode set={demoSet} answer={answer} back={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cell membrane' }))
    fireEvent.click(screen.getByRole('button', { name: demoSet.cards[0].definition }))
    expect(answer).toHaveBeenCalledWith(demoSet.cards[0], true)
    expect(screen.getByRole('button', { name: 'Cell membrane' })).toBeDisabled()
  })
})
