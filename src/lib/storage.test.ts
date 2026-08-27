import { beforeEach, describe, expect, it } from 'vitest'
import { defaultPreferences, loadState, STORAGE_KEY } from './storage'

describe('local storage migration', () => {
  beforeEach(() => localStorage.clear())

  it('adds default preferences to older saved libraries', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, sets: [], progress: {}, attempts: [], activityDates: [] }))
    expect(loadState().preferences).toEqual(defaultPreferences)
  })

  it('loads the legacy StudyForge key without losing sets', () => {
    localStorage.setItem('studyforge.library.v1', JSON.stringify({ version: 1, sets: [], progress: {}, attempts: [], activityDates: [] }))
    expect(loadState()).toMatchObject({ sets: [], preferences: defaultPreferences })
  })
})
