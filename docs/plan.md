# plan.md — Execution plan: "Mera MP, Mera Report Card"

> Read `context.md` (what and why) and `DATA_SOURCES.md` (data) first. This file is the **how and when**.
> Written for hackCBS 9.0 (31 Oct – 1 Nov 2026, SSCBS, New Delhi). Plan is expressed in **T+hours from the start of hacking** because the exact start time and duration must be confirmed at the venue. Past editions ran about 36 hours. If the window is shorter, apply the cut order in section 12.

---

## 1. Goal and success criteria

> **Scope change (2026-11-01):** the citizen draft-letter feature ("Citizen Action" panel and `/api/draft`) was removed from the product. Remaining mentions of it below are historical.

**Goal:** a deployed, reliable web app that shows any Lok Sabha MP's report card from real public data, with an AI plain-language summary, demoed in 2 minutes.

**Success means (in priority order):**
1. The demo never breaks. It runs off a local snapshot, with a fallback for every external call.
2. The numbers shown are real, sourced, dated and correctly labelled.
3. The first 20 seconds of the demo get a reaction ("I can look up my own MP").
4. The code is clean enough to put on a portfolio (README, screenshots, deploy link).

**Non-goals:** auth, accounts, rankings, opinions, live scraping, mobile app.

---

## 2. Team and ownership

Assumes 3–4 people. Merge roles if the team is smaller. One person is the **tech lead and integrator** (merges PRs, owns `main`).

| Role | Owns | Primary deliverables |
|------|------|----------------------|
| **Data lead** | `/scripts`, `/data` | master list, fetchers, merge, validation, `mps.json` |
| **Frontend lead** | `/app`, `/components` | pages, search, report card UI, comparison bars, responsive layout |
| **AI/Backend** | `/lib/ai`, API routes | summary route, prompts, caching, fallbacks |
| **Product/Demo** | pitch, deck, README, QA | demo script, slides, screenshots, test pass, judge Q&A prep |

If 2 people: Person A = data + AI backend. Person B = frontend + demo. If solo: follow the cut order strictly.

Alok is expected to be hands-on with the code he's responsible for. Whoever builds a piece must be able to explain it (judges will ask).

---

## 3. Pre-event checklist (do tonight, before the start)

### Accounts and keys
- [ ] GitHub repo created (private until submission), all teammates added.
- [ ] Vercel project connected to the repo (auto-deploy from `main`, preview deploys on PRs).
- [ ] LLM API key obtained and tested with one call. Store it in `.env.local` and the Vercel env vars, **never commit it**.
- [ ] Confirm laptop chargers, extension boards, hotspot, and the student ID (required at the venue).

### Repo scaffold
- [ ] `npx create-next-app@latest` (TypeScript, App Router, Tailwind, ESLint).
- [ ] Add `context.md`, `DATA_SOURCES.md`, `plan.md` under `/docs` (copy `context.md` to the root as well, for the agent).
- [ ] `.env.example`, `.gitignore` (include `.env*`, `data/raw` if large), `README` skeleton.
- [ ] Prettier + ESLint config, a `pnpm`/`npm` scripts block: `dev`, `build`, `lint`, `typecheck`, `data:build`.
- [ ] First commit and first successful Vercel deploy ("hello world"), so the deploy path is proven before the clock matters.

### Data head start (highest-value prep)
- [ ] Open each source in `DATA_SOURCES.md` and verify the URL, the format, and the terms of use.
- [ ] Download or collect the **master list of 543 constituencies** and the **Delhi subset (7 seats)** from PRS, MPLADS and MyNeta if time permits.
- [ ] Decide the join key convention (section 3 of `DATA_SOURCES.md`) and create an empty `aliases.json`.

### Agent setup
- [ ] Put `context.md` in the repo root. First prompt to the coding agent: "Read context.md, DATA_SOURCES.md and plan.md. Do only task P0-1 and explain what you did."

---

## 4. Architecture decisions (locked unless a blocker appears)

| Decision | Choice | Reason |
|----------|--------|--------|
| Framework | Next.js App Router + TypeScript | known stack, one deploy for UI + API routes |
| Data store | Static `mps.json` (or SQLite) read server-side | zero external dependency on demo day |
| Rendering | Static generation for `/mp/[slug]`, server route for AI | fast pages, AI isolated and cacheable |
| Styling | Tailwind, small custom component set | speed, consistency |
| State | URL params and server components | no global store needed |
| AI | One server route per feature (`/api/summary`), cached per MP, template fallback | robustness |
| Charts | Hand-rolled CSS/SVG bars | no heavy library, full control |
| Deploy | Vercel | zero-config |

Anything that deviates from this table needs a one-line note in `docs/decisions.md` (date, what, why).

---

## 5. Timeline overview

| Phase | Window | Outcome |
|-------|--------|---------|
| **P0 – Foundations** | T+0 → T+3 | repo, types, layout, Delhi sample data in the UI |
| **P1 – Vertical slice** | T+3 → T+10 | one full MP card with real data, end to end |
| **P2 – Scale data + core UI** | T+10 → T+20 | all-state data, search, comparison, MPLADS and affidavit sections |
| **P3 – AI + actions** | T+20 → T+27 | summary, with fallbacks |
| **P4 – Polish + hardening** | T+27 → T+32 | UX, empty states, mobile, disclaimers, performance, QA |
| **P5 – Demo prep** | T+32 → T+35 | deck, rehearsals, backup recording, final deploy freeze |
| **Submission buffer** | last 60 min | no new features, only fixes and submission |

Include **2 sleep/rest windows** if the event allows it, staggered, so someone is always awake. Do not leave integration to the last 3 hours.

---

## 6. Detailed task breakdown

Each task has an ID, an owner, a dependency, and acceptance criteria (AC). Keep tasks small enough to finish in 1–2 hours.

### P0 – Foundations (T+0 → T+3)

| ID | Task | Owner | Depends | Acceptance criteria |
|----|------|-------|---------|---------------------|
| P0-1 | Define TypeScript types from `context.md` (`MP`, `Performance`, `Mplads`, `Affidavit`, `Source`) in `/lib/types.ts` | Tech lead | — | Types compile; nullable fields are explicit |
| P0-2 | Create a hand-written **sample dataset** of 5–7 MPs (Delhi) in `/data/processed/mps.sample.json` | Data lead | P0-1 | Validates against the types; includes one minister and one record with null fields |
| P0-3 | Data access layer `/lib/data.ts`: `getAllMPs`, `getMPBySlug`, `getStateAverages`, `getNationalAverages` | Backend | P0-1, P0-2 | Averages exclude ministers and nulls (unit-tested) |
| P0-4 | App shell: layout, header, footer with source attribution and the unofficial-project disclaimer | Frontend | — | Responsive, with the footer visible on all pages |
| P0-5 | Home page with a state → constituency picker (using the sample data) | Frontend | P0-3 | Selecting a seat navigates to `/mp/[slug]` |
| P0-6 | Slug and normalisation utilities (`slugify`, `normaliseConstituency`) with tests | Data lead | — | Handles "(SC)/(ST)" suffixes, case, punctuation, aliases |

### P1 – Vertical slice (T+3 → T+10)

| ID | Task | Owner | Depends | Acceptance criteria |
|----|------|-------|---------|---------------------|
| P1-1 | Fetch the **official master list** (name, constituency, state, party) into `/data/raw` | Data lead | DataSources verified | Row count matches the expected number of seats, or the gap is documented |
| P1-2 | Fetch the PRS performance data for the **Delhi subset** | Data lead | P1-1 | Raw files saved with retrieval timestamps |
| P1-3 | `05_normalise` + `06_merge` for Delhi | Data lead | P1-1, P1-2 | `mps.json` for Delhi with `sources[]` populated; `validation_report.md` generated |
| P1-4 | **Report card page** `/mp/[slug]`: identity header, performance metrics, "as of" and source line | Frontend | P0-3 | Real Delhi data renders; nulls show "Not available"; ministers show "Not applicable" |
| P1-5 | Comparison component: bar vs state average and national average, with accessible text labels | Frontend | P1-4 | Works for 0, null and 100%; has `aria-label`s |
| P1-6 | Switch the app from sample data to real Delhi data | Tech lead | P1-3 | No code changes needed beyond the data path |
| P1-7 | First deploy of the vertical slice | Tech lead | P1-6 | Public URL loads a real card |

**Gate G1 (T+10):** a teammate who didn't build it can open the deployed URL and read a real MP's card. If not, stop adding scope and fix this.

### P2 – Scale data + core UI (T+10 → T+20)

| ID | Task | Owner | Depends | Acceptance criteria |
|----|------|-------|---------|---------------------|
| P2-1 | Extend PRS fetching to **all states** | Data lead | P1-3 | All fetchers cached and re-runnable; run time documented |
| P2-2 | MPLADS fetch and merge (entitlement, released, spent, utilisation, unspent, as-of) | Data lead | P1-3 | Utilisation % recomputed and reconciled with the portal; mismatches logged |
| P2-3 | MyNeta/ADR fetch and merge (assets, declared cases, education, election year), subject to terms review | Data lead | P1-3 | Labelled "as declared in affidavit"; units normalised (Rs → crore display) |
| P2-4 | Alias table + fuzzy matching pass; resolve unmatched rows | Data lead | P2-1..3 | Unmatched rows < agreed threshold for demo-critical states; the rest are listed |
| P2-5 | MPLADS section on the card (spent vs entitlement bar, unspent balance, as-of date) | Frontend | P2-2 | Handles missing data gracefully |
| P2-6 | Affidavit section on the card with the wording guardrails (see section 9) | Frontend | P2-3 | No "criminal MP" phrasing anywhere; includes a short explainer tooltip |
| P2-7 | **Search**: by MP name and by constituency (client-side filter on a lightweight index JSON) | Frontend | P2-4 | Typo-tolerant, keyboard accessible, results in < 100 ms |
| P2-8 | Compute and **validate averages** against published PRS figures | Backend | P2-1 | Differences within tolerance, or the cause explained in `docs/decisions.md` |
| P2-9 | SEO and share basics: page titles, meta description, OG image per MP (static template) | Frontend | P1-4 | Link previews look right when pasted into WhatsApp |

**Gate G2 (T+20):** all-state data loaded, search works, and a card shows performance + MPLADS + affidavit for at least 90% of seats (the rest degrade cleanly).

### P3 – AI and actions (T+20 → T+27)

| ID | Task | Owner | Depends | Acceptance criteria |
|----|------|-------|---------|---------------------|
| P3-1 | Summary prompt + `/api/summary` route (input: structured MP JSON only) | AI/Backend | G2 | Output uses **only** provided numbers; passes the guardrail checks in section 9 |
| P3-2 | Template-based fallback summary (no LLM) | AI/Backend | P3-1 | Auto-used on timeout, error, or a missing key; indistinguishable in layout |
| P3-3 | Cache summaries (pre-generate for all MPs at build time, or on-demand with disk/KV cache) | AI/Backend | P3-1 | Repeat calls are instant; the demo MPs are pre-warmed |
| P3-4 | "Explain simply" UI: loading state, error state, language toggle (English / Hinglish) | Frontend | P3-1 | Doesn't shift the layout; the Hinglish output is checked by a native speaker |

### P4 – Polish and hardening (T+27 → T+32)

| ID | Task | Owner | Depends | Acceptance criteria |
|----|------|-------|---------|---------------------|
| P4-1 | Empty/error/loading states everywhere (no blank screens, no raw errors) | Frontend | — | Every route has a graceful state |
| P4-2 | Mobile pass at 360px and 390px widths; desktop at 1280px | Frontend | — | No horizontal scroll; tap targets ≥ 44px |
| P4-3 | Accessibility pass: contrast, focus order, labels, semantic headings, `alt` text | Frontend | — | Lighthouse a11y ≥ 90 |
| P4-4 | Performance pass: static generation, image/font handling, bundle size | Tech lead | — | Lighthouse performance ≥ 85 on mobile for a card page |
| P4-5 | Disclaimers and methodology page (`/about`): sources, "as of" dates, limits, ministers note | Product | — | Linked from the footer and every card |
| P4-6 | Cross-check **20 random MPs** against the source sites by hand | Product + Data | G2 | Zero unexplained mismatches, or the fixes are logged |
| P4-7 | Test pass: unit tests for lib functions, one smoke test per route | Tech lead | — | `npm run test` and `npm run build` pass in CI |
| P4-8 | Seed the demo path: pick 3 demo MPs (one active, one with low activity, one minister) and verify each end to end | Product | — | Each demo flow is scripted and repeatable |

### P5 – Demo prep (T+32 → T+35)

| ID | Task | Owner | Depends | Acceptance criteria |
|----|------|-------|---------|---------------------|
| P5-1 | Slide deck (max 6 slides, see section 10) | Product | P4-8 | Reviewed by everyone |
| P5-2 | Demo script with exact clicks and timings | Product | P4-8 | Rehearsed 3 times, under 2:00 |
| P5-3 | **Backup**: screen-recorded demo video + local build on a laptop with no internet | Tech lead | P4-8 | Plays offline |
| P5-4 | **Deploy freeze** tag (`v1.0-demo`), only hotfixes after this point | Tech lead | P4-7 | Production = tagged commit |
| P5-5 | README with screenshots, the data-refresh instructions, and the architecture notes | Product | — | A stranger could run it in 10 minutes |
| P5-6 | Submission checklist completed (repo link, deck, video, form) | Product | — | Submitted before the deadline, not at it |

---

## 7. Engineering standards

### Git workflow
- `main` is always deployable. Work on `feat/<id>-<short-name>` branches (for example `feat/p1-4-report-card`).
- Small PRs, reviewed by at least one other person. At a hackathon, a **5-minute review** is fine, but nothing is merged unseen.
- Commit messages: `type(scope): summary` (for example `feat(data): merge MPLADS utilisation`).
- Never commit secrets, large raw dumps, or `node_modules`. Large raw data goes to cloud storage with a pointer in the README.
- Rebase or merge `main` into your branch at least every 2 hours to avoid end-of-event merge pain.

### Code quality
- TypeScript `strict` on. No `any` without a comment explaining why.
- Pure functions in `/lib` (averages, formatting, normalisation) with unit tests. These are the highest-bug-risk, lowest-test-cost pieces.
- Format numbers in one place (`formatCrore`, `formatPct`) so units are consistent. Display Indian-style grouping where relevant.
- Components stay small and presentational. Data fetching happens in server components or `/lib`.

### Definition of Done (per task)
Code merged, builds and lints pass, acceptance criteria verified by someone else, no new console errors, and the deployed preview was checked.

### Communication
- A 5-minute sync every 3–4 hours: done / next / blocked.
- A shared checklist (GitHub Projects or a pinned doc) mirroring the task IDs above.
- Blockers lasting more than 30 minutes get escalated to the tech lead.

---

## 8. Interfaces (drafts to keep frontend and backend unblocked)

### Routes
| Route | Type | Purpose |
|-------|------|---------|
| `/` | page | search + state/constituency picker |
| `/mp/[slug]` | page (static) | report card |
| `/compare?a=&b=` | page (stretch) | side-by-side comparison |
| `/about` | page | methodology, sources, disclaimers |
| `/api/summary` | POST | `{ slug }` → `{ text, source: "llm" \| "template" }` |
| `/api/search-index` | GET/static | lightweight index for client search |

### Display rules
- Missing number: "Not available". Minister: "Not applicable (minister)". Zero: show `0`, not blank.
- Every metric shows its source name and "as of" date (hover or a footnote is fine, but visible on the card).
- Money: display in ₹ crore with sensible rounding; keep the raw value in the data.

---

## 9. AI design and guardrails

### Summary prompt (outline)
- **System:** "You summarise public parliamentary data for citizens. Use only the JSON provided. Do not add facts, opinions, or comparisons not in the data. Neutral tone. Do not rank or judge. Do not use the words 'criminal' for an MP; refer to 'declared cases in the election affidavit'. If a field is null, say it is not available. 3–4 short sentences. Output language: {lang}."
- **User:** the structured MP object plus the state/national averages and the as-of dates.
- **Parameters:** low temperature, a token cap, and a hard timeout (about 8 s) before the template fallback fires.

### Guardrails (verified in P3 and P4)
- **Grounding test:** every number in the output must appear in the input JSON. Add a simple post-check (regex numbers vs input) and fall back to the template on mismatch.
- **Neutrality test:** run 10 sample MPs from different parties and check that the tone is the same. No party bias in phrasing.
- **Prompt-injection safety:** the only user-controlled input is the `slug` and a fixed set of intents. Do not pass free text from users into the system prompt.
- **Cost control:** cache, pre-generate for the demo MPs, rate-limit, and cap the output length.
- **Failure mode:** any error = template summary. The UI never shows an error string from the LLM.

---

## 10. Pitch and demo

### Deck (6 slides max)
1. **Problem:** the data is public but nobody can use it. Hook with one striking real fact from the data (pick it from the dataset, don't invent it).
2. **Solution:** the one-line pitch + a screenshot.
3. **How it works:** sources → clean snapshot → report card → AI explain → action. Keep it to a sentence each, no diagram needed.
4. **Responsible by design:** neutral indicators, sources and dates, ministers handled, affidavit wording.
5. **Impact and scale:** all 543 seats, Hindi, committees, state assemblies, and partnering with civic groups.
6. **Team and ask.**

### Live demo script (2:00)
| Time | Action |
|------|--------|
| 0:00–0:15 | Problem statement, with no slides |
| 0:15–0:45 | Search a constituency someone in the room knows, and the card opens |
| 0:45–1:10 | Walk through the metrics, the comparison bars and the MPLADS section |
| 1:10–1:30 | Click "Explain simply" (switch to Hinglish) |
| 1:50–2:00 | Close: sources, neutrality, what scales next |

### Likely judge questions (prepare answers)
- *Is this data reliable?* Sources are official or established civic-data orgs, every number carries a source and date, and we cross-checked samples by hand.
- *Isn't this just attendance shaming?* We show indicators with context, not rankings. We state clearly that activity ≠ quality, and ministers are marked not applicable.
- *How is the AI grounded?* It only receives structured data, a post-check verifies every number, and there's a template fallback.
- *How does it scale / what's the business or impact model?* Free civic tool, with partnerships with NGOs, media and election-awareness groups; maintenance via a scripted data refresh.
- *Legal risk?* Public records, attributed, neutral wording, with a disclaimer and no defamatory labels.
- *What's technically hard here?* Joining inconsistent public datasets reliably (aliases, fuzzy matching, validation) and keeping the app robust offline.
- *Why now?* Post-2024 election cycle, so people can check their new MP's record early in the term.

---

## 11. Risk register

| # | Risk | Likelihood | Impact | Mitigation | Trigger → action |
|---|------|-----------|--------|-----------|------------------|
| R1 | A source blocks or has changed format | Med | High | Cache everything early, with manual-export fallback | No data by T+8 → switch to the manual download for the demo states |
| R2 | Name/constituency join errors | High | Med | Alias table, fuzzy match, validation report | > 10% unmatched at T+18 → limit the demo to verified states |
| R3 | MPLADS portal is slow or unreliable | High | Med | Collect early, treat it as optional enrichment | Not ready by T+18 → hide the section for MPs without data |
| R4 | LLM API failure or quota | Med | Med | Template fallback and pre-generated demo summaries | Any failure → fallback automatically |
| R5 | Wi-Fi at the venue is unreliable | Med | High | Local build + recorded demo + hotspot | Demo from the local build |
| R6 | Misleading or defamatory presentation | Low | High | Neutral wording, disclaimers, a review pass | Any doubtful phrasing → rewrite before the freeze |
| R7 | Scope creep | High | High | Cut order below, with gates G1/G2 | Missing a gate → stop adding features |
| R8 | Merge conflicts or a broken `main` at the end | Med | High | Small PRs, a deploy freeze, a tagged release | Broken main → revert to the last tag |
| R9 | Team fatigue | High | Med | Staggered rest, simple tasks later | Hard tasks scheduled early (T+0 → T+20) |
| R10 | Data licensing or terms of use issue | Low–Med | Med | Read the terms, attribute, avoid bulk-hosting restricted content | A source forbids reuse → link out instead of copying |

---

## 12. Scope cut order (when behind schedule)

Cut from the top first. Never cut the last three.

1. Compare page, Hindi UI, subject-wise questions, pincode lookup
2. OG images and SEO extras
3. Affidavit section (keep it only if verified and time allows)
5. State averages (keep national only)
6. AI summary (keep the template summary)
7. **Never cut:** accurate performance data, source/date labels, a deployed, working card page with search.

---

## 13. Quality checklist before the freeze

- [ ] All demo MPs verified against source sites
- [ ] No console errors on the key pages
- [ ] Every page has the disclaimer and sources
- [ ] Build passes in CI, and the production URL matches the tagged commit
- [ ] The offline backup works
- [ ] API keys are not exposed in the client bundle (inspect the network tab)
- [ ] The README, the deck and the demo script are consistent with each other
- [ ] Phones tested on both Android and iOS Safari if available

---

## 14. After the hackathon (portfolio and growth)

- Write a short case study: problem, data challenges, architecture decisions, and what you'd improve.
- Add a refresh script and a scheduled GitHub Action to rebuild the snapshot each session.
- Add tests and CI properly, a data-quality dashboard, and committee data.
- Publish the cleaned dataset (if the source terms allow), with credits.
- Add to the resume: stack, scale (543 constituencies, N data sources), and measurable outcomes (placement relevant: data engineering + full-stack + responsible AI).

---

## 15. Quick reference: first 3 hours, step by step

1. (T+0:00) Sync: confirm roles, the clock, the submission rules. Confirm that the repo and the Vercel deploy work.
2. (T+0:15) Tech lead: P0-1 types. Data lead: starts P1-1 in parallel. Frontend: P0-4 shell.
3. (T+1:00) Sample dataset in place, so the frontend is unblocked.
4. (T+2:00) The home page picker and a placeholder card render from the sample data.
5. (T+3:00) Checkpoint: the real master list is in `/data/raw`. Start P1-2/P1-3 and P1-4 against real data.