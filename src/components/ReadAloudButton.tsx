import { Square, Volume2 } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { inferSpeechLanguage, type SpeechSegment } from '../lib/speech'

const SPEECH_EVENT = 'open-sourced:speech-change'
let activeSpeech = ''

function announceSpeech(id: string) {
  activeSpeech = id
  window.dispatchEvent(new CustomEvent(SPEECH_EVENT, { detail: id }))
}

type Props = {
  text: string | Array<string | SpeechSegment>
  label: string
  compact?: boolean
  className?: string
}

export function ReadAloudButton({ text, label, compact = false, className = '' }: Props) {
  const id = useId()
  const [speaking, setSpeaking] = useState(false)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

  useEffect(() => {
    const update = (event: Event) => setSpeaking((event as CustomEvent<string>).detail === id)
    window.addEventListener(SPEECH_EVENT, update)
    return () => {
      window.removeEventListener(SPEECH_EVENT, update)
      if (activeSpeech === id && supported && window.speechSynthesis) {
        window.speechSynthesis.cancel()
        announceSpeech('')
      }
    }
  }, [id, supported])

  const toggle = () => {
    if (!supported) return
    if (speaking) {
      window.speechSynthesis.cancel()
      announceSpeech('')
      return
    }
    window.speechSynthesis.cancel()
    const parts = (Array.isArray(text) ? text : [text]).map((part) => typeof part === 'string' ? { text: part } : part).map((part) => ({ ...part, text: part.text.trim() })).filter((part) => part.text)
    if (!parts.length) return
    announceSpeech(id)
    window.speechSynthesis.resume?.()
    const speakPart = (index: number) => {
      if (activeSpeech !== id) return
      const part = parts[index]
      const utterance = new SpeechSynthesisUtterance(part.text)
      utterance.lang = part.lang || inferSpeechLanguage(part.text)
      utterance.rate = part.rate ?? .95
      utterance.volume = 1
      const finish = () => { if (activeSpeech === id) announceSpeech('') }
      utterance.onerror = finish
      utterance.onend = index === parts.length - 1 ? finish : () => speakPart(index + 1)
      window.speechSynthesis.speak(utterance)
    }
    speakPart(0)
  }

  const actionLabel = speaking ? 'Stop reading' : label
  return <button type="button" className={`${compact ? 'icon-button' : 'secondary'} read-aloud-button ${className}`.trim()} onClick={toggle} disabled={!supported} aria-label={actionLabel} title={supported ? actionLabel : 'Read aloud is not supported by this browser'}>
    {speaking ? <Square size={compact ? 16 : 18} /> : <Volume2 size={compact ? 17 : 18} />}
    {!compact && <span>{speaking ? 'Stop reading' : 'Read aloud'}</span>}
  </button>
}
