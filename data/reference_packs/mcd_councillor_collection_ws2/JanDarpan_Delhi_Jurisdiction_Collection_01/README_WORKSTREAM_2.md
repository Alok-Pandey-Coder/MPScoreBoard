# JanDarpan — Workstream 2: MCD elected councillors

Collection date: 31 October 2026

## Delivered files
- `mcd_councillors_latest_election_snapshot_250.csv`: 250 records, one per ward. 238 have the 2022 general-election winner as the latest identified election result; 12 have the 2025 by-election winner.
- `mcd_councillor_election_history_262.csv`: 262 election events (250 general election + 12 by-election results).
- `mcd_councillor_bye_election_updates_2025.csv`: 12 official SEC by-election winners.
- `mcd_councillor_party_counts_latest_election_results.csv`: party counts at the latest identified ward election result, not current party composition.
- `mcd_ward_councillor_reconciliation_250.csv`: concise ward-to-latest-winner reconciliation.
- `mcd_wards_register_250.csv`: linked Workstream 1 ward master.

## Primary sources
1. SEC notification F.4(47)/SEC/LAW/2022/8954, dated 7 Dec 2022:
   https://sec.delhi.gov.in/sites/default/files/SEC/generic_multiple_files/mcd_election_result_2022_1.pdf
   All 250 ward numbers, ward names as printed, reservation categories, elected councillors and party affiliations; English table PDF pages 2–8.
2. SEC notification F.4(9)/Bye-Election/LAW/2025/21917, dated 3 Dec 2025:
   https://sec.delhi.gov.in/sites/default/files/SEC/circulars-orders/list_of_elected_councillors_bye_election_2025.pdf
   12 elected councillors; poll held 30 Nov 2025; PDF pages 1–2.
3. SEC notifications archive:
   https://sec.delhi.gov.in/notifications
   Last Updated field showed 07/10/2026. The listed MCD councillor-specific bye-election result is the 3 Dec 2025 notification.
4. SEC Manual 17:
   https://sec.delhi.gov.in/sec/manual-17
   SEC FAQ says the MCD term is five years and next election may be held in December 2027.

## Method
- Ward joins use exact ward numbers, not fuzzy name matching.
- `ward_name_2026_schedule` is from the 2026 Gazette workstream 1 list.
- Election history preserves the ward name as printed in each SEC notification.
- 2025 by-election winner overrides the 2022 general election winner in the latest-election snapshot for the 12 affected wards; both events remain in the history file.
- Party affiliation is that given in the election notification, not a statement of current party membership.

## Current-incumbency limitation
The SEC notifications archive last updated 7 Oct 2026 was reviewed and no later MCD councillor by-election result was identified there. However, I did not find a complete authoritative named MCD roster or individual records for later resignation, death, disqualification, or cessation. Therefore all 250 entries are marked `not_individually_reverified_after_latest_election`. Do not present these as fully verified current officeholders without a further direct MCD confirmation.
