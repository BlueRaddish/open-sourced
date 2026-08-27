import { Download, Flame, RotateCcw, Target, Upload } from 'lucide-react'
import type { CardProgress, StudySet, StudyState, TestAttempt } from '../types'
import { activityStreak, mastery, setMastery } from '../lib/study'

type Props = { sets: StudySet[]; progress: Record<string, Record<string, CardProgress>>; attempts: TestAttempt[]; activityDates: string[]; backup: () => void; restore: (file: File) => void; reset: () => void; openSet: (id: string) => void }

export function ProgressView({ sets, progress, attempts, activityDates, backup, restore, reset, openSet }: Props) {
  const allCards = sets.flatMap((set) => set.cards.map((card) => ({ card, set })))
  const studied = allCards.filter(({ card, set }) => progress[set.id]?.[card.id]?.seen).length
  const mastered = allCards.filter(({ card, set }) => mastery(progress[set.id]?.[card.id]) >= 80).length
  const average = sets.length ? Math.round(sets.reduce((sum, set) => sum + setMastery(set, progress[set.id]), 0) / sets.length) : 0
  return <section className="page-width page-section">
    <div className="page-title"><div><span className="kicker">Your learning data</span><h1>Progress</h1><p>Mastery is calculated card by card from accuracy and repeated successful recall.</p></div><div className="button-row"><button className="secondary" onClick={backup}><Download size={17} /> Export backup</button><label className="secondary file-button"><Upload size={17} /> Restore<input type="file" accept="application/json,.json" onChange={(event) => event.target.files?.[0] && restore(event.target.files[0])} /></label></div></div>
    <div className="metric-grid"><article><Flame /><span>Current streak</span><strong>{activityStreak(activityDates)} days</strong></article><article><Target /><span>Overall mastery</span><strong>{average}%</strong></article><article><span className="metric-symbol">✓</span><span>Cards mastered</span><strong>{mastered} / {allCards.length}</strong></article><article><span className="metric-symbol">↗</span><span>Cards practiced</span><strong>{studied}</strong></article></div>
    <div className="progress-columns"><div><div className="section-heading"><div><span className="kicker">By study set</span><h2>Mastery map</h2></div></div><div className="mastery-list">{sets.map((set) => { const score = setMastery(set, progress[set.id]); return <button key={set.id} onClick={() => openSet(set.id)}><span className="set-dot" style={{ background: set.color }} /><div><b>{set.title}</b><span>{set.cards.length} cards</span><div className="progress-line"><i style={{ width: `${score}%`, background: set.color }} /></div></div><strong>{score}%</strong></button> })}</div></div>
      <div><div className="section-heading"><div><span className="kicker">Recent results</span><h2>Test history</h2></div></div><div className="attempt-list">{attempts.slice(0, 8).map((attempt) => { const set = sets.find((item) => item.id === attempt.setId); return <article key={attempt.id}><div><b>{set?.title || 'Deleted set'}</b><span>{new Date(attempt.date).toLocaleDateString()} · {Math.floor(attempt.durationSeconds / 60)}m {attempt.durationSeconds % 60}s</span></div><strong>{Math.round(attempt.score / attempt.total * 100)}%</strong></article> })}{!attempts.length && <div className="empty-compact">Complete a mock test to start your history.</div>}</div></div></div>
    <div className="data-panel"><div><h2>Your data, under your control</h2><p>Open SourcED stores the library and proficiency history locally in this browser. Export a backup before clearing browser data or moving devices.</p></div><button className="danger-outline" onClick={reset}><RotateCcw size={17} /> Reset all local data</button></div>
  </section>
}

export type { StudyState }
