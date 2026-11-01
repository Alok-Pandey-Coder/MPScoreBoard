# 🏛️ Mera MP — Delhi Parliamentary Scrutiny & Expenditure Monitor

> **"Know your representative. Track every rupee. Hold power accountable."**

[![Live Pilot](https://img.shields.io/badge/Status-Live%20Pilot-22c55e?style=flat-square)](http://localhost:3000)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-668%20Passing-22c55e?style=flat-square)](./tests)
[![License](https://img.shields.io/badge/License-MIT-f59e0b?style=flat-square)](./LICENSE)
[![Data](https://img.shields.io/badge/Data-Open%20%26%20Sourced-6366f1?style=flat-square)](./data.md)

---

## 👥 Team

| Role | Name |
|---|---|
| **Team Name** | **CubeAce** |
| Team Leader | Ayush Maurya |
| Member | Yash Gupta |
| Member | Alok Kumar Pandey |
| Member | Kishan Kumar |

---

## 🎯 Executive Summary

**Mera MP** is a neutral, source-backed civic-tech platform that gives ordinary Indian citizens a single-stop 60-second dossier on their elected Lok Sabha representatives — parliamentary attendance, questions raised, debates participated in, MPLADS expenditure, affidavit-declared assets, and criminal case status — all hyperlinked to official government sources, with zero editorial spin.

We started with all **7 Delhi Lok Sabha constituencies** (7/7 MPs audited, 100% sourced) and have expanded to **Goa (2/2 MPs audited)**, with a data architecture designed to scale to all 543 Lok Sabha seats across 36 states and union territories.

---

## 🔥 Problem Statement

### India's parliamentary accountability data is broken in three ways

#### 1. Data Fragmentation Across Dozens of Portals
A citizen who wants to understand their MP must navigate at minimum five separate government portals:
- **Sansad.in** — attendance and voting records
- **PRS Legislative Research** — bill participation and debates
- **ADR / MyNeta** — affidavit-declared assets and criminal cases (ECI Form 26)
- **MPLADS portal (Ministry of Statistics)** — constituency development fund expenditure
- **ECI (Delimitation Order)** — which ward/assembly segment belongs to which Lok Sabha seat

None of these portals cross-reference each other. None are mobile-friendly or accessible to non-English speakers. A voter with a smartphone and no technical background has almost no way to get a coherent picture of their representative in under 10 minutes.

#### 2. Partisan Scoring Apps That Mislead Citizens
Several existing "MP report card" apps use opaque proprietary scoring formulas that:
- Penalize cabinet ministers for having lower "attendance" (because ministers are constitutionally excused from many floor votes)
- Conflate FIR-stage allegations and declared criminal cases with criminal *convictions*
- Assign numerical scores without transparent methodology, making it impossible to verify or dispute
- Are funded by or affiliated with political organizations, introducing editorial bias

This poisons public discourse: citizens either distrust all data or believe misleading scorecards.

#### 3. The Delimitation Blindspot
Millions of Delhi voters do not know which Lok Sabha constituency they live in. Delhi's 290 municipal wards and 70 assembly segments are distributed across 7 parliamentary constituencies in a way that is impossible to deduce without GIS tools. After the 2008 delimitation, ward numbers were reassigned and boundaries redrawn — and no publicly accessible tool maps "I live in Ward 143" → "My Lok Sabha constituency is South Delhi" → "My MP is Ramvir Singh Bidhuri (BJP)."

---

## 🚀 What We Built

### 1. 📋 60-Second Neutral MP Dossier
Every MP gets a structured, single-page dossier with:
- **Parliamentary Metrics:** Attendance percentage, questions asked, debates participated, private member bills introduced — all sourced from Sansad API and PRS
- **Financial Disclosure:** Declared assets and liabilities from ECI Form 26 affidavit (most recent election)
- **Criminal Cases:** Declared cases as filed in affidavit — **never labelled as convictions**
- **MPLADS Expenditure:** Constituency-wise development fund spend and projects
- **AI-Generated Summary** with a zero-hallucination guardrail: the summary model is given only the structured data fields; it cannot invent or extrapolate facts not present in the source record
- Every single figure links to its primary official source URL with its retrieval date

**Neutrality guarantee:** Ministers show attendance/questions as `N/A` (not applicable) — never zero — because Parliament rules excuse ministers from ordinary floor attendance. Scores and rankings are never shown; activity metrics are presented descriptively.

### 2. 🗺️ Hyperlocal Delhi GIS Map (290 Wards + GPS Auto-Detect)
- Full interactive map of Delhi's 290 municipal wards and 7 Lok Sabha constituencies using ESRI Pure Light tiles
- One-click **"Auto-Detect My Seat"** GPS feature: browser geolocation → reverse-geocode → identify which constituency the user is in → show MP card instantly
- Color-coded ward polygons by constituency (7 distinct hues)
- Click any ward → shows which Lok Sabha block it belongs to → opens MP inspector card in sidebar
- Seat number badges rendered on map centroid for each constituency
- Mobile-responsive with accessible touch targets (44×44 CSS px minimum)

### 3. 🏖️ Goa Multi-State GIS Expansion
- Expanded the same GIS architecture to Goa's 2 Lok Sabha constituencies (North Goa + South Goa)
- Dedicated Goa constituency page with color-coded map (Emerald for North Goa, Royal Blue for South Goa)
- Full MP dossier for Shripad Yesso Naik (BJP, North Goa, Cabinet Minister) and Captain Viriato Fernandes (INC, South Goa)
- Proves the multi-state scalability of the data pipeline and GIS architecture

### 4. 🔗 Multi-Source Data Unification Pipeline
A canonical 7-step pipeline (`fetch raw → parse → normalize → merge → validate → export → serve`) that:
- Pulls from 6+ official and open-licensed sources
- Normalizes MP names, constituency spellings, and party names across sources
- Validates every record against cross-source invariants (e.g., attendance % from Sansad vs. PRS must be within ±2pp)
- Stores immutable raw captures in `data/raw/` and application-ready records in `data/processed/`
- Is fully idempotent: re-running does not delete approved records if a source fetch fails
- Runs without any database by default (flat JSON snapshot); optionally uses YugabyteDB

### 5. 🤖 AI Summary with Zero-Hallucination Guardrail
- AI narrative summary generated per MP using Gemini API
- Input to the model is **strictly constrained** to the structured data fields already in the record
- The prompt explicitly prohibits inference about anything not in the source data
- Summary is clearly labelled as AI-generated and links to the underlying source for every claim
- Bilingual: English and Hindi (हिन्दी) supported in UI

### 6. 🌐 Bilingual English / Hindi Interface
- Full UI available in English and Hindi
- State names shown with Devanagari script: दिल्ली, गोवा / गोवा, महाराष्ट्र
- Font stack optimized for Devanagari readability on mobile

---

## 📊 Data Sources

| Source | URL | Retrieval Method | License | Fields Provided |
|---|---|---|---|---|
| **Digital Sansad Member API** | `https://sansad.in/api_ls/member` | REST API (JSON) | Government open data | Attendance %, questions asked, debates, bills |
| **PRS Legislative Research** | `https://prsindia.org` | HTML scrape + CC export | CC BY 4.0 | Bill participation, committee membership, debate transcripts |
| **ADR / MyNeta** | `https://myneta.info` | ECI Form 26 affidavit PDFs | Discovery only; ECI Form 26 is public | Declared assets, liabilities, criminal cases |
| **ECI Form 26 Affidavits** | `https://affidavit.eci.gov.in` | Public affidavit portal download | Public domain (government record) | Assets, liabilities, criminal case declarations |
| **Ministry of Statistics — MPLADS** | `https://mplads.gov.in` | Public portal export | Government open data | Constituency development fund allocation and expenditure |
| **DataMeet — Delhi PC Boundary** | `https://datameet.org` | GeoJSON download | CC BY 4.0 | Delhi parliamentary constituency polygons |
| **DataMeet — Delhi Ward Boundary** | `https://datameet.org` | GeoJSON download | CC BY 4.0 | Delhi 290 municipal ward polygons |
| **Goa PC Boundary** | Custom processed | GeoJSON from delimitation order | Public domain | Goa 2 PC polygons (North Goa, South Goa) |
| **ESRI / OpenStreetMap Tiles** | ESRI basemap tiles | Tile CDN | ESRI tile usage terms | Base map rendering for GIS components |
| **ECI Delimitation Orders** | `https://eci.gov.in` | PDF + official gazette | Public domain (government order) | Ward-to-constituency mapping |

> **Licensing note:** PRS data is used for discovery and cross-checking only; published figures are sourced from official Sansad API and ECI records where available. ADR/MyNeta used for discovery; affidavit figures published only from ECI Form 26 primary source.

---

## ⚙️ Data Pipeline

```
fetch raw  →  parse  →  normalize  →  merge  →  validate  →  export  →  serve
```

| Step | Description | Scripts/Files |
|---|---|---|
| **1. Fetch Raw** | Pull from Sansad API, PRS, ADR, MPLADS portals. Store immutable captures in `data/raw/` with source URL and retrieval date | `scripts/fetch_*.py` |
| **2. Parse** | Extract structured fields from API JSON, HTML, and PDF sources | `scripts/parse_*.py` |
| **3. Normalize** | Standardize MP names, constituency slugs, party names, number formats across all sources | `scripts/normalize.py` |
| **4. Merge** | Join records across sources on `(state, constituency_slug)` — names used only as secondary confirmation | `scripts/merge.py` |
| **5. Validate** | Cross-source invariant checks, null-vs-zero audit, minister N/A checks, criminal case labelling audit | `scripts/validate.py` |
| **6. Export** | Write `data/processed/mps.json` and constituency GeoJSON files | `scripts/export.py` |
| **7. Serve** | Next.js API routes serve JSON; React components render dossiers | `app/api/`, `components/` |

**Idempotency guarantee:** If a source fetch fails during refresh, the last approved record for that MP is preserved. No approved record is ever deleted by a failed refresh.

---

## 🛠️ Tech Stack

| Layer | Technology | Version | Why |
|---|---|---|---|
| **Frontend Framework** | Next.js | 16 (App Router) | SSR for SEO, fast page loads, file-based routing |
| **UI Library** | React | 19 | Component model, server components for data fetching |
| **Language** | TypeScript | 5 | Type safety across data pipeline and UI |
| **Styling** | Tailwind CSS | 3 | Utility-first, design token consistency, dark mode |
| **GIS / Maps** | Leaflet + ESRI Tiles | 1.9 | Open-source GIS, ESRI high-quality basemap tiles |
| **Data Scripts** | Python | 3.14 | Data fetching, normalization, validation pipeline |
| **Database (optional)** | YugabyteDB / PostgreSQL | Latest | PostgreSQL-compatible, horizontally scalable |
| **AI Summaries** | Gemini API | Latest | Zero-hallucination constrained summary generation |
| **Testing** | Vitest + Testing Library | Latest | 668 tests across unit, integration, and API parity |
| **GeoJSON Processing** | Custom Python scripts | — | Ward-to-constituency mapping, boundary simplification |
| **Deployment** | Vercel / Node.js | — | Zero-config Next.js deployment |

---

## 📱 How to Use the Product

### Finding Your MP

1. **Visit the homepage** → See the state cards grid. Delhi and Goa are live pilots.
2. **Click "Delhi"** → Opens the Delhi constituency explorer with the full 290-ward interactive map.
3. **Browse the map** → Each colored region is a Lok Sabha constituency. Hover to see its name.
4. **Click any ward or constituency** → The sidebar shows the MP's name, party, and key metrics.
5. **Click "View Full Dossier"** → Opens the complete MP report card page.

### Using GPS Auto-Detect (Delhi)

1. Open the Delhi map page.
2. Click the **"⚡ Auto-Detect My Seat"** amber button.
3. Allow location access in your browser when prompted.
4. The map zooms to your location, highlights your constituency, and shows your MP's card instantly.

### Reading an MP Dossier

Each dossier page shows:
- **Attendance %** — How often the MP was present in Parliament sessions (source: Sansad API)
- **Questions Asked** — Starred and unstarred questions raised in the house
- **Debates** — Number of debates participated in
- **Private Member Bills** — Bills introduced by the MP
- **Assets & Liabilities** — As declared in the most recent election affidavit (ECI Form 26)
- **Criminal Cases** — Declared cases as filed in affidavit (**allegations only, never convictions**)
- **MPLADS Spend** — Constituency development fund allocation and expenditure
- **AI Summary** — Plain-language summary generated strictly from the above data fields

> ℹ️ **Ministers:** For cabinet ministers, attendance, questions, and debate metrics show as **"Not Applicable"** — ministers are constitutionally excused from ordinary floor attendance. This is never shown as zero.

### Understanding Source Links

Every figure on the dossier has a 🔗 source icon. Clicking it opens the original government document, API response, or affidavit PDF so you can verify the data yourself. The retrieval date is shown so you know how current the data is.

### Comparing MPs (Delhi)

1. From the Delhi state page, scroll down to the **MP Directory** section.
2. Browse all 7 Delhi MPs with their key metrics side by side.
3. Metrics are shown as raw numbers — no scoring, no ranking. Draw your own conclusions.

---

## 💻 Local Development Setup

### Prerequisites

- **Node.js** 20 or later
- **npm** 10 or later
- **Python** 3.10+ (for data pipeline scripts only — not needed to run the website)
- **Git**

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-org/MPScoreBoard.git
cd MPScoreBoard

# 2. Install dependencies
npm ci

# 3. Start the development server
npm run dev
# → http://localhost:3000
```

**No database or Docker required.** The site reads the reviewed JSON snapshot from `data/processed/mps.json` by default.

### Optional: YugabyteDB (PostgreSQL-compatible)

```bash
# Start local YugabyteDB
docker compose up -d yugabyte

# Install Python dependencies
pip install -r requirements.txt

# Set connection string
export DATABASE_URL=postgresql://yugabyte:yugabyte@localhost:5433/yugabyte

# Load the approved snapshot
python scripts/load_db.py --schema

# Start the dev server
npm run dev
```

| `DATABASE_URL` | Data Source Used |
|---|---|
| Not set (default) | JSON snapshot (`data/processed/mps.json`) |
| Set, database running | YugabyteDB (latest loaded snapshot) |
| Set, database not reachable | JSON snapshot (with server-log warning) |

`/api/health` shows which source is active (`dataSource` field).

---

## 🧪 Running Tests

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# All tests (668 tests, 10 suites)
npm test

# Full CI check
npm run typecheck && npm run lint && npm test && npm run build

# Data pipeline tests
npm run test:data

# Rebuild data snapshot from cached raw captures (no network)
npm run data:build

# Fetch sources and rebuild (network required)
npm run data:refresh
```

---

## ⚖️ Ethical & Neutrality Guardrails

We hold ourselves to strict neutrality rules — hardcoded into the data pipeline, not just editorial policy:

- **No scores, no rankings.** Activity metrics are always shown as raw descriptive numbers. We never compute an "MP score."
- **Ministers get N/A, never zero.** Cabinet ministers are constitutionally excused from ordinary floor attendance. Showing zero would be misleading. The `is_minister` flag triggers N/A display for attendance and some activity metrics.
- **Allegations ≠ convictions.** All criminal case data comes from self-declared affidavits. Every mention is clearly labelled as "declared cases" or "allegations," never as criminal convictions.
- **`null` for missing data, never zero.** If a data point is unavailable, it is stored as `null` and shown as "—" in the UI. Converting missing data to zero would misrepresent the record.
- **Zero-hallucination AI guardrail.** The AI summary model receives only the structured data fields. The prompt explicitly prohibits inference about anything not in the source record.
- **Source URL + date required.** No fact is published without a source URL and retrieval date. Users can verify every figure themselves.
- **No "publish until source is clear" rule.** Facts are not published until their source and review status are confirmed in the validation step.
- **Data preserved on fetch failure.** If a source refresh fails, the last approved record is preserved — never deleted or zeroed out.
- **No partisan affiliation.** The platform has no political funding, affiliation, or sponsorship. It covers all parties uniformly using the same data sources.

---

## 🗺️ Current Coverage & Roadmap

### Live Pilot Coverage

| State | Seats | MPs Audited | Status |
|---|---|---|---|
| **Delhi** | 7 | 7 / 7 | ✅ Live — 100% Sourced |
| **Goa** | 2 | 2 / 2 | ✅ Live — 100% Sourced |

### Roadmap

| Phase | Target | Timeline |
|---|---|---|
| **Phase 1 (Current)** | Delhi (7) + Goa (2) full dossiers with GIS maps | ✅ Complete |
| **Phase 2** | Maharashtra (48), Karnataka (28), UP (80) — high-priority states | Q1 2025 |
| **Phase 3** | Remaining 36 states and union territories — all 543 Lok Sabha seats | 2025–2026 |
| **Phase 4** | Rajya Sabha expansion, MPLADS deep-dive, constituency-level project tracker | 2026 |

---

## 📁 Repository Structure

```
MPScoreBoard/
├── app/                        # Next.js App Router pages and API routes
│   ├── api/                    # API routes (geojson, mp data, health)
│   ├── mp/[slug]/              # MP dossier page
│   ├── state/[state]/          # State exploration page
│   └── page.tsx                # Homepage
├── components/                 # React components
│   ├── home/                   # Homepage components (state cards, atlas map)
│   ├── map/                    # GIS map components (Delhi, Goa)
│   ├── mp/                     # MP dossier components
│   └── state/                  # State exploration components
├── data/
│   ├── raw/                    # Immutable source captures (never edit)
│   └── processed/
│       ├── mps.json            # Master MP record (9 MPs: 7 Delhi + 2 Goa)
│       ├── delhi_wards.json    # Delhi 290-ward GeoJSON
│       └── goa_pc.json         # Goa 2-PC GeoJSON
├── lib/                        # Data access, utility functions
├── scripts/                    # Python data pipeline scripts
├── __tests__/                  # Test suites
├── docs/
│   ├── context.md              # Current product context
│   ├── plan.md                 # Implementation plan
│   └── dataSources.md          # Data source documentation
├── data.md                     # Master data registry (catalog + dictionary)
├── logs.md                     # Changelog (append-only)
└── PRD.md                      # Product requirements document
```

---

## 🏆 Hackathon Judging Criteria Alignment

| Criteria | Our Approach |
|---|---|
| **Innovation** | First neutral MP report card with mathematical zero-hallucination AI guardrail and ward-level GPS auto-detect |
| **Impact** | Serves 1.4B citizens; Delhi alone has 14M+ voters who can now find their MP in 10 seconds |
| **Technical Depth** | 7-step idempotent data pipeline, 668 tests, multi-source data unification, GIS with 290-polygon rendering |
| **Social Value** | Strict neutrality rules, accessibility (WCAG 2.2 AA), bilingual English/Hindi, no scores/rankings |
| **Scalability** | Architecture proven across 2 states (9 MPs); designed for 543-seat national rollout |
| **Data Quality** | Every fact sourced from official government portals with retrieval date and source URL |

---

## 🙏 Acknowledgements

We are grateful to the following organizations for making their data publicly available:

- **Digital Sansad / Lok Sabha Secretariat** — MP activity data API
- **PRS Legislative Research** — Legislative research and bill tracking (CC BY 4.0)
- **Association for Democratic Reforms (ADR) / MyNeta** — Affidavit discovery
- **Election Commission of India (ECI)** — Form 26 affidavit portal, delimitation orders
- **Ministry of Statistics and Programme Implementation** — MPLADS data
- **DataMeet India** — Delhi boundary GeoJSON datasets (CC BY 4.0)
- **ESRI / OpenStreetMap contributors** — Basemap tiles and geographic data

---

## 📄 License

MIT License. See [LICENSE](./LICENSE) for details.

Data is sourced from public government records and open-licensed datasets. See [data.md](./data.md) for per-dataset licensing.

---

*For product context, see [docs/context.md](./docs/context.md). For data catalog and dictionary, see [data.md](./data.md). For project history and changelog, see [logs.md](./logs.md).*
