# DATA_SOURCES.md — Data collection plan for the Lok Sabha MP Report Card

> Companion to `context.md`. Goal: build one clean, merged `mps.json` snapshot **before** the hackathon demo.
> Status of links: starting points only. **Verify every URL, format and terms of use yourself** before relying on it. Government sites change layouts often.

---

## 0. Principles

1. **Snapshot, don't scrape live.** Collect once, store raw files, ship processed JSON.
2. **Official first.** Prefer downloads/exports over HTML scraping. Scrape only if there is no other way, politely (low rate, caching, identifiable User-Agent).
3. **Check terms and robots.txt** for each site. If a site disallows automated access, use manual export/download or skip it and note the gap.
4. **Never fabricate values.** Missing = `null`.
5. **Record provenance**: for every record, store the source name, URL and retrieval date.
6. Keep `/data/raw` untouched. All cleaning happens in scripts that read raw and write to `/data/processed`.

---

## 1. Source matrix

| # | Source | What it gives | Priority | Access method | Risk |
|---|--------|---------------|----------|---------------|------|
| 1 | **PRS Legislative Research** — MP Track (`prsindia.org`, under "MPTrack" / Parliament track) | Attendance %, debates, questions, private member bills; filter by state/party/session; national and state averages | **P0** | Check for a download/export option first; otherwise page-level collection of the MP list and profile pages | Medium: layout changes, term coverage, ministers excluded |
| 2 | **Lok Sabha / Sansad official sites** (`sansad.in`, `loksabha.nic.in`) | Official MP list (name, constituency, state, party), member profiles, questions database, sitting records | **P0** | Official member listings, plus question search/exports | Medium: dynamic pages, inconsistent naming |
| 3 | **MPLADS portal** (`mplads.gov.in`, citizen reports) | Entitlement, funds released, expenditure, utilisation %, unspent balance, works sanctioned/completed per MP/constituency | **P0** | Citizen report pages (state-wise expenditure and work-detail reports); look for Excel/CSV export | High: slow/old ASP.NET pages, session/viewstate quirks |
| 4 | **MyNeta / ADR** (`myneta.info`, Association for Democratic Reforms) | Affidavit data: assets, liabilities, declared criminal cases, education, by election year and constituency | **P1** | Winners lists per election are browsable; check ADR's terms before bulk collection | Medium: legal sensitivity, terms of use, and "declared" ≠ "convicted" |
| 5 | **Election Commission of India** (`eci.gov.in`, results portal) | Authoritative constituency list, winners, vote margins for the 2024 general election | **P1** | Statistical reports / results exports | Low–Medium |
| 6 | **data.gov.in (Open Government Data)** | Possibly constituency, pincode directory and Parliament-related datasets | **P1** | Search the catalogue for "Lok Sabha", "constituency", "pincode", "MPLADS"; download CSV/JSON | Low, but coverage is inconsistent |
| 7 | **DataMeet maps** (`github.com/datameet/maps`) | Community-maintained constituency boundary files (GeoJSON/shapefile) | **P2 / stretch** | GitHub download | Low; check the boundary vintage (post-2008 delimitation) |
| 8 | **India Post pincode directory** (via data.gov.in) | Pincode → district/state | **P2 / stretch** | CSV | Pincode → constituency has **no clean official mapping**; needs a geo join or manual mapping |
| 9 | **Parliamentary committee pages** (Sansad) | Committee memberships/attendance | **P3 / stretch** | Official pages | High effort, skip for the MVP |

> Third-party scrapers/aggregators (for example Apify actors that wrap PRS data) may exist, but they are unofficial, can be "under maintenance", and may be paid. Do not depend on them. If used for a quick prototype, always cross-check numbers against the PRS site.

---

## 2. Fields to collect (maps to the `MP` type in `context.md`)

### From PRS (performance)
- MP name, constituency, state, party
- Term/session covered, "as of" date
- Attendance %, debates, questions, private member bills
- State average and national average (or compute them yourself and reconcile)
- Subject-wise questions (stretch)
- Minister flag (excluded from stats)

### From Sansad / Lok Sabha (identity, baseline)
- Official member list for the 18th Lok Sabha: name, constituency, state, party
- Any profile fields such as gender, age, education, committees (only if easily available)
- Use this as the **master list** of 543 constituencies. The other sources join onto it.

### From MPLADS
- Entitlement, funds released, expenditure, utilisation %, unspent balance
- Number of works recommended/sanctioned/completed (stretch)
- "As of" date (these figures update continuously)
- Note: early in a term, utilisation numbers are naturally low or incomplete. Show the date.

### MPLADS sources actually used (Delhi, as of 2026-10-31)

| Role | Source | Raw capture | Units | Review status |
|---|---|---|---|---|
| Primary (published, labelled secondary) | **Empowered Indian (aggregating MoSPI eSAKSHI)** — `api.empoweredindian.in/api/mplads/mps/{id}` and `/works`; MP pages `https://empoweredindian.in/mps/{id}` | `data/raw/mplads.delhi.empoweredindian.2026-10-31.json` (latest dated capture is picked automatically) | Rupees | `secondary_only` |
| Cross-check only | **JanWatchdog** — `https://www.janwatchdog.in/mplads/delhi` (secondary aggregator citing the MoSPI MPLADS dashboard), snapshot 2026-10-06 | `data/raw/mplads.delhi.janwatchdog.2026-10-06.csv` | Crore | Not published; shown only as `cross_check` |
| Official (pending) | MoSPI eSAKSHI dashboard `mplads.mospi.gov.in` / `mplads.gov.in` | none — `mplads.gov.in` refused connections on 2026-10-31 | — | — |

Definitions and decisions (implemented in `scripts/09_intake_mplads.py`):

- Empowered Indian's `utilizationPercentage` is **recommended ÷ allocated** (`utilizationDefinition: "recommended_amount"`), not spending. The export computes `expenditure_pct = totalExpenditure ÷ allocatedAmount × 100` and `recommended_pct = totalRecommendedAmount ÷ allocatedAmount × 100` from the rupee amounts (1 dp). Source percentages are only used to validate (tolerance 1 point).
- `allocatedAmount` is the cumulative term allocation. The source has **no separate "funds released" figure**; none is derived.
- No sanctioned-works count is published by Empowered Indian, so `works_count.sanctioned` is `null` (JanWatchdog's sanctioned count appears only in `cross_check`).
- `annual_entitlement_cr` is `null` until the MPLADS guidelines are cited from an official MoSPI/mplads.gov.in URL.
- The capture holds 20 works per MP (the `/works` endpoint returned up to 100 rows), so `works_is_partial = true` for all seats.
- Reuse terms of both aggregators are not confirmed; their figures are labelled secondary and the cross-check source is not shown as fact.
- JanWatchdog spellings differ ("Manoj Tiwari", "Yogendra Chandoliya"); joins are on normalised constituency (reservation suffix stripped), names only confirm.

### From MyNeta / ADR
- Total assets, liabilities, declared criminal cases (count, and serious-case count if provided), education
- Election year the affidavit belongs to
- Wording in the UI: "As declared in the 2024 election affidavit."

### From ECI
- Constituency ID/number, state, reservation status (General/SC/ST), winner, margin (stretch)

---

## 3. Joining the datasets

- **Master key:** `state + constituency` normalised (lowercase, trimmed, punctuation and "(SC)/(ST)" suffixes stripped, a known-alias table for spelling variants such as Bangalore/Bengaluru).
- **Secondary key:** MP name (fuzzy match, for example `rapidfuzz`), used only to confirm a match, never as the primary key.
- Build and keep `data/processed/aliases.json` for manual fixes. Expect roughly 5–10% of rows to need manual review.
- Write a `validation_report.md` after each run, listing unmatched rows, duplicates, nulls per field, and out-of-range values (attendance > 100%, negative funds).
- Edge cases to handle explicitly: ministers, Speaker, by-election replacements, resigned/deceased MPs, an MP who won two seats and vacated one, and MPs elected mid-term (partial-term stats).

---

## 4. Pipeline layout

```
scripts/
  01_fetch_masterlist.py     # Sansad / ECI → data/raw/masterlist.*
  02_fetch_prs.py            # PRS MP Track → data/raw/prs_*.{csv,json,html}
  fetch_empowered_delhi.py   # Empowered Indian MPLADS API → data/raw/mplads.delhi.empoweredindian.<date>.json
  09_intake_mplads.py        # latest MPLADS capture (+ JanWatchdog cross-check) → data/processed/mplads.delhi.json
  04_fetch_myneta.py         # affidavit data → data/raw/myneta_*
  05_normalise.py            # clean names, units (Rs / crore), types
  06_merge.py                # join onto the master list, apply aliases
  07_validate.py             # produce validation_report.md
  08_export.py               # data/processed/mps.json (+ optional SQLite)
```
Each fetch script should: cache responses on disk, sleep between requests, send a clear User-Agent, retry with backoff, and log the URL and timestamp.

**Suggested order for time-boxed work:** start with a **subset** (for example Delhi's 7 seats) end-to-end across all sources, confirm the joins work, then scale to all states. Do not build all fetchers in parallel without a working merge.

---

## 5. Methods by situation

- **A download/export exists** → use it, then record the file's name and download date.
- **Static HTML tables** → `pandas.read_html` or BeautifulSoup.
- **Dynamic / JS-rendered pages** → inspect the browser's network tab for a JSON endpoint first. Use Playwright only as a last resort.
- **Old ASP.NET report pages (MPLADS)** → these need `__VIEWSTATE`-style form posts. Prefer Excel/CSV export buttons if present.
- **Blocked or rate-limited** → slow down, cache, and fall back to manual download for the demo-critical subset.

---

## 6. Legal, ethical and safety notes

- All of these are public records, but **terms of use still apply.** Read them and note any restrictions in the README.
- Affidavit criminal-case counts are **declarations, not convictions.** Never write "criminal MP". Use neutral phrases such as "declared N pending cases".
- No ranking or "worst MP" labels. Show indicators and context only.
- Show sources and "as of" dates on every page.
- Attribute PRS, ADR/MyNeta, MPLADS and Sansad visibly in the footer and README.
- Photos of MPs: only use them if a source clearly permits reuse. Otherwise, use initials avatars.
- Add a line: "Unofficial student project, not affiliated with Parliament or any party."

---

## 7. Known gaps and risks (be honest in the demo)

| Gap | Plan |
|-----|------|
| Pincode → constituency has no official clean table | MVP uses the state → constituency picker. Pincode lookup is a stretch (geo join using boundary files + pincode data). |
| Term coverage differs by source (PRS may lag the current session) | Show a per-source "as of" date. Do not mix 17th and 18th Lok Sabha numbers without labelling. |
| Name mismatches across sites | Alias table + fuzzy matching + manual review. |
| MPLADS pages are slow/unreliable | Collect early, cache everything, and have a manual-export fallback. |
| Live site down on demo day | Everything runs off the local snapshot. No live calls except the optional AI summary, and that has a template fallback. |
| Ministers have no performance stats | Flag as `isMinister` and display "not applicable". |

---

## 8. Definition of done for the data layer

- [ ] `data/processed/mps.json` contains all 543 constituencies, or a documented subset.
- [ ] Every record has `sources[]` with URL and retrieval date.
- [ ] `validation_report.md` shows no unexplained mismatches for the demo-critical states.
- [ ] State and national averages are computed from the dataset, excluding ministers and nulls, and spot-checked against PRS's published averages.
- [ ] Raw files are committed or archived (size permitting), and the scripts re-run end to end from raw.
- [ ] The README explains the sources, the "as of" dates, the limitations, and how to refresh.