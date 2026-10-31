"""Validate the processed export and write an auditable report.

Hard errors fail the build; soft warnings are reported only. The expected seat
count and states come from the master list, not from constants in this file.
"""

import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "data" / "processed" / "mps.json"
MASTER = ROOT / "data" / "raw" / "masterlist.delhi.json"
REPORT = ROOT / "data" / "processed" / "validation_report.md"
TERM = "18th Lok Sabha"
METRICS = ("attendance_pct", "debates", "questions", "private_member_bills")
PERFORMANCE_STATUSES = {"reported", "not_applicable", "not_available"}
# Tolerance for computed vs PRS-published averages: PRS shows attendance as a
# whole percent and the counts to one decimal, so allow half of that step.
AVERAGE_TOLERANCE = {"attendance_pct": 0.5, "debates": 0.05, "questions": 0.05, "private_member_bills": 0.05}


def load_parser():
    spec = importlib.util.spec_from_file_location("parse_prs", ROOT / "scripts" / "03_parse_prs.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def mean(values: list) -> float | None:
    return sum(values) / len(values) if values else None


def main() -> None:
    records = json.loads(INPUT.read_text(encoding="utf-8"))
    master = json.loads(MASTER.read_text(encoding="utf-8"))["records"]
    expected_states = {row["state"] for row in master}
    errors: list[str] = []
    warnings: list[str] = []

    slugs = [row["slug"] for row in records]
    seats = [(row["state"], row["constituency"]) for row in records]
    if len(records) != len(master):
        errors.append(f"Expected {len(master)} records from the master list, found {len(records)}.")
    if len(set(slugs)) != len(slugs):
        errors.append("Duplicate slugs.")
    if len(set(seats)) != len(seats):
        errors.append("Duplicate state + constituency seats.")

    parser = load_parser()
    for row in records:
        who = f"{row.get('name')} ({row.get('slug')})"
        perf = row["performance"]
        for field in ("slug", "name", "constituency", "state", "party", "term"):
            if not row.get(field):
                errors.append(f"{who}: missing {field}.")
        if row["state"] not in expected_states:
            errors.append(f"{who}: state '{row['state']}' is not in the master list.")
        if row["term"] != TERM:
            errors.append(f"{who}: term is '{row['term']}'.")
        if not row["sources"] or any(not s.get("url") or not s.get("retrieved_at") for s in row["sources"]):
            errors.append(f"{who}: a source is missing its URL or retrieval date.")
        if any("mismatch" in note for note in row["normalisation_notes"]):
            errors.append(f"{who}: {'; '.join(row['normalisation_notes'])}")
        if row.get("sansad_status") not in (None, "Sitting"):
            errors.append(f"{who}: Sansad status is '{row['sansad_status']}'.")
        if row.get("sansad_mpsno") is None:
            warnings.append(f"{who}: no official Sansad member record.")
        if row.get("reservation") not in ("GEN", "SC", "ST"):
            errors.append(f"{who}: unknown reservation '{row.get('reservation')}'.")

        if perf["status"] not in PERFORMANCE_STATUSES:
            errors.append(f"{who}: unknown performance status '{perf['status']}'.")
        if row["is_minister"] and (perf["status"] != "not_applicable" or any(perf[f] is not None for f in METRICS)):
            errors.append(f"{who}: minister must have status not_applicable and null metrics.")
        if not row["is_minister"] and perf["status"] == "not_applicable":
            errors.append(f"{who}: non-minister marked not_applicable.")
        if perf["attendance_pct"] is not None and not 0 <= perf["attendance_pct"] <= 100:
            errors.append(f"{who}: attendance {perf['attendance_pct']} outside 0-100.")
        for field in METRICS[1:]:
            if perf[field] is not None and perf[field] < 0:
                errors.append(f"{who}: {field} is negative.")
        if perf["status"] == "reported":
            if not perf["source"] or not perf["source"].get("url") or not perf["as_of"]:
                errors.append(f"{who}: reported performance lacks a source URL or as-of date.")
            missing = [f for f in METRICS if perf[f] is None]
            if missing:
                warnings.append(f"{who}: reported performance has null {', '.join(missing)}.")
            # Regression: the export must equal a fresh parse of the raw capture.
            reparsed = parser.parse_page(ROOT / perf["source"]["raw_file"])
            for field in METRICS:
                if reparsed["metrics"][field]["mp"] != perf[field]:
                    errors.append(f"{who}: {field} is {perf[field]} but the raw capture parses to {reparsed['metrics'][field]['mp']}.")
        if perf["status"] == "not_available":
            warnings.append(f"{who}: no PRS performance record.")

    # Reconcile computed state averages (excluding ministers and nulls) with PRS-published ones.
    reconciliation = []
    for state in sorted(expected_states):
        rows = [r for r in records if r["state"] == state and r["performance"]["status"] == "reported"]
        published = next((r["performance"]["prs_averages"]["state"] for r in rows), None)
        for field in METRICS:
            values = [r["performance"][field] for r in rows if r["performance"][field] is not None]
            computed = mean(values)
            target = published[field] if published else None
            status = "n/a"
            if computed is not None and target is not None:
                status = "ok" if abs(computed - target) <= AVERAGE_TOLERANCE[field] else "DIFFERS"
                if status == "DIFFERS":
                    warnings.append(f"{state} {field}: computed average {computed:.2f} vs PRS {target}.")
            reconciliation.append(f"| {state} | {field} | {len(values)} | {computed if computed is None else round(computed, 2)} | {target} | {status} |")

    blocks = ("performance", "mplads", "affidavit", "election")
    status_lines = [
        f"| {block} | " + ", ".join(f"{s}: {n}" for s, n in sorted(_count(records, block).items())) + " |"
        for block in blocks
    ]
    lines = [
        "# Pipeline validation",
        "",
        "Generated by `scripts/07_validate.py` from `data/processed/mps.json`.",
        "",
        f"- Records: {len(records)} (master list: {len(master)})",
        f"- States: {', '.join(sorted(expected_states))}",
        f"- Unique slugs: {len(set(slugs))}",
        f"- Unique seats: {len(set(seats))}",
        f"- Ministers (performance not applicable): {sum(1 for r in records if r['is_minister'])}",
        f"- Hard errors: {len(errors)}",
        f"- Warnings: {len(warnings)}",
        "",
        "## Block status",
        "",
        "| Block | Status counts |",
        "|---|---|",
        *status_lines,
        "",
        "## State averages vs PRS published",
        "",
        "Computed over reported, non-minister records with non-null values.",
        "",
        "| State | Metric | N | Computed | PRS | Check |",
        "|---|---|---|---|---|---|",
        *reconciliation,
        "",
        "## Hard errors",
        "",
        *([f"- {e}" for e in errors] or ["- None"]),
        "",
        "## Warnings",
        "",
        *([f"- {w}" for w in warnings] or ["- None"]),
        "",
        "## Normalisation notes",
        "",
        *([f"- {r['slug']}: {note}" for r in records for note in r["normalisation_notes"]] or ["- None"]),
        "",
    ]
    REPORT.write_text("\n".join(lines), encoding="utf-8")
    print("\n".join(lines))
    if errors:
        raise SystemExit(f"validation failed with {len(errors)} hard error(s)")


def _count(records: list, block: str) -> dict:
    counts: dict = {}
    for row in records:
        status = row[block]["status"]
        counts[status] = counts.get(status, 0) + 1
    return counts


if __name__ == "__main__":
    main()
