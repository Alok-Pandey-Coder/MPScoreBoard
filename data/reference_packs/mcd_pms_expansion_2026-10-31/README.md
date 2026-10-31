# JanDarpan — MCD PMS & Tender Collection (corrected, 31 Oct 2026)

## What this package contains
- `mcd_tender_notice_sample_2026-10-31.csv`: 18 MCD procurement listing records. One row (2026_MCD_296190_1) now has detail-page fields verified.
- `mcd_tender_detail_review_2026-10-31.csv`: explicit detail-page review for that one tender, including which documents remain uninspected.
- `mcd_pms_zone_totals_current_snapshot_partial.csv`: dashboard zone snapshot; project totals captured for all 13 groupings, work-order totals only partially captured.
- `mcd_pms_current_snapshot_reconciliation.csv`: headline and partial zone reconciliation.
- `source_register.csv`: source inventory from original collection.
- `qa_checks.csv`: QA status.

## Verification boundary
As of 31 Oct 2026, 18 tender notices were collected from the official Government eProcurement organisation listing. Only tender `2026_MCD_296190_1` has had its tender detail page reviewed. Its detail page states: work in parks 6A and 9A, WEA Karol Bagh; Ward 141 – Rajinder Nagar; tender value INR 933,166; EMD INR 18,500; fee INR 590; work period 90 days; publication 30 Oct 2026; bid submission deadline 10 Nov 2026 at 15:00; bid opening 10 Nov 2026 at 15:05. NIT and BOQ were listed but not downloaded or inspected because the portal document retrieval returned a session-timeout page.

The tender value is not an award amount or actual expenditure. No contractor, award, payment, completion or PMS project ID is asserted. The other 17 records remain listing-level records.

## MCD PMS limitation
The MCD PMS dashboard snapshot is aggregate only. It reports 16,585 projects and 15,175 work orders in the captured snapshot. All 13 project-zone groupings were captured and sum to 16,585. Only seven work-order zone groupings were captured (subtotal 7,786); this is partial, not a complete reconciliation. No project-level PMS records were extracted.

## Not completed in this package
- NIT/BOQ inspection for the 18 tenders
- Award results, contractor names, awarded values
- Payments, expenditure and completion evidence
- Tender-to-PMS project ID linking
- MP-LAD / MLA-LAD work-level extraction
- Ward boundary geometry and visual Gazette QA
- Current councillor incumbency verification and 2022 party-count discrepancy resolution
- Assembly/Parliamentary constituency crosswalk; NDMC and Delhi Cantonment coverage

Use the source URL and publication date on each record. Do not infer funding source, jurisdiction or location precision beyond the evidence.
