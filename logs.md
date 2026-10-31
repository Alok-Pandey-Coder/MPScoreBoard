# Project Change Log — "Mera MP, Mera Report Card"

This file records key data changes, pipeline updates, schema modifications, and source additions in reverse chronological order, as mandated by repository guidelines.

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
