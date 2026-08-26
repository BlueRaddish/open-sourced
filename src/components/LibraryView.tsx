import { BookOpen, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import type { CardProgress, StudySet } from '../types'
import { setMastery } from '../lib/study'

type Props = { sets: StudySet[]; progress: Record<string, Record<string, CardProgress>>; openSet: (id: string) => void; create: () => void }

export function LibraryView({ sets, progress, openSet, create }: Props) {
  const [query, setQuery] = useState('')
  const filtered = sets.filter((set) => `${set.title} ${set.subject} ${set.description}`.toLowerCase().includes(query.toLowerCase()))
  return <section className="page-width page-section">
    <div className="page-title"><div><span className="kicker">All your material</span><h1>Study library</h1><p>One calm place for every subject you’re working on.</p></div><button className="primary" onClick={create}><Plus size={18} /> New set</button></div>
    <label className="search"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sets or subjects" /></label>
    <div className="set-grid library-grid">{filtered.map((set) => <button className="set-card" key={set.id} onClick={() => openSet(set.id)} style={{ '--set-color': set.color } as React.CSSProperties}><span className="set-subject">{set.subject || 'General'}</span><h3>{set.title}</h3><p>{set.description || 'No description yet.'}</p><div className="set-card-meta"><span>{set.cards.length} cards</span><span>{setMastery(set, progress[set.id])}% mastered</span></div><div className="progress-line"><i style={{ width: `${setMastery(set, progress[set.id])}%` }} /></div></button>)}</div>
    {!filtered.length && <div className="empty-state"><BookOpen size={38} /><h3>{sets.length ? 'No sets match that search' : 'No study sets yet'}</h3><p>{sets.length ? 'Try a broader phrase.' : 'Create one manually or let AI draft it from a resource.'}</p></div>}
  </section>
}
