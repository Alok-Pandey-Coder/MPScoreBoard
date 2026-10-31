# JanDarpan - Delhi Officials Enriched Data Pack

**Snapshot:** 2026-10-31  
**Coverage:** 70 MLAs + 7 Lok Sabha MPs = 77 enriched representatives  
**Status:** Automated structural validation completed; source-specific manual review notes are included.

## Start here

- `data/officials_enriched.csv` - easiest 77-row joined view for the frontend.
- `data/mla_affidavit_enrichment.csv` - detailed 2025 affidavit fields for 70 MLAs.
- `data/mp_affidavit_enrichment.csv` - detailed 2024 affidavit fields for the seven current Delhi Lok Sabha MPs.
- `data/mla_criminal_case_review_queue.csv` - all 31 MLA winners with declared criminal cases, counts, status of detailed extraction and profile links.
- `data/mla_criminal_profiles_extracted_from_adr.csv` - 21 candidate profiles with individual ADR case counters present in the uploaded PDF.
- `data/source_register.csv` - source URLs, dates, field usage and limitations.
- `reports/validation_report.json` - machine-readable checks and counts.
- `reports/data_quality_notes.md` - definitions, caveats and known discrepancies.
- `source_documents/` - original PDFs and MHT snapshot supplied for this task.

## Important data semantics

All asset, liability, education and declared case values are archival self-declarations filed for the stated election year. Do not display them as current net worth or present-day court status. A declared criminal case is not a conviction. Blank values mean unavailable from the included source, not zero.

For MLAs, total assets are cross-checked using ADR's movable and immovable values. For seven image-only MyNeta asset cells, the ADR PDF supplies the populated total and the row is visibly flagged. For MPs, the 2024 report contains all candidates; only the seven elected Delhi representatives are selected and matched to the current directory.

## Data import recommendation

Import the base `officials.csv` first, then use `official_id` as the FK into the affidavit enrichment rows. Keep the election-year declaration as a separate record rather than overwriting the representative's stable identity. The SQL file is a starter schema, not a migration for an existing production database.

## Attribution and use

Retain the individual source URLs and page references in the application. Verify licensing/terms before external public redistribution. The underlying declarations are filed by candidates; ADR/MyNeta provide archival transcription and analysis.
