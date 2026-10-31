"""Run the reviewed Delhi data pipeline without deleting approved outputs."""

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STEPS = [
    "03_parse_prs.py",
    "05_normalise.py",
    "09_intake_mplads.py",
    "06_merge.py",
    "07_validate.py",
    "08_snapshot.py",
]


def main() -> None:
    for step in STEPS:
        result = subprocess.run([sys.executable, str(ROOT / "scripts" / step)], cwd=ROOT)
        if result.returncode:
            raise SystemExit(result.returncode)
    print("Delhi data build completed")


if __name__ == "__main__":
    main()
