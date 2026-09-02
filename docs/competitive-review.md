# Competitive product review

Updated August 2026. This document is a recurring critique checklist for Open SourcED, not a claim that every hosted learning platform feature is already present.

## What learners expect now

The current individual-study baseline is broader than a flip-card interface. Quizlet describes flashcards, Learn, Match, practice tests, AI-generated study guides, and classroom assignments; Knowt describes flashcards, learn, spaced repetition, practice tests, matching, AI source conversion, and a public library; Anki centers on configurable review and account-backed collection/media sync. See the primary product documentation for [Quizlet study modes](https://help.quizlet.com/hc/en-au/articles/360030841732-Studying-on-Quizlet), [Quizlet Learn](https://help.quizlet.com/hc/en-us/articles/360030986971-Studying-with-Learn), [Knowt flashcards and modes](https://knowt.com/flashcards), [Knowt spaced repetition](https://help.knowt.com/en/articles/10714645-how-do-i-use-the-spaced-repetition-mode), and [Anki sync](https://docs.ankiweb.net/syncing.html).

## Capability audit

| Capability | Open SourcED today | Product judgment |
| --- | --- | --- |
| Manual term-definition sets | Yes: editor, notes, categories, curated choices, duplicate, archive, CSV/TSV import/export | Core parity |
| Source-to-cards generation | Yes: pasted text, Markdown, CSV, JSON, and PDF; editable draft before save | Stronger control: source-led draft review and user-owned AI quota |
| Flashcards | Yes: flip, shuffle, read aloud | Core parity |
| Adaptive/spaced review | Yes: due ordering, per-card interval, streak, and mastery | Core parity for a simple local schedule; less configurable than Anki |
| Typed recall | Yes: Write mode with transparent normalization and learner-controlled grading | Core parity with written-response modes |
| Matching game | Yes: short, timed Match rounds | Core parity for individual practice |
| Practice test | Yes: randomized four-choice tests, score review, history | Core parity for an individual multiple-choice test |
| Audio | Yes: browser-local neural read-aloud plus device fallback | Distinct privacy advantage; no speech SaaS account or quota |
| Progress | Yes: card mastery, due count, streak, category proficiency, test attempts | Strong individual visibility |
| Portability | Yes: CSV export plus full JSON backup/restore | Strong local ownership |
| Sharing | Yes: serverless, unlisted read-only links with local import | Useful without hosting, intentionally not collaborative |
| Cloud sync and accounts | No | Intentional local-first tradeoff; backup/restore is the current cross-device path |
| Searchable public library | No | Requires storage, moderation, abuse handling, and ownership rules |
| Classroom rosters, assignments, live games | No | Requires identity, real-time services, and teacher analytics |
| Diagram labeling and image/media card attachments | Not yet | Highest-value individual-learning gap |
| Custom scheduling controls | Not yet | Important advanced-learner/Anki-style gap |

## What Open SourcED does better by design

1. **No account is required for the core loop.** Sets, progress, and appearance are usable immediately in a browser.
2. **AI cost safety is architectural.** Public deployment has no shared maintainer key; free mode stops rather than falling back to paid credits; paid or BYOK use requires one explicit confirmation per request.
3. **Generation is reviewable.** AI creates an editor draft, never an invisible direct-to-library artifact.
4. **Source material stays in the learner's control.** Imports are extracted locally; external AI only receives material after a clear generation action.
5. **Speech is local.** Neural read-aloud runs in the browser after a one-time model download.
6. **Leaving is practical.** Whole-library backups, CSV, and a static hosting model avoid platform lock-in.

## Critique loop

The team should rerun this loop before large releases:

1. List the learning job a student is trying to finish—not just a feature name.
2. Check the four individual modes: recognition (Flashcards/Match), recall (Learn/Write), assessment (Mock Test), and long-term review (due schedule).
3. Test each mode with a short vocabulary set, a long textbook set, and a multilingual set.
4. Verify that a learner can understand storage, AI cost, and export consequences before they act.
5. Compare the intended change to the hosted competitors above, then preserve local-first behavior or clearly make hosting optional.
6. Add a behavior test, test the production build, and update this table and the README when the product boundary changes.

## Privacy-compatible next steps

The next improvements should improve individual learning without quietly turning the static app into a hosted data platform:

1. Local image attachments and optional diagram-label cards, stored/exported with the user’s backup.
2. Study preferences: card direction, daily new-card limit, and adjustable review intervals.
3. Printable/PDF export and a richer text/Markdown preview that remains portable.
4. Installable offline PWA support for the core non-AI study experience.
5. Optional self-hosted sync and class modules, kept separate from the zero-account static default.

The open question is not whether Open SourcED should copy every feature from Quizlet, Knowt, or Anki. It is whether a feature makes independent learning more effective while remaining transparent about ownership, costs, and privacy.
