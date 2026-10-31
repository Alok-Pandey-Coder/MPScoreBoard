# JanDarpan — MCD PMS + MLA-LAD / MP-LAD Expansion (2026-10-31)

## What this package contains

This is an evidence-first expansion of the previous corrected MCD tender collection. It retains the prior 18 tender records and adds a current MCD PMS zone/scheme snapshot, a tender-to-PMS crosswalk, and a sample of individual MLA-LAD works transcribed from official Delhi Urban Development Department sanction orders.

## Important results

- MCD PMS page snapshot: **16,635 projects** and **15,233 work orders**. The 13 zone totals sum to these headline values. These are aggregate dashboard counts, not individual project rows.
- MCD PMS scheme counts are extracted by zone for MLA-LAD and MP-LAD, for both projects and work orders.
- **18/18** MCD tender notices retained. **0/18** could be linked to a PMS project ID on evidence available in this pass. Similar ward/locality or a scheme label is not sufficient to assert a match.
- MLA-LAD: **15 individual work descriptions** captured from official 2025-26 and 2026-27 sanction orders (some rows have financial fields omitted where OCR table alignment was ambiguous). This is a sample of published orders, not a complete Delhi MLALAD work register.
- MP-LAD: aggregate MCD PMS counts by zone captured; **no individual MP-LAD works extracted**. The legacy MoSPI citizen report viewer returned a Report Viewer configuration error. Current eSAKSHI work-level data still needs an accessible official export or authorised access.
- No ward boundary geometries or project coordinates have been added.

## Files

- `mcd_pms_scheme_counts_by_zone_2026-10-31.csv` — 13 zones x projects/work orders, including MLA-LAD and MP-LAD category counts.
- `mcd_pms_scheme_count_reconciliation_2026-10-31.csv` — headline reconciliation.
- `mcd_tender_to_pms_crosswalk_18_records.csv` — 18 tender rows with explicit unmatched status and evidence requirements.
- `mlalad_individual_works_extracted_official_orders.csv` — individual works from official sanction orders, 2025-26 and 2026-27. Amounts are lakh INR. Blank amounts mean not reliably available, not zero.
- `mplads_mcd_zone_aggregate_counts_2026-10-31.csv` — MP-LAD category counts only; not work-level rows.
- `mplads_extraction_status.csv` — current extraction gap.
- `source_register_expansion.csv` — source provenance and limitations.
- `qa_checks_expansion.csv` — QA results.
- Prior collection files including 18 MCD tender notices and previous README/source/QA files are retained.

## Data interpretation rules

1. A sanction order is not proof of tender award, payment, or completion. `first_installment_release_lakh` is an order-sanctioned release amount, not verified payment receipt or total expenditure.
2. `estimated_amount_lakh` and `revised_estimate_lakh` are not award values.
3. No contractor names are inferred.
4. No tender-to-PMS links are invented.
5. Some PDF text extraction has OCR noise. Rows with ambiguous amount alignment have blanks and an explicit note. Visually validate original PDFs before production use.
6. The live MCD dashboard changes over time. Keep this snapshot date and do not overwrite older snapshots.
7. Ward numbers are copied from sanction text. Ward geometry and coordinates are not inferred.

## Why project-level MCD PMS records remain incomplete

The public MCD project report page exposes filters for zone, ward, project type, asset type, scheme and latitude/longitude search within 500 metres, but the accessible page text contains no populated result rows. The public dashboard exposes aggregates. The current collection therefore needs either (a) a public project report export/API documented by MCD, or (b) an official data export from MCD IT/PMS administrators. Do not bypass login, CAPTCHA or access restrictions.

MCD PMS contact displayed on the official portal: 011-23227413 / 23227414; mcd-ithelpdesk@mcd.gov.in.

## Next steps

1. Request an official PMS export with project ID, scheme, ward, work title, sanctioned estimate, coordinates, agency, NIT/work-order ID, contractor, work-order amount, progress and closure fields.
2. Use the PMS project IDs / tender refs to reconcile the 18 tender records.
3. Expand MLALAD orders systematically from the UD Department archive, prioritising 2026-27 and 2025-26; inspect each PDF visually before promoting OCR values to verified.
4. Obtain MPLADS 2023-24 to 2026-27 Delhi work register/recommended/completed work export from eSAKSHI / district authorities.
5. Only after official work-level location fields are available, validate ward geometry and coordinates.
