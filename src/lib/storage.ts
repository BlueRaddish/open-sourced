import { demoSet } from '../data/demo'
import type { StudyState } from '../types'

export const STORAGE_KEY = 'studyforge.library.v1'

export const initialState = (): StudyState => ({ version: 1, sets: [demoSet], progress: {}, attempts: [], activityDates: [] })

export function loadState(): StudyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState()
    const parsed = JSON.parse(raw) as StudyState
    if (parsed.version !== 1 || !Array.isArray(parsed.sets)) return initialState()
    return parsed
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
  anchor.download = `studyforge-backup-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function readBackup(file: File): Promise<StudyState> {
  const parsed = JSON.parse(await file.text()) as StudyState
  if (parsed.version !== 1 || !Array.isArray(parsed.sets) || typeof parsed.progress !== 'object') throw new Error('That is not a valid StudyForge backup.')
  return parsed
}
