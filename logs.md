# Project history

## 2026-10-31

- Summary: Added the first functional MP report-card UI for the reviewed Delhi snapshot.
- Areas: `app/`, `lib/data.ts`, `package.json`, test scripts.
- Validation: 58 Jest tests, TypeScript typecheck, and snapshot validation pass.
- Caveat: MPLADS and affidavit enrichment remain pending in the source snapshot; AI summary and draft-letter routes are not yet implemented.

- Summary: Added template-grounded summary and action APIs with client controls.
- Areas: `app/api/`, `app/mp/[slug]/actions.tsx`, `lib/actions.ts`.
- Validation: API inputs use fixed language/intent enums; generated text uses only snapshot facts and keeps a template fallback.
- Caveat: No external LLM is enabled yet; responses are intentionally marked `source: "template"`.

- Summary: Added a `MP_DATA_MODE=test` switch and `dev:test` command for running the UI against the deterministic synthetic snapshot.
- Areas: `lib/data.ts`, `package.json`, `data/processed/mps.test.json`.
- Validation: Test snapshot regenerated; home, health, and a synthetic MP route returned HTTP 200.
- Caveat: Test records are fictional and must never be published as real civic data.

- Summary: Implemented feature-catalogue discovery, trust, comparison, and detail surfaces.
- Areas: state/constituency picker, typo-tolerant search, test banner, comparison bars, trends/history, MPLADS/works/bills, compare/state routes, search index, glossary, sharing, and issue reporting.
- Validation: TypeScript, ESLint, Jest, and production build pass.
- Caveat: GPS/location, boundary map, affidavit enrichment, MP chat, Meko trail, and external Gemini integration remain data/service dependent.

- Summary: Added synthetic boundary map and browser-only location lookup, affidavit display, dark mode, PWA shell, public JSON/CSV downloads, and print reports.
- Areas: `app/map.tsx`, `lib/boundaries.ts`, `app/manifest.ts`, `public/sw.js`, `app/api/data/`, MP detail components.
- Validation: TypeScript, ESLint, Jest, production build, and synthetic runtime smoke tests pass.
- Caveat: Real boundary data is not present; location/map are intentionally available only in test mode. Affidavit values remain pending in the real snapshot.

- Summary: Added Hindi interface labels, browser speech playback, snapshot-only MP chat, Gemini-ready summary integration, test-only pincode/contact endpoints and UI, and expanded offline cache.
- Areas: `lib/actions.ts`, `app/api/chat/`, `app/api/pincode/`, `app/api/contact/`, `app/pincode.tsx`, MP actions/contact controls, `public/sw.js`.
- Validation: TypeScript, ESLint, Jest, production build, and test-data API smoke tests pass.
- Caveat: Set `GEMINI_API_KEY` to enable Gemini; without it the grounded template is used. Synthetic pincode/contact values are development-only and must be replaced with verified sources.
