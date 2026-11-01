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
- Do not rewrite or delete earlier entries; append new entries to the end
  (bottom) of the file in chronological order (oldest first, newest at the
  bottom) to prevent merge conflicts caused by concurrent branches editing line 3.
- Routine formatting-only changes do not require a log entry.

## Git and permissions

Local inspection, edits, tests, and commits are allowed.

- **Branches:** do feature work on a branch, not on `main`. When another tool or
  person is working in the main checkout at the same time, use a separate
  `git worktree` so neither overwrites the other's files.
- **Pull requests:** agents may use the GitHub CLI (`gh`) to create, update,
  comment on and inspect pull requests and their checks.
- **Push — ask first:** before every `git push`, state exactly what will be
  pushed (branch, commits, files) and wait for the user's confirmation in the
  current conversation.
- **Merge — ask first:** when a pull request is ready, tell the user and wait
  for their confirmation before merging; the user may merge it themselves.
- Never force-push, delete a remote branch, or publish anything else
  externally without explicit permission in the current conversation.

Do not add AI assistants or agents as co-authors. Commit messages and pull
request descriptions must not contain `Co-Authored-By` trailers or
"Generated with" attribution lines for any AI tool.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
