# Data Architecture & Master Registry — "Mera MP, Mera Report Card"

> **Version:** 1.2 · **Date:** 2026-10-31  
> **Repository:** `d:\MPScoreBoard`  
> **Companion Documents:** `AGENTS.md`, `PRD.md`, `PlanV2.md`, `docs/dataSources.md`

---

## 1. Data Architecture Overview

The repository enforces a strict, three-tier data hierarchy to guarantee that raw captures remain immutable, application payloads load in under 100ms, and legacy civic research data is organized without polluting the project root.

```
d:\MPScoreBoard\data\
│
├── processed/                           # ACTIVE APPLICATION PAYLOADS
│   ├── mps.json                         # Canonical dataset for all Lok Sabha MPs
│   ├── snapshot.json                    # Snapshot metadata, timestamp & SHA-256 hash
│   ├── aliases.json                     # Normalisation aliases (constituency & MP name variants)
│   ├── validation_report.md             # Automated test proof of zero data errors & exact averages
│   ├── data_dictionary.md               # Technical field types & nullability specifications
│   ├── delhi_pc_boundaries.geojson      # 7 Delhi Lok Sabha PC boundaries (DataMeet CC-BY-4.0)
│   ├── delhi_regional_hierarchy.json    # 7 PCs × 10 MLAs with affidavit & party data
│   ├── normalised.delhi.json            # Intermediate normalised records before merge
│   ├── mps.india.json                   # All-India 544-seat dataset (Sansad + PRS 100% matched)
│   └── validation_report_india.md       # All-India dataset validation & state breakdown report
│
├── raw/                                 # ACTIVE IMMUTABLE SOURCE CAPTURES
│   ├── masterlist.delhi.json            # Delhi Government official MP directory capture
│   ├── sansad.members.delhi.2026-10-30.json # Official Digital Sansad JSON API capture
│   ├── prs.delhi.2026-10-30/            # Raw HTML captures of all 7 PRS profile pages
│   ├── sansad.members.india.2026-10-31.json # All-India 544-seat Sansad API capture (retrieved 2026-10-31)
│   ├── prs.india.manifest.2026-10-31.json   # All-India 553-member PRS directory manifest with metrics
│   ├── india_pc_2019_simplified.geojson # DataMeet All-India 543 PC boundaries raw (CC-BY-4.0)
│   ├── mplads.delhi.empoweredindian.2026-10-31.json # Empowered Indian MPLADS API raw capture (7 Delhi MPs)
│   └── delhi_7mp_custom_enrichment.json # User intake: election results + MPLADS (7 Delhi MPs)
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

`mps.json` is the sole data contract consumed by the application front-end. It contains 7 records covering Delhi's 18th Lok Sabha parliamentary constituencies.

### 2.1 The 6 Data Blocks

| Block | Source | Grain / Coverage | Current Status |
|:---|:---|:---|:---|
| **1. Identity** | Digital Sansad / GNCTD | Per MP: Name, seat, state, party, reservation, term, `sansad_mpsno`, `is_minister` | **100% Complete** |
| **2. Profile** | PRS Legislative Research | Per MP: Age, gender, education, term number, source provenance | **100% Complete** |
| **3. Performance** | PRS Legislative Research | Per MP: Attendance %, debates, questions, private member bills, state/national averages | **100% Complete** (6 reported, 1 minister `not_applicable`) |
| **4. Affidavit** | ADR / MyNeta / ECI | Per MP: Declared criminal cases, total assets, liabilities, education, original citation | **100% Complete** (7/7 reported & cross-checked) |
| **5. MPLADS** | Empowered Indian / MoSPI | Per MP: Entitlement, released, expenditure, utilisation %, works counts, as-of date | **100% Complete** (7/7 reported via Empowered Indian / e-SAKSHI) |
| **6. Election** | Election Commission of India | Per MP: 2024 winning votes, runner-up name/party/votes, margin | **100% Complete** (7/7 reported via ECI 2024 results) |

### 2.2 Field-by-Field Technical Specifications

```typescript
interface MPRecord {
  slug: string;                          // Format: {constituency}-{state} (e.g. "new-delhi-delhi")
  name: string;                          // Full official name
  constituency: string;                  // Official constituency name (e.g. "North West Delhi (SC)")
  state: string;                         // "Delhi"
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

  mplads: {
    status: "reported" | "pending";
    entitlement: number | null;            // In ₹ Crore
    funds_released: number | null;         // In ₹ Crore
    expenditure: number | null;            // In ₹ Crore
    utilisation_pct: number | null;        // Recomputed spent / released
    unspent_balance: number | null;        // In ₹ Crore
    works: {
      recommended: number | null;
      sanctioned: number | null;
      completed: number | null;
    } | null;
    as_of: string | null;
    source: SourceProvenance | null;
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
| `chandni-chowk-delhi` | Praveen Khandelwal | BJP | No | 99% | 4 | 40 | 0 | **Reported** (0 cases / ₹11.7 Cr) | **Reported** (₹2.65 Cr exp / ₹12.10 Cr unspent) | **Reported** (516,496 votes, margin 89,325) |
| `east-delhi-delhi` | Harsh Malhotra | BJP | **Yes (MoS)**| **N/A** | **N/A** | **N/A** | **N/A** | **Reported** (0 cases / ₹4.08 Cr) | **Reported** (₹2.44 Cr exp / ₹12.27 Cr unspent) | **Reported** (664,819 votes, margin 93,663) |
| `new-delhi-delhi` | Bansuri Swaraj | BJP | No | 95% | 17 | 41 | 0 | **Reported** (0 cases / ₹19.29 Cr) | **Reported** (₹2.18 Cr exp / ₹13.25 Cr unspent) | **Reported** (453,185 votes, margin 78,370) |
| `north-east-delhi-delhi` | Manoj Kumar Tiwari | BJP | No | 90% | 21 | 276 | 3 | **Reported** (2 cases / ₹32.81 Cr) | **Reported** (₹2.97 Cr exp / ₹19.61 Cr unspent) | **Reported** (824,451 votes, margin 138,778) |
| `north-west-delhi-delhi` | Yogender Chandolia | BJP | No | 97% | 28 | 271 | 0 | **Reported** (2 cases / ₹2.76 Cr) | **Reported** (₹1.25 Cr exp / ₹13.54 Cr unspent) | **Reported** (866,483 votes, margin 290,849) |
| `south-delhi-delhi` | Ramvir Singh Bidhuri | BJP | No | 100% | 30 | 169 | 0 | **Reported** (1 case / ₹52.64 Cr) | **Reported** (₹2.88 Cr exp / ₹11.87 Cr unspent) | **Reported** (692,773 votes, margin 124,333) |
| `west-delhi-delhi` | Kamaljeet Sehrawat | BJP | No | 96% | 21 | 235 | 0 | **Reported** (0 cases / ₹14.74 Cr) | **Reported** (₹1.31 Cr exp / ₹13.39 Cr unspent) | **Reported** (842,658 votes, margin 199,013) |

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
| `assembly_to_parliamentary_mapping.csv` | Schema | AC to PC Mapping | AC number, AC name, PC number, PC name | Boundary mapping crosswalk |
| `ward_to_assembly_mapping.csv` | Schema | Ward to AC Mapping | Ward number, AC number | Ward-level mapping crosswalk |

---

## 4. Real-Time & Latest Data Freshness Architecture

To prevent stale information while ensuring 100% demo uptime and sub-second load times, the platform operates on a **three-tier hybrid freshness engine**:

```
[Official Online APIs] (Digital Sansad / MoSPI / PRS)
         │
         ▼  (Daily or On-Demand Trigger)
[Refresh Script: scripts/refresh_latest.py]
         │
         ▼  (Atomic Write with Content Hash)
[Static Edge Snapshot: data/processed/mps.json]
         │
         ▼  (Next.js Stale-While-Revalidate Caching)
[Live Citizen Web Application: 0ms Edge Payload]
```

### 4.1 Update Cadence by Source

| Source | Dimension | Freshness Cadence | Invalidation Trigger |
|:---|:---|:---|:---|
| **Digital Sansad API** | MP status, minister posts, vacancies | **Live / Daily** | Automated nightly health check |
| **Empowered Indian / MoSPI** | MPLADS funds & works | **Bi-weekly / Monthly** | New monthly MoSPI release |
| **PRS MP Track** | Attendance, questions, debates | **Session-wise** | End of Budget, Monsoon, and Winter sessions |
| **ECI Affidavits & Results** | Wealth, cases, vote margins | **Static / Term-long** | Updated only upon by-elections |

### 4.2 Offline & Failure Safeguards
* **Zero Runtime Dependencies:** The UI **never** fetches third-party government websites directly at request time. If a government website goes offline, the report card continues serving the cached snapshot with clear "as of [date]" labels.
* **Grounding Guardrails:** The AI summary engine receives strictly typed JSON payloads. Summaries are automatically verified by `groundingCheck()` before display to ensure zero invented figures.

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
    "mplads": {
      "entitlement_cr": 5.0,
      "funds_released_cr": 2.5,
      "expenditure_cr": 1.2,
      "utilisation_pct": 48.0,
      "unspent_balance_cr": 1.3,
      "works_recommended": 12,
      "works_sanctioned": 8,
      "works_completed": 4,
      "as_of": "2026-10-31",
      "source_name": "Empowered Indian / MoSPI",
      "source_url": "https://empoweredindian.in/mplads"
    },
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

---

## 6. Pipeline Execution & Invariants

### 6.1 Canonical Build Commands
To rebuild, validate, and snapshot the dataset from raw captures:
```bash
# 1. Parse raw PRS captures
python scripts/03_parse_prs.py

# 2. Normalise values and names
python scripts/05_normalise.py

# 3. Merge onto masterlist with aliases
python scripts/06_merge.py

# 4. Run automated validation checks
python scripts/07_validate.py

# 5. Export production snapshot with SHA-256 hash
python scripts/08_snapshot.py

# Or run the entire pipeline in one step:
python scripts/build_data.py
```

### 6.2 Mandatory Invariants (Enforced in CI & Validation)
1. **Never Fabricate Zeroes:** Unavailable fields must stay `null`. Never convert missing data to `0`.
2. **Ministers Excluded from Activity:** Ministers do not ask questions or sign attendance registers. Their performance must be status `not_applicable` with `null` metrics, never `0`.
3. **Affidavit Wording Guardrails:** Criminal case counts represent self-declared pending cases from election affidavits. They must **never** be phrased as convictions or labeled "criminal MPs".
4. **Traceable Provenance:** Every single metric must carry its original source URL, license, and retrieval date.

