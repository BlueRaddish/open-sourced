export type View = 'home' | 'library' | 'create' | 'set' | 'cards' | 'learn' | 'test' | 'progress' | 'generate'

export type StudyCard = {
  id: string
  term: string
  definition: string
  note: string
}

export type StudySet = {
  id: string
  title: string
  subject: string
  description: string
  color: string
  cards: StudyCard[]
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
  sets: StudySet[]
  progress: Record<string, Record<string, CardProgress>>
  attempts: TestAttempt[]
  activityDates: string[]
}

export type GeneratedSet = Pick<StudySet, 'title' | 'subject' | 'description' | 'cards'>
