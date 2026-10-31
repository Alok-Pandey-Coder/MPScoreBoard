"""Write snapshot metadata and a content hash for the processed Delhi export."""

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "data" / "processed" / "mps.json"
OUTPUT = ROOT / "data" / "processed" / "snapshot.json"


def main() -> None:
    content = INPUT.read_bytes()
    records = json.loads(content)
    metadata = {
        "snapshot_version": "delhi-18ls-v2",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "record_count": len(records),
        "sha256": hashlib.sha256(content).hexdigest(),
        "pipeline": "scripts/03_parse_prs.py -> scripts/05_normalise.py -> scripts/06_merge.py -> scripts/07_validate.py",
        "coverage": "Delhi, seven Lok Sabha constituencies",
        "source_status": {
            "identity": "collected",
            "prs": "parsed from cached HTML; manual live check pending",
            "mplads": "pending",
            "affidavit": "pending",
            "eci": "pending",
        },
    }
    OUTPUT.write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
    print(f"snapshot metadata -> {OUTPUT}")


if __name__ == "__main__":
    main()
