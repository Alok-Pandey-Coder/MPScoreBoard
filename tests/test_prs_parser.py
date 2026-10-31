"""Tests for the PRS parser and the Delhi export, run against cached raw captures."""

import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CAPTURE = ROOT / "data" / "raw" / "prs.delhi.2026-10-30"
METRICS = ("attendance_pct", "debates", "questions", "private_member_bills")


def load(script: str):
    spec = importlib.util.spec_from_file_location(script.replace(".py", ""), ROOT / "scripts" / script)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


parser = load("03_parse_prs.py")
normalise = load("05_normalise.py")


def test_selected_mp_value_not_national_average():
    record = parser.parse_page(CAPTURE / "bansuri-swaraj.html")
    debates = record["metrics"]["debates"]
    assert debates["mp"] == 17
    assert debates["national_average"] == 21.5
    assert debates["state_average"] == 20.2


def test_profile_fields():
    record = parser.parse_page(CAPTURE / "yogender-chandolia.html")
    assert record["party"] == "Bharatiya Janata Party"
    assert record["state"] == "Delhi"
    assert record["constituency"] == "North West Delhi"
    assert record["coverage_from"] == "24-06-2024"
    assert record["coverage_to"] == "13-08-2026"
    assert record["metrics"]["attendance_pct"]["mp"] == 97
    assert record["metrics"]["questions"]["mp"] == 271


def test_minister_metrics_are_not_zero():
    record = parser.parse_page(CAPTURE / "harsh-malhotra.html")
    assert record["is_minister"] is True
    assert record["performance_status"] == "not_applicable"
    # The page prints 0 for debates/questions, which must not become a real zero.
    assert record["metrics"]["debates"]["raw"]["mp"] == "0"
    assert all(record["metrics"][field]["mp"] is None for field in METRICS)


def test_export_matches_fresh_parse():
    records = json.loads((ROOT / "data" / "processed" / "mps.json").read_text(encoding="utf-8"))
    for row in records:
        perf = row["performance"]
        if perf["status"] != "reported":
            continue
        reparsed = parser.parse_page(ROOT / perf["source"]["raw_file"])
        assert {f: perf[f] for f in METRICS} == {f: reparsed["metrics"][f]["mp"] for f in METRICS}, row["slug"]


def test_constituency_key_ignores_reservation_suffix():
    assert normalise.constituency_key("North West Delhi (SC)") == normalise.constituency_key("North West Delhi")
    assert normalise.name_key("Manoj Tiwari") == normalise.name_key("Manoj Kumar Tiwari")


def test_iso_date():
    assert normalise.iso_date("09-06-2024") == "2024-06-09"
    assert normalise.iso_date("In Office") is None


def test_identity_cross_checked_with_sansad():
    records = json.loads((ROOT / "data" / "processed" / "mps.json").read_text(encoding="utf-8"))
    assert all(row["sansad_mpsno"] and row["identity_review_status"] == "cross_checked" for row in records)
    reservations = {row["slug"]: row["reservation"] for row in records}
    assert reservations["north-west-delhi-delhi"] == "SC"
    assert list(reservations.values()).count("GEN") == 6
