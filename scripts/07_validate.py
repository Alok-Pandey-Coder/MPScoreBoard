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
MPLADS_NORMALISED = ROOT / "data" / "processed" / "mplads.delhi.json"
MPLADS_STATUSES = {"reported", "pending", "not_applicable"}
WORK_STATUSES = {"recommended", "sanctioned", "in_progress", "completed", "other"}
MPLADS_KEYS = {
    "status", "annual_entitlement_cr", "allocated_cr", "recommended_amount_cr", "expenditure_cr", "unspent_cr",
    "expenditure_pct", "recommended_pct", "works_count", "works", "works_is_partial", "as_of", "source",
    "cross_check", "review_status",
}
WORK_KEYS = {
    "work_id", "description", "category", "implementing_agency", "status", "status_raw", "recommended_on",
    "completed_on", "recommended_amount_cr", "final_amount_cr", "paid_cr", "has_image",
}
CROSS_KEYS = {"source", "as_of", "allocated_cr", "expenditure_cr", "works_recommended", "works_sanctioned", "works_completed", "differences"}
MONEY_FIELDS = ("annual_entitlement_cr", "allocated_cr", "recommended_amount_cr", "expenditure_cr", "unspent_cr")
WORK_MONEY_FIELDS = ("recommended_amount_cr", "final_amount_cr", "paid_cr")
# Computed percentages vs the source's own percentages (same definition), in points.
PCT_TOLERANCE = 1.0
CROSS_CHECK_MONEY_TOLERANCE = 0.05
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


def validate_mplads(who: str, m: dict, source_values: dict | None) -> tuple[list[str], list[str]]:
    """Return (errors, warnings) for one MPLADS block against the types/mp.ts contract."""
    errors: list[str] = []
    warnings: list[str] = []
    if m.get("status") not in MPLADS_STATUSES:
        return [f"{who}: unknown MPLADS status '{m.get('status')}'."], warnings
    extra = set(m) - MPLADS_KEYS
    if extra:
        errors.append(f"{who}: MPLADS block has keys outside the contract: {sorted(extra)}.")
    if m["status"] != "reported":
        return errors, warnings
    if not m.get("source") or not m["source"].get("url") or not m.get("as_of"):
        errors.append(f"{who}: reported MPLADS lacks a source URL or as-of date.")
    for field in MONEY_FIELDS:
        value = m.get(field)
        if value is not None and value < 0:
            errors.append(f"{who}: MPLADS {field} is negative ({value}).")
    for field in ("expenditure_pct", "recommended_pct"):
        value = m.get(field)
        if value is not None and not 0 <= value <= 100:
            errors.append(f"{who}: MPLADS {field} {value} outside 0-100.")
    allocated, unspent = m.get("allocated_cr"), m.get("unspent_cr")
    if allocated is not None and unspent is not None and unspent > allocated:
        errors.append(f"{who}: MPLADS unspent {unspent} exceeds allocated {allocated}.")
    counts = m.get("works_count") or {}
    for field, value in counts.items():
        if value is not None and value < 0:
            errors.append(f"{who}: MPLADS works_count.{field} is negative.")
    works = m.get("works") or []
    recommended = counts.get("recommended")
    if recommended is not None and len(works) > recommended:
        errors.append(f"{who}: {len(works)} MPLADS works listed but only {recommended} recommended.")
    ids = [w.get("work_id") for w in works]
    dupes = sorted({i for i in ids if ids.count(i) > 1})
    if dupes:
        errors.append(f"{who}: duplicate MPLADS work_id(s) {dupes}.")
    for w in works:
        if set(w) != WORK_KEYS:
            errors.append(f"{who}: MPLADS work {w.get('work_id')} keys differ from the contract.")
        if not isinstance(w.get("work_id"), str):
            errors.append(f"{who}: MPLADS work_id {w.get('work_id')!r} is not a string.")
        if w.get("status") not in WORK_STATUSES:
            errors.append(f"{who}: MPLADS work {w.get('work_id')} has unknown status '{w.get('status')}'.")
        for field in WORK_MONEY_FIELDS:
            if w.get(field) is not None and w[field] < 0:
                errors.append(f"{who}: MPLADS work {w.get('work_id')} {field} is negative.")
    expected_partial = recommended is not None and len(works) < recommended
    if bool(m.get("works_is_partial")) != expected_partial:
        errors.append(f"{who}: MPLADS works_is_partial is {m.get('works_is_partial')} but {len(works)} of {recommended} works are listed.")
    if m.get("works_is_partial"):
        warnings.append(f"{who}: MPLADS works list is partial ({len(works)} of {recommended} recommended works).")
    for check in m.get("cross_check") or []:
        if set(check) != CROSS_KEYS:
            errors.append(f"{who}: MPLADS cross_check keys differ from the contract.")
        if not check.get("source") or not check["source"].get("url") or not check.get("as_of"):
            errors.append(f"{who}: MPLADS cross_check lacks a source URL or as-of date.")
        for field, ours in (("allocated_cr", allocated), ("expenditure_cr", m.get("expenditure_cr"))):
            theirs = check.get(field)
            if theirs is not None and ours:
                rel = abs(theirs - ours) / ours
                if rel > CROSS_CHECK_MONEY_TOLERANCE:
                    name = check["source"]["name"].split(" (")[0]
                    warnings.append(f"{who}: MPLADS {field} {ours} vs {name} {theirs} ({rel * 100:.1f}% apart).")
    if source_values:
        def compare(label, computed, published):
            if computed is not None and published is not None and abs(computed - published) > PCT_TOLERANCE:
                warnings.append(f"{who}: MPLADS computed {label} {computed} vs source {round(published, 2)}.")

        compare("expenditure_pct", m.get("expenditure_pct"), source_values.get("expenditure_pct"))
        if source_values.get("utilization_definition") == "recommended_amount":
            compare("recommended_pct", m.get("recommended_pct"), source_values.get("utilization_pct"))
        else:
            warnings.append(
                f"{who}: source utilisation definition is '{source_values.get('utilization_definition')}'; recommended_pct not reconciled."
            )
    return errors, warnings


def mplads_table(records: list, seats: dict) -> list[str]:
    lines = [
        "| Seat | Allocated (Rs cr) | Spent (Rs cr) | Expenditure % | Recommended % | Works listed / recommended | Source % (exp / rec) | Cross-check differences |",
        "|---|---|---|---|---|---|---|---|",
    ]
    for r in records:
        m = r["mplads"]
        if m["status"] != "reported":
            lines.append(f"| {r['constituency']} | {m['status']} | | | | | | |")
            continue
        sv = (seats.get(r["slug"]) or {}).get("source_values") or {}
        src = " / ".join("n/a" if sv.get(k) is None else f"{sv[k]:.1f}" for k in ("expenditure_pct", "utilization_pct"))
        diffs = "; ".join(d for c in m.get("cross_check") or [] for d in c["differences"]) or "none"
        recommended = (m.get("works_count") or {}).get("recommended")
        lines.append(
            f"| {r['constituency']} | {m['allocated_cr']} | {m['expenditure_cr']} | {m['expenditure_pct']} | {m['recommended_pct']} | "
            f"{len(m.get('works') or [])} / {recommended} | {src} | {diffs} |"
        )
    return lines


def main() -> None:
    records = json.loads(INPUT.read_text(encoding="utf-8"))
    master = json.loads(MASTER.read_text(encoding="utf-8"))["records"]
    expected_states = {row["state"] for row in master}
    errors: list[str] = []
    warnings: list[str] = []
    mplads_seats = json.loads(MPLADS_NORMALISED.read_text(encoding="utf-8"))["seats"] if MPLADS_NORMALISED.exists() else {}

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

        seat_values = (mplads_seats.get(row["slug"]) or {}).get("source_values")
        m_errors, m_warnings = validate_mplads(who, row.get("mplads") or {"status": None}, seat_values)
        errors.extend(m_errors)
        warnings.extend(m_warnings)

        aff = row.get("affidavit", {})
        if aff.get("status") == "reported":
            if not aff.get("source") or not aff["source"].get("url") or not aff.get("as_of"):
                errors.append(f"{who}: reported affidavit lacks a source URL or as-of date.")
            if aff.get("assets") is not None and aff["assets"] < 0:
                errors.append(f"{who}: affidavit assets cannot be negative.")
            if aff.get("liabilities") is not None and aff["liabilities"] < 0:
                errors.append(f"{who}: affidavit liabilities cannot be negative.")
            if aff.get("declared_criminal_cases") is not None and aff["declared_criminal_cases"] < 0:
                errors.append(f"{who}: affidavit declared criminal cases cannot be negative.")
            if aff.get("election_year") != 2024:
                errors.append(f"{who}: affidavit election year is '{aff.get('election_year')}'.")

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
        "## MPLADS",
        "",
        "Primary: Empowered Indian (aggregating MoSPI eSAKSHI), review status `secondary_only`. "
        "Expenditure % = spent / allocated; recommended % = recommended amount / allocated; both computed from the "
        "rupee amounts. Source % columns are Empowered Indian's `expenditurePercentage` and `utilizationPercentage` "
        "(the latter defined as recommended / allocated). Descriptive only, not a ranking.",
        "",
        *mplads_table(records, mplads_seats),
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
