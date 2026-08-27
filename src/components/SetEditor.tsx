import { ArrowLeft, FileUp, GripVertical, Plus, Save, Sparkles, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import type { StudyCard, StudySet } from '../types'
import { makeId } from '../lib/study'
import { parseDelimited } from '../lib/resources'

type Props = { initial?: StudySet; seedCards?: StudyCard[]; seedTitle?: string; seedSubject?: string; seedDescription?: string; seedSources?: string[]; isDraft?: boolean; generate: () => void; save: (set: StudySet) => void; cancel: () => void }
const colors = ['#f26b4e', '#166b68', '#e7a43b', '#6555a3', '#3478a6', '#b95772']
const blank = (): StudyCard => ({ id: makeId(), term: '', definition: '', note: '' })

export function SetEditor({ initial, seedCards, seedTitle, seedSubject, seedDescription, seedSources, isDraft, generate, save, cancel }: Props) {
  const now = new Date().toISOString()
  const [title, setTitle] = useState(initial?.title ?? seedTitle ?? '')
  const [subject, setSubject] = useState(initial?.subject ?? seedSubject ?? '')
  const [description, setDescription] = useState(initial?.description ?? seedDescription ?? '')
  const [color, setColor] = useState(initial?.color ?? colors[0])
  const [cards, setCards] = useState<StudyCard[]>(initial?.cards ?? (seedCards?.length ? seedCards : [blank(), blank()]))
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const update = (id: string, field: keyof Pick<StudyCard, 'term' | 'definition' | 'note'>, value: string) => setCards((current) => current.map((card) => card.id === id ? { ...card, [field]: value } : card))
  const add = () => { setCards((current) => [...current, blank()]); setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 30) }
  const submit = () => {
    const valid = cards.filter((card) => card.term.trim() && card.definition.trim()).map((card) => ({ ...card, term: card.term.trim(), definition: card.definition.trim(), note: card.note.trim() }))
    if (!title.trim()) return setError('Give your set a title.')
    if (valid.length < 2) return setError('Add at least two complete cards.')
    save({ id: initial?.id ?? makeId(), title: title.trim(), subject: subject.trim() || 'General', description: description.trim(), color, archived: initial?.archived, cards: valid, testSize: initial?.testSize, sources: initial?.sources ?? seedSources ?? [], createdAt: initial?.createdAt ?? now, updatedAt: now })
  }
  const importCsv = async (file?: File) => {
    if (!file) return
    const imported = parseDelimited(await file.text())
    if (!imported.length) return setError('No term/definition pairs were found. Use one pair per line, separated by a tab or comma.')
    setCards((current) => [...current.filter((card) => card.term || card.definition), ...imported])
  }
  return <section className="page-width page-section editor-page">
    <button className="back-button" onClick={cancel}><ArrowLeft size={18} /> Back</button>
    <div className="page-title compact"><div><span className="kicker">{initial ? 'Refine your material' : isDraft ? 'Review before saving' : 'Build it your way'}</span><h1>{initial ? 'Edit study set' : isDraft ? 'Review generated study set' : 'Create a study set'}</h1></div><button className="primary" onClick={submit}><Save size={18} /> Save set</button></div>
    {!initial && (isDraft ? <div className="draft-notice"><Sparkles /><div><b>Editable AI draft</b><span>Change anything below. This set is not in your library until you press Save set.</span></div></div> : <div className="create-method"><div><Sparkles /><span><b>Want a head start?</b><small>Generate an editable draft from your notes or resources.</small></span></div><button className="secondary" onClick={generate}><Sparkles size={17} /> Generate with AI</button></div>)}
    <div className="editor-panel">
      <div className="form-grid"><label><span>Title *</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Organic chemistry: reactions" /></label><label><span>Subject</span><input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="e.g. Chemistry" /></label></div>
      <label><span>Description</span><textarea rows={2} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What does this set cover?" /></label>
      <fieldset className="color-picker"><legend>Cover color</legend>{colors.map((item) => <button type="button" key={item} className={color === item ? 'selected' : ''} style={{ background: item }} onClick={() => setColor(item)} aria-label={`Choose ${item}`} />)}</fieldset>
    </div>
    <div className="cards-heading"><div><h2>Cards</h2><span>{cards.length} rows</span></div><label className="secondary file-button"><FileUp size={17} /> Import CSV / TSV<input type="file" accept=".csv,.tsv,.txt" onChange={(event) => importCsv(event.target.files?.[0])} /></label></div>
    <div className="edit-cards">{cards.map((card, index) => <article className="edit-card" key={card.id}><div className="card-number"><GripVertical size={18} /><b>{index + 1}</b></div><div className="edit-fields"><label><span>Term or question</span><textarea rows={2} value={card.term} onChange={(event) => update(card.id, 'term', event.target.value)} placeholder="What should you recall?" /></label><label><span>Definition or answer</span><textarea rows={2} value={card.definition} onChange={(event) => update(card.id, 'definition', event.target.value)} placeholder="The clear, concise answer" /></label><label className="note-field"><span>Memory note (optional)</span><input value={card.note} onChange={(event) => update(card.id, 'note', event.target.value)} placeholder="Example, mnemonic, or context" /></label></div><button className="icon-button danger" onClick={() => setCards((current) => current.filter((item) => item.id !== card.id))} aria-label={`Delete card ${index + 1}`}><Trash2 size={18} /></button></article>)}</div>
    <div ref={endRef} /><button className="add-card" onClick={add}><Plus size={19} /> Add another card</button>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="editor-actions"><button className="secondary" onClick={cancel}>Cancel</button><button className="primary" onClick={submit}><Save size={18} /> Save {cards.filter((card) => card.term && card.definition).length} cards</button></div>
  </section>
}
