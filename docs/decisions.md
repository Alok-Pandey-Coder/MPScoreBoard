# Decisions

Product and data decisions that deviate from, or settle an open question in,
`PRD.md`, `docs/plan.md` or `AGENTS.md`. Newest first. Each entry: date, what,
why, risk, and what would reverse it.

## 2026-10-31 — Publish Empowered Indian MPLADS figures and works with citation

**Decision (product owner):** The report card shows MPLADS totals (allocated,
spent, recommended, unspent, work counts) and the captured work-level records
from Empowered Indian, credited as "Empowered Indian (aggregating MoSPI
eSAKSHI)", labelled as a secondary source with official verification pending.

**Why:** MPLADS fund use and local works are a core MVP feature (PRD FR-7,
US-4). No official, public, linkable work-level source exists yet: the eSAKSHI
dashboard has no work-level pages or downloads, and none of 5 sampled work IDs
could be confirmed on an official page (`docs/mplads_works_source_review.md`).

**Risk:** This is an exception to the AGENTS.md rule that non-official sources
are for discovery or cross-checking unless their reuse terms clearly permit
publication.
- **The terms conflict.** Empowered Indian's Terms of Service (§2) limit use to
  "personal, non-commercial transitory viewing" and forbid copying or "any
  public display". Their FAQ says the data is "intended for public use … Please
  cite".
- **The two secondary sources disagree.** JanWatchdog (2026-10-06) differs from
  Empowered Indian (2026-10-31) on expenditure by 5–23% for 5 of the 7 seats
  (see `data/processed/validation_report.md`).

**Safeguards:**
- Every MPLADS figure keeps its source link and as-of date, and carries the
  secondary-source label.
- The work list is labelled as partial ("showing N of M").
- The JanWatchdog differences are shown on the card.
- No new automated fetching from Empowered Indian until access is cleared. The
  existing fetcher impersonated a desktop browser and sent the site's own
  Origin and Referer headers, so it must not be re-run as is.

**Reversal triggers:** Empowered Indian asks for removal, or written permission
is refused. Then switch MPLADS to link-only, keeping links to the eSAKSHI
dashboard and Empowered Indian. If official eSAKSHI data or written permission
becomes available, replace or confirm the figures and drop the secondary label.

**Follow-ups:**
1. Email roshan@empoweredindian.in for written reuse permission and API
   documentation.
2. Check the 5 sample work IDs by hand on the eSAKSHI dashboard.
3. Ask MoSPI about a GODL release, or file an RTI request for the Delhi
   district work lists.
