import { useEffect, useState } from 'react'
import { Shell } from './components/Shell'
import { Home } from './components/Home'
import { LibraryView } from './components/LibraryView'
import { SetEditor } from './components/SetEditor'
import { SetDetail } from './components/SetDetail'
import { Flashcards } from './components/Flashcards'
import { LearnMode } from './components/LearnMode'
import { MatchMode } from './components/MatchMode'
import { MockTest } from './components/MockTest'
import { ProgressView } from './components/ProgressView'
import { GenerateView } from './components/GenerateView'
import { SettingsView } from './components/SettingsView'
import { SharedSetView } from './components/SharedSetView'
import { WriteMode } from './components/WriteMode'
import type { GeneratedSet, StudyCard, StudySet, StudyState, View } from './types'
import { downloadBackup, initialState, loadState, readBackup, saveState } from './lib/storage'
import { makeId, recordAnswer, todayKey } from './lib/study'
import { createShareUrl, decodeShareToken } from './lib/share'

type Draft = GeneratedSet & { sources: string[] }

export default function App() {
  const [state, setState] = useState<StudyState>(loadState)
  const [view, setView] = useState<View>(() => window.location.hash.startsWith('#share=') ? 'share' : new URLSearchParams(window.location.search).has('code') || window.location.hash === '#generate' ? 'generate' : window.location.hash === '#settings' ? 'settings' : 'home')
  const [selectedId, setSelectedId] = useState(state.sets[0]?.id ?? '')
  const [editing, setEditing] = useState<StudySet | undefined>()
  const [draft, setDraft] = useState<Draft | undefined>()
  const [sharedSet, setSharedSet] = useState<StudySet | undefined>()
  const [shareError, setShareError] = useState('')
  const selected = state.sets.find((set) => set.id === selectedId)
  useEffect(() => saveState(state), [state])
  useEffect(() => {
    if (!window.location.hash.startsWith('#share=')) return
    let active = true
    decodeShareToken(window.location.hash.slice(7)).then((set) => { if (active) setSharedSet(set) }).catch((error) => { if (active) setShareError(error instanceof Error ? error.message : 'That share link could not be opened.') })
    return () => { active = false }
  }, [])
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [view])
  useEffect(() => {
    const media = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : undefined
    const apply = () => {
      document.documentElement.dataset.theme = state.preferences.theme === 'system' ? (media?.matches ? 'dark' : 'light') : state.preferences.theme
      document.documentElement.dataset.palette = state.preferences.palette
    }
    apply()
    media?.addEventListener('change', apply)
    return () => media?.removeEventListener('change', apply)
  }, [state.preferences])
  const navigate = (next: View) => { if (window.location.hash) history.replaceState(null, '', `${location.pathname}${location.search}`); if (next === 'create') { setEditing(undefined); setDraft(undefined) } setView(next) }
  const openSet = (id: string) => { setSelectedId(id); setView('set') }
  const saveSet = (next: StudySet) => {
    setState((current) => ({ ...current, sets: current.sets.some((set) => set.id === next.id) ? current.sets.map((set) => set.id === next.id ? next : set) : [next, ...current.sets] }))
    setSelectedId(next.id); setDraft(undefined); setEditing(undefined); setView('set')
  }
  const answer = (card: StudyCard, correct: boolean) => {
    if (!selected) return
    setState((current) => ({ ...current, progress: { ...current.progress, [selected.id]: { ...current.progress[selected.id], [card.id]: recordAnswer(current.progress[selected.id]?.[card.id], correct) } }, activityDates: [...new Set([...current.activityDates, todayKey()])] }))
  }
  const finishTest = (score: number, total: number, durationSeconds: number, answers: { card: StudyCard; correct: boolean }[]) => {
    if (!selected) return
    setState((current) => {
      const setProgress = { ...current.progress[selected.id] }
      answers.forEach(({ card, correct }) => { setProgress[card.id] = recordAnswer(setProgress[card.id], correct) })
      return { ...current, progress: { ...current.progress, [selected.id]: setProgress }, attempts: [{ id: makeId(), setId: selected.id, date: new Date().toISOString(), score, total, durationSeconds }, ...current.attempts], activityDates: [...new Set([...current.activityDates, todayKey()])] }
    })
  }
  const remove = () => {
    if (!selected || !confirm(`Delete “${selected.title}” and its progress? This cannot be undone.`)) return
    setState((current) => { const progress = { ...current.progress }; delete progress[selected.id]; return { ...current, sets: current.sets.filter((set) => set.id !== selected.id), progress, attempts: current.attempts.filter((attempt) => attempt.setId !== selected.id) } })
    setView('library')
  }
  const duplicate = () => {
    if (!selected) return
    const now = new Date().toISOString()
    const copy: StudySet = { ...selected, id: makeId(), title: `${selected.title} (copy)`, archived: false, cards: selected.cards.map((card) => ({ ...card, id: makeId() })), createdAt: now, updatedAt: now }
    saveSet(copy)
  }
  const toggleArchive = () => {
    if (!selected) return
    setState((current) => ({ ...current, sets: current.sets.map((set) => set.id === selected.id ? { ...set, archived: !set.archived, updatedAt: new Date().toISOString() } : set) }))
    setView('library')
  }
  const restore = async (file: File) => { try { const next = await readBackup(file); setState(next); setSelectedId(next.sets[0]?.id ?? ''); setView('library') } catch (error) { alert(error instanceof Error ? error.message : 'Could not restore backup.') } }
  const reset = () => { if (confirm('Reset your entire Open SourcED library and progress to the starter set?')) { const next = initialState(); setState(next); setSelectedId(next.sets[0].id); setView('home') } }
  let content
  if (view === 'home') content = <Home sets={state.sets.filter((set) => !set.archived)} progress={state.progress} activityDates={state.activityDates} openSet={openSet} navigate={navigate} />
  else if (view === 'library') content = <LibraryView sets={state.sets} progress={state.progress} openSet={openSet} create={() => navigate('create')} settings={() => navigate('settings')} />
  else if (view === 'create') content = <SetEditor initial={editing} seedCards={draft?.cards} seedTitle={draft?.title} seedSubject={draft?.subject} seedDescription={draft?.description} seedSources={draft?.sources} isDraft={Boolean(draft)} generate={() => navigate('generate')} save={saveSet} cancel={() => setView(editing ? 'set' : 'library')} />
  else if (view === 'generate') content = <GenerateView onDraft={(result, sources) => { setDraft({ ...result, sources }); setEditing(undefined); setView('create') }} />
  else if (view === 'progress') content = <ProgressView sets={state.sets} progress={state.progress} attempts={state.attempts} activityDates={state.activityDates} backup={() => downloadBackup(state)} restore={restore} reset={reset} openSet={openSet} />
  else if (view === 'settings') content = <SettingsView preferences={state.preferences} update={(preferences) => setState((current) => ({ ...current, preferences }))} backup={() => downloadBackup(state)} />
  else if (view === 'share') content = <SharedSetView set={sharedSet} error={shareError} browse={() => navigate('library')} save={() => { if (sharedSet) { history.replaceState(null, '', `${location.pathname}${location.search}`); saveSet(sharedSet) } }} />
  else if (!selected) content = <LibraryView sets={state.sets} progress={state.progress} openSet={openSet} create={() => navigate('create')} settings={() => navigate('settings')} />
  else if (view === 'set') content = <SetDetail set={selected} progress={state.progress[selected.id] ?? {}} navigate={navigate} edit={() => { setEditing(selected); setDraft(undefined); setView('create') }} duplicate={duplicate} toggleArchive={toggleArchive} remove={remove} share={() => createShareUrl(selected)} />
  else if (view === 'cards') content = <Flashcards set={selected} back={() => setView('set')} />
  else if (view === 'learn') content = <LearnMode set={selected} progress={state.progress[selected.id] ?? {}} back={() => setView('set')} answer={answer} />
  else if (view === 'write') content = <WriteMode set={selected} progress={state.progress[selected.id] ?? {}} back={() => setView('set')} answer={answer} />
  else if (view === 'match') content = <MatchMode set={selected} back={() => setView('set')} answer={answer} />
  else content = <MockTest set={selected} back={() => setView('set')} finish={finishTest} />
  return <Shell view={view} navigate={navigate}>{content}</Shell>
}
