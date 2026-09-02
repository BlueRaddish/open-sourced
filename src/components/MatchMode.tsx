import { ArrowLeft, Check, Clock3, Puzzle, RotateCcw, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { StudyCard, StudySet } from '../types'
import { shuffle } from '../lib/study'

type Props = { set: StudySet; back: () => void; answer: (card: StudyCard, correct: boolean) => void }

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

export function MatchMode({ set, back, answer }: Props) {
  const [round, setRound] = useState(0)
  const cards = useMemo(() => shuffle(set.cards).slice(0, Math.min(8, set.cards.length)), [set, round])
  const [termOrder, setTermOrder] = useState(() => shuffle(cards.map((card) => card.id)))
  const [definitionOrder, setDefinitionOrder] = useState(() => shuffle(cards.map((card) => card.id)))
  const [selectedTerm, setSelectedTerm] = useState<string | undefined>()
  const [selectedDefinition, setSelectedDefinition] = useState<string | undefined>()
  const [matched, setMatched] = useState<Set<string>>(() => new Set())
  const [mistakes, setMistakes] = useState(0)
  const [locked, setLocked] = useState(false)
  const [startedAt, setStartedAt] = useState(() => Date.now())
  const [elapsed, setElapsed] = useState(0)
  const complete = matched.size === cards.length

  useEffect(() => {
    setTermOrder(shuffle(cards.map((card) => card.id)))
    setDefinitionOrder(shuffle(cards.map((card) => card.id)))
    setSelectedTerm(undefined)
    setSelectedDefinition(undefined)
    setMatched(new Set())
    setMistakes(0)
    setLocked(false)
    setStartedAt(Date.now())
    setElapsed(0)
  }, [round, cards])

  useEffect(() => {
    if (complete) return
    const interval = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000)
    return () => window.clearInterval(interval)
  }, [complete, startedAt])

  const resolve = (termId: string | undefined, definitionId: string | undefined) => {
    if (!termId || !definitionId) return
    if (termId === definitionId) {
      const card = cards.find((candidate) => candidate.id === termId)
      if (card) answer(card, true)
      setMatched((current) => new Set([...current, termId]))
      setSelectedTerm(undefined)
      setSelectedDefinition(undefined)
      return
    }
    setMistakes((current) => current + 1)
    setLocked(true)
    window.setTimeout(() => { setSelectedTerm(undefined); setSelectedDefinition(undefined); setLocked(false) }, 650)
  }

  const chooseTerm = (id: string) => {
    if (locked || matched.has(id)) return
    setSelectedTerm(id)
    resolve(id, selectedDefinition)
  }
  const chooseDefinition = (id: string) => {
    if (locked || matched.has(id)) return
    setSelectedDefinition(id)
    resolve(selectedTerm, id)
  }

  const restart = () => setRound((current) => current + 1)
  const cardFor = (id: string) => cards.find((card) => card.id === id)!

  if (complete) return <section className="study-page page-width"><div className="completion"><span className="completion-icon"><Check /></span><span className="kicker">Round complete</span><h1>{formatTime(elapsed)}</h1><p>You matched {cards.length} pairs with {mistakes} {mistakes === 1 ? 'miss' : 'misses'}.</p><div className="button-row"><button className="primary" onClick={restart}><RotateCcw size={17} /> Another round</button><button className="secondary" onClick={back}>Back to set</button></div></div></section>

  return <section className="study-page page-width">
    <div className="study-top"><button className="back-button" onClick={back}><ArrowLeft size={18} /> Exit match</button><div><span>{matched.size} / {cards.length} pairs</span><span className="match-timer"><Clock3 size={15} /> {formatTime(elapsed)}</span></div></div>
    <div className="study-progress"><i style={{ width: `${(matched.size / cards.length) * 100}%` }} /></div>
    <div className="page-title compact match-heading"><div><span className="kicker"><Puzzle size={14} /> Timed recall round</span><h1>Match the pairs</h1><p>Select a term and its definition. Each round uses up to eight pairs so large sets stay quick and legible.</p></div><button className="secondary" onClick={restart}><RotateCcw size={17} /> Restart</button></div>
    <div className="match-board"><section aria-label="Terms"><h2>Terms</h2>{termOrder.map((id) => <button key={id} className={`${selectedTerm === id ? 'selected' : ''} ${matched.has(id) ? 'matched' : ''}`} disabled={matched.has(id) || locked} onClick={() => chooseTerm(id)}>{cardFor(id).term}{matched.has(id) && <Check size={17} />}</button>)}</section><section aria-label="Definitions"><h2>Definitions</h2>{definitionOrder.map((id) => <button key={id} className={`${selectedDefinition === id ? 'selected' : ''} ${matched.has(id) ? 'matched' : ''}`} disabled={matched.has(id) || locked} onClick={() => chooseDefinition(id)}>{cardFor(id).definition}{matched.has(id) && <Check size={17} />}</button>)}</section></div>
    <p className="keyboard-hint">{locked ? <><X size={15} /> Not that pair—try again.</> : <><Puzzle size={15} /> Matching strengthens fast recognition; Learn and Write still schedule your deeper recall.</>}</p>
  </section>
}
