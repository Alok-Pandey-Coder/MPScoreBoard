"""Capture MPLADS data for the 7 Delhi MPs from the Empowered Indian API.

Writes one NEW dated raw capture:
  data/raw/mplads.delhi.empoweredindian.<YYYY-MM-DD>.json
which scripts/09_intake_mplads.py normalises on the next `build_data.py` run.

ACCESS IS NOT CLEARED. Empowered Indian's Terms of Service restrict copying and
automated access, and their API is "by request" (docs/mplads_works_source_review.md,
docs/decisions.md). This script refuses to run unless written permission has
been obtained and EMPOWERED_INDIAN_ACCESS_CLEARED=1 is set.

It identifies itself honestly, waits between requests, stops on any HTTP
error, and never overwrites an existing capture.
"""

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"

BASE_API = "https://api.empoweredindian.in/api"
HEADERS = {
    "User-Agent": "MeraMPReportCard-data-pipeline/1.0 (+https://github.com/Alok-Pandey-Coder/MPScoreBoard)",
    "Accept": "application/json",
}
REQUEST_GAP_SECONDS = 1.5

DELHI_MPS = [
    ("chandni-chowk-delhi", "Praveen Khandelwal", "Chandni Chowk", "Khandelwal"),
    ("east-delhi-delhi", "Harsh Malhotra", "East Delhi", "Malhotra"),
    ("new-delhi-delhi", "Bansuri Swaraj", "New Delhi", "Bansuri"),
    ("north-east-delhi-delhi", "Manoj Tiwari", "North East Delhi", "Tiwari"),
    ("north-west-delhi-delhi", "Yogender Chandolia", "North West Delhi", "Chandoliya"),
    ("south-delhi-delhi", "Ramvir Singh Bidhuri", "South Delhi", "Bidhuri"),
    ("west-delhi-delhi", "Kamaljeet Sehrawat", "West Delhi", "Kamaljeet"),
]


def get_json(endpoint: str) -> dict:
    req = urllib.request.Request(f"{BASE_API}{endpoint}", headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as r:
        data = json.loads(r.read().decode("utf-8"))
    time.sleep(REQUEST_GAP_SECONDS)
    return data


def main() -> None:
    if os.environ.get("EMPOWERED_INDIAN_ACCESS_CLEARED") != "1":
        sys.exit(
            "Refusing to fetch: Empowered Indian access is not cleared. See docs/decisions.md. "
            "Set EMPOWERED_INDIAN_ACCESS_CLEARED=1 only after written permission."
        )

    today = date.today().isoformat()
    out = RAW / f"mplads.delhi.empoweredindian.{today}.json"
    if out.exists():
        sys.exit(f"Refusing to overwrite immutable capture {out.name}; raw captures are never edited in place.")

    records = []
    try:
        for slug, name, const, query in DELHI_MPS:
            print(f"Fetching MPLADS for {name} ({const})...")
            mps = get_json(f"/mplads/search?q={urllib.parse.quote(query)}").get("data", {}).get("mps", [])
            matched = next((m for m in mps if m.get("state", "").lower() == "delhi"), None)
            if not matched:
                print(f"  not found via query '{query}'; skipped")
                continue

            mp_id = matched["_id"]
            detail = get_json(f"/mplads/mps/{mp_id}")
            works = get_json(f"/mplads/mps/{mp_id}/works").get("data", {}).get("works", [])
            records.append({
                "slug": slug,
                "mp_id": mp_id,
                "official_name": name,
                "constituency": const,
                "mp_profile": detail.get("data", {}).get("mp", {}),
                "expenditure_summary": detail.get("data", {}).get("expenditure", {}),
                # Every row the API returned is kept; nothing is sampled.
                "works_sample_count": len(works),
                "works": works,
                "source_url": f"https://empoweredindian.in/mps/{mp_id}",
                "retrieved_at": today,
            })
    except urllib.error.HTTPError as err:
        sys.exit(f"Stopped on HTTP {err.code} from {err.url}; nothing written.")

    payload = {
        "source": {
            "name": "Empowered Indian MPLADS API (MoSPI e-SAKSHI data)",
            "base_url": BASE_API,
            "retrieved_at": today,
            "coverage": "Delhi (7 Lok Sabha MPs), 18th Lok Sabha",
            "citation": "Empowered Indian (empoweredindian.in); Primary source: MoSPI e-SAKSHI",
        },
        "records": records,
    }
    out.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Saved raw capture -> {out}. Run scripts/build_data.py to normalise it.")


if __name__ == "__main__":
    main()
