"""Cache the official Delhi members page as a raw source capture."""

from datetime import date
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
URL = "https://delhi.gov.in/members-of-parliament"


def main() -> None:
    request = Request(URL, headers={"User-Agent": "MeraMPDataCollector/0.1"})
    with urlopen(request, timeout=30) as response:
        body = response.read()
    output = ROOT / "data" / "raw" / f"delhi_members.{date.today().isoformat()}.html"
    output.write_bytes(body)
    print(f"saved {len(body)} bytes -> {output}")


if __name__ == "__main__":
    main()
