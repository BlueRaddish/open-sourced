import { ArrowRight, FileText, FileUp, LoaderCircle, ShieldCheck, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import type { GeneratedSet, StudyCard } from '../types'
import { extractFile } from '../lib/resources'
import { makeId } from '../lib/study'

type Props = { onDraft: (draft: GeneratedSet, sources: string[]) => void }

export function GenerateView({ onDraft }: Props) {
  const [topic, setTopic] = useState('')
  const [resource, setResource] = useState('')
  const [count, setCount] = useState(15)
  const [difficulty, setDifficulty] = useState('intermediate')
  const [sources, setSources] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState('')
  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setExtracting(true); setError('')
    try {
      const chosen = [...files]
      const texts = await Promise.all(chosen.map(extractFile))
      setResource((current) => [current, ...texts].filter(Boolean).join('\n\n--- NEXT RESOURCE ---\n\n').slice(0, 60_000))
      setSources((current) => [...new Set([...current, ...chosen.map((file) => file.name)])])
    } catch { setError('One of those files could not be read. Try PDF, TXT, Markdown, CSV, or JSON.') }
    finally { setExtracting(false) }
  }
  const generate = async () => {
    if (topic.trim().length < 2) return setError('Tell StudyForge what topic to focus on.')
    if (resource.trim().length < 100) return setError('Add at least a short paragraph of source material.')
    setLoading(true); setError('')
    try {
      const endpoint = import.meta.env.VITE_AI_ENDPOINT || '/api/generate'
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, resource, count, difficulty }) })
      const body = await response.json().catch(() => ({})) as GeneratedSet & { error?: string }
      if (!response.ok) throw new Error(body.error || (response.status === 404 ? 'AI generation is not connected on this deployment.' : 'Generation failed.'))
      const cards: StudyCard[] = body.cards.map((card) => ({ ...card, id: makeId() }))
      onDraft({ ...body, cards }, sources.length ? sources : ['Pasted source'])
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Generation failed.') }
    finally { setLoading(false) }
  }
  return <section className="page-width page-section generate-page">
    <div className="page-title"><div><span className="eyebrow"><Sparkles size={15} /> Source-grounded AI</span><h1>Turn resources into a first draft</h1><p>Add the material you trust. StudyForge extracts the text, drafts focused cards, and sends everything to the normal editor for your review.</p></div></div>
    <div className="generate-layout"><div className="generator-panel">
      <label><span>What are you studying? *</span><input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. Photosynthesis for AP Biology" /></label>
      <div className="form-grid"><label><span>Number of cards</span><select value={count} onChange={(event) => setCount(Number(event.target.value))}><option value={8}>8 cards</option><option value={15}>15 cards</option><option value={25}>25 cards</option><option value={40}>40 cards</option></select></label><label><span>Difficulty</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label></div>
      <label><span>Paste source material *</span><textarea rows={12} maxLength={60000} value={resource} onChange={(event) => setResource(event.target.value)} placeholder="Paste lecture notes, a study guide, an article, or any source text here…" /><small>{resource.length.toLocaleString()} / 60,000 characters</small></label>
      <div className="upload-zone"><FileUp size={25} /><div><b>{extracting ? 'Reading files…' : 'Or add resource files'}</b><span>PDF, TXT, Markdown, CSV, or JSON</span></div><label className="secondary file-button">Choose files<input type="file" multiple accept=".pdf,.txt,.md,.markdown,.csv,.json,text/*,application/pdf" onChange={(event) => addFiles(event.target.files)} /></label></div>
      {!!sources.length && <div className="source-chips">{sources.map((source) => <span key={source}><FileText size={14} />{source}<button onClick={() => setSources((current) => current.filter((item) => item !== source))} aria-label={`Remove ${source}`}><X size={13} /></button></span>)}</div>}
      {error && <div className="form-error" role="alert">{error}</div>}
      <button className="primary generate-button" onClick={generate} disabled={loading || extracting}>{loading ? <><LoaderCircle className="spin" /> Building your draft…</> : <><Sparkles /> Generate editable cards <ArrowRight /></>}</button>
    </div><aside className="trust-panel"><ShieldCheck /><h2>Your key stays server-side</h2><p>Resource text is sent only when you press generate. The browser never receives or stores the API key.</p><hr /><h3>Good source material</h3><ul><li>Course notes and study guides</li><li>Textbook excerpts you may use</li><li>PDF handbooks and reference sheets</li><li>Your own outlines and summaries</li></ul><p className="small-print">Always review generated cards against the original source before relying on them.</p></aside></div>
  </section>
}
