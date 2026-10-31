"""Cache the Delhi PRS profile pages listed in the reviewed raw manifest."""

import json
from datetime import date
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"


def main() -> None:
    manifest = json.loads((RAW / "prs.delhi.json").read_text(encoding="utf-8"))
    target = RAW / f"prs.delhi.{date.today().isoformat()}"
    target.mkdir(exist_ok=True)
    for row in manifest["records"]:
        request = Request(
            row["source_url"],
            headers={"User-Agent": "MeraMPDataCollector/0.1"},
        )
        try:
            with urlopen(request, timeout=30) as response:
                body = response.read()
        except Exception as error:
            print(f"failed {row['name']}: {error}")
            continue
        output = target / f"{row['name'].lower().replace(' ', '-')}.html"
        output.write_bytes(body)
        print(f"saved {row['name']} ({len(body)} bytes)")


if __name__ == "__main__":
    main()
