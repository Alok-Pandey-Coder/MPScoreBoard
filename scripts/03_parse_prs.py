"""Parse cached PRS MP Track profile pages into structured records.

Reads the newest `data/raw/prs.<state>.<date>/` capture of each registered
state (scripts/states.py; `--state KEY` limits it) and never edits it. Writes
`data/processed/prs.parsed.<state>.json`.
Only the "Selected MP" value is taken as the MP's metric; PRS national and
state averages are kept separately for reconciliation.
"""

import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import states  # noqa: E402

RAW = ROOT / "data" / "raw"
PROCESSED = ROOT / "data" / "processed"
STATE = "delhi"  # default for callers that pass no state (kept for compatibility)

MINISTER_BANNER = "This MP is a minister."
METRICS = {
    "attendance_pct": "Attendance",
    "debates": "No. of Debates",
    "questions": "No. of Questions",
    "private_member_bills": "Private Member's Bills",
}
PROFILE_FIELDS = {
    "state": "State",
    "constituency": "Constituency",
    "party": "Party",
    "nature_of_membership": "Nature of membership",
    "term_start": "Start of Term",
    "term_end": "End of Term",
    "term_number": "No. of Term",
    "age": "Age",
    "gender": "Gender",
    "education": "Education",
}
# Each profile value runs until the next "<label> :" or section heading.
PROFILE_STOPS = [rf"{re.escape(label)} :" for label in PROFILE_FIELDS.values()]
SECTION_STOPS = ["Personal Profile", "Parliamentary Activity"]


def page_text(markup: str) -> str:
    markup = re.sub(r"<(script|style)\b.*?</\1>", " ", markup, flags=re.S | re.I)
    text = html.unescape(re.sub(r"<[^>]+>", " ", markup))
    return re.sub(r"\s+", " ", text.replace("\xa0", " ")).strip()


def number_or_none(raw: str | None) -> float | int | None:
    if raw is None or not re.fullmatch(r"\d+(\.\d+)?", raw):
        return None
    value = float(raw)
    return int(value) if value.is_integer() else value


def parse_profile(text: str) -> dict:
    stops = "|".join([*PROFILE_STOPS, *SECTION_STOPS])
    profile = {}
    for field, label in PROFILE_FIELDS.items():
        match = re.search(rf"{re.escape(label)} : (.*?)(?= (?:{stops})|$)", text)
        value = match.group(1).strip() if match else None
        # PRS appends sibling counts such as "Delhi ( 6 more MPs )".
        profile[field] = re.sub(r"\s*\(\s*\d+ more MPs\s*\)$", "", value) if value else None
    return profile


def parse_metrics(text: str, is_minister: bool) -> dict:
    activity = text.split("Parliamentary Activity", 1)[-1].split("Detailed Information", 1)[0]
    metrics = {}
    for field, label in METRICS.items():
        match = re.search(
            rf"{re.escape(label)} Selected MP (\S+)(?: %)? National Average (\S+)(?: %)? State Average (\S+)",
            activity,
        )
        raw = match.groups() if match else (None, None, None)
        metrics[field] = {
            "raw": {"mp": raw[0], "national_average": raw[1], "state_average": raw[2]},
            # Ministers are excluded by PRS; their page shows 0/N/A, which is not a real value.
            "mp": None if is_minister else number_or_none(raw[0]),
            "national_average": number_or_none(raw[1]),
            "state_average": number_or_none(raw[2]),
        }
    return metrics


def parse_page(path: Path) -> dict:
    markup = path.read_text(encoding="utf-8", errors="replace")
    text = page_text(markup)
    url = re.search(r'og:url"\s+content="([^"]+)"', markup)
    coverage = re.search(r"Data corresponds to the period from (\S+) to (\S+?)\.", text)
    name = re.search(r"Data corresponds to the period from \S+ to \S+?\. (.*?) State : ", text)
    is_minister = MINISTER_BANNER in text
    return {
        "file": path.relative_to(ROOT).as_posix() if path.is_relative_to(ROOT) else path.as_posix(),
        "source_url": url.group(1) if url else None,
        "name": name.group(1).strip() if name else None,
        **parse_profile(text),
        "is_minister": is_minister,
        "performance_status": "not_applicable" if is_minister else "reported",
        "coverage_from": coverage.group(1) if coverage else None,
        "coverage_to": coverage.group(2) if coverage else None,
        "metrics": parse_metrics(text, is_minister),
        "licence": "CC BY 4.0" if "Creative Commons Attribution 4.0" in text else None,
    }


def latest_capture(state_key: str = STATE) -> Path:
    captures = sorted(path for path in RAW.glob(f"prs.{state_key}.*") if path.is_dir())
    if not captures:
        raise SystemExit(f"no PRS capture found for {state_key}")
    return captures[-1]


def main() -> None:
    for state in states.selected(description=__doc__.split("\n")[0]):
        parse_state(state.key)


def parse_state(state_key: str) -> None:
    capture = latest_capture(state_key)
    records = [parse_page(path) for path in sorted(capture.glob("*.html"))]
    output = {
        "source": {
            "name": "PRS Legislative Research MP Track",
            "url": "https://prsindia.org/mptrack/18th-lok-sabha",
            "capture": capture.relative_to(ROOT).as_posix(),
            "retrieved_at": capture.name.rsplit(".", 1)[-1],
            "parser": "scripts/03_parse_prs.py",
        },
        "records": records,
    }
    target = PROCESSED / f"prs.parsed.{state_key}.json"
    target.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"parsed {len(records)} PRS pages from {capture.name} -> {target}")


if __name__ == "__main__":
    main()
