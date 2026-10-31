"""MPLADS manual intake helper — validates and ingests MPLADS values into
delhi_7mp_custom_enrichment.json so the next `build_data.py` run picks them up.

Source: Empowered Indian (https://empoweredindian.in/mplads) or eSAKSHI
        Cite: Empowered Indian as data aggregator; primary source MoSPI/eSAKSHI.

Usage:
    Manually fill the MPLADS_DATA dict below with values from the dashboard,
    then run:
        python scripts/09_intake_mplads.py

The script will:
  1. Validate each entry (non-negative floats, utilisation 0-100)
  2. Merge into data/raw/delhi_7mp_custom_enrichment.json
  3. Print a summary of what changed
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ENRICHMENT = ROOT / "data" / "raw" / "delhi_7mp_custom_enrichment.json"

# ------------------------------------------------------------------
# FILL THIS IN from Empowered Indian / eSAKSHI dashboard
# Annual entitlement is Rs 5 crore per MP per year (18th LS: from Jun 2024)
# All monetary values in crores (Rs Cr), percentages as float 0-100.
# Set a field to None if genuinely unavailable.
# ------------------------------------------------------------------
MPLADS_DATA: dict[str, dict] = {
    "chandni-chowk-delhi": {
        "funds_released_cr": None,
        "expenditure_cr": None,
        "utilisation_pct": None,
        "unspent_balance_cr": None,
        "works_recommended": None,
        "works_sanctioned": None,
        "works_completed": None,
        "as_of_date": None,          # e.g. "2026-10-01"
        "source_url": "https://empoweredindian.in/mplads",
    },
    "east-delhi-delhi": {
        "funds_released_cr": None,
        "expenditure_cr": None,
        "utilisation_pct": None,
        "unspent_balance_cr": None,
        "works_recommended": None,
        "works_sanctioned": None,
        "works_completed": None,
        "as_of_date": None,
        "source_url": "https://empoweredindian.in/mplads",
    },
    "new-delhi-delhi": {
        "funds_released_cr": None,
        "expenditure_cr": None,
        "utilisation_pct": None,
        "unspent_balance_cr": None,
        "works_recommended": None,
        "works_sanctioned": None,
        "works_completed": None,
        "as_of_date": None,
        "source_url": "https://empoweredindian.in/mplads",
    },
    "north-east-delhi-delhi": {
        "funds_released_cr": None,
        "expenditure_cr": None,
        "utilisation_pct": None,
        "unspent_balance_cr": None,
        "works_recommended": None,
        "works_sanctioned": None,
        "works_completed": None,
        "as_of_date": None,
        "source_url": "https://empoweredindian.in/mplads",
    },
    "north-west-delhi-delhi": {
        "funds_released_cr": None,
        "expenditure_cr": None,
        "utilisation_pct": None,
        "unspent_balance_cr": None,
        "works_recommended": None,
        "works_sanctioned": None,
        "works_completed": None,
        "as_of_date": None,
        "source_url": "https://empoweredindian.in/mplads",
    },
    "south-delhi-delhi": {
        "funds_released_cr": None,
        "expenditure_cr": None,
        "utilisation_pct": None,
        "unspent_balance_cr": None,
        "works_recommended": None,
        "works_sanctioned": None,
        "works_completed": None,
        "as_of_date": None,
        "source_url": "https://empoweredindian.in/mplads",
    },
    "west-delhi-delhi": {
        "funds_released_cr": None,
        "expenditure_cr": None,
        "utilisation_pct": None,
        "unspent_balance_cr": None,
        "works_recommended": None,
        "works_sanctioned": None,
        "works_completed": None,
        "as_of_date": None,
        "source_url": "https://empoweredindian.in/mplads",
    },
}

# ------------------------------------------------------------------
# Validation helpers
# ------------------------------------------------------------------

def validate_mplads(slug: str, m: dict) -> list[str]:
    errs: list[str] = []
    for field in ("funds_released_cr", "expenditure_cr", "unspent_balance_cr"):
        v = m.get(field)
        if v is not None and v < 0:
            errs.append(f"{slug}.{field}: must be >= 0 (got {v})")
    pct = m.get("utilisation_pct")
    if pct is not None and not (0.0 <= pct <= 100.0):
        errs.append(f"{slug}.utilisation_pct: must be 0-100 (got {pct})")
    for field in ("works_recommended", "works_sanctioned", "works_completed"):
        v = m.get(field)
        if v is not None and (not isinstance(v, int) or v < 0):
            errs.append(f"{slug}.{field}: must be non-negative integer (got {v!r})")
    return errs


def main() -> None:
    # Validate all entries
    all_errs: list[str] = []
    for slug, m in MPLADS_DATA.items():
        all_errs.extend(validate_mplads(slug, m))
    if all_errs:
        print("VALIDATION FAILED:")
        for e in all_errs:
            print(f"  ERROR: {e}")
        raise SystemExit(1)

    # Load existing enrichment file
    enrichment = json.loads(ENRICHMENT.read_text(encoding="utf-8"))
    records = {r["slug"]: r for r in enrichment}

    changed = 0
    for slug, mdata in MPLADS_DATA.items():
        # Skip if all values are None (not filled yet)
        has_data = any(v is not None for k, v in mdata.items() if k not in ("source_url",))
        if not has_data:
            print(f"  SKIP {slug}: no values filled in MPLADS_DATA")
            continue

        if slug not in records:
            print(f"  WARN: {slug} not found in enrichment file — skipping")
            continue

        rec = records[slug]
        existing = rec.get("mplads", {})
        existing.update({
            "annual_entitlement_cr": 5.0,
            **mdata,
        })
        rec["mplads"] = existing
        changed += 1
        print(f"  UPDATED {slug}: {mdata}")

    if changed == 0:
        print("\nNo MPLADS values were filled in — edit the MPLADS_DATA dict above and re-run.")
        return

    # Write back
    updated = list(records.values())
    ENRICHMENT.write_text(json.dumps(updated, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"\nUpdated {changed} records in {ENRICHMENT}")
    print("Now run:  python scripts/build_data.py")


if __name__ == "__main__":
    main()
