import type { StudyCard } from '../types'

export type SpeechSegment = { text: string; lang?: string; rate?: number }

const japanesePattern = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u

export function inferSpeechLanguage(text: string) {
  if (/[぀-ヿ]/u.test(text)) return 'ja-JP'
  if (/[가-힯]/u.test(text)) return 'ko-KR'
  if (/[؀-ۿ]/u.test(text)) return 'ar-SA'
  if (/[Ѐ-ӿ]/u.test(text)) return 'ru-RU'
  if (/[Ͱ-Ͽ]/u.test(text)) return 'el-GR'
  if (/[֐-׿]/u.test(text)) return 'he-IL'
  if (/[ऀ-ॿ]/u.test(text)) return 'hi-IN'
  if (/[㐀-鿿]/u.test(text)) return 'zh-CN'
  return document.documentElement.lang || navigator.language || 'en-US'
}

export function selectSpeechVoice(language: string, voices: SpeechSynthesisVoice[]) {
  const exact = (voice: SpeechSynthesisVoice) => voice.lang.toLowerCase() === language.toLowerCase()
  const family = (voice: SpeechSynthesisVoice) => voice.lang.toLowerCase().startsWith(language.slice(0, 2).toLowerCase())
  return voices.find((voice) => exact(voice) && voice.localService)
    || voices.find(exact)
    || voices.find((voice) => family(voice) && voice.localService)
    || voices.find(family)
}

function japaneseTermReadings(term: string) {
  return term.split(/\s*[/／]\s*/u).flatMap((part) => {
    const kanaReadings = [...part.matchAll(/（([^）]*[ぁ-ゖァ-ヺー][^）]*)）/gu)].map((match) => match[1].trim())
    const spoken = kanaReadings.at(-1) || part.replace(/\s*\([^)]*\)/gu, '').replace(/^[〜～]+/u, '').trim()
    return spoken ? [spoken] : []
  })
}

function japaneseExamples(note: string) {
  return note.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}々〆ヵヶー〜、。！？「」『』・]+/gu) ?? []
}

export function cardSpeechSegments(card: Pick<StudyCard, 'term' | 'definition' | 'note'>, subject = '', side: 'term' | 'answer' | 'all' = 'all'): SpeechSegment[] {
  const japanese = /japanese/i.test(subject) || japanesePattern.test(card.term)
  if (!japanese) {
    const values = side === 'term' ? [card.term] : side === 'answer' ? [card.definition, card.note] : [card.term, card.definition, card.note]
    return values.filter(Boolean).map((text) => ({ text, lang: inferSpeechLanguage(text), rate: .95 }))
  }

  const terms = japaneseTermReadings(card.term).map((text) => ({ text, lang: 'ja-JP', rate: .8 }))
  const singleKanaCard = /^[\p{Script=Hiragana}\p{Script=Katakana}ー]$/u.test(card.term.trim())
  const romajiOnly = singleKanaCard && /^[a-zāēīōū\s-]{1,12}$/iu.test(card.definition.trim())
  const meaning: SpeechSegment[] = romajiOnly || !card.definition.trim() ? [] : [{ text: card.definition.trim(), lang: inferSpeechLanguage(card.definition), rate: .92 }]
  const existing = new Set(terms.map(({ text }) => text))
  const examples = japaneseExamples(card.note).filter((text) => !existing.has(text)).map((text) => ({ text, lang: 'ja-JP', rate: .8 }))
  if (side === 'term') return terms
  if (side === 'answer') return romajiOnly ? [...terms, ...examples] : [...meaning, ...examples]
  return [...terms, ...meaning, ...examples]
}
