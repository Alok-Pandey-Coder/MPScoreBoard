# JanDarpan Delhi officials - affidavit enrichment quality notes

Snapshot date: 2026-10-31

## Scope and sources

This package enriches the 77-person Delhi elected-representative directory: 70 Delhi MLAs and 7 Lok Sabha MPs. The three Rajya Sabha members remain in `rajya_sabha_separate.csv` and are not part of the 77 count.

- **MLAs (election year 2025):** the saved MyNeta Delhi-2025 winners page supplies all 70 winner rows, including constituency, party at election, declared criminal-case count, education category, total assets, liabilities and individual candidate-profile links. The ADR Delhi Assembly 2025 report supplies ages, movable/immovable asset values and a second total-asset check. Assets are nomination-time declared values, not current net worth.
- **Lok Sabha MPs (election year 2024):** the current Delhi MP roster is matched to the seven Delhi winners in MyNeta's Lok Sabha 2024 winners page. The ADR Lok Sabha 2024 PDF analyses 162 candidates across seven Delhi constituencies; the seven winning representatives were selected by their constituency and candidate identity, then matched against the asset table. MyNeta individual profiles supply education descriptions, liabilities and criminal-case counts.

## Validation results

- MLA asset table: 70/70 constituency matches between MyNeta winner rows and ADR asset rows.
- Asset arithmetic: 70/70 rows satisfy movable assets + immovable assets = ADR total assets.
- Cross-source totals: 63/70 numeric MyNeta winners-table assets equal the ADR PDF. The remaining 7 cells display images in the saved MHT snapshot; their linked individual MyNeta profiles were opened, and all seven profile totals match the ADR PDF.
- Total MLA assets from the ADR PDF: Rs 15,429,416,555 (about Rs 1542.94 crore). Average: Rs 220,420,236.50 (about Rs 22.04 crore). These round to the ADR report summary of Rs 1,542 crore total and Rs 22.04 crore average.
- Liabilities: all 70 rows have a value after the seven image-only cells were filled from the linked individual MyNeta profiles. Zero/Nil declarations are stored as numeric zero; unavailable remains blank.
- MyNeta winner table: 31 winners have one or more declared criminal cases; 45 reported education categories are graduate or above.
- ADR per-candidate case counters: 17 records have a positive Serious IPC/BNS count, matching the ADR aggregate of 17 winners with serious criminal cases. These fields are charge counters, not counts of court cases.
- MP assets: 7/7 selected winner profile totals match the ADR PDF asset table.

## Important limitations and discrepancies

1. **Election-time declarations:** asset, liability, education and case figures are those declared in nominations in 2025 (MLAs) or 2024 (MPs). They are not live balances or current court-status checks.
2. **Criminal case wording:** a candidate-declared case is not a conviction. `declared_criminal_case_count` must never be labelled as a conviction count. Individual case status may have changed after filing.
3. **MLA detailed case coverage:** the uploaded ADR 2025 report contains individual case-counter/details sections for 21 candidates. The MyNeta winner table reports 31 candidates with declared cases. All 31 counts and profile links are included; the 10 profiles not present as individual sections in the uploaded ADR PDF are flagged for follow-up rather than inferred.
4. **MyNeta image-only summary cells:** seven rows in the saved MHT snapshot render assets/liabilities as images. Their linked individual MyNeta profiles were checked, and the assets match ADR's text totals. Profile URLs and fallback flags are retained in the row-level data.
5. **Manoj Tiwari liabilities:** the MyNeta individual profile has several distinct figures: the winner list and the line labelled “Grand Total of Liabilities (as per affidavit)” show Rs 1,01,71,659; a separate disputed-liability amount is Rs 1,02,76,413; the profile summary/calculated total shows Rs 2,04,47,772. The displayed sub-totals do not reconcile exactly. The data file preserves all three and uses the “as per affidavit” figure as the comparable primary amount, with a manual-review note. Verify the original ECI affidavit before a single merged liability total is displayed.
6. **MP name variants:** the current directory uses “Manoj Kumar Tiwari” while the 2024 affidavit profile uses “Manoj Tiwari”; the current directory uses “Yogender Chandolia” while the MyNeta 2024 profile uses “Yogender Chandoliya”. Both are matched by constituency and BJP party; the original source spelling is retained.
7. **No original ECI affidavit file URLs:** the pack preserves ADR/MyNeta candidate profile URLs and ADR PDF page references. It does not claim to have individually downloaded and verified all 77 original ECI affidavit PDFs.
8. **Redistribution and licensing:** verify source terms and attribution requirements before publishing the full extracted dataset publicly. Links to original records should remain visible.

## Recommended UI treatment

Show the election year beside every number. Label financial fields “Declared in 2025 affidavit” or “Declared in 2024 affidavit”. Label cases “Declared criminal cases (at nomination)” and clearly separate pending matters from convictions only when an authoritative source supports that status. Keep the MyNeta/ADR source URL and PDF page reference on each profile. Never infer criminality, guilt, current wealth or performance from this dataset.
