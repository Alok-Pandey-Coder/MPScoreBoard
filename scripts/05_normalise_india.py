"""Normalise and merge All-India 18th Lok Sabha MPs from Digital Sansad and PRS.

Inputs:
  - data/raw/sansad.members.india.2026-10-31.json (544 official members)
  - data/raw/prs.india.manifest.2026-10-31.json (553 PRS directory records)

Output:
  - data/processed/mps.india.json (Canonical 543/544-member dataset)
  - data/processed/validation_report_india.md (Validation & match audit)
"""

from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
PROCESSED = ROOT / "data" / "processed"

OUT_JSON = PROCESSED / "mps.india.json"
OUT_REPORT = PROCESSED / "validation_report_india.md"

# Constituency spelling aliases: normalized variant -> canonical
CONST_ALIASES = {
    "srerampur": "sreerampur",
    "serampore": "sreerampur",
    "patliputra": "pataliputra",
    "narsaraopet": "narasaraopet",
    "thirupati": "tirupati",
    "baharaich": "bahraich",
    "ananthapur": "anantapur",
    "davangere": "davanagere",
    "arambagh": "arambag",
    "joynagar": "jaynagar",
    "kurnoolu": "kurnool",
    "palamau": "palamu",
    "haridwar": "hardwar",
    "darang udalguri": "darrang udalguri",
    "darrang udalguri": "darrang udalguri",
    "bardhaman durgapur": "burdwan durgapur",
    "maldaha uttar": "maldaha north",
    "maldaha dakshin": "maldaha south",
    "kushi nagar": "kushinagar",
    "gautam buddha nagar": "gautam buddh nagar",
    "sant kabir nagar": "sant kabir nagar",
}

STATE_ALIASES = {
    "nct of delhi": "delhi",
    "jammu and kashmir": "jammu & kashmir",
    "dadra and nagar haveli and daman and diu": "dadra and nagar haveli and daman and diu",
    "andaman and nicobar islands": "andaman & nicobar",
}


def clean_str(s: str | None) -> str:
    if not s:
        return ""
    s = s.lower().strip()
    s = re.sub(r"\s*\((sc|st)\)\s*$", "", s, flags=re.I)
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return " ".join(s.split())


def const_key(val: str | None) -> str:
    cleaned = clean_str(val)
    return CONST_ALIASES.get(cleaned, cleaned)


def state_key(val: str | None) -> str:
    cleaned = clean_str(val)
    return STATE_ALIASES.get(cleaned, cleaned)


def make_slug(constituency: str, state: str) -> str:
    clean_c = re.sub(r"\s*\((sc|st)\)\s*$", "", constituency, flags=re.I).strip()
    c_part = re.sub(r"[^a-z0-9]+", "-", clean_c.lower()).strip("-")
    s_part = re.sub(r"[^a-z0-9]+", "-", state.lower()).strip("-")
    return f"{c_part}-{s_part}"


def main() -> None:
    today = date.today().isoformat()
    sansad_file = RAW / "sansad.members.india.2026-10-31.json"
    prs_file = RAW / "prs.india.manifest.2026-10-31.json"

    if not sansad_file.exists():
        raise SystemExit(f"Missing {sansad_file}")
    if not prs_file.exists():
        raise SystemExit(f"Missing {prs_file}")

    sansad_data = json.loads(sansad_file.read_text(encoding="utf-8"))
    prs_data = json.loads(prs_file.read_text(encoding="utf-8"))

    sansad_members = sansad_data["records"]
    prs_members = prs_data["records"]

    # Index PRS members by (state, const) and by (const)
    prs_by_sc: dict[tuple[str, str], dict] = {}
    prs_by_c: dict[str, dict] = {}
    prs_by_name: dict[str, dict] = {}

    for p in prs_members:
        sk = state_key(p.get("state"))
        ck = const_key(p.get("constituency"))
        nk = clean_str(p.get("name"))
        prs_by_sc[(sk, ck)] = p
        prs_by_c[ck] = p
        if nk:
            prs_by_name[nk] = p

    merged_records = []
    matched_count = 0
    unmatched = []

    for s in sansad_members:
        s_name = s.get("mpFirstLastName") or s.get("detail", {}).get("fullName") or ""
        s_const = s.get("constName") or ""
        s_state = s.get("stateName") or ""
        mpsno = s.get("mpsno")

        sk = state_key(s_state)
        ck = const_key(s_const)
        nk = clean_str(s_name)

        # Match strategy:
        # 1. Exact (state, const)
        # 2. Const only
        # 3. Clean Name
        p_match = prs_by_sc.get((sk, ck))
        if not p_match:
            p_match = prs_by_c.get(ck)
        if not p_match:
            p_match = prs_by_name.get(nk)
        # Fuzzy name fallback
        if not p_match:
            for prs_name_k, prs_obj in prs_by_name.items():
                if nk and (nk in prs_name_k or prs_name_k in nk):
                    p_match = prs_obj
                    break

        is_minister = bool(s.get("detail", {}).get("councilMinSts"))
        slug = make_slug(s_const, s_state)

        if p_match:
            matched_count += 1
            debates = None if is_minister else p_match.get("debates_card")
            questions = None if is_minister else p_match.get("questions_card")
            pmbs = None if is_minister else p_match.get("private_member_bills_card")
            prs_url = p_match.get("source_url")
            age = p_match.get("age")
            party_code = s.get("partySname") or p_match.get("party") or "IND"
            perf_status = "not_applicable" if is_minister else "reported"
        else:
            unmatched.append({"name": s_name, "constituency": s_const, "state": s_state})
            debates = None
            questions = None
            pmbs = None
            prs_url = None
            age = None
            party_code = s.get("partySname") or "IND"
            perf_status = "not_applicable" if is_minister else "pending"

        record = {
            "slug": slug,
            "name": s_name,
            "constituency": s_const,
            "state": s_state,
            "party": party_code,
            "party_full": s.get("partyFname") or party_code,
            "reservation": s.get("categoryCode") or "GEN",
            "term": "18th Lok Sabha",
            "since_date": "2024-06-09",
            "is_minister": is_minister,
            "special_role": None,
            "sansad_mpsno": int(mpsno) if str(mpsno).isdigit() else mpsno,
            "sansad_status": s.get("status") or "Sitting",
            "identity_review_status": "official_sansad_api",
            "profile": {
                "age": age,
                "gender": s.get("gender"),
                "education": s.get("qualification"),
                "term_number": s.get("noOfTerms"),
                "as_of": today,
                "source": {
                    "name": "Digital Sansad & PRS Legislative Research",
                    "url": prs_url or "https://sansad.in",
                    "retrieved_at": today,
                },
            },
            "performance": {
                "status": perf_status,
                "attendance_pct": None,  # Requires detailed profile scrape
                "debates": debates,
                "questions": questions,
                "private_member_bills": pmbs,
                "as_of": today,
                "source": {
                    "name": "PRS Legislative Research MP Track (18th Lok Sabha)",
                    "url": prs_url or "https://prsindia.org/mptrack/18-lok-sabha",
                    "retrieved_at": today,
                },
            },
            "affidavit": {
                "status": "pending",
                "election_year": 2024,
                "assets": None,
                "liabilities": None,
                "declared_criminal_cases": None,
                "education": None,
                "as_of": None,
                "source": None,
            },
            "mplads": {
                "status": "pending",
                "annual_entitlement_cr": 5.0,
                "funds_released_cr": None,
                "expenditure_cr": None,
                "utilisation_pct": None,
                "unspent_balance_cr": None,
                "works": {
                    "recommended": None,
                    "sanctioned": None,
                    "completed": None,
                },
                "as_of": None,
                "source": None,
            },
            "election": {
                "status": "pending",
                "election_year": 2024,
                "votes": None,
                "runner_up": None,
                "margin": None,
                "as_of": None,
                "source": None,
            },
            "sources": [
                {
                    "name": "Lok Sabha, Digital Sansad member API",
                    "url": f"https://sansad.in/api_ls/member/{mpsno}",
                    "retrieved_at": today,
                }
            ],
            "normalisation_notes": [],
        }

        if prs_url:
            record["sources"].append({
                "name": "PRS Legislative Research MP Track",
                "url": prs_url,
                "retrieved_at": today,
            })

        merged_records.append(record)

    # Save output
    OUT_JSON.write_text(json.dumps(merged_records, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Saved {len(merged_records)} national MP records to {OUT_JSON}")
    print(f"Matched with PRS: {matched_count}/{len(sansad_members)} ({matched_count/len(sansad_members):.1%})")

    # Generate validation markdown report
    from collections import Counter
    states_count = Counter(r["state"] for r in merged_records)
    ministers = [r for r in merged_records if r["is_minister"]]

    report = [
        "# All-India Dataset Validation & Normalisation Report",
        "",
        f"- **Generated:** {today}",
        f"- **Total MPs:** {len(merged_records)}",
        f"- **Matched with PRS Activity Numbers:** {matched_count} / {len(sansad_members)} ({matched_count/len(sansad_members):.1%})",
        f"- **Total States / UTs:** {len(states_count)}",
        f"- **Ministers (Performance `not_applicable`):** {len(ministers)}",
        "",
        "## State Breakdown",
        "",
        "| State / UT | MPs Count |",
        "|:---|:---:|",
    ]
    for st, cnt in sorted(states_count.items()):
        report.append(f"| {st} | {cnt} |")

    if unmatched:
        report.extend([
            "",
            "## Unmatched Sansad Members",
            "",
            "| Name | Constituency | State |",
            "|:---|:---|:---|",
        ])
        for u in unmatched:
            report.append(f"| {u['name']} | {u['constituency']} | {u['state']} |")

    OUT_REPORT.write_text("\n".join(report) + "\n", encoding="utf-8")
    print(f"Validation report saved to {OUT_REPORT}")


if __name__ == "__main__":
    main()
