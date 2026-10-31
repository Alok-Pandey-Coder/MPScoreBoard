# features.md — Feature catalogue and decisions

> Project: "Mera MP, Mera Report Card" (hackCBS 9.0)
> Purpose: list **every candidate feature** so the team can decide what goes in. Nothing here is committed until it is marked **Decision: YES**.
> Related docs: `context.md`, `prd.md`, `plan.md`, `DATA_SOURCES.md`.

## How to read this file

**Effort:** S = up to 2 hours · M = 2–5 hours · L = 5–10 hours
**Wow:** the effect on a live demo / judges.
**Risk:** data availability, legal, technical or time risk.
**Rec (my recommendation):**
- **MVP** = build first.
- **Next** = build once the core is stable (after the data and card page pass their gates).
- **Later** = only if time remains.
- **Skip** = do not build.

**Decision column:** the team fills this in: `YES`, `NO` or `MAYBE`, plus the owner (TL / DL / FE / AI).

---

## A. Finding an MP

| ID | Feature | Effort | Wow | Risk | Rec | Decision |
|----|---------|--------|-----|------|-----|----------|
| A1 | State, then constituency picker | S | Low | Low | MVP | |
| A2 | Search by MP name, seat or state, tolerant to typos and aliases | M | Med | Low | MVP | |
| A3 | "Use my location": find the seat from device GPS (lookup runs on the user's device; coordinates never sent to the server) | M | High | Med (needs boundary data) | Next | |
| A4 | Pincode to seat lookup | M | Med | High (no clean official mapping) | Later | |
| A5 | Interactive constituency map; each region shows its MP's name; click opens the profile | L | High | Med (large boundary file must be simplified) | Next | |
| A6 | Recently viewed MPs (saved in the browser, no login) | S | Low | Low | Later | |

## B. MP profile

| ID | Feature | Effort | Wow | Risk | Rec | Decision |
|----|---------|--------|-----|------|-----|----------|
| B1 | Identity header (name, party, seat, state, term) | S | Low | Low | MVP | |
| B2 | Key indicators: attendance, debates, questions, private member bills | S | Med | Low | MVP | |
| B3 | Comparison with state and national averages | M | High | Low | MVP | |
| B4 | Attendance trend, session by session | M | Med | Med (needs data) | Next | |
| B5 | MP history: earlier terms, seats, parties | M | Med | Med (needs data) | Next | |
| B6 | MPLADS summary: funds available, spent, unspent, utilisation % | M | High | Med (portal can be unreliable) | MVP | |
| B7 | Funds by year chart (released vs spent) | M | Med | Low | Next | |
| B8 | Works list with filters (category, status) and pagination | M | High | Med | Next | |
| B9 | Bills list (private member bills and their status) | S | Med | Low | Next | |
| B10 | Questions and debates list, with a subject-wise breakdown | L | Med | High | Later | |
| B11 | Affidavit background (assets, declared cases, education), always labelled "as declared in the election affidavit" | M | Med | High (legal, terms of use) | Next, after the terms check | |
| B12 | Committee memberships | L | Low | High | Later | |
| B13 | Sources and "as of" date panel | S | High (trust) | Low | MVP | |

## C. Understanding (AI and help)

| ID | Feature | Effort | Wow | Risk | Rec | Decision |
|----|---------|--------|-----|------|-----|----------|
| C1 | Template summary (no AI, always works) | S | Low | Low | MVP | |
| C2 | Gemini summary in English and Hinglish, with a grounding check | M | High | Low (fallback exists) | MVP | |
| C3 | "Ask about this MP": a chat that answers only from that MP's data | L | High | Med (needs strong guardrails) | Next | |
| C4 | Glossary tooltips (for example, "What is MPLADS?") | S | Med | Low | MVP | |
| C5 | Read the summary aloud (browser text-to-speech) | S | Med | Low | Later | |
| C6 | Agent trail (Meko): shows which agent verified what | L | High (for the ₹50k Yugabyte prize) | High | Decide at Gate 3 | |

## D. Taking action

| ID | Feature | Effort | Wow | Risk | Rec | Decision |
|----|---------|--------|-----|------|-----|----------|
| D1 | Draft letter or question to the MP (editable) | M | High | Low | MVP | |
| D2 | Suggested questions to ask the MP, based on the data | S | Med | Low | Next | |
| D3 | RTI draft for MPLADS | M | Med | Med (must not be legally misleading) | Later | |
| D4 | Share link with a link preview (OG tags) | S | Med | Low | MVP | |
| D5 | Shareable WhatsApp image (mini card) | M | High | Low | Next | |
| D6 | PDF or print report | M | Low | Low | Later | |
| D7 | MP contact details (office, email) | S | Med | Med (needs a trusted source) | Later | |

## E. Explore and compare

| ID | Feature | Effort | Wow | Risk | Rec | Decision |
|----|---------|--------|-----|------|-----|----------|
| E1 | Compare two MPs side by side (no "winner") | M | Med | Low | Next | |
| E2 | State page: all MPs of a state, alphabetical | S | Low | Low | Next | |
| E3 | Table of all MPs sortable by performance | M | Med | **High (reads like a ranking)** | Team decision (see section J) | |
| E4 | Trends across terms (an MP's earlier vs current term) | M | Med | Med | Later | |

## F. Trust and content

| ID | Feature | Effort | Wow | Risk | Rec | Decision |
|----|---------|--------|-----|------|-----|----------|
| F1 | About / methodology page | S | High (trust) | Low | MVP | |
| F2 | Disclaimer and data freshness on every page | S | Med | Low | MVP | |
| F3 | "TEST DATA" banner whenever fake data is loaded | S | Required | Low | MVP | |
| F4 | "Data looks wrong?" report link (GitHub issue) | S | Med | Low | Next | |

## G. Platform

| ID | Feature | Effort | Wow | Risk | Rec | Decision |
|----|---------|--------|-----|------|-----|----------|
| G1 | Mobile-first responsive layout | M | High | Low | MVP | |
| G2 | Accessibility (keyboard, contrast, screen reader) | M | Med | Low | MVP | |
| G3 | Hindi UI toggle | M | High | Med (translation quality) | Later | |
| G4 | PWA / offline support | M | Med | Low | Later | |
| G5 | Dark mode | S | Low | Low | Later | |
| G6 | Privacy-friendly analytics (aggregate counts only) | S | Low | Low | Later | |

## H. Data and backend

| ID | Feature | Effort | Wow | Risk | Rec | Decision |
|----|---------|--------|-----|------|-----|----------|
| H1 | Test data generator (fictional MPs and a synthetic map) | M | Required | Low | MVP | |
| H2 | Data validation script (a bad dataset fails the build) | S | Med | Low | MVP | |
| H3 | Real data import (our files, same schema as the test data) | M | Required | Med | MVP | |
| H4 | Public data download (JSON/CSV) and API docs | S | Med (open-data story) | Low | Later | |
| H5 | Admin upload page | L | Low | High (security) | Skip (a CLI is enough) | |

## I. Will not build

- User accounts or login.
- Rankings of MPs or parties, "best / worst" labels.
- Citizen comments or ratings (moderation and defamation risk).
- Notifications, political polls or sentiment tracking.
- Live scraping at runtime.

---

## J. Decisions needed from the team

| # | Question | Options | Recommendation | Decision |
|---|----------|---------|----------------|----------|
| 1 | Include the map (A5) and location lookup (A3)? | Yes / No / Only after Gate 3 | Yes, after Gate 3. Biggest demo effect, but depends on real boundary data. | |
| 2 | Allow sorting MPs by performance (E3)? | Yes / No / Alphabetical only | No, or alphabetical only. Sorting reads like a ranking, which breaks our neutrality rule. | |
| 3 | Include the affidavit block (B11)? | Yes / No | Only after the legal and terms-of-use check. | |
| 4 | Include MP chat (C3) and/or Meko agent trail (C6)? | Both / One / Neither | Decide at Gate 3, only if the core is stable and 2 people are free. | |

---

## K. Suggested bundles

| Bundle | Features | When to choose |
|--------|----------|----------------|
| **Safe core** | A1, A2, B1, B2, B3, B6, B13, C1, C2, C4, D1, D4, F1, F2, F3, G1, G2, H1, H2, H3 | Small team or little time; lowest risk |
| **Strong demo** (recommended) | Safe core + A3, A5, B5, B7, B8, B9, D5, E1 | Team of 3–4 with the core on schedule |
| **Max ambition** | Strong demo + B11, C3, C6 | Team of 4, Gate 3 passed on time, legal check done |

---

## L. Data each feature depends on

| Feature(s) | Data needed | Source / status |
|------------|-------------|-----------------|
| A1, A2, B1 | Master list: MP, seat, state, party | Official lists (see `DATA_SOURCES.md`) |
| A3, A5 | Constituency boundaries (GeoJSON) matching the 2024 election seats | To be sourced and verified (not confirmed yet) |
| B2, B3, B4 | Attendance, debates, questions, bills, averages | PRS and Sansad |
| B5 | Previous terms per MP | PRS or Sansad history (to be confirmed) |
| B6, B7, B8 | MPLADS funds and works | MPLADS portal |
| B9 | Private member bills | PRS and Sansad |
| B11 | Affidavit data | MyNeta / ADR (terms to be checked) |
| C2, C3, D1 | The structured MP object only | Our own snapshot |

Until real data arrives, all of the above run on **clearly labelled fictional test data** (`isTest: true`, "TEST DATA" banner, validation blocks deploying test data as real).

---

## M. Final scope (fill in after the decisions)

- **Bundle chosen:**
- **Extra features added:**
- **Features removed:**
- **Owners:** TL: · DL: · FE: · AI:
- **Date and time decided:**
- Next step: update `prd.md`, `plan.md` and the backend prompt to match this scope.