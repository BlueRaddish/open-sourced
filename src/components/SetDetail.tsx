import { ArrowLeft, Brain, Copy, Download, Edit3, FileQuestion, Layers3, MoreHorizontal, Play, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { CardProgress, StudySet, View } from '../types'
import { exportSet } from '../lib/resources'
import { mastery, setMastery } from '../lib/study'

type Props = { set: StudySet; progress: Record<string, CardProgress>; navigate: (view: View) => void; edit: () => void; duplicate: () => void; remove: () => void }

export function SetDetail({ set, progress, navigate, edit, duplicate, remove }: Props) {
  const [menu, setMenu] = useState(false)
  return <section className="page-width page-section">
    <button className="back-button" onClick={() => navigate('library')}><ArrowLeft size={18} /> Library</button>
    <div className="set-banner" style={{ '--set-color': set.color } as React.CSSProperties}>
      <div><span>{set.subject}</span><h1>{set.title}</h1><p>{set.description || 'A focused collection ready to study.'}</p><small>{set.cards.length} cards · Updated {new Date(set.updatedAt).toLocaleDateString()}</small></div>
      <div className="mastery-ring" style={{ '--mastery': `${setMastery(set, progress) * 3.6}deg` } as React.CSSProperties}><strong>{setMastery(set, progress)}%</strong><span>mastery</span></div>
    </div>
    <div className="mode-grid">
      <button onClick={() => navigate('cards')}><span className="mode-icon coral"><Layers3 /></span><div><h3>Flashcards</h3><p>Flip through the complete set</p></div><Play size={18} /></button>
      <button onClick={() => navigate('learn')}><span className="mode-icon teal"><Brain /></span><div><h3>Learn</h3><p>Adaptive retrieval practice</p></div><Play size={18} /></button>
      <button onClick={() => navigate('test')} disabled={set.cards.length < 4}><span className="mode-icon gold"><FileQuestion /></span><div><h3>Mock test</h3><p>Randomized multiple choice</p></div><Play size={18} /></button>
    </div>
    <div className="section-heading card-list-heading"><div><span className="kicker">Set contents</span><h2>Terms in this set</h2></div><div className="set-actions"><button className="secondary" onClick={edit}><Edit3 size={17} /> Edit</button><div className="menu-wrap"><button className="icon-button" onClick={() => setMenu(!menu)} aria-label="More set actions"><MoreHorizontal /></button>{menu && <div className="popover"><button onClick={duplicate}><Copy size={16} /> Duplicate</button><button onClick={() => exportSet(set.title, set.cards)}><Download size={16} /> Export CSV</button><button className="danger-text" onClick={remove}><Trash2 size={16} /> Delete set</button></div>}</div></div></div>
    <div className="term-list">{set.cards.map((card) => <article key={card.id}><div><h3>{card.term}</h3><p>{card.definition}</p>{card.note && <small>{card.note}</small>}</div><span className={`mastery-badge level-${Math.floor(mastery(progress[card.id]) / 34)}`}>{mastery(progress[card.id])}%</span></article>)}</div>
  </section>
}
