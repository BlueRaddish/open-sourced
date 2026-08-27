import { beforeEach, describe, expect, it } from 'vitest'
import { defaultPreferences, loadState, STORAGE_KEY } from './storage'

describe('local storage migration', () => {
  beforeEach(() => localStorage.clear())

  it('adds default preferences and the DMV set to older saved libraries', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, sets: [], progress: {}, attempts: [], activityDates: [] }))
    const state = loadState()
    expect(state.preferences).toEqual(defaultPreferences)
    expect(state.sets).toHaveLength(1)
    expect(state.sets[0]).toMatchObject({ id: 'builtin-ca-dmv-2025', testSize: 36 })
  })

  it('loads the legacy StudyForge key without losing sets', () => {
    localStorage.setItem('studyforge.library.v1', JSON.stringify({ version: 1, sets: [{ id: 'mine' }], progress: {}, attempts: [], activityDates: [] }))
    expect(loadState()).toMatchObject({ sets: [{ id: 'mine' }, { id: 'builtin-ca-dmv-2025' }], preferences: defaultPreferences })
  })

  it('does not restore the DMV set after a user deletes it', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, seedVersion: 1, sets: [], progress: {}, attempts: [], activityDates: [], preferences: defaultPreferences }))
    expect(loadState().sets).toEqual([])
  })
})
