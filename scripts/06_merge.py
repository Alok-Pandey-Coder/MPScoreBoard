"""Merge normalized Delhi records, affidavits, MPLADS blocks and election enrichments into the application export.

MPLADS comes from data/processed/mplads.delhi.json (built by 09_intake_mplads.py from the
latest raw captures). The `mplads` key in delhi_7mp_custom_enrichment.json is legacy and ignored.
"""

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "processed" / "normalised.delhi.json"
OUTPUT = ROOT / "data" / "processed" / "mps.json"
AFFIDAVIT_FILE = ROOT / "data" / "reference_packs" / "officials_enriched_pack" / "data" / "mp_affidavit_enrichment.csv"
CUSTOM_ENRICHMENT_FILE = ROOT / "data" / "raw" / "delhi_7mp_custom_enrichment.json"
MPLADS_FILE = ROOT / "data" / "processed" / "mplads.delhi.json"

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


def load_affidavits() -> dict[str, dict]:
    """Load pre-enriched affidavit records indexed by lowercase constituency name."""
    if not AFFIDAVIT_FILE.exists():
        return {}
    with open(AFFIDAVIT_FILE, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return {r["constituency"].strip().lower(): r for r in reader}


def load_custom_enrichment() -> dict[str, dict]:
    """Load user-supplied 7 MP custom enrichment file if available."""
    if not CUSTOM_ENRICHMENT_FILE.exists():
        return {}
    try:
        data = json.loads(CUSTOM_ENRICHMENT_FILE.read_text(encoding="utf-8"))
        return {item["slug"]: item for item in data if "slug" in item}
    except Exception:
        return {}


def affidavit_block(aff: dict | None) -> dict:
    if not aff:
        return pending_block(("election_year", "assets", "liabilities", "declared_criminal_cases", "education"))

    total_assets = int(round(float(aff["declared_total_assets_inr"]))) if aff.get("declared_total_assets_inr") else None
    # Missing affidavit values stay null; a declared "0" is kept as 0.
    liabilities = int(round(float(aff["declared_liabilities_inr"]))) if aff.get("declared_liabilities_inr") not in (None, "") else None
    cases = int(aff["declared_criminal_case_count"]) if aff.get("declared_criminal_case_count") not in (None, "") else None
    edu = aff.get("education_detail_as_declared") or aff.get("education_category_as_declared")

    return {
        "status": "reported",
        "election_year": int(aff.get("election_year") or 2024),
        "assets": total_assets,
        "liabilities": liabilities,
        "declared_criminal_cases": cases,
        "education": edu,
        "as_of": aff.get("retrieved_on") or "2026-10-31",
        "source": {
            "name": "Association for Democratic Reforms (ADR) / MyNeta",
            "url": aff.get("myneta_profile_url"),
            "retrieved_at": aff.get("retrieved_on") or "2026-10-31",
            "candidate_id": int(aff["myneta_candidate_id"]) if aff.get("myneta_candidate_id") else None,
            "adr_report_url": aff.get("adr_2024_candidate_report_source"),
            "adr_pdf_page": int(aff["adr_asset_pdf_page"]) if aff.get("adr_asset_pdf_page") else None,
        },
        "review_status": "cross_checked",
    }


MPLADS_PENDING_FIELDS = (
    "annual_entitlement_cr", "allocated_cr", "recommended_amount_cr", "expenditure_cr",
    "unspent_cr", "expenditure_pct", "recommended_pct", "works_count",
)


def load_mplads() -> dict[str, dict]:
    """Per-seat MPLADS blocks produced by 09_intake_mplads.py from the latest raw captures."""
    if not MPLADS_FILE.exists():
        return {}
    return json.loads(MPLADS_FILE.read_text(encoding="utf-8"))["seats"]


def mplads_block(seat: dict | None) -> dict:
    if not seat or not seat.get("block"):
        return {**pending_block(MPLADS_PENDING_FIELDS), "works": [], "works_is_partial": False, "cross_check": []}
    return seat["block"]


def election_block(custom: dict | None) -> dict:
    if not custom or not custom.get("election"):
        return pending_block(("election_year", "votes", "runner_up", "margin"))
    e = custom["election"]
    has_data = any(e.get(k) is not None for k in ("winning_votes", "margin_votes", "runner_up_name"))
    if not has_data:
        return pending_block(("election_year", "votes", "runner_up", "margin"))
    return {
        "status": "reported",
        "election_year": e.get("election_year") or 2024,
        "votes": e.get("winning_votes"),
        "runner_up": {
            "name": e.get("runner_up_name"),
            "party": e.get("runner_up_party"),
            "votes": e.get("runner_up_votes"),
        } if e.get("runner_up_name") else None,
        "margin": e.get("margin_votes"),
        "as_of": "2024-06-04",
        "source": {
            "name": e.get("source_name") or "Election Commission of India",
            "url": e.get("source_url") or "https://results.eci.gov.in",
            "retrieved_at": "2026-10-31",
        },
        "review_status": "user_verified",
    }


def main() -> None:
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    affidavits = load_affidavits()
    custom_enrichments = load_custom_enrichment()
    mplads_seats = load_mplads()

    records = []
    for row in source["records"]:
        prs = row["prs"]
        sansad = row["sansad"]
        identity_source = row["identity_source"]
        prs_source = performance_block(prs)["source"]
        suffix_reservation = "SC" if row["constituency"].endswith("(SC)") else "ST" if row["constituency"].endswith("(ST)") else "GEN"
        agreed = prs and sansad and not any("mismatch" in note for note in row["normalisation_notes"])

        # Match affidavit on exact seat name (case-insensitive)
        seat_key = row["constituency"].strip().lower()
        aff = affidavits.get(seat_key)
        custom = custom_enrichments.get(row["slug"])

        aff_block = affidavit_block(aff)
        mpl_seat = mplads_seats.get(row["slug"])
        mpl_block = mplads_block(mpl_seat)
        elec_block = election_block(custom)

        sources = [
            {"name": identity_source["name"], "url": identity_source["url"], "retrieved_at": identity_source["retrieved_at"]},
            *(
                [{"name": "Lok Sabha, Digital Sansad", "url": sansad["url"], "retrieved_at": sansad["retrieved_at"]}]
                if sansad
                else []
            ),
            *([{key: prs_source[key] for key in ("name", "url", "retrieved_at", "licence")}] if prs else []),
        ]

        if aff_block["status"] == "reported" and aff_block["source"]:
            sources.append({
                "name": aff_block["source"]["name"],
                "url": aff_block["source"]["url"],
                "retrieved_at": aff_block["source"]["retrieved_at"],
            })

        if mpl_block["status"] == "reported" and mpl_block["source"]:
            sources.append({
                "name": mpl_block["source"]["name"],
                "url": mpl_block["source"]["url"],
                "retrieved_at": mpl_block["source"]["retrieved_at"],
            })

        if elec_block["status"] == "reported" and elec_block["source"]:
            sources.append({
                "name": elec_block["source"]["name"],
                "url": elec_block["source"]["url"],
                "retrieved_at": elec_block["source"]["retrieved_at"],
            })

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
                "mplads": mpl_block,
                "affidavit": aff_block,
                "election": elec_block,
                "sources": sources,
                "normalisation_notes": row["normalisation_notes"] + (mpl_seat["notes"] if mpl_seat else []),
            }
        )

    OUTPUT.write_text(json.dumps(records, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"merged {len(records)} records (with affidavits) -> {OUTPUT}")


if __name__ == "__main__":
    main()
