"""Tests for the multi-state pipeline: state registry, Delhi output unchanged, Goa identity
from Digital Sansad, pending blocks stay pending (never zeros), and refresh checks per state.
No network access."""

import copy
import importlib.util
import json
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
sys.path.insert(0, str(ROOT / "scripts"))

import states  # noqa: E402

METRICS = ("attendance_pct", "debates", "questions", "private_member_bills")
# Last commit before the multi-state pipeline; Delhi records must match it while the
# Delhi raw captures are unchanged.
PRE_MULTI_STATE_COMMIT = "54c0378"
DELHI_CAPTURES_AT_BASELINE = {
    "prs.delhi.*-*-*": "prs.delhi.2026-11-01",
    "sansad.members.delhi.*.json": "sansad.members.delhi.2026-11-01.json",
    "mplads.delhi.empoweredindian.*.json": "mplads.delhi.empoweredindian.2026-10-31.json",
    "mp_portraits.delhi.*.json": "mp_portraits.delhi.2026-11-01.json",
}


def load(script: str):
    spec = importlib.util.spec_from_file_location(script.replace(".py", "").lstrip("0123456789_"), ROOT / "scripts" / script)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


refresh = load("refresh.py")
normalise = load("05_normalise.py")
validate = load("07_validate.py")
snapshot = load("08_snapshot.py")
MPS = json.loads((ROOT / "data" / "processed" / "mps.json").read_text(encoding="utf-8"))
GOA = [m for m in MPS if m["state"] == "Goa"]
GOA_SANSAD = normalise.latest_sansad_capture("goa")


# ── registry ─────────────────────────────────────────────────────────────────

def test_registry_keys_names_and_masters():
    assert [s.key for s in states.STATES] == ["delhi", "goa"]
    delhi, goa = states.get("delhi"), states.get("goa")
    assert (delhi.name, delhi.sansad_state, delhi.identity_master, delhi.seats) == ("Delhi", "NCT of Delhi", "masterlist", 7)
    assert (goa.name, goa.sansad_state, goa.identity_master, goa.seats) == ("Goa", "Goa", "sansad", 2)
    assert delhi.mplads_source and not goa.mplads_source


def test_state_selection_from_command_line():
    assert states.selected([]) == states.STATES
    assert states.selected(["--state", "goa"]) == (states.get("goa"),)
    with pytest.raises(SystemExit):
        states.selected(["--state", "atlantis"])


def test_delhi_file_names_still_resolve():
    assert (RAW / "masterlist.delhi.json").exists() and (RAW / "prs.delhi.json").exists()
    assert sorted(RAW.glob("sansad.members.delhi.*.json")) and sorted(RAW.glob("prs.delhi.*-*"))


# ── combined export ──────────────────────────────────────────────────────────

def test_one_combined_export_sorted_by_slug():
    slugs = [m["slug"] for m in MPS]
    assert slugs == sorted(slugs) and len(set(slugs)) == len(slugs)
    for state in states.STATES:
        rows = [m for m in MPS if m["state"] == state.name]
        assert len(rows) == state.seats
        assert all(m["slug"].endswith(f"-{state.key}") for m in rows)


def test_snapshot_lists_every_state():
    meta = json.loads((ROOT / "data" / "processed" / "snapshot.json").read_text(encoding="utf-8"))
    assert meta["snapshot_version"] == snapshot.SNAPSHOT_VERSION == "18ls-v3"
    assert [(s["key"], s["records"]) for s in meta["states"]] == [("delhi", 7), ("goa", 2)]
    assert "Delhi" in meta["coverage"] and "Goa" in meta["coverage"]
    assert meta["record_count"] == len(MPS)


def _baseline_delhi() -> list[dict]:
    for pattern, name in DELHI_CAPTURES_AT_BASELINE.items():
        latest = sorted(RAW.glob(pattern))
        if not latest or latest[-1].name != name:
            pytest.skip(f"Delhi source {pattern} refreshed since the multi-state baseline")
    try:
        out = subprocess.run(
            ["git", "show", f"{PRE_MULTI_STATE_COMMIT}:data/processed/mps.json"],
            cwd=ROOT, capture_output=True, text=True, encoding="utf-8", check=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        pytest.skip(f"baseline commit {PRE_MULTI_STATE_COMMIT} not available (shallow clone?)")
    return json.loads(out.stdout)


def test_delhi_records_unchanged_by_multi_state_pipeline():
    baseline = _baseline_delhi()
    current = {m["slug"]: m for m in MPS if m["state"] == "Delhi"}
    assert sorted(current) == sorted(m["slug"] for m in baseline)
    for record in baseline:
        assert current[record["slug"]] == record, record["slug"]  # field by field; key order ignored


# ── Goa ──────────────────────────────────────────────────────────────────────

def test_goa_slugs_and_identity_from_sansad():
    assert GOA_SANSAD is not None
    assert {m["slug"] for m in GOA} == {"north-goa-goa", "south-goa-goa"}
    official = {row["constName"]: row for row in GOA_SANSAD["records"]}
    for mp in GOA:
        row = official[mp["constituency"]]
        assert (mp["name"], mp["party"], mp["sansad_mpsno"], mp["sansad_status"]) == (
            row["mpFirstLastName"], row["partySname"], row["mpsno"], "Sitting")
        assert mp["sources"][0]["url"] == GOA_SANSAD["source"]["list_url"]
        assert all(s["url"] and s["retrieved_at"] for s in mp["sources"])
        assert any("identity master" in note for note in mp["normalisation_notes"])
        assert mp["reservation"] == "GEN"


def test_goa_identity_master_is_sansad():
    master = normalise.identity_master(states.get("goa"), GOA_SANSAD)
    assert master["source"]["url"].startswith("https://sansad.in/api_ls/member")
    assert {r["constituency"] for r in master["records"]} == {"North Goa", "South Goa"}
    assert all(r["state"] == "Goa" for r in master["records"])


def test_goa_minister_is_not_applicable_not_zero():
    north = next(m for m in GOA if m["slug"] == "north-goa-goa")
    assert north["is_minister"] is True
    assert north["performance"]["status"] == "not_applicable"
    assert all(north["performance"][f] is None for f in METRICS)


def test_goa_activity_matches_fresh_parse():
    parser = load("03_parse_prs.py")
    south = next(m for m in GOA if m["slug"] == "south-goa-goa")
    assert south["performance"]["status"] == "reported"
    reparsed = parser.parse_page(ROOT / south["performance"]["source"]["raw_file"])
    assert {f: south["performance"][f] for f in METRICS} == {f: reparsed["metrics"][f]["mp"] for f in METRICS}
    assert south["performance"]["source"]["licence"] == "CC BY 4.0"


@pytest.mark.parametrize("block", ["mplads", "election"])
def test_goa_pending_blocks_stay_pending_with_nulls(block):
    for mp in GOA:
        data = mp[block]
        assert data["status"] == "pending"
        assert all(v is None for k, v in data.items() if k not in validate.PENDING_META_KEYS)
        assert any(note.lower().startswith(block if block != "election" else "election") for note in mp["normalisation_notes"])
    assert validate.pending_block_errors("x", GOA[0]) == []


def test_goa_affidavit_reported_values():
    north = next(m for m in GOA if m["slug"] == "north-goa-goa")
    south = next(m for m in GOA if m["slug"] == "south-goa-goa")
    assert north["affidavit"]["status"] == "reported"
    assert north["affidavit"]["assets"] == 108683533
    assert north["affidavit"]["liabilities"] == 508675
    assert north["affidavit"]["declared_criminal_cases"] == 0
    assert "Dempo College" in north["affidavit"]["education"]
    assert south["affidavit"]["status"] == "reported"
    assert south["affidavit"]["assets"] == 52728999
    assert south["affidavit"]["liabilities"] == 379840
    assert south["affidavit"]["declared_criminal_cases"] == 1
    assert "Goa University" in south["affidavit"]["education"]


def test_zero_in_a_pending_block_is_a_hard_error():
    mp = copy.deepcopy(GOA[0])
    mp["election"]["votes"] = 0
    errors = validate.pending_block_errors("x", mp)
    assert len(errors) == 1 and all("must stay null" in e for e in errors)


# ── refresh official checks ──────────────────────────────────────────────────

def test_refresh_checks_every_state():
    checks = refresh.official_checks_all_states(MPS)
    assert {c["state"] for c in checks} == {s.name for s in states.STATES}
    assert all(c["level"] == "ok" for c in checks), checks
    assert any(c["state"] == "Goa" and c["check"] == "official_records" for c in checks)


def test_refresh_flags_goa_mismatch_and_vacancy():
    sansad = copy.deepcopy(GOA_SANSAD)
    sansad["records"][0]["partySname"] = "ABC"
    sansad["records"][1]["status"] = "Resigned"
    found = {c["check"] for c in refresh.official_checks(GOA, sansad, None, "Goa")}
    assert {"member_party", "member_status"} <= found


def test_refresh_flags_missing_goa_cards():
    checks = refresh.official_checks([], GOA_SANSAD, None, "Goa")
    assert checks[0]["level"] == "review" and "Goa" in checks[0]["detail"]


def test_refresh_fetches_each_state():
    sources = [f["source"] for f in refresh.FETCHERS]
    assert any("Sansad" in s and "Goa" in s for s in sources)
    assert any("PRS" in s and "Goa" in s for s in sources)
    assert all("empowered" not in f["script"].lower() for f in refresh.FETCHERS)
    assert {"normalised.goa.json", "prs.parsed.goa.json"} <= set(refresh.BUILD_OUTPUTS)
