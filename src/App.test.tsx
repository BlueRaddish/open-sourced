import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { STORAGE_KEY } from './lib/storage'

describe('Open SourceED app', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.clear()
    history.replaceState(null, '', '/open-source-ed/')
  })

  it('opens the starter set from the dashboard', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /cell biology essentials/i }))
    expect(screen.getByRole('heading', { name: 'Cell Biology Essentials' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /flashcards/i })).toBeInTheDocument()
  })

  it('includes the complete California DMV study set', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /california driver knowledge test/i }))
    expect(screen.getByRole('heading', { name: 'California Driver Knowledge Test' })).toBeInTheDocument()
    expect(screen.getByText(/64 cards · Updated/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Proficiency by category' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /mock test/i }))
    expect(screen.getByText('0 / 36 answered')).toBeInTheDocument()
  })

  it('opens the manual set editor', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /create a set/i }))
    expect(screen.getByRole('heading', { name: 'Create a study set' })).toBeInTheDocument()
    expect(screen.getAllByPlaceholderText('What should you recall?')).toHaveLength(2)
  })

  it('changes and persists appearance settings', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /settings/i }))
    fireEvent.click(screen.getByRole('button', { name: /dark/i }))
    fireEvent.click(screen.getByRole('button', { name: /violet/i }))
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(document.documentElement).toHaveAttribute('data-palette', 'violet')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}').preferences).toEqual({ theme: 'dark', palette: 'violet' })
  })

  it('requires a visitor-owned free quota before browser generation', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))
    expect(screen.getByRole('button', { name: /connect openrouter/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate editable cards/i })).toBeDisabled()
  })
})
