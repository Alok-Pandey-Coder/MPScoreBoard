"""Cache the PRS profile pages listed in each state's reviewed raw manifest.

Usage: python scripts/02_fetch_prs.py [--state KEY ...]  (default: all states)

The manifest for a state is data/raw/prs.<key>.json (e.g. prs.delhi.json,
prs.goa.json). All-or-nothing per state: pages are downloaded into a hidden
temporary folder that is renamed to data/raw/prs.<key>.<date>/ only when every
page arrived. A failed or partial run therefore never becomes the "latest
capture" that 03_parse_prs.py reads, and earlier captures are untouched. PRS
publishes under CC BY 4.0; its robots.txt Crawl-delay (10 s) is honoured by
polite_fetch. An access refusal (401/403/429 or robots.txt) stops the whole run.
"""

import json
import shutil
import sys
from datetime import date
from pathlib import Path

import states
from polite_fetch import FetchBlocked, fetch_bytes

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"


def capture_state(state: states.State) -> bool:
    """Capture one state's pages. Returns False if the capture was not saved."""
    manifest_path = RAW / f"prs.{state.key}.json"
    if not manifest_path.exists():
        print(f"{state.name}: no PRS manifest {manifest_path.name}; nothing fetched.")
        return True
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    target = RAW / f"prs.{state.key}.{date.today().isoformat()}"
    if target.exists():
        print(f"{target.name} already exists; raw captures are immutable. Nothing fetched.")
        return True

    staging = RAW / f".tmp-{target.name}"
    shutil.rmtree(staging, ignore_errors=True)
    staging.mkdir()
    failures = []
    try:
        for row in manifest["records"]:
            try:
                body = fetch_bytes(row["source_url"])
            except FetchBlocked as blocked:
                print(f"PRS refused access ({blocked}); stopping all PRS fetches. {state.name} capture NOT saved.")
                raise
            except Exception as error:  # network or server error for this page
                failures.append(f"{row['name']}: {error}")
                continue
            (staging / f"{row['name'].lower().replace(' ', '-')}.html").write_bytes(body)
            print(f"fetched {row['name']} ({len(body)} bytes)")

        if failures:
            print(f"{state.name}: PRS capture NOT saved; the previous capture stays in use:", *failures, sep="\n  ")
            return False
        staging.rename(target)
        print(f"saved {len(manifest['records'])} pages -> {target}")
        return True
    finally:
        shutil.rmtree(staging, ignore_errors=True)


def main() -> None:
    ok = True
    try:
        for state in states.selected(description=__doc__.split("\n")[0]):
            ok = capture_state(state) and ok
    except FetchBlocked:
        sys.exit(1)
    if not ok:
        sys.exit(1)


if __name__ == "__main__":
    main()
