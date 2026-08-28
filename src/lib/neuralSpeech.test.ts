import { describe, expect, it } from 'vitest'
import { neuralLanguage, neuralLengthScale } from './neuralSpeech'

describe('neural speech helpers', () => {
  it('maps supported locales to the multilingual model language codes', () => {
    expect(neuralLanguage('ja-JP')).toBe('ja')
    expect(neuralLanguage('es-ES')).toBe('es')
    expect(neuralLanguage('pt-BR')).toBe('pt')
    expect(neuralLanguage('ko-KR')).toBeUndefined()
  })

  it('converts speaking rate to a bounded Piper length scale', () => {
    expect(neuralLengthScale(1)).toBe(1)
    expect(neuralLengthScale(.8)).toBe(1.25)
    expect(neuralLengthScale(10)).toBe(.7)
  })
})
