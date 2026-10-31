"""Cache the Delhi PRS profile pages listed in the reviewed raw manifest.

All-or-nothing: pages are downloaded into a hidden temporary folder that is
renamed to data/raw/prs.delhi.<date>/ only when every page arrived. A failed or
partial run therefore never becomes the "latest capture" that 03_parse_prs.py
reads, and earlier captures are untouched. PRS publishes under CC BY 4.0; its
robots.txt Crawl-delay (10 s) is honoured by polite_fetch.
"""

import json
import shutil
import sys
from datetime import date
from pathlib import Path

from polite_fetch import FetchBlocked, fetch_bytes

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"


def main() -> None:
    manifest = json.loads((RAW / "prs.delhi.json").read_text(encoding="utf-8"))
    target = RAW / f"prs.delhi.{date.today().isoformat()}"
    if target.exists():
        print(f"{target.name} already exists; raw captures are immutable. Nothing fetched.")
        return

    staging = RAW / f".tmp-{target.name}"
    shutil.rmtree(staging, ignore_errors=True)
    staging.mkdir()
    failures = []
    try:
        for row in manifest["records"]:
            try:
                body = fetch_bytes(row["source_url"])
            except FetchBlocked as blocked:
                failures.append(f"{row['name']}: {blocked}")
                break  # access refused: stop the whole run, do not keep trying
            except Exception as error:  # network or server error for this page
                failures.append(f"{row['name']}: {error}")
                continue
            (staging / f"{row['name'].lower().replace(' ', '-')}.html").write_bytes(body)
            print(f"fetched {row['name']} ({len(body)} bytes)")

        if failures:
            print("PRS capture NOT saved; the previous capture stays in use:", *failures, sep="\n  ")
            sys.exit(1)
        staging.rename(target)
        print(f"saved {len(manifest['records'])} pages -> {target}")
    finally:
        shutil.rmtree(staging, ignore_errors=True)


if __name__ == "__main__":
    main()
