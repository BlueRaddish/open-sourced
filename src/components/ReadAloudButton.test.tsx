import { fireEvent, render, screen } from '@testing-library/react'
import { cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cardSpeechSegments, inferSpeechLanguage } from '../lib/speech'
import { ReadAloudButton } from './ReadAloudButton'

class MockUtterance {
  text: string
  lang = ''
  rate = 1
  voice: SpeechSynthesisVoice | null = null
  onend: (() => void) | null = null
  onerror: (() => void) | null = null

  constructor(text: string) {
    this.text = text
  }
}

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('read aloud', () => {
  it('queues each card part with a language-appropriate browser voice', () => {
    const speak = vi.fn()
    const cancel = vi.fn()
    const japaneseVoice = { default: false, lang: 'ja-JP', localService: true, name: 'Japanese', voiceURI: 'Japanese' } as SpeechSynthesisVoice
    const englishVoice = { default: true, lang: 'en-US', localService: true, name: 'English', voiceURI: 'English' } as SpeechSynthesisVoice
    vi.stubGlobal('speechSynthesis', { speak, cancel, getVoices: () => [englishVoice, japaneseVoice] })
    vi.stubGlobal('SpeechSynthesisUtterance', MockUtterance)
    render(<ReadAloudButton text={['こんにちは', 'Hello']} label="Read greeting aloud" />)
    fireEvent.click(screen.getByRole('button', { name: 'Read greeting aloud' }))
    expect(cancel).toHaveBeenCalledOnce()
    expect(speak).toHaveBeenCalledTimes(2)
    expect(speak.mock.calls[0][0]).toMatchObject({ text: 'こんにちは', lang: 'ja-JP', rate: .95, voice: japaneseVoice })
    expect(speak.mock.calls[1][0]).toMatchObject({ text: 'Hello', lang: 'en-US', rate: .95, voice: englishVoice })
    fireEvent.click(screen.getByRole('button', { name: 'Stop reading' }))
    expect(cancel).toHaveBeenCalledTimes(2)
  })

  it('detects common writing systems and falls back to the page language', () => {
    expect(inferSpeechLanguage('日本語（にほんご）')).toBe('ja-JP')
    expect(inferSpeechLanguage('안녕하세요')).toBe('ko-KR')
    expect(inferSpeechLanguage('مرحبا')).toBe('ar-SA')
    expect(inferSpeechLanguage('Biology')).toBe('en-US')
  })

  it('builds a Japanese-learning sequence without reading romaji as English', () => {
    const card = { term: 'あ', definition: 'a', note: 'あさ (asa) — morning' }
    expect(cardSpeechSegments(card, 'Japanese')).toEqual([
      { text: 'あ', lang: 'ja-JP', rate: .8 },
      { text: 'あさ', lang: 'ja-JP', rate: .8 },
    ])
    expect(cardSpeechSegments(card, 'Japanese', 'answer')).toEqual([
      { text: 'あ', lang: 'ja-JP', rate: .8 },
      { text: 'あさ', lang: 'ja-JP', rate: .8 },
    ])
  })

  it('uses kana readings for kanji vocabulary and keeps the English meaning separate', () => {
    const card = { term: '人（ひと）', definition: 'person', note: '人 can also be read じん or にん in compounds.' }
    expect(cardSpeechSegments(card, 'Japanese').slice(0, 2)).toEqual([
      { text: 'ひと', lang: 'ja-JP', rate: .8 },
      { text: 'person', lang: 'en-US', rate: .92 },
    ])
  })
})
