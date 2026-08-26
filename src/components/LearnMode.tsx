import { ArrowLeft, Check, RotateCcw, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { CardProgress, StudyCard, StudySet } from '../types'
import { dueCards } from '../lib/study'

type Props = { set: StudySet; progress: Record<string, CardProgress>; back: () => void; answer: (card: StudyCard, correct: boolean) => void }

export function LearnMode({ set, progress, back, answer }: Props) {
  const queue = useMemo(() => dueCards(set, progress), [set, progress])
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const card = queue[index]
  const choose = (correct: boolean) => { answer(card, correct); setRevealed(false); setIndex((current) => current + 1) }
  if (!card) return <section className="study-page page-width"><div className="completion"><span className="completion-icon"><Check /></span><h1>Session complete</h1><p>You reviewed all {queue.length} cards. Every answer updated your personal practice schedule.</p><button className="primary" onClick={back}>Back to set</button></div></section>
  return <section className="study-page page-width">
    <div className="study-top"><button className="back-button" onClick={back}><ArrowLeft size={18} /> Exit learn</button><span>{index + 1} of {queue.length}</span></div>
    <div className="study-progress"><i style={{ width: `${(index / queue.length) * 100}%` }} /></div>
    <div className="learn-card"><span className="kicker">Retrieve before you reveal</span><h1>{card.term}</h1>{!revealed ? <button className="primary" onClick={() => setRevealed(true)}>Show answer</button> : <div className="answer-reveal"><p>{card.definition}</p>{card.note && <small>{card.note}</small>}<div className="confidence"><button className="again" onClick={() => choose(false)}><X /> I missed it</button><button className="got-it" onClick={() => choose(true)}><Check /> I knew it</button></div></div>}</div>
    <p className="keyboard-hint"><RotateCcw size={15} /> Missed cards become due immediately; correct cards gain a longer interval.</p>
  </section>
}
