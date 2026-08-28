import { LoaderCircle, Square, Volume2 } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { cancelNeuralSpeech, neuralSpeechSupported, primeNeuralSpeech, speakWithNeuralVoice, type NeuralSpeechUpdate } from '../lib/neuralSpeech'
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
  const [status, setStatus] = useState<NeuralSpeechUpdate | undefined>()
  const active = activeSpeech === id && Boolean(status)
  const browserSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
  const supported = neuralSpeechSupported() || browserSpeechSupported

  useEffect(() => {
    const update = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== id) setStatus(undefined)
    }
    window.addEventListener(SPEECH_EVENT, update)
    return () => {
      window.removeEventListener(SPEECH_EVENT, update)
      if (activeSpeech === id) {
        cancelNeuralSpeech()
        window.speechSynthesis?.cancel()
        announceSpeech('')
      }
    }
  }, [id])

  const speakWithDeviceFallback = (parts: SpeechSegment[]) => new Promise<void>((resolve, reject) => {
    if (!browserSpeechSupported) { reject(new Error('Device speech is unavailable')); return }
    window.speechSynthesis.cancel()
    window.speechSynthesis.resume?.()
    const speakPart = (index: number) => {
      if (activeSpeech !== id) { resolve(); return }
      const part = parts[index]
      const utterance = new SpeechSynthesisUtterance(part.text)
      utterance.lang = part.lang || inferSpeechLanguage(part.text)
      utterance.rate = part.rate ?? .95
      utterance.volume = 1
      utterance.onerror = () => reject(new Error('Device speech failed'))
      utterance.onend = index === parts.length - 1 ? () => resolve() : () => speakPart(index + 1)
      window.speechSynthesis.speak(utterance)
    }
    speakPart(0)
  })

  const toggle = async () => {
    if (!supported) return
    if (activeSpeech === id) {
      cancelNeuralSpeech()
      window.speechSynthesis?.cancel()
      announceSpeech('')
      return
    }
    cancelNeuralSpeech()
    window.speechSynthesis?.cancel()
    const parts = (Array.isArray(text) ? text : [text])
      .map((part) => typeof part === 'string' ? { text: part } : part)
      .map((part) => ({ ...part, text: part.text.trim() }))
      .filter((part) => part.text)
      .map((part) => ({ ...part, lang: part.lang || inferSpeechLanguage(part.text) }))
    if (!parts.length) return
    announceSpeech(id)
    setStatus({ phase: 'loading', message: 'Loading neural voice…' })
    primeNeuralSpeech()
    try {
      await speakWithNeuralVoice(parts, setStatus)
    } catch (error) {
      if (activeSpeech !== id) return
      console.warn('[Open SourcED] Neural read-aloud unavailable; using the device voice.', error)
      setStatus({ phase: 'playing', message: 'Using device voice fallback…' })
      try { await speakWithDeviceFallback(parts) } catch (fallbackError) {
        console.warn('[Open SourcED] Device read-aloud also failed.', fallbackError)
      }
    }
    if (activeSpeech === id) announceSpeech('')
  }

  const loading = active && status?.phase !== 'playing'
  const actionLabel = active ? `Stop reading. ${status?.message || ''}` : label
  return <button type="button" className={`${compact ? 'icon-button' : 'secondary'} read-aloud-button ${className}`.trim()} onClick={toggle} disabled={!supported} aria-label={actionLabel} title={supported ? actionLabel : 'Read aloud is not supported by this browser'}>
    {loading ? <LoaderCircle className="speech-spinner" size={compact ? 17 : 18} /> : active ? <Square size={compact ? 16 : 18} /> : <Volume2 size={compact ? 17 : 18} />}
    {!compact && <span>{active ? status?.message || 'Stop reading' : 'Read aloud'}</span>}
  </button>
}
