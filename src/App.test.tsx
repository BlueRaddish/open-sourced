import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { STORAGE_KEY } from './lib/storage'

describe('StudyForge app', () => {
  beforeEach(() => localStorage.removeItem(STORAGE_KEY))

  it('opens the starter set from the dashboard', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /cell biology essentials/i }))
    expect(screen.getByRole('heading', { name: 'Cell Biology Essentials' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /flashcards/i })).toBeInTheDocument()
  })

  it('opens the manual set editor', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /create a set/i }))
    expect(screen.getByRole('heading', { name: 'Create a study set' })).toBeInTheDocument()
    expect(screen.getAllByPlaceholderText('What should you recall?')).toHaveLength(2)
  })
})
