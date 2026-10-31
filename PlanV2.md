# plan.md (v2) — Execution plan with phase gates

> Project: "Mera MP, Mera Report Card" · Event: hackCBS 9.0 (31 Oct – 1 Nov 2026, SSCBS, New Delhi)
> Read first: `context.md` (what/why), `prd.md` (exact behaviour), `DATA_SOURCES.md` (data).
> This file = **who does what, in what order, and what must be true before we move on.**
> Replaces the earlier plan.md. Times are **T+hours from the start of hacking**. Confirm the real start time and duration at the venue (past editions ran about 36 h). If shorter, use the cut order in section 9.

---

## 1. How the gate system works (read this once)

1. The work is split into **phases**. Each phase lists the tasks for **every role**.
2. A phase ends with a **Gate**: a checklist of things that must be verified, not assumed.
3. **Nobody starts the next phase's new work until the Gate is signed off.** People who finish early help others inside the same phase (review PRs, test, write docs); they don't jump ahead.
4. Each gate check has a **verifier who is not the person who built it.** "It works on my machine" doesn't pass.
5. If a gate fails: stop, write the failing items on the board, fix only those, re-check. Don't open new scope.
6. If a gate is **15 minutes past its time** and still not passing, the Tech Lead decides: extend by max 30 min, or cut scope using section 9. Record the decision in `docs/decisions.md` (one line: time, decision, reason).
7. Sign-off format, posted in the team chat: `GATE 2 PASSED — checked by <name> at T+10:20 — notes: <anything>`.

### Roles (4 people; merge roles if fewer)
| Code | Role | Owns | Also responsible for |
|------|------|------|----------------------|
| **TL** | Tech Lead / Integrator | `main`, deploys, CI, `/lib/data.ts`, types | merging PRs, gate verification, final freeze |
| **DL** | Data Lead | `/scripts`, `/data`, validation | source verification, `DATA_SOURCES.md` upkeep |
| **FE** | Frontend Lead | `/app`, `/components` | responsive, accessibility, UI copy |
| **AI** | AI + Demo Lead | `/lib/ai`, `/api/*`, deck, README | prompts, guardrails, pitch, demo script, submission |

**3 people:** merge AI into TL (TL does AI backend, FE does the deck). **2 people:** Person 1 = TL + DL, Person 2 = FE + AI. **Solo:** follow section 9 strictly and skip Track B.

---

## 2. Tracks and prize strategy

| Track | What | Status |
|-------|------|--------|
| **Core (must)** | Report card app with real data, search, comparison, MPLADS, sources, disclaimers | Always |
| **A: Gemini layer (should)** | Gemini for the summary + draft letter; optionally for extracting messy fields in the data pipeline; template fallback always on | Default |
| **B: Meko agent layer (optional)** | Multi-agent data verification and explanation using Yugabyte's Meko shared memory (the ₹50,000 problem statement) | **Decided at Gate 3** |
| **Prizes** | Best Social Innovation (pitch only, no extra build) · Gemini (Track A) · Yugabyte/Meko (Track B) · MLH Atlas / DigitalOcean / Vultr / Tiger Data only if a use is genuinely natural | See section 8 |

Rule: **core first.** Tracks A and B are enhancements. The card page must work with no AI and no external database.

---

## 3. Working agreements (all roles)

**Git**
- `main` is always deployable. Work in `feat/<phase>-<role>-<short-name>` branches, for example `feat/p2-fe-report-card`.
- Small PRs. Another person reviews every PR (5-minute review is fine). Nobody merges their own PR unreviewed.
- Commit format: `type(scope): summary`, for example `feat(data): merge MPLADS utilisation`.
- Pull `main` into your branch at least every 2 hours.
- Never commit secrets (`.env*`), huge raw dumps or `node_modules`.

**Communication**
- Board (GitHub Projects or a pinned doc) with every task below as a checkbox.
- Sync every ~3 hours (5 minutes): done / next / blocked.
- Blocked for more than 30 minutes = tell the TL immediately.

**Interface contracts (so people don't block each other)**
- `MP`, `Snapshot` types in `/lib/types.ts` (from `prd.md` section 8) are the contract between DL, FE and AI. Changing a type needs TL approval and a message to everyone.
- The data access functions in `/lib/data.ts` are the only way the UI and APIs read data.
- API shapes are in `prd.md` section 6. Don't change them without telling FE and AI.

**Definition of Done (every task)**
Code merged via reviewed PR · `lint`, `typecheck`, `build` pass · acceptance check done by someone else · no new console errors · checked on the preview deploy.

**Rest:** stagger sleep. At least 2 people awake at any time. Hard tasks go early (T+0 to T+20); simple tasks go late.

---

## 4. PHASE 0 — Preparation (tonight, before T+0)

**Objective:** nothing technical should be a surprise when the clock starts.

### Tasks
**TL**
- [ ] 0.TL.1 Create the repo (or confirm `ayush3739/hackcb` access for everyone). Scaffold Next.js (App Router, TypeScript, Tailwind, ESLint).
- [ ] 0.TL.2 Add scripts: `dev`, `build`, `lint`, `typecheck`, `test`, `data:build`. Add Prettier.
- [ ] 0.TL.3 Create `.env.example`, `.gitignore`, and a README skeleton. Add `context.md` (root), and `prd.md`, `plan.md`, `DATA_SOURCES.md`, `problem-statement.md` (`/docs`).
- [ ] 0.TL.4 Connect Vercel. Deploy "hello world" from `main`, with preview deploys on PRs.
- [ ] 0.TL.5 Create the board with all tasks from this file. Create `docs/decisions.md`.

**DL**
- [ ] 0.DL.1 Open every source in `DATA_SOURCES.md`. For each, record in a table: URL works? format? export available? terms/robots OK? Mark P0 sources (PRS, Sansad, MPLADS) first.
- [ ] 0.DL.2 Download or save raw files for the master list and for **Delhi's 7 seats** from PRS and MPLADS. Save them in `data/raw` with the date.
- [ ] 0.DL.3 Create an empty `data/processed/aliases.json` and write down the join-key rules.

**FE**
- [ ] 0.FE.1 Check Tailwind config, fonts, a base colour palette (neutral, no party colours), and spacing scale. Write them in `docs/design-tokens.md` (5 lines is enough).
- [ ] 0.FE.2 List the components from `prd.md` section 12 and mark which are Must for the MVP.
- [ ] 0.FE.3 Set up a way to test at 360 px and 390 px (browser devtools presets are fine).

**AI**
- [ ] 0.AI.1 Get a Gemini API key. Make one server-side test call. Confirm the key does **not** appear in client code.
- [ ] 0.AI.2 Get the **full text** of the Yugabyte/Meko problem statement and the MLH prize rules (links in the prize cards). Paste key criteria in `docs/prizes.md`.
- [ ] 0.AI.3 Read the Meko docs/"Meko works with" pages. Write 5 lines: how to sign up, how to connect (MCP?), free tier, what a Datapack is. Mark anything unverified.
- [ ] 0.AI.4 Draft the first version of the prompts (summary, draft letter) in a doc, not code yet.

### GATE 0 — Ready to start (verifier: TL checks DL/FE/AI items; AI checks TL items)
- [ ] Every teammate can clone, `npm install`, `npm run dev`, and see the app locally.
- [ ] The Vercel URL loads. A trivial change on a branch produces a preview URL.
- [ ] `docs/` has all five docs. The board exists with all tasks.
- [ ] Source verification table is complete. At least PRS + master list + MPLADS are confirmed reachable, or the gap is written down.
- [ ] Delhi raw files are saved locally.
- [ ] Gemini call works server-side. Meko decision inputs (statement text, docs summary) are in `docs/prizes.md`.
- [ ] Everyone knows their role and the gate rules.

**If it fails:** fix tonight. Don't walk in with an unproven deploy or no data access.

---

## 5. PHASE 1 — Foundations (T+0 → T+3)

**Objective:** contracts, sample data and the app shell exist, so every role can work in parallel.

### Tasks
**TL**
- [ ] 1.TL.1 Write `/lib/types.ts` from `prd.md` section 8 (`MP`, `Performance`, `Mplads`, `Affidavit`, `Source`, `Snapshot`, `Averages`).
- [ ] 1.TL.2 Write `/lib/data.ts`: `getAllMPs`, `getMPBySlug`, `getStateAverages`, `getNationalAverages`. Averages exclude ministers and nulls and report N.
- [ ] 1.TL.3 Unit tests for averages and the lookup functions (include a minister and a null case).

**DL**
- [ ] 1.DL.1 Create `data/processed/mps.sample.json` with 5–7 Delhi MPs. Include one minister, one record with null MPLADS, one with null affidavit.
- [ ] 1.DL.2 Write `/lib/normalise.ts`: `slugify`, `normaliseConstituency` (strip "(SC)/(ST)", case, punctuation, apply aliases). Unit tests included.
- [ ] 1.DL.3 Start fetching the **official master list** (name, constituency, state, party) into `data/raw`.

**FE**
- [ ] 1.FE.1 App shell: layout, header, footer with source attribution and the unofficial-project disclaimer (text from `prd.md` section 11).
- [ ] 1.FE.2 Home page with state → constituency pickers using the sample data. Selecting navigates to `/mp/[slug]`.
- [ ] 1.FE.3 Static versions of `MetricTile` and `ComparisonBar` with props (including null, "Not applicable" and zero states).

**AI**
- [ ] 1.AI.1 Write the pure function `templateSummary(mp, averages, lang)` (no LLM), with tests.
- [ ] 1.AI.2 Write `groundingCheck(output, input)` that extracts numbers from the output and confirms each exists in the input. Tests included.
- [ ] 1.AI.3 Stub `/api/summary` returning the template summary for a valid slug, and the error contract from `prd.md` section 6.3 for an invalid one.

### GATE 1 — Foundations (T+3) (verifier: swap roles — FE verifies TL/AI work, TL verifies FE, AI verifies DL, DL verifies AI)
- [ ] `npm run lint && npm run typecheck && npm run test && npm run build` pass on `main`.
- [ ] The home page picker works on the preview URL with sample data and navigates to a placeholder card.
- [ ] Averages test proves ministers and nulls are excluded.
- [ ] `groundingCheck` rejects a summary with an invented number (test exists).
- [ ] `/api/summary` returns 200 with a template for a valid slug and the right error for an invalid slug.
- [ ] The sample file validates against the types (no `any` shortcuts).
- [ ] Master list download has started and the row count so far is known.

**If it fails:** the missing item blocks Phase 2, because the vertical slice depends on all of these.

---

## 6. PHASE 2 — Vertical slice (T+3 → T+10)

**Objective:** one real MP card, end to end, deployed. This proves the whole chain works.

### Tasks
**TL**
- [ ] 2.TL.1 Review and merge PRs quickly. Keep `main` green.
- [ ] 2.TL.2 When DL delivers real Delhi data, switch the data path from sample to real. No other code changes should be needed. If changes are needed, note why.
- [ ] 2.TL.3 First production deploy of the slice. Check the deployed card URL on a phone.

**DL**
- [ ] 2.DL.1 Finish the master list. Document the row count vs the expected number of seats (or the gap).
- [ ] 2.DL.2 Fetch PRS performance data for **Delhi**. Fetch scripts must cache responses, sleep between requests, and log URL + timestamp.
- [ ] 2.DL.3 Write `05_normalise` and `06_merge` for Delhi. Produce `mps.json` (Delhi) with `sources[]` filled and a `validation_report.md`.
- [ ] 2.DL.4 Hand-verify **every Delhi MP's numbers** against the PRS site (7 rows is quick). Fix mismatches.

**FE**
- [ ] 2.FE.1 Build `/mp/[slug]`: identity header, four indicator tiles, as-of date and the source line, using real data.
- [ ] 2.FE.2 Build the comparison bars versus state and national average, with numeric text next to each bar (not colour only).
- [ ] 2.FE.3 Handle states: null → "Not available", minister → "Not applicable (minister)" with the explanation, zero → `0`.
- [ ] 2.FE.4 Footer "Sources and methodology" block listing sources with retrieval dates.

**AI**
- [ ] 2.AI.1 Draft the About page (`/about`) content: sources, metric definitions, ministers note, affidavit note, disclaimer, AI safeguards.
- [ ] 2.AI.2 Write the Gemini summary call behind `/api/summary` (Track A) with: server-side key, strict prompt, JSON/structured output where possible, timeout ≈ 8 s, `groundingCheck`, and template fallback. Keep the UI button off until Gate 4.
- [ ] 2.AI.3 Prepare 3 demo MPs candidates (one active, one with low activity, one minister) from the real Delhi data. Write down their IDs.

### GATE 2 — Vertical slice (T+10) (verifier: someone who did not build it, opening the deployed URL cold on a phone)
- [ ] The production URL loads a **real** Delhi card with correct numbers.
- [ ] 7 of 7 Delhi cards were manually matched to the source. Any mismatch is fixed or explained in `validation_report.md`.
- [ ] Minister, null and zero cases display correctly on at least one real or test record each.
- [ ] Every number on the card has a visible source and as-of date.
- [ ] Comparison bars show numbers as text and are readable at 360 px.
- [ ] `/about` renders with the content outline above.
- [ ] Data scripts re-run from raw files end to end without manual edits (run it once from a clean checkout).
- [ ] No console errors on `/`, `/mp/[slug]`, `/about`.

**If it fails:** do not scale to all states. A broken pipeline for 7 seats will not work for 543.

---

## 7. PHASE 3 — Scale data and core UI (T+10 → T+20)

**Objective:** all states loaded, search works, MPLADS and affidavit blocks in place, and the core product feature-complete.

### Tasks
**TL**
- [ ] 3.TL.1 Keep `main` stable. Add the build-time validation (unique slugs, required fields, valid ranges, ≥1 source per record) so a bad snapshot fails the build.
- [ ] 3.TL.2 `generateStaticParams` for all seats. Confirm build time is reasonable.
- [ ] 3.TL.3 Compute and cross-check the **state and national averages** against PRS's published averages. Log differences in `docs/decisions.md`.

**DL**
- [ ] 3.DL.1 Extend PRS fetching to all states. Document run time.
- [ ] 3.DL.2 MPLADS fetch + merge: entitlement, released, spent, utilisation %, unspent, as-of. Reconcile utilisation with the portal definition and log mismatches.
- [ ] 3.DL.3 MyNeta/ADR fetch + merge (assets, declared cases, education, election year) **only after confirming terms of use.** If not allowed, skip and note it.
- [ ] 3.DL.4 Alias table + fuzzy matching. Resolve unmatched rows. Produce the final `validation_report.md` (unmatched, nulls per field, anomalies).
- [ ] 3.DL.5 Hand-verify **20 random MPs** (different states, including 2 ministers, 1 by-election seat, 1 small state).

**FE**
- [ ] 3.FE.1 MPLADS panel (entitlement, released, spent, utilisation, unspent, as-of, early-term note).
- [ ] 3.FE.2 Affidavit panel with the exact wording rules (`prd.md` 5.9). No "criminal MP" anywhere. Hidden if data is missing or not permitted.
- [ ] 3.FE.3 Unified search (name, constituency, state) with typo tolerance, keyboard navigation, no-results message. Load the index lazily.
- [ ] 3.FE.4 Custom 404 with the search box and a generic error boundary.
- [ ] 3.FE.5 Share: "Copy link" button, page titles, meta description and OG tags.

**AI**
- [ ] 3.AI.1 Finish `/about` and the global disclaimer text. Review all copy against the content rules (`prd.md` 5.9).
- [ ] 3.AI.2 Pre-generate (or batch-generate) Gemini summaries in English and Hinglish for the demo MPs, and run the neutrality check on 10 MPs from different parties.
- [ ] 3.AI.3 **Meko spike (time-boxed to 60 minutes, only if TL agrees at T+12):** sign up, connect, write and read one Datapack entry from a script. Record result and obstacles in `docs/prizes.md`.
- [ ] 3.AI.4 Add rate limiting (per IP) to the API routes.

### GATE 3 — Core complete + Track B decision (T+20) (verifier: TL + one other, using a fresh clone and the production URL)
**Core checks**
- [ ] `mps.json` covers all seats, or a documented subset with the rest degrading gracefully.
- [ ] Cards show performance + MPLADS + affidavit (where permitted) for at least ~90% of seats. The rest show clear "not available" states.
- [ ] 20-MP spot check: zero unexplained mismatches.
- [ ] Search finds: an exact name, a typo ("Varanassi"), an alias ("Bangalore") and a state. Under 100 ms after load.
- [ ] State and national averages match PRS figures within tolerance, or the reason is documented.
- [ ] The build fails on purpose when a bad record is introduced (prove the validation works), then passes when it's removed.
- [ ] Lighthouse mobile run on one card: no critical issues; note the scores.
- [ ] Wording review: grep the repo for banned words (`criminal`, `worst`, `best`, `failed`, `lazy`) in UI copy and prompts. None used inappropriately.

**Track B decision (record in `docs/decisions.md`)** — choose **B only if all are true:**
- [ ] All core checks above passed **by T+20**.
- [ ] The Meko spike (3.AI.3) worked: a read and a write succeeded.
- [ ] The full Meko problem statement is read and our agent idea clearly fits it.
- [ ] At least 2 people can be dedicated for ~6 hours without hurting polish and demo prep.
- [ ] The team agrees the card page stays independent of Meko (fallback exists).
Otherwise choose **A only** and move on without regret. A polished core + Gemini + Social Innovation is a strong entry.

**If core fails:** stop everything else. Extend within the 30-minute rule, then cut per section 9.

---

## 8. PHASE 4 — AI layer (T+20 → T+27)

**Objective:** summary and draft letter live with fallbacks (Track A). If Track B was chosen, the agent layer is built alongside, without breaking the card page.

### Tasks (Track A — everyone)
**TL**
- [ ] 4.TL.1 Review all AI-related PRs for secrets in client code, input validation (enum intents, length caps) and error contract compliance.
- [ ] 4.TL.2 Add smoke tests: one per route, including `/api/health`.

**DL**
- [ ] 4.DL.1 Support the AI work: provide a clean per-MP JSON for prompts and a list of tricky cases (minister, null, by-election, small state) for tests.
- [ ] 4.DL.2 Re-run the full pipeline from raw to `mps.json` once more on a clean checkout. Confirm the output hash is stable.

**FE**
- [ ] 4.FE.1 "Explain simply" panel: language toggle (English/Hinglish), loading skeleton, no layout shift, label "Auto-generated summary", live region for screen readers.
- [ ] 4.FE.2 Draft panel: intent select (fixed list), language, optional name/locality, editable textarea, copy with confirmation, "open in email" link, "review before sending" note.
- [ ] 4.FE.3 Make sure the AI sections load lazily and never block the first render.

**AI**
- [ ] 4.AI.1 Wire the Gemini summary route to the UI. Test: key missing, timeout, malformed output, and a number not in the input → all fall back to the template silently.
- [ ] 4.AI.2 Build `/api/draft` with the intent list, 180-word cap, placeholders for missing fields, and a template fallback. Don't log name/locality.
- [ ] 4.AI.3 Hinglish review by a native speaker on 5 samples. Fix tone issues.
- [ ] 4.AI.4 Cache summaries per `(slug, lang)`. Pre-warm the 3 demo MPs.
- [ ] 4.AI.5 (Optional, if time) use Gemini in the data pipeline to extract fields from messy text/PDF, with human verification of its output.

### Tasks (Track B — only if chosen at Gate 3; assign 2 people: AI + one of DL/FE)
Scope: a small multi-agent workflow with shared memory, **additive and optional**.
- [ ] 4.B.1 Define 3 agents with clear roles: **Matcher** (resolves name/alias mismatches), **Verifier** (cross-checks numbers across sources, records the reason for each flag), **Explainer** (writes the card summary from verified facts only).
- [ ] 4.B.2 Shared memory: when the Matcher resolves an alias, it writes it to the Meko knowledge store; other agents read it instead of redoing it. Store the Verifier's decision traces (what was checked, which sources, result).
- [ ] 4.B.3 A visible **"Agent trail"** on the card or a separate `/agents` view: shows what each agent did for that MP (sources checked, flags, aliases learned). This is the demo's "wow" and also supports traceability.
- [ ] 4.B.4 Fallback: if Meko is unavailable, the app reads the precomputed trail from the static snapshot. The card page never depends on Meko at runtime.
- [ ] 4.B.5 Write a short `docs/agents.md` (what each agent does, what's stored, how memory is shared) for the judges.
- **Abort rule:** if 4.B.1–4.B.3 aren't working end to end by T+25, drop Track B, keep the core and Track A, and spend the time on polish.

### GATE 4 — AI layer (T+27) (verifier: someone who did not build the AI features, trying to break them)
- [ ] Summary works in English and Hinglish on 3 demo MPs.
- [ ] **Failure drills pass:** remove the API key → the template appears with no error; set a very short timeout → the template appears; force a fake number in the model output → the template appears.
- [ ] Draft letter generates for each intent, is editable, copies correctly, contains no accusation, and uses only real numbers.
- [ ] Spam test: 30 rapid requests → rate limit message appears and the app recovers.
- [ ] Network tab inspection: no API key or secret in any client file.
- [ ] No banned wording in AI outputs for 10 sample MPs.
- [ ] The card page still loads fully with the AI routes disabled.
- [ ] **If Track B:** the agent trail shows for the demo MPs, the offline fallback works with Meko disabled, and the 60-second explanation of "what is shared across agents" is rehearsed.

**If it fails:** switch AI features to template-only and continue. Don't carry broken AI into polish.

---

## 9. Scope cut order (when behind)

Cut from the top first. **Never cut the last three.**
1. Compare page, Hindi UI, pincode lookup, subject-wise questions, state pages
2. OG images and SEO extras
3. Track B (Meko agent layer)
4. Gemini in the data pipeline
5. Affidavit block (keep only if verified and permitted)
6. Draft-letter generator
7. State averages (keep national only)
8. LLM summary (keep the template summary)
9. **Never cut:** accurate real data · source + date labels · a deployed, working card page with search

---

## 10. PHASE 5 — Polish and hardening (T+27 → T+32)

**Objective:** nothing embarrassing in the demo. No new features.

### Tasks
**TL**
- [ ] 5.TL.1 Performance pass: static generation check, bundle size, image/font handling. Target LCP < 2.5 s on throttled mobile.
- [ ] 5.TL.2 Security headers, dependency audit (`npm audit`), env var check on Vercel.
- [ ] 5.TL.3 Make sure CI (lint, typecheck, test, build) is green on `main`.

**DL**
- [ ] 5.DL.1 Final data cross-check: 20 more random MPs (different from earlier) plus all 3 demo MPs.
- [ ] 5.DL.2 Write the data section of the README: sources, as-of dates, how to refresh, known gaps.
- [ ] 5.DL.3 Find **one real, striking, verified finding** from the data for the pitch (e.g., a state-level pattern). Double-check it twice.

**FE**
- [ ] 5.FE.1 Mobile pass (360, 390 px) and desktop (1280 px): no horizontal scroll, tap targets ≥ 44 px.
- [ ] 5.FE.2 Accessibility pass: contrast ≥ 4.5:1, focus order, labels, one `h1` per page, keyboard-only run through home → card → copy draft.
- [ ] 5.FE.3 Empty, loading and error states on every route. Remove any dev text, lorem ipsum, console logs.

**AI**
- [ ] 5.AI.1 Final copy review of the whole site against the content rules. Fix any judgmental phrase.
- [ ] 5.AI.2 Start the deck and demo script (section 12). Draft the judge Q&A answers.
- [ ] 5.AI.3 Check the prize requirements again (MLH rules, Yugabyte statement) and list what each submission needs (links, mentions, videos).

### GATE 5 — Release candidate (T+32) (verifier: whole team does a 20-minute bug bash, each person on a different device)
- [ ] Test matrix from `prd.md` section 14.1 (T1–T18) is run. Failures are fixed or consciously accepted and written down.
- [ ] Lighthouse mobile on a card page: accessibility ≥ 90, performance ≥ 85 (or reason noted).
- [ ] Keyboard-only run succeeds. A screen-reader spot check on one card passes.
- [ ] No console errors on key pages. No broken links (check footer, about, share link).
- [ ] Android Chrome and iOS Safari (if available) both render the card correctly.
- [ ] README is understandable to a stranger and `npm run dev` works from a fresh clone.
- [ ] The 3 demo MPs have been verified again against the sources.

**If it fails:** fix only the failures. Features are frozen.

---

## 11. PHASE 6 — Demo prep and freeze (T+32 → T+35)

**Objective:** a rehearsed, backed-up, submitted project.

### Tasks
**TL**
- [ ] 6.TL.1 Tag the release `v1.0-demo` on `main`. Production must equal this tag. After this: hotfixes only, each reviewed by two people.
- [ ] 6.TL.2 Build and run the **local production build** (`npm run build && npm start`) on the demo laptop, with Wi-Fi off. Confirm all card pages work and AI falls back.
- [ ] 6.TL.3 Make sure the demo laptop has charging, a hotspot backup and the project open in tabs: home, 3 demo cards, `/about`.

**DL**
- [ ] 6.DL.1 Prepare the "evidence" tab: the original source pages for the 3 demo MPs open side by side, to answer "is this accurate?" live.
- [ ] 6.DL.2 Prepare the answer on data limits (ministers, activity ≠ quality, affidavit declarations).

**FE**
- [ ] 6.FE.1 Capture the screenshots for the README and the deck. Record the **backup demo video** (2 minutes, screen + voice).
- [ ] 6.FE.2 Final visual check of the demo flow on the projector or a large screen, if possible.

**AI**
- [ ] 6.AI.1 Finalise the deck (max 6 slides, `prd.md`/previous plan outline) and the 2-minute demo script with exact clicks.
- [ ] 6.AI.2 Run **3 full rehearsals** with a timer. Switch the presenter between rehearsals so two people can present.
- [ ] 6.AI.3 Fill in the submission form drafts (title, description from `problem-statement.md` with the real finding, repo link, deployed link, video link, tech used, prize categories).

### GATE 6 — Freeze and submit (T+35) (verifier: TL + AI together, reading the submission form field by field)
- [ ] Production = `v1.0-demo` tag. The deployed URL works on a phone on mobile data.
- [ ] The offline local build works with Wi-Fi off.
- [ ] The backup video plays and is saved on the laptop and in cloud storage.
- [ ] 3 rehearsals done, under 2:00, with no dead air. Q&A answers are ready (data accuracy, neutrality, AI grounding, scale, legal, why now).
- [ ] The pitch contains the real, verified finding and honestly credits PRS, MPLADS, ADR/MyNeta, Sansad.
- [ ] Prize submissions complete: Social Innovation wording, Gemini usage described, (Track B) Meko usage and `docs/agents.md` linked, any extra MLH/sponsor requirements satisfied.
- [ ] Repo is clean: no secrets, README done, license note, links work.
- [ ] Submission sent **at least 30–60 minutes before the deadline.**

---

## 12. Demo and pitch (2:00)

| Time | Action | Owner |
|------|--------|-------|
| 0:00–0:15 | The problem in one sentence + the real finding | Presenter |
| 0:15–0:45 | Search a constituency someone in the room knows; the card opens | Presenter |
| 0:45–1:10 | Indicators, comparison with averages, MPLADS, sources with dates | Presenter |
| 1:10–1:30 | "Explain simply" (switch to Hinglish) | Presenter |
| 1:30–1:50 | "Draft a question to my MP" (**Track B:** show the agent trail instead of or alongside) | Presenter |
| 1:50–2:00 | Close: neutral, sourced, scalable | Presenter |

Deck (max 6): Problem → Solution → How it works → Responsible by design → Impact and scale → Team.

---

## 13. Risk triggers (what to do when)

| Risk | Trigger | Action |
|------|---------|--------|
| A source blocks or changes | No data by T+8 | Switch to manual download for demo-critical states; document it |
| Join errors | > 10% unmatched at T+18 | Limit the demo claims to verified states and say so |
| MPLADS unreliable | Not ready by T+18 | Hide the block for seats without data |
| LLM/API failure | Any failure | Template fallback (already automatic) |
| Meko spike fails or drags | Not working at T+25 | Abort Track B per section 8 |
| Wi-Fi problems at the venue | Any | Local build + backup video + hotspot |
| `main` broken | Any time | Revert to the last green commit or tag |
| Team fatigue | After T+24 | Move to review, QA and rehearsal tasks; no risky refactors |
| Scope creep | Anyone proposes a new feature after Gate 3 | Default answer is "after the hackathon", unless the TL approves a swap |

---

## 14. Prize checklist (verify the real rules yourself)

- [ ] **Best Social Innovation:** the pitch emphasises the problem, who benefits, neutrality, the citizen action and a real finding. Nothing extra to build.
- [ ] **Best use of Gemini API:** summary + draft letter (+ optional data extraction). Mention how grounding and fallbacks are done. Check the MLH page for submission requirements.
- [ ] **Yugabyte "Outstanding AI Agent Innovation powered by Meko":** only with Track B. Re-read the full statement and judging criteria before building and before submitting. We should be able to explain **what the agents share and learn.**
- [ ] **MongoDB Atlas / DigitalOcean / Vultr / Tiger Data:** only if a use is genuinely natural. Don't use both Atlas and Meko as "database" stories.
- [ ] For every sponsor prize, confirm the eligibility steps (special form, sign-ups, mention in the submission) on their pages. These details were not visible to us and must be verified by the team.

---

## 15. Quick reference: the first 3 hours

1. **T+0:00** Sync: roles, clock, submission rules. Confirm repo access and the Vercel deploy.
2. **T+0:15** TL: types. DL: sample dataset + master list. FE: shell. AI: template summary + grounding check.
3. **T+1:30** Sample data is merged, so FE is unblocked. First PRs reviewed.
4. **T+3:00** **Gate 1.** Don't start Phase 2 until it's signed off.