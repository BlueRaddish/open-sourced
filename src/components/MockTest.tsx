import { ArrowLeft, Check, Trophy, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { StudyCard, StudySet } from '../types'
import { choicesFor, shuffle } from '../lib/study'

type Props = { set: StudySet; back: () => void; finish: (score: number, total: number, seconds: number, answers: { card: StudyCard; correct: boolean }[]) => void }

export function MockTest({ set, back, finish }: Props) {
  const questions = useMemo(() => shuffle(set.cards).slice(0, Math.min(set.testSize ?? 20, set.cards.length)).map((card) => ({ card, choices: choicesFor(card, set.cards) })), [set])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [started] = useState(() => Date.now())
  const score = questions.filter(({ card }) => answers[card.id] === card.definition).length
  const submit = () => {
    if (Object.keys(answers).length < questions.length && !confirm('Some questions are unanswered. Submit anyway?')) return
    setSubmitted(true)
    finish(score, questions.length, Math.round((Date.now() - started) / 1000), questions.map(({ card }) => ({ card, correct: answers[card.id] === card.definition })))
  }
  if (submitted) return <section className="study-page page-width"><div className="completion test-result"><span className="completion-icon"><Trophy /></span><span className="kicker">Test complete</span><h1>{score} / {questions.length}</h1><p>{score / questions.length >= .8 ? 'Strong work. Your recall is taking shape.' : 'Good data. Review the misses and try again when you’re ready.'}</p><div className="score-bar"><i style={{ width: `${score / questions.length * 100}%` }} /></div><button className="primary" onClick={back}>Review set</button></div><div className="test-review">{questions.map(({ card }, index) => <article key={card.id} className={answers[card.id] === card.definition ? 'correct' : 'incorrect'}><b>{index + 1}</b><div><h3>{card.term}</h3><p>Your answer: {answers[card.id] || 'Not answered'}</p>{answers[card.id] !== card.definition && <small>Correct answer: {card.definition}</small>}{card.note && <small>{card.note}</small>}</div>{answers[card.id] === card.definition ? <Check /> : <X />}</article>)}</div></section>
  return <section className="study-page page-width test-page">
    <div className="study-top"><button className="back-button" onClick={back}><ArrowLeft size={18} /> Exit test</button><span>{Object.keys(answers).length} / {questions.length} answered</span></div>
    <div className="page-title compact"><div><span className="kicker">Mock test</span><h1>{set.title}</h1><p>Choose the best answer for each prompt.</p></div></div>
    <div className="questions">{questions.map(({ card, choices }, index) => <article className="question-card" key={card.id}><span>Question {index + 1}</span><h2>{card.term}</h2><div className="choice-list">{choices.map((choice, choiceIndex) => <label key={choice}><input type="radio" name={card.id} checked={answers[card.id] === choice} onChange={() => setAnswers((current) => ({ ...current, [card.id]: choice }))} /><i>{String.fromCharCode(65 + choiceIndex)}</i><p>{choice}</p></label>)}</div></article>)}</div>
    <button className="primary submit-test" onClick={submit}>Submit test</button>
  </section>
}
