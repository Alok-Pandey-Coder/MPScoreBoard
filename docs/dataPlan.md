# dataPlan.md — Data preparation plan

> Written 2026-10-30. Companion to `context.md`, `plan.md`, `dataSources.md` and `PRD.md`.
> Scope rules come from `AGENTS.md`: Delhi's 7 seats are finished end to end first, then the pipeline scales to all 543 seats.
> Pipeline: `fetch raw -> parse -> normalize -> merge -> validate -> export`.

## 1. Where we are

| Area | State |
|---|---|
| Identity (7 Delhi MPs) | Done, but hand-typed from one source (`delhi.gov.in`) and not cross-checked against Sansad/ECI |
| PRS performance | 7 profile pages cached as raw HTML. `prs.delhi.json` was keyed by hand, **not parsed** (see 1.1) |
| MPLADS, affidavit, ECI result | Schema slots exist, all `null` |
| Pipeline | `01`, `02`, `05`–`08`, `build_data.py` exist. `03` and `04` fetchers are missing |
| Validation | Hard-coded to Delhi and 7 records |
| Averages, search index | Not built |

### 1.1 Defects found while reading the raw captures

The cached PRS HTML disagrees with `data/raw/prs.delhi.json` and `data/processed/mps.json`.
Cached pages show "Selected MP / National Average / State Average" side by side, and several stored values are
the national average (21.5 debates) or a different number entirely. Manoj Kumar Tiwari's row matches the HTML.

| MP | Debates stored | Debates in cached HTML | Other mismatch |
|---|---|---|---|
| Praveen Khandelwal | 21.5 | 4 | |
| Bansuri Swaraj | 21.5 | 17 | |
| Ramvir Singh Bidhuri | 21.5 | 30 | |
| Kamaljeet Sehrawat | 21.5 | 21 | |
| Yogender Chandolia | 21 | 28 | attendance 95 stored, 97 in HTML; questions 176 stored, 271 in HTML |

Treat the current performance block as **unverified** until Phase 0 is done.

Other findings:
- `is_minister` is hard-coded to `name == "Harsh Malhotra"` in `scripts/05_normalise.py`. It must come from the source.
  The PRS page says "This MP is a minister".
- PRS's own national and state averages are on every profile page. We are not capturing them, and we need them for reconciliation.
- Slug is `chandni-chowk`. `PRD.md` 5.7 requires `{constituency}-{state}`, for example `new-delhi-delhi`. Constituency names
  repeat across states (Aurangabad, Hamirpur, Bilaspur), so this must be decided before scaling.
- No per-field provenance or review status. `AGENTS.md` says nothing is published until source and review status are clear.
- `LINKS.md` is mostly the old JanDarpan list (tenders, MCD, Jal Board, nagrik works), which is out of scope.
  It lacks the actual sources: PRS MP Track, `mplads.gov.in`, MyNeta, ECI results, DataMeet.
- `context.md`, `plan.md`, `dataSources.md` exist in both the repo root and `docs/` (identical). Keep `docs/` as the single copy.

## 2. Target dataset

One record per Lok Sabha seat, 18th Lok Sabha, shaped for the `PRD.md` 8.1 `MP` type, plus a `Snapshot` wrapper
with national and state averages and a content hash.

| Block | Fields | Primary source | Cross-check | Priority |
|---|---|---|---|---|
| Identity | name, party, state, constituency, seat no., reservation, since_date, is_minister, special_role | Sansad / Lok Sabha member list | ECI results, Delhi govt list | P0 |
| Performance | attendance %, debates, questions, private bills, period, plus PRS state/national average | PRS MP Track | Sansad question counts | P0 |
| Election result | votes, margin, runner-up, election year | ECI 2024 results | MyNeta | P1 |
| MPLADS | entitlement, released, expenditure, utilisation %, unspent, works, as-of | `mplads.gov.in` citizen reports | Empowered Indian (check only) | P1 |
| Affidavit | assets, liabilities, declared cases, education, election year | ECI affidavit portal / MyNeta (terms review first) | each other | P1 |
| Questions by subject | counts by ministry/subject | Sansad question data, HF `opensansad/lok-sabha-qa` (licence check) | PRS | P3 |
| Boundaries, pincode | GeoJSON, pincode to seat | DataMeet maps, India Post via data.gov.in | none clean | P3 |

Rules that apply to every block: `null` for unknown (never 0), raw value kept next to the normalised value,
`source_url`, `retrieved_at`, `coverage`/`as_of`, and `review_status` (`parsed` -> `cross_checked` -> `approved`).
Affidavit cases are labelled "declared", never "criminal". Ministers get `not_applicable`, never 0.

## 3. Phases

### Phase 0 — Make the Delhi foundation trustworthy (do first, about 2 hours)

| ID | Task | Output / acceptance |
|---|---|---|
| D0-1 | Write `scripts/03_parse_prs.py`: parse the cached PRS HTML into `data/processed/prs.parsed.delhi.json`. Capture MP value, PRS national average, PRS state average for attendance, debates, questions, bills; also coverage period, age, gender, education, term number, minister banner | Parser reads only the "Selected MP" value. Minister page returns `not_applicable` |
| D0-2 | Make parsed output the input to `05_normalise.py`. Keep `prs.delhi.json` as a historical manual capture, not an input | The 6 wrong rows in 1.1 change; the change is logged |
| D0-3 | Derive `is_minister` from the PRS banner, and cross-check with the Council of Ministers list on `pmindia.gov.in`/Sansad | No names in code |
| D0-4 | Decide the slug (see Q1), apply it, add redirects for old slugs in `aliases.json` | One rule, documented in the data dictionary |
| D0-5 | Add provenance: per-block `source`, `as_of`, `review_status`. Add `normalisation_notes[]` | Visible in `mps.json` |
| D0-6 | Generalise `07_validate.py`: remove hard-coded 7 and "Delhi". Take the expected seat count and state from a config | Same script validates Delhi and later 543 |
| D0-7 | Add a regression test: re-parse every cached HTML and assert it equals `mps.json` performance | Fails if a number is hand-edited |
| D0-8 | Manual check of all 7 MPs against the live PRS pages and `sansad.in` | Result recorded in `validation_report.md` |

Gate D0: parsed numbers equal the HTML for all 7, minister logic is source-driven, tests pass, `logs.md` updated.

Status (2026-10-30): D0-1 to D0-7 done. Slug decision: `{constituency}-{state}`. The 5 wrong rows in 1.1 are fixed, and the
computed Delhi averages now match the PRS-published ones. Still open: D0-8 (manual live check, which moves `review_status`
to `approved`) and the Council of Ministers cross-check in D0-3.

Live check (2026-10-30): 6 of 7 live PRS pages re-fetched and parsed; all 6 match `mps.json` exactly, with the same period
(24-06-2024 to 13-08-2026) and minister flag. Yogender Chandolia's live page returned HTTP 500 twice, so it is unchecked.
News (Tribune, All India Radio) confirms Harsh Malhotra is MoS for Corporate Affairs and Road Transport, and Delhi BJP
president since May 2026. No by-election, resignation or new ministerial post found for the other six.

Source discovery (2026-10-30):
- `sansad.in/api_ls/member?loksabha=18&page=&size=` returns the official 18th Lok Sabha member list (544 entries) with
  state, constituency, party and `councilMinSts` (minister status). Candidate source for D1-1 and D3-1. Responses include
  personal addresses and phone numbers; store identity fields only.
- Empowered Indian (`empoweredindian.in/mplads`): JavaScript app; data says it is sourced from `mplads.gov.in`; FAQ says
  "This data is intended for public use ... Please cite \"Empowered Indian\" as your data source." Use for cross-checking
  MPLADS only. Its API is undocumented, and automated access to it was not pursued.
- Nagrik (`nagrik.in.net`): Delhi coverage is MCD officials/councillors and 2026 tenders only. No Lok Sabha MP data; not a source.

Phase 1 status (2026-10-30):
- D1-1 done for Delhi: `scripts/01_fetch_sansad_members.py` captured the 7 official Sansad records. Name, seat and party agree
  with the Delhi government list and PRS for all 7; reservation now comes from the Sansad category code. Sansad's
  `councilMinSts` is blank for everyone, so minister status still rests on PRS plus news.
- D1-3 MPLADS blocked: `mplads.gov.in` does not connect; the official eSAKSHI dashboard (`mplads.mospi.gov.in/digigov/dashboard.html`)
  is public but loads figures from an endpoint deliberately obfuscated in its script, so it was not called from a script.
  Options: read the public dashboard in a browser and record the 7 Delhi figures as a manual capture (with screenshot and
  date), or find a published MoSPI/data.gov.in report.

### Phase 1 — Enrich Delhi from every source (about 4–5 hours)

For each source follow the same routine: read terms and `robots.txt` -> save raw with URL, timestamp, coverage -> parse
-> normalise -> merge on state + constituency -> validate. Never bypass CAPTCHA, login or rate limits. Where a site blocks
automation, use a manual download and log it as such.

| ID | Source | Steps | Fallback |
|---|---|---|---|
| D1-1 | Sansad / Lok Sabha member list (`sansad.in/ls`) | Fetch the official members list. Confirm names, party, seat number, reservation. Reconcile with the Delhi govt list | Delhi govt list stays the identity source, with the gap noted |
| D1-2 | ECI 2024 results (`results.eci.gov.in` / statistical report) | Winner, votes, margin, runner-up per Delhi seat; electors if available | Manual keying from the official PDF, with the page number recorded |
| D1-3 | MPLADS (`mplads.gov.in` citizen reports) | Find the per-MP expenditure report for the 18th Lok Sabha; save raw. Handle `__VIEWSTATE` form posts only if allowed. Record the portal's utilisation definition | Look for an Excel export; else manual download for the 7 seats; else hide the block |
| D1-4 | Affidavit (ECI affidavits / MyNeta 2024 Delhi winners) | Read the ADR terms first. Capture assets, liabilities, declared cases, education, election year. Normalise Rs to a numeric value, display in crore later | Link out only, leave values `null` |
| D1-5 | PRS extras | Session-wise attendance table from the cached HTML (already present) for later detail | Skip |
| D1-6 | Aliases | Add every spelling variant seen across sources | n/a |

Gate D1: for all 7 seats, performance, election result and identity are filled and approved. MPLADS and affidavit are either filled
or explicitly `null` with a reason. `validation_report.md` has no unexplained mismatches.

### Phase 2 — Exporter and computed values (about 2 hours, can run alongside Phase 1)

| ID | Task |
|---|---|
| D2-1 | `08_export.py`: write `data/processed/snapshot.json` in the `PRD.md` camelCase shape (`attendancePct`, `entitlementCr`, `totalAssetsRs`...). Keep `mps.json` as the snake_case intermediate, or retire it (see Q2) |
| D2-2 | Averages: state and national, excluding ministers and nulls, storing `n` per metric. Reconcile against the PRS published averages captured in D0-1 and record the difference |
| D2-3 | Utilisation: store the source figure, recompute `spent / released`, flag differences above the tolerance, never negative unspent |
| D2-4 | `search-index.json`: slug, name, constituency, state, party, aliases |
| D2-5 | Snapshot metadata: `generatedAt`, `mpCount`, content hash, source list with retrieval dates, per-block coverage |
| D2-6 | Schema doc: update `data_dictionary.md` with every field, unit, nullability, and the "not applicable" encoding |

Gate D2: `npm run data:build` (or `python scripts/build_data.py`) rebuilds the snapshot from raw, idempotently, with the same hash twice.

### Phase 3 — Scale to all states (about 6–8 hours; starts only after D0–D2 pass)

| ID | Task | Note |
|---|---|---|
| D3-1 | Master list of all 543 seats (Sansad + ECI). Include vacancies, by-election replacements (`since_date`), an MP who won two seats, deceased/resigned | Expected row count is 543 or the gap is documented |
| D3-2 | PRS for all seats. First look for a listing or export on MP Track. If none, derive profile URLs from the list and fetch politely (about 1 request/s, cached, identifiable User-Agent, resumable). About 543 pages | Do states in this order: Delhi, then the largest states and demo-critical ones, then the rest |
| D3-3 | MPLADS for all seats | Optional enrichment. Failure must not block the export |
| D3-4 | Affidavit for all seats | Only if terms allow and time remains |
| D3-5 | Alias and fuzzy matching pass (`rapidfuzz`, name only as confirmation). Unmatched rows go to a review file | Target under 5% unmatched for demo states, rest listed |
| D3-6 | Small-state handling: states with 1–2 seats show averages with `n` | Per `PRD.md` T6 |
| D3-7 | Speaker / Deputy Speaker: capture what PRS actually shows. If nothing, `not_applicable` | Per `PRD.md` T7 |

Gate D3: at least 95% of non-minister seats have a complete performance block. Rows lacking data degrade cleanly.

### Phase 4 — QA and release

- 20 random MPs checked by hand against the source sites. Mismatches logged and fixed (`PRD.md` 14.2).
- Hard validation errors (fail the build): duplicate slugs or seats, missing identity fields, percentages outside 0–100,
  negative money, a non-minister with `is_minister` true or the reverse, a minister with any activity value, a record with no source,
  a source with no URL or date, `null` converted to 0 (compare null rate to raw).
- Soft warnings (report only): unmatched rows, null rate per field, utilisation mismatch, average vs PRS published average,
  coverage periods that differ between records, stale `retrieved_at`.
- Unit tests for: constituency/name normalisation, PRS parser (fixtures from cached HTML), average calculation, slug rules, Rs-to-crore.
- Tag the snapshot (`v1.0-demo`) and keep a copy of the raw captures.

### Phase 5 — Stretch (only after Phase 4)

Subject-wise questions, DataMeet boundaries, pincode to seat (hide if unreliable), a Hindi name column, committees.
MP photos stay out unless a licence clearly allows reuse; use initials avatars.

## 4. Timeline against the hackathon (starts 31 Oct)

| When | Work |
|---|---|
| Tonight (30 Oct) | Phase 0 complete. Start D1-1, D1-2. Clean up `LINKS.md` |
| T+0 to T+3 | Finish Phase 1 for Delhi. Hand the frontend a stable `snapshot.json` for Delhi (this matches `plan.md` P1-3, P1-6) |
| T+3 to T+10 | Phase 2. Start D3-1 and D3-2 in parallel (gate G1) |
| T+10 to T+20 | D3-2 to D3-5. MPLADS and affidavit only as time allows (gate G2). Decision point at T+18 per risk R2/R3 |
| T+20 onward | Freeze the data. Only fixes and QA (Phase 4) |

Cut order if behind: affidavit -> MPLADS -> state averages -> subject-wise questions. Never cut: correct PRS performance data,
source/as-of labels, ministers shown as not applicable.

## 5. Source access checklist (verify before each fetcher is written)

- [ ] `robots.txt` and terms of use read and noted in `docs/dataSources.md`: prsindia.org, sansad.in, mplads.gov.in, myneta.info, eci.gov.in, data.gov.in
- [ ] Is there an export (CSV/Excel/JSON/API) that avoids scraping?
- [ ] Reuse licence: can we republish the values or only link?
- [ ] Rate and caching plan, User-Agent, retry with backoff
- [ ] Fixture saved so the parser can be tested offline

## 6. Risks specific to data

| Risk | Response |
|---|---|
| Hand-keyed or mis-parsed values (already happened, see 1.1) | Parser plus regression test; no manual numbers in `data/raw/*.json` |
| PRS blocks or changes layout | Raw HTML cache, resumable fetch, manual export for demo states |
| MPLADS portal unreliable | Optional block; `null` plus reason; link to portal |
| Affidavit terms unclear | Decide after terms review. Otherwise link out |
| Slug change breaks links | Decide now (Q1), keep redirect aliases |
| Mixed coverage periods across MPs | Store `coverage` per record and show it |
| By-elections and vacancies | `since_date`, partial-term note, vacancy rows kept |

## 7. Open decisions

1. **Slug:** `{constituency}-{state}` as in `PRD.md` (for example `new-delhi-delhi`), or keep constituency-only for now? Recommended: PRD form, applied now while there are only 7 records.
2. **Snapshot shape:** produce the PRD camelCase `snapshot.json` as the single frontend input and treat `mps.json` as internal? Recommended: yes.
3. **Affidavit:** include in the demo if the ADR/ECI terms allow it, or link out only?
4. **PRS bulk fetch:** if MP Track has no export, are about 543 polite page fetches acceptable, or should we stop at the demo states plus a manual export?
5. **Root duplicates:** delete the root copies of `context.md`, `plan.md`, `dataSources.md` and keep `docs/`? The root `readme.md` and `PRD.md` also need a home.
