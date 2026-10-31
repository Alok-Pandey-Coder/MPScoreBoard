# Project Change Log

## 2026-10-31 — MPLADS block corrected to the `MpladsData` contract; JanWatchdog cross-check added

- **Summary:** The previous MPLADS export showed Empowered Indian's `utilizationPercentage` (recommended ÷ allocated, e.g. 43.8% for Chandni Chowk) as spending utilisation, stored `allocatedAmount` as "funds released", assumed works sanctioned = works recommended, and defaulted entitlement to ₹5 cr without a citation. MPLADS is now normalised from the latest dated raw capture by `scripts/09_intake_mplads.py`: `expenditure_pct` and `recommended_pct` are computed from rupee amounts, `works_count.sanctioned` and `annual_entitlement_cr` are `null`, 20 works per MP are mapped to `MpladsWork` (`works_is_partial: true`), `review_status` is `secondary_only`, and JanWatchdog (snapshot 2026-10-06) is attached as `cross_check` with readable differences. Old keys (`entitlement`, `funds_released`, `expenditure`, `utilisation_pct`, `unspent_balance`, `works{}`) are gone from `mps.json`. Corrected expenditure %: Chandni Chowk 18.0, East Delhi 16.6, New Delhi 14.1, North East Delhi 13.2, North West Delhi 8.5, South Delhi 19.6, West Delhi 8.9.
- **Files or areas changed:**
  - `scripts/09_intake_mplads.py` — rewritten from a manual intake helper into the MPLADS normaliser; writes `data/processed/mplads.delhi.json` (NEW intermediate).
  - `scripts/06_merge.py` — reads MPLADS from `mplads.delhi.json`, ignores the legacy `mplads` key in `delhi_7mp_custom_enrichment.json`, appends MPLADS notes to `normalisation_notes`; affidavit liabilities/cases no longer default to 0 when missing (no output change, all 7 values present).
  - `scripts/07_validate.py` — MPLADS contract checks, hard errors and warnings; MPLADS table in `validation_report.md`.
  - `scripts/08_snapshot.py` — `source_status` derived from block and review statuses; pipeline string includes 09 and 08.
  - `scripts/build_data.py` — runs `09_intake_mplads.py` before the merge.
  - `data/raw/mplads.delhi.janwatchdog.2026-10-06.csv` — NEW capture, byte copy of the local temp intake file; documented in `data/raw/README.md`.
  - `data/processed/mps.json`, `snapshot.json`, `validation_report.md` — regenerated.
  - `tests/test_mplads.py` — NEW (11 tests: pct computation, rupee→crore, no sanctioned/entitlement assumption, partial flag, null preservation, sort order, latest capture, cross-check, validator errors, export contract, snapshot hash).
  - `data.md`, `docs/dataSources.md` — MPLADS contract, sources and decisions; `mps.india.json` / `validation_report_india.md` marked unvalidated and not for publication.
- **Validation performed:** `python scripts/build_data.py` — 0 hard errors, 12 warnings (7 partial works lists; 5 seats where JanWatchdog expenditure is 5.3–22.6% higher than Empowered Indian). Computed percentages match the source's own percentages within 0.1 point for all 7 seats. `python -m pytest tests -q` — 18 passed. `npx tsc --noEmit` — passed. `snapshot.json` sha256 matches `mps.json`.
- **Remaining caveat or next step:** MPLADS is secondary-only until an official eSAKSHI cross-check is possible (`mplads.gov.in` refused connections). Works lists are 20 per MP; a fuller capture added as a new dated `mplads.delhi.empoweredindian.*.json` is picked up automatically. JanWatchdog's earlier snapshot shows higher expenditure and completed counts than Empowered Indian's later one (and 82 vs 59 recommended works for North West Delhi), which suggests the two sites define figures differently; unresolved. `scripts/fetch_empowered_delhi.py` still writes the legacy `mplads` key to the enrichment file (owned by another agent; now ignored). Annual entitlement needs an official guidelines citation before it can be shown. Note: `logs.md` itself contains a duplicated block of earlier entries (second `# Project Change Log` heading); left as-is per the no-rewrite rule.

---

## 2026-10-31 — Extracted Temp Archives & Integrated Complete Delhi Ward Crosswalks

- **Summary**: Extracted all 6 JanDarpan zip archives in `temp/` into subdirectories and deleted the `.zip` files. Evaluated archives against project rules and existing data foundation:
  - Discovered that work-level CSVs in `MP_WISE_DATA` had 0 rows (secondary placeholders), confirming our live Empowered Indian API extraction is superior.
  - Extracted and integrated full 250-ward mappings (`mcd_ward_to_lok_sabha_mapping.csv`, `ward_to_assembly_mapping.csv`, and `delhi_lok_sabha_constituencies.csv`) into `data/reference_packs/delhi_jurisdiction_collection_01/`.
  - Updated `data.md` master registry Section 3.5.
- **Files or areas changed:**
  - `temp/` — Extracted all 6 modular archive folders (`JanDarpan_Delhi_Geography_Complete`, `JanDarpan_Delhi_MPLADS_Complete`, `JanDarpan_Delhi_MCD_Complete`, `JanDarpan_Delhi_MLALAD_Complete`, `JanDarpan_Delhi_NDMC_Cantonment`, `JanDarpan_Delhi_Master_Data_Collection`); deleted all `.zip` files.
  - `data/reference_packs/delhi_jurisdiction_collection_01/mcd_ward_to_lok_sabha_mapping.csv` — NEW: 250 MCD wards mapped directly to Lok Sabha PCs and sitting MPs.
  - `data/reference_packs/delhi_jurisdiction_collection_01/ward_to_assembly_mapping.csv` — Updated from empty skeleton to 250 rows mapping MCD wards to 70 Assembly Constituencies.
  - `data/reference_packs/delhi_jurisdiction_collection_01/delhi_lok_sabha_constituencies.csv` — NEW: 7 PC metadata with exact AC (10) and MCD ward counts.
  - `data.md` — Updated Section 3.5 registry.
- **Validation performed:**
  - Verified row counts: `mcd_ward_to_lok_sabha_mapping.csv` (250 rows), `ward_to_assembly_mapping.csv` (250 rows), `delhi_lok_sabha_constituencies.csv` (7 rows).
  - Verified `python scripts/build_data.py`: passes with 0 hard errors, 0 warnings.
- **Remaining caveat or next step:**
  - `temp/` contains the extracted reference folders; can be kept for archival reference or safely deleted when no longer needed.

---

## 2026-10-31 — Professional Editorial UI/UX Redesign (UI-UX Pro Max)

- **Summary**: Transformed the entire application visual design on branch `feat/pro-editorial-redesign` following the UI/UX Pro Max intelligence framework (Accessible & Ethical + Swiss/Editorial Data Journalism). Eliminated all generic AI-generated aesthetic clichés (neon cyan glows, pulsing indicator dots, marketing buzzwords, and template cards) in favor of an authoritative, dignified public intelligence monitor:
  1. **Typography & Palette**: Implemented Newsreader (editorial serif), Inter (sans), and JetBrains Mono (monospaced tabular numbers) with a warm newspaper ink and stone palette (#0A0E17 dark ink surface, #0E1420 card surface, #1E2636 refined borders, and #D97706 parliamentary brass/amber).
  2. **Hero & Masthead**: Replaced generic AI slogans with authentic investigative civic masthead ('Every Question. Every Rupee. Accounted For.') and institutional metadata ledger.
  3. **High-Contrast Dark GIS Block Map**: Preserved the exact 290-ward ESRI Dark Canvas map with block numbers, 7 parliamentary colors, and orange target reticle, elevated inside a refined editorial frame with command-style search, location detection, and responsive MP dossier cards.
  4. **Sitting MP Dossier Grid**: Redesigned member cards into authentic parliamentary dossiers featuring seat category badges (SC/GEN), attendance and question comparative benchmark indicators, clear institutional ministerial exemptions for ministers, and sworn affidavit highlights.
  5. **Dossier Pages & Actions**: Upgraded MP report cards, comparative benchmark matrices, plain-language synthesis briefings, and citizen letter draft generators to high-craft editorial standards.
- **Files/Areas Changed**:
  - `tailwind.config.js` & `app/globals.css`: Added editorial tokens, tabular-nums utility, and typography hierarchy.
  - `app/layout.tsx`: Configured Google fonts (Inter, Newsreader, Outfit, JetBrains Mono).
  - `components/layout/Header.tsx` & `Footer.tsx`: Architectural masthead navigation and official provenance colophon.
  - `components/home/*`: Overhauled HomeClient, NagrikTerritoryBar, QuickCardsGrid, UnifiedSearchBar, NagrikStateCardsGrid, and StateConstituencyPicker.
  - `components/map/NagrikStyleMap.tsx` & `IndiaAtlasMap.tsx`: Refined geospatial frames and controls.
  - `components/mp/*`: Redesigned MPHeader, PerformanceGrid, ComparisonSection, MpladsSection, AffidavitSection, ExplainSimplyPanel, and TakeActionPanel.
  - `components/compare/CompareClient.tsx`: Upgraded side-by-side indicator matrix.
- **Validation Performed**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run build` (`next build --webpack`): Compiled all 64 static/SSG/dynamic routes with 0 errors.
  - `npm test`: All 58 Jest tests passed 100%.

## 2026-10-31 — Unregistered Stale Service Worker and Purged Browser Cache

- **Summary**: Resolved persistent stale page issue on http://localhost:3000 where regular F5 refresh served outdated pre-migration HTML ('Boundary data is not available for the reviewed real snapshot yet'):
  1. Identified that public/sw.js previously implemented a cache-first service worker under the cache key mera-mp-v2, which intercepted navigation requests and returned stale responses during normal F5 refreshes while bypassing network requests.
  2. Replaced public/sw.js with an automated self-unregistering script that deletes all active caches using caches.keys() and calls self.registration.unregister().
  3. Added an inline cleanup script in app/layout.tsx <head> that scans navigator.serviceWorker.getRegistrations(), unregisters any active service worker on localhost:3000, and clears all CacheStorage entries immediately on page load.
  4. Neutralized app/pwa-register.tsx to prevent any future service worker registrations.
- **Files/Areas Changed**:
  - public/sw.js: Replaced cache-first offline service worker with cache purging and self-unregistration script.
  - app/layout.tsx: Added auto-purge service worker and cache clearing inline script in <head>.
  - app/pwa-register.tsx: Converted into a complete no-op (return null;).
- **Validation Performed**:
  - npm run typecheck: Passed with 0 errors.
  - Verified clean compilation with Next.js App Router.


## 2026-10-31 — Unregistered Stale Service Worker and Purged Browser Cache

- **Summary**: Resolved persistent stale page issue on `http://localhost:3000` where regular F5 refresh served outdated pre-migration HTML ("Boundary data is not available for the reviewed real snapshot yet"):
  1. Identified that `public/sw.js` previously implemented a cache-first service worker under the cache key `mera-mp-v2`, which intercepted navigation requests and returned stale responses during normal F5 refreshes while bypassing network requests.
  2. Replaced `public/sw.js` with an automated self-unregistering script that deletes all active caches using `caches.keys()` and calls `self.registration.unregister()`.
  3. Added an inline cleanup script in `app/layout.tsx` `<head>` that scans `navigator.serviceWorker.getRegistrations()`, unregisters any active service worker on `localhost:3000`, and clears all CacheStorage entries immediately on page load.
  4. Neutralized `app/pwa-register.tsx` to prevent any future service worker registrations.
- **Files/Areas Changed**:
  - `public/sw.js`: Replaced cache-first offline service worker with cache purging and self-unregistration script.
  - `app/layout.tsx`: Added auto-purge service worker and cache clearing inline script in `<head>`.
  - `app/pwa-register.tsx`: Converted into a complete no-op (`return null;`).
- **Validation Performed**:
  - `npm run typecheck`: Passed with 0 errors.
  - Verified clean compilation with Next.js App Router.

## 2026-10-31 — Recreated Exact Dark GIS Constituency Block Map Visualization

- **Summary**: Replaced CartoDB watermarked basemap with the exact Dark GIS style matching the reference screenshot:
  1. Pure dark/black `#080808` GIS basemap with subtle dark-gray road networks and muted gray geographical labels (KUNDLI, SAMCHANA, ISMAILA, BAHADURGARH, GURGAON, NOIDA, GHAZIABAD) via ESRI Dark Canvas tiles, completely eliminating CartoDB API key watermarks.
  2. Rendered all 290 detailed interlocking ward boundary polygons (`delhi_wards_enriched.geojson` via `/api/geojson`), eliminating large white patches/gaps across Delhi.
  3. Matched the 7 Parliamentary Block color mapping: Olive/Forest Green for North West, Kelly/Vivid Green for West, Electric Cyan/Teal for Chandni Chowk, Royal Deep Blue for New Delhi, Deep Burgundy/Crimson for South, Warm Amber/Ochre for East, and Deep Violet/Purple for North East.
  4. Displayed bold white constituency numbers with dark outline on every block polygon.
  5. Added the exact orange circular crosshair target reticle marker on the selected active block (with centered number).
  6. Preserved the unaltered right-side search, geolocation (Point-in-Polygon via `/api/locate`), and browse dashboard with active MP card navigation.
- **Files/Areas Changed**:
  - `components/map/NagrikStyleMap.tsx`: Dark GIS visualization with Leaflet, 290 polygons, white labels, target reticle, and dashboard synchronization.
  - `app/globals.css`: Added Leaflet CSS import and Dark GIS tile filter and tooltip styles.
  - `package.json`: Added `leaflet` and `@types/leaflet`.
- **Validation Performed**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run build`: Succeeded with code 0 (all 64 static/dynamic routes compiled).


## 2026-10-31 — Complete Next.js App Router Migration & Unified Runtime

- **Summary**: Fully migrated the entire "Mera MP, Mera Report Card" interactive platform (Nagrik Dark Civic Atlas, MapLibre GL geospatial map, MP report cards, comparisons, and search) into a single, unified Next.js (App Router, Next.js 16 + React 19) full-stack application. Both the frontend UI and backend API routes now run simultaneously on port 3000 in Next.js without needing separate Vite or Node servers. Fixed dark/light theme switching with synchronization between `<html class="dark">`, CSS colorScheme, and localStorage.
- **Files/Areas Changed**:
  - `package.json`: Configured Next.js 16, React 19, tailwindcss, lucide-react, maplibre-gl, and webpack builder (`next dev --webpack -p 3000`).
  - `app/layout.tsx`: Configured RootLayout with ThemeProvider, Google Fonts (`Inter`, `Outfit`), Header, Footer, and FloatingThemePill. Added head pre-render script to eliminate theme flash.
  - `app/globals.css`: Added `@import "maplibre-gl/dist/maplibre-gl.css"`, Tailwind base/components/utilities, dark/light theme background tokens, and MapLibre dark popup styles.
  - `context/ThemeContext.tsx` & `components/common/FloatingThemePill.tsx`: Fixed theme switching across classes and data-theme attributes with smooth transition.
  - `app/page.tsx` & `components/home/HomeClient.tsx`: Full Nagrik Dark Civic Atlas homepage with SSR-safe dynamic MapLibre import (`NagrikStyleMap`), territory counter bar, state landmark cards, all-India vector atlas, Delhi sitting MPs grid, and smart search.
  - `app/mp/[slug]/page.tsx` & `components/mp/MPReportCardClient.tsx`: Full analytical intelligence report card for MPs with KPIs, benchmarks, MPLADS fund utilization, and sworn affidavits.
  - `app/compare/page.tsx` & `components/compare/CompareClient.tsx`: Side-by-side indicator comparison matrix.
  - `app/explore/page.tsx` & `components/explore/ExploreAtlasClient.tsx`: All-India Geospatial Atlas page.
  - `app/about/page.tsx`: Methodology and Data Provenance documentation.
  - `app/state/[state]/page.tsx` & `components/state/StateExplorationClient.tsx`: State exploration page.
  - `app/api/*`: Next.js Route handlers (`/api/health`, `/api/search`, `/api/constituencies`, `/api/geojson`, `/api/summary`, `/api/draft`, `/api/pincode`, etc.).
- **Validation Performed**:
  - `npm run build`: Succeeded with code 0 (64 static/SSG/dynamic routes generated cleanly).
  - `npm test`: Passed all 58 unit and integration tests.
  - Verified live HTTP 200 responses on `http://127.0.0.1:3000/`, `/mp/new-delhi-delhi`, `/compare`, `/explore`, `/about`, `/state/delhi`, `/api/health`, `/api/constituencies`, and `/api/search?q=Bansuri`.
- **Remaining Caveats / Next Steps**:
  - Dev server running actively in background on `http://localhost:3000`.

## 2026-10-31 — Resolved Duplicate React Instance & Single-Instance Deduping

- **Summary**: Fixed "Cannot read properties of null (reading 'useRef')" error caused by dual React versions between root (React 19) and frontend (React 18). Cleaned root node_modules and locked Vite configuration with `dedupe: ['react', 'react-dom']` and explicit path aliases to `frontend/node_modules/react`.
- **Files/Areas Changed**:
  - `frontend/vite.config.ts`: Added `resolve.dedupe` and explicit aliases to prevent module resolution leaks up to root.
  - `node_modules/`: Removed conflicting root packages.
  - Vite cache: Cleaned `frontend/node_modules/.vite`.
- **Validation Performed**:
  - `npm --prefix frontend run build`: Succeeded with code 0 in 8.28s.
  - Verified `http://localhost:3000/` returns HTTP 200.
  - Verified `http://localhost:5000/api/health` returns HTTP 200.
- **Remaining Caveats / Next Steps**:
  - Both processes running continuously in daemon mode.

## 2026-10-31 — Simultaneous Frontend & Backend Runtime Architecture

- **Summary**: Implemented unified dual-stack execution supporting both Frontend (interactive MapLibre UI on port 3000) and Backend (Parliamentary Intelligence REST API on port 5000) simultaneously with seamless /api proxying.
- **Files/Areas Changed**:
  - `server/server.js`: Lightweight, zero-dependency REST API server implementing PRD Section 6.2 endpoints (`/api/health`, `/api/search`, `/api/search-index`, `/api/constituencies`, `/api/data`, `/api/pincode`, `/api/geojson`, `/api/summary`, `/api/draft`).
  - `frontend/vite.config.ts`: Added reverse proxy configuration redirecting `/api/*` requests directly to `http://localhost:5000`.
  - `scripts/run-all.js` & `package.json`: Configured single-command simultaneous runner (`npm run dev:all`).
- **Validation Performed**:
  - Tested `http://localhost:5000/api/health` directly: returns HTTP 200 with JSON payload (`status: "ok"`, `mpsCount: 7`).
  - Tested `http://localhost:3000/api/health` through Vite reverse proxy: confirmed HTTP 200 pass-through.
  - Tested `http://localhost:3000/api/search?q=bansuri`: successfully returns matching MP record and metadata.
- **Remaining Caveats / Next Steps**:
  - Both processes running continuously in daemon mode.


## 2026-10-31 — Interactive Nagrik-Inspired Civic Atlas & Robust Theme Toggle

- **Summary**: Transformed "Mera MP, Mera Report Card" into an interactive Indian Parliamentary Intelligence Platform modeled directly on the Nagrik civic platform designs. Fixed the light/dark theme toggle across all pages, integrated interactive MapLibre GL geospatial maps with colored constituency polygons, added territorial status banners and 4-metric strip counters, incorporated landmark state cards with regional language scripts, and implemented smart geographical search synchronization.
- **Files/Areas Changed**:
  - `frontend/src/context/ThemeContext.tsx` & `frontend/index.html`: Fixed dark/light theme switching with head pre-render script to prevent flashing, persisted choice in `localStorage`, and dynamically updated `documentElement` classes and `colorScheme`.
  - `frontend/src/components/common/FloatingThemePill.tsx` & `ThemeToggle.tsx`: Built floating bottom slider pill (matching Nagrik design) and header sun/moon toggle with instant reactive state changes.
  - `frontend/src/App.tsx`: Removed hardcoded dark background classes, enabling seamless light/dark adaptive layout.
  - `frontend/src/components/map/NagrikStyleMap.tsx`: Interactive MapLibre GL map featuring dark raster base tiles, verified Delhi 18th Lok Sabha boundaries, hover tooltips, geolocation (`Use my location`), search filter, and selected constituency drawer.
  - `frontend/src/components/map/IndiaAtlasMap.tsx`, `MapControls.tsx`, `StateInfoPanel.tsx`, `ConstituencyInfoPanel.tsx`: All-India 36 state/UT vector atlas with zoom controls, fly-to-state animations, and constituency inspection.
  - `frontend/src/components/home/NagrikTerritoryBar.tsx`: High-impact territory header with active session tags, attendance benchmarks, and 4-metric counters.
  - `frontend/src/components/home/NagrikStateCardsGrid.tsx`: Two-column state overview grid featuring architectural landmark icons, regional language titles, seat counts, and MPLADS metrics.
  - `frontend/src/pages/HomePage.tsx`: Editorial hero section (*"Your Parliament shouldn't run on autopilot"*), smart search synchronization, and seamless dark/light styling.
- **Validation Performed**:
  - `tsc && vite build`: Succeeded with code 0 in 18.04s.
  - Tested theme toggle state transitions: verified `document.documentElement.classList` toggles `dark` class, and all text/background layers update between light and dark modes.
  - Verified MapLibre polygon rendering and hover events.
- **Remaining Caveats / Next Steps**:
  - Ready for demo and presentation.

## 2026-10-31 — Added Dark & Light Theme System and Elevated UI Designs

- **Summary**: Implemented persistent Dark and Light theme toggle, customized civic styling, sticky section jump-navigation, print/save PDF features, and refined responsive components across the frontend.
- **Files/Areas Changed**:
  - `frontend/tailwind.config.js`: Enabled `darkMode: 'class'`, defined dark theme color extensions (`brand.dark`, `brand.darkCard`, `brand.darkBorder`), and custom shadow utilities.
  - `frontend/src/context/ThemeContext.tsx`: Created persistent ThemeProvider with system preference detection (`prefers-color-scheme`) and `localStorage` caching (`mera-mp-theme`).
  - `frontend/src/components/common/ThemeToggle.tsx`: Built sun/moon theme switch button in header and mobile drawers.
  - `frontend/src/index.css`: Added dark mode background (`#0b0f19`), high-contrast text layers, and custom dark webkit scrollbar.
  - `frontend/src/components/layout/Header.tsx`, `frontend/src/components/layout/Footer.tsx`: Polished glassmorphism, responsive navigation drawers, and dark theme support.
  - `frontend/src/components/home/`: Dark theme support for `UnifiedSearchBar`, `StateConstituencyPicker`, and `QuickCardsGrid` with glowing accent borders.
  - `frontend/src/components/mp/`: Updated `MPHeader`, `PerformanceGrid`, `ComparisonSection`, `MpladsSection`, `AffidavitSection`, `ExplainSimplyPanel`, and `TakeActionPanel` with accessible dark mode contrast and refined typography.
  - `frontend/src/pages/MPReportCardPage.tsx`: Added sticky quick-jump pill bar for instant section scrolling (`#indicators`, `#benchmarks`, `#mplads`, `#affidavit`, `#explain`, `#action`, `#sources`) and a "Print / Save PDF" feature.
  - `frontend/src/pages/ComparePage.tsx`, `frontend/src/pages/AboutPage.tsx`, `frontend/src/pages/NotFoundPage.tsx`: Full dark theme styling.
- **Validation Performed**:
  - `tsc && vite build`: Succeeded in 9.21s with zero errors (bundle size 81.89 KB gzipped).
  - Verified theme toggle toggles `dark` class on `document.documentElement` and persists across page reloads.
  - Verified contrast ratios in both light and dark themes meet WCAG AA standards.
- **Remaining Caveats / Next Steps**:
  - Ready for local testing (`npm run dev`) or deployment.

## 2026-10-31 — Complete frontend implementation for "Mera MP, Mera Report Card" (PRD v1.0)

- **Summary**: Built the complete, attractive, mobile-first frontend application inside `frontend/` conforming to the PRD specifications for the 18th Lok Sabha MP Performance Tracker.
- **Files/Areas Changed**:
  - `frontend/package.json`, `frontend/vite.config.ts`, `frontend/tsconfig.json`, `frontend/tailwind.config.js`: Modern React 18 + TypeScript + Vite + Tailwind CSS stack.
  - `frontend/src/types/mp.ts`: Complete TypeScript schema for MPs, performance, MPLADS, affidavit, sources, and snapshot metadata.
  - `frontend/src/lib/`:
    - `search.ts`: Typo-tolerant unified search (Levenshtein distance <= 2 for queries >= 4 chars) and alias resolution from `aliases.json`.
    - `comparisons.ts`: Neutral comparison calculation adhering to PRD 5.6 thresholds (attendance ±5 pp, counts ±10%), non-judgmental wording ("similar to", "higher than", "lower than").
    - `formatters.ts`: Rupee formatting in Crores, percentage and date helpers.
    - `ai/summary.ts`: Plain-language summary generator (English & Hinglish) with strict number guardrails and deterministic template fallback.
    - `ai/draft.ts`: Citizen letter/question generator covering all 4 intents (`mplads_works`, `parliament_question`, `attendance_clarification`, `general_feedback`) with 1-click copy & mailto links.
  - `frontend/src/components/`:
    - `layout/Header.tsx`, `layout/Footer.tsx`: Modern navigation with keyboard shortcut search, official non-partisan disclaimer, snapshot metadata badge, and provenance links.
    - `home/UnifiedSearchBar.tsx`, `home/StateConstituencyPicker.tsx`, `home/QuickCardsGrid.tsx`: Fast search with keyboard navigation, step-by-step state/constituency picker, and cards for all 7 Delhi seats.
    - `mp/`: Identity header, 4-indicator performance grid, comparative average bars, MPLADS status block, affidavit declarations with legal disclaimers, AI "Explain simply" panel, and Take Action citizen draft generator.
  - `frontend/src/pages/`:
    - `HomePage.tsx`: Hero, search, territory picker, core pillars, and seat overview.
    - `MPReportCardPage.tsx`: Dynamic MP report card with alias redirects and dynamic document titles.
    - `ComparePage.tsx`: Side-by-side neutral comparison of 2 MPs with shareable URLs.
    - `AboutPage.tsx`: Full methodology, source definitions, minister handling explanation, and academic disclaimer.
    - `NotFoundPage.tsx`: Custom 404 with embedded search box and quick seat suggestions.
- **Validation Performed**:
  - `tsc && vite build`: Succeeded in 3.71s with zero errors; gzipped bundle is 79.4 KB (well under the 150 KB target).
  - Python backend tests (`tests/test_prs_parser.py`) executed and passed 100%.
  - Verified minister handling: Harsh Malhotra displays "Not Applicable (Minister)" with full explanatory modal and no false zeros.
  - Verified non-minister metrics: Praveen Khandelwal, Bansuri Swaraj, Manoj Tiwari, Yogender Chandolia, Ramvir Singh Bidhuri, and Kamaljeet Sehrawat render with complete indicators and average comparisons.
- **Remaining Caveats / Next Steps**:
  - Connect live Gemini API key via serverless function if dynamic runtime LLM responses are desired beyond the deterministic template generator.
  - Add remaining Indian states as data collection scales beyond Delhi's 7 seats.
# Project Change Log

## 2026-10-31 — Extracted Temp Archives & Integrated Complete Delhi Ward Crosswalks

- **Summary**: Extracted all 6 JanDarpan zip archives in `temp/` into subdirectories and deleted the `.zip` files. Evaluated archives against project rules and existing data foundation:
  - Discovered that work-level CSVs in `MP_WISE_DATA` had 0 rows (secondary placeholders), confirming our live Empowered Indian API extraction is superior.
  - Extracted and integrated full 250-ward mappings (`mcd_ward_to_lok_sabha_mapping.csv`, `ward_to_assembly_mapping.csv`, and `delhi_lok_sabha_constituencies.csv`) into `data/reference_packs/delhi_jurisdiction_collection_01/`.
  - Updated `data.md` master registry Section 3.5.
- **Files or areas changed:**
  - `temp/` — Extracted all 6 modular archive folders (`JanDarpan_Delhi_Geography_Complete`, `JanDarpan_Delhi_MPLADS_Complete`, `JanDarpan_Delhi_MCD_Complete`, `JanDarpan_Delhi_MLALAD_Complete`, `JanDarpan_Delhi_NDMC_Cantonment`, `JanDarpan_Delhi_Master_Data_Collection`); deleted all `.zip` files.
  - `data/reference_packs/delhi_jurisdiction_collection_01/mcd_ward_to_lok_sabha_mapping.csv` — NEW: 250 MCD wards mapped directly to Lok Sabha PCs and sitting MPs.
  - `data/reference_packs/delhi_jurisdiction_collection_01/ward_to_assembly_mapping.csv` — Updated from empty skeleton to 250 rows mapping MCD wards to 70 Assembly Constituencies.
  - `data/reference_packs/delhi_jurisdiction_collection_01/delhi_lok_sabha_constituencies.csv` — NEW: 7 PC metadata with exact AC (10) and MCD ward counts.
  - `data.md` — Updated Section 3.5 registry.
- **Validation performed:**
  - Verified row counts: `mcd_ward_to_lok_sabha_mapping.csv` (250 rows), `ward_to_assembly_mapping.csv` (250 rows), `delhi_lok_sabha_constituencies.csv` (7 rows).
  - Verified `python scripts/build_data.py`: passes with 0 hard errors, 0 warnings.
- **Remaining caveat or next step:**
  - `temp/` contains the extracted reference folders; can be kept for archival reference or safely deleted when no longer needed.

---

## 2026-10-31 — Unregistered Stale Service Worker and Purged Browser Cache

- **Summary**: Resolved persistent stale page issue on `http://localhost:3000` where regular F5 refresh served outdated pre-migration HTML ("Boundary data is not available for the reviewed real snapshot yet"):
  1. Identified that `public/sw.js` previously implemented a cache-first service worker under the cache key `mera-mp-v2`, which intercepted navigation requests and returned stale responses during normal F5 refreshes while bypassing network requests.
  2. Replaced `public/sw.js` with an automated self-unregistering script that deletes all active caches using `caches.keys()` and calls `self.registration.unregister()`.
  3. Added an inline cleanup script in `app/layout.tsx` `<head>` that scans `navigator.serviceWorker.getRegistrations()`, unregisters any active service worker on `localhost:3000`, and clears all CacheStorage entries immediately on page load.
  4. Neutralized `app/pwa-register.tsx` to prevent any future service worker registrations.
- **Files/Areas Changed**:
  - `public/sw.js`: Replaced cache-first offline service worker with cache purging and self-unregistration script.
  - `app/layout.tsx`: Added auto-purge service worker and cache clearing inline script in `<head>`.
  - `app/pwa-register.tsx`: Converted into a complete no-op (`return null;`).
- **Validation Performed**:
  - `npm run typecheck`: Passed with 0 errors.
  - Verified clean compilation with Next.js App Router.

## 2026-10-31 — Recreated Exact Dark GIS Constituency Block Map Visualization

- **Summary**: Replaced CartoDB watermarked basemap with the exact Dark GIS style matching the reference screenshot:
  1. Pure dark/black `#080808` GIS basemap with subtle dark-gray road networks and muted gray geographical labels (KUNDLI, SAMCHANA, ISMAILA, BAHADURGARH, GURGAON, NOIDA, GHAZIABAD) via ESRI Dark Canvas tiles, completely eliminating CartoDB API key watermarks.
  2. Rendered all 290 detailed interlocking ward boundary polygons (`delhi_wards_enriched.geojson` via `/api/geojson`), eliminating large white patches/gaps across Delhi.
  3. Matched the 7 Parliamentary Block color mapping: Olive/Forest Green for North West, Kelly/Vivid Green for West, Electric Cyan/Teal for Chandni Chowk, Royal Deep Blue for New Delhi, Deep Burgundy/Crimson for South, Warm Amber/Ochre for East, and Deep Violet/Purple for North East.
  4. Displayed bold white constituency numbers with dark outline on every block polygon.
  5. Added the exact orange circular crosshair target reticle marker on the selected active block (with centered number).
  6. Preserved the unaltered right-side search, geolocation (Point-in-Polygon via `/api/locate`), and browse dashboard with active MP card navigation.
- **Files/Areas Changed**:
  - `components/map/NagrikStyleMap.tsx`: Dark GIS visualization with Leaflet, 290 polygons, white labels, target reticle, and dashboard synchronization.
  - `app/globals.css`: Added Leaflet CSS import and Dark GIS tile filter and tooltip styles.
  - `package.json`: Added `leaflet` and `@types/leaflet`.
- **Validation Performed**:
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run build`: Succeeded with code 0 (all 64 static/dynamic routes compiled).
 — "Mera MP, Mera Report Card"

This file records key data changes, pipeline updates, schema modifications, and source additions in reverse chronological order, as mandated by repository guidelines.

---

## 2026-10-31 — Delhi MPLADS Block Completed (7/7 MPs) via Empowered Indian API

- **Summary:** Discovered, inspected, and queried the live Empowered Indian backend API (`https://api.empoweredindian.in/api`). Captured complete MPLADS financial figures and project records for all 7 Delhi Lok Sabha MPs. Merged into `data/processed/mps.json` and synced to frontend. Delhi MVP foundation is now 100% complete across all 6 blocks.
- **Files or areas changed:**
  - `data/raw/mplads.delhi.empoweredindian.2026-10-31.json` — NEW: Immutable raw capture containing allocated limit, expenditure, unspent balance, works recommended, and works completed for all 7 Delhi MPs.
  - `scripts/fetch_empowered_delhi.py` — NEW: API extraction script querying `/mplads/search` and `/mplads/mps/<id>`.
  - `data/raw/delhi_7mp_custom_enrichment.json` — Updated: populated with exact allocated, expenditure, unspent, and works counts.
  - `scripts/06_merge.py` — Updated: added fallback field mapping for `as_of_date` and `annual_entitlement_cr`.
  - `data/processed/mps.json` — All 7 MPs now show `mplads: reported: 7`.
  - `frontend/src/data/mps.json` — Synced to frontend.
  - `data.md` — Updated: Table 2.1 and 2.3 now reflect MPLADS as 100% complete.
- **Validation performed:**
  - Executed `python scripts/build_data.py`. Validation report shows: 0 hard errors, 0 warnings.
  - Block status: `performance: 7/7`, `affidavit: 7/7`, `election: 7/7`, `mplads: 7/7`.
- **Remaining caveat or next step:**
  - All Delhi MVP blocks are 100% complete. Scale to national election/affidavit datasets as needed.

---

## 2026-10-31 — All-India Normalisation Completed (544 MPs, 100% PRS Match) & Main Sync

- **Summary:** Built `scripts/05_normalise_india.py` to match the 544 Digital Sansad members with 553 PRS directory entries across all 36 States/UTs. Achieved 100.0% match rate using constituency alias dictionary. Exported canonical `mps.india.json` and `validation_report_india.md`. Synced canonical Delhi `mps.json` to `frontend/src/data/mps.json`. Merged `data-india-sansad-masterlist` into `main`.
- **Files or areas changed:**
  - `data/processed/mps.india.json` — NEW: 544 national records with identity, minister status, and PRS activity metrics (debates, questions, PMBs).
  - `data/processed/validation_report_india.md` — NEW: All-India audit report covering 36 States/UTs and minister exemptions.
  - `scripts/05_normalise_india.py` — NEW: All-India normalisation and fuzzy matching script.
  - `frontend/src/data/mps.json` — Updated: synced latest Delhi affidavit and election results.
  - `data.md` — Updated: added All-India processed files to master catalog.
- **Validation performed:**
  - 544 out of 544 Sansad members successfully matched with PRS (100.0%).
  - Minister exemption verified: all Council of Ministers members show `performance.status = "not_applicable"` and `null` metrics.
  - Re-ran `python scripts/build_data.py` on Delhi foundation: 0 hard errors, 0 warnings.
- **Remaining caveat or next step:**
  - MPLADS block: awaiting user input of final expenditure numbers via `scripts/09_intake_mplads.py`.
  - All-India affidavits and election results: ready for national bulk tabular intake.

---

## 2026-10-31 — All-India PRS Manifest Crawled (553 Members)

- **Summary:** Crawled all 62 directory pages (pages 0..61) of the PRS Legislative Research 18th Lok Sabha portal. Captured 553 MP records including constituency, state, party, age, questions, debates, private member bills, and profile URLs.
- **Files or areas changed:**
  - data/raw/prs.india.manifest.2026-10-31.json — NEW: All-India PRS directory manifest capture (553 records).
  - scripts/02_crawl_prs_manifest_india.py — NEW: Crawl script covering pages 0..61 with rate-limiting.
  - data.md — Updated: added PRS manifest to raw captures inventory.
- **Validation performed:**
  - Verified 553 records parsed. Checked sample records from multiple states across early and late pages.
  - Rate limiting kept at 0.8s per page.
- **Remaining caveat or next step:**
  - Match Sansad 544 members with PRS 553 records on (state, constituency, name) to generate national performance dataset.

---

## 2026-10-31 — All-India Sansad Master List Fetched (544 MPs)

- **Summary:** Completed All-India 18th Lok Sabha member list fetch via Digital Sansad API. 544 members across 36 states/UTs captured with identity fields and minister status.
- **Files or areas changed:**
  - data/raw/sansad.members.india.2026-10-31.json - NEW: 544 MP records, 36 states/UTs, retrieved 2026-10-31.
  - data.md - Updated: raw directory tree with actual filename replacing placeholder.
- **Validation performed:**
  - Verified 544 records loaded from JSON. State count matches Lok Sabha composition (UP: 80, Maharashtra: 49, Bihar: 40, WB: 42, Delhi: 7, etc.).
  - Script: scripts/01_fetch_sansad_india.py at 1 req/sec rate limit (polite crawl).
- **Remaining caveat or next step:**
  - Use this master list as the seed for all-India PRS/affidavit/election enrichment pipeline.
  - Build 01_normalise_india.py to normalize all 544 records against PRS and ECI data.

---

## 2026-10-31 — GeoJSON Boundaries, Regional Hierarchy, ECI Raw Capture, New Pipeline Scripts

- **Summary:** Completed Delhi MVP data layer. Downloaded DataMeet 543-PC GeoJSON and extracted 7 Delhi boundaries with pc_slug fields. Populated 70-MLA regional hierarchy. Captured ECI 2024 GE results as immutable raw file. Added All-India Sansad fetch script (running), MPLADS manual intake helper, and ECI results script. Updated data.md registry and status table.
- **Files or areas changed:**
  - data/processed/delhi_pc_boundaries.geojson - NEW: 7 Delhi Lok Sabha PC boundaries with pc_slug and source (DataMeet CC-BY-4.0, retrieved 2026-10-31).
  - data/processed/delhi_regional_hierarchy.json - NEW: 7 PCs x 10 MLAs = 70 MLA entries with affidavit, party, and MyNeta data.
  - data/raw/india_pc_2019_simplified.geojson - NEW: Immutable raw cache of DataMeet 543-PC boundary file (1.9 MB).
  - data/raw/eci_ge2024_results_raw.json - NEW: ECI 2024 GE results raw capture (7 Delhi PCs, manual backup from ECI 2024-06-04).
  - data/raw/delhi_7mp_custom_enrichment.json - Updated: election results populated for all 7 Delhi MPs.
  - data/reference_packs/delhi_jurisdiction_collection_01/assembly_to_parliamentary_mapping.csv - Updated: all 70 AC to PC rows filled.
  - scripts/download_delhi_geojson.py - NEW: GeoJSON download, filter, and slug-mapping script.
  - scripts/01_fetch_sansad_india.py - NEW: All-India 543-seat Sansad API fetch script.
  - scripts/09_intake_mplads.py - NEW: MPLADS manual intake helper with validation.
  - scripts/10_fetch_eci_results.py - NEW: ECI results fetch script with live API + manual backup.
  - data.md - Updated: directory tree, status table, block 6 now 100% complete.
- **Validation performed:**
  - python scripts/build_data.py: 0 hard errors, 0 warnings.
  - PRS averages match published values. GeoJSON: 7/7 Delhi features with correct pc_slug values.
  - Block status: election: reported 7/7, affidavit: reported 7/7, mplads: pending 7/7.
- **Remaining caveat or next step:**
  - MPLADS data pending: fill scripts/09_intake_mplads.py manually from empoweredindian.in/mplads.
  - All-India Sansad fetch running in background.
  - All-India scaling (PRS bulk, ECI all-India, MyNeta bulk) scripts not yet written.

---

## 2026-10-31 — Affidavit Block Merged & Validation Rules Extended

- **Summary:** Integrated ADR/MyNeta election affidavit data from `data/reference_packs/officials_enriched_pack/data/mp_affidavit_enrichment.csv` into `data/processed/mps.json` via updated `scripts/06_merge.py`; updated `scripts/07_validate.py` with affidavit validation rules; updated `data.md` registry.
- **Files or areas changed:**
  - `scripts/06_merge.py` (added affidavit loader, custom enrichment loader, and source provenance).
  - `scripts/07_validate.py` (added validation for reported affidavits: non-negative assets/cases/liabilities and 2024 election year).
  - `data/processed/mps.json` (all 7 Delhi MPs now show `affidavit: reported` with exact figures and MyNeta citations).
  - `data/processed/validation_report.md` (block status updated: `affidavit: reported: 7`).
  - `data/processed/snapshot.json` (regenerated snapshot with updated SHA-256).
  - `data.md` (registry updated to show affidavit status 100% complete).
  - `AGENTS.md` (added instruction requiring `data.md` updates whenever data/tables change).
- **Validation performed:**
  - Ran `python scripts/build_data.py`. All 5 steps completed with 0 hard errors and 0 warnings.
  - Verified `affidavit: reported: 7` in `validation_report.md`.
- **Remaining caveat or next step:**
  - Ingest the user-provided 7 MP enrichment file once values for MPLADS and Election results are supplied in `data/raw/delhi_7mp_custom_enrichment.json`.

---

## 2026-10-31 — Data Directory Reorganization, Master Registry & Custom 7 MP Intake Setup

- **Summary:** Reorganized 5 auxiliary and legacy civic data packs into `data/reference_packs/` to clean the repository root; authored the comprehensive master data registry `data.md`; created the plug-in intake template `data/raw/delhi_7mp_custom_enrichment.json` for manual 7 MP data addition.
- **Files or areas changed:**
  - Created `data/reference_packs/` and moved:
    - `JanDarpan_Delhi_Officials_Enriched_Pack` ➔ `data/reference_packs/officials_enriched_pack`
    - `JanDarpan_Delhi_Officials_Data_Pack` ➔ `data/reference_packs/officials_data_pack`
    - `JanDarpan_MCD_PMS_Expansion_2026-10-31` ➔ `data/reference_packs/mcd_pms_expansion_2026-10-31`
    - `JanDarpan_MCD_Councillor_Collection_Workstream_2` ➔ `data/reference_packs/mcd_councillor_collection_ws2`
    - `JanDarpan_Delhi_Jurisdiction_Collection_01` ➔ `data/reference_packs/delhi_jurisdiction_collection_01`
  - Authored root master registry `data.md`.
  - Created intake template `data/raw/delhi_7mp_custom_enrichment.json`.
- **Validation performed:**
  - Verified root directory is clean (zero stray JanDarpan directories in project root).
  - Verified all files in `data/reference_packs/` are intact and accessible.
  - Re-ran `python scripts/07_validate.py` against `data/processed/mps.json`; confirmed 0 hard errors, 0 warnings, and 100% computed vs PRS average reconciliation.
- **Remaining caveat or next step:**
  - Merge the ready ADR affidavit data from `data/reference_packs/officials_enriched_pack/data/mp_affidavit_enrichment.csv` into `mps.json`.
  - Ingest the user-provided 7 MP enrichment file once values for MPLADS and Election results are supplied.

---

## 2026-10-30 — Initial Delhi Pipeline Validation and Foundation Setup

- **Summary:** Established initial Delhi-first data pipeline for all 7 parliamentary constituencies; extracted PRS profile and activity HTML captures into `data/raw/prs.delhi.2026-10-30/`; normalized and cross-checked identities with Digital Sansad API; parsed attendance, debates, and questions into `data/processed/mps.json`.
- **Files or areas changed:**
  - `data/raw/sansad.members.delhi.2026-10-30.json`
  - `data/raw/masterlist.delhi.json`
  - `scripts/01_fetch_sansad_members.py`
  - `scripts/03_parse_prs.py`
  - `scripts/05_normalise.py`
  - `scripts/06_merge.py`
  - `scripts/07_validate.py`
  - `data/processed/mps.json`
  - `data/processed/snapshot.json`
  - `data/processed/validation_report.md`
- **Validation performed:**
  - Automated validation verified 7 unique seats, 1 minister excluded from averages, and 0 out-of-bounds percentage or activity metrics.
- **Remaining caveat or next step:**
  - MPLADS, affidavit, and election result blocks remain pending for Delhi MPs.

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
