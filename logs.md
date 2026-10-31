# Project history

## 2026-10-31

- Summary: Resolved merge conflicts between `origin/main` (Next.js 16/React 19 report card UI & Jest suite) and `map-location-apis` (Next.js App Router spatial APIs, Point-in-Polygon resolution, Delhi Pincodes, and dark GIS ward map).
- Areas: `.gitignore`, `package.json`, `tsconfig.json`, `app/layout.tsx`, `app/page.tsx`, `lib/types.ts`, `lib/data.ts`, `logs.md`.
- Validation: TypeScript check (`npx tsc --noEmit`), Jest test suite (`npm test`), and Next.js production build (`npm run build`).
- Caveat: Test snapshot and real snapshot both supported through `MP_DATA_MODE` and spatial APIs.

- Summary: Transformed the constituency map into an exact visual recreation of the reference dark GIS screenshot:
  1. Replaced crude PC polygons with 290 interlocking Delhi constituency/ward boundary polygons (`delhi_wards_enriched.geojson`), completely eliminating white patches/gaps across the National Capital Territory.
  2. Pure dark/black `#080808` GIS basemap with subtle dark-gray road networks and muted uppercase surrounding region labels (GURGAON, NOIDA, GHAZIABAD, KUNDLI, etc.).
  3. Matched the reference screenshot's color harmony: Olive/Forest Green for North West, Kelly Green for West, Cyan/Teal for Chandni Chowk, Royal Blue for New Delhi, Deep Burgundy/Crimson for South, Amber for East, and Violet for North East.
  4. Rendered bold white constituency numbers with subtle dark text shadows on every block polygon.
  5. Added the exact orange target reticle marker (with crosshairs and centered number) for selected constituencies (e.g. Ward 20).
  6. Added bottom-right 10km dark scale bar.
  7. Retained all existing backend functionality: GPS auto-detect, Point-in-Polygon location resolution, and debounced autocomplete search.
- Areas: `data/processed/delhi_wards_enriched.geojson`, `app/api/geojson/route.ts`, `app/test-frontend/page.tsx`, `test-frontend/index.html`, `app/layout.tsx`.
- Validation: TypeScript compilation, dev server verification, screenshot visual alignment.

- Summary: Fixed "Map container is already initialized" React StrictMode race condition caused by React / Next.js double mounting `useEffect` during development.
- Areas: `app/test-frontend/page.tsx`.
- Validation: Verified clean mount/unmount and leafet instance lifecycle.

- Summary: Next.js TypeScript backend APIs, spatial location service (Point-in-Polygon Ray Casting & Delhi pincodes directory), and test harness.
- Areas: `lib/spatial.ts`, `lib/delhi_pincodes.ts`, `app/api/locate/`, `app/api/constituencies/`, `app/api/search/`, `app/api/geojson/`, `app/test-frontend/`.
- Validation: All API endpoints verified with automated integration tests.

- Summary: Added Hindi interface labels, browser speech playback, snapshot-only MP chat, Gemini-ready summary integration, test-only pincode/contact endpoints and UI, and expanded offline cache.
- Areas: `lib/actions.ts`, `app/api/chat/`, `app/api/pincode/`, `app/api/contact/`, `app/pincode.tsx`, MP actions/contact controls, `public/sw.js`.
- Validation: TypeScript, ESLint, Jest, production build, and test-data API smoke tests pass.
- Caveat: Set `GEMINI_API_KEY` to enable Gemini; without it the grounded template is used. Synthetic pincode/contact values are development-only and must be replaced with verified sources.

- Summary: Added synthetic boundary map and browser-only location lookup, affidavit display, dark mode, PWA shell, public JSON/CSV downloads, and print reports.
- Areas: `app/map.tsx`, `lib/boundaries.ts`, `app/manifest.ts`, `public/sw.js`, `app/api/data/`, MP detail components.
- Validation: TypeScript, ESLint, Jest, production build, and synthetic runtime smoke tests pass.
- Caveat: Real boundary data is not present; location/map are intentionally available only in test mode. Affidavit values remain pending in the real snapshot.

- Summary: Implemented feature-catalogue discovery, trust, comparison, and detail surfaces.
- Areas: state/constituency picker, typo-tolerant search, test banner, comparison bars, trends/history, MPLADS/works/bills, compare/state routes, search index, glossary, sharing, and issue reporting.
- Validation: TypeScript, ESLint, Jest, and production build pass.
- Caveat: GPS/location, boundary map, affidavit enrichment, MP chat, Meko trail, and external Gemini integration remain data/service dependent.

- Summary: Added a `MP_DATA_MODE=test` switch and `dev:test` command for running the UI against the deterministic synthetic snapshot.
- Areas: `lib/data.ts`, `package.json`, `data/processed/mps.test.json`.
- Validation: Test snapshot regenerated; home, health, and a synthetic MP route returned HTTP 200.
- Caveat: Test records are fictional and must never be published as real civic data.

- Summary: Added template-grounded summary and action APIs with client controls.
- Areas: `app/api/`, `app/mp/[slug]/actions.tsx`, `lib/actions.ts`.
- Validation: API inputs use fixed language/intent enums; generated text uses only snapshot facts and keeps a template fallback.
- Caveat: No external LLM is enabled yet; responses are intentionally marked `source: "template"`.

- Summary: Added the first functional MP report-card UI for the reviewed Delhi snapshot.
- Areas: `app/`, `lib/data.ts`, `package.json`, test scripts.
- Validation: 58 Jest tests, TypeScript typecheck, and snapshot validation pass.
- Caveat: MPLADS and affidavit enrichment remain pending in the source snapshot; AI summary and draft-letter routes are not yet implemented.
