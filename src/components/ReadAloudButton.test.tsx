import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { japaneseSets } from '../data/japanese'
import { cardSpeechSegments, inferSpeechLanguage } from '../lib/speech'
import { ReadAloudButton } from './ReadAloudButton'

class MockUtterance {
  text: string
  lang = ''
  rate = 1
  volume = 1
  voice: SpeechSynthesisVoice | null = null
  onend: (() => void) | null = null
  onerror: (() => void) | null = null

  constructor(text: string) {
    this.text = text
  }
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('read aloud', () => {
  it('falls back to full-volume device speech for a language outside the neural model', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const speak = vi.fn()
    const cancel = vi.fn()
    const resume = vi.fn()
    vi.stubGlobal('speechSynthesis', { speak, cancel, resume })
    vi.stubGlobal('SpeechSynthesisUtterance', MockUtterance)

    render(<ReadAloudButton text={['안녕하세요', 'Hello']} label="Read greeting aloud" />)
    fireEvent.click(screen.getByRole('button', { name: 'Read greeting aloud' }))

    await waitFor(() => expect(speak).toHaveBeenCalledOnce())
    expect(speak.mock.calls[0][0]).toMatchObject({ text: '안녕하세요', lang: 'ko-KR', rate: .95, volume: 1, voice: null })
    act(() => speak.mock.calls[0][0].onend?.())
    expect(speak).toHaveBeenCalledTimes(2)
    expect(speak.mock.calls[1][0]).toMatchObject({ text: 'Hello', lang: 'en-US', rate: .95, volume: 1, voice: null })
    await act(async () => speak.mock.calls[1][0].onend?.())
    expect(cancel).toHaveBeenCalledTimes(2)
    expect(resume).toHaveBeenCalledOnce()
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

  it('uses kana readings for kanji vocabulary and keeps English meanings separate', () => {
    const card = { term: '人（ひと）', definition: 'person', note: '人 can also be read じん or にん in compounds.' }
    expect(cardSpeechSegments(card, 'Japanese').slice(0, 2)).toEqual([
      { text: 'ひと', lang: 'ja-JP', rate: .8 },
      { text: 'person', lang: 'en-US', rate: .92 },
    ])
  })

  it('routes every built-in Japanese term through Japanese speech', () => {
    for (const set of japaneseSets) {
      for (const card of set.cards) {
        const terms = cardSpeechSegments(card, set.subject, 'term')
        expect(terms.length, card.term).toBeGreaterThan(0)
        expect(terms.every(({ lang }) => lang === 'ja-JP'), card.term).toBe(true)
      }
    }
  })

  it('uses a study set subject to select supported Latin-script languages', () => {
    const card = { term: 'buenos días', definition: 'good morning', note: '' }
    expect(cardSpeechSegments(card, 'Beginner Spanish', 'all')).toEqual([
      { text: 'buenos días', lang: 'es-ES', rate: .95 },
      { text: 'good morning', lang: 'en-US', rate: .95 },
    ])
  })
})
