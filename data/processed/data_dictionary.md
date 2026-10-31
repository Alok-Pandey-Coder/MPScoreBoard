# Delhi dataset dictionary

`mps.json` holds one record per Lok Sabha seat. Unknown values are `null`, never `0`.

| Field | Meaning |
|---|---|
| `slug` | Stable identifier `{constituency}-{state}`, lower-case ASCII, reservation suffix removed (for example `new-delhi-delhi`). Old slugs are in `aliases.json` → `slug_redirects` |
| `name`, `constituency`, `state`, `party` | Identity as spelled by the master list (official spelling is kept for display) |
| `party_full` | Party name as shown by PRS |
| `reservation` | `GEN`, `SC` or `ST`, from the Sansad category code (constituency suffix as fallback) |
| `sansad_mpsno`, `sansad_status` | Official Lok Sabha member number and status (`Sitting`) |
| `term` | `18th Lok Sabha` |
| `since_date` | ISO start of term from PRS |
| `is_minister` | From the PRS "This MP is a minister" banner, not from code |
| `special_role` | Speaker / Deputy Speaker, otherwise `null` |
| `identity_review_status` | `parsed` (one source) or `cross_checked` (Delhi government list, PRS and Sansad agree on name, seat and party) |
| `profile` | Age, gender, education, term number from the PRS profile, with `as_of` and `source` |
| `performance.status` | `reported`, `not_applicable` (minister, PRS excludes them) or `not_available` (no PRS record) |
| `performance.attendance_pct` | Percent 0–100 over `performance.period` |
| `performance.debates`, `questions`, `private_member_bills` | Counts over `performance.period` |
| `performance.prs_averages` | National and state averages as published by PRS, for reconciliation only |
| `performance.source` | URL, retrieval date, raw capture file, licence (PRS: CC BY 4.0) |
| `*.review_status` | `parsed` → `cross_checked` → `approved` (after a manual check against the live source) |
| `mplads`, `affidavit`, `election` | `status: "pending"` with all values `null` until captured |
| `sources` | Every source used for the record, with URL and retrieval date |
| `normalisation_notes` | Join and normalisation decisions made for the record |

Monetary fields need currency, period and amount type when populated. Affidavit
cases are declared cases, not convictions. Activity metrics are descriptive, not a ranking.
