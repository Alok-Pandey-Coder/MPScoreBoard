"""Load the approved snapshot (data/processed/mps.json + snapshot.json) into YugabyteDB.

Run after the snapshot is reviewed and committed, never on unreviewed data:
    DATABASE_URL=postgresql://... python scripts/load_db.py [--schema]

- --schema applies db/schema.sql first (safe to re-run).
- Idempotent: a snapshot whose sha256 is already loaded is skipped.
- One transaction per snapshot: either every row lands or none does.
- Nothing is deleted or updated in place except a seat's name/state/reservation;
  earlier snapshots stay as history.
- Refuses to load if snapshot.json's sha256 does not match mps.json (an
  unreviewed or hand-edited export).
Works with YugabyteDB (YSQL) or any PostgreSQL. For YugabyteDB Aeon, include
sslmode=verify-full&sslrootcert=<root.crt> in DATABASE_URL.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from pathlib import Path

import psycopg
from psycopg.types.json import Jsonb

ROOT = Path(__file__).resolve().parents[1]
MPS = ROOT / "data" / "processed" / "mps.json"
SNAPSHOT = ROOT / "data" / "processed" / "snapshot.json"
SCHEMA = ROOT / "db" / "schema.sql"


def j(value):
    """jsonb parameter that keeps SQL NULL for a missing value."""
    return None if value is None else Jsonb(value)


def load(conn: psycopg.Connection, mps_bytes: bytes, meta: dict) -> str:
    sha = hashlib.sha256(mps_bytes).hexdigest()
    if meta.get("sha256") != sha:
        raise SystemExit("snapshot.json sha256 does not match mps.json; rebuild with scripts/build_data.py before loading.")
    records = json.loads(mps_bytes)

    with conn.transaction():
        cur = conn.cursor()
        cur.execute("SELECT id FROM snapshots WHERE sha256 = %s", (sha,))
        if cur.fetchone():
            return f"snapshot {sha[:12]} already loaded; nothing to do"

        cur.execute(
            """INSERT INTO snapshots (sha256, snapshot_version, generated_at, record_count, meta)
               VALUES (%s, %s, %s, %s, %s) RETURNING id""",
            (sha, meta["snapshot_version"], meta["generated_at"], len(records), Jsonb(meta)),
        )
        snapshot_id = cur.fetchone()[0]

        for r in records:
            slug = r["slug"]
            cur.execute(
                """INSERT INTO constituencies (slug, name, state, reservation) VALUES (%s, %s, %s, %s)
                   ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, state = EXCLUDED.state,
                                                    reservation = EXCLUDED.reservation""",
                (slug, r["constituency"], r["state"], r["reservation"]),
            )
            cur.execute(
                """INSERT INTO member_records (snapshot_id, constituency_slug, name, party, party_full, term, since_date,
                       is_minister, special_role, sansad_mpsno, sansad_status, identity_review_status, profile,
                       image_url, image_source, normalisation_notes)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (snapshot_id, slug, r["name"], r["party"], r.get("party_full"), r["term"], r.get("since_date"),
                 r.get("is_minister"), r.get("special_role"), r.get("sansad_mpsno"), r.get("sansad_status"),
                 r.get("identity_review_status"), j(r.get("profile")), r.get("image_url"), j(r.get("image_source")),
                 Jsonb(r.get("normalisation_notes") or [])),
            )

            p = r["performance"]
            cur.execute(
                """INSERT INTO performance (snapshot_id, constituency_slug, status, attendance_pct, debates, questions,
                       private_member_bills, as_of, review_status, data)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (snapshot_id, slug, p["status"], p.get("attendance_pct"), p.get("debates"), p.get("questions"),
                 p.get("private_member_bills"), p.get("as_of"), p.get("review_status"), Jsonb(p)),
            )

            m = r.get("mplads") or {"status": "pending"}
            works = m.get("works") or []
            cur.execute(
                """INSERT INTO mplads_summaries (snapshot_id, constituency_slug, status, allocated_cr, expenditure_cr,
                       expenditure_pct, as_of, review_status, data)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (snapshot_id, slug, m["status"], m.get("allocated_cr"), m.get("expenditure_cr"), m.get("expenditure_pct"),
                 m.get("as_of"), m.get("review_status"),
                 # Works live in mplads_works; the marker lets the app restore the `works` key exactly.
                 Jsonb({**{k: v for k, v in m.items() if k != "works"}, **({"_works_in_table": True} if "works" in m else {})})),
            )
            for position, w in enumerate(works):
                cur.execute(
                    """INSERT INTO mplads_works (snapshot_id, constituency_slug, position, work_id, description, category,
                           implementing_agency, status, status_raw, recommended_on, completed_on, recommended_amount_cr,
                           final_amount_cr, paid_cr, has_image)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                    (snapshot_id, slug, position, w["work_id"], w["description"], w.get("category"),
                     w.get("implementing_agency"), w["status"], w.get("status_raw"), w.get("recommended_on"),
                     w.get("completed_on"), w.get("recommended_amount_cr"), w.get("final_amount_cr"), w.get("paid_cr"),
                     w.get("has_image")),
                )

            a = r.get("affidavit") or {"status": "pending"}
            cur.execute(
                """INSERT INTO affidavits (snapshot_id, constituency_slug, status, election_year, assets_inr,
                       liabilities_inr, declared_criminal_cases, review_status, data)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (snapshot_id, slug, a["status"], a.get("election_year"), a.get("assets"), a.get("liabilities"),
                 a.get("declared_criminal_cases"), a.get("review_status"), Jsonb(a)),
            )

            e = r.get("election") or {"status": "pending"}
            cur.execute(
                """INSERT INTO elections (snapshot_id, constituency_slug, status, election_year, votes, margin,
                       review_status, data)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                (snapshot_id, slug, e["status"], e.get("election_year"), e.get("votes"), e.get("margin"),
                 e.get("review_status"), Jsonb(e)),
            )

            for position, s in enumerate(r.get("sources") or []):
                cur.execute(
                    """INSERT INTO member_sources (snapshot_id, constituency_slug, position, name, url, retrieved_at, licence)
                       VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                    (snapshot_id, slug, position, s["name"], s["url"], s.get("retrieved_at"), s.get("licence")),
                )

    return f"loaded snapshot {sha[:12]} ({meta['snapshot_version']}) with {len(records)} seats as snapshot id {snapshot_id}"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--schema", action="store_true", help="apply db/schema.sql before loading")
    args = parser.parse_args()
    url = os.environ.get("DATABASE_URL")
    if not url:
        print("DATABASE_URL is not set.", file=sys.stderr)
        return 1
    with psycopg.connect(url) as conn:
        if args.schema:
            conn.execute(SCHEMA.read_text(encoding="utf-8"))
            conn.commit()
            print("schema applied")
        print(load(conn, MPS.read_bytes(), json.loads(SNAPSHOT.read_text(encoding="utf-8"))))
    return 0


if __name__ == "__main__":
    sys.exit(main())
