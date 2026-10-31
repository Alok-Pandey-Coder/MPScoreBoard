"""Capture the official Sansad (Lok Sabha) member records for one state.

One list request filtered by state, then one detail request per member for the
minister status. Only identity fields are stored; personal contact and family
fields in the responses are dropped before writing the raw capture.
"""

import json
import sys
from datetime import date
from pathlib import Path
from urllib.parse import quote

from polite_fetch import fetch_json

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
BASE = "https://sansad.in/api_ls/member"
LOK_SABHA = 18
STATE = "NCT of Delhi"
STATE_KEY = "delhi"
LIST_FIELDS = (
    "mpsno", "initial", "mpFirstLastName", "constName", "stateName", "partyFname", "partySname",
    "gender", "status", "noOfTerms", "qualification", "categoryCode", "profileUrl", "lsExpr",
)
DETAIL_FIELDS = ("mpsno", "fullName", "constituency", "stateName", "partySname", "councilMinSts")


def main() -> None:
    target = RAW / f"sansad.members.{STATE_KEY}.{date.today().isoformat()}.json"
    if target.exists():
        sys.exit(f"{target.name} already exists; raw captures are immutable")
    list_url = f"{BASE}?loksabha={LOK_SABHA}&page=1&size=100&state={quote(STATE)}"
    listing = fetch_json(list_url)
    members = []
    for row in listing["membersDtoList"]:
        detail_url = f"{BASE}/{row['mpsno']}"
        detail = fetch_json(detail_url)  # polite_fetch spaces requests to the host
        members.append(
            {
                **{field: row.get(field) for field in LIST_FIELDS},
                "detail": {field: detail.get(field) for field in DETAIL_FIELDS},
                "detail_url": detail_url,
            }
        )
    capture = {
        "source": {
            "name": "Lok Sabha, Digital Sansad member API",
            "list_url": list_url,
            "retrieved_at": date.today().isoformat(),
            "coverage": f"{LOK_SABHA}th Lok Sabha, {STATE}",
            "total_elements": listing["metaDatasDto"]["totalElements"],
            "extraction": "JSON responses filtered to identity fields",
            "dropped_fields": "addresses, phone numbers, email, date of birth, family and marital details, photo URL",
        },
        "records": members,
    }
    target.write_text(json.dumps(capture, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"saved {len(members)} members ({capture['source']['total_elements']} reported) -> {target}")


if __name__ == "__main__":
    main()
