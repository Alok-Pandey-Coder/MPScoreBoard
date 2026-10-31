# Delhi data pipeline

Run everything from the repository root. Python dependencies: `pip install -r requirements.txt`.

## Refresh (fetch → build → check → diff → report)

```powershell
npm run data:refresh                     # python scripts\refresh.py
python scripts\refresh.py --no-fetch     # rebuild and report from cached captures only
```

Writes `data/processed/refresh_report.md` (and `.json`): fetch results, official-record checks
against Digital Sansad, changes that **need review** (MP, party, minister status, removed
records or fields, values that became null) and **updated** activity numbers. Review the
report, then commit. In CI (`.github/workflows/data-refresh.yml`, daily at 06:00 IST) the
same run opens a pull request when anything changed; nothing is published until it is merged.

## Rebuild from cached captures (no network)

```powershell
npm run data:build                       # python scripts\build_data.py
```

Runs `03_parse_prs → 05_normalise → 09_intake_mplads → 06_merge → 07_validate → 08_snapshot`.
Each step reads the **latest dated capture** of its source in `data/raw/`.

## Fetchers

| Script | Source | Notes |
|---|---|---|
| `01_fetch_sansad_members.py` | Digital Sansad member API (official) | Identity fields only; contact and family fields are dropped |
| `01_fetch_masterlist.py` | Govt of NCT of Delhi MP list (official) | Captured for change detection; the pipeline reads the reviewed `masterlist.delhi.json` |
| `02_fetch_prs.py` | PRS MP Track (CC BY 4.0) | All-or-nothing: a partial run is discarded, so it never becomes the latest capture |
| `fetch_empowered_delhi.py` | Empowered Indian MPLADS | **Refuses to run** until access is cleared (`docs/decisions.md`) |

All fetchers go through `polite_fetch.py`: an honest User-Agent, robots.txt rules and
`Crawl-delay` (PRS asks for 10 s), at least 1.5 s between requests to a host, retries only
for server errors, and an immediate stop on 401/403/429. Never add browser impersonation,
borrowed Referer/Origin headers, or anything that works around access controls.

Captures are immutable and dated (`<source>.<YYYY-MM-DD>`); a fetcher never overwrites one.
A failed source keeps its last good capture.

## Validation and tests

`07_validate.py` fails the build on hard errors. It re-parses every cached PRS page and fails
if `mps.json` differs, reconciles computed state averages against the PRS-published ones,
and checks the MPLADS contract. Run `npm run test:data` (`python -m pytest tests -q`).

Important source, schema, pipeline, validation, and data changes must be recorded in the
repository root [logs.md](../logs.md), as required by [AGENTS.md](../AGENTS.md).
