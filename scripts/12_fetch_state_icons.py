"""Fetch an outline monument/landmark icon for every state and union territory.

Usage: python scripts/12_fetch_state_icons.py

Icons come from open-source sets served by the Iconify API (https://api.iconify.design):
IconOven and Hugeicons, both MIT licensed, both 24px stroke outlines so they read as one
family. Each SVG is saved to public/icons/states/<state-id>.svg and recorded in
data/processed/state_icons.json with its icon id, source URL, licence, author and retrieval
date. Requests go through polite_fetch (robots.txt, crawl delay).

Where the set has the state's best-known landmark (India Gate, Taj Mahal, a gopuram, a
gurdwara, a stupa, a minaret) that icon is used; otherwise a thematic one (a palace, a
waterfall, a rhino, a lighthouse). The label in ICONS says what each one stands for.
"""

import json
from datetime import date
from pathlib import Path

from polite_fetch import fetch_bytes

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "icons" / "states"
MANIFEST = ROOT / "data" / "processed" / "state_icons.json"
API = "https://api.iconify.design"

LICENCES = {
    "iconoven": {"name": "IconOven", "author": "Appic Marketing", "licence": "MIT", "url": "https://iconoven.com/icons"},
    "hugeicons": {"name": "Hugeicons", "author": "Hugeicons", "licence": "MIT", "url": "https://hugeicons.com"},
}

# state id -> (icon id, what it stands for)
ICONS = {
    "delhi": ("hugeicons:india-gate", "India Gate"),
    "uttar-pradesh": ("hugeicons:taj-mahal", "Taj Mahal"),
    "maharashtra": ("iconoven:taj-arch", "Arched gateway (Gateway of India)"),
    "west-bengal": ("iconoven:capitol-dome", "Domed memorial (Victoria Memorial)"),
    "bihar": ("iconoven:buddhist-temple", "Buddhist temple (Mahabodhi)"),
    "tamil-nadu": ("iconoven:gopuram-tower", "Gopuram (Dravidian temple tower)"),
    "madhya-pradesh": ("iconoven:stupa", "Stupa (Sanchi)"),
    "karnataka": ("iconoven:palace", "Palace (Mysore Palace)"),
    "gujarat": ("iconoven:statue", "Statue (Statue of Unity)"),
    "rajasthan": ("iconoven:fortress", "Fort"),
    "andhra-pradesh": ("iconoven:temple-hindu", "Hindu temple (Tirupati)"),
    "odisha": ("iconoven:temple", "Temple (Konark)"),
    "kerala": ("iconoven:palm-tree", "Palm tree (backwaters and coast)"),
    "telangana": ("iconoven:minaret", "Minaret (Charminar)"),
    "assam": ("iconoven:rhino", "One-horned rhino"),
    "jharkhand": ("iconoven:elephant", "Elephant (forests)"),
    "punjab": ("iconoven:gurdwara", "Gurdwara (Golden Temple)"),
    "chhattisgarh": ("iconoven:waterfall", "Waterfall (Chitrakote)"),
    "haryana": ("iconoven:ruins", "Ancient ruins (Kurukshetra)"),
    "jammu-kashmir": ("iconoven:peak-snow", "Snow peak"),
    "uttarakhand": ("iconoven:place-of-worship", "Himalayan shrine (Kedarnath)"),
    "himachal-pradesh": ("iconoven:mountain-range", "Mountain range"),
    "tripura": ("iconoven:pavilion", "Pavilion (Ujjayanta Palace)"),
    "manipur": ("iconoven:lotus", "Lotus (Loktak Lake)"),
    "meghalaya": ("iconoven:cave", "Caves (Mawsmai)"),
    "goa": ("iconoven:church", "Church (Basilica of Bom Jesus)"),
    "sikkim": ("iconoven:buddhist-monastery", "Buddhist monastery (Rumtek)"),
    "nagaland": ("iconoven:memorial-wreath", "Memorial wreath (Kohima War Cemetery)"),
    "mizoram": ("iconoven:mountain", "Hills"),
    "arunachal-pradesh": ("iconoven:buddha-statue", "Buddha statue (Tawang)"),
    "chandigarh": ("iconoven:government-building", "Capitol complex"),
    "puducherry": ("iconoven:lighthouse", "Lighthouse"),
    "andaman-nicobar": ("iconoven:watchtower", "Watchtower (Cellular Jail)"),
    "lakshadweep": ("iconoven:island", "Island"),
    "dadra-daman-diu": ("iconoven:castle", "Fort (Diu Fort)"),
    "ladakh": ("iconoven:monastery", "Monastery (Thiksey)"),
}


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    today = date.today().isoformat()
    entries = {}
    for state_id, (icon, label) in ICONS.items():
        prefix, name = icon.split(":")
        url = f"{API}/{prefix}/{name}.svg"
        svg = fetch_bytes(url)
        if not svg.lstrip().startswith(b"<svg"):
            raise SystemExit(f"{state_id}: {url} did not return an SVG")
        (OUT_DIR / f"{state_id}.svg").write_bytes(svg)
        meta = LICENCES[prefix]
        entries[state_id] = {
            "icon": icon,
            "label": label,
            "file": f"/icons/states/{state_id}.svg",
            "source_url": url,
            "set": meta["name"],
            "author": meta["author"],
            "licence": meta["licence"],
            "retrieved_at": today,
        }
        print(f"{state_id}: {icon}")
    MANIFEST.write_text(
        json.dumps(
            {
                "description": "Outline landmark icon per state card (open-source icon sets via Iconify). Built by scripts/12_fetch_state_icons.py; files in public/icons/states/.",
                "sets": LICENCES,
                "icons": entries,
            },
            indent=2,
            ensure_ascii=False,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"{len(entries)} icons -> {MANIFEST}")


if __name__ == "__main__":
    main()
