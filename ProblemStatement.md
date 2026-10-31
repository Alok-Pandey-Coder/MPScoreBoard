# Problem Statement — "Mera MP, Mera Report Card"

> hackCBS 9.0 submission. Track: **Open Innovation** (civic tech) + **AI**.
> Fill the `[ ]` placeholder with one real number from our dataset before submitting.

---

## Title
**Mera MP, Mera Report Card: your MP's record, in plain language, in 60 seconds**

## One-liner
A neutral, source-backed report card for every Lok Sabha MP, with an AI explanation in English or Hinglish and a one-click draft to question your MP.

---

## Problem
India's 543 Lok Sabha MPs are elected to represent their constituencies, but citizens can rarely check what their MP actually did. The data is public, but it is scattered across separate sites (parliamentary activity, local-development funds, election affidavits), in different formats, with different naming, and in dense tables meant for researchers.

As a result, voters decide on perception, and public data stays unused.

## Who is affected
- Voters, especially first-time and mobile-first users who prefer Hindi/Hinglish.
- Students, journalists and civic groups who need quick, citable numbers.

## Why existing options fall short
Tools like PRS MP Track and MyNeta exist and are valuable, but each shows only one slice of the picture:
- Data is split across sources, so there is no single view of "my MP".
- Presentation is built for analysts, not everyday citizens.
- No plain-language explanation and no regional-language support.
- Information ends at the table. There is no next step a citizen can take.

---

## Our solution
Pick your constituency (or search your MP) and get one page with:

1. **Parliamentary activity:** attendance, debates, questions, private member bills, each compared with the state and national average.
2. **Local development funds (MPLADS):** how much was available, spent and left unspent.
3. **Background:** declared assets, cases and education, clearly labelled as affidavit declarations.
4. **"Explain simply":** an AI summary grounded only in the numbers shown.
5. **"Take action":** an editable draft question or letter to the MP.

## How we keep it trustworthy
- Neutral indicators. No rankings and no "good/bad" labels.
- Every number shows its source and "as of" date.
- Ministers are marked "not applicable" instead of showing misleading zeros.
- The AI only sees structured data, and a post-check rejects any number that is not in the input. A template fallback means it never fails visibly.

## Why it is feasible in a hackathon
- Data is public and pre-collected into a static snapshot, so there is no fragile live scraping.
- A Next.js app with a static snapshot is quick to build and deploy.
- The demo works even offline.

## Impact
- Turns public data into something a voter can actually use.
- Encourages informed questions to MPs and lowers the barrier to civic participation.
- Scales to all states and all 543 seats, then to Rajya Sabha and state assemblies.

## Track fit
**Open Innovation** (civic tech), with an **AI** layer. Optionally also fits **Cloud** (data pipeline and deployment).

---

## 30-second spoken version
> "Every five years we vote for an MP, but almost nobody can check what that MP did, even though the data is public. It is scattered across sites and built for researchers. Mera MP, Mera Report Card puts it all on one page: attendance, questions, local-fund usage and background, compared with state and national averages, with an AI explanation in Hinglish and a ready draft to question your MP. Neutral, sourced, and built to be used. **[ ] ← add one real finding from our data here.**"

---

## Pre-submission checklist
- [ ] Replace the `[ ]` placeholder with a real, verified number from our dataset.
- [ ] Keep the PRS / MyNeta differentiation honest (we build on their data, we don't dismiss it).
- [ ] Re-read for neutral wording: no party-specific or judgmental language.
- [ ] Match the final scope with `prd.md` (do not promise stretch features as done).