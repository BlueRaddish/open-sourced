import type { StudySet } from '../types'

export const demoSet: StudySet = {
  id: 'demo-cell-biology',
  title: 'Cell Biology Essentials',
  subject: 'Biology',
  description: 'A compact starter set that shows how Open SourceED works.',
  color: '#f26b4e',
  sources: ['Open SourceED sample'],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  cards: [
    { id: 'cell-1', term: 'Cell membrane', definition: 'A selectively permeable barrier that controls what enters and leaves the cell.', note: 'Built mainly from a phospholipid bilayer.' },
    { id: 'cell-2', term: 'Nucleus', definition: 'The membrane-bound organelle that stores most of a eukaryotic cell’s DNA.', note: 'It also coordinates gene expression.' },
    { id: 'cell-3', term: 'Mitochondrion', definition: 'An organelle that produces most cellular ATP through aerobic respiration.', note: 'Often called the powerhouse of the cell.' },
    { id: 'cell-4', term: 'Ribosome', definition: 'A molecular machine that builds proteins by translating messenger RNA.', note: 'Found free in cytoplasm or attached to rough ER.' },
    { id: 'cell-5', term: 'Osmosis', definition: 'The passive movement of water across a selectively permeable membrane.', note: 'Water moves toward the side with more dissolved solute.' },
    { id: 'cell-6', term: 'Prokaryote', definition: 'An organism whose cells lack a nucleus and other membrane-bound organelles.', note: 'Bacteria and archaea are prokaryotes.' },
    { id: 'cell-7', term: 'Eukaryote', definition: 'An organism whose cells contain a nucleus and membrane-bound organelles.', note: 'Animals, plants, fungi, and protists are eukaryotes.' },
    { id: 'cell-8', term: 'Homeostasis', definition: 'The regulation of internal conditions to maintain a stable, functional state.', note: 'Cells use feedback and membrane transport to maintain it.' },
  ],
}
