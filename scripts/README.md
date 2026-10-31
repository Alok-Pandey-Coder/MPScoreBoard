# Delhi data pipeline

Run from the repository root:

```powershell
python scripts\01_fetch_masterlist.py
python scripts\01_fetch_sansad_members.py
python scripts\02_fetch_prs.py
python scripts\03_parse_prs.py
python scripts\05_normalise.py
python scripts\06_merge.py
python scripts\07_validate.py
python scripts\08_snapshot.py
```

For the reviewed, offline rebuild (parses cached raw pages, no network) use:

```powershell
python scripts\build_data.py
```

The fetchers cache permitted source responses in `data/raw/`; they do not
overwrite reviewed JSON captures. A failed request is reported and does not
delete an earlier capture. The current run cached all seven PRS profile pages.

`07_validate.py` fails the build on hard errors. It re-parses every cached PRS
page and fails if `mps.json` differs, and it reconciles computed state averages
against the PRS-published ones. Run the tests with `python -m pytest tests`.

Important source, schema, pipeline, validation, and data changes must be
recorded in the repository root [logs.md](../logs.md), as required by
[AGENTS.md](../AGENTS.md).
