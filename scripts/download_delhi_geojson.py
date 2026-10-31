"""Download DataMeet PC boundaries and extract Delhi Parliamentary Constituencies.

Source: DataMeet india_pc_2019_simplified.geojson (CC-BY-4.0)
Retrieval: network fetch — run with BypassSandbox: true
"""

import json
import sys
from pathlib import Path
import requests

ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "data" / "processed" / "delhi_pc_boundaries.geojson"
RAW_PATH = ROOT / "data" / "raw" / "india_pc_2019_simplified.geojson"

URL = "https://raw.githubusercontent.com/datameet/maps/master/parliamentary-constituencies/india_pc_2019_simplified.geojson"

# ------------------------------------------------------------------
# 1. Fetch (or reuse cached raw copy)
# ------------------------------------------------------------------
if RAW_PATH.exists():
    print(f"Using cached raw file: {RAW_PATH}", file=sys.stderr)
    data = json.loads(RAW_PATH.read_text(encoding="utf-8"))
else:
    print(f"Fetching {URL} ...", file=sys.stderr)
    r = requests.get(URL, stream=True, timeout=60)
    r.raise_for_status()
    raw_bytes = r.content
    RAW_PATH.write_bytes(raw_bytes)
    data = json.loads(raw_bytes.decode("utf-8"))
    print(f"Downloaded and cached {len(raw_bytes):,} bytes -> {RAW_PATH}", file=sys.stderr)

total = len(data["features"])
print(f"Total features in source: {total}", file=sys.stderr)

# ------------------------------------------------------------------
# 2. Inspect first feature's property keys (logged to stderr)
# ------------------------------------------------------------------
if total > 0:
    sample_props = data["features"][0].get("properties", {})
    print(f"Sample property keys: {list(sample_props.keys())}", file=sys.stderr)
    # Log as ASCII-safe
    safe_sample = {k: (v if isinstance(v, (int, float, bool, type(None))) else str(v).encode("ascii", "replace").decode("ascii"))
                   for k, v in sample_props.items()}
    print(f"Sample values (ASCII): {safe_sample}", file=sys.stderr)

# ------------------------------------------------------------------
# 3. Filter to Delhi
# ------------------------------------------------------------------
delhi_features = []
for f in data["features"]:
    props = f.get("properties", {})
    for v in props.values():
        if isinstance(v, str) and "delhi" in v.lower():
            delhi_features.append(f)
            break

print(f"Delhi features matched: {len(delhi_features)}", file=sys.stderr)

# ------------------------------------------------------------------
# 4. Add pc_slug derived from constituency name
# ------------------------------------------------------------------
SLUG_MAP = {
    "chandni chowk": "chandni-chowk-delhi",
    "east delhi": "east-delhi-delhi",
    "new delhi": "new-delhi-delhi",
    "north east delhi": "north-east-delhi-delhi",
    "north west delhi": "north-west-delhi-delhi",
    "south delhi": "south-delhi-delhi",
    "west delhi": "west-delhi-delhi",
}

for f in delhi_features:
    props = f.setdefault("properties", {})
    # Find the constituency name key — try common keys
    name_val = (props.get("pc_name") or props.get("PC_NAME") or props.get("NAME_1")
                or props.get("constituency") or props.get("Constituency_Name") or "")
    name_lower = str(name_val).lower().strip()
    props["pc_slug"] = SLUG_MAP.get(name_lower, name_lower.replace(" ", "-") + "-delhi")
    props["source"] = "DataMeet india_pc_2019_simplified.geojson (CC-BY-4.0)"
    props["retrieved_at"] = "2026-10-31"

# ------------------------------------------------------------------
# 5. Write output
# ------------------------------------------------------------------
if delhi_features:
    delhi_geojson = {
        "type": "FeatureCollection",
        "name": "Delhi_Lok_Sabha_Constituencies",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "source": "DataMeet india_pc_2019_simplified.geojson (CC-BY-4.0), filtered to Delhi",
        "retrieved_at": "2026-10-31",
        "features": delhi_features,
    }
    OUT_PATH.write_text(json.dumps(delhi_geojson, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Saved {len(delhi_features)} features -> {OUT_PATH}")
    # Log slugs
    for f in delhi_features:
        p = f.get("properties", {})
        slug = p.get("pc_slug", "?")
        name = p.get("PC_NAME") or p.get("NAME_1") or p.get("constituency") or "?"
        print(f"  {slug}: {name}")
else:
    print("ERROR: No Delhi features found. Inspect sample properties above.", file=sys.stderr)
    sys.exit(1)


