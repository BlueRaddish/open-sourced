import type { CardProgress, StudyCard, StudySet } from '../types'
import { type AnswerSide, answerText } from './study'

export type LearnStage = 0 | 1 | 2
export type QuestionKind = 'choice' | 'written'
export type QuestionTypes = 'adaptive' | 'choice' | 'written'
export type LearnOptions = { side: AnswerSide; types: QuestionTypes }
export type LearnQuestion = { card: StudyCard; kind: QuestionKind }

export const ROUND_SIZE = 7
export const STAGE_LABELS = ['Still learning', 'Familiar', 'Mastered'] as const
/** Longer answers never pass an exact typed check, so they stay multiple choice and skip the retype step. */
export const WRITTEN_MAX_LENGTH = 60
const REQUEUE_GAP = 2

/**
 * Stage is read from the shared progress record, so Learn, Write, Match and Mock Test all feed one schedule:
 * one correct answer in a row makes a card familiar, two make it mastered, and a miss sends it back to the start.
 */
export const stageOf = (progress?: CardProgress): LearnStage => Math.min(progress?.streak ?? 0, 2) as LearnStage

export const isDue = (progress: CardProgress | undefined, now = new Date()) => !progress || new Date(progress.dueAt) <= now

export const shortAnswer = (card: StudyCard, side: AnswerSide) => answerText(card, side).length <= WRITTEN_MAX_LENGTH

/** Sets with curated choices are answered with the definition; otherwise answer with whichever side is shorter to type. */
export function defaultSide(set: StudySet): AnswerSide {
  if (set.cards.some((card) => card.choices?.length)) return 'definition'
  const total = (side: AnswerSide) => set.cards.reduce((sum, card) => sum + answerText(card, side).length, 0)
  return total('term') < total('definition') ? 'term' : 'definition'
}

export function questionKind(card: StudyCard, stage: LearnStage, options: LearnOptions): QuestionKind {
  if (options.types !== 'adaptive') return options.types
  return stage > 0 && shortAnswer(card, options.side) ? 'written' : 'choice'
}

export function stageCounts(set: StudySet, progress: Record<string, CardProgress>) {
  const counts = [0, 0, 0]
  set.cards.forEach((card) => { counts[stageOf(progress[card.id])] += 1 })
  return { learning: counts[0], familiar: counts[1], mastered: counts[2] }
}

/** One round: mastered cards only when their review is due, then familiar cards, then new material in set order. */
export function buildRound(set: StudySet, progress: Record<string, CardProgress>, options: LearnOptions, size = ROUND_SIZE, now = new Date()): LearnQuestion[] {
  return set.cards
    .map((card, order) => ({ card, order, stage: stageOf(progress[card.id]), due: isDue(progress[card.id], now) }))
    .filter((entry) => entry.stage < 2 || entry.due)
    .sort((a, b) => b.stage - a.stage || a.order - b.order)
    .slice(0, size)
    .map(({ card, stage }) => ({ card, kind: questionKind(card, stage, options) }))
}

/** A missed question comes back a couple of questions later, from the easiest type, until it is answered correctly. */
export function requeue(queue: LearnQuestion[], index: number, options: LearnOptions): LearnQuestion[] {
  const at = Math.min(index + 1 + REQUEUE_GAP, queue.length)
  const again: LearnQuestion = { card: queue[index].card, kind: questionKind(queue[index].card, 0, options) }
  return [...queue.slice(0, at), again, ...queue.slice(at)]
}

export function nextDue(set: StudySet, progress: Record<string, CardProgress>) {
  const dates = set.cards.map((card) => progress[card.id]?.dueAt).filter((date): date is string => Boolean(date)).sort()
  return dates.length ? new Date(dates[0]) : undefined
}
