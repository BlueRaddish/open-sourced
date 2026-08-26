import type { StudyCard } from '../types'
import { makeId } from './study'

export function parseDelimited(text: string): StudyCard[] {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const delimiter = line.includes('\t') ? '\t' : ','
    const [term = '', definition = '', note = ''] = line.split(delimiter).map((part) => part.trim().replace(/^"|"$/g, ''))
    return { id: makeId(), term, definition, note }
  }).filter((card) => card.term && card.definition)
}

export async function extractFile(file: File): Promise<string> {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    const pdfjs = await import('pdfjs-dist')
    const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default
    const document = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
    const pages: string[] = []
    for (let index = 1; index <= document.numPages; index += 1) {
      const page = await document.getPage(index)
      const content = await page.getTextContent()
      pages.push(content.items.map((item) => 'str' in item ? item.str : '').join(' '))
    }
    return pages.join('\n\n')
  }
  return file.text()
}

export function exportSet(title: string, cards: StudyCard[]) {
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`
  const csv = ['Term,Definition,Note', ...cards.map((card) => [card.term, card.definition, card.note].map(escape).join(','))].join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'study-set'}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}
