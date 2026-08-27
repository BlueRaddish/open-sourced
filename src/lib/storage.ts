import { demoSet } from '../data/demo'
import { caDmvSet } from '../data/caDmv'
import { japaneseSets } from '../data/japanese'
import type { Preferences, StudyState } from '../types'

export const STORAGE_KEY = 'open-source-ed.library.v1'
const LEGACY_STORAGE_KEY = 'studyforge.library.v1'

export const defaultPreferences: Preferences = { theme: 'system', palette: 'poppy' }
const CURRENT_SEED_VERSION = 2

export const initialState = (): StudyState => ({ version: 1, seedVersion: CURRENT_SEED_VERSION, sets: [demoSet, caDmvSet, ...japaneseSets], progress: {}, attempts: [], activityDates: [], preferences: defaultPreferences })

function normalizeState(parsed: StudyState): StudyState {
  const seedVersion = parsed.seedVersion ?? 0
  const sets = [...parsed.sets]
  if (seedVersion < 1 && !sets.some((set) => set.id === caDmvSet.id)) sets.push(caDmvSet)
  if (seedVersion < 2) japaneseSets.forEach((sample) => { if (!sets.some((set) => set.id === sample.id)) sets.push(sample) })
  return { ...parsed, sets, seedVersion: CURRENT_SEED_VERSION, preferences: parsed.preferences ?? defaultPreferences }
}

export function loadState(): StudyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return initialState()
    const parsed = JSON.parse(raw) as StudyState
    if (parsed.version !== 1 || !Array.isArray(parsed.sets)) return initialState()
    return normalizeState(parsed)
  } catch {
    return initialState()
  }
}

export function saveState(state: StudyState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function downloadBackup(state: StudyState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `open-sourced-backup-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function readBackup(file: File): Promise<StudyState> {
  const parsed = JSON.parse(await file.text()) as StudyState
  if (parsed.version !== 1 || !Array.isArray(parsed.sets) || typeof parsed.progress !== 'object') throw new Error('That is not a valid Open SourcED backup.')
  return normalizeState(parsed)
}
