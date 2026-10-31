"""Hybrid data refresh: fetch → build → check against official records → diff → report.

The website never fetches live. This job produces a *candidate* snapshot plus a
report of what changed; a human reviews it (a pull request in CI) before it is
published. Rules from AGENTS.md:

- Raw captures are new dated files; earlier captures are never edited.
- A source that fails keeps its last good capture (fetchers are all-or-nothing).
- If validation fails, the approved processed files are restored untouched.
- Identity changes (new MP, party, minister status, removed seat) and failed
  official checks are marked NEEDS REVIEW; activity number changes are listed
  with old → new values and source dates.

Usage (from the repository root):
    python scripts/refresh.py              # fetch, build, check, report
    python scripts/refresh.py --no-fetch   # rebuild and report from cached captures
Outputs data/processed/refresh_report.md and refresh_report.json. Exit code 0
on success (with or without changes), 1 if the build or validation failed.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"
RAW = ROOT / "data" / "raw"
PROCESSED = ROOT / "data" / "processed"
MPS = PROCESSED / "mps.json"
REPORT_MD = PROCESSED / "refresh_report.md"
REPORT_JSON = PROCESSED / "refresh_report.json"

# Sources refreshed automatically. Affidavits and election results change only at
# elections; MPLADS access is not cleared (docs/decisions.md), so it is excluded.
FETCHERS = [
    {"source": "Digital Sansad member API (official)", "script": "01_fetch_sansad_members.py"},
    {"source": "Govt of NCT of Delhi MP list (official)", "script": "01_fetch_masterlist.py"},
    {"source": "PRS MP Track (CC BY 4.0)", "script": "02_fetch_prs.py"},
]

# Processed files the build rewrites; restored if the build fails.
BUILD_OUTPUTS = ["mps.json", "snapshot.json", "validation_report.md", "normalised.delhi.json", "prs.parsed.delhi.json", "mplads.delhi.json"]

IDENTITY_FIELDS = ["name", "party", "constituency", "reservation", "is_minister", "special_role", "since_date", "image_url"]
PERFORMANCE_FIELDS = ["status", "attendance_pct", "debates", "questions", "private_member_bills", "as_of"]

ALIASES = json.loads((PROCESSED / "aliases.json").read_text(encoding="utf-8"))


# ── normalisation (same conventions as 05_normalise.py) ──────────────────────

def _key(value: str | None) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (value or "").lower()).strip()


def seat_key(constituency: str | None) -> str:
    canonical = ALIASES["constituency"].get((constituency or "").strip().lower(), constituency or "")
    return _key(re.sub(r"\((sc|st)\)", "", canonical, flags=re.I))


def name_key(name: str | None) -> str:
    canonical = ALIASES["mp"].get((name or "").strip().lower(), name or "")
    return _key(re.sub(r"^(shri|smt|dr|km)\.?\s+", "", canonical, flags=re.I))


# ── official-record checks ───────────────────────────────────────────────────

def official_checks(mps: list[dict], sansad_latest: dict | None, sansad_previous: dict | None) -> list[dict]:
    """Compares the candidate records with the latest official Sansad capture."""
    checks: list[dict] = []
    if not sansad_latest:
        return [{"level": "review", "check": "sansad_capture", "detail": "No Digital Sansad capture available to check against."}]

    official = {seat_key(r.get("constName")): r for r in sansad_latest.get("records", [])}
    for mp in mps:
        row = official.get(seat_key(mp["constituency"]))
        label = f"{mp['constituency']} ({mp['slug']})"
        if row is None:
            checks.append({"level": "review", "check": "seat_on_sansad", "seat": mp["slug"],
                           "detail": f"{label}: no sitting member found on Digital Sansad (possible vacancy or by-election)."})
            continue
        if (row.get("status") or "").strip().lower() != "sitting":
            checks.append({"level": "review", "check": "member_status", "seat": mp["slug"],
                           "detail": f"{label}: Sansad status is '{row.get('status')}', not 'Sitting'."})
        if name_key(row.get("mpFirstLastName")) != name_key(mp["name"]):
            checks.append({"level": "review", "check": "member_name", "seat": mp["slug"],
                           "detail": f"{label}: card shows '{mp['name']}', Sansad shows '{row.get('mpFirstLastName')}'."})
        if (row.get("partySname") or "").strip() != (mp.get("party") or "").strip():
            checks.append({"level": "review", "check": "member_party", "seat": mp["slug"],
                           "detail": f"{label}: card party '{mp.get('party')}', Sansad party '{row.get('partySname')}'."})

    seats = {seat_key(mp["constituency"]) for mp in mps}
    for key, row in official.items():
        if key not in seats:
            checks.append({"level": "review", "check": "seat_missing_from_cards",
                           "detail": f"Sansad lists {row.get('constName')} ({row.get('mpFirstLastName')}) but no card exists."})

    if sansad_previous:
        before = {seat_key(r.get("constName")): name_key(r.get("mpFirstLastName")) for r in sansad_previous.get("records", [])}
        after = {seat_key(r.get("constName")): name_key(r.get("mpFirstLastName")) for r in sansad_latest.get("records", [])}
        for key in sorted(set(before) | set(after)):
            if before.get(key) != after.get(key):
                checks.append({"level": "review", "check": "sansad_membership_changed",
                               "detail": f"Seat '{key}': member changed on Sansad between captures ({before.get(key)} → {after.get(key)})."})

    if not checks:
        checks.append({"level": "ok", "check": "official_records",
                       "detail": f"All {len(mps)} seats match the sitting member, name and party on Digital Sansad "
                                 f"({sansad_latest.get('source', {}).get('retrieved_at', 'date unknown')})."})
    return checks


def page_text_hash(html: bytes) -> str:
    """Hash of visible text only, so markup or script churn does not count as a change."""
    text = re.sub(rb"<(script|style)[\s\S]*?</\1>", b" ", html, flags=re.I)
    text = re.sub(rb"<[^>]+>", b" ", text)
    return hashlib.sha256(re.sub(rb"\s+", b" ", text).strip()).hexdigest()


def roster_page_check(captures: list[Path]) -> dict:
    if len(captures) < 2:
        return {"level": "ok", "check": "roster_page", "detail": "Only one capture of the Delhi MP list page; nothing to compare yet."}
    prev, last = captures[-2], captures[-1]
    if page_text_hash(prev.read_bytes()) == page_text_hash(last.read_bytes()):
        return {"level": "ok", "check": "roster_page", "detail": f"Delhi MP list page unchanged ({prev.name} → {last.name})."}
    return {"level": "review", "check": "roster_page",
            "detail": f"Delhi MP list page text changed ({prev.name} → {last.name}). Review data/raw/masterlist.delhi.json."}


# ── snapshot diff ────────────────────────────────────────────────────────────

def diff_snapshots(old: list[dict], new: list[dict]) -> dict:
    """Field-level changes between the approved and candidate records, by slug."""
    old_by, new_by = {m["slug"]: m for m in old}, {m["slug"]: m for m in new}
    review, updated = [], []
    for slug in sorted(set(old_by) - set(new_by)):
        review.append({"seat": slug, "field": "record", "old": "present", "new": "removed"})
    for slug in sorted(set(new_by) - set(old_by)):
        review.append({"seat": slug, "field": "record", "old": "absent", "new": "added"})
    for slug in sorted(set(old_by) & set(new_by)):
        before, after = old_by[slug], new_by[slug]
        # Any field that vanishes (e.g. data added by hand outside the pipeline) needs a person to look.
        for field in sorted(set(before) - set(after)):
            review.append({"seat": slug, "field": field, "old": "present", "new": "missing after rebuild"})
        for field in IDENTITY_FIELDS:
            if before.get(field) != after.get(field):
                review.append({"seat": slug, "field": field, "old": before.get(field), "new": after.get(field)})
        bp, ap = before.get("performance") or {}, after.get("performance") or {}
        for field in PERFORMANCE_FIELDS:
            if bp.get(field) != ap.get(field):
                change = {"seat": slug, "field": f"performance.{field}", "old": bp.get(field), "new": ap.get(field)}
                # A value disappearing (number → null) is suspicious, not a routine update.
                (review if ap.get(field) is None and bp.get(field) is not None else updated).append(change)
        for block in ("mplads", "affidavit", "election"):
            if before.get(block) != after.get(block):
                review.append({"seat": slug, "field": block, "old": "changed", "new": "changed (not part of the automatic refresh; check why)"})
    return {"review": review, "updated": updated}


# ── orchestration ────────────────────────────────────────────────────────────

def run(script: str) -> tuple[int, str]:
    proc = subprocess.run([sys.executable, str(SCRIPTS / script)], cwd=ROOT, capture_output=True, text=True)
    return proc.returncode, (proc.stdout + proc.stderr).strip()


def approved_records() -> list[dict]:
    """The last committed mps.json is the approved baseline; the file on disk otherwise."""
    try:
        out = subprocess.run(["git", "show", "HEAD:data/processed/mps.json"], cwd=ROOT, capture_output=True, text=True, check=True)
        return json.loads(out.stdout)
    except (subprocess.CalledProcessError, FileNotFoundError, json.JSONDecodeError):
        return json.loads(MPS.read_text(encoding="utf-8"))


def latest_two(pattern: str) -> tuple[dict | None, dict | None]:
    files = sorted(RAW.glob(pattern))
    load = lambda p: json.loads(p.read_text(encoding="utf-8"))
    return (load(files[-1]) if files else None, load(files[-2]) if len(files) > 1 else None)


def render_markdown(report: dict) -> str:
    lines = [
        "# Data refresh report", "",
        f"Run at {report['run_at']} · build: **{report['build']}** · "
        f"needs review: **{len(report['needs_review'])}** · updated values: **{len(report['updated'])}**", "",
        "Nothing here is published until a person reviews and merges it.", "",
        "## Fetch results", "", "| Source | Result |", "|---|---|",
    ]
    lines += [f"| {f['source']} | {f['result']} |" for f in report["fetch"]] or ["| (fetch skipped) | — |"]
    lines += ["", "## Official record checks", ""]
    lines += [f"- {'🔴 REVIEW' if c['level'] == 'review' else '✅'} {c['detail']}" for c in report["official_checks"]]
    lines += ["", "## Needs review", ""]
    lines += [f"- 🔴 `{c['seat']}` **{c['field']}**: {c['old']!r} → {c['new']!r}" for c in report["needs_review"]] or ["- None"]
    lines += ["", "## Updated values", ""]
    lines += [f"- `{c['seat']}` {c['field']}: {c['old']!r} → {c['new']!r}" for c in report["updated"]] or ["- None"]
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--no-fetch", action="store_true", help="skip network fetches; rebuild from cached captures")
    args = parser.parse_args()

    report: dict = {"run_at": datetime.now(timezone.utc).isoformat(timespec="seconds"), "fetch": []}
    if not args.no_fetch:
        for fetcher in FETCHERS:
            code, output = run(fetcher["script"])
            last = output.splitlines()[-1] if output else ""
            report["fetch"].append({"source": fetcher["source"], "ok": code == 0,
                                    "result": ("✅ " if code == 0 else "⚠️ kept previous capture — ") + last})

    approved = approved_records()
    backup = Path(tempfile.mkdtemp(prefix="refresh-backup-"))
    for name in BUILD_OUTPUTS:
        if (PROCESSED / name).exists():
            shutil.copy2(PROCESSED / name, backup / name)
    try:
        code, output = run("build_data.py")
        if code != 0:
            for name in BUILD_OUTPUTS:
                if (backup / name).exists():
                    shutil.copy2(backup / name, PROCESSED / name)
            report.update(build="FAILED — approved data restored", build_log=output[-4000:],
                          official_checks=[], needs_review=[{"seat": "-", "field": "build", "old": "", "new": "validation failed; see build_log"}], updated=[])
        else:
            candidate = json.loads(MPS.read_text(encoding="utf-8"))
            sansad_latest, sansad_previous = latest_two("sansad.members.delhi.*.json")
            checks = official_checks(candidate, sansad_latest, sansad_previous)
            checks.append(roster_page_check(sorted(RAW.glob("delhi_members.*.html"))))
            diff = diff_snapshots(approved, candidate)
            report.update(build="passed validation", official_checks=checks,
                          needs_review=diff["review"] + [
                              {"seat": c.get("seat", "-"), "field": c["check"], "old": "", "new": c["detail"]}
                              for c in checks if c["level"] == "review"],
                          updated=diff["updated"])
    finally:
        shutil.rmtree(backup, ignore_errors=True)

    REPORT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False, default=str) + "\n", encoding="utf-8")
    REPORT_MD.write_text(render_markdown(report), encoding="utf-8")
    changed = bool(report["needs_review"] or report["updated"])
    print(f"build: {report['build']} · needs review: {len(report['needs_review'])} · updated: {len(report['updated'])}")
    print(f"report -> {REPORT_MD}")

    # Tell CI whether a pull request is worth opening.
    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as fh:
            fh.write(f"changed={'true' if changed else 'false'}\n")
    return 0 if report["build"] == "passed validation" else 1


if __name__ == "__main__":
    sys.exit(main())
