"""Tests for the hybrid refresh (scripts/refresh.py) and the polite fetcher. No network access."""

import copy
import importlib.util
import json
import sys
import urllib.robotparser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))  # refresh.py and fetchers import polite_fetch


def load(script: str):
    spec = importlib.util.spec_from_file_location(script.replace(".py", ""), ROOT / "scripts" / script)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


refresh = load("refresh.py")
polite = load("polite_fetch.py")
MPS = json.loads((ROOT / "data" / "processed" / "mps.json").read_text(encoding="utf-8"))
SANSAD = json.loads(sorted((ROOT / "data" / "raw").glob("sansad.members.delhi.*.json"))[-1].read_text(encoding="utf-8"))


# ── snapshot diff ────────────────────────────────────────────────────────────

def test_identical_snapshots_have_no_changes():
    assert refresh.diff_snapshots(MPS, copy.deepcopy(MPS)) == {"review": [], "updated": []}


def test_identity_change_needs_review():
    new = copy.deepcopy(MPS)
    new[0]["party"] = "XYZ"
    diff = refresh.diff_snapshots(MPS, new)
    assert diff["review"] == [{"seat": MPS[0]["slug"], "field": "party", "old": MPS[0]["party"], "new": "XYZ"}]


def test_activity_number_change_is_an_update_not_a_review():
    new = copy.deepcopy(MPS)
    seat = next(m for m in new if m["performance"]["status"] == "reported")
    seat["performance"]["questions"] = (seat["performance"]["questions"] or 0) + 5
    diff = refresh.diff_snapshots(MPS, new)
    assert diff["review"] == []
    assert diff["updated"][0]["field"] == "performance.questions"


def test_value_disappearing_needs_review():
    new = copy.deepcopy(MPS)
    seat = next(m for m in new if m["performance"]["status"] == "reported")
    seat["performance"]["attendance_pct"] = None
    assert refresh.diff_snapshots(MPS, new)["review"][0]["field"] == "performance.attendance_pct"


def test_field_lost_in_rebuild_needs_review():
    """Data added outside the pipeline (e.g. portraits) must not vanish silently."""
    old = copy.deepcopy(MPS)
    old[0]["hand_added_field"] = "x"
    fields = [c["field"] for c in refresh.diff_snapshots(old, MPS)["review"]]
    assert "hand_added_field" in fields


def test_removed_and_added_seats_need_review():
    diff = refresh.diff_snapshots(MPS, MPS[1:] + [{**MPS[0], "slug": "new-seat"}])
    assert {(c["seat"], c["new"]) for c in diff["review"]} == {(MPS[0]["slug"], "removed"), ("new-seat", "added")}


def test_portraits_are_carried_by_the_pipeline():
    assert all(m.get("image_url") and m.get("image_source", {}).get("url") for m in MPS)


# ── official checks ──────────────────────────────────────────────────────────

def test_current_records_match_official_sansad():
    checks = refresh.official_checks(MPS, SANSAD, None)
    assert [c["level"] for c in checks] == ["ok"]


def test_name_and_party_mismatch_flagged():
    sansad = copy.deepcopy(SANSAD)
    row = sansad["records"][0]
    row["mpFirstLastName"], row["partySname"] = "Someone Else", "ABC"
    found = {c["check"] for c in refresh.official_checks(MPS, sansad, None)}
    assert {"member_name", "member_party"} <= found


def test_vacancy_and_status_flagged():
    sansad = copy.deepcopy(SANSAD)
    sansad["records"][0]["status"] = "Resigned"
    dropped = sansad["records"].pop(1)
    checks = refresh.official_checks(MPS, sansad, None)
    found = {c["check"] for c in checks}
    assert {"member_status", "seat_on_sansad"} <= found
    assert any(dropped["constName"] in c["detail"] for c in checks)


def test_membership_change_between_captures_flagged():
    later = copy.deepcopy(SANSAD)
    later["records"][0]["mpFirstLastName"] = "New Member"
    assert any(c["check"] == "sansad_membership_changed" for c in refresh.official_checks(MPS, later, SANSAD))


def test_missing_official_capture_needs_review():
    assert refresh.official_checks(MPS, None, None)[0]["level"] == "review"


def test_page_hash_ignores_markup_and_scripts():
    a = b"<html><script>var t=1</script><p>Bansuri  Swaraj</p></html>"
    b = b"<html><script>var t=2</script><div class='x'>Bansuri Swaraj</div></html>"
    assert refresh.page_text_hash(a) == refresh.page_text_hash(b)
    assert refresh.page_text_hash(a) != refresh.page_text_hash(b"<p>Someone Else</p>")


# ── polite fetcher ───────────────────────────────────────────────────────────

def _robots(text: str) -> urllib.robotparser.RobotFileParser:
    parser = urllib.robotparser.RobotFileParser()
    parser.parse(text.splitlines())
    return parser


def test_crawl_delay_from_robots_is_honoured():
    assert polite._delay_for("prsindia.org", _robots("User-agent: *\nCrawl-delay: 10")) == 10
    assert polite._delay_for("sansad.in", None) == polite.MIN_DELAY_SECONDS


def test_disallowed_path_is_refused_without_a_request(monkeypatch):
    polite._robots["blocked.example"] = _robots("User-agent: *\nDisallow: /private")
    monkeypatch.setattr(polite, "urlopen", lambda *a, **k: (_ for _ in ()).throw(AssertionError("must not fetch")))
    try:
        polite.fetch_bytes("https://blocked.example/private/page")
        raise AssertionError("expected FetchBlocked")
    except polite.FetchBlocked:
        pass


def test_user_agent_is_honest():
    assert "Mozilla" not in polite.USER_AGENT and "MeraMP" in polite.USER_AGENT
