export type View = 'home' | 'library' | 'create' | 'set' | 'cards' | 'learn' | 'write' | 'match' | 'test' | 'progress' | 'generate' | 'settings' | 'share'

export type ThemeMode = 'system' | 'light' | 'dark'
export type ColorPalette = 'poppy' | 'ocean' | 'violet' | 'forest'

export type Preferences = {
  theme: ThemeMode
  palette: ColorPalette
}

export type StudyCard = {
  id: string
  term: string
  definition: string
  note: string
  choices?: string[]
  category?: string
}

export type StudySet = {
  id: string
  title: string
  subject: string
  description: string
  color: string
  archived?: boolean
  cards: StudyCard[]
  testSize?: number
  sources: string[]
  createdAt: string
  updatedAt: string
}

export type CardProgress = {
  seen: number
  correct: number
  incorrect: number
  streak: number
  intervalDays: number
  dueAt: string
  lastSeenAt?: string
}

export type TestAttempt = {
  id: string
  setId: string
  date: string
  score: number
  total: number
  durationSeconds: number
}

export type StudyState = {
  version: 1
  seedVersion: number
  sets: StudySet[]
  progress: Record<string, Record<string, CardProgress>>
  attempts: TestAttempt[]
  activityDates: string[]
  preferences: Preferences
}

export type GeneratedSet = Pick<StudySet, 'title' | 'subject' | 'description' | 'cards'>
