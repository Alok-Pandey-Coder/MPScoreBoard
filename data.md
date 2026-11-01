# Data Architecture & Master Registry — "Mera MP, Mera Report Card"

> **Version:** 1.4 · **Date:** 2026-11-01  
> **Repository:** `d:\MPScoreBoard`  
> **Companion Documents:** `AGENTS.md`, `PRD.md`, `PlanV2.md`, `docs/dataSources.md`

---

## 1. Data Architecture Overview

The repository enforces a strict, three-tier data hierarchy to guarantee that raw captures remain immutable, application payloads load in under 100ms, and legacy civic research data is organized without polluting the project root.

```
d:\MPScoreBoard\data\
│
├── processed/                           # ACTIVE APPLICATION PAYLOADS
│   ├── mps.json                         # Canonical dataset: ONE combined export for every registered state, sorted by slug
│   ├── snapshot.json                    # Snapshot metadata ("18ls-v3"), per-state coverage, timestamp & SHA-256 hash
│   ├── aliases.json                     # Normalisation aliases (constituency & MP name variants)
│   ├── validation_report.md             # Automated test proof of zero data errors & exact averages
│   ├── data_dictionary.md               # Technical field types & nullability specifications
│   ├── delhi_pc.json                    # 7 PC polygons + centres used by the app (lib/data.ts, /api/geojson?type=pc, /api/locate); built by scripts/build_delhi_pc_geojson.js
│   ├── delhi_wards_enriched.geojson     # MCD ward polygons tagged with their PC, served by /api/geojson for the home map; built by scripts/enrich_wards.js
│   ├── state_icons.json                 # Outline landmark icon per state card (IconOven/Hugeicons via Iconify, MIT): icon id, label, source URL, licence, retrieved date; files in public/icons/states/; built by scripts/12_fetch_state_icons.py; credits on /about
│   ├── state_images.json                # Monument/emblem picture per state card (file under public/images/states/, subject, source URL, licence, author, retrieved date); empty until pictures are added; read by lib/stateImages.ts, credits shown on /about
│   ├── goa_pc.geojson                   # 2 Goa Lok Sabha PC polygons (DataMeet 2019, CC-BY-4.0, unchanged for the 18th LS); slug = MP slug; served by /api/geojson?state=goa; built by scripts/build_state_pc_geojson.py from raw/india_pc_2019_simplified.geojson
│   ├── delhi_pc_boundaries.geojson      # 7 Delhi Lok Sabha PC boundaries (DataMeet CC-BY-4.0); input to the geo build scripts, not read by the app
│   ├── delhi_regional_hierarchy.json    # 7 PCs × 10 MLAs with affidavit & party data; NOT read by the app (out of current scope)
│   ├── delhiConstituenciesGeo.json      # 7 Delhi Lok Sabha constituencies GeoJSON with centroids; NOT read by the app (superseded by delhi_pc.json)
│   ├── prs.parsed.delhi.json            # Intermediate PRS parse (03_parse_prs.py)
│   ├── prs.parsed.goa.json              # Intermediate PRS parse for Goa (03_parse_prs.py)
│   ├── normalised.delhi.json            # Intermediate normalised records before merge
│   ├── normalised.goa.json              # Intermediate normalised Goa records (identity master: Digital Sansad)
│   ├── mplads.delhi.json                # Intermediate MPLADS blocks per seat (09_intake_mplads.py) + raw source values
│   ├── mps.india.json                   # UNVALIDATED, NOT FOR PUBLICATION (see 2.4); unused by the app
│   └── validation_report_india.md       # UNVALIDATED, NOT FOR PUBLICATION (see 2.4)
│
├── raw/                                 # ACTIVE IMMUTABLE SOURCE CAPTURES
│   ├── masterlist.delhi.json            # Reviewed transcription of the Delhi Government MP list (pipeline input)
│   ├── delhi_members.<date>.html        # Dated captures of that page; the refresh flags wording changes for review
│   ├── sansad.members.delhi.<date>.json # Official Digital Sansad API captures (2026-10-30, 2026-11-01); latest is used
│   ├── prs.delhi.<date>/                # PRS profile pages for all 7 MPs (2026-10-30, 2026-11-01); latest complete capture is used
│   ├── sansad.members.goa.2026-11-01.json # Official Digital Sansad API capture for Goa (2 MPs); Goa's identity master
│   ├── prs.goa.json                     # Reviewed PRS URL manifest for the 2 Goa MPs (input to 02_fetch_prs.py --state goa)
│   ├── prs.goa.2026-11-01/              # PRS profile pages for both Goa MPs (CC BY 4.0), all-or-nothing capture
│   ├── eci.results.goa.fetch_log.2026-11-01.json # Log of the polite ECI 2024 results attempts for Goa (all 404; nothing captured)
│   ├── mp_portraits.delhi.2026-11-01.json # Official Sansad portrait URLs + image paths, carried into mps.json by 06_merge
│   ├── mp_portraits.goa.2026-11-01.json   # Goa portraits fetched by scripts/11_fetch_portraits.py (Sansad mpsno photo URLs), merged the same way; image files in public/images/mps/
│   ├── sansad.members.india.2026-10-31.json # All-India 544-seat Sansad API capture (retrieved 2026-10-31)
│   ├── prs.india.manifest.2026-10-31.json   # All-India 553-member PRS directory manifest with metrics
│   ├── india_pc_2019_simplified.geojson # DataMeet All-India 543 PC boundaries raw (CC-BY-4.0)
│   ├── mplads.delhi.empoweredindian.2026-10-31.json # Empowered Indian MPLADS API raw capture (7 Delhi MPs, rupees, 20 works each)
│   ├── mplads.delhi.janwatchdog.2026-10-06.csv     # JanWatchdog MPLADS summary (7 seats, crore) - cross-check only
│   └── delhi_7mp_custom_enrichment.json # User intake: election results (its legacy `mplads` key is ignored by the pipeline)
│
└── reference_packs/                     # EXTERNAL & CIVIC PACKS (MCD, MLAs & Affidavits)
    ├── officials_enriched_pack/         # ⭐ Contains 7 Lok Sabha MP affidavit records & ADR MHT documents
    ├── officials_data_pack/             # Predecessor 70 MLA + 7 MP base roster & validation reports
    ├── mcd_pms_expansion_2026-10-31/    # MCD PMS municipal projects, tenders & zone aggregate counts
    ├── mcd_councillor_collection_ws2/   # 250 MCD ward councillors & local election history
    └── delhi_jurisdiction_collection_01/# Ward-to-assembly-to-parliament boundary registers
                                         #   incl. assembly_to_parliamentary_mapping.csv (70 AC→PC rows)
```

---

## 2. Canonical Product Registry (`data/processed/mps.json`)

`mps.json` is the sole data contract consumed by the application front-end. It contains **9 records**: Delhi's 7 and Goa's 2 18th Lok Sabha parliamentary constituencies, sorted by slug. It is built by the multi-state pipeline: every step loops over the state registry `scripts/states.py` (key, display name, Digital Sansad state name, identity master, seat count, cleared sources, and the reason each pending block is pending).

| State | Key | Seats | Identity master | Sansad state name | MPLADS | Affidavit | Election |
|:---|:---|:---|:---|:---|:---|:---|:---|
| Delhi | `delhi` | 7 | Reviewed GNCTD roster `masterlist.delhi.json` (Sansad + PRS confirm) | `NCT of Delhi` | Empowered Indian (secondary) | ADR/MyNeta reference pack | Reviewed intake `delhi_7mp_custom_enrichment.json` |
| Goa | `goa` | 2 | Digital Sansad member API capture `sansad.members.goa.<date>.json` (PRS confirms) | `Goa` | **pending** | **pending** | **pending** |

### 2.1 The 6 Data Blocks

| Block | Source | Grain / Coverage | Current Status |
|:---|:---|:---|:---|
| **1. Identity** | Digital Sansad / GNCTD | Per MP: Name, seat, state, party, reservation, term, `sansad_mpsno`, `is_minister` | **100% Complete** |
| **2. Profile** | PRS Legislative Research | Per MP: Age, gender, education, term number, source provenance | **100% Complete** |
| **3. Performance** | PRS Legislative Research | Per MP: Attendance %, debates, questions, private member bills, state/national averages | **100% Complete** (6 reported, 1 minister `not_applicable`) |
| **4. Affidavit** | ADR / MyNeta / ECI | Per MP: Declared criminal cases, total assets, liabilities, education, original citation | **100% Complete** (7/7 reported & cross-checked) |
| **5. MPLADS** | Empowered Indian (aggregating MoSPI eSAKSHI); JanWatchdog cross-check | Per MP: allocated, recommended, spent, unspent (crore), expenditure % and recommended % (computed), works counts, partial works list, cross-check | **7/7 reported, review_status `secondary_only`** (official eSAKSHI cross-check pending; works lists partial: 20 per seat) |
| **6. Election** | Election Commission of India | Per MP: 2024 winning votes, runner-up name/party/votes, margin | **100% Complete** (7/7 reported via ECI 2024 results) |

### 2.2 Field-by-Field Technical Specifications

```typescript
interface MPRecord {
  slug: string;                          // Format: {constituency}-{state} (e.g. "new-delhi-delhi")
  name: string;                          // Full official name
  constituency: string;                  // Official constituency name (e.g. "North West Delhi (SC)")
  state: string;                         // Registry display name: "Delhi" | "Goa"
  party: string;                         // Short party code (e.g. "BJP")
  party_full: string;                    // "Bharatiya Janata Party"
  reservation: "GEN" | "SC" | "ST";      // Reservation category
  term: string;                          // "18th Lok Sabha"
  since_date: string;                    // "2024-06-09"
  is_minister: boolean;                  // True if Minister of State / Cabinet Minister
  special_role: string | null;           // Speaker / Deputy Speaker / null
  sansad_mpsno: number;                  // Official Digital Sansad member ID
  sansad_status: "Sitting" | "Former";   // Current seat status
  identity_review_status: string;        // "cross_checked"
  image_url?: string;                    // Static public path to official portrait (e.g. "/images/mps/{slug}.jpg"); absent when none captured; fetched by scripts/11_fetch_portraits.py --state KEY
  image_source?: SourceProvenance;       // Digital Sansad official portrait provenance; absent with image_url
  
  profile: {
    age: number | null;
    gender: "Male" | "Female" | "Other" | null;
    education: string | null;
    term_number: string | null;
    as_of: string;
    source: SourceProvenance;
  };

  performance: {
    status: "reported" | "not_applicable"; // Ministers MUST be "not_applicable"
    attendance_pct: number | null;         // 0 to 100 (null for ministers)
    debates: number | null;                // null for ministers
    questions: number | null;              // null for ministers
    private_member_bills: number | null;   // null for ministers
    period: { from: string; to: string };  // "2024-06-24" to "2026-08-13"
    as_of: string;
    prs_averages: {
      national: AveragesBlock;
      state: AveragesBlock;
    };
    source: SourceProvenance;
  };

  affidavit: {
    status: "reported" | "pending";
    election_year: number | null;
    assets: number | null;                 // Total assets in INR
    liabilities: number | null;            // Total liabilities in INR
    declared_criminal_cases: number | null;// Count of declared pending cases (never labeled "criminal")
    education: string | null;
    as_of: string | null;
    source: SourceProvenance | null;
  };

  mplads: {                              // Contract: MpladsData in types/mp.ts (snake_case)
    status: "reported" | "pending" | "not_applicable";
    annual_entitlement_cr: number | null;  // null: scheme guideline figure not yet cited from an official source
    allocated_cr: number | null;           // Source allocatedAmount / 1e7 (4 dp). No separate "released" figure exists.
    recommended_amount_cr: number | null;  // Source totalRecommendedAmount / 1e7
    expenditure_cr: number | null;         // Source totalExpenditure / 1e7
    unspent_cr: number | null;             // Source unspentAmount / 1e7 (checked = allocated - expenditure)
    expenditure_pct: number | null;        // expenditure / allocated x 100, from rupees, 1 dp
    recommended_pct: number | null;        // recommended / allocated x 100, from rupees, 1 dp
                                           // (source "utilizationPercentage" is this ratio; never shown as spending)
    works_count: { recommended: number | null; sanctioned: null /* not published by source */;
                   completed: number | null; pending: number | null } | null;
    works: MpladsWork[];                   // work_id (string), description, category, implementing_agency,
                                           // status (recommended|sanctioned|in_progress|completed|other), status_raw,
                                           // recommended_on, completed_on (ISO), recommended_amount_cr,
                                           // final_amount_cr, paid_cr (null when absent), has_image.
                                           // Sorted recommended_on desc (undated last), then work_id. Never by amount.
    works_is_partial: boolean;             // works.length < works_count.recommended
    as_of: string | null;
    source: SourceProvenance | null;       // includes raw_file + licence note
    cross_check: MpladsCrossCheck[];       // JanWatchdog figures + human-readable differences; not published as fact
    review_status: "secondary_only" | null;
  };

  election: {
    status: "reported" | "pending";
    election_year: number | null;
    votes: number | null;
    runner_up: { name: string; party: string; votes: number } | null;
    margin: number | null;
    as_of: string | null;
    source: SourceProvenance | null;
  };

  sources: SourceProvenance[];
  normalisation_notes: string[];
}
```

### 2.3 Status of Current 7 Delhi MP Records

| Constituency Slug | MP Name | Party | Minister | Performance Attendance | Debates | Questions | Bills | Affidavit (Cases / Assets) | MPLADS | Election |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| `chandni-chowk-delhi` | Praveen Khandelwal | BJP | No | 99% | 4 | 40 | 0 | **Reported** (0 cases / ₹11.7 Cr) | **Secondary** (₹2.65 Cr spent of ₹14.75 Cr allocated, 18.0%; recommended 43.8%) | **Reported** (516,496 votes, margin 89,325) |
| `east-delhi-delhi` | Harsh Malhotra | BJP | **Yes (MoS)**| **N/A** | **N/A** | **N/A** | **N/A** | **Reported** (0 cases / ₹4.08 Cr) | **Secondary** (₹2.44 / ₹14.71 Cr, 16.6%; recommended 52.8%) | **Reported** (664,819 votes, margin 93,663) |
| `new-delhi-delhi` | Bansuri Swaraj | BJP | No | 95% | 17 | 41 | 0 | **Reported** (0 cases / ₹19.29 Cr) | **Secondary** (₹2.18 / ₹15.43 Cr, 14.1%; recommended 42.4%) | **Reported** (453,185 votes, margin 78,370) |
| `north-east-delhi-delhi` | Manoj Kumar Tiwari | BJP | No | 90% | 21 | 276 | 3 | **Reported** (2 cases / ₹32.81 Cr) | **Secondary** (₹2.97 / ₹22.58 Cr, 13.2%; recommended 44.5%) | **Reported** (824,451 votes, margin 138,778) |
| `north-west-delhi-delhi` | Yogender Chandolia | BJP | No | 97% | 28 | 271 | 0 | **Reported** (2 cases / ₹2.76 Cr) | **Secondary** (₹1.25 / ₹14.79 Cr, 8.5%; recommended 31.2%) | **Reported** (866,483 votes, margin 290,849) |
| `south-delhi-delhi` | Ramvir Singh Bidhuri | BJP | No | 100% | 30 | 169 | 0 | **Reported** (1 case / ₹52.64 Cr) | **Secondary** (₹2.88 / ₹14.76 Cr, 19.6%; recommended 87.6%) | **Reported** (692,773 votes, margin 124,333) |
| `west-delhi-delhi` | Kamaljeet Sehrawat | BJP | No | 96% | 21 | 235 | 0 | **Reported** (0 cases / ₹14.74 Cr) | **Secondary** (₹1.31 / ₹14.70 Cr, 8.9%; recommended 60.2%) | **Reported** (842,658 votes, margin 199,013) |

### 2.3a Status of the 2 Goa MP records (added 2026-11-01, enriched 2026-11-01)

| Constituency Slug | MP Name | Party | Minister | Performance Attendance | Debates | Questions | Bills | Affidavit | MPLADS | Election |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| `north-goa-goa` | Shripad Yesso Naik | BJP | **Yes** (PRS minister banner) | **N/A** | **N/A** | **N/A** | **N/A** | **Reported** (0 cases / ₹10.87 Cr assets / ₹5.09 L liabilities) | **Pending** | **Pending** |
| `south-goa-goa` | Captain Viriato Fernandes | INC | No | 87% | 28 | 84 | 1 | **Reported** (1 case / ₹5.27 Cr assets / ₹3.80 L liabilities) | **Pending** | **Pending** |

- Identity: Digital Sansad member API (official), retrieved 2026-11-01; PRS agrees on seat, name (via the alias `viriato fernandes` → `Captain Viriato Fernandes`) and party, so `identity_review_status` is `cross_checked`.
- Activity: PRS MP Track profile pages (CC BY 4.0), retrieved 2026-11-01, period 2024-06-24 to 2026-08-13. State averages are PRS's published Goa averages.
- Affidavit: Self-declared 2024 Lok Sabha nomination affidavits (ECI Form 26 / ADR MyNeta candidate profiles: Shripad Naik candidate_id=3668; Captain Viriato Fernandes candidate_id=3876). Ingested via `data/reference_packs/officials_enriched_pack/data/mp_affidavit_enrichment_goa.csv`. Declared cases are allegations, not convictions.
- Pending blocks (MPLADS, Election) hold `null` in every field (never `0`); each record's `normalisation_notes` records why: MPLADS source not cleared, ECI 2024 results pages returned 404.
- No portrait: `image_url`/`image_source` are absent for any MP whose portrait could not be fetched; the UI shows initials. Run `python scripts/11_fetch_portraits.py --state KEY`, then `python scripts/build_data.py`.
- Sansad lists South Goa's education as "Post Graduate", PRS as "Graduate"; the profile shows PRS's value and the difference is a normalisation note.

MPLADS figures are Empowered Indian as of 2026-10-31 (`secondary_only`). Declared affidavit cases are allegations, not convictions. Activity and MPLADS figures are descriptive, not a ranking.

### 2.4 Intermediate and non-publishable processed files

| File | Producer | Status | Notes |
|:---|:---|:---|:---|
| `data/processed/prs.parsed.<state>.json` | `scripts/03_parse_prs.py` | Pipeline intermediate | One per registered state (`delhi`, `goa`): parsed PRS pages of the latest capture. |
| `data/processed/normalised.<state>.json` | `scripts/05_normalise.py` | Pipeline intermediate | One per state: identity-master rows joined to PRS and Sansad on state + constituency, with normalisation notes. |
| `data/processed/mplads.delhi.json` | `scripts/09_intake_mplads.py` | Pipeline intermediate | `{primary_capture, cross_check_capture, unmatched_primary, unmatched_cross_check, seats: {slug: {block, source_values, notes}}}`. `block` is the exact `MpladsData` merged into `mps.json`; `source_values` keeps the raw rupee amounts and the source's own percentages (`utilization_pct`, `utilization_definition`, `expenditure_pct`) and works endpoint counts, used by `07_validate.py` only. |
| `data/processed/mps.india.json` | `scripts/05_normalise_india.py` | **Unvalidated - not for publication** | Known broken: 544 rows for 543 seats, every row has performance `not_applicable`. Not imported by the app. |
| `data/processed/validation_report_india.md` | `scripts/05_normalise_india.py` | **Unvalidated - not for publication** | Claims "Ministers: 544"; inherits the defects above. |

---

## 3. Reference Packs Registry (`data/reference_packs/`)

This directory houses auxiliary packs for civic cross-referencing and historical audits.

### 3.1 Pack 1: `officials_enriched_pack` (Direct Value for MP Report Card)

| File Name | Records | Grain / Entity | Key Columns | Source | MP Report Card Relevance |
|:---|:---|:---|:---|:---|:---|
| `data/mp_affidavit_enrichment.csv` | **7** | Lok Sabha MPs | `official_name`, `constituency`, `declared_criminal_case_count`, `declared_total_assets_inr`, `movable_assets_inr`, `immovable_assets_inr`, `declared_liabilities_inr`, `education_detail_as_declared`, `myneta_profile_url`, `adr_asset_pdf_page` | ADR / MyNeta 2024 Winners | **CRITICAL:** Populates 100% of the missing Affidavit block in `mps.json` |
| `data/mla_affidavit_enrichment.csv` | 70 | Delhi MLAs | `official_name`, `assets`, `liabilities`, `criminal_cases` | ADR 2025 Assembly | Secondary / Assembly reference |
| `data/mla_criminal_profiles_extracted_from_adr.csv` | 27 | Delhi MLAs | Case details, IPC sections, court citations | ADR 2025 Assembly | Secondary / Assembly reference |
| `data/officials_enriched.csv` | 77 | 70 MLAs + 7 MPs | Consolidated profile and declaration join | Enriched pipeline | Secondary cross-reference |
| `source_documents/Delhi_Lok_Sabha_Elecrions_2024@Criminal_and_Financial_Background_of_Winning_Candidates.mht` | 1 | Webpage MHT | Full original MyNeta HTML snapshot | MyNeta / ADR | Legal provenance document |

### 3.2 Pack 2: `officials_data_pack` (Base Predecessor)

| File Name | Records | Grain / Entity | Key Columns | Source | Relevance |
|:---|:---|:---|:---|:---|:---|
| `data/lok_sabha_mps.csv` | 7 | Delhi MPs | `official_id`, `name`, `constituency`, `party` | GNCTD directory | Predecessor base roster |
| `data/officials.csv` | 77 | 70 MLAs + 7 MPs | `official_id`, `role`, `name`, `jurisdiction` | GNCTD / Assembly | Predecessor base roster |
| `data/mla_constituency_roster.csv` | 70 | Delhi MLAs | Constituency 1–70 roster | Delhi eVidhan | Assembly reference |
| `data/prs_mla_activity_observations.csv` | 70 | Delhi MLAs | MLA sittings and participation | PRS India | Assembly reference |

### 3.3 Pack 3: `mcd_pms_expansion_2026-10-31` (Municipal Public Works)

| File Name | Records | Grain / Entity | Key Columns | Source | Relevance |
|:---|:---|:---|:---|:---|:---|
| `mplads_mcd_zone_aggregate_counts_2026-10-31.csv` | 13 | MCD Zones | `zone_dashboard_label`, `mcd_pms_mp_lad_projects`, `mcd_pms_mp_lad_work_orders` | MCD PMS Dashboard | Zone aggregate counts (no MP attribution) |
| `mplads_extraction_status.csv` | 2 | Portal Status | `dataset`, `status`, `reason`, `source_url` | MoSPI Audit | Documents official portal downtime |
| `mlalad_individual_works_extracted_official_orders.csv` | 15 | MLA Works | Order numbers, descriptions, released lakh | Delhi UD Dept | Local MLA-LAD works |
| `mcd_pms_scheme_counts_by_zone_2026-10-31.csv` | 13 | MCD Zones | Zone project counts across schemes | MCD PMS | Municipal project counts |
| `mcd_tender_to_pms_crosswalk_18_records.csv` | 18 | MCD Tenders | Tender ID, NIT, status | MCD Tenders | Municipal tenders audit |

### 3.4 Pack 4: `mcd_councillor_collection_ws2` (Ward Councillors)

| File Name | Records | Grain / Entity | Key Columns | Source | Relevance |
|:---|:---|:---|:---|:---|:---|
| `mcd_councillors_latest_election_snapshot_250.csv` | 250 | Ward Councillors | Councillor name, ward name, ward number, party | State Election Commission | Municipal representation |
| `mcd_wards_register_250.csv` | 250 | MCD Wards | Ward number, ward name, zone | MCD Delimitation | Municipal representation |
| `mcd_ward_councillor_reconciliation_250.csv` | 250 | Ward Reconciliation | Status, vacancy checks | SEC Delhi | Municipal representation |

### 3.5 Pack 5: `delhi_jurisdiction_collection_01` (Boundary Hierarchy)

| File Name | Records | Grain / Entity | Key Columns | Relevance |
|:---|:---|:---|:---|:---|
| `assembly_to_parliamentary_mapping.csv` | 70 rows | 70 ACs to 7 PCs | AC No, AC Name, PC No, PC Name | Official 2008 ECI Delimitation Mapping |
| `mcd_ward_to_lok_sabha_mapping.csv` | 250 rows | 250 MCD Wards to 7 PCs | Ward No, Ward Name, MCD Zone, Lok Sabha PC, MP ID | Direct Ward-to-MP lookup crosswalk |
| `ward_to_assembly_mapping.csv` | 250 rows | 250 MCD Wards to 70 ACs | Ward No, Ward Name, MCD Zone, AC ID, AC Name | Municipal Ward to Assembly segment crosswalk |
| `delhi_lok_sabha_constituencies.csv` | 7 rows | 7 Parliamentary Constituencies | PC ID, PC Name, Total ACs (10), Ward count | Official constituency composition & boundary metadata |

---

## 4. Data Freshness: the Hybrid Refresh

The website never fetches sources at request time; it serves the reviewed snapshot in
`data/processed/`. Freshness comes from a **daily refresh job that proposes changes for
human review** (`scripts/refresh.py`, run by `.github/workflows/data-refresh.yml` at 06:00 IST,
or locally with `npm run data:refresh`):

```
1. FETCH   polite, official-first (scripts/polite_fetch.py: honest User-Agent, robots.txt,
           Crawl-delay, stop on 401/403/429) → new dated captures in data/raw/;
           a failed source keeps its last good capture (fetchers are all-or-nothing)
2. BUILD   03 parse → 05 normalise → 09 MPLADS → 06 merge → 07 validate → 08 snapshot
           (validation failure → approved processed files restored, run fails)
3. CHECK   official-record checks against the latest Digital Sansad capture
           (sitting member, name, party, vacancies, membership change between captures)
           and change detection on the Delhi government MP list page
4. DIFF    candidate vs last committed mps.json → data/processed/refresh_report.md / .json
           🔴 needs review: identity (MP, party, minister, reservation, portrait), removed
              records or fields, values that became null, failed official checks
           🟡 updated: activity numbers (old → new)
5. REVIEW  CI opens a pull request (body = report) only when something changed;
           a person merges it and the site redeploys. Nothing is auto-published.
```

### 4.1 Sources and cadence

| Source | What it updates | In the daily refresh? | Notes |
|:---|:---|:---|:---|
| **Digital Sansad member API** (official) | Sitting member, party, status | Yes (one capture per state) | Used for the official-record checks of every state; Goa's identity master |
| **Govt of NCT of Delhi MP list** (official) | Roster page | Yes (change detection) | `masterlist.delhi.json` is a reviewed transcription; a page change is flagged, not auto-parsed |
| **PRS MP Track** (CC BY 4.0) | Attendance, debates, questions, private member bills | Yes (one all-or-nothing capture per state) | robots.txt `Crawl-delay: 10` honoured; figures change after each session |
| **Empowered Indian / MoSPI eSAKSHI** | MPLADS funds and works | **No** | Automated access not cleared (`docs/decisions.md`); fetcher refuses to run |
| **ADR/MyNeta affidavits, ECI results** | Assets, cases, education, margins | No | Change only at elections or by-elections |

### 4.2 Safeguards

* **No runtime dependency:** if a source is down, the site keeps serving the approved snapshot with its "as of" dates.
* **No AI in the data path:** stored facts come only from deterministic parsers over cached source pages, which `07_validate.py` re-parses. LLMs are used only for the optional plain-language summary, which is checked against the record's numbers (`lib/ai/summary.ts verifyGuardrails`).
* **Refresh outputs:** `data/processed/refresh_report.md` and `refresh_report.json` describe the last run (fetch results, official checks, review items, updated values). They are reports, not application data.

---

## 5. Plug-in Interface for Custom 7 MP Data

To allow direct entry of verified 7 MP figures without editing complex code, place manual data into:  
📁 `data/raw/delhi_7mp_custom_enrichment.json`

### Template Contract
```json
[
  {
    "slug": "new-delhi-delhi",
    "name": "Bansuri Swaraj",
    "constituency": "New Delhi",
    "election": {
      "election_year": 2024,
      "winning_votes": 453185,
      "runner_up_name": "Somnath Bharti",
      "runner_up_party": "AAP",
      "runner_up_votes": 374815,
      "margin_votes": 78370,
      "source_name": "Election Commission of India",
      "source_url": "https://results.eci.gov.in"
    }
  }
]
```

> **MPLADS is no longer read from this file.** As of 2026-10-31 the `mplads` key here
> (written by an earlier version of `scripts/fetch_empowered_delhi.py`, which no longer
> touches this file and refuses to run until Empowered Indian access is cleared — see
> `docs/decisions.md`) is legacy and ignored: it stored the
> recommended share as `utilisation_pct`, `allocatedAmount` as `funds_released_cr`,
> assumed `works_sanctioned = works_recommended` and defaulted entitlement to 5.0.
> MPLADS now comes from the latest dated raw capture
> `data/raw/mplads.delhi.empoweredindian.<date>.json` via `scripts/09_intake_mplads.py`.
> To refresh MPLADS, add a new dated capture; do not hand-edit numbers.

---

## 6. Pipeline Execution & Invariants

### 6.1 Canonical Build Commands
To rebuild, validate, and snapshot the dataset from raw captures:
```bash
# 1. Parse raw PRS captures
python scripts/03_parse_prs.py

# 2. Normalise values and names
python scripts/05_normalise.py

# 3. Normalise MPLADS from the latest Empowered Indian capture (+ JanWatchdog cross-check)
#    -> data/processed/mplads.delhi.json
python scripts/09_intake_mplads.py

# 4. Merge onto masterlist with aliases
python scripts/06_merge.py

# 5. Run automated validation checks
python scripts/07_validate.py

# 6. Export production snapshot with SHA-256 hash
python scripts/08_snapshot.py

# Or run the entire pipeline in one step (every state in scripts/states.py):
python scripts/build_data.py

# Any step can be limited to one state:
python scripts/03_parse_prs.py --state goa
```

### 6.2 Mandatory Invariants (Enforced in CI & Validation)
1. **Never Fabricate Zeroes:** Unavailable fields must stay `null`. Never convert missing data to `0`.
2. **Ministers Excluded from Activity:** Ministers do not ask questions or sign attendance registers. Their performance must be status `not_applicable` with `null` metrics, never `0`.
3. **Affidavit Wording Guardrails:** Criminal case counts represent self-declared pending cases from election affidavits. They must **never** be phrased as convictions or labeled "criminal MPs".
4. **Traceable Provenance:** Every single metric must carry its original source URL, license, and retrieval date.
5. **MPLADS (07_validate.py):** hard errors for a percentage outside 0-100, negative money, unspent > allocated,
   more works listed than recommended, duplicate `work_id` within an MP, keys outside the `MpladsData` contract,
   a wrong `works_is_partial` flag, or a reported block / cross-check without source URL and as-of date.
   Warnings for computed vs source percentage > 1 point, cross-check allocated/expenditure > 5% apart, and partial works lists.
   `validation_report.md` has an MPLADS table per seat.
6. **Snapshot truthfulness:** `snapshot.json` `source_status` is derived by `08_snapshot.py` from the block and
   review statuses in `mps.json`; `sha256` is the hash of the exported `mps.json` bytes.


---

## 7. Database: YugabyteDB (YSQL)

The approved snapshot is also stored in **YugabyteDB** (PostgreSQL-compatible YSQL). The
Python pipeline remains the source of truth for fetching, parsing and validation; the
database stores approved snapshots and their history.

| Piece | Role |
|---|---|
| `db/schema.sql` | Tables (re-runnable): `snapshots`, `constituencies`, `member_records`, `performance`, `mplads_summaries`, `mplads_works`, `affidavits`, `elections`, `member_sources` |
| `scripts/load_db.py` | Loads `data/processed/mps.json` + `snapshot.json`. Idempotent (skips a sha256 already loaded); one transaction per snapshot; refuses a snapshot whose sha256 does not match `mps.json`; never deletes |
| `lib/db.ts` | Read-only. Reads the latest snapshot and rebuilds the exact `MPRecord` shape |
| `lib/data.ts` | Uses the database when `DATABASE_URL` is set, otherwise the JSON snapshot. If the database is unreachable it serves the JSON snapshot; `/api/health` reports `dataSource` |
| `.github/workflows/db-load.yml` | After a reviewed refresh is merged to `main`, validates and loads the snapshot (needs the `DATABASE_URL` secret) |
| `docker-compose.yml` | Local YugabyteDB `2025.2.7.0-b107` on port 5433 (web UI on 15433) |

**Model.** Every load is a new row in `snapshots`. Per-seat rows are keyed by
`(snapshot_id, constituency_slug)`, so values keep their history across refreshes, for
example attendance per snapshot in `performance`. Block tables store typed columns
(status, key figures, `as_of`, `review_status`) for queries and history, plus `data`, the
block exactly as approved. MPLADS works and the card source list are fully normalised into
`mplads_works` and `member_sources`. `is_minister` is nullable: unknown stays unknown and is
never coerced to `false`.

**Parity.** `__tests__/db-parity.test.ts` checks that records read back from the database
equal `mps.json` field for field. It runs whenever `DATABASE_URL` is set.

**Optional by design.** Without `DATABASE_URL` (the default), or when the database is unreachable,
the site serves the JSON snapshot `data/processed/mps.json` exactly as before. No Docker or
database is needed to develop, build or demo.

**Run locally with YugabyteDB:**
```powershell
docker compose up -d yugabyte
$env:DATABASE_URL = "postgresql://yugabyte:yugabyte@localhost:5433/yugabyte"
python scripts\load_db.py --schema
npx jest __tests__/db-parity.test.ts
```

---

## 8. Meko Data MCP & Google Gemini Civic Intelligence Stack

The application incorporates a verified conversational RAG architecture enabling natural-language civic exploration across all 7 Delhi Lok Sabha seats, MPLADS expenditures, and multi-tier jurisdictions (MP, MLA, MCD).

| Component | Role | Details |
|---|---|---|
| **Meko Datapack** | Knowledge Base (`janseva`) | Datapack ID: `0200f6e7-2f14-4e60-91e9-717da105bcc7` |
| **Meko MCP Server** | FastMCP JSON-RPC Endpoint | `https://mcp.mekodata.ai/mcp` using `tools/call` (`knowledgebase_search`) |
| **Source Datapack** | Ingestion directory | `meko_datapack/` (`.md`, `.csv`, `.jsonl` files) |
| **Gemini Reasoning** | LLM Inference | `gemini-3.5-flash-lite` / `gemini-flash-latest` via Google Gemini API |
| **Client Connector** | `lib/ai/meko.ts` | Server-only MCP client with automatic graceful fallback |
| **Civic Chat Core** | `lib/ai/chat.ts` | Grounded prompt constructor with PRD non-partisan guardrails |
| **API Endpoint** | `app/api/chat/route.ts` | POST `/api/chat` accepting `{ message, history, lang, mpContext }` |
| **Interactive UI** | `components/chat/ChatClient.tsx` | Full-page chat with source badges, language switcher, and follow-ups |
| **Floating Drawer** | `components/chat/FloatingChatButton.tsx` | Sitewide floating widget accessible on any report card |

