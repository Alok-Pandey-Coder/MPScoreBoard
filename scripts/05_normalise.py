"""Normalize identity and parsed PRS records per state without changing raw files.

For each registered state (scripts/states.py; `--state KEY` limits it) this
writes data/processed/normalised.<key>.json. The identity master is either the
reviewed government roster data/raw/masterlist.<key>.json (Delhi) or the latest
official Digital Sansad member capture data/raw/sansad.members.<key>.<date>.json
(Goa). Seats are joined on normalised state + constituency; names only confirm.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import states  # noqa: E402

RAW = ROOT / "data" / "raw"
PROCESSED = ROOT / "data" / "processed"
OUT = PROCESSED / "normalised.delhi.json"  # Delhi output (kept for compatibility)
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


def latest_sansad_capture(file_key: str = "delhi") -> dict | None:
    captures = sorted(RAW.glob(f"sansad.members.{file_key}.*.json"))
    return json.loads(captures[-1].read_text(encoding="utf-8")) if captures else None


def iso_date(value: str | None) -> str | None:
    """Convert PRS dd-mm-yyyy dates to ISO; leave anything else as None."""
    match = re.fullmatch(r"(\d{2})-(\d{2})-(\d{4})", value or "")
    return f"{match[3]}-{match[2]}-{match[1]}" if match else None


def identity_master(state: states.State, sansad: dict | None) -> dict:
    """The identity master for a state as {"source": {...}, "records": [{name, constituency, state, party}]}."""
    if state.identity_master == "masterlist":
        return json.loads((RAW / f"masterlist.{state.key}.json").read_text(encoding="utf-8"))
    if state.identity_master == "sansad":
        if sansad is None:
            raise SystemExit(f"{state.name}: no Digital Sansad capture sansad.members.{state.key}.<date>.json (identity master)")
        source = sansad["source"]
        return {
            "source": {"name": source["name"], "url": source["list_url"], "retrieved_at": source["retrieved_at"]},
            "records": [
                {"name": row["mpFirstLastName"], "constituency": row["constName"], "state": state.name, "party": row["partySname"]}
                for row in sansad["records"]
            ],
        }
    raise SystemExit(f"{state.name}: unknown identity master '{state.identity_master}'")


def normalise_state(state: states.State) -> dict:
    sansad = latest_sansad_capture(state.key)
    master = identity_master(state, sansad)
    sansad_is_master = state.identity_master == "sansad"
    prs = json.loads((PROCESSED / f"prs.parsed.{state.key}.json").read_text(encoding="utf-8"))
    prs_by_seat = {(state_key(row["state"]), constituency_key(row["constituency"])): row for row in prs["records"]}
    sansad_by_seat = {
        (state_key(row["stateName"]), constituency_key(row["constName"])): row for row in (sansad["records"] if sansad else [])
    }
    records = []
    for row in master["records"]:
        seat = (state_key(row["state"]), constituency_key(row["constituency"]))
        prs_row = prs_by_seat.pop(seat, None)
        sansad_row = sansad_by_seat.pop(seat, None)
        notes = []
        if sansad_is_master:
            notes.append(
                f"Identity (name, seat, party) from the official Digital Sansad member API, the identity master for "
                f"{state.name} (no reviewed state government roster)."
            )
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
            if sansad_is_master and sansad_row and (sansad_row.get("qualification") or "") != (prs_row.get("education") or ""):
                notes.append(
                    f"Education: PRS shows '{prs_row.get('education')}', Digital Sansad shows "
                    f"'{sansad_row.get('qualification')}'; the profile shows the PRS value."
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
    out = PROCESSED / f"normalised.{state.key}.json"
    out.write_text(
        json.dumps(
            {"records": records, "unmatched_prs": unmatched_prs, "unmatched_sansad": unmatched_sansad},
            indent=2,
            ensure_ascii=False,
        )
        + "\n",
        encoding="utf-8",
    )
    print(
        f"{state.name}: normalized {len(records)} records, {len(unmatched_prs)} unmatched PRS rows, "
        f"{len(unmatched_sansad)} unmatched Sansad rows -> {out}"
    )
    return {"records": records}


def main() -> None:
    for state in states.selected(description=__doc__.split("\n")[0]):
        normalise_state(state)


if __name__ == "__main__":
    main()
