import { Archive, BookOpen, HardDrive, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import type { CardProgress, StudySet } from '../types'
import { setMastery } from '../lib/study'

type Props = { sets: StudySet[]; progress: Record<string, Record<string, CardProgress>>; openSet: (id: string) => void; create: () => void; settings: () => void }

export function LibraryView({ sets, progress, openSet, create, settings }: Props) {
  const [query, setQuery] = useState('')
  const [section, setSection] = useState<'active' | 'archived'>('active')
  const activeCount = sets.filter((set) => !set.archived).length
  const archivedCount = sets.length - activeCount
  const filtered = sets.filter((set) => Boolean(set.archived) === (section === 'archived') && `${set.title} ${set.subject} ${set.description}`.toLowerCase().includes(query.toLowerCase()))
  return <section className="page-width page-section">
    <div className="page-title"><div><span className="kicker">All your material</span><h1>Study library</h1><p>One calm place for every subject you’re working on.</p></div><button className="primary" onClick={create}><Plus size={18} /> New set</button></div>
    <div className="local-storage-notice"><HardDrive /><div><b>Saved in this browser</b><p>Your library and progress use this browser profile’s local storage—not GitHub or cloud sync. Export a backup to move them to another device.</p></div><button className="text-button" onClick={settings}>Backup & storage</button></div>
    <div className="library-tabs" aria-label="Library sections"><button className={section === 'active' ? 'active' : ''} onClick={() => setSection('active')}><BookOpen size={17} /> Active <span>{activeCount}</span></button><button className={section === 'archived' ? 'active' : ''} onClick={() => setSection('archived')}><Archive size={17} /> Archived <span>{archivedCount}</span></button></div>
    <label className="search"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sets or subjects" /></label>
    <div className="set-grid library-grid">{filtered.map((set) => <button className="set-card" key={set.id} onClick={() => openSet(set.id)} style={{ '--set-color': set.color } as React.CSSProperties}><span className="set-subject">{set.subject || 'General'}</span><h3>{set.title}</h3><p>{set.description || 'No description yet.'}</p><div className="set-card-meta"><span>{set.cards.length} cards</span><span>{setMastery(set, progress[set.id])}% mastered</span></div><div className="progress-line"><i style={{ width: `${setMastery(set, progress[set.id])}%` }} /></div></button>)}</div>
    {!filtered.length && <div className="empty-state">{section === 'archived' ? <Archive size={38} /> : <BookOpen size={38} />}<h3>{query ? 'No sets match that search' : section === 'archived' ? 'Nothing archived yet' : 'No active study sets'}</h3><p>{query ? 'Try a broader phrase.' : section === 'archived' ? 'Finished sets can rest here without losing their proficiency or test history.' : 'Create one manually or let AI draft it from a resource.'}</p></div>}
  </section>
}
