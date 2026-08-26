import { ArrowRight, Brain, Clock3, Flame, Plus, Sparkles, Target } from 'lucide-react'
import type { CardProgress, StudySet, View } from '../types'
import { activityStreak, mastery, setMastery } from '../lib/study'

type Props = { sets: StudySet[]; progress: Record<string, Record<string, CardProgress>>; activityDates: string[]; openSet: (id: string) => void; navigate: (view: View) => void }

export function Home({ sets, progress, activityDates, openSet, navigate }: Props) {
  const cards = sets.reduce((total, set) => total + set.cards.length, 0)
  const due = sets.reduce((total, set) => total + set.cards.filter((card) => !progress[set.id]?.[card.id] || new Date(progress[set.id][card.id].dueAt) <= new Date()).length, 0)
  const mastered = sets.reduce((total, set) => total + set.cards.filter((card) => mastery(progress[set.id]?.[card.id]) >= 80).length, 0)
  return <>
    <section className="hero page-width">
      <div className="hero-copy">
        <span className="eyebrow"><Sparkles size={15} /> Make anything learnable</span>
        <h1>Build knowledge<br /><em>that sticks.</em></h1>
        <p>Turn your notes and resources into focused flashcards, adaptive practice, and realistic tests—then watch your mastery grow.</p>
        <div className="button-row"><button className="primary" onClick={() => navigate('create')}><Plus size={18} /> Create a set</button><button className="secondary" onClick={() => navigate('generate')}><Sparkles size={18} /> Generate with AI</button></div>
      </div>
      <div className="hero-visual" aria-hidden="true">
        <div className="floating-card card-back"><span>Active recall</span><b>Stronger memory through retrieval</b></div>
        <div className="floating-card card-front"><small>BIOLOGY</small><b>What is osmosis?</b><span>Tap to reveal</span></div>
        <div className="orbit orbit-one"><Brain /></div><div className="orbit orbit-two"><Target /></div>
      </div>
    </section>
    <section className="stats-strip"><div><Flame /><strong>{activityStreak(activityDates)}</strong><span>day streak</span></div><div><Clock3 /><strong>{due}</strong><span>cards due</span></div><div><Target /><strong>{mastered}/{cards}</strong><span>mastered</span></div></section>
    <section className="page-width section-block">
      <div className="section-heading"><div><span className="kicker">Your library</span><h2>Keep the momentum going</h2></div><button className="text-button" onClick={() => navigate('library')}>View all <ArrowRight size={17} /></button></div>
      <div className="set-grid">{sets.slice(0, 3).map((set) => <button className="set-card" key={set.id} onClick={() => openSet(set.id)} style={{ '--set-color': set.color } as React.CSSProperties}><span className="set-subject">{set.subject || 'General'}</span><h3>{set.title}</h3><p>{set.description || 'Ready when you are.'}</p><div className="set-card-meta"><span>{set.cards.length} cards</span><span>{setMastery(set, progress[set.id])}% mastered</span></div><div className="progress-line"><i style={{ width: `${setMastery(set, progress[set.id])}%` }} /></div></button>)}</div>
      {!sets.length && <div className="empty-state"><Brain size={38} /><h3>Your library is ready</h3><p>Create your first set manually or generate one from a resource.</p><button className="primary" onClick={() => navigate('create')}>Create a set</button></div>}
    </section>
    <section className="how-it-works"><div className="page-width"><span className="kicker">A better study loop</span><h2>From source to confidence</h2><div className="steps"><article><b>01</b><h3>Build</h3><p>Write cards yourself or shape an AI draft from your materials.</p></article><article><b>02</b><h3>Practice</h3><p>Flip, retrieve, and answer. Difficult cards return sooner.</p></article><article><b>03</b><h3>Prove it</h3><p>Take randomized tests and track real card-level mastery.</p></article></div></div></section>
  </>
}
