"""Crawl PRS 18th Lok Sabha directory pages (pages 0..61) to produce the All-India
PRS MP manifest with profile links, constituency, state, party, and card metrics.

Saves:
    data/raw/prs.india.manifest.json (immutable raw capture)
"""

from __future__ import annotations

import json
import re
import sys
from datetime import date
from pathlib import Path
from bs4 import BeautifulSoup

from polite_fetch import fetch_bytes

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
OUT = RAW / f"prs.india.manifest.{date.today().isoformat()}.json"

BASE_URL = "https://prsindia.org/mptrack/18-lok-sabha?page="
TOTAL_PAGES = 62  # 0 to 61 inclusive


def get_html(url: str) -> str:
    # Honest user agent and PRS's robots.txt Crawl-delay (10 s) via polite_fetch.
    return fetch_bytes(url).decode("utf-8", errors="ignore")


def parse_page(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    records = []
    cards = soup.find_all("div", class_="views-row")

    for c in cards:
        name_div = c.find("div", class_="views-field-title-field")
        name = name_div.get_text(strip=True) if name_div else ""
        if not name:
            continue

        link_tag = c.find("a", href=re.compile(r"/mptrack/18th-lok-sabha/"))
        detail_path = link_tag["href"] if link_tag else ""
        detail_url = f"https://prsindia.org{detail_path}" if detail_path.startswith("/") else detail_path

        party_div = c.find("div", class_="views-field-field-political-party")
        party = party_div.get_text(strip=True) if party_div else ""

        state_div = c.find("div", class_="views-field-field-net-revenue-railway")
        state = state_div.get_text(strip=True) if state_div else ""

        const_div = c.find("div", class_="views-field-php")
        constituency = const_div.get_text(strip=True) if const_div else ""

        age_div = c.find("div", class_="views-field-php-1")
        age_text = age_div.get_text(strip=True) if age_div else ""
        age_match = re.search(r"\d+", age_text)
        age = int(age_match.group(0)) if age_match else None

        # Hover stats
        debates = None
        questions = None
        pmbs = None

        debates_div = c.find("div", class_="views-field-field-author")
        if debates_div:
            txt = debates_div.find("div", class_="field-content")
            if txt and txt.get_text(strip=True).isdigit():
                debates = int(txt.get_text(strip=True))

        questions_div = c.find("div", class_="views-field-field-total-expenses-railway")
        if questions_div:
            txt = questions_div.find("div", class_="field-content")
            if txt and txt.get_text(strip=True).isdigit():
                questions = int(txt.get_text(strip=True))

        pmb_div = c.find("div", class_="views-field-field-source")
        if pmb_div:
            txt = pmb_div.find("div", class_="field-content")
            if txt and txt.get_text(strip=True).isdigit():
                pmbs = int(txt.get_text(strip=True))

        records.append({
            "name": name,
            "party": party,
            "state": state,
            "constituency": constituency,
            "age": age,
            "debates_card": debates,
            "questions_card": questions,
            "private_member_bills_card": pmbs,
            "source_url": detail_url,
        })

    return records


def main() -> None:
    if OUT.exists():
        sys.exit(f"{OUT.name} already exists. Delete to re-crawl.")

    print(f"Starting PRS 18th Lok Sabha all-India crawl across {TOTAL_PAGES} pages...")
    all_mps = []

    for page in range(TOTAL_PAGES):
        url = f"{BASE_URL}{page}"
        try:
            html = get_html(url)
            page_records = parse_page(html)
            all_mps.extend(page_records)
            print(f"  Page {page:02d}/{TOTAL_PAGES - 1}: {len(page_records)} MPs (Total: {len(all_mps)})")
        except Exception as e:
            print(f"  ERROR on page {page}: {e}")

    capture = {
        "source": {
            "name": "PRS Legislative Research MP Track 18th Lok Sabha Directory",
            "base_url": "https://prsindia.org/mptrack/18-lok-sabha",
            "retrieved_at": date.today().isoformat(),
            "total_pages": TOTAL_PAGES,
            "records_count": len(all_mps),
        },
        "records": all_mps,
    }

    OUT.write_text(json.dumps(capture, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"\nFinished: Successfully saved {len(all_mps)} MPs to {OUT}")


if __name__ == "__main__":
    main()

