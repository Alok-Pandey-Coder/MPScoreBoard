# JanDarpan — Workstream 1 collection result

## Completed: MCD ward master register (administrative schedule)
- 250/250 ward numbers populated.
- 250/250 ward names populated.
- 250/250 MCD zones populated.
- Source: Delhi Gazette notification F.No.14011/11/2026-Delhi-II, notification dated 5 June 2026, published 25 June 2026, substituting the Fourteenth Schedule of the Delhi Municipal Corporation Act, 1957.
- The register is sorted by ward number (1–250), not by the Gazette's serial order.

## Critical scope distinction
This completes the *ward name + zone schedule* component of Workstream 1. It does NOT complete ward boundary geometries. The Gazette schedule contains ward names and zones, not GIS polygons. Geometry acquisition, licence review, coordinate-reference validation and polygon topology checks remain separate tasks.

## Quality caveat
The table was transcribed from the Gazette's published text extraction and checked for 250 unique ward numbers covering exactly 1–250. The official PDF endpoint timed out during retrieval in this session, so the transcription still needs a page-image/PDF visual QA pass before production use. The CSV includes this status explicitly.

## Data currency
Use the 2026 Gazette schedule as the current administrative ward-name/zone reference. Keep the 2022 delimitation schedule as a historical boundary version; do not overwrite it. Store `published_at=2026-06-25`, `notification_date=2026-06-05`, and retrieval date when importing.

## Source
Official eGazette PDF: https://egazette.gov.in/WriteReadData/2026/273812.pdf
Readable transcription / secondary index: https://www.gazettetracker.com/g/SG-DL-E-25062026-273812
SEC publication portal: https://sec.delhi.gov.in/sec/publication
