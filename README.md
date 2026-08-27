# Open SourceED

Open SourceED is an open-source, Quizlet-style learning workspace for any subject. Build a set by hand or generate an editable draft from source material, then study with flashcards, adaptive retrieval, and randomized mock tests.

**Live static app:** https://blueraddish.github.io/open-source-ed/

![Open SourceED dashboard](docs/open-source-ed-desktop.png)

## Highlights

- Multiple study sets for any topic
- Manual card editor with notes and CSV/TSV bulk import
- AI drafts grounded in pasted text, Markdown, CSV, JSON, or PDF resources
- Review-before-save workflow for generated material
- Flip-style flashcards, adaptive learning, and 4-choice mock tests
- Per-card scheduling, accuracy, mastery, streaks, and test history
- Search, duplicate, delete, and CSV export for individual sets
- JSON backup and restore for the complete local library
- Responsive, accessible UI with a local-first data model

The GitHub Pages build supports every manual and study feature. AI generation requires the included server endpoint to be deployed with an OpenAI API key; keys are never accepted or stored by the browser.

## Run locally

Use Node.js 22.13 or newer.

```bash
npm ci
copy .env.example .env
# Add your OPENAI_API_KEY to .env
npm run dev
```

The app runs through Vite and proxies `/api` requests to the local Express server on port 8787. If you do not configure a key, the rest of Open SourceED still works normally.

Quality gate:

```bash
npm run check
```

This runs lint, tests, browser TypeScript/build validation, and a separate server type-check.

## Secure AI setup

Generation uses OpenAI's Responses API with strict structured output. The server validates inputs, limits source text to 60,000 characters, and returns only a study-set schema. The default model is `gpt-5.4-mini` and can be changed with `OPENAI_MODEL`.

Never put `OPENAI_API_KEY` in frontend code or in a variable beginning with `VITE_`. Vite exposes those variables to the browser bundle.

Two supported deployments:

1. **One Vercel project:** import this repository, set `OPENAI_API_KEY` as a server environment variable, and deploy. `api/generate.ts` becomes the serverless endpoint.
2. **Static frontend + separate API:** deploy `server/index.ts` on a Node host, set `ALLOWED_ORIGIN`, and build the frontend with `VITE_AI_ENDPOINT=https://your-host/api/generate`.

The public GitHub Pages workflow intentionally has no API secret and deploys the static experience only.

## Data and privacy

Sets, card-level proficiency, streaks, and test attempts live in browser `localStorage`. Uploaded resources are extracted in the browser and are not saved with the library. Their text is sent to the configured AI endpoint only when **Generate editable cards** is pressed. Use **Progress → Export backup** before clearing browser data or switching devices.

## CSV / TSV format

One card per line:

```text
Term or question<TAB>Definition or answer<TAB>Optional note
```

Comma-separated rows are also accepted. Individual sets can be exported as CSV from the set action menu.

## Architecture

- React 19 + TypeScript + Vite
- `localStorage` persistence with versioned JSON backups
- PDF.js for browser-side PDF text extraction
- Express local API and Vercel serverless adapter
- OpenAI JavaScript SDK + Responses API structured output
- Vitest + Testing Library and Oxlint

See [DESIGN.md](DESIGN.md) for the product and interface rationale.

## License

MIT
