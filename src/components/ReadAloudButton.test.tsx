import { fireEvent, render, screen } from '@testing-library/react'
import { cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { inferSpeechLanguage } from '../lib/speech'
import { ReadAloudButton } from './ReadAloudButton'

class MockUtterance {
  text: string
  lang = ''
  rate = 1
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
    vi.stubGlobal('speechSynthesis', { speak, cancel })
    vi.stubGlobal('SpeechSynthesisUtterance', MockUtterance)
    render(<ReadAloudButton text={['こんにちは', 'Hello']} label="Read greeting aloud" />)
    fireEvent.click(screen.getByRole('button', { name: 'Read greeting aloud' }))
    expect(cancel).toHaveBeenCalledOnce()
    expect(speak).toHaveBeenCalledTimes(2)
    expect(speak.mock.calls[0][0]).toMatchObject({ text: 'こんにちは', lang: 'ja-JP', rate: .95 })
    expect(speak.mock.calls[1][0]).toMatchObject({ text: 'Hello', lang: 'en-US', rate: .95 })
    fireEvent.click(screen.getByRole('button', { name: 'Stop reading' }))
    expect(cancel).toHaveBeenCalledTimes(2)
  })

  it('detects common writing systems and falls back to the page language', () => {
    expect(inferSpeechLanguage('日本語（にほんご）')).toBe('ja-JP')
    expect(inferSpeechLanguage('안녕하세요')).toBe('ko-KR')
    expect(inferSpeechLanguage('مرحبا')).toBe('ar-SA')
    expect(inferSpeechLanguage('Biology')).toBe('en-US')
  })
})
