import { beforeEach, describe, expect, it } from 'vitest'
import { defaultPreferences, loadState, STORAGE_KEY } from './storage'

describe('local storage migration', () => {
  beforeEach(() => localStorage.clear())

  it('adds default preferences and current built-in sets to older saved libraries', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, sets: [], progress: {}, attempts: [], activityDates: [] }))
    const state = loadState()
    expect(state.preferences).toEqual(defaultPreferences)
    expect(state.sets).toHaveLength(6)
    expect(state.sets[0]).toMatchObject({ id: 'builtin-ca-dmv-2025', testSize: 36 })
    expect(state.sets.filter((set) => set.subject === 'Japanese')).toHaveLength(5)
    expect(state.sets.filter((set) => set.subject === 'Japanese').flatMap((set) => set.cards)).toHaveLength(69)
  })

  it('loads the legacy StudyForge key without losing sets', () => {
    localStorage.setItem('studyforge.library.v1', JSON.stringify({ version: 1, sets: [{ id: 'mine' }], progress: {}, attempts: [], activityDates: [] }))
    const state = loadState()
    expect(state.sets[0]).toMatchObject({ id: 'mine' })
    expect(state.sets).toHaveLength(7)
    expect(state.preferences).toEqual(defaultPreferences)
  })

  it('does not restore the DMV set after a user deletes it', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, seedVersion: 1, sets: [], progress: {}, attempts: [], activityDates: [], preferences: defaultPreferences }))
    const state = loadState()
    expect(state.sets.some((set) => set.id === 'builtin-ca-dmv-2025')).toBe(false)
    expect(state.sets).toHaveLength(5)
  })

  it('does not restore Japanese samples after their seed migration has run', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, seedVersion: 2, sets: [], progress: {}, attempts: [], activityDates: [], preferences: defaultPreferences }))
    expect(loadState().sets).toEqual([])
  })
})
