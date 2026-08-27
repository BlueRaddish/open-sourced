import { ArrowRight, Bot, FileText, FileUp, LoaderCircle, Lock, ShieldCheck, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { GeneratedSet, StudyCard } from '../types'
import { extractFile } from '../lib/resources'
import { makeId } from '../lib/study'
import { beginOpenRouterOAuth, completeOpenRouterOAuth, disconnectOpenRouter, generateWithOpenRouter, hasOpenRouterSession, listGenerationModels, type GenerationModel, type ModelFamily } from '../lib/openrouter'
import { generationPresets } from '../data/generationPresets'

type Props = { onDraft: (draft: GeneratedSet, sources: string[]) => void }

export function GenerateView({ onDraft }: Props) {
  const [topic, setTopic] = useState('')
  const [resource, setResource] = useState('')
  const [count, setCount] = useState('')
  const [family, setFamily] = useState<'free' | ModelFamily>('free')
  const [models, setModels] = useState<GenerationModel[]>([])
  const [selectedModel, setSelectedModel] = useState('')
  const [modelError, setModelError] = useState('')
  const [paidConfirmed, setPaidConfirmed] = useState(false)
  const [preset, setPreset] = useState(generationPresets[0].id)
  const [instructions, setInstructions] = useState(generationPresets[0].instructions)
  const [sources, setSources] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState('')
  const [connected, setConnected] = useState(hasOpenRouterSession)
  const [serverReady, setServerReady] = useState(false)
  const [connecting, setConnecting] = useState(new URLSearchParams(window.location.search).has('code'))

  useEffect(() => {
    let active = true
    completeOpenRouterOAuth()
      .then((completed) => { if (active && completed) setConnected(true) })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : 'OpenRouter could not be connected.') })
      .finally(() => { if (active) setConnecting(false) })
    fetch('/api/health').then((response) => response.ok ? response.json() : undefined).then((body) => { if (active && body?.configured && body?.mode === 'free-only') setServerReady(true) }).catch(() => undefined)
    listGenerationModels().then((available) => { if (active) setModels(available) }).catch(() => { if (active) setModelError('Could not load the current paid-model list. Free generation is still available.') })
    return () => { active = false }
  }, [])

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
    if (topic.trim().length < 2) return setError('Tell Open SourceED what topic to focus on.')
    if (resource.trim().length < 100) return setError('Add at least a short paragraph of source material.')
    const exactCount = count.trim() ? Number(count) : undefined
    if (exactCount !== undefined && (!Number.isInteger(exactCount) || exactCount < 2 || exactCount > 100)) return setError('Use a whole number from 2 to 100, or leave card count blank for automatic coverage.')
    setLoading(true); setError('')
    try {
      let body: GeneratedSet
      if (connected) body = await generateWithOpenRouter({ topic, resource, count: exactCount, instructions, model: family === 'free' ? 'openrouter/free' : effectiveModel })
      else {
        const endpoint = import.meta.env.VITE_AI_ENDPOINT || '/api/generate'
        const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, resource, count: exactCount, instructions }) })
        const result = await response.json().catch(() => ({})) as GeneratedSet & { error?: string }
        if (!response.ok) throw new Error(result.error || (response.status === 404 ? 'Connect OpenRouter to use your own free quota.' : 'Generation failed.'))
        body = result
      }
      const cards: StudyCard[] = body.cards.map((card) => ({ ...card, id: makeId() }))
      onDraft({ ...body, cards }, sources.length ? sources : ['Pasted source'])
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Generation failed.') }
    finally { setLoading(false); if (family !== 'free') setPaidConfirmed(false) }
  }

  const paid = family !== 'free'
  const familyModels = paid ? models.filter((model) => model.family === family) : []
  const effectiveModel = selectedModel || familyModels[0]?.id || ''
  const chosenModel = models.find((model) => model.id === effectiveModel)
  const ready = paid ? connected && Boolean(effectiveModel) && paidConfirmed : connected || serverReady
  const chooseFamily = (next: 'free' | ModelFamily) => { setFamily(next); setPaidConfirmed(false); if (next !== 'free') setSelectedModel(models.find((model) => model.family === next)?.id || '') }
  const applyPreset = (id: string) => { const next = generationPresets.find((item) => item.id === id); if (next) { setPreset(id); setInstructions(next.instructions) } }
  const price = (value: number) => value < .01 ? `$${value.toFixed(3)}` : `$${value.toFixed(2)}`
  return <section className="page-width page-section generate-page">
    <div className="page-title"><div><span className="eyebrow"><Sparkles size={15} /> Source-grounded AI</span><h1>Turn resources into a first draft</h1><p>Add the material you trust. Open SourceED extracts the text, drafts focused cards, and sends everything to the normal editor for your review.</p></div></div>
    <div className="generate-layout"><div className="generator-panel">
      <div className={`ai-connection ${connected || serverReady ? 'connected' : ''}`}><div><ShieldCheck /><span><b>{connected ? 'Your OpenRouter account is connected' : serverReady ? 'Free generation is ready' : 'Connect OpenRouter to generate'}</b><small>{connected ? 'Choose Free or a paid/BYOK model. Your temporary key stays in this browser tab.' : serverReady ? 'Free works now; connect your own account only if you want more model choices.' : 'Every visitor connects separately, so there is no shared project key or quota.'}</small></span></div>{connected ? <button className="secondary" onClick={() => { disconnectOpenRouter(); setConnected(false); chooseFamily('free') }}>Disconnect</button> : <button className="secondary" disabled={connecting} onClick={() => { setConnecting(true); beginOpenRouterOAuth() }}>{connecting ? 'Connecting…' : 'Connect OpenRouter'}</button>}</div>

      <fieldset className="model-picker"><legend>Choose a model source</legend>
        <div className="model-family-options">
          <button type="button" className={family === 'free' ? 'selected' : ''} onClick={() => chooseFamily('free')} aria-pressed={family === 'free'} aria-label="Use free models"><Sparkles size={18} /><b>Free</b><small>Always $0</small></button>
          <button type="button" className={family === 'openai' ? 'selected' : ''} onClick={() => chooseFamily('openai')} aria-pressed={family === 'openai'} aria-label="Use GPT models"><Bot size={18} /><b>GPT</b><small>OpenAI models</small></button>
          <button type="button" className={family === 'anthropic' ? 'selected' : ''} onClick={() => chooseFamily('anthropic')} aria-pressed={family === 'anthropic'} aria-label="Use Claude models"><Bot size={18} /><b>Claude</b><small>Anthropic models</small></button>
          <button type="button" className={family === 'google' ? 'selected' : ''} onClick={() => chooseFamily('google')} aria-pressed={family === 'google'} aria-label="Use Gemini models"><Bot size={18} /><b>Gemini</b><small>Google models</small></button>
        </div>
        {!paid && <p className="model-note">Uses OpenRouter’s free router and stops when free capacity is unavailable. It never falls through to a paid model.</p>}
        {paid && <div className="paid-model-options">
          <label><span>Exact {family === 'openai' ? 'GPT' : family === 'anthropic' ? 'Claude' : 'Gemini'} model</span><select value={effectiveModel} onChange={(event) => { setSelectedModel(event.target.value); setPaidConfirmed(false) }} disabled={!familyModels.length}>{familyModels.length ? familyModels.map((model) => <option key={model.id} value={model.id}>{model.name}</option>) : <option value="">No compatible models loaded</option>}</select>{chosenModel && <small className="model-price">Published input/output rates: {price(chosenModel.promptPerMillion)} / {price(chosenModel.completionPerMillion)} per 1M tokens. Final charges are set by OpenRouter.</small>}</label>
          {modelError && <p className="form-error" role="alert">{modelError}</p>}
          <div className="paid-model-warning"><Lock size={20} /><div><b>Your account, your cost</b><span>This uses your connected OpenRouter balance or a provider API key you configure in OpenRouter BYOK. Open SourceED never asks for the raw provider key and does not sign into ChatGPT, Claude, or Gemini consumer apps.</span><a href="https://openrouter.ai/workspaces/default/byok" target="_blank" rel="noreferrer">Configure provider keys in OpenRouter</a></div></div>
          <label className="paid-confirm"><input type="checkbox" checked={paidConfirmed} onChange={(event) => setPaidConfirmed(event.target.checked)} /><span>Allow this one generation to use my connected account’s paid or BYOK quota.</span></label>
        </div>}
      </fieldset>

      <label><span>What are you studying? *</span><input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. Photosynthesis for AP Biology" /></label>
      <label className="exact-count"><span>Exact number of cards (optional)</span><input type="number" inputMode="numeric" min={2} max={100} step={1} value={count} onChange={(event) => setCount(event.target.value)} placeholder="Automatic—AI covers the source as fully as needed" /><small>Leave blank to let the model choose the useful number of cards and infer the learning level from your material.</small></label>
      <fieldset className="generation-guidance"><legend>Generation style</legend>
        <div className="preset-grid">{generationPresets.map((item) => <button type="button" key={item.id} className={preset === item.id ? 'selected' : ''} onClick={() => applyPreset(item.id)} aria-pressed={preset === item.id}><b>{item.label}</b><small>{item.description}</small></button>)}</div>
        <label><span>Additional instructions (optional)</span><textarea rows={4} maxLength={2000} value={instructions} onChange={(event) => { setInstructions(event.target.value); setPreset('custom') }} placeholder="For example: Focus on clinical scenarios, keep answers concise, and include common misconceptions." /><small>{instructions.length.toLocaleString()} / 2,000 characters. Edit a preset or write your own directions.</small></label>
      </fieldset>
      <label><span>Paste source material *</span><textarea rows={12} maxLength={60000} value={resource} onChange={(event) => setResource(event.target.value)} placeholder="Paste lecture notes, a study guide, an article, or any source text here…" /><small>{resource.length.toLocaleString()} / 60,000 characters</small></label>
      <div className="upload-zone"><FileUp size={25} /><div><b>{extracting ? 'Reading files…' : 'Or add resource files'}</b><span>PDF, TXT, Markdown, CSV, or JSON</span></div><label className="secondary file-button">Choose files<input type="file" multiple accept=".pdf,.txt,.md,.markdown,.csv,.json,text/*,application/pdf" onChange={(event) => addFiles(event.target.files)} /></label></div>
      {!!sources.length && <div className="source-chips">{sources.map((source) => <span key={source}><FileText size={14} />{source}<button onClick={() => setSources((current) => current.filter((item) => item !== source))} aria-label={`Remove ${source}`}><X size={13} /></button></span>)}</div>}
      {error && <div className="form-error" role="alert">{error}</div>}
      <button className="primary generate-button" onClick={generate} disabled={loading || extracting || !ready}>{loading ? <><LoaderCircle className="spin" /> Building your draft…</> : <><Sparkles /> Generate editable cards <ArrowRight /></>}</button>
      <p className="generation-save-note">This creates a draft only. You’ll review and edit every card in Create before anything is saved.</p>
    </div><aside className="trust-panel"><ShieldCheck /><h2>Private connection, explicit cost</h2><p>Free is always the default. Choosing GPT, Claude, or Gemini requires your own OpenRouter connection and a fresh cost confirmation for every generation.</p><hr /><h3>What stays protected</h3><ul><li>No shared Open SourceED API key</li><li>No raw provider keys entered here</li><li>Requests avoid data-collecting providers</li><li>Generated cards return as an editable draft</li></ul><p className="small-print">Your temporary OAuth key remains in this browser tab. Always review generated cards against the original source.</p></aside></div>
  </section>
}
