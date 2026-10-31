# Project Change Log

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
