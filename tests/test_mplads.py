"""Tests for MPLADS normalisation (09_intake_mplads.py), validation and the exported contract."""

import hashlib
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MPS = ROOT / "data" / "processed" / "mps.json"


def load(script: str):
    spec = importlib.util.spec_from_file_location(script.replace(".py", "").lstrip("0123456789_"), ROOT / "scripts" / script)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


intake = load("09_intake_mplads.py")
validate = load("07_validate.py")


def profile(**overrides) -> dict:
    base = {
        "name": "Test MP",
        "allocatedAmount": 147470276,
        "totalExpenditure": 26487847,
        "totalRecommendedAmount": 64665415.63,
        "utilizationPercentage": 43.8497963006457,
        "utilizationDefinition": "recommended_amount",
        "expenditurePercentage": 17.961481946368636,
        "recommendedWorksCount": 3,
        "completedWorksCount": 1,
        "pendingWorks": 2,
        "unspentAmount": 120982429,
    }
    base.update(overrides)
    return base


def work(work_id, status="recommended", **extra) -> dict:
    return {"workId": work_id, "workDescription": f"Work {work_id}", "workCategory": "Normal/Others", "ida": "IDA", "status": status, **extra}


def capture(works, **profile_overrides) -> dict:
    return {
        "constituency": "Chandni Chowk",
        "mp_profile": profile(**profile_overrides),
        "works_sample_count": len(works),
        "works": works,
        "source_url": "https://empoweredindian.in/mps/x",
        "retrieved_at": "2026-10-31",
    }


def test_percentages_computed_from_amounts_not_source_utilisation():
    block, values, _ = intake.build_block(capture([work(1)]), "raw.json")
    assert block["expenditure_pct"] == 18.0  # 26487847 / 147470276
    assert block["recommended_pct"] == 43.8  # 64665415.63 / 147470276
    assert values["utilization_pct"] == 43.8497963006457  # kept for validation only
    assert "utilisation_pct" not in block and "funds_released" not in block


def test_rupees_converted_to_crore():
    block, _, _ = intake.build_block(capture([work(1, recommendedAmount=2918400, totalPaid=0)]), "raw.json")
    assert block["allocated_cr"] == 14.747
    assert block["expenditure_cr"] == 2.6488
    assert block["unspent_cr"] == 12.0982
    assert block["works"][0]["recommended_amount_cr"] == 0.2918
    assert block["works"][0]["paid_cr"] == 0.0  # a published zero stays zero


def test_no_sanctioned_assumption_and_no_entitlement_default():
    block, _, _ = intake.build_block(capture([work(1)]), "raw.json")
    assert block["works_count"]["sanctioned"] is None
    assert block["works_count"]["recommended"] == 3
    assert block["annual_entitlement_cr"] is None
    assert block["review_status"] == "secondary_only"


def test_partial_flag():
    partial, _, notes = intake.build_block(capture([work(1), work(2)]), "raw.json")
    assert partial["works_is_partial"] is True
    assert any("partial" in n for n in notes)
    full, _, _ = intake.build_block(capture([work(1), work(2), work(3)]), "raw.json")
    assert full["works_is_partial"] is False


def test_null_preservation():
    block, _, _ = intake.build_block(
        capture([work(1, status="completed", completedDate="2026-08-06T00:00:00.000Z", finalAmount=639562)], totalExpenditure=None),
        "raw.json",
    )
    assert block["expenditure_cr"] is None
    assert block["expenditure_pct"] is None
    w = block["works"][0]
    assert w["recommended_amount_cr"] is None and w["paid_cr"] is None and w["recommended_on"] is None
    assert w["completed_on"] == "2026-08-06"
    assert w["has_image"] is None
    assert intake.pct(5, 0) is None and intake.to_crore("") is None


def test_work_mapping_and_sort():
    works = [
        work(5, status="completed", completedDate="2026-01-01T00:00:00.000Z"),
        work(10, recommendationDate="2026-06-24T00:00:00.000Z"),
        work(2, recommendationDate="2026-06-24T00:00:00.000Z"),
        work(7, status="Under Progress", recommendationDate="2026-07-01T00:00:00.000Z"),
    ]
    block, _, _ = intake.build_block(capture(works, recommendedWorksCount=4), "raw.json")
    assert [w["work_id"] for w in block["works"]] == ["7", "2", "10", "5"]
    assert block["works"][0]["status"] == "in_progress" and block["works"][0]["status_raw"] == "Under Progress"
    assert intake.map_status("weird") == "other"


def test_latest_capture_picked(tmp_path):
    for day in ("2026-10-31", "2026-11-02", "2026-11-01"):
        (tmp_path / f"mplads.delhi.empoweredindian.{day}.json").write_text("{}")
    assert intake.latest_capture("mplads.delhi.empoweredindian.*.json", tmp_path).name.endswith("2026-11-02.json")


def test_cross_check_differences():
    block, _, _ = intake.build_block(capture([work(1)]), "raw.json")
    row = {
        "allocated_crore_inr": "14.75", "spent_crore_inr": "2.95", "works_recommended_count": "3",
        "works_sanctioned_count": "2", "works_completed_count": "1", "source_snapshot_date": "2026-10-06",
    }
    check = intake.cross_check_block(row, block, "raw.csv")
    assert check["allocated_cr"] == 14.75 and check["works_sanctioned"] == 2
    assert any(d.startswith("Expenditure differs") for d in check["differences"])
    assert not any(d.startswith("Allocated") for d in check["differences"])
    assert not any(d.startswith("Works recommended") for d in check["differences"])


def test_validator_flags_hard_errors():
    block, values, _ = intake.build_block(capture([work(1), work(1)]), "raw.json")
    block["expenditure_pct"] = 120
    errors, _ = validate.validate_mplads("x", block, values)
    assert any("outside 0-100" in e for e in errors)
    assert any("duplicate" in e for e in errors)


def test_export_matches_contract():
    records = [r for r in json.loads(MPS.read_text(encoding="utf-8")) if r["state"] == "Delhi"]
    assert len(records) == 7
    for r in records:
        m = r["mplads"]
        assert set(m) == validate.MPLADS_KEYS
        for old in ("entitlement", "funds_released", "expenditure", "utilisation_pct", "unspent_balance"):
            assert old not in m
        errors, _ = validate.validate_mplads(r["slug"], m, None)
        assert errors == []
        assert m["works_count"]["sanctioned"] is None
        assert all(isinstance(w["work_id"], str) for w in m["works"])
        # Never the recommended share shown as spending.
        assert m["expenditure_pct"] != m["recommended_pct"]


def test_snapshot_hash_matches_export():
    snapshot = json.loads((ROOT / "data" / "processed" / "snapshot.json").read_text(encoding="utf-8"))
    assert snapshot["sha256"] == hashlib.sha256(MPS.read_bytes()).hexdigest()
    # Delhi MPLADS is reported; every other state stays pending until a source is cleared.
    records = json.loads(MPS.read_text(encoding="utf-8"))
    pending = sum(1 for r in records if r["mplads"]["status"] == "pending")
    assert pending == sum(1 for r in records if r["state"] != "Delhi")
    assert f"pending: {pending}" in snapshot["source_status"]["mplads"]
    assert "reported: 7" in snapshot["source_status"]["mplads"]


def test_states_without_mplads_source_stay_pending():
    for r in json.loads(MPS.read_text(encoding="utf-8")):
        if r["state"] == "Delhi":
            continue
        m = r["mplads"]
        assert m["status"] == "pending" and set(m) == validate.MPLADS_KEYS
        assert all(m[k] is None for k in m if k not in ("status", "works", "works_is_partial", "cross_check"))
        assert m["works"] == [] and m["cross_check"] == [] and m["works_is_partial"] is False
