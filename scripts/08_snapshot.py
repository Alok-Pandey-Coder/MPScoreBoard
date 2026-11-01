"""Write snapshot metadata and a content hash for the processed multi-state export.

`source_status` is derived from the block statuses and review statuses actually
present in `mps.json`, never hard-coded. `coverage` and `states` list every
registered state (scripts/states.py) with its record count.
"""

import hashlib
import json
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import states  # noqa: E402

SNAPSHOT_VERSION = "18ls-v3"
INPUT = ROOT / "data" / "processed" / "mps.json"
OUTPUT = ROOT / "data" / "processed" / "snapshot.json"
PIPELINE = (
    "scripts/03_parse_prs.py -> scripts/05_normalise.py -> scripts/09_intake_mplads.py -> "
    "scripts/06_merge.py -> scripts/07_validate.py -> scripts/08_snapshot.py"
)
# Snapshot key -> block name in each record.
BLOCKS = {"prs": "performance", "mplads": "mplads", "affidavit": "affidavit", "eci": "election"}


def _counts(values) -> str:
    return ", ".join(f"{k}: {n}" for k, n in sorted(Counter(values).items(), key=lambda kv: str(kv[0])))


def block_status(records: list, block: str) -> str:
    rows = [r.get(block) or {} for r in records]
    statuses = _counts(row.get("status") for row in rows)
    reported = [row for row in rows if row.get("status") == "reported"]
    if not reported:
        return f"{statuses} (no reported records)"
    reviews = sorted({str(row.get("review_status")) for row in reported})
    sources = sorted(
        {f"{(row.get('source') or {}).get('name')} {row.get('as_of') or (row.get('source') or {}).get('retrieved_at')}" for row in reported}
    )
    text = f"{'/'.join(reviews)} ({'; '.join(sources)}"
    checks = sorted(
        {f"{c['source']['name'].split(' (')[0]} {c.get('as_of')}" for row in reported for c in row.get("cross_check") or []}
    )
    if checks:
        text += f"; cross-check: {'; '.join(checks)}"
    return f"{text}) [{statuses}]"


def build_metadata(content: bytes) -> dict:
    records = json.loads(content)
    status = {"identity": f"{_counts(r.get('identity_review_status') for r in records)}"}
    status.update({key: block_status(records, block) for key, block in BLOCKS.items()})
    covered = [
        {"key": state.key, "name": state.name, "records": sum(1 for r in records if r.get("state") == state.name), "seats": state.seats}
        for state in states.STATES
    ]
    return {
        "snapshot_version": SNAPSHOT_VERSION,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "record_count": len(records),
        "sha256": hashlib.sha256(content).hexdigest(),
        "pipeline": PIPELINE,
        "coverage": "18th Lok Sabha: " + "; ".join(f"{s['name']} ({s['records']} of {s['seats']} seats)" for s in covered),
        "states": covered,
        "source_status": status,
    }


def main() -> None:
    metadata = build_metadata(INPUT.read_bytes())
    OUTPUT.write_text(json.dumps(metadata, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"snapshot metadata -> {OUTPUT}")


if __name__ == "__main__":
    main()
