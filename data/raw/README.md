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

- `mplads.delhi.empoweredindian.2026-10-31.json` — Empowered Indian MPLADS API
  (`https://api.empoweredindian.in/api`, aggregating MoSPI eSAKSHI) for the seven
  Delhi MPs, retrieved 2026-10-31 by `scripts/fetch_empowered_delhi.py`. Per MP:
  `mp_profile` (amounts in **rupees**; `utilizationPercentage` is defined as
  recommended / allocated) and a 20-row sample of `works`. Non-official
  aggregator; reuse terms not confirmed. `scripts/09_intake_mplads.py` always reads
  the latest dated `mplads.delhi.empoweredindian.*.json`, so a fuller capture is
  added as a new dated file, never by editing this one.
- `mplads.delhi.janwatchdog.2026-10-06.csv` — JanWatchdog Delhi MPLADS summary
  (`https://www.janwatchdog.in/mplads/delhi`), a secondary aggregator citing the
  MoSPI MPLADS dashboard; source snapshot 2026-10-06; amounts in crore. Copied
  byte-for-byte (sha256 `4b044f9a227fef7d0d13b3c06329e153e4991111a0de57544f9ab69f96c1b765`)
  from the local-only intake
  `temp/JanDarpan_Delhi_Master_Data_Collection_Phase2/.../02_MPLADS_LOK_SABHA/RAW/delhi_mplads_18th_lok_sabha_mp_summary_secondary_2026-10-06.csv`
  on 2026-10-31. Used for cross-checking only. MP spellings differ ("Manoj
  Tiwari", "Yogendra Chandoliya") and North West Delhi carries "(SC)"; joined on
  normalised constituency.
- `delhi_7mp_custom_enrichment.json` — user intake for 2024 election results.
  Its `mplads` key is legacy and no longer read by the pipeline.

Future captures must retain the canonical URL, retrieval date, coverage period,
extraction method, and licensing/reuse note. If a source is link-only, record
the URL and metadata without copying restricted document bytes.
