# JanDarpan Delhi jurisdiction collection — batch 01

## What is actually collected in this batch
- A 250-row MCD ward-number register (ward numbers 1–250); ward names, zones, AC mappings and geometries remain blank pending verified extraction from the official delimitation schedule.
- 12 MCD councillor updates from the SEC's 3 December 2025 notification for the bye-elections held on 30 November 2025.
- Empty mapping registers for ward→Assembly and Assembly→Parliamentary relationships.
- Initial jurisdiction and source registers for MCD, NDMC and Delhi Cantonment.

## Important limitation
This is a collection workspace, NOT a complete or production-ready dataset. Do not display blank ward names or infer councillors for the other 238 wards. The 2022 elected-councillor list must be imported from the official SEC notification (identified in SEC Election Report Volume II, pages 483–499) and then overlaid with the 2025 bye-election results.

## Primary source references
1. SEC Delhi, MCD Election Report 2022, Volume II:
   https://sec.delhi.gov.in/sites/default/files/SEC/generic_multiple_files/electionreportvolume2-mcdelections2022.pdf
   The report states that the final delimitation order was issued 17 Oct 2022 and MCD consisted of 250 wards. Its index identifies the elected-councillor notification at pages 483–499.
2. SEC Delhi, 2025 MCD bye-election result:
   https://sec.delhi.gov.in/sites/default/files/SEC/generic_multiple_files/result_summary_bye_election2025.pdf
3. MCD GIS:
   https://info.mcd.gov.in/
4. CEO Delhi maps:
   https://ceodelhi.gov.in/MapPage.aspx

## Next extraction steps
1. Extract all 250 ward names and AC assignments from the final delimitation order.
2. Extract all 250 2022 elected councillor records from SEC notification, then overlay the 12 bye-election winners.
3. Obtain MCD ward geometry files and inspect each file's licence/metadata.
4. Download AC and PC maps from CEO Delhi and build validated spatial overlays.
5. Obtain official NDMC and Delhi Cantonment boundary data; keep these as separate jurisdiction polygons.
