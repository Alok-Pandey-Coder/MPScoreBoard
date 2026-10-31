"""Fetch all 543 Lok Sabha members from the Digital Sansad API (18th Lok Sabha).

Saves a paginated raw capture to data/raw/sansad.members.india.<date>.json
Rate-limited to 1 request/sec to be polite. Idempotent — skips if today's
file already exists.

Usage:
    python scripts/01_fetch_sansad_india.py

Requires network access (BypassSandbox: true in Antigravity).
"""

import json
import sys
import time
from datetime import date
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"

BASE = "https://sansad.in/api_ls/member"
USER_AGENT = "MeraMPDataCollector/0.1 (public-interest civic-tech; contact: meraMP@example.com)"
LOK_SABHA = 18
PAGE_SIZE = 100

LIST_FIELDS = (
    "mpsno", "initial", "mpFirstLastName", "constName", "stateName",
    "partyFname", "partySname", "gender", "status", "noOfTerms",
    "qualification", "categoryCode", "profileUrl", "lsExpr",
)
DETAIL_FIELDS = (
    "mpsno", "fullName", "constituency", "stateName",
    "partySname", "councilMinSts",
)


def get_json(url: str) -> dict:
    req = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def fetch_all_members() -> list[dict]:
    """Paginate through all 543 members across all states."""
    # First request — no state filter, get total count
    first_url = f"{BASE}?loksabha={LOK_SABHA}&page=1&size={PAGE_SIZE}"
    first = get_json(first_url)
    total = first["metaDatasDto"]["totalElements"]
    total_pages = (total + PAGE_SIZE - 1) // PAGE_SIZE
    print(f"Total members: {total}, pages: {total_pages}")

    all_rows = list(first["membersDtoList"])
    for page in range(2, total_pages + 1):
        time.sleep(1)
        url = f"{BASE}?loksabha={LOK_SABHA}&page={page}&size={PAGE_SIZE}"
        resp = get_json(url)
        rows = resp["membersDtoList"]
        all_rows.extend(rows)
        print(f"  page {page}/{total_pages}: {len(rows)} rows (cumulative {len(all_rows)})")

    return all_rows


def fetch_detail(mpsno: str) -> dict:
    url = f"{BASE}/{mpsno}"
    d = get_json(url)
    return {field: d.get(field) for field in DETAIL_FIELDS}


def main() -> None:
    today = date.today().isoformat()
    target = RAW / f"sansad.members.india.{today}.json"
    if target.exists():
        sys.exit(f"{target.name} already exists — raw captures are immutable. Delete to re-fetch.")

    print("Fetching all Lok Sabha member listings...")
    all_rows = fetch_all_members()

    print(f"\nFetching detail records for {len(all_rows)} members (1 req/sec)...")
    members = []
    for i, row in enumerate(all_rows, 1):
        mpsno = row.get("mpsno")
        time.sleep(1)
        try:
            detail = fetch_detail(mpsno)
        except Exception as e:
            print(f"  [{i}/{len(all_rows)}] detail failed for {mpsno}: {e}")
            detail = {}
        members.append({
            **{field: row.get(field) for field in LIST_FIELDS},
            "detail": detail,
            "detail_url": f"{BASE}/{mpsno}",
        })
        if i % 50 == 0:
            print(f"  [{i}/{len(all_rows)}] processed so far...")

    capture = {
        "source": {
            "name": "Lok Sabha, Digital Sansad member API",
            "base_url": BASE,
            "retrieved_at": today,
            "coverage": f"{LOK_SABHA}th Lok Sabha, all states",
            "total_elements": len(members),
            "extraction": "JSON responses filtered to identity fields; detail fetched per member",
            "dropped_fields": "addresses, phone, email, date_of_birth, family, marital, photo_url",
        },
        "records": members,
    }
    target.write_text(json.dumps(capture, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"\nSaved {len(members)} members -> {target}")

    # Quick state breakdown
    from collections import Counter
    state_counts = Counter(m.get("stateName", "unknown") for m in members)
    print("\nState breakdown:")
    for state, cnt in sorted(state_counts.items()):
        print(f"  {state}: {cnt}")


if __name__ == "__main__":
    main()

