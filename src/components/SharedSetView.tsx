import { BookOpen, Download, Link2, ShieldCheck } from 'lucide-react'
import type { StudySet } from '../types'
import { cardSpeechSegments } from '../lib/speech'
import { ReadAloudButton } from './ReadAloudButton'

type Props = { set?: StudySet; error?: string; save: () => void; browse: () => void }

export function SharedSetView({ set, error, save, browse }: Props) {
  if (!set) return <section className="page-width page-section"><div className="empty-state"><Link2 /><h1>{error ? 'This link could not be opened' : 'Opening shared set…'}</h1><p>{error || 'Decoding the study cards in your browser.'}</p>{error && <button className="secondary" onClick={browse}>Browse your library</button>}</div></section>
  return <section className="page-width page-section shared-page">
    <div className="shared-notice"><ShieldCheck /><p><b>Unlisted shared set</b><span>This set is encoded in the link. It has not been added to your library yet.</span></p></div>
    <div className="set-banner" style={{ '--set-color': set.color } as React.CSSProperties}><div><span>{set.subject}</span><h1>{set.title}</h1><p>{set.description || 'A shared Open SourcED study set.'}</p><small>{set.cards.length} cards</small></div><BookOpen className="shared-book" /></div>
    <div className="shared-actions"><button className="primary" onClick={save}><Download /> Save to my library</button><button className="secondary" onClick={browse}>Not now</button></div>
    <div className="section-heading card-list-heading"><div><span className="kicker">Preview</span><h2>Terms in this set</h2></div></div>
    <div className="term-list">{set.cards.map((card) => <article key={card.id}><div><h3>{card.term}</h3><p>{card.definition}</p>{card.note && <small>{card.note}</small>}</div><ReadAloudButton compact text={cardSpeechSegments(card, set.subject)} label={`Read ${card.term} aloud`} /></article>)}</div>
  </section>
}
