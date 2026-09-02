# Open SourcED

**An open-source, local-first Quizlet alternative for private flashcards, spaced repetition, AI-assisted study sets, and mock tests.**

Open SourcED turns notes and source material into an editable study set, then helps learners retrieve, write, match, and test their way to durable knowledge. It is built for people who want a polished learning tool without giving up ownership of their library, progress, or AI budget.

[Try the live app](https://blueraddish.github.io/open-sourced/) · [Read the competitive product review](docs/competitive-review.md) · [Suggest an improvement](https://github.com/BlueRaddish/open-sourced/issues/new)

![Open SourcED dashboard](docs/open-source-ed-desktop.png)

## Why Open SourcED

Most study apps make a trade: convenience in exchange for an account, a hosted library, advertising, subscription limits, or opaque AI usage. Open SourcED is designed around a different default.

| What matters | Open SourcED approach |
| --- | --- |
| Your library | Sets, proficiency, attempts, and preferences stay in your browser by default. Export one portable JSON backup whenever you want. |
| Your AI budget | The maintainer has no shared credit pool to drain. Visitors use their own OpenRouter free quota, credits, or BYOK provider keys only after explicit confirmation. |
| Your source material | AI generation begins with the material you provide, produces an editable draft, and never silently saves it. |
| Your study loop | Flashcards, adaptive Learn, typed Write, timed Match, and randomized Mock Test all work without an account. |
| Your accessibility | Browser-local multilingual neural read-aloud supports study without relying solely on installed system voices. |
| Your ability to leave | CSV export, JSON backup/restore, and unlisted serverless share links keep the library portable. |

This makes Open SourcED especially useful as a privacy-respecting flashcard app, a no-subscription Quizlet alternative for individual learners, and an open-source base for schools or communities that want to self-host.

## Study modes

- **Flashcards** — flip through a complete set, shuffle it, and read either side aloud.
- **Learn** — adaptive active recall; difficult cards return sooner and correct retrieval extends the interval.
- **Write** — type an answer from memory, compare it transparently, and choose the final grade when wording can vary.
- **Match** — fast, timed rounds of up to eight term-definition pairs for recognition practice.
- **Mock Test** — randomized four-choice questions, answer review, score history, and per-card proficiency updates.

Every mode contributes to visible card-level progress. The Home dashboard shows due cards, mastery, and streaks; each set shows its own mastery and, where applicable, category-level proficiency.

## Create study sets your way

### Manual, bulk, or AI-assisted

- Build cards in the editor with a term, definition, optional note, category, and curated test choices.
- Paste or import CSV/TSV rows for fast migration from spreadsheets and other flashcard tools.
- Generate an **editable** draft from pasted text, Markdown, CSV, JSON, or PDF resources.
- Choose a generation preset or add custom author instructions for a subject, learner, or exam style.
- Leave card count blank to let the source determine useful coverage, or request an exact count from 2–100 cards.

AI output always returns to the same editor used for manual sets. Nothing reaches the library until the learner reviews and saves it.

### AI without surprise costs

The public GitHub Pages app has no project API key. Each visitor can connect OpenRouter through OAuth with PKCE and use:

- `openrouter/free` by default;
- an explicitly selected paid model; or
- their own GPT, Claude, or Gemini provider key through OpenRouter BYOK.

Free generation stops when free capacity is unavailable. Paid/BYOK generation requires an unchecked-by-default confirmation every time, and the model’s published input/output rates are visible before requesting it. Open SourcED never asks for a raw OpenAI, Anthropic, or Google key, and it cannot use a consumer ChatGPT, Claude, or Gemini subscription as an API key.

## Privacy, storage, and sharing

Open SourcED is local-first, not cloud-first:

- Study data lives in the current browser profile under this site’s `localStorage` origin.
- AI connection state is tab-scoped `sessionStorage`, excluded from backups, and disappears when the tab session ends.
- Imported source text is extracted in the browser and is not saved with the study library.
- Source text and custom instructions are sent to the selected AI provider only after **Generate editable cards** is pressed.
- **Export backup** and **Restore backup** move a whole library between browsers or devices manually.

Choose **Share** to create an unlisted, read-only URL containing a compressed copy of one set in its URL fragment. Recipients can preview it and save an independent local copy. This is free and serverless, but it is deliberately not a searchable public catalog and does not sync edits or progress.

### Browser-local read-aloud

Read-aloud uses the MIT-licensed [Piper Plus](https://github.com/ayutaz/piper-plus) multilingual neural speech engine by default. First use downloads the voice model and WebAssembly speech engine into the browser cache; later use reuses that local copy. Text is synthesized locally—no audio account, speech API key, quota, or Open SourcED audio server is involved.

Japanese cards receive extra handling: kana readings supplied in parentheses are preferred for kanji vocabulary, Japanese examples stay separate from English glosses, and short romaji clues are not read as English letter names. The built-in device voice is retained only as an automatic fallback when neural speech cannot load or a language is not supported.

## Where it compares—and where it intentionally differs

Open SourcED now matches the core individual-study workflow found in established flashcard tools: manual sets, resource-to-cards generation, flashcards, adaptive review, typed recall, matching, testing, audio, import/export, and progress. Its strongest added value is local ownership, inspectable AI cost boundaries, mandatory draft review, and serverless sharing.

It does **not** claim to replace hosted features that need a database and ongoing operations: account sync, a searchable public catalog, shared live games, classroom rosters/assignments, grading dashboards, rich diagram labeling, or hosted image/media libraries. Those are intentional tradeoffs for a zero-cost static deployment. The [competitive review](docs/competitive-review.md) documents the current boundary and the next privacy-compatible improvements.

## Run locally

Use Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

The Vite app runs with an optional Express endpoint on port 8787. OpenRouter OAuth callbacks work on localhost. To use a managed free-only endpoint, copy `.env.example` to `.env` and add `OPENROUTER_API_KEY`—never put that key in a `VITE_` variable.

Quality gate:

```bash
npm run check
```

This runs linting, the component/unit suite, browser TypeScript/build validation, and a separate server type-check.

## Optional self-hosted generation endpoint

The static app is the recommended default: it costs the maintainer nothing and uses each visitor’s own OpenRouter connection. For a managed deployment, use the Express server or Vercel adapter with `OPENROUTER_API_KEY` and configure `VITE_AI_ENDPOINT`.

The included managed endpoint is intentionally free-only. It rejects paid model IDs and stops on free-tier limits rather than falling through to billed credits.

## Community and contributions

Generation presets are editable starting points, not permanent prompt rules. If a new preset or wording change would create better study material, [open an issue](https://github.com/BlueRaddish/open-sourced/issues/new) with the learner/use case, what the current prompt misses, suggested wording, and a small non-sensitive example if possible.

Feature ideas, accessibility feedback, study-method improvements, and self-hosting contributions are welcome. Before proposing a cloud feature, please consider whether it can preserve the project’s local-first default or be offered as an optional self-hosted path.

## Architecture

- React 19 + TypeScript + Vite
- `localStorage` persistence with versioned JSON backups
- Adaptive scheduling and card-level mastery in browser code
- Piper Plus + ONNX Runtime Web for browser-local multilingual neural speech
- PDF.js for browser-side PDF text extraction
- Per-user OpenRouter OAuth PKCE with a live GPT, Claude, Gemini, and free-model catalog
- Optional Express/Vercel free-only generation endpoint
- Vitest, Testing Library, Oxlint, and GitHub Pages deployment

## California DMV study content

The built-in **California Driver Knowledge Test** set is adapted from the *California Driver's Handbook* (2025), California Department of Motor Vehicles. It is an independent study aid, not an official DMV practice test. Confirm current rules in the [official handbook](https://www.dmv.ca.gov/portal/handbook/california-driver-handbook/).

That handbook-derived set is distributed under CC BY-NC 4.0 rather than the application’s MIT license. See [CONTENT_LICENSE.md](CONTENT_LICENSE.md) for attribution and terms.

## License

[MIT](LICENSE)
