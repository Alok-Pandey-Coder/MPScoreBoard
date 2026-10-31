"""Cache the official Delhi government MP list page as a dated raw capture.

The pipeline reads the reviewed transcription data/raw/masterlist.delhi.json,
not this HTML. The refresh compares each new capture with the previous one and
flags a change for human review instead of re-parsing it automatically.
"""

from datetime import date
from pathlib import Path

from polite_fetch import fetch_bytes

ROOT = Path(__file__).resolve().parents[1]
URL = "https://delhi.gov.in/members-of-parliament"


def main() -> None:
    output = ROOT / "data" / "raw" / f"delhi_members.{date.today().isoformat()}.html"
    if output.exists():
        print(f"{output.name} already exists; raw captures are immutable. Nothing fetched.")
        return
    body = fetch_bytes(URL)
    output.write_bytes(body)
    print(f"saved {len(body)} bytes -> {output}")


if __name__ == "__main__":
    main()
