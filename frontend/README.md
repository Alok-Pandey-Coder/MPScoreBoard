# Mera MP, Mera Report Card — Frontend

Citizen-facing web application for tracking 18th Lok Sabha MP performance records, built according to the Product Requirements Document (PRD v1.0).

## Tech Stack
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (custom civic palette, mobile-first design, accessible contrast)
- **Icons:** Lucide React
- **Routing:** React Router v6

## Key Features Implemented (PRD Requirements)
- **FR-1 [State & Constituency Picker]:** Step-by-step dropdown selector filtering constituencies by state.
- **FR-2 [Unified Search]:** Fast, typo-tolerant search (Levenshtein distance ≤ 2 for queries ≥ 4 chars) matching MP name, constituency, state, and aliases (e.g. "Manoj Tiwari" -> "Manoj Kumar Tiwari"). Includes arrow-key keyboard navigation and global shortcut (`/`).
- **FR-4 & FR-10 [Identity Header & Share]:** MP name, party badge, constituency, term ("18th Lok Sabha"), SC/GEN reservation, since date, Union Minister badge with explanation popup, and 1-click share / copy link button.
- **FR-5 [Performance Indicators]:** 4 primary indicators (Attendance %, Debates, Questions Asked, Private Member Bills) with tooltips and source info. Ministers (e.g. Harsh Malhotra) display "Not applicable (minister)" with full official procedure explanation.
- **FR-6 [Compared to Averages]:** Visual bars benchmarking the MP against state (Delhi) and national averages with neutral difference wording ("similar to", "3.0 points higher than", "lower than") and the mandatory neutrality disclaimer: *"These indicators show activity, not the quality of an MP's work."*
- **FR-7 [MPLADS Funds]:** Local area development fund breakdown (Entitlement, Released, Spent, Utilisation %, Unspent balance in ₹ Cr) with early-term guidance note.
- **FR-8 [Affidavit Disclosures]:** Declared assets, declared pending cases, and education as filed in the 2024 election affidavit, paired with explicit legal disclaimer (*declarations ≠ convictions*).
- **FR-11 & FR-12 [Explain Simply - AI & Template Summary]:** Plain-language 3-to-4 sentence summary toggleable in **English** and **Hinglish** (Roman script), protected by number guardrails (FR-14).
- **FR-13 [Take Action - Draft Letter Generator]:** Generates polite, editable citizen inquiry letters to the MP across 4 citizen intents (`mplads_works`, `parliament_question`, `attendance_clarification`, `general_feedback`) with 1-click clipboard copy and direct "Open in Email (mailto)" link.
- **FR-15 & FR-16 [Methodology & Disclaimers]:** Full documentation on `/about` and global footer with visible public attributions and academic/student disclaimer.
- **FR-18 [Compare MPs]:** Side-by-side comparison of any two MPs (`/compare?a=...&b=...`).
- **FR-17 [Custom 404]:** Graceful error page with embedded search and quick links.

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run local development server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Build for production
```bash
npm run build
```
Creates an optimized production bundle in `dist/` (gzipped size ~79 KB).

### 4. Preview production build
```bash
npm run preview
```

