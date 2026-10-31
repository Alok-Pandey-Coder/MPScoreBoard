# Mera MP, Mera Report Card — repository instructions

## Current product

This repository contains the Delhi-first data foundation for a neutral Lok Sabha MP
report-card product. The current scope is all seven Delhi parliamentary
constituencies, their sitting 18th Lok Sabha MPs, source provenance, and later
enrichment from Parliament, MPLADS, affidavit, and election records.

Do not reintroduce the old JanDarpan public-works product, MLA/councillor
accountability workflows, tender investigation screens, or its staging schema
unless the user explicitly changes the product scope.

## Data rules

- Keep immutable source captures in `data/raw/`.
- Keep normalized, application-ready records in `data/processed/`.
- Cover all seven Delhi Lok Sabha seats before scaling to other states.
- Join primarily on normalized state plus constituency; use MP names only as a
  secondary confirmation.
- Every fact needs a source URL and retrieval/as-of date.
- Use `null` for unavailable values; never convert missing data to zero.
- Ministers must show performance fields as not applicable when the source
  excludes ministers, never as zero.
- Declared affidavit criminal cases are allegations/cases, not convictions.
- Activity metrics are descriptive and must not be presented as a ranking or
  quality judgment.
- Preserve raw values and record normalization decisions and validation failures.
- Do not publish a fact until its source and review status are clear.
- Whenever new datasets, tables, files, or schema fields are added or modified, always update the master registry in `data.md` so the catalog, dictionary, and file inventories remain complete and current.

## Source and licensing rules

- Prefer official government, Parliament, ECI, MPLADS, and affidavit sources.
- Use PRS, Empowered Indian, Nagrik, and other non-official sites for discovery
  or cross-checking unless their reuse terms clearly permit publication.
- Never bypass CAPTCHA, login, rate limits, robots restrictions, or access
  controls.
- Store links and permitted metadata when document or map reuse is uncertain.

## Engineering workflow

The canonical pipeline is:

`fetch raw -> parse -> normalize -> merge -> validate -> export`

Keep refreshes idempotent and do not delete an approved record when a source
refresh fails. Validate JSON and data invariants after every data change. Keep
the current product documentation in `docs/context.md`, `docs/plan.md`, and
`docs/dataSources.md`.

## Change logging

- Keep the project history in the root [logs.md](logs.md).
- Append an entry for every important data change, source addition, schema or
  pipeline change, validation-rule change, or product feature addition.
- Each entry must include the date, a short summary, files or areas changed,
  validation performed, and any remaining caveat or next step.
- Do not rewrite or delete earlier entries; append new entries in reverse
  chronological order.
- Routine formatting-only changes do not require a log entry.

## Git and permissions

Local inspection, edits, tests, and commits are allowed. Never run `git push`,
create/update a pull request, or publish externally without explicit permission
from the user in the current conversation. Before any push, state exactly what
will be pushed and ask for confirmation.

Do not add AI assistants or agents as co-authors. Commit messages and pull
request descriptions must not contain `Co-Authored-By` trailers or
"Generated with" attribution lines for any AI tool.
