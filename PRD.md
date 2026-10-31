# PRD — "Mera MP, Mera Report Card"

**Product:** Lok Sabha MP Performance Tracker (citizen-facing web app)
**Version:** 1.0 (hackathon MVP)
**Status:** Draft for build, 30 Oct 2026
**Event:** hackCBS 9.0 (31 Oct – 1 Nov 2026, SSCBS, New Delhi)
**Companion docs:** `context.md` (what/why), `DATA_SOURCES.md` (data), `plan.md` (schedule/tasks)

> How to use this document: `context.md` explains the idea, `plan.md` says *when* and *who*, and this PRD says *exactly what the product does and how it must behave*. If the three disagree, **this PRD wins on product behaviour**, `DATA_SOURCES.md` wins on data facts, and `plan.md` wins on scheduling.

---

## 1. Overview

### 1.1 Problem
Parliamentary performance data for Indian MPs is public (attendance, debates, questions, private member bills, local-area development funds, election affidavits), but it is scattered across several sites with different formats and naming. Ordinary citizens cannot easily answer "What has my MP done?"

### 1.2 Vision
Any citizen can find their MP in under 10 seconds, read a clear, neutral, sourced report card in under a minute, understand it in plain language, and turn it into a concrete action (a question or letter to the MP).

### 1.3 Product principles
1. **Neutral indicators, not verdicts.** We show data with context. We never rank, grade, or label an MP "good/bad".
2. **Every number is traceable.** Source and "as of" date are always visible.
3. **Honest about gaps.** Missing data shows "Not available". Ministers show "Not applicable". We never show zero for unknown.
4. **Fast and reliable.** Runs from a static snapshot. External calls (AI) are optional and always have a fallback.
5. **Action over information.** The card ends in something the citizen can do.

---

## 2. Goals, non-goals, success metrics

### 2.1 Goals (MVP)
- G1. Find an MP by constituency or name in ≤ 3 interactions.
- G2. Show a complete, correct report card for every Lok Sabha seat, or a documented subset with graceful degradation for the rest.
- G3. Provide a plain-language AI summary (English / Hinglish) grounded only in the shown data.
- G4. Provide an editable draft letter/question to the MP.
- G5. Be demo-safe: zero blank screens, works offline from a local build.

### 2.2 Non-goals
- User accounts, login, saved profiles.
- Rankings, "best/worst MP" lists, party scorecards, or opinions.
- Live scraping at request time.
- Rajya Sabha, state assemblies, local bodies (future).
- Native mobile apps.
- Sending emails/messages on the user's behalf.

### 2.3 Success metrics

**Hackathon (primary):** a live demo of a real card in under 2 minutes with no errors; judges can verify numbers against sources.

**Product quality (measured in QA):**
| Metric | Target |
|--------|--------|
| Data accuracy on a 20-MP manual spot check | 100% match to source, or discrepancy explained |
| Seats with a complete performance block (non-minister) | ≥ 95% |
| Card page LCP on mobile (4G throttled) | < 2.5 s |
| Search response time | < 100 ms after the index loads |
| Lighthouse accessibility | ≥ 90 |
| AI summary numbers not present in input data | 0 (enforced by a post-check) |

**Post-event (optional):** unique visitors, searches per visit, summary clicks, draft-letter copies. No personal data collected.

---

## 3. Users and use cases

### 3.1 Personas
| Persona | Description | Needs |
|---------|-------------|-------|
| **Curious citizen (primary)** | A voter, often mobile-first, may prefer Hindi/Hinglish | Quick lookup, simple language, no jargon |
| **Student / researcher** | Civics, policy or journalism student | Sources, exact numbers, methodology |
| **Journalist / civic volunteer** | Needs credible, citable figures | Source links, dates, caveats, shareable URL |
| **Hackathon judge** | Evaluates impact, feasibility, polish | Fast demo, clear value, honest limits |

### 3.2 User stories
| ID | As a… | I want to… | So that… |
|----|-------|-----------|----------|
| US-1 | citizen | pick my state and constituency | I see my MP's report card |
| US-2 | citizen | search by MP name | I find a card without knowing the seat |
| US-3 | citizen | see attendance, debates, questions and bills vs averages | I get context, not raw numbers |
| US-4 | citizen | see how much of the MPLADS fund was used | I understand local-development spending |
| US-5 | citizen | see declared assets, cases and education | I know the candidate background (clearly labelled as declarations) |
| US-6 | citizen | read a simple explanation in English or Hinglish | I understand without political jargon |
| US-7 | citizen | generate an editable draft question/letter to my MP | I can act on what I learned |
| US-8 | researcher | see the source and date for each number | I can verify and cite it |
| US-9 | anyone | share a link to a card | others can see the same page |
| US-10 | citizen | understand why some values are missing | I don't misread "no data" as "zero" |
| US-11 | citizen (stretch) | compare two MPs or seats | I see differences side by side |

---

## 4. Scope (MoSCoW)

| Priority | Feature |
|----------|---------|
| **Must** | Home with state → constituency picker and search; MP report card (identity, performance, comparison, MPLADS, affidavit, sources); About/methodology page; disclaimers; template summary; 404/error states; static snapshot dataset; deployment |
| **Should** | LLM summary (English + Hinglish) with template fallback; draft-letter generator; share link with OG preview; mobile polish; validation report |
| **Could** | Compare page; state listing page; pincode lookup; subject-wise question breakdown; Hindi UI |
| **Won't (now)** | Accounts, rankings, live data refresh, committees, notifications, other legislatures |

---

## 5. Functional requirements

Format: **FR-ID**: requirement. *AC* = acceptance criteria. Priority in brackets. Task IDs from `plan.md` in parentheses.

### 5.1 Discovery and navigation
- **FR-1 [Must] State and constituency picker** (P0-5). The home page offers a state select, then a constituency select filtered by state. Selecting a constituency navigates to `/mp/[slug]`.
  - *AC:* all states/UTs with seats are listed; the constituency list updates when the state changes; keyboard accessible; works without JS fallback links where feasible (static list on `/state/[state]` stretch).
- **FR-2 [Must] Unified search** (P2-7). One search box that matches MP name, constituency name and state. Results show name, constituency, state, party, and link to the card.
  - *AC:* typo-tolerant (edit distance ≤ 2 for queries ≥ 4 chars); results in < 100 ms; arrow keys + Enter navigate; empty-query shows nothing; no-results shows a helpful message; handles Hindi transliteration variants via the alias table (for example "Bengaluru/Bangalore").
- **FR-3 [Could] Pincode lookup** (stretch). Enter a 6-digit pincode and get the matching constituency or a list if ambiguous.
  - *AC:* if mapping is unreliable the feature is hidden, not shown wrongly; ambiguous pincodes show multiple options with a "not sure which" note.

### 5.2 Report card
- **FR-4 [Must] Identity header.** Shows MP name, party, state, constituency, term ("18th Lok Sabha"), seat reservation if known, minister badge if applicable. Photo only if licensed; otherwise an initials avatar.
- **FR-5 [Must] Performance block** (P1-4). Shows attendance %, debates, questions, private member bills, each with a tooltip definition, "as of" date and the source.
  - *AC:* null → "Not available"; minister → "Not applicable (minister)" with an explanation link; zero is displayed as `0`.
- **FR-6 [Must] Comparison** (P1-5). For each performance metric show the MP's value against the state average and the national average.
  - *AC:* a visual bar plus the text values ("Attendance 82% · State avg 78% · National avg 80%"); neutral wording only (see 5.9); not colour-only; handles null averages (small states with 1–2 MPs show "state average based on N MPs").
- **FR-7 [Must] MPLADS block** (P2-5). Shows entitlement, funds released, funds spent, utilisation %, unspent balance and the as-of date.
  - *AC:* money in ₹ crore with sensible rounding; unspent never negative (data anomalies are flagged "check source"); a note explains that utilisation is naturally low early in a term.
- **FR-8 [Should] Affidavit block** (P2-6). Shows declared total assets, declared pending cases, education, and the election year.
  - *AC:* header text: "As declared in the {year} election affidavit"; never labelled "criminal MP/record"; a tooltip explains declarations ≠ convictions; hidden entirely if the source terms disallow use or data is missing.
- **FR-9 [Must] Sources and methodology footer** (P1-4). Lists each source used for this card with a link and its retrieval date, plus a link to `/about`.
- **FR-10 [Must] Share.** Each card has a stable, human-readable URL and a "Copy link" button. Link previews show the MP name and constituency (OG tags) (P2-9).

### 5.3 AI features
- **FR-11 [Should] Plain-language summary** (P3-1..4). A button "Explain simply" shows a 3–4 sentence summary.
  - *AC:* uses only the structured data of that MP; supports English and Hinglish; a loading state, timeout (≈ 8 s) and automatic fallback to the template summary; marked with a small label ("Summary generated from the data above" or "Auto-generated summary"); never shows raw errors.
- **FR-12 [Must] Template summary** (P3-2). A deterministic, non-LLM summary built from the same data using fixed sentence templates, used when the LLM is unavailable and as the default when the key is missing.
- **FR-13 [Should] Draft letter/question** (P3-5, P3-6). The user selects an intent (from a fixed list), a language, and optionally enters their name/locality. The app produces an editable draft.
  - *AC:* the draft cites only numbers from the data; polite, non-accusatory; includes placeholders for unfilled fields; copy-to-clipboard with visible confirmation; "open in email" link; a note: "Review before sending. This is a draft, not an official communication."
  - Intents (initial): `mplads_works` (ask about local fund use), `parliament_question` (ask the MP to raise a local issue), `attendance_clarification`, `general_feedback`.
- **FR-14 [Should] Guardrails** (section 9 of `plan.md`). A post-check verifies that numbers in AI output exist in the input; on mismatch use the template.

### 5.4 Information pages
- **FR-15 [Must] About / methodology page** (P4-5). Explains the data sources, definitions of each metric, how averages are computed, the "as of" dates, ministers handling, limitations, the unofficial-project disclaimer and a contact/GitHub link.
- **FR-16 [Must] Global footer** on every page: attribution (PRS, ADR/MyNeta, MPLADS, Sansad, ECI as applicable), disclaimer, link to `/about`.
- **FR-17 [Must] Error and empty states.** Custom 404 (with the search box), a generic error page, and a data-missing state on cards. No stack traces or raw JSON ever shown.

### 5.5 Stretch features
- **FR-18 [Could] Compare** (`/compare?a=&b=`). Two MPs side by side with the same metrics and neutral deltas.
- **FR-19 [Could] State page** (`/state/[state]`). Lists all MPs of a state alphabetically by constituency, with the state averages. **No sorting by performance, no ranks.**
- **FR-20 [Could] Subject-wise questions.** Distribution of questions across subjects (finance, health, education, etc.).
- **FR-21 [Could] Hindi UI** toggle (labels and static copy).

### 5.6 Computed values and display rules
| Item | Rule |
|------|------|
| **State average (per metric)** | Mean over MPs in that state, **excluding ministers and null values**. Show N. |
| **National average** | Mean over all included MPs under the same exclusions. Reconcile against PRS's published averages; document differences in `docs/decisions.md`. |
| **Utilisation %** | Store the source's own figure if available. Also compute `spent ÷ released` (confirm the portal's definition and document it). If they differ by more than a small tolerance, flag in the validation report and display the source figure. |
| **Difference wording** | Within ±5% (attendance: ±5 percentage points; counts: ±10% of the average) → "similar to"; above → "higher than"; below → "lower than". These thresholds are proposals; the wording is neutral and does not use colour alone. |
| **Partial term** | If the MP joined mid-term (by-election) show "Since {date}" and note that comparisons may not be like-for-like. |
| **Money** | Display ₹ in crore (1 crore = 10,000,000). Keep raw rupees in data. Indian digit grouping where numbers are shown in full. |
| **Dates** | "as of 12 Oct 2026" format. Each metric group has its own as-of. |
| **Names** | Preserve the official spelling; the alias table affects matching only, not display. |
| **Special roles** | Ministers: not applicable. Speaker/Deputy Speaker: treat as not applicable if the source has no figures (verify). |

### 5.7 Slug and identity rules
- Card slug is **constituency-based and stable**: `{constituency}-{state}` in lower-case ASCII with hyphens (for example `new-delhi-delhi`). Reason: the MP can change via by-election, but the constituency stays.
- If two seats collide, append the seat number.
- The MP's name lives in the data, not in the URL.
- Old/misspelt slugs redirect (301) to the canonical slug via an alias map where practical, else show a "Did you mean…?" 404.

### 5.8 Language and tone
- Default UI language: English, simple vocabulary (target reading level ~Class 8).
- AI outputs: English or Hinglish (Roman script) per user toggle. Native-speaker review of the Hinglish prompts/output before the demo.
- Tone: neutral, factual, respectful of all parties.

### 5.9 Content rules (hard constraints)
1. Never use "criminal MP", "worst", "best", "lazy", "failed", "useless", or similar in any copy or AI output.
2. Affidavit data is always prefixed "as declared in the election affidavit".
3. Performance indicators carry the line: "These indicators show activity, not the quality of an MP's work."
4. Never show a number without a source and date nearby.
5. Do not infer or state reasons for absence or inactivity.

---

## 6. Routes and what each serves

### 6.1 Page routes
| Route | Purpose | Data served | Rendering | Key states |
|-------|---------|-------------|-----------|------------|
| `/` | Entry: picker + search + short explainer | states and constituencies list; search index (lazy) | Static | default; search no-results; index-loading |
| `/mp/[slug]` | The report card | one `MP` record, state and national averages, source list, snapshot date | **Static** (`generateStaticParams` for all seats) | full; partial data; minister; not found → 404 |
| `/about` | Methodology, definitions, sources, limits, disclaimer | static content + snapshot metadata (date, counts) | Static | n/a |
| `/compare?a=&b=` *(stretch)* | Side-by-side | two `MP` records | Server component reading from the snapshot | invalid slug → helpful message |
| `/state/[state]` *(stretch)* | List of seats/MPs in a state | MPs of the state (alphabetical), state averages | Static | unknown state → 404 |
| `/not-found` | Custom 404 | none | Static | includes search |
| `/error` | Error boundary | none | Client | retry button |
| `/robots.txt`, `/sitemap.xml` | SEO | generated from the dataset | Static / route handler | n/a |

### 6.2 API routes
| Route | Method | Request | Response | Notes |
|-------|--------|---------|----------|-------|
| `/api/search-index` | GET | — | `[{ slug, name, constituency, state, party, aliases[] }]` | Small JSON (543 rows); cacheable (`Cache-Control` long, versioned by snapshot hash); can also be served as a static asset |
| `/api/summary` | POST | `{ slug: string, lang: "en" \| "hinglish" }` | `{ text, source: "llm" \| "template", lang, dataAsOf, generatedAt }` | Always returns 200 with a usable summary if `slug` is valid; falls back automatically |
| `/api/draft` | POST | `{ slug, intent, lang, citizenName?, locality? }` | `{ text, source: "llm" \| "template" }` | `citizenName`/`locality` max 60 chars, not logged or stored; template fallback exists |
| `/api/health` | GET | — | `{ status: "ok", snapshotDate, mpCount }` | For deploy checks and the demo-day sanity test |

### 6.3 Error contract (APIs)
```json
{ "error": { "code": "INVALID_SLUG", "message": "No MP found for this constituency." } }
```
| Code | HTTP | When |
|------|------|------|
| `INVALID_REQUEST` | 400 | malformed body, unknown intent, text too long |
| `INVALID_SLUG` | 404 | slug not in the dataset |
| `RATE_LIMITED` | 429 | exceeded the per-IP limit; include `Retry-After` |
| `UPSTREAM_UNAVAILABLE` | — | **not surfaced**: the LLM failure triggers the template fallback instead (200) |
| `INTERNAL` | 500 | unexpected; generic message, details only in server logs |

Rate limits (proposal): `/api/summary` 20 req/min/IP, `/api/draft` 10 req/min/IP, payload ≤ 2 KB.

---

## 7. Page specifications

### 7.1 Home `/`
Order of content:
1. Header (logo/name, link to About).
2. Hero line: "Know your MP's record in 60 seconds."
3. **Search box** (primary) + "or choose your state and constituency" (state select, then constituency select, then "View report card").
4. Three short value blurbs (what you will see, where the data comes from, how to use it).
5. Snapshot note: "Data last updated {date}."
6. Footer.

### 7.2 Report card `/mp/[slug]`
Section order (top to bottom):
1. **Identity header** (name, party, constituency, state, term, minister badge, share button).
2. **Key indicators**: four tiles (Attendance, Debates, Questions, Private Bills), each with value and the as-of date.
3. **Compared to averages**: bars for each indicator vs state/national average, with text values and the line "These indicators show activity, not quality."
4. **Local development funds (MPLADS)**: entitlement, released, spent, utilisation %, unspent; as-of date; note about early-term values.
5. **Background (as declared in affidavit)**: assets, declared pending cases, education, election year; tooltip on declarations vs convictions.
6. **Explain simply** (AI summary with language toggle).
7. **Take action**: draft letter/question flow.
8. **Sources and methodology**: per-section sources with links and retrieval dates; link to About.

Behaviour notes:
- Sections are independent. A missing block collapses to a short "Data not available" card, not an empty gap.
- The AI and action sections load lazily so they don't block the first render.
- Anchored section links (for example `#mplads`) are supported.

### 7.3 About `/about`
Sections: What this is · Where data comes from (table of sources with "what we use" and "as of") · What each indicator means (and doesn't) · How averages are computed · Ministers and special roles · Affidavit data explained · Limitations and known gaps · AI usage and safeguards · Disclaimer (unofficial student project, not affiliated with Parliament or any political party) · Report a data issue (GitHub issues link) · Credits.

### 7.4 Compare `/compare` *(stretch)*
Two pickers (reuse the search component), a two-column card with identical metric rows, neutral deltas ("2 points higher"), and a share link. No "winner" styling.

---

## 8. Data requirements

### 8.1 Entities
```ts
type Source = { name: string; url: string; retrievedAt: string /* ISO */ };

type MP = {
  slug: string;                       // constituency-based, stable
  name: string;
  party: string;
  state: string;
  constituency: string;
  reservation?: "GEN" | "SC" | "ST";
  term: string;                       // "18th Lok Sabha"
  sinceDate?: string;                 // for by-elections / mid-term entry
  isMinister: boolean;
  specialRole?: "Speaker" | "Deputy Speaker" | null;
  performance?: {
    attendancePct: number | null;
    debates: number | null;
    questions: number | null;
    privateBills: number | null;
    asOf: string;
  };
  mplads?: {
    entitlementCr: number | null;
    releasedCr: number | null;
    spentCr: number | null;
    utilisationPct: number | null;
    unspentCr: number | null;
    asOf: string;
  };
  affidavit?: {
    totalAssetsRs: number | null;
    declaredCases: number | null;
    education: string | null;
    electionYear: number;
  };
  sources: Source[];
};

type Snapshot = {
  generatedAt: string;
  mpCount: number;
  nationalAverages: Averages;
  stateAverages: Record<string, Averages>;   // includes N per metric
  mps: MP[];
};
```

### 8.2 Data requirements and constraints
- One record per Lok Sabha seat in the current term; by-election replacements update the record and set `sinceDate`.
- All numeric fields nullable. Percentages in 0–100. Money non-negative.
- The dataset ships as a **versioned snapshot** (`mps.json` plus a content hash) built by the scripts in `plan.md`; the app never calls the source sites.
- Snapshot metadata is exposed on `/about` and `/api/health`.
- Validation (build-time, fail the build on hard errors): unique slugs, required identity fields present, ranges valid, every record has ≥ 1 source, no duplicate constituencies.
- Soft warnings (logged): unmatched rows, null rate per field, discrepancy between recomputed and source utilisation.

### 8.3 Data refresh
- Manual: run `npm run data:build`, review `validation_report.md`, commit the snapshot, deploy.
- Future: scheduled GitHub Action per session.

---

## 9. AI requirements

| Topic | Requirement |
|-------|-------------|
| Inputs | Only the structured MP object, averages and as-of dates. No free-text user input in the system prompt. |
| Outputs | Summary: 3–4 sentences. Draft: ≤ 180 words, editable. |
| Languages | English and Hinglish (Roman script). |
| Grounding | Every number in the output must exist in the input; otherwise discard and use the template. |
| Neutrality | No party-based phrasing differences; same structure for every MP; no adjectives implying judgment. |
| Reliability | Timeout ≈ 8 s; one retry max; fallback to template; the user never sees an LLM error. |
| Cost/abuse | Cache per `(slug, lang)`; pre-generate for demo MPs; rate-limit; cap tokens; server-side key only. |
| Disclosure | Label AI text as auto-generated; the About page explains the safeguards. |
| Privacy | Do not log `citizenName`/`locality`; do not send them anywhere except the single generation call (and only if the user supplied them). |

Prompt templates live in `/lib/ai/prompts.ts` and are reviewed like code.

---

## 10. Non-functional requirements

### 10.1 Performance
- Card page: LCP < 2.5 s on throttled 4G mobile; CLS < 0.1; JS for the card page ≤ ~150 KB gzipped (target).
- Static generation for all card pages; lazy-load the AI and draft sections.
- Search index loaded on demand, ≤ 100 KB gzipped.

### 10.2 Reliability and availability
- The core experience depends on no third-party runtime service.
- Graceful degradation order: LLM down → template summary; one data block missing → block hidden with a message; search index fails → the picker still works.
- A tagged release (`v1.0-demo`) is the production reference on demo day, with a local-build offline backup.

### 10.3 Accessibility (target WCAG 2.1 AA)
- Semantic headings (one `h1` per page), landmarks, labelled form controls.
- Colour contrast ≥ 4.5:1; information is never conveyed by colour alone (bars have numeric labels).
- Full keyboard navigation, visible focus, ARIA live region for async summary/draft results.
- Charts have text equivalents; tooltips are reachable by keyboard and touch.

### 10.4 Security
- Secrets only in server env vars; verify they don't appear in the client bundle.
- Validate and sanitise all API inputs (enums, length caps); reject unknown fields.
- Rate limiting on AI routes; no open proxy behaviour.
- Standard headers (CSP where practical, `X-Content-Type-Options`, `Referrer-Policy`).
- Dependencies pinned via lockfile; run `npm audit` before the freeze.

### 10.5 Privacy
- No accounts, no tracking cookies, no personal data stored.
- Optional privacy-friendly analytics (aggregate counts only); no IP storage by the app.
- Draft inputs are processed transiently and not logged.

### 10.6 SEO and sharing
- Unique `<title>` and meta description per card ("{MP} — {Constituency}, {State}: Lok Sabha report card").
- OG/Twitter tags with a generated or templated image.
- `sitemap.xml` and `robots.txt`; canonical URLs.
- Note: indexing by search engines is a product choice. Decide before launch and document it.

### 10.7 Compatibility
- Latest two versions of Chrome, Edge, Firefox, Safari; Android Chrome and iOS Safari.
- Responsive from 360 px to 1440 px wide.

### 10.8 Observability (lightweight)
- Server logs for API errors (no personal data), plus the health endpoint.
- Build-time data validation report stored with each snapshot.

---

## 11. Legal, ethical and content constraints
- Data are public records; respect each source's terms and attribute them visibly.
- No defamatory framing; affidavit data are declarations, not findings.
- No political endorsement or targeting; identical treatment across parties.
- Photos only with clear reuse permission.
- Footer disclaimer: "Unofficial student project. Not affiliated with Parliament of India, ECI, PRS, ADR or any political party. Data is from public sources and may contain errors. Please verify with the linked sources."
- A visible way to report data issues (GitHub issues).

---

## 12. UX and design guidance
- Mobile-first, single-column cards; clean typography; generous spacing; a neutral, non-partisan palette (avoid party colours).
- Colour semantics: don't use red/green for "bad/good". Use neutral blue/grey scales and text labels.
- Components (reusable): `SearchBox`, `StatePicker`, `ConstituencyPicker`, `MPHeader`, `MetricTile`, `ComparisonBar`, `MpladsPanel`, `AffidavitPanel`, `SummaryPanel`, `DraftPanel`, `SourceList`, `Disclaimer`, `EmptyState`, `ErrorState`, `Tooltip`.
- Microcopy examples:
  - Missing value: "Not available from the source."
  - Minister: "Ministers don't sign the attendance register, ask questions or introduce private member bills, so these indicators don't apply."
  - Early-term MPLADS: "Fund use is usually lower early in a term."
- Loading: skeletons for AI sections; no layout shift when text arrives.

---

## 13. Analytics (optional, privacy-first)
Aggregate events only: page view, search used, state/constituency picked, summary requested, summary source (`llm`/`template`), draft intent chosen, draft copied. No identifiers or free text.

---

## 14. Quality assurance

### 14.1 Test matrix (data and UI scenarios)
| # | Scenario | Expected |
|---|----------|----------|
| T1 | Normal MP with complete data | all blocks render; comparisons correct |
| T2 | Minister | performance shows "Not applicable"; the explanation link works |
| T3 | MP with null affidavit | the affidavit block shows "not available" or is hidden |
| T4 | MPLADS missing for the seat | the block is replaced by a message; the page still works |
| T5 | By-election replacement | "Since {date}" shown; the note about comparisons |
| T6 | Small state (1–2 MPs) | the state average shows its N with a caveat |
| T7 | Speaker/Deputy Speaker | handled as per the data; no false zeros |
| T8 | Alias search ("Bangalore" vs "Bengaluru") | the correct seat is found |
| T9 | Typo search ("Varanassi") | the correct seat appears in the results |
| T10 | Invalid slug | the custom 404 with the search box |
| T11 | LLM timeout / bad key | the template summary appears, no error shown |
| T12 | AI output contains a number not in the input | discarded; the template is used |
| T13 | Rate limit exceeded | friendly message, with `Retry-After` honoured |
| T14 | Offline (local build) | all card pages work; AI uses the template |
| T15 | 360 px mobile | no horizontal scroll; tap targets ≥ 44 px |
| T16 | Keyboard-only run through home → card → copy draft | completes without a mouse |
| T17 | Screen reader pass on the card | logical order, numeric values announced |
| T18 | Hinglish output review | natural, neutral, correct |

### 14.2 Release criteria (go/no-go)
- All **Must** requirements pass their acceptance criteria.
- 20-MP manual data spot check passes.
- No console errors on `/`, `/mp/[slug]`, `/about`.
- `npm run lint`, `typecheck`, `test`, `build` pass.
- Disclaimers and sources visible on every page.
- Secrets not present in the client bundle.
- Backup (offline build + recorded demo) verified.

---

## 15. Dependencies, assumptions, risks

### 15.1 Dependencies
- Availability and structure of the public sources (`DATA_SOURCES.md`).
- An LLM API key (optional; the product works without it).
- Vercel (or equivalent) for hosting.

### 15.2 Assumptions
- The target term is the 18th Lok Sabha (2024 onwards); source coverage will be verified.
- Snapshot-based data is acceptable for the MVP.
- Team size of 2–4 with the roles in `plan.md`.
- Venue internet may be unreliable, so the offline demo is required.

### 15.3 Key risks (summary; full register in `plan.md`)
Source format changes or blocking · name/constituency join errors · MPLADS reliability · misleading presentation · scope creep · demo-day connectivity.

---

## 16. Open questions
1. Do we index cards in search engines at launch? (Product and reputation decision.)
2. Are MP photos available under a reuse-friendly licence, or do we stay with initials avatars?
3. Is the affidavit block included in the demo, given the terms-of-use review and legal sensitivity?
4. Exact definition of MPLADS utilisation on the portal (released vs entitlement as the denominator).
5. Is pincode lookup achievable reliably in the time, or hidden?
6. Which LLM provider and budget will be used?
7. How should Speaker/Deputy Speaker be treated, based on what the sources actually provide?
8. Final team size, hacking duration and submission format at the venue.

---

## 17. Glossary
| Term | Meaning |
|------|---------|
| **MP** | Member of Parliament (here: Lok Sabha, the lower house) |
| **Constituency** | The electoral seat an MP represents |
| **PRS** | PRS Legislative Research, a non-profit tracking parliamentary data |
| **MPLADS** | Members of Parliament Local Area Development Scheme (a fund each MP can recommend for local works) |
| **Affidavit** | Sworn declaration candidates file with the Election Commission (assets, cases, education) |
| **Private Member Bill** | A bill introduced by an MP who is not a minister |
| **Snapshot** | The pre-collected, versioned dataset shipped with the app |
| **As of** | The date the data was last updated at the source or retrieved |
| **Template summary** | Deterministic, non-AI text built from fixed sentence patterns |

---

## 18. Traceability (PRD → plan tasks)
| Requirement | Plan tasks |
|-------------|-----------|
| FR-1, FR-2 | P0-5, P2-7 |
| FR-4, FR-5, FR-6 | P1-4, P1-5 |
| FR-7 | P2-2, P2-5 |
| FR-8 | P2-3, P2-6 |
| FR-9, FR-15, FR-16 | P1-4, P4-5 |
| FR-10 | P2-9 |
| FR-11, FR-12, FR-14 | P3-1, P3-2, P3-3, P3-4 |
| FR-13 | P3-5, P3-6 |
| FR-17 | P4-1 |
| Data requirements (8.x) | P0-1..3, P1-1..3, P2-1..4, P2-8 |
| Non-functional (10.x) | P3-7, P4-2, P4-3, P4-4, P4-7 |
| QA and release (14.x) | P4-6, P4-8, P5-3, P5-4 |