import { ArrowLeft, Check, PenLine, RotateCcw, Sparkles, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import type { CardProgress, StudyCard, StudySet } from '../types'
import { type AnswerSide, answerText, choicesFor, promptText } from '../lib/study'
import { type LearnOptions, type LearnQuestion, type QuestionTypes, ROUND_SIZE, STAGE_LABELS, buildRound, defaultSide, nextDue, requeue, shortAnswer, stageCounts, stageOf } from '../lib/learn'
import { writtenAnswerMatches } from './WriteMode'

type Props = { set: StudySet; progress: Record<string, CardProgress>; back: () => void; answer: (card: StudyCard, correct: boolean) => void }
type Phase = 'setup' | 'round' | 'summary' | 'done'
type Result = { correct: boolean; picked?: string }
type Outcome = { card: StudyCard; correct: boolean }

const ADVANCE_DELAY = 700
const STAGE_CLASS = ['learning', 'familiar', 'mastered'] as const
const SIDES: [AnswerSide, string][] = [['term', 'Term'], ['definition', 'Definition']]
const TYPES: [QuestionTypes, string][] = [['adaptive', 'Adaptive'], ['choice', 'Multiple choice'], ['written', 'Written']]

function StagePill({ progress }: { progress?: CardProgress }) {
  const stage = stageOf(progress)
  return <span className={`stage-pill ${STAGE_CLASS[stage]}`}>{STAGE_LABELS[stage]}</span>
}

function StageTiles({ set, progress }: Pick<Props, 'set' | 'progress'>) {
  const counts = stageCounts(set, progress)
  return <div className="learn-stages"><article className="learning"><strong>{counts.learning}</strong><span>Still learning</span></article><article className="familiar"><strong>{counts.familiar}</strong><span>Familiar</span></article><article className="mastered"><strong>{counts.mastered}</strong><span>Mastered</span></article></div>
}

export function LearnMode({ set, progress, back, answer }: Props) {
  const [options, setOptions] = useState<LearnOptions>(() => ({ side: defaultSide(set), types: 'adaptive' }))
  const [phase, setPhase] = useState<Phase>('setup')
  const [round, setRound] = useState(0)
  // The queue is fixed when a round starts; live progress only decides what the next round holds.
  const [queue, setQueue] = useState<LearnQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [outcomes, setOutcomes] = useState<Outcome[]>([])
  const [typed, setTyped] = useState('')
  const [retyped, setRetyped] = useState('')
  const [result, setResult] = useState<Result | undefined>()
  const question = queue[index]
  const expected = question ? answerText(question.card, options.side) : ''
  const choices = useMemo(() => question?.kind === 'choice' ? choicesFor(question.card, set.cards, options.side) : [], [question, set.cards, options.side])
  const pending = useMemo(() => buildRound(set, progress, options, set.cards.length).length, [set, progress, options])
  const retypeDone = !question || !shortAnswer(question.card, options.side) || writtenAnswerMatches(retyped, expected)

  const startRound = () => {
    const next = buildRound(set, progress, options)
    if (!next.length) { setPhase('done'); return }
    setQueue(next); setIndex(0); setOutcomes([]); setResult(undefined); setTyped(''); setRetyped('')
    setRound((current) => current + 1)
    setPhase('round')
  }
  // Records the verdict for this attempt; a miss re-enters the round, and the returned queue is the one to advance through.
  const finish = (correct: boolean) => {
    if (!question) return queue
    answer(question.card, correct)
    setOutcomes((current) => current.some((item) => item.card.id === question.card.id) ? current : [...current, { card: question.card, correct }])
    const next = correct ? queue : requeue(queue, index, options)
    setQueue(next)
    return next
  }
  const advance = useCallback((next = queue) => {
    setResult(undefined); setTyped(''); setRetyped('')
    if (index + 1 >= next.length) setPhase('summary'); else setIndex(index + 1)
  }, [index, queue])
  const pick = (choice: string) => { const correct = choice === expected; setResult({ correct, picked: choice }); finish(correct) }
  const giveUp = () => { setResult({ correct: false }); if (question?.kind === 'choice') finish(false) }
  const check = (event: FormEvent) => { event.preventDefault(); if (!typed.trim()) return; const correct = writtenAnswerMatches(typed, expected); setResult({ correct }); if (correct) finish(true) }
  const acceptMiss = (event: FormEvent) => { event.preventDefault(); if (retypeDone) advance(finish(false)) }
  const override = () => { finish(true); advance() }

  useEffect(() => {
    if (!result?.correct) return
    const timer = window.setTimeout(() => advance(), ADVANCE_DELAY)
    return () => window.clearTimeout(timer)
  }, [result, advance])
  useEffect(() => {
    if (phase !== 'round') return
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLButtonElement) return
      if (!result && question?.kind === 'choice' && choices[Number(event.key) - 1]) pick(choices[Number(event.key) - 1])
      else if (result && event.key === 'Enter' && (result.correct || question?.kind === 'choice')) advance()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (phase === 'done' || (phase === 'setup' && !pending)) {
    const due = nextDue(set, progress)
    return <section className="study-page page-width"><div className="completion learn-summary"><span className="completion-icon"><Check /></span><span className="kicker">{set.cards.length ? 'Set mastered' : 'No cards yet'}</span><h1>Nothing to learn right now</h1><p>{set.cards.length ? 'Every card is mastered.' : 'Add some cards to this set first.'} {due && due > new Date() ? `The next review is due ${due.toLocaleDateString()}.` : ''} Flashcards, Write and Match stay open in the meantime.</p><StageTiles set={set} progress={progress} /><button className="primary" onClick={back}>Back to set</button></div></section>
  }

  if (phase === 'setup') return <section className="study-page page-width">
    <div className="study-top"><button className="back-button" onClick={back}><ArrowLeft size={18} /> {set.title}</button><span>{pending} of {set.cards.length} cards to learn</span></div>
    <div className="learn-card learn-setup">
      <span className="kicker"><Sparkles size={14} /> Learn</span>
      <h1>{set.title}</h1>
      <p className="learn-intro">Rounds of {ROUND_SIZE}. Multiple choice first, then written answers once a card is familiar. Anything you miss comes back in the same round, and mastered cards return when their review is due.</p>
      <StageTiles set={set} progress={progress} />
      <div className="learn-options">
        <fieldset><legend>Answer with</legend><div className="segmented">{SIDES.map(([side, label]) => <button key={side} type="button" aria-pressed={options.side === side} onClick={() => setOptions((current) => ({ ...current, side }))}>{label}</button>)}</div></fieldset>
        <fieldset><legend>Question types</legend><div className="segmented">{TYPES.map(([types, label]) => <button key={types} type="button" aria-pressed={options.types === types} onClick={() => setOptions((current) => ({ ...current, types }))}>{label}</button>)}</div></fieldset>
      </div>
      <button className="primary" onClick={startRound}>Start round 1</button>
    </div>
  </section>

  if (phase === 'summary') {
    const firstTry = outcomes.filter((item) => item.correct).length
    return <section className="study-page page-width"><div className="completion learn-summary">
      <span className="completion-icon"><Check /></span><span className="kicker">Round {round} complete</span>
      <h1>{firstTry} of {outcomes.length} on the first try</h1>
      <p>{firstTry === outcomes.length ? 'Clean round. Familiar cards move on to written answers next.' : 'Missed cards came back until you got them right; a correct re-ask moves them forward.'}</p>
      <StageTiles set={set} progress={progress} />
      <div className="round-review">{outcomes.map(({ card, correct }) => <article key={card.id} className={correct ? 'correct' : 'incorrect'}>{correct ? <Check size={18} /> : <X size={18} />}<div><b>{promptText(card, options.side)}</b><span>{answerText(card, options.side)}</span></div><StagePill progress={progress[card.id]} /></article>)}</div>
      <div className="button-row"><button className="primary" onClick={startRound}>{pending ? `Continue to round ${round + 1}` : 'Finish'}</button><button className="secondary" onClick={back}>Back to set</button></div>
    </div></section>
  }

  if (!question) return null
  const written = question.kind === 'written'
  const prompt = promptText(question.card, options.side)
  return <section className="study-page page-width">
    <div className="study-top"><button className="back-button" onClick={back}><ArrowLeft size={18} /> Exit learn</button><span>Round {round} · {index + 1} of {queue.length}</span></div>
    <div className="study-progress"><i style={{ width: `${(index / queue.length) * 100}%` }} /></div>
    <div className="learn-card">
      <div className="learn-head">{written ? <span className="kicker"><PenLine size={14} /> Written</span> : <span className="kicker">Multiple choice</span>}<StagePill progress={progress[question.card.id]} /></div>
      <h1 className={prompt.length > 60 ? 'long' : ''}>{prompt}</h1>
      {!written && <div className="learn-choices">{choices.map((choice, position) => <button key={position} type="button" disabled={Boolean(result)} className={result ? choice === expected ? 'correct' : choice === result.picked ? 'incorrect' : '' : ''} onClick={() => pick(choice)}><i>{position + 1}</i><span>{choice}</span></button>)}</div>}
      {written && !result && <form className="learn-written" onSubmit={check}><label htmlFor="learn-answer">Your answer</label><input id="learn-answer" autoFocus autoComplete="off" value={typed} onChange={(event) => setTyped(event.target.value)} placeholder="Type the answer…" /><button className="primary" disabled={!typed.trim()}>Check</button></form>}
      {!result && <button type="button" className="text-button" onClick={giveUp}>Don’t know</button>}
      {result && <div className={`learn-feedback ${result.correct ? 'correct' : 'incorrect'}`}>
        <h2>{result.correct ? <><Check /> Correct</> : <><X /> {written ? 'Not quite' : 'The answer is highlighted'}</>}</h2>
        {written && <p>{expected}</p>}
        {question.card.note && <small>{question.card.note}</small>}
        {written && !result.correct
          ? <form className="learn-written" onSubmit={acceptMiss}>{shortAnswer(question.card, options.side) && <><label htmlFor="learn-retype">Type the correct answer to continue</label><input id="learn-retype" autoFocus autoComplete="off" value={retyped} onChange={(event) => setRetyped(event.target.value)} /></>}<div className="actions"><button className="primary" disabled={!retypeDone}>Continue</button><button type="button" className="text-button" onClick={override}>Override: I was right</button></div></form>
          : <div className="actions"><button type="button" className="primary" onClick={() => advance()}>Continue</button></div>}
      </div>}
    </div>
    <p className="keyboard-hint"><RotateCcw size={15} /> {written ? 'Enter checks your answer.' : 'Press 1–4 to answer, Enter to continue.'} Misses come back later in this round.</p>
  </section>
}
