"""Merge normalized Delhi records into the application export."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "processed" / "normalised.delhi.json"
OUTPUT = ROOT / "data" / "processed" / "mps.json"
TERM = "18th Lok Sabha"
METRICS = ("attendance_pct", "debates", "questions", "private_member_bills")


def pending_block(fields: tuple[str, ...]) -> dict:
    return {"status": "pending", **{field: None for field in fields}, "as_of": None, "source": None, "review_status": None}


def performance_block(prs: dict | None) -> dict:
    if prs is None:
        return {"status": "not_available", **{field: None for field in METRICS}, "as_of": None, "source": None, "review_status": None}
    return {
        "status": prs["performance_status"],
        **{field: prs["metrics"][field]["mp"] for field in METRICS},
        "period": {"from": prs["coverage_from_iso"], "to": prs["coverage_to_iso"]},
        "as_of": prs["coverage_to_iso"],
        "prs_averages": {
            "national": {field: prs["metrics"][field]["national_average"] for field in METRICS},
            "state": {field: prs["metrics"][field]["state_average"] for field in METRICS},
        },
        "source": {
            "name": "PRS Legislative Research",
            "url": prs["source_url"],
            "retrieved_at": prs["retrieved_at"],
            "raw_file": prs["file"],
            "licence": prs["licence"],
        },
        # Parsed from cached HTML; becomes "approved" after a manual check against the live page.
        "review_status": "parsed",
    }


def main() -> None:
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    records = []
    for row in source["records"]:
        prs = row["prs"]
        sansad = row["sansad"]
        identity_source = row["identity_source"]
        prs_source = performance_block(prs)["source"]
        suffix_reservation = "SC" if row["constituency"].endswith("(SC)") else "ST" if row["constituency"].endswith("(ST)") else "GEN"
        agreed = prs and sansad and not any("mismatch" in note for note in row["normalisation_notes"])
        records.append(
            {
                "slug": row["slug"],
                "name": row["name"],
                "constituency": row["constituency"],
                "state": row["state"],
                "party": row["party"],
                "party_full": prs["party"] if prs else None,
                # Sansad's category code is the official value; the name suffix is the fallback.
                "reservation": sansad["reservation"] if sansad else suffix_reservation,
                "term": TERM,
                "since_date": prs["term_start_iso"] if prs else None,
                "is_minister": prs["is_minister"] if prs else None,
                "special_role": None,
                "sansad_mpsno": sansad["mpsno"] if sansad else None,
                "sansad_status": sansad["status"] if sansad else None,
                # Cross-checked when the Delhi government list, PRS and Sansad agree on name, seat and party.
                "identity_review_status": "cross_checked" if agreed else "parsed",
                "profile": {
                    "age": int(prs["age"]) if prs and (prs["age"] or "").isdigit() else None,
                    "gender": prs["gender"] if prs else None,
                    "education": prs["education"] if prs else None,
                    "term_number": prs["term_number"] if prs else None,
                    "as_of": prs["retrieved_at"] if prs else None,
                    "source": prs_source,
                },
                "performance": performance_block(prs),
                "mplads": pending_block(("entitlement", "funds_released", "expenditure", "utilisation_pct", "unspent_balance", "works")),
                "affidavit": pending_block(("election_year", "assets", "liabilities", "declared_criminal_cases", "education")),
                "election": pending_block(("election_year", "votes", "runner_up", "margin")),
                "sources": [
                    {"name": identity_source["name"], "url": identity_source["url"], "retrieved_at": identity_source["retrieved_at"]},
                    *(
                        [{"name": "Lok Sabha, Digital Sansad", "url": sansad["url"], "retrieved_at": sansad["retrieved_at"]}]
                        if sansad
                        else []
                    ),
                    *([{key: prs_source[key] for key in ("name", "url", "retrieved_at", "licence")}] if prs else []),
                ],
                "normalisation_notes": row["normalisation_notes"],
            }
        )
    OUTPUT.write_text(json.dumps(records, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"merged {len(records)} records -> {OUTPUT}")


if __name__ == "__main__":
    main()
