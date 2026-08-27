import { Check, CloudOff, Database, Download, Laptop, Moon, Palette, Sun } from 'lucide-react'
import type { ColorPalette, Preferences, ThemeMode } from '../types'

type Props = { preferences: Preferences; update: (preferences: Preferences) => void; backup: () => void }

const themes: { id: ThemeMode; label: string; detail: string; icon: typeof Sun }[] = [
  { id: 'system', label: 'System', detail: 'Follow this device', icon: Laptop },
  { id: 'light', label: 'Light', detail: 'Warm and bright', icon: Sun },
  { id: 'dark', label: 'Dark', detail: 'Easy on the eyes', icon: Moon },
]

const palettes: { id: ColorPalette; label: string; colors: string[] }[] = [
  { id: 'poppy', label: 'Poppy', colors: ['#f26b4e', '#166b68', '#e7a43b'] },
  { id: 'ocean', label: 'Ocean', colors: ['#3288b8', '#18556f', '#52a79c'] },
  { id: 'violet', label: 'Violet', colors: ['#8062b6', '#51437d', '#d39358'] },
  { id: 'forest', label: 'Forest', colors: ['#4f8a63', '#245c51', '#ce9042'] },
]

export function SettingsView({ preferences, update, backup }: Props) {
  return <section className="page-width page-section settings-page">
    <div className="page-title"><div><span className="kicker">Make it yours</span><h1>Settings</h1><p>Choose how Open SourceED looks and see exactly where your learning data lives.</p></div></div>
    <div className="settings-layout"><div className="settings-main">
      <article className="settings-card"><div className="settings-title"><Palette /><div><h2>Appearance</h2><p>Changes apply immediately and are included in your backup.</p></div></div>
        <fieldset className="setting-field"><legend>Brightness</legend><div className="theme-options">{themes.map(({ id, label, detail, icon: Icon }) => <button key={id} className={preferences.theme === id ? 'selected' : ''} onClick={() => update({ ...preferences, theme: id })}><Icon /><span><b>{label}</b><small>{detail}</small></span>{preferences.theme === id && <Check className="option-check" />}</button>)}</div></fieldset>
        <fieldset className="setting-field"><legend>Color palette</legend><div className="palette-options">{palettes.map(({ id, label, colors }) => <button key={id} className={preferences.palette === id ? 'selected' : ''} onClick={() => update({ ...preferences, palette: id })}><span className="palette-swatches">{colors.map((color) => <i key={color} style={{ background: color }} />)}</span><b>{label}</b>{preferences.palette === id && <Check className="option-check" />}</button>)}</div></fieldset>
      </article>
    </div><aside className="storage-card"><Database /><span className="kicker">Storage</span><h2>Local to this browser</h2><p>Your sets, answers, proficiency, test history, and appearance preferences are saved in this browser profile using local storage.</p><div className="storage-fact"><Laptop /><div><b>This device and browser</b><span>No automatic access from another device or browser profile.</span></div></div><div className="storage-fact"><CloudOff /><div><b>Not stored in GitHub</b><span>GitHub hosts the application code, not your personal study library.</span></div></div><button className="secondary" onClick={backup}><Download /> Export a portable backup</button><small>Restore that JSON file from Progress on another browser to move your library manually.</small></aside></div>
  </section>
}
