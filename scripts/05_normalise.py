"""Normalize Delhi identity and parsed PRS records without changing raw files."""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
PROCESSED = ROOT / "data" / "processed"
OUT = PROCESSED / "normalised.delhi.json"
ALIASES = json.loads((PROCESSED / "aliases.json").read_text(encoding="utf-8"))


def key(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", (value or "").lower()).strip("-")


def canonical_constituency(value: str) -> str:
    return ALIASES["constituency"].get((value or "").strip().lower(), value)


def constituency_key(value: str) -> str:
    value = re.sub(r"\s*\((SC|ST)\)\s*$", "", canonical_constituency(value), flags=re.I)
    return key(value)


def canonical_name(value: str) -> str:
    return ALIASES["mp"].get((value or "").strip().lower(), value)


def name_key(value: str) -> str:
    return key(canonical_name(value))


def state_key(value: str) -> str:
    return key(ALIASES["state"].get((value or "").strip().lower(), value))


def latest_sansad_capture() -> dict | None:
    captures = sorted(RAW.glob("sansad.members.delhi.*.json"))
    return json.loads(captures[-1].read_text(encoding="utf-8")) if captures else None


def iso_date(value: str | None) -> str | None:
    """Convert PRS dd-mm-yyyy dates to ISO; leave anything else as None."""
    match = re.fullmatch(r"(\d{2})-(\d{2})-(\d{4})", value or "")
    return f"{match[3]}-{match[2]}-{match[1]}" if match else None


def main() -> None:
    master = json.loads((RAW / "masterlist.delhi.json").read_text(encoding="utf-8"))
    prs = json.loads((PROCESSED / "prs.parsed.delhi.json").read_text(encoding="utf-8"))
    prs_by_seat = {(state_key(row["state"]), constituency_key(row["constituency"])): row for row in prs["records"]}
    sansad = latest_sansad_capture()
    sansad_by_seat = {
        (state_key(row["stateName"]), constituency_key(row["constName"])): row for row in (sansad["records"] if sansad else [])
    }
    records = []
    for row in master["records"]:
        seat = (state_key(row["state"]), constituency_key(row["constituency"]))
        prs_row = prs_by_seat.pop(seat, None)
        sansad_row = sansad_by_seat.pop(seat, None)
        notes = []
        if sansad is not None and sansad_row is None:
            notes.append("No Sansad member record matched on state + constituency.")
        if sansad_row:
            if name_key(sansad_row["mpFirstLastName"]) != name_key(row["name"]):
                notes.append(f"Name mismatch: master '{row['name']}' vs Sansad '{sansad_row['mpFirstLastName']}'.")
            if sansad_row["partySname"] != row["party"]:
                notes.append(f"Party mismatch: master '{row['party']}' vs Sansad '{sansad_row['partySname']}'.")
            if sansad_row["status"] != "Sitting":
                notes.append(f"Sansad status is '{sansad_row['status']}', not Sitting.")
        if prs_row is None:
            notes.append("No PRS record matched on state + constituency.")
        else:
            if name_key(prs_row["name"]) != name_key(row["name"]):
                notes.append(f"Name mismatch: master '{row['name']}' vs PRS '{prs_row['name']}'.")
            elif prs_row["name"] != row["name"]:
                notes.append(f"PRS name '{prs_row['name']}' matched '{row['name']}' via aliases.json.")
            if prs_row["constituency"] != row["constituency"]:
                notes.append(
                    f"PRS constituency '{prs_row['constituency']}' matched '{row['constituency']}' after removing the reservation suffix."
                )
        records.append(
            {
                "slug": f"{seat[1]}-{seat[0]}",
                "state_key": seat[0],
                "constituency_key": seat[1],
                "name_key": name_key(row["name"]),
                "name": row["name"],
                "constituency": row["constituency"],
                "state": row["state"],
                "party": row["party"],
                "identity_source": master["source"],
                "prs": prs_row
                and {
                    **prs_row,
                    "term_start_iso": iso_date(prs_row["term_start"]),
                    "coverage_from_iso": iso_date(prs_row["coverage_from"]),
                    "coverage_to_iso": iso_date(prs_row["coverage_to"]),
                    "retrieved_at": prs["source"]["retrieved_at"],
                },
                "sansad": sansad_row
                and {
                    "mpsno": sansad_row["mpsno"],
                    "name": sansad_row["mpFirstLastName"],
                    "party": sansad_row["partySname"],
                    "status": sansad_row["status"],
                    "no_of_terms": sansad_row["noOfTerms"],
                    # categoryCode is "(SC)", "(ST)" or blank for general seats.
                    "reservation": (sansad_row["categoryCode"] or "").strip(" ()") or "GEN",
                    "url": sansad_row["detail_url"],
                    "retrieved_at": sansad["source"]["retrieved_at"],
                },
                "normalisation_notes": notes,
            }
        )
    unmatched_prs = [row["name"] for row in prs_by_seat.values()]
    unmatched_sansad = [row["mpFirstLastName"] for row in sansad_by_seat.values()]
    OUT.write_text(
        json.dumps(
            {"records": records, "unmatched_prs": unmatched_prs, "unmatched_sansad": unmatched_sansad},
            indent=2,
            ensure_ascii=False,
        )
        + "\n",
        encoding="utf-8",
    )
    print(
        f"normalized {len(records)} records, {len(unmatched_prs)} unmatched PRS rows, "
        f"{len(unmatched_sansad)} unmatched Sansad rows -> {OUT}"
    )


if __name__ == "__main__":
    main()
