# Open SourcED

Open SourcED is an open-source, Quizlet-style learning workspace for any subject. Build a set by hand or generate an editable draft from source material, then study with flashcards, adaptive retrieval, and randomized mock tests.

**Live static app:** https://blueraddish.github.io/open-sourced/

![Open SourcED dashboard](docs/open-source-ed-desktop.png)

## Highlights

- Multiple study sets for any topic
- Manual card editor with notes and CSV/TSV bulk import
- AI drafts grounded in pasted text, Markdown, CSV, JSON, or PDF resources
- Five editable generation presets plus custom author instructions
- Source-led card count and learning level, with an optional exact-count override
- Free generation by default, with opt-in GPT, Claude, and Gemini model choices
- Review-before-save workflow for generated material
- Flip-style flashcards, adaptive learning, and 4-choice mock tests
- Browser-local neural read-aloud for either flashcard side and every term in a set
- Per-card scheduling, accuracy, mastery, streaks, and test history
- Search, duplicate, delete, and CSV export for individual sets
- Archive and restore finished sets without losing proficiency or test history
- JSON backup and restore for the complete local library
- Responsive, accessible UI with a local-first data model
- System, light, and dark appearance modes with four color palettes
- Zero-server, unlisted share links with read-only preview and local import
- Built-in California driver knowledge test set with 64 attributed handbook questions and a 36-question mock exam
- Five beginner Japanese sample sets for testing a realistic multi-set library

The GitHub Pages build supports the complete experience. For AI generation, each visitor connects their own OpenRouter account through OAuth. Free generation is the default; visitors may explicitly choose a current GPT, Claude, or Gemini model that uses only their connected OpenRouter balance or provider keys. There is no shared project credit pool for strangers to drain. An optional free-only server endpoint remains available for self-hosted deployments.

AI generation is available both from the main navigation and inside **Create**. It produces a pre-filled, editable draft in the standard set editor; it never saves directly to the library. The user can revise or remove any generated card before choosing **Save set**.

Card count and learning level are source-led by default. With the optional exact-count field blank, the model chooses as many useful cards as the material needs without padding or duplication and infers the appropriate depth and terminology from the resource. Entering a whole number from 2–100 requests that exact number instead.

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

## AI providers and cost safety

Generation uses OpenRouter’s Chat Completions API with strict structured output. The model catalog is loaded from OpenRouter at runtime so the interface does not promise stale GPT, Claude, or Gemini versions. Only text models that advertise structured-output support appear.

The browser flow uses OpenRouter OAuth with PKCE. The resulting user-controlled key is kept in `sessionStorage`, disappears when that tab session ends, and is never added to backups. Open SourcED never asks for a raw OpenAI, Anthropic, or Google API key. Visitors who have provider API access can add those keys in [OpenRouter BYOK settings](https://openrouter.ai/workspaces/default/byok), where OpenRouter encrypts and routes them. This does not connect consumer ChatGPT, Claude, or Gemini subscriptions.

Free mode always requests `openrouter/free`. If free capacity or quota is exhausted, it stops without selecting a paid model. Paid/BYOK choices require a visitor-owned OpenRouter connection and an unchecked-by-default confirmation for each generation; the confirmation clears after the request. Published input and output rates are shown beside the selected model. If a BYOK user never wants OpenRouter credit fallback, they should enable **Never use shared capacity** in OpenRouter’s BYOK settings.

All browser AI requests require structured output and set OpenRouter provider routing to deny data-collecting providers. Uploaded text and editable author directions are sent only after **Generate editable cards** is pressed. Directions are separated from source material in the prompt and cannot override source grounding, safety, exact card count, or the response schema.

The optional managed endpoint remains deliberately free-only. It rejects every model identifier except `openrouter/free` or one ending in `:free`, and also stops on free-tier limits rather than using paid credits.

Two supported modes:

1. **Static and zero-cost to the maintainer:** deploy to GitHub Pages. Each visitor chooses **Connect OpenRouter** and uses only their own free, paid, or BYOK quota.
2. **Optional managed endpoint:** deploy the repository on Vercel with `OPENROUTER_API_KEY`, or host `server/index.ts` and configure `VITE_AI_ENDPOINT`. Never put the key in a `VITE_` variable.

The public GitHub Pages workflow has no API secret.

## Suggest a generation style

The built-in generation presets are community-editable starting points, not permanent prompt rules. If a wording change or a new niche preset would produce better study material, [open a GitHub issue](https://github.com/BlueRaddish/open-sourced/issues/new) with the use case, what the current preset misses, and the prompt wording you suggest. A small non-sensitive example source and expected card style are especially helpful.

## Data and privacy

Sets, card-level proficiency, streaks, test attempts, and appearance preferences live in browser `localStorage`. This storage belongs to the current website origin and browser profile—it is not a GitHub database and does not sync between browsers or devices. The temporary OpenRouter OAuth key lives separately in tab-scoped `sessionStorage`. Uploaded resources are extracted in the browser and are not saved with the library. Their text is sent to OpenRouter only when **Generate editable cards** is pressed. Use **Settings → Export a portable backup** or **Progress → Export backup** before clearing browser data or switching devices.

Read-aloud uses the MIT-licensed [Piper Plus](https://github.com/ayutaz/piper-plus) multilingual neural speech engine by default. On first use, the browser downloads the roughly 40 MB Tsukuyomi-chan model plus the WebAssembly speech engine and caches the model in IndexedDB; later uses reuse that local copy. Synthesis runs in the browser, card text is not sent to an Open SourcED audio server, and no account, API key, quota, or usage credits are involved. Japanese study cards request `ja-JP`, use kana readings supplied for kanji, separate Japanese examples from English meanings, and avoid reading short romaji glosses as English letters. The device’s built-in speech synthesis remains only as an automatic fallback if the neural engine cannot load or a language is unsupported.

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
- Piper Plus + ONNX Runtime Web for browser-local multilingual neural speech
- PDF.js for browser-side PDF text extraction
- Express local API and Vercel serverless adapter
- Per-user OpenRouter OAuth PKCE + live GPT, Claude, Gemini, and free model catalog via `fetch`
- Optional Express/Vercel free-only generation endpoint
- Vitest + Testing Library and Oxlint

See [DESIGN.md](DESIGN.md) for the product and interface rationale.

## California DMV study content

The built-in **California Driver Knowledge Test** set is adapted from the *California Driver's Handbook* (2025), California Department of Motor Vehicles. It is an independent study aid, not an official DMV practice test, and laws or procedures may change. Confirm current rules in the [official California Driver's Handbook](https://www.dmv.ca.gov/portal/handbook/california-driver-handbook/).

That handbook-derived set is distributed under CC BY-NC 4.0 rather than the application's MIT license. See [CONTENT_LICENSE.md](CONTENT_LICENSE.md) for attribution and terms.

## License

MIT
