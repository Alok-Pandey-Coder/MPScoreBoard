import json
import math
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IN_GEOJSON = ROOT / "data" / "raw" / "india_pc_2019_simplified.geojson"
OUT_JSON = ROOT / "public" / "india_real_svg_map.json"

cos22 = math.cos(math.radians(22.0)) # ~0.92718

scale = 880.0 / 30.4 # ~28.947
offset_x = 105.0
offset_y = 55.0

def project(lng, lat):
    x = offset_x + (lng - 68.1) * cos22 * scale
    y = offset_y + (37.1 - lat) * scale
    return round(x, 1), round(y, 1)

def distance_point_to_line(p, start, end):
    if start == end:
        return math.hypot(p[0] - start[0], p[1] - start[1])
    n = abs((end[1] - start[1]) * p[0] - (end[0] - start[0]) * p[1] + end[0] * start[1] - end[1] * start[0])
    d = math.hypot(end[1] - start[1], end[0] - start[0])
    return n / d if d > 0 else 0

def douglas_peucker(pts, tol=0.025):
    if len(pts) <= 2:
        return pts
    dmax, index = 0, 0
    for i in range(1, len(pts) - 1):
        d = distance_point_to_line(pts[i], pts[0], pts[-1])
        if d > dmax:
            index, dmax = i, d
    if dmax > tol:
        left = douglas_peucker(pts[:index + 1], tol)
        right = douglas_peucker(pts[index:], tol)
        return left[:-1] + right
    else:
        return [pts[0], pts[-1]]

def ring_to_svg(ring, tol=0.025):
    simp = douglas_peucker(ring, tol)
    if len(simp) < 3:
        return ""
    pts = [project(p[0], p[1]) for p in simp]
    cmd = f"M {pts[0][0]} {pts[0][1]}"
    for p in pts[1:]:
        cmd += f" L {p[0]} {p[1]}"
    cmd += " Z"
    return cmd

def geom_to_svg(geom, tol=0.025):
    t = geom["type"]
    coords = geom["coordinates"]
    parts = []
    if t == "Polygon":
        for ring in coords:
            s = ring_to_svg(ring, tol)
            if s:
                parts.append(s)
    elif t == "MultiPolygon":
        for poly in coords:
            for ring in poly:
                s = ring_to_svg(ring, tol)
                if s:
                    parts.append(s)
    return " ".join(parts)

# State mapping helper
STATE_NORM = {
    "Uttar Pradesh": ("uttar-pradesh", "UP", "central"),
    "Maharashtra": ("maharashtra", "MH", "west"),
    "West Bengal": ("west-bengal", "WB", "east"),
    "Bihar": ("bihar", "BR", "east"),
    "Tamil Nadu": ("tamil-nadu", "TN", "south"),
    "Madhya Pradesh": ("madhya-pradesh", "MP", "central"),
    "Karnataka": ("karnataka", "KA", "south"),
    "Gujarat": ("gujarat", "GJ", "west"),
    "Rajasthan": ("rajasthan", "RJ", "west"),
    "Andhra Pradesh": ("andhra-pradesh", "AP", "south"),
    "Orissa": ("odisha", "OD", "east"),
    "Kerala": ("kerala", "KL", "south"),
    "Telangana": ("telangana", "TS", "south"),
    "Assam": ("assam", "AS", "northeast"),
    "Jharkhand": ("jharkhand", "JH", "east"),
    "Punjab": ("punjab", "PB", "north"),
    "Chhattisgarh": ("chhattisgarh", "CG", "central"),
    "Haryana": ("haryana", "HR", "north"),
    "Delhi": ("delhi", "DL", "delhi"),
    "Jammu & Kashmir": ("jammu-kashmir", "JK", "north"),
    "Uttarakhand": ("uttarakhand", "UK", "north"),
    "Himachal Pradesh": ("himachal-pradesh", "HP", "north"),
    "Arunachal Pradesh": ("arunachal-pradesh", "AR", "northeast"),
    "Manipur": ("manipur", "MN", "northeast"),
    "Tripura": ("tripura", "TR", "northeast"),
    "Meghalaya": ("meghalaya", "ML", "northeast"),
    "Goa": ("goa", "GA", "west"),
    "Sikkim": ("sikkim", "SK", "northeast"),
    "Nagaland": ("nagaland", "NL", "northeast"),
    "Mizoram": ("mizoram", "MZ", "northeast"),
    "Puducherry": ("puducherry", "PY", "south"),
    "Chandigarh": ("chandigarh", "CH", "north"),
    "Daman & Diu": ("dadra-daman-diu", "DN", "west"),
    "Dadra & Nagar Haveli": ("dadra-daman-diu", "DN", "west"),
    "Andaman & Nicobar": ("andaman-nicobar", "AN", "south"),
    "Lakshadweep": ("lakshadweep", "LD", "south"),
}

def main():
    print(f"Reading {IN_GEOJSON}...")
    with open(IN_GEOJSON, encoding="utf-8") as f:
        data = json.load(f)

    # Group features by normalized state ID
    state_features = defaultdict(list)
    state_centroids = defaultdict(lambda: [0.0, 0.0, 0])

    for feat in data["features"]:
        props = feat["properties"]
        raw_st = props["st_name"]
        pc_name = props["pc_name"]

        # Separate Ladakh if in J&K
        if raw_st == "Jammu & Kashmir" and pc_name.lower() == "ladakh":
            st_id = "ladakh"
            st_name = "Ladakh"
            st_code = "LA"
            region = "north"
        else:
            norm = STATE_NORM.get(raw_st, (raw_st.lower().replace(" ", "-"), raw_st[:2].upper(), "north"))
            st_id, st_code, region = norm
            st_name = raw_st if raw_st != "Orissa" else "Odisha"

        # Calculate centroid contribution
        geom = feat["geometry"]
        coords = geom["coordinates"]
        pts_list = []
        def get_pts(c):
            if isinstance(c[0], (int, float)):
                pts_list.append(c)
            else:
                for sub in c:
                    get_pts(sub)
        get_pts(coords)
        for p in pts_list:
            px, py = project(p[0], p[1])
            state_centroids[st_id][0] += px
            state_centroids[st_id][1] += py
            state_centroids[st_id][2] += 1

        state_features[st_id].append({
            "pc_name": pc_name,
            "pc_no": props.get("pc_no"),
            "path": geom_to_svg(geom, tol=0.035),
            "st_name": st_name,
            "st_code": st_code,
            "region": region,
        })

    # Build final state list
    states_output = []
    total_seats_check = 0

    for st_id, feats in state_features.items():
        st_name = feats[0]["st_name"]
        st_code = feats[0]["st_code"]
        region = feats[0]["region"]
        seats = len(feats)
        total_seats_check += seats

        # Centroid
        c = state_centroids[st_id]
        cx = round(c[0] / c[2], 1) if c[2] > 0 else 500.0
        cy = round(c[1] / c[2], 1) if c[2] > 0 else 500.0

        # Combine all constituency paths
        combined_path = " ".join(f["path"] for f in feats if f["path"])

        states_output.append({
            "id": st_id,
            "name": st_name,
            "code": st_code,
            "region": region,
            "seats": seats,
            "centroid": [cx, cy],
            "path": combined_path,
        })

    print(f"Generated {len(states_output)} states with total {total_seats_check} seats.")
    OUT_JSON.write_text(json.dumps(states_output, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Saved to {OUT_JSON} ({OUT_JSON.stat().st_size // 1024} KB)")

if __name__ == "__main__":
    main()

