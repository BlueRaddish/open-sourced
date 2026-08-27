import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { STORAGE_KEY } from './lib/storage'

describe('Open SourceED app', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.clear()
    history.replaceState(null, '', '/open-source-ed/')
  })

  afterEach(() => vi.unstubAllGlobals())

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

  it('provides multiple Japanese sample sets and explains local storage', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Library' }))
    expect(screen.getByRole('button', { name: /active 7/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /japanese hiragana: first 15/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /japanese katakana: first 15/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /japanese greetings & polite phrases/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /japanese n5 core vocabulary/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /japanese beginner grammar patterns/i })).toBeInTheDocument()
    expect(screen.getByText(/local storage—not github or cloud sync/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /backup & storage/i }))
    expect(screen.getByRole('heading', { name: 'Local to this browser' })).toBeInTheDocument()
  })

  it('opens the manual set editor', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /create a set/i }))
    expect(screen.getByRole('heading', { name: 'Create a study set' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate with ai/i })).toBeInTheDocument()
    expect(screen.getAllByPlaceholderText('What should you recall?')).toHaveLength(2)
  })

  it('archives and restores a set without deleting it', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /cell biology essentials/i }))
    fireEvent.click(screen.getByRole('button', { name: /more set actions/i }))
    fireEvent.click(screen.getByRole('button', { name: /archive set/i }))
    expect(screen.getByRole('button', { name: /active 6/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /archived 1/i }))
    fireEvent.click(screen.getByRole('button', { name: /cell biology essentials/i }))
    expect(screen.getByText(/archived$/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /more set actions/i }))
    fireEvent.click(screen.getByRole('button', { name: /restore to library/i }))
    expect(screen.getByRole('button', { name: /active 7/i })).toBeInTheDocument()
    await waitFor(() => expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}').sets.find((set: { id: string }) => set.id === 'demo-cell-biology').archived).toBe(false))
  })

  it('reviews an AI draft in Create before saving it', async () => {
    sessionStorage.setItem('open-source-ed.openrouter.session-key', 'visitor-key')
    const generated = { title: 'Photosynthesis Review', subject: 'Biology', description: 'An editable AI draft.', cards: [{ term: 'Light reactions', definition: 'They convert light energy into chemical energy.', note: 'Occurs in thylakoid membranes.' }, { term: 'Calvin cycle', definition: 'It uses chemical energy to fix carbon dioxide.', note: 'Occurs in the stroma.' }] }
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => String(input).includes('/api/health')
      ? new Response(JSON.stringify({ configured: false }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      : new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(generated) } }] }), { status: 200, headers: { 'Content-Type': 'application/json' } })))
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /create a set/i }))
    fireEvent.click(screen.getByRole('button', { name: /generate with ai/i }))
    fireEvent.change(screen.getByLabelText(/what are you studying/i), { target: { value: 'Photosynthesis' } })
    fireEvent.change(screen.getByLabelText(/paste source material/i), { target: { value: 'Photosynthesis captures light energy in chloroplasts. The light reactions produce ATP and NADPH. The Calvin cycle uses those molecules to fix carbon dioxide into organic compounds.'.repeat(2) } })
    fireEvent.click(screen.getByRole('button', { name: /generate editable cards/i }))
    expect(await screen.findByRole('heading', { name: 'Review generated study set' })).toBeInTheDocument()
    expect(screen.getByText(/not in your library until you press save set/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('Photosynthesis Review')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}').sets).toHaveLength(7)
    fireEvent.click(screen.getByRole('button', { name: 'Save set' }))
    expect(await screen.findByRole('heading', { name: 'Photosynthesis Review' })).toBeInTheDocument()
    await waitFor(() => expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}').sets).toHaveLength(8))
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
