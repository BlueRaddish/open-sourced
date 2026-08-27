export type GenerationPreset = {
  id: string
  label: string
  description: string
  instructions: string
}

export const generationPresets: GenerationPreset[] = [
  {
    id: 'balanced',
    label: 'Balanced study',
    description: 'Definitions, relationships, and useful applications.',
    instructions: 'Create a balanced mix of core definitions, relationships between ideas, and short application questions. Cover the resource broadly without repeating the same fact.',
  },
  {
    id: 'exam',
    label: 'Exam prep',
    description: 'Testable distinctions, traps, and precise recall.',
    instructions: 'Prioritize likely testable facts, easily confused distinctions, exceptions, formulas, thresholds, and common mistakes. Phrase prompts like realistic exam questions when the source supports them.',
  },
  {
    id: 'language',
    label: 'Language learning',
    description: 'Vocabulary, natural usage, and example sentences.',
    instructions: 'Prioritize useful vocabulary and natural usage. Put the target-language expression in the prompt, a concise meaning in the answer, and pronunciation, register, or a short source-supported example in the note.',
  },
  {
    id: 'concepts',
    label: 'Concept mastery',
    description: 'Why, how, comparisons, and misconceptions.',
    instructions: 'Emphasize why and how ideas work, causal relationships, comparisons, and common misconceptions. Prefer prompts that require explanation over isolated fact recall.',
  },
  {
    id: 'rapid',
    label: 'Rapid recall',
    description: 'Short, atomic cards for quick review.',
    instructions: 'Make every card atomic and fast to answer. Use short prompts, one fact per card, concise answers, and notes only when they prevent a likely misunderstanding.',
  },
]
