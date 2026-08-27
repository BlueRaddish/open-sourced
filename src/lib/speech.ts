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
