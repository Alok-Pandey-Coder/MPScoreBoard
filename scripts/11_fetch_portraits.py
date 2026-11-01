"""Fetch each sitting MP's official Lok Sabha portrait from Digital Sansad.

Usage: python scripts/11_fetch_portraits.py [--state KEY ...] [--force]  (default: all states)

For every MP in data/processed/normalised.<key>.json the portrait is requested from
https://sansad.in/getFile/lsapps/mpimage/photo/<mpsno>.jpg (the same official source the
Delhi portraits came from), saved to public/images/mps/<slug>.jpg and recorded in
data/raw/mp_portraits.<key>.<date>.json, which 06_merge.py carries into mps.json
(image_url + image_source). The profile page, search, compare and map panels already
read image_url, so no UI change is needed.

Rules: requests go through polite_fetch (robots.txt, crawl delay, stops on 401/403/429);
an MP whose portrait cannot be fetched or is not a plausible JPEG keeps no image (the UI
falls back to initials). Existing portraits are kept unless --force is given, so reruns
are idempotent. Reuse terms of Sansad portraits are not confirmed (PRD 16 open question 2).
"""

import json
import sys
from datetime import date
from pathlib import Path

import states
from polite_fetch import FetchBlocked, fetch_bytes

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
PROCESSED = ROOT / "data" / "processed"
IMAGES = ROOT / "public" / "images" / "mps"
PHOTO_URL = "https://sansad.in/getFile/lsapps/mpimage/photo/{mpsno}.jpg?source=lsapps"
SOURCE_NAME = "Lok Sabha, Digital Sansad (Official Portrait)"
MIN_BYTES, MAX_BYTES = 5_000, 3_000_000


def is_plausible_jpeg(data: bytes) -> bool:
    return MIN_BYTES <= len(data) <= MAX_BYTES and data[:3] == b"\xff\xd8\xff"


def existing_capture(key: str) -> dict[str, dict]:
    captures = sorted(RAW.glob(f"mp_portraits.{key}.*.json"))
    if not captures:
        return {}
    return {row["slug"]: row for row in json.loads(captures[-1].read_text(encoding="utf-8"))["records"]}


def capture_state(state: states.State, force: bool) -> None:
    today = date.today().isoformat()
    source = json.loads((PROCESSED / f"normalised.{state.key}.json").read_text(encoding="utf-8"))
    kept = existing_capture(state.key)
    records = dict(kept)
    IMAGES.mkdir(parents=True, exist_ok=True)

    for row in source["records"]:
        slug, mpsno = row["slug"], row["sansad"]["mpsno"]
        target = IMAGES / f"{slug}.jpg"
        if slug in kept and target.exists() and not force:
            print(f"  {slug}: kept existing portrait")
            continue
        url = PHOTO_URL.format(mpsno=mpsno)
        try:
            data = fetch_bytes(url)
        except FetchBlocked as err:
            print(f"  {slug}: BLOCKED, not fetched ({err})")
            continue
        except Exception as err:  # network or HTTP failure: leave the record without an image
            print(f"  {slug}: failed ({err})")
            continue
        if not is_plausible_jpeg(data):
            print(f"  {slug}: response is not a plausible JPEG ({len(data)} bytes), skipped")
            continue
        target.write_bytes(data)
        records[slug] = {
            "slug": slug,
            "image_url": f"/images/mps/{slug}.jpg",
            "image_source": {"name": SOURCE_NAME, "url": url, "retrieved_at": today},
        }
        print(f"  {slug}: saved {len(data):,} bytes")

    if records == kept:
        return
    out = RAW / f"mp_portraits.{state.key}.{today}.json"
    out.write_text(
        json.dumps(
            {
                "source": {
                    "name": "Lok Sabha, Digital Sansad (official portraits)",
                    "retrieved_at": today,
                    "provenance": "Fetched by scripts/11_fetch_portraits.py; files are in public/images/mps/.",
                    "licence": "Reuse terms of Sansad portraits not yet confirmed (PRD 16 open question 2).",
                },
                "records": [records[k] for k in sorted(records)],
            },
            indent=2,
            ensure_ascii=False,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"{state.key}: {len(records)} portrait record(s) -> {out}")


def main() -> None:
    force = "--force" in sys.argv
    argv = [a for a in sys.argv[1:] if a != "--force"]
    for state in states.selected(argv, description=(__doc__ or "").splitlines()[0]):
        print(f"{state.key}:")
        capture_state(state, force)


if __name__ == "__main__":
    main()
