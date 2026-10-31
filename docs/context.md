# context.md — "Mera MP, Mera Report Card" (Lok Sabha MP Performance Tracker)

> Hand this file to the coding agent first. Read `DATA_SOURCES.md` next.
> Last updated: 30 Oct 2026. Status: idea finalised, nothing built yet.

---

## 1. One-line pitch

A civic-tech web app where a citizen picks their constituency (or enters a pincode) and instantly sees their Lok Sabha MP's report card: attendance, debates, questions asked, private member bills, MPLADS fund utilisation, and background (assets, cases, education), each compared with the state and national average. An AI summary explains it in plain Hinglish/English, and a one-click draft (letter / RTI / question to the MP) turns the data into action.

## 2. Why this project exists (origin)

- Built for **hackCBS 9.0**, a student-only hackathon at Shaheed Sukhdev College of Business Studies (SSCBS), University of Delhi.
  - Dates: **31 Oct – 1 Nov 2026**, in person, New Delhi.
  - Team size: 2–4. Valid student ID required.
  - Listed themes: AI, FinTech, IoT, HealthTech, EdTech, Cloud, Open Innovation.
  - Past editions ran about 36 hours of building. Confirm the exact duration at the venue.
- This idea fits **Open Innovation** (civic tech) with an **AI** layer.
- The idea came from the question "is Lok Sabha member data available for checking their performance?" The answer is yes, public data exists (see `DATA_SOURCES.md`).
- Earlier ideas in the conversation were rejected as too generic or AI-wrapper-like. The user wants **creative, real, India-specific** ideas with a strong live demo. Keep that bar: this should feel real, not like a ChatGPT wrapper.

## 3. About the user (so the agent calibrates correctly)

- Name: Alok. CS undergrad at NIET (AKTU), graduating 2028, CGPA 9.1.
- Background: MERN stack, moving to Next.js full-stack patterns. Has shipped Next.js 15/16 + TypeScript + Appwrite + Zustand + Tailwind + Framer Motion projects, and Node/Express/MongoDB/JWT backends.
- Dev setup: GitHub Copilot, Cline, Continue, GitHub CLI.
- Communicates in **Hinglish** (Hindi-English mix). Replies to him in Hinglish are welcome. Code, comments and commit messages stay in English.

### Working preferences (important)
- **Concise** instructions. No essays.
- **Do not make extra changes** beyond what is asked. No drive-by refactors, no surprise new dependencies.
- **No unsolicited diagrams.**
- He wants to **understand the code**, not copy-paste blindly. For every non-trivial piece, add a short "why this works" explanation (2–4 lines) in the reply, not as giant comments in the code.
- Placement/portfolio value matters: the repo should look clean, with a good README and a deployed demo.

## 4. Product scope

### MVP (must work by demo time)
1. **Constituency search**: dropdown or search by state then constituency name, plus a search by MP name.
2. **MP report card page** with:
   - Photo/name/party/state/constituency (the photo only if a licensed or official source is available; otherwise an initials avatar).
   - Attendance %, debates participated, questions asked, private member bills.
   - Comparison against state average and national average (simple bar or gauge, no heavy charting library needed).
   - MPLADS: entitlement/released vs spent, utilisation %, unspent balance.
   - Background: declared assets, criminal cases (as declared in affidavits), education.
3. **Plain-language AI summary** of the card (3–4 sentences, grounded only in the numbers shown, never invented).
4. **Action button**: generate a draft letter / question to the MP from the data (editable text, copy button).

### Stretch (only if MVP is done and stable)
- Pincode → constituency lookup.
- Compare two MPs side by side.
- Subject-wise breakdown of questions (finance, health, education, etc.).
- State leaderboard (with the caveats below).
- Hindi UI toggle.

### Explicitly out of scope
- User accounts / login.
- Live scraping at request time (see the data strategy).
- Any "best/worst MP" ranking presented as a verdict.
- Opinions, political scoring or party-wise judgments.

## 5. Critical data caveats (must be reflected in the UI)

- **Ministers are excluded from PRS performance stats.** They do not sign the attendance register, ask questions, or introduce private bills. Show "Minister — data not applicable", not zero.
- Attendance, questions and debates measure **activity, not quality**. A quiet MP may do strong committee or constituency work. Present these as **indicators**, with a visible disclaimer. Do not rank or label anyone "good/bad".
- Criminal-case and asset data are **self-declared in election affidavits**. Label them "as declared in affidavit", with the election year. Cases are not convictions.
- Always show **source + "data as of" date** on every card.
- Constituency and MP data can change (by-elections, resignations, deaths). The data snapshot must record the term/session it covers (the **18th Lok Sabha, 2024 onwards** is the target; verify the exact coverage).
- Avoid defamatory phrasing in the AI summary. Stick to neutral, factual wording.

## 6. Data strategy (summary — details in `DATA_SOURCES.md`)

- **No live scraping during the demo.** Pre-collect data before the event, normalise it, and ship it as a static snapshot (JSON/SQLite, or seeded into the DB).
- Pipeline: `fetch (raw) → parse → normalise → merge by MP → validate → export`.
- The primary join key is **constituency (state + name)**, with the MP name as a fallback. Names across sources are inconsistent, so a manual alias/mapping table will be needed.
- Keep raw downloads in `/data/raw`, cleaned output in `/data/processed`, and never overwrite raw files.
- Check each source's terms of use and robots.txt before automated collection. Prefer official downloads or exports over scraping where available.

## 7. Suggested tech stack

> The stack below is a **suggestion** based on what the user already knows. It is not a locked decision. Confirm with him before adding anything different.

- **Framework:** Next.js (App Router) + TypeScript.
- **Styling:** Tailwind CSS. Framer Motion only for light polish.
- **Data:** a static JSON/SQLite snapshot read at build time or by server routes. This is the fastest and most reliable approach for a hackathon, since it needs no external DB. Appwrite or MongoDB only if the user wants it.
- **State:** keep it minimal (URL params for the selected constituency). Zustand only if truly needed.
- **AI summary:** one server route calling an LLM with a strict prompt, passing only the structured numbers and instructing it to use only that data. Cache the result per MP. Fall back to a template-based summary if the API fails (the demo must not break).
- **Data scripts:** Python (requests / BeautifulSoup / pandas) or Node. Pick whichever the user is more comfortable debugging. Python is typical for scraping and cleaning.
- **Deploy:** Vercel.

### Suggested structure
```
/app                 Next.js routes (home, /mp/[slug], /compare)
/components          UI components
/lib                 data access, formatting, averages
/data/raw            untouched downloads
/data/processed      mps.json (final merged dataset)
/scripts             collection + cleaning scripts
/docs                DATA_SOURCES.md, notes
```

### Core data shape (draft)
```ts
type MP = {
  slug: string;
  name: string;
  party: string;
  state: string;
  constituency: string;
  isMinister: boolean;
  term: string;                 // e.g. "18th Lok Sabha"
  performance?: {
    attendancePct: number | null;
    debates: number | null;
    questions: number | null;
    privateBills: number | null;
    asOf: string;               // ISO date
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
  sources: { name: string; url: string; retrievedAt: string }[];
};
```
Averages (state / national) are **computed from the dataset**, excluding ministers and nulls.

## 8. Demo plan (2 minutes)

1. Problem (15s): "Voters hardly know what their MP did in 5 years, even though the data is public."
2. Live: search the constituency of someone in the room, and the report card opens.
3. Show the comparison vs state/national average and the MPLADS utilisation.
4. Click "Explain simply" for the AI summary, then "Draft a question to my MP".
5. Close (15s): sources, the neutral-indicator disclaimer, and what scales next (all states, committee data, Hindi).

## 9. Build order (priority)

1. Data snapshot for a **small subset first** (for example Delhi's 7 constituencies), then widen to all states.
2. Static report-card page with real numbers.
3. Search/navigation.
4. Averages and comparison bars.
5. AI summary with template fallback.
6. Draft-letter button.
7. Deploy, then README and screenshots.
8. Stretch items only after all of the above are stable.

## 10. Instructions to the coding agent

- Read this file and `DATA_SOURCES.md` before writing code.
- Ask before adding dependencies or changing the stack.
- Do only what is asked in each task. No unrelated edits.
- Prefer small, reviewable commits with clear messages.
- After each task, give a **short explanation** of what the code does and why, so the user learns from it.
- Never invent data. If a value is missing, store `null` and show "Not available".
- Log every data-source URL actually used, with its retrieval date, in the dataset's `sources`.
- Verify URLs and data formats yourself. The links in `DATA_SOURCES.md` are starting points and may have changed.
- Handle failures gracefully (empty states, API fallbacks). The demo must never show a blank crash.

## 11. Open questions (resolve with the user)

- Final team size and who owns data vs frontend vs AI.
- Whether to include photos, which depends on licensing.
- Is pincode lookup worth the time, or is the state → constituency picker enough?
- Which LLM/API key is available for the summary feature?
- Exact hackathon duration and the submission requirements (repo link, deck, video?).