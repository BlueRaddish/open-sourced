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
- Archive and restore finished sets without losing proficiency or test history
- JSON backup and restore for the complete local library
- Responsive, accessible UI with a local-first data model
- System, light, and dark appearance modes with four color palettes
- Zero-server, unlisted share links with read-only preview and local import
- Built-in California driver knowledge test set with 64 attributed handbook questions and a 36-question mock exam
- Five beginner Japanese sample sets for testing a realistic multi-set library

The GitHub Pages build supports the complete experience. For AI generation, each visitor connects their own OpenRouter account through OAuth and uses their own free quota. There is no shared project credit pool for strangers to drain. An optional free-only server endpoint remains available for self-hosted deployments.

AI generation is available both from the main navigation and inside **Create**. It produces a pre-filled, editable draft in the standard set editor; it never saves directly to the library. The user can revise or remove any generated card before choosing **Save set**.

## Run locally

Use Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

The app runs through Vite and starts the optional Express endpoint on port 8787. OpenRouter supports OAuth callbacks on localhost, so **Connect OpenRouter** works without a local API key. If you want a managed free-only endpoint instead, copy `.env.example` to `.env` and add `OPENROUTER_API_KEY`.

Quality gate:

```bash
npm run check
```

This runs lint, tests, browser TypeScript/build validation, and a separate server type-check.

## Free-only AI setup

Generation uses OpenRouter’s Chat Completions API with strict structured output. The browser and optional server both use `openrouter/free`, which automatically selects a compatible free model.

The browser flow uses OpenRouter OAuth with PKCE. The resulting user-controlled key is kept in `sessionStorage`, disappears when that tab session ends, and is never added to backups. Every browser request hardcodes `openrouter/free`. The optional server rejects every identifier except `openrouter/free` or one ending in `:free`. Neither path contains an OpenAI client or falls back to a paid model. When OpenRouter returns a free-tier limit or capacity error, generation stops with a clear message.

Two supported modes:

1. **Static and zero-cost:** deploy to GitHub Pages. Each visitor chooses **Connect OpenRouter** and consumes only their own free quota.
2. **Optional managed endpoint:** deploy the repository on Vercel with `OPENROUTER_API_KEY`, or host `server/index.ts` and configure `VITE_AI_ENDPOINT`. Never put the key in a `VITE_` variable.

The public GitHub Pages workflow has no API secret.

## Data and privacy

Sets, card-level proficiency, streaks, test attempts, and appearance preferences live in browser `localStorage`. This storage belongs to the current website origin and browser profile—it is not a GitHub database and does not sync between browsers or devices. The temporary OpenRouter OAuth key lives separately in tab-scoped `sessionStorage`. Uploaded resources are extracted in the browser and are not saved with the library. Their text is sent to OpenRouter only when **Generate editable cards** is pressed. Use **Settings → Export a portable backup** or **Progress → Export backup** before clearing browser data or switching devices.

The Library repeats this storage status in-product and links directly to the backup controls, so users do not need to discover the local-only model from documentation.

## Sharing without a database

Choose **Share** on a study set to create an unlisted link. A compressed, read-only copy of the set is stored in the URL fragment after `#share=`. URL fragments are decoded in the recipient’s browser and are not sent to GitHub Pages. Recipients can preview the material and save an independent copy into their own local library.

This keeps sharing free and serverless, but there is no searchable public catalog, owner-controlled updating, or usage analytics. Very large sets may be too long for a reliable link and should be exported as CSV instead.

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
- Per-user OpenRouter OAuth PKCE + free models via `fetch`
- Optional Express/Vercel free-only generation endpoint
- Vitest + Testing Library and Oxlint

See [DESIGN.md](DESIGN.md) for the product and interface rationale.

## California DMV study content

The built-in **California Driver Knowledge Test** set is adapted from the *California Driver's Handbook* (2025), California Department of Motor Vehicles. It is an independent study aid, not an official DMV practice test, and laws or procedures may change. Confirm current rules in the [official California Driver's Handbook](https://www.dmv.ca.gov/portal/handbook/california-driver-handbook/).

That handbook-derived set is distributed under CC BY-NC 4.0 rather than the application's MIT license. See [CONTENT_LICENSE.md](CONTENT_LICENSE.md) for attribution and terms.

## License

MIT
