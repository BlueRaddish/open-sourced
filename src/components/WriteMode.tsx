import { ArrowLeft, Check, PenLine, RotateCcw, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import type { CardProgress, StudyCard, StudySet } from '../types'
import { dueCards } from '../lib/study'

type Props = { set: StudySet; progress: Record<string, CardProgress>; back: () => void; answer: (card: StudyCard, correct: boolean) => void }

function normalizeAnswer(value: string) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim()
}

export function writtenAnswerMatches(answer: string, definition: string) {
  const typed = normalizeAnswer(answer)
  if (!typed) return false
  return definition.split(/\s*(?:\/|;|\||\bor\b)\s*/iu).some((option) => normalizeAnswer(option) === typed)
}

export function WriteMode({ set, progress, back, answer }: Props) {
  // Snapshot the queue once: rebuilding it from live progress after each answer reorders the cards mid-session.
  const [queue] = useState(() => dueCards(set, progress))
  const [index, setIndex] = useState(0)
  const [value, setValue] = useState('')
  const [checked, setChecked] = useState(false)
  const card = queue[index]
  const matches = card ? writtenAnswerMatches(value, card.definition) : false

  const check = (event: FormEvent) => {
    event.preventDefault()
    if (value.trim()) setChecked(true)
  }
  const grade = (correct: boolean) => {
    if (!card) return
    answer(card, correct)
    setValue('')
    setChecked(false)
    setIndex((current) => current + 1)
  }

  if (!card) return <section className="study-page page-width"><div className="completion"><span className="completion-icon"><Check /></span><h1>Writing session complete</h1><p>You typed answers for all {queue.length} cards. Those results now shape your next review.</p><button className="primary" onClick={back}>Back to set</button></div></section>

  return <section className="study-page page-width">
    <div className="study-top"><button className="back-button" onClick={back}><ArrowLeft size={18} /> Exit write</button><span>{index + 1} of {queue.length}</span></div>
    <div className="study-progress"><i style={{ width: `${(index / queue.length) * 100}%` }} /></div>
    <div className="learn-card write-card"><span className="kicker"><PenLine size={14} /> Type from memory</span><h1>{card.term}</h1>{!checked ? <form className="write-form" onSubmit={check}><label htmlFor="written-answer">Your answer</label><textarea id="written-answer" autoFocus rows={4} value={value} onChange={(event) => setValue(event.target.value)} placeholder="Type what you remember…" /><button className="primary" disabled={!value.trim()}>Check answer</button></form> : <div className={`written-feedback ${matches ? 'correct' : 'incorrect'}`}><span>{matches ? <Check /> : <X />}</span><h2>{matches ? 'That matches' : 'Compare your answer'}</h2><p>{card.definition}</p>{card.note && <small>{card.note}</small>}<div className="confidence"><button className="again" onClick={() => grade(false)}><X /> Count as missed</button><button className="got-it" onClick={() => grade(true)}><Check /> {matches ? 'Count as correct' : 'Count as correct anyway'}</button></div></div>}</div>
    <p className="keyboard-hint"><RotateCcw size={15} /> Exact matches are checked automatically; you keep the final say when wording can vary.</p>
  </section>
}
