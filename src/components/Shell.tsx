import { BarChart3, BookOpen, House, Library, Menu, Plus, Settings, Sparkles, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { View } from '../types'

type Props = { view: View; navigate: (view: View) => void; children: ReactNode }

const nav = [
  { view: 'home' as View, label: 'Home', icon: House },
  { view: 'library' as View, label: 'Library', icon: Library },
  { view: 'create' as View, label: 'Create', icon: Plus },
  { view: 'generate' as View, label: 'Generate', icon: Sparkles },
  { view: 'progress' as View, label: 'Progress', icon: BarChart3 },
  { view: 'settings' as View, label: 'Settings', icon: Settings },
]

export function Shell({ view, navigate, children }: Props) {
  const [open, setOpen] = useState(false)
  const go = (next: View) => { navigate(next); setOpen(false) }
  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => go('home')} aria-label="Open SourcED home">
        <span className="brand-mark"><BookOpen size={21} /></span>
        <span>Open Sourc<span>ED</span></span>
      </button>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {nav.map(({ view: item, label, icon: Icon }) => <button key={item} className={view === item ? 'active' : ''} onClick={() => go(item)}><Icon size={17} />{label}</button>)}
      </nav>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
    </header>
    {open && <nav className="mobile-nav" aria-label="Mobile navigation">{nav.map(({ view: item, label, icon: Icon }) => <button key={item} className={view === item ? 'active' : ''} onClick={() => go(item)}><Icon size={18} />{label}</button>)}</nav>}
    <main>{children}</main>
    <footer><div className="brand mini"><span className="brand-mark"><BookOpen size={16} /></span><span>Open Sourc<span>ED</span></span></div><p>Your learning stays in your browser.</p><a href="https://github.com/BlueRaddish/open-sourced">Open source on GitHub</a></footer>
  </div>
}
