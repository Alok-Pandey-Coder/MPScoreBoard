# Raw data

This directory contains immutable source captures for the Delhi-first MP
report-card pipeline. Do not edit a capture in place. Add a new dated capture
when the source changes, then normalize it into `data/processed/`.

Current capture:

- `masterlist.delhi.json` — seven Delhi Lok Sabha MP identities from the Delhi
  government listing, retrieved 2026-10-30.
- `prs.delhi.2026-10-30/` — cached PRS MP Track profile pages, retrieved
  2026-10-30. PRS publishes under CC BY 4.0. This is the input for
  `scripts/03_parse_prs.py`.
- `sansad.members.delhi.2026-10-30.json` — official Lok Sabha member records for
  Delhi from the Digital Sansad API (`sansad.in/api_ls/member`), retrieved
  2026-10-30 by `scripts/01_fetch_sansad_members.py`. Filtered at capture to
  identity fields; addresses, phones, email, date of birth and family details
  were dropped. `councilMinSts` is blank for all members, including the
  minister, so it is not used for minister status.
- `prs.delhi.json` — superseded manual transcription of the PRS pages. It
  contains transcription errors (see `logs.md`, 2026-10-30) and is kept only as
  history and as the URL manifest for `scripts/02_fetch_prs.py`. It is not a
  pipeline input.

Future captures must retain the canonical URL, retrieval date, coverage period,
extraction method, and licensing/reuse note. If a source is link-only, record
the URL and metadata without copying restricted document bytes.
