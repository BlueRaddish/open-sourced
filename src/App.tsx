import { useEffect, useState } from 'react'
import { Shell } from './components/Shell'
import { Home } from './components/Home'
import { LibraryView } from './components/LibraryView'
import { SetEditor } from './components/SetEditor'
import { SetDetail } from './components/SetDetail'
import { Flashcards } from './components/Flashcards'
import { LearnMode } from './components/LearnMode'
import { MockTest } from './components/MockTest'
import { ProgressView } from './components/ProgressView'
import { GenerateView } from './components/GenerateView'
import type { GeneratedSet, StudyCard, StudySet, StudyState, View } from './types'
import { downloadBackup, initialState, loadState, readBackup, saveState } from './lib/storage'
import { makeId, recordAnswer, todayKey } from './lib/study'

type Draft = GeneratedSet & { sources: string[] }

export default function App() {
  const [state, setState] = useState<StudyState>(loadState)
  const [view, setView] = useState<View>('home')
  const [selectedId, setSelectedId] = useState(state.sets[0]?.id ?? '')
  const [editing, setEditing] = useState<StudySet | undefined>()
  const [draft, setDraft] = useState<Draft | undefined>()
  const selected = state.sets.find((set) => set.id === selectedId)
  useEffect(() => saveState(state), [state])
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [view])
  const navigate = (next: View) => { if (next === 'create') { setEditing(undefined); setDraft(undefined) } setView(next) }
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
    const copy: StudySet = { ...selected, id: makeId(), title: `${selected.title} (copy)`, cards: selected.cards.map((card) => ({ ...card, id: makeId() })), createdAt: now, updatedAt: now }
    saveSet(copy)
  }
  const restore = async (file: File) => { try { const next = await readBackup(file); setState(next); setSelectedId(next.sets[0]?.id ?? ''); setView('library') } catch (error) { alert(error instanceof Error ? error.message : 'Could not restore backup.') } }
  const reset = () => { if (confirm('Reset your entire Open SourceED library and progress to the starter set?')) { const next = initialState(); setState(next); setSelectedId(next.sets[0].id); setView('home') } }
  let content
  if (view === 'home') content = <Home sets={state.sets} progress={state.progress} activityDates={state.activityDates} openSet={openSet} navigate={navigate} />
  else if (view === 'library') content = <LibraryView sets={state.sets} progress={state.progress} openSet={openSet} create={() => navigate('create')} />
  else if (view === 'create') content = <SetEditor initial={editing} seedCards={draft?.cards} seedTitle={draft?.title} seedSubject={draft?.subject} seedDescription={draft?.description} seedSources={draft?.sources} save={saveSet} cancel={() => setView(editing ? 'set' : 'library')} />
  else if (view === 'generate') content = <GenerateView onDraft={(result, sources) => { setDraft({ ...result, sources }); setEditing(undefined); setView('create') }} />
  else if (view === 'progress') content = <ProgressView sets={state.sets} progress={state.progress} attempts={state.attempts} activityDates={state.activityDates} backup={() => downloadBackup(state)} restore={restore} reset={reset} openSet={openSet} />
  else if (!selected) content = <LibraryView sets={state.sets} progress={state.progress} openSet={openSet} create={() => navigate('create')} />
  else if (view === 'set') content = <SetDetail set={selected} progress={state.progress[selected.id] ?? {}} navigate={navigate} edit={() => { setEditing(selected); setDraft(undefined); setView('create') }} duplicate={duplicate} remove={remove} />
  else if (view === 'cards') content = <Flashcards set={selected} back={() => setView('set')} />
  else if (view === 'learn') content = <LearnMode set={selected} progress={state.progress[selected.id] ?? {}} back={() => setView('set')} answer={answer} />
  else content = <MockTest set={selected} back={() => setView('set')} finish={finishTest} />
  return <Shell view={view} navigate={navigate}>{content}</Shell>
}
