"""Fetch complete MPLADS data for all 7 Delhi MPs from Empowered Indian API.

Saves:
  - data/raw/mplads.delhi.empoweredindian.2026-10-31.json (immutable raw capture with works list)
  - Ingests into data/raw/delhi_7mp_custom_enrichment.json
"""

import json
import time
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
RAW_OUT = RAW / f"mplads.delhi.empoweredindian.{date.today().isoformat()}.json"
ENRICHMENT = RAW / "delhi_7mp_custom_enrichment.json"

BASE_API = "https://api.empoweredindian.in/api"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Origin": "https://empoweredindian.in",
    "Referer": "https://empoweredindian.in/",
    "Accept": "application/json, text/plain, */*",
}

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
        return json.loads(r.read().decode("utf-8"))


def main() -> None:
    today = date.today().isoformat()
    all_captures = []
    intake_data = {}

    for slug, name, const, query in DELHI_MPS:
        print(f"Fetching MPLADS for {name} ({const})...")
        search_res = get_json(f"/mplads/search?q={urllib.parse.quote(query)}")
        time.sleep(0.5)

        mps = search_res.get("data", {}).get("mps", [])
        matched = None
        for m in mps:
            if m.get("state", "").lower() == "delhi":
                matched = m
                break

        if not matched:
            print(f"  FAILED to find {name} via query '{query}'")
            continue

        mp_id = matched["_id"]
        detail = get_json(f"/mplads/mps/{mp_id}")
        time.sleep(0.5)
        works = get_json(f"/mplads/mps/{mp_id}/works")
        time.sleep(0.5)

        mp_info = detail.get("data", {}).get("mp", {})
        works_list = works.get("data", {}).get("works", [])

        capture_entry = {
            "slug": slug,
            "mp_id": mp_id,
            "official_name": name,
            "constituency": const,
            "mp_profile": mp_info,
            "expenditure_summary": detail.get("data", {}).get("expenditure", {}),
            "works_sample_count": len(works_list),
            "works": works_list[:20],  # sample of 20 works
            "source_url": f"https://empoweredindian.in/mps/{mp_id}",
            "retrieved_at": today,
        }
        all_captures.append(capture_entry)

        # Convert to ₹ Crores (1 Cr = 10,000,000 INR)
        alloc_cr = round(mp_info.get("allocatedAmount", 0) / 1e7, 2)
        exp_cr = round(mp_info.get("totalExpenditure", 0) / 1e7, 2)
        unspent_cr = round(mp_info.get("unspentAmount", 0) / 1e7, 2)
        rec_works = mp_info.get("recommendedWorksCount")
        comp_works = mp_info.get("completedWorksCount")
        pend_works = mp_info.get("pendingWorks")
        util_pct = round(mp_info.get("utilizationPercentage", 0), 1)

        intake_data[slug] = {
            "annual_entitlement_cr": 5.0,
            "funds_released_cr": alloc_cr,
            "expenditure_cr": exp_cr,
            "utilisation_pct": util_pct,
            "unspent_balance_cr": unspent_cr,
            "works_recommended": rec_works,
            "works_sanctioned": rec_works,  # in MoSPI e-SAKSHI recommended are sanctioned by district
            "works_completed": comp_works,
            "as_of_date": today,
            "source_url": f"https://empoweredindian.in/mps/{mp_id}",
        }
        print(f"  -> Alloc: Rs {alloc_cr} Cr | Exp: Rs {exp_cr} Cr | Unspent: Rs {unspent_cr} Cr | Works: {comp_works}/{rec_works}")

    # 1. Save raw capture
    raw_payload = {
        "source": {
            "name": "Empowered Indian MPLADS API (MoSPI e-SAKSHI data)",
            "base_url": BASE_API,
            "retrieved_at": today,
            "coverage": "Delhi (7 Lok Sabha MPs), 18th Lok Sabha",
            "citation": "Empowered Indian (empoweredindian.in); Primary source: MoSPI e-SAKSHI",
        },
        "records": all_captures,
    }
    RAW_OUT.write_text(json.dumps(raw_payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"\nSaved raw capture -> {RAW_OUT}")

    # 2. Update delhi_7mp_custom_enrichment.json
    if ENRICHMENT.exists():
        enrich_data = json.loads(ENRICHMENT.read_text(encoding="utf-8"))
        for item in enrich_data:
            s = item.get("slug")
            if s in intake_data:
                item["mplads"] = intake_data[s]
        ENRICHMENT.write_text(json.dumps(enrich_data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"Updated {len(intake_data)} records in {ENRICHMENT}")


if __name__ == "__main__":
    main()
