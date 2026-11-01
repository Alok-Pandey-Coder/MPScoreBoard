"""Normalise MPLADS captures into per-seat blocks matching `MpladsData` in types/mp.ts.

Inputs (immutable raw captures, never modified):
  - Latest `data/raw/mplads.delhi.empoweredindian.<yyyy-mm-dd>.json`
    Empowered Indian MPLADS API, which aggregates MoSPI eSAKSHI. Primary figures.
    All amounts in the capture are rupees.
  - Latest `data/raw/mplads.delhi.janwatchdog.<yyyy-mm-dd>.csv`
    JanWatchdog Delhi MPLADS summary (secondary aggregator). Cross-check only.

Output: `data/processed/mplads.delhi.json`, read by `06_merge.py` and `07_validate.py`.

Runs for each registered state whose MPLADS source is cleared (`mplads_source` in
scripts/states.py) - currently Delhi only. Other states (Goa) get no file and their
MPLADS block stays "pending"; nothing is fetched here.

Normalisation decisions (also written into each seat's notes):
  - 1 crore = 10,000,000 rupees; crore values are rounded to 4 decimals (Rs 1,000).
  - expenditure_pct = expenditure / allocated x 100 and
    recommended_pct = recommended / allocated x 100, computed from the rupee
    amounts and rounded to 1 decimal. Empowered Indian's `utilizationPercentage`
    is defined as recommended / allocated (`utilizationDefinition:
    "recommended_amount"`), so it is never shown as spending utilisation. The
    source percentages are kept under `source_values` for validation only.
  - `allocatedAmount` is stored as allocated_cr. The source has no separate
    "funds released" figure, so none is produced.
  - works_count.sanctioned is null: Empowered Indian does not publish a
    sanctioned count.
  - annual_entitlement_cr is null: the MPLADS guidelines could not be retrieved
    from an official source in this pass (mplads.gov.in refused connections on
    2026-10-31), so the scheme figure is not cited.
  - Seats are joined on normalised state + constituency (reservation suffix
    stripped); MP names are only a secondary confirmation.
"""

from __future__ import annotations

import csv
import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import states  # noqa: E402

RAW = ROOT / "data" / "raw"
OUTPUT = ROOT / "data" / "processed" / "mplads.delhi.json"  # Delhi output; see intake_state()
MASTER = RAW / "masterlist.delhi.json"

CRORE = 10_000_000
CR_DP = 4
PCT_DP = 1
PRIMARY_NAME = "Empowered Indian (aggregating MoSPI eSAKSHI)"
PRIMARY_LICENCE = "Reuse terms not confirmed; non-official aggregator of MoSPI eSAKSHI data"
REVIEW_STATUS = "secondary_only"
CROSS_NAME = "JanWatchdog (secondary aggregator citing the MoSPI MPLADS dashboard)"
CROSS_URL = "https://www.janwatchdog.in/mplads/delhi"
# Relative difference above which a cross-check money figure is called out.
MONEY_DIFF_THRESHOLD = 0.05

_DATED = re.compile(r"\.(\d{4}-\d{2}-\d{2})\.(json|csv)$")


def _load_normalise():
    spec = importlib.util.spec_from_file_location("normalise", ROOT / "scripts" / "05_normalise.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


normalise = _load_normalise()


def latest_capture(pattern: str, raw_dir: Path = RAW) -> Path | None:
    """Return the capture with the latest ISO date in its file name."""
    dated = [(m[1], p) for p in raw_dir.glob(pattern) if (m := _DATED.search(p.name))]
    return max(dated)[1] if dated else None


def to_crore(rupees) -> float | None:
    if rupees is None or rupees == "":
        return None
    return round(float(rupees) / CRORE, CR_DP)


def pct(part, whole) -> float | None:
    if part is None or whole in (None, 0):
        return None
    return round(float(part) / float(whole) * 100, PCT_DP)


def iso_date(value) -> str | None:
    match = re.match(r"(\d{4}-\d{2}-\d{2})", value or "")
    return match[1] if match else None


def map_status(raw: str | None) -> str:
    value = (raw or "").strip().lower().replace("-", " ").replace("_", " ")
    if value == "completed":
        return "completed"
    if value == "recommended":
        return "recommended"
    if value == "sanctioned":
        return "sanctioned"
    if value in ("in progress", "ongoing", "under progress", "under execution"):
        return "in_progress"
    return "other"


def map_work(w: dict) -> dict:
    has_image = w.get("hasImage")
    return {
        "work_id": str(w["workId"]),
        "description": (w.get("workDescription") or "").strip(),
        "category": w.get("workCategory") or None,
        "implementing_agency": w.get("ida") or None,
        "status": map_status(w.get("status")),
        "status_raw": w.get("status"),
        "recommended_on": iso_date(w.get("recommendationDate")),
        "completed_on": iso_date(w.get("completedDate")),
        "recommended_amount_cr": to_crore(w.get("recommendedAmount")),
        "final_amount_cr": to_crore(w.get("finalAmount")),
        "paid_cr": to_crore(w.get("totalPaid")),
        "has_image": has_image if isinstance(has_image, bool) else None,
    }


def sort_works(works: list[dict]) -> list[dict]:
    """Newest recommendation first (undated last), then work_id. Never by amount."""
    def key(w):
        work_id = w["work_id"]
        id_key = (0, int(work_id), "") if work_id.isdigit() else (1, 0, work_id)
        return id_key

    by_id = sorted(works, key=key)
    dated = sorted((w for w in by_id if w["recommended_on"]), key=lambda w: w["recommended_on"], reverse=True)
    return dated + [w for w in by_id if not w["recommended_on"]]


def _int_or_none(value) -> int | None:
    if value is None or value == "":
        return None
    return int(float(value))


def _float_or_none(value) -> float | None:
    if value is None or value == "":
        return None
    return float(value)


def load_cross_check(path: Path | None, state_key: str = "delhi") -> dict[tuple[str, str], dict]:
    if path is None:
        return {}
    rows = {}
    with open(path, encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            seat = (state_key, normalise.constituency_key(row["constituency"]))
            rows[seat] = row
    return rows


def cross_check_block(row: dict, primary: dict, raw_file: str) -> dict:
    allocated = _float_or_none(row.get("allocated_crore_inr"))
    spent = _float_or_none(row.get("spent_crore_inr"))
    counts = {
        "works_recommended": _int_or_none(row.get("works_recommended_count")),
        "works_sanctioned": _int_or_none(row.get("works_sanctioned_count")),
        "works_completed": _int_or_none(row.get("works_completed_count")),
    }
    as_of = row.get("source_snapshot_date") or None
    differences = []
    for label, theirs, ours in (
        ("Allocated", allocated, primary["allocated_cr"]),
        ("Expenditure", spent, primary["expenditure_cr"]),
    ):
        if theirs is None or ours is None:
            continue
        if ours == 0:
            if theirs != 0:
                differences.append(f"{label}: JanWatchdog Rs {theirs} cr vs Empowered Indian Rs 0 cr.")
            continue
        rel = (theirs - ours) / ours
        if abs(rel) > MONEY_DIFF_THRESHOLD:
            differences.append(
                f"{label} differs by {rel * 100:+.1f}%: JanWatchdog Rs {theirs} cr vs Empowered Indian Rs {round(ours, 2)} cr."
            )
    primary_counts = primary["works_count"]
    for label, theirs, ours in (
        ("Works recommended", counts["works_recommended"], primary_counts["recommended"]),
        ("Works completed", counts["works_completed"], primary_counts["completed"]),
    ):
        if theirs is not None and ours is not None and theirs != ours:
            differences.append(f"{label}: JanWatchdog {theirs} vs Empowered Indian {ours}.")
    if counts["works_sanctioned"] is not None and primary_counts["sanctioned"] is None:
        differences.append(
            f"Works sanctioned: JanWatchdog reports {counts['works_sanctioned']}; Empowered Indian publishes no sanctioned count."
        )
    if differences and as_of and primary.get("as_of") and as_of != primary["as_of"]:
        differences.append(f"Snapshots differ in date (JanWatchdog {as_of}, Empowered Indian {primary['as_of']}); some gaps may be timing.")
    return {
        "source": {"name": CROSS_NAME, "url": CROSS_URL, "raw_file": raw_file, "licence": "Reuse terms not confirmed; cross-check only"},
        "as_of": as_of,
        "allocated_cr": allocated,
        "expenditure_cr": spent,
        **counts,
        "differences": differences,
    }


def build_block(rec: dict, raw_file: str) -> tuple[dict, dict, list[str]]:
    profile = rec.get("mp_profile") or {}
    notes: list[str] = []
    allocated = profile.get("allocatedAmount")
    expenditure = profile.get("totalExpenditure")
    recommended = profile.get("totalRecommendedAmount")
    unspent = profile.get("unspentAmount")

    if unspent is not None and allocated is not None and expenditure is not None:
        computed = allocated - expenditure
        if abs(computed - unspent) > 1:
            notes.append(f"MPLADS: source unspentAmount {unspent} differs from allocated - expenditure {computed}; source value kept.")
    elif unspent is None and allocated is not None and expenditure is not None:
        unspent = allocated - expenditure
        notes.append("MPLADS: unspent computed as allocated - expenditure (source gave no unspentAmount).")

    rec_count = _int_or_none(profile.get("recommendedWorksCount"))
    works = sort_works([map_work(w) for w in rec.get("works") or []])
    as_of = rec.get("retrieved_at")
    block = {
        "status": "reported",
        "annual_entitlement_cr": None,
        "allocated_cr": to_crore(allocated),
        "recommended_amount_cr": to_crore(recommended),
        "expenditure_cr": to_crore(expenditure),
        "unspent_cr": to_crore(unspent),
        "expenditure_pct": pct(expenditure, allocated),
        "recommended_pct": pct(recommended, allocated),
        "works_count": {
            "recommended": rec_count,
            "sanctioned": None,
            "completed": _int_or_none(profile.get("completedWorksCount")),
            "pending": _int_or_none(profile.get("pendingWorks")),
        },
        "works": works,
        "works_is_partial": rec_count is not None and len(works) < rec_count,
        "as_of": as_of,
        "source": {
            "name": PRIMARY_NAME,
            "url": rec.get("source_url"),
            "retrieved_at": as_of,
            "raw_file": raw_file,
            "licence": PRIMARY_LICENCE,
        },
        "cross_check": [],
        "review_status": REVIEW_STATUS,
    }
    source_values = {
        "allocated_inr": allocated,
        "expenditure_inr": expenditure,
        "recommended_inr": recommended,
        "unspent_inr": profile.get("unspentAmount"),
        "utilization_pct": profile.get("utilizationPercentage"),
        "utilization_definition": profile.get("utilizationDefinition"),
        "expenditure_pct": profile.get("expenditurePercentage"),
        "works_endpoint_count": rec.get("works_sample_count"),
        "works_captured": len(rec.get("works") or []),
    }
    notes.append(
        "MPLADS: amounts converted from rupees (1 crore = 10,000,000, rounded to 4 dp); "
        "expenditure_pct and recommended_pct computed from amounts; the source's utilizationPercentage "
        f"({profile.get('utilizationDefinition')!s} / allocated) is not used as spending utilisation."
    )
    notes.append("MPLADS: allocated_cr is the source's allocatedAmount; no separate funds-released figure is published, none is derived.")
    notes.append("MPLADS: works_count.sanctioned is null because the source publishes no sanctioned count.")
    notes.append("MPLADS: annual_entitlement_cr is null; the scheme guideline figure is not yet cited from an official source.")
    if block["works_is_partial"]:
        notes.append(f"MPLADS: works list is partial ({len(works)} of {rec_count} recommended works captured).")
    if rec.get("works_sample_count") is not None and rec_count is not None and rec["works_sample_count"] != rec_count:
        notes.append(
            f"MPLADS: the works endpoint returned {rec['works_sample_count']} rows but the profile reports {rec_count} recommended works."
        )
    return block, source_values, notes


def main() -> None:
    """Normalise MPLADS for every registered state whose MPLADS source is cleared.

    A state without a cleared source (e.g. Goa) gets no mplads.<key>.json; 06_merge.py
    then writes a pending block with the registry's reason. Nothing is fetched here.
    """
    for state in states.selected(description=__doc__.split("\n")[0]):
        if not state.mplads_source:
            print(f"{state.name}: no cleared MPLADS source; block stays pending")
            continue
        intake_state(state)


def intake_state(state: "states.State") -> None:
    primary_path = latest_capture(f"mplads.{state.key}.empoweredindian.*.json")
    cross_path = latest_capture(f"mplads.{state.key}.janwatchdog.*.csv")
    output = ROOT / "data" / "processed" / f"mplads.{state.key}.json"
    master = normalise.identity_master(state, normalise.latest_sansad_capture(state.key))["records"]
    if primary_path is None:
        raise SystemExit(f"no Empowered Indian MPLADS capture for {state.name} found in data/raw/")
    primary = json.loads(primary_path.read_text(encoding="utf-8"))
    primary_rel = primary_path.relative_to(ROOT).as_posix()
    cross_rel = cross_path.relative_to(ROOT).as_posix() if cross_path else None
    by_seat = {(state.key, normalise.constituency_key(r["constituency"])): r for r in primary["records"]}
    cross = load_cross_check(cross_path, state.key)

    seats: dict[str, dict] = {}
    for mp in master:
        seat = (normalise.state_key(mp["state"]), normalise.constituency_key(mp["constituency"]))
        slug = f"{seat[1]}-{seat[0]}"
        rec = by_seat.pop(seat, None)
        if rec is None:
            seats[slug] = {"block": None, "source_values": None, "notes": ["MPLADS: no Empowered Indian record matched on state + constituency."]}
            continue
        block, values, notes = build_block(rec, primary_rel)
        ei_name = (rec.get("mp_profile") or {}).get("name") or rec.get("official_name")
        if ei_name and normalise.name_key(ei_name) != normalise.name_key(mp["name"]):
            notes.append(f"MPLADS: Empowered Indian name spelling '{ei_name}' differs from '{mp['name']}'; joined on constituency.")
        row = cross.pop(seat, None)
        if row is not None:
            block["cross_check"].append(cross_check_block(row, block, cross_rel))
            if normalise.name_key(row["mp_name"]) != normalise.name_key(mp["name"]):
                notes.append(f"MPLADS: JanWatchdog name spelling '{row['mp_name']}' differs from '{mp['name']}'; joined on constituency.")
        seats[slug] = {"block": block, "source_values": values, "notes": notes}

    payload = {
        "primary_capture": primary_rel,
        "cross_check_capture": cross_rel,
        "unmatched_primary": [r.get("constituency") for r in by_seat.values()],
        "unmatched_cross_check": [r.get("constituency") for r in cross.values()],
        "seats": seats,
    }
    output.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{state.name}: normalised MPLADS for {sum(1 for s in seats.values() if s['block'])}/{len(seats)} seats from {primary_rel} -> {output}")


if __name__ == "__main__":
    main()
