# 🏛️ Mera MP: Parliamentary Scrutiny & Expenditure Monitor

> **Know your representative. Track every rupee. Hold power accountable.**

[![Status](https://img.shields.io/badge/Status-Live%20Pilot-22c55e?style=flat-square)](https://mp-score-board.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-670%2B%20Automated-22c55e?style=flat-square)](./__tests__)
[![License](https://img.shields.io/badge/License-MIT-f59e0b?style=flat-square)](./LICENSE)
[![Data](https://img.shields.io/badge/Data-Open%20%26%20Sourced-6366f1?style=flat-square)](./data.md)

**Team CubeAce** · Ayush Maurya (Lead) · Yash Gupta · Alok Kumar Pandey · Kishan Kumar

<img width="1917" height="1030" alt="image" src="https://github.com/user-attachments/assets/72ba1fbb-65bd-4db4-b898-3ec404e92497" />

---

## 🔗 Live Demo

| | |
|---|---|
| 🌐 **Live app** | [https://mp-score-board.vercel.app/](https://mp-score-board.vercel.app/) |
| 🎬 **Demo video** | `<add video URL>` |
| 💻 **Source** | https://github.com/Alok-Pandey-Coder/MPScoreBoard |

<!-- Add 2–3 screenshots here: homepage state picker, Delhi map with pincode / location lookup, an MP report card -->

---

## ⚡ In 30 Seconds

**Mera MP** ([live at mp-score-board.vercel.app](https://mp-score-board.vercel.app/)) gives any Indian citizen a **60-second, source-backed report card** on their Lok Sabha MP: attendance, questions, debates, MPLADS spending, declared assets, and declared criminal cases. Pick your state, find your constituency on its map, and open the report card. Every figure links to its official source. There are **no scores, no rankings and no editorial spin.**

| | |
|---|---|
| **Delhi** | 7 / 7 MPs audited, interactive ward-level map, "Find my constituency" by pincode or location |
| **Goa** | 2 / 2 MPs audited, its own constituency map and location lookup, proving the pipeline works across states |
| **Quality** | 670+ automated tests, 7-step idempotent data pipeline |
| **Access** | Bilingual (English / हिन्दी), mobile-first, WCAG 2.2 AA-oriented |

---

## 🔥 The Problem

**1. Fragmented data.** Understanding one MP means visiting at least five portals (Sansad, PRS, MyNeta/ADR, ECI affidavits, MPLADS). None cross-reference each other, and most are hard to use on a phone or in Hindi.

**2. Misleading scorecards.** Many "MP report cards" use opaque scoring formulas that penalise ministers for low floor attendance, blur *declared cases* with *convictions*, and are often tied to political groups. Citizens end up distrusting all data.

**3. "Which constituency am I even in?"** Delhi's municipal wards and assembly segments map to 7 parliamentary seats in ways that are not obvious. No simple public tool answers *"I live in Ward X, so who is my MP?"*

---


## 🚀 What We Built

### 1. 📋 60-Second Neutral MP Report Card
- **Parliamentary activity:** attendance, questions, debates, private member bills (Sansad API, PRS)
- **Financials:** declared assets and liabilities (ECI Form 26, latest election)
- **Criminal cases:** *declared* cases from the affidavit, never presented as convictions
- **MPLADS:** constituency development fund allocation and spend
- **Provenance:** every figure carries its **source link and retrieval date**

### 2. 🗺️ State-by-State Region Maps and Find My Constituency
- **No default map.** Choose any of the 36 states and union territories from a card picker (six per page, with a landmark icon for each); the India atlas, Explore page and state pages open the same region map, and a state switcher on every state page moves you between states
- **Delhi:** interactive map of municipal wards and 7 Lok Sabha constituencies (Leaflet + ESRI tiles); click any ward to see its constituency and open the MP card
- **Find my constituency:** type a **6-digit pincode** (Delhi) or tap **Use my location**; the match is focused on the map and opens the MP card. Your pincode or location is used only for the lookup and is not stored
- Colour-coded constituencies, seat badges, touch targets of at least 44×44 px

### 3. 🏖️ Multi-State Proof: Goa
The same GIS and data architecture was extended to North Goa and South Goa with no code redesign: real constituency boundaries on the same Esri basemap as Delhi, exact point-in-polygon location lookup, official MP portraits, and report cards for both seats. This shows the platform scales state by state. (Pincode lookup for Goa is not available yet because no authoritative pincode-to-constituency source is cleared.)

### 4. 🔗 Multi-Source Data Unification Pipeline
Combines 6+ official and open-licensed sources into one validated dataset with cross-source checks (for example, Sansad vs PRS attendance must agree within ±2 percentage points). Details below.

### 5. 🤖 Constrained AI Summary
A Gemini-generated plain-language summary per MP. The model receives **only the structured fields already in the record**, and the prompt forbids inference beyond them. Every number is checked against the record, and a fixed template replaces the summary if a check fails. Summaries are labelled as AI-generated and sit next to the underlying sources. A separate **Chat with AI** assistant answers questions from the same retrieved records.

### 6. 🌐 Bilingual Interface
Full English and Hindi UI with a font stack tuned for Devanagari on mobile. State names, labels, the Compare page and the state list order are identical in both languages; MP and constituency names are shown as published.

---

## ⚖️ Neutrality by Design

These rules are **enforced in the pipeline and validation tests**, not just stated as policy.

| Principle | How we enforce it |
|---|---|
| **No scores or rankings** | We never compute an "MP score". Metrics are shown as raw descriptive numbers. |
| **Ministers get N/A, not zero** | An `is_minister` flag switches attendance and activity metrics to "Not Applicable", because ministers are excused from ordinary floor attendance. |
| **Allegations ≠ convictions** | Criminal data is labelled "declared cases" everywhere. A validation audit checks the labelling. |
| **`null` is never `0`** | Missing data is stored as `null` and shown as "—". |
| **Source or it doesn't ship** | No fact is published without a source URL, retrieval date and review status. |
| **Failure-safe refresh** | If a source fetch fails, the last approved record is preserved, never deleted or zeroed. |
| **Constrained AI** | The summariser sees only sourced fields and may not infer beyond them. |
| **Non-partisan** | No political funding or affiliation. Every party is covered with the same sources and the same method. |

---

## ⚙️ Data Pipeline

```
fetch raw → parse → normalize → merge → validate → export → serve
```

| Step | What happens | Where |
|---|---|---|
| 1. Fetch | Pull from Sansad, PRS, ECI, MPLADS, plus official portraits. Store immutable captures with source URL and date | `scripts/01_*`, `02_*`, `10_*`, `11_fetch_portraits.py` → `data/raw/` |
| 2. Parse | Extract fields from JSON, HTML and PDF | `scripts/03_parse_prs.py` |
| 3. Normalize | Standardise MP names, constituency slugs, party names, number formats | `scripts/05_normalise.py` |
| 4. Merge | Join on `(state, constituency_slug)`; names used only as secondary confirmation | `scripts/06_merge.py` |
| 5. Validate | Cross-source invariants, null-vs-zero audit, minister N/A check, criminal-label audit | `scripts/07_validate.py` |
| 6. Export | Write `mps.json`, the snapshot and constituency GeoJSON | `scripts/08_snapshot.py`, `build_state_pc_geojson.py` → `data/processed/` |
| 7. Serve | Next.js API routes and React components | `app/api/`, `components/` |

The pipeline is **idempotent** and **database-optional**. By default it runs from a flat JSON snapshot, with optional YugabyteDB/PostgreSQL.

---

## 📊 Data Sources

| Source | Provides | Licence / status |
|---|---|---|
| [Digital Sansad Member API](https://sansad.in/api_ls/member) | Attendance, questions, debates, bills | Government open data |
| [PRS Legislative Research](https://prsindia.org) | Bill participation, committees, debates (cross-check) | CC BY 4.0 |
| [ECI Form 26 Affidavits](https://affidavit.eci.gov.in) | Assets, liabilities, declared cases | Public record |
| [ADR / MyNeta](https://myneta.info) | Affidavit **discovery only**; figures published from ECI primary source | Discovery only |
| [MPLADS Portal](https://mplads.gov.in) | Fund allocation and expenditure | Government open data |
| [DataMeet](https://datameet.org) | Delhi and Goa parliamentary constituency boundaries (2019) | CC BY 4.0 |
| [ECI Delimitation Orders](https://eci.gov.in) | Ward/segment → constituency mapping | Public domain |
| Digital Sansad portraits | Official MP portraits shown on report cards | Reuse terms not yet confirmed |
| [IconOven](https://iconoven.com/icons) / [Hugeicons](https://hugeicons.com) via [Iconify](https://iconify.design) | Landmark icons on state cards | MIT |
| ESRI / OpenStreetMap | Basemap tiles | Per provider terms |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 3 |
| Maps / GIS | Leaflet 1.9 + ESRI tiles, custom Python GeoJSON processing |
| Data pipeline | Python 3 scripts, flat-JSON snapshot, optional YugabyteDB / PostgreSQL |
| AI | Gemini API (input-constrained summaries) |
| Testing | Jest (670+ tests) and pytest for the data pipeline |
| Deployment | Vercel ([live app](https://mp-score-board.vercel.app/)) / Node.js |

---

## 📱 How to Use

1. **Open the [live app](https://mp-score-board.vercel.app/)** and pick a state or union territory from the cards (**Delhi** and **Goa** have report cards), or click a state on the India map.
2. **Find your seat.** Enter your **6-digit pincode** (Delhi) or tap **Use my location**, or click any ward or constituency on the map.
3. **Open the MP card** in the sidebar, then **View Full Report Card**.
4. **Verify anything.** Click the 🔗 icon beside any figure to open the original government source, with its retrieval date.
5. **Compare MPs** on the Compare page, and **switch state** from the dropdown on any state page. Raw numbers only, no ranking.

> ℹ️ For ministers, attendance, questions and debates show **"Not Applicable"**, never zero.

---

## 💻 Run It Locally

**Requirements:** Node.js 20+, npm 10+, Git. Python 3.10+ is needed only for the data pipeline.

```bash
git clone https://github.com/Alok-Pandey-Coder/MPScoreBoard.git
cd MPScoreBoard
npm ci
npm run dev        # → http://localhost:3000  (or use the live app above)
```

No database or Docker is required. The app reads `data/processed/mps.json` by default.

<details>
<summary><b>Optional: YugabyteDB / PostgreSQL</b></summary>

```bash
docker compose up -d yugabyte
pip install -r requirements.txt
export DATABASE_URL=postgresql://yugabyte:yugabyte@localhost:5433/yugabyte
python scripts/load_db.py --schema
npm run dev
```

| `DATABASE_URL` state | Data source used |
|---|---|
| Not set | JSON snapshot |
| Set, DB reachable | YugabyteDB |
| Set, DB unreachable | JSON snapshot (warning logged) |

`/api/health` reports the active source in the `dataSource` field.
</details>

### Tests and Data Commands

```bash
npm run typecheck && npm run lint && npm test && npm run build   # full CI check
npm run test:data       # data pipeline tests
npm run data:build      # rebuild snapshot from cached raw captures (offline)
npm run data:refresh    # fetch sources and rebuild (network)
```

---

## 🗺️ Coverage and Roadmap

| Phase | Scope | Status |
|---|---|---|
| **1** | Delhi (7) + Goa (2) with full report cards and GIS | ✅ Complete |
| **2** | Maharashtra (48), Karnataka (28), Uttar Pradesh (80) | 🔜 Next |
| **3** | All remaining states and UTs, all 543 Lok Sabha seats | Planned |
| **4** | Rajya Sabha, MPLADS deep-dive, project-level tracker | Planned |

---

## 🏆 Why This Deserves to Win

| Criterion | Our answer |
|---|---|
| **Innovation** | A neutral MP report card with an input-constrained AI summariser and pincode / location-based constituency lookup. |
| **Impact** | Helps first-time and non-technical voters find and verify their MP in seconds. Delhi alone has over 14M voters. |
| **Technical depth** | 7-step idempotent pipeline, cross-source validation, 670+ tests, GIS with hundreds of polygons. |
| **Social value** | Strict neutrality rules, bilingual, accessible, and no scores or rankings that could mislead. |
| **Scalability** | Proven on 2 states with no redesign and deployed at [mp-score-board.vercel.app](https://mp-score-board.vercel.app/); architected for all 543 seats. |
| **Data quality** | Every fact has a primary-source URL and retrieval date. |

---

## 📁 Repository Structure

```
MPScoreBoard/
├── app/            # Next.js pages and API routes (mp/[slug], state/[state], api/)
├── components/     # home/, map/, mp/, state/, compare/, chat/
├── data/
│   ├── raw/        # Immutable source captures (never edit)
│   └── processed/  # mps.json, delhi_wards_enriched.geojson, goa_pc.geojson, state_icons.json
├── lib/            # Data access and utilities
├── scripts/        # Python pipeline
├── __tests__/      # Test suites
├── docs/           # context.md, plan.md, dataSources.md
├── data.md         # Data catalog and dictionary
├── logs.md         # Append-only changelog (newest entry at the bottom)
└── PRD.md          # Product requirements
```

---

## 🙏 Acknowledgements

Digital Sansad / Lok Sabha Secretariat · PRS Legislative Research · ADR / MyNeta · Election Commission of India · MoSPI (MPLADS) · DataMeet India · ESRI and OpenStreetMap contributors.

## 📄 License

MIT. See [LICENSE](./LICENSE). Data comes from public government records and open-licensed datasets; per-dataset licensing is in [data.md](./data.md).
