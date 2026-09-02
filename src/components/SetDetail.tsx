import { Archive, ArchiveRestore, ArrowLeft, Brain, Copy, Download, Edit3, FileQuestion, Layers3, Link2, MoreHorizontal, PenLine, Play, Puzzle, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { CardProgress, StudyCard, StudySet, View } from '../types'
import { exportSet } from '../lib/resources'
import { mastery, setMastery } from '../lib/study'
import { cardSpeechSegments } from '../lib/speech'
import { ReadAloudButton } from './ReadAloudButton'

type Props = { set: StudySet; progress: Record<string, CardProgress>; navigate: (view: View) => void; edit: () => void; duplicate: () => void; toggleArchive: () => void; remove: () => void; share: () => Promise<string> }

export function SetDetail({ set, progress, navigate, edit, duplicate, toggleArchive, remove, share }: Props) {
  const [menu, setMenu] = useState(false)
  const [shareStatus, setShareStatus] = useState('')
  const copyShareLink = async () => {
    try {
      const url = await share()
      try { await navigator.clipboard.writeText(url); setShareStatus('Share link copied') }
      catch { window.prompt('Copy this share link:', url); setShareStatus('Share link ready') }
      setTimeout(() => setShareStatus(''), 2500)
    } catch (error) { setShareStatus(error instanceof Error ? error.message : 'Could not create a share link.') }
  }
  const topics = Object.entries(set.cards.reduce<Record<string, StudyCard[]>>((groups, card) => {
    if (card.category) (groups[card.category] ??= []).push(card)
    return groups
  }, {}))
  return <section className="page-width page-section">
    <button className="back-button" onClick={() => navigate('library')}><ArrowLeft size={18} /> Library</button>
    <div className="set-banner" style={{ '--set-color': set.color } as React.CSSProperties}>
      <div><span>{set.subject}</span><h1>{set.title}</h1><p>{set.description || 'A focused collection ready to study.'}</p><small>{set.cards.length} cards · Updated {new Date(set.updatedAt).toLocaleDateString()}{set.archived ? ' · Archived' : ''}</small></div>
      <div className="mastery-ring" style={{ '--mastery': `${setMastery(set, progress) * 3.6}deg` } as React.CSSProperties}><strong>{setMastery(set, progress)}%</strong><span>mastery</span></div>
    </div>
    <div className="mode-grid">
      <button onClick={() => navigate('cards')}><span className="mode-icon coral"><Layers3 /></span><div><h3>Flashcards</h3><p>Flip through the complete set</p></div><Play size={18} /></button>
      <button onClick={() => navigate('learn')}><span className="mode-icon teal"><Brain /></span><div><h3>Learn</h3><p>Adaptive retrieval practice</p></div><Play size={18} /></button>
      <button onClick={() => navigate('write')}><span className="mode-icon violet"><PenLine /></span><div><h3>Write</h3><p>Type answers from memory</p></div><Play size={18} /></button>
      <button onClick={() => navigate('match')} disabled={set.cards.length < 2}><span className="mode-icon forest"><Puzzle /></span><div><h3>Match</h3><p>Make a timed recall round</p></div><Play size={18} /></button>
      <button onClick={() => navigate('test')} disabled={set.cards.length < 4}><span className="mode-icon gold"><FileQuestion /></span><div><h3>Mock test</h3><p>Randomized multiple choice</p></div><Play size={18} /></button>
    </div>
    {topics.length > 1 && <section className="topic-section"><div className="section-heading"><div><span className="kicker">Handbook topics</span><h2>Proficiency by category</h2></div></div><div className="topic-mastery">{topics.map(([topic, cards]) => { const score = Math.round(cards.reduce((sum, card) => sum + mastery(progress[card.id]), 0) / cards.length); return <article key={topic}><div><b>{topic}</b><span>{cards.length} questions</span></div><strong>{score}%</strong><div className="progress-line"><i style={{ width: `${score}%`, background: set.color }} /></div></article> })}</div></section>}
    <div className="section-heading card-list-heading"><div><span className="kicker">Set contents</span><h2>Terms in this set</h2>{shareStatus && <small className="share-status">{shareStatus}</small>}</div><div className="set-actions"><button className="secondary" onClick={copyShareLink}><Link2 size={17} /> Share</button><button className="secondary" onClick={edit}><Edit3 size={17} /> Edit</button><div className="menu-wrap"><button className="icon-button" onClick={() => setMenu(!menu)} aria-label="More set actions"><MoreHorizontal /></button>{menu && <div className="popover"><button onClick={duplicate}><Copy size={16} /> Duplicate</button><button onClick={() => exportSet(set.title, set.cards)}><Download size={16} /> Export CSV</button><button onClick={toggleArchive}>{set.archived ? <ArchiveRestore size={16} /> : <Archive size={16} />} {set.archived ? 'Restore to library' : 'Archive set'}</button><button className="danger-text" onClick={remove}><Trash2 size={16} /> Delete set</button></div>}</div></div></div>
    <div className="term-list">{set.cards.map((card) => <article key={card.id}><div><h3>{card.term}</h3><p>{card.definition}</p>{card.note && <small>{card.note}</small>}</div><div className="term-actions"><ReadAloudButton compact text={cardSpeechSegments(card, set.subject)} label={`Read ${card.term} aloud`} /><span className={`mastery-badge level-${Math.floor(mastery(progress[card.id]) / 34)}`}>{mastery(progress[card.id])}%</span></div></article>)}</div>
  </section>
}
