# JanDarpan Delhi Officials Data Pack

**Snapshot date:** 2026-10-31

## What is included

- `data/officials.csv`: 77 base profiles (70 MLAs + 7 Lok Sabha MPs).
- `data/mla_constituency_roster.csv`: assembly constituency-numbered roster.
- `data/lok_sabha_mps.csv`: Delhi's seven Lok Sabha representatives.
- `data/rajya_sabha_separate.csv`: three Rajya Sabha members shown separately on the GNCTD page; not counted in the 77.
- `data/prs_mla_activity_observations.csv`: secondary-source attendance/questions observations for the 8th Delhi Assembly, with blanks preserved as unknown/not displayed.
- `data/affidavit_enrichment_queue.csv`: one row per official, ready for ECI affidavit matching and human review. It is intentionally not populated with guessed declaration values.
- `data/source_register.csv`: source inventory and limitations.
- `reports/validation_report.json`: automated validation results.

## Validation performed

The roster has been checked for the 70/7 split, contiguous Assembly constituency numbers 1–70, unique IDs and constituency labels, party split (48 BJP / 22 AAP), and separation of Rajya Sabha entries. The Delhi eVidhan portal reports 70 members and the same 48/22 party aggregate. The GNCTD MP directory lists seven Lok Sabha constituencies and three Rajya Sabha members separately.

## Important: do not mistake this for full affidavit enrichment

This pack does **not** claim that all 77 individual affidavits, declared assets, liabilities, education and criminal-case declarations have been individually downloaded and validated. Those fields are blank in `affidavit_enrichment_queue.csv` pending exact ECI candidate-affidavit matching and review against the original document. Election vote totals and margins are also not included.

## Data handling rules

- Residential addresses, personal mobile numbers and email addresses from the MLA roster were excluded.
- Never interpret a missing PRS value as zero.
- Do not convert declared criminal cases into claims of guilt; distinguish pending cases from convictions.
- Do not show affidavit asset declarations as current net worth. Always retain election year and original affidavit citation.
- Do not calculate a single performance score from attendance/questions alone.
- Keep source provenance, source date, and reviewed status when adding records.

## Source references

See `data/source_register.csv`. Primary sources include the Delhi Legislative Assembly roster/history, Delhi eVidhan portal, GNCTD MP directory, Digital Sansad and the ECI affidavit portal. PRS is secondary research and includes its own accuracy/completeness disclaimer.
