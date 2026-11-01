"""Extract one state's Lok Sabha constituency polygons from the cached DataMeet capture.

Source: data/raw/india_pc_2019_simplified.geojson (DataMeet, CC-BY-4.0). Goa's two
constituencies are unchanged since 2019, so the 2019 boundaries apply to the 18th Lok Sabha.
Output: data/processed/<state>_pc.geojson, read by /api/geojson?state=<state>.

Usage: python scripts/build_state_pc_geojson.py goa
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW_PATH = ROOT / "data" / "raw" / "india_pc_2019_simplified.geojson"
RETRIEVED_AT = "2026-10-31"  # date of the raw capture
SOURCE = "DataMeet india_pc_2019_simplified.geojson (CC-BY-4.0)"

STATES = {"goa": "Goa"}


def rings(geometry):
    polys = geometry["coordinates"] if geometry["type"] == "MultiPolygon" else [geometry["coordinates"]]
    for poly in polys:
        yield from poly


def main(key: str) -> None:
    name = STATES[key]
    data = json.loads(RAW_PATH.read_text(encoding="utf-8"))
    features = []
    for f in data["features"]:
        p = f["properties"]
        if p.get("st_name") != name:
            continue
        pts = [pt for ring in rings(f["geometry"]) for pt in ring]
        lngs, lats = [pt[0] for pt in pts], [pt[1] for pt in pts]
        features.append({
            "type": "Feature",
            "properties": {
                "slug": f"{p['pc_name'].lower().replace(' ', '-')}-{key}",
                "pc_name": p["pc_name"],
                "pc_no": p["pc_no"],
                "state": name,
                "reservation": p.get("pc_category"),
                # [lat, lng] of the bounding-box centre, for labels only.
                "center": [round((min(lats) + max(lats)) / 2, 4), round((min(lngs) + max(lngs)) / 2, 4)],
                "source": SOURCE,
                "retrieved_at": RETRIEVED_AT,
            },
            "geometry": f["geometry"],
        })
    if not features:
        sys.exit(f"No features found for {name}")
    out = ROOT / "data" / "processed" / f"{key}_pc.geojson"
    out.write_text(json.dumps({
        "type": "FeatureCollection",
        "name": f"{name}_Lok_Sabha_Constituencies",
        "source": SOURCE,
        "retrieved_at": RETRIEVED_AT,
        "features": features,
    }, ensure_ascii=False), encoding="utf-8")
    print(f"Saved {len(features)} features -> {out}")
    for f in features:
        print("  ", f["properties"]["slug"], f["properties"]["center"])


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "goa")
