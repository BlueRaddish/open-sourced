import type { CardProgress, StudyCard, StudySet } from '../types'

export type AnswerSide = 'term' | 'definition'

export const makeId = () => crypto.randomUUID()
export const todayKey = () => new Date().toISOString().slice(0, 10)
export const answerText = (card: StudyCard, side: AnswerSide) => side === 'term' ? card.term : card.definition
export const promptText = (card: StudyCard, side: AnswerSide) => side === 'term' ? card.definition : card.term

export function blankProgress(): CardProgress {
  return { seen: 0, correct: 0, incorrect: 0, streak: 0, intervalDays: 0, dueAt: new Date(0).toISOString() }
}

export function mastery(progress?: CardProgress) {
  if (!progress?.seen) return 0
  const accuracy = progress.correct / progress.seen
  const repetition = Math.min(progress.correct / 4, 1)
  return Math.round((accuracy * 0.7 + repetition * 0.3) * 100)
}

export function setMastery(set: StudySet, progress: Record<string, CardProgress> = {}) {
  if (!set.cards.length) return 0
  return Math.round(set.cards.reduce((sum, card) => sum + mastery(progress[card.id]), 0) / set.cards.length)
}

export function recordAnswer(current: CardProgress | undefined, correct: boolean, now = new Date()): CardProgress {
  const base = current ?? blankProgress()
  const streak = correct ? base.streak + 1 : 0
  const intervalDays = correct ? Math.max(1, Math.round((base.intervalDays || 0.5) * (streak > 2 ? 2 : 1.55))) : 0
  const due = new Date(now)
  due.setDate(due.getDate() + intervalDays)
  return {
    seen: base.seen + 1,
    correct: base.correct + (correct ? 1 : 0),
    incorrect: base.incorrect + (correct ? 0 : 1),
    streak,
    intervalDays,
    dueAt: due.toISOString(),
    lastSeenAt: now.toISOString(),
  }
}

export function dueCards(set: StudySet, progress: Record<string, CardProgress> = {}, now = new Date()) {
  return [...set.cards].sort((a, b) => {
    const pa = progress[a.id]
    const pb = progress[b.id]
    const dueA = !pa || new Date(pa.dueAt) <= now
    const dueB = !pb || new Date(pb.dueAt) <= now
    if (dueA !== dueB) return dueA ? -1 : 1
    return mastery(pa) - mastery(pb)
  })
}

export function shuffle<T>(items: T[]) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function choicesFor(card: StudyCard, cards: StudyCard[], side: AnswerSide = 'definition') {
  if (side === 'definition' && card.choices?.length === 4 && card.choices.includes(card.definition)) return shuffle([...card.choices])
  const distractors = shuffle(cards.filter((candidate) => candidate.id !== card.id)).slice(0, 3).map((candidate) => answerText(candidate, side))
  return shuffle([answerText(card, side), ...distractors])
}

export function activityStreak(dates: string[]) {
  const unique = new Set(dates)
  const cursor = new Date()
  if (!unique.has(todayKey())) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (unique.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
