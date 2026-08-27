import { ArrowLeft, ArrowRight, RotateCcw, Shuffle } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { StudySet } from '../types'
import { shuffle } from '../lib/study'
import { cardSpeechSegments } from '../lib/speech'
import { ReadAloudButton } from './ReadAloudButton'

type Props = { set: StudySet; back: () => void }

export function Flashcards({ set, back }: Props) {
  const [cards, setCards] = useState(set.cards)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const progress = useMemo(() => ((index + 1) / cards.length) * 100, [index, cards.length])
  const move = (next: number) => { setIndex((current) => (current + next + cards.length) % cards.length); setFlipped(false) }
  return <section className="study-page page-width">
    <div className="study-top"><button className="back-button" onClick={back}><ArrowLeft size={18} /> {set.title}</button><div><span>{index + 1} / {cards.length}</span><button className="icon-button" onClick={() => { setCards(shuffle(cards)); setIndex(0); setFlipped(false) }} aria-label="Shuffle cards"><Shuffle size={18} /></button></div></div>
    <div className="study-progress"><i style={{ width: `${progress}%` }} /></div>
    <button className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
      <div className="flash-face front"><span>{set.subject}</span><h2>{cards[index].term}</h2><small>Tap to reveal the answer</small></div>
      <div className="flash-face back"><span>Answer</span><h2>{cards[index].definition}</h2>{cards[index].note && <p>{cards[index].note}</p>}<small>Tap to see the prompt</small></div>
    </button>
    <div className="flash-audio"><ReadAloudButton key={`${cards[index].id}-${flipped}`} text={cardSpeechSegments(cards[index], set.subject, flipped ? 'answer' : 'term')} label={`Read ${flipped ? 'answer' : 'term'} aloud`} /></div>
    <div className="flash-controls"><button className="secondary" onClick={() => move(-1)}><ArrowLeft /> Previous</button><button className="secondary" onClick={() => setFlipped(!flipped)}><RotateCcw /> Flip</button><button className="primary" onClick={() => move(1)}>Next <ArrowRight /></button></div>
    <p className="keyboard-hint">Tip: use ← and → in your browser controls, or tap the card to flip.</p>
  </section>
}
