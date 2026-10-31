-- Mera MP data store — YugabyteDB (YSQL) / PostgreSQL.
--
-- The Python pipeline remains the source of truth: it fetches, parses and
-- validates. scripts/load_db.py writes each *approved* snapshot here; nothing
-- else writes. Every load is a new snapshot, so per-seat values keep their
-- history across refreshes (e.g. attendance session by session).
--
-- Each block table keeps typed columns for querying and history, plus `data`,
-- the block exactly as approved, which the app reads. The loader checks that
-- the typed columns agree with `data`. MPLADS works and the per-card source list
-- are fully normalised into their own tables.
--
-- Uses only features YSQL supports well: tables, primary/foreign keys, CHECK
-- constraints, standard indexes and jsonb. Re-runnable (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS snapshots (
  id               bigserial PRIMARY KEY,
  sha256           char(64)    NOT NULL UNIQUE,   -- of data/processed/mps.json; makes loads idempotent
  snapshot_version text        NOT NULL,
  generated_at     timestamptz NOT NULL,
  record_count     integer     NOT NULL CHECK (record_count >= 0),
  meta             jsonb       NOT NULL,          -- snapshot.json as approved
  loaded_at        timestamptz NOT NULL DEFAULT now()
);

-- Stable seats. A by-election changes the member, never the seat.
CREATE TABLE IF NOT EXISTS constituencies (
  slug        text PRIMARY KEY,                   -- e.g. new-delhi-delhi
  name        text NOT NULL,
  state       text NOT NULL,
  reservation text NOT NULL CHECK (reservation IN ('GEN', 'SC', 'ST'))
);

-- Who held each seat, and their identity fields, in each approved snapshot.
CREATE TABLE IF NOT EXISTS member_records (
  snapshot_id            bigint  NOT NULL REFERENCES snapshots(id),
  constituency_slug      text    NOT NULL REFERENCES constituencies(slug),
  name                   text    NOT NULL,
  party                  text    NOT NULL,
  party_full             text,
  term                   text    NOT NULL,
  since_date             date,
  is_minister            boolean,                -- null = unknown, never coerced to false
  special_role           text,
  sansad_mpsno           integer,
  sansad_status          text,
  identity_review_status text,
  profile                jsonb,
  image_url              text,
  image_source           jsonb,
  normalisation_notes    jsonb   NOT NULL DEFAULT '[]',
  PRIMARY KEY (snapshot_id, constituency_slug)
);

CREATE TABLE IF NOT EXISTS performance (
  snapshot_id          bigint  NOT NULL REFERENCES snapshots(id),
  constituency_slug    text    NOT NULL REFERENCES constituencies(slug),
  status               text    NOT NULL CHECK (status IN ('reported', 'not_applicable', 'pending')),
  attendance_pct       numeric CHECK (attendance_pct BETWEEN 0 AND 100),
  debates              numeric CHECK (debates >= 0),
  questions            integer CHECK (questions >= 0),
  private_member_bills integer CHECK (private_member_bills >= 0),
  as_of                date,
  review_status        text,
  data                 jsonb   NOT NULL,
  PRIMARY KEY (snapshot_id, constituency_slug)
);

CREATE TABLE IF NOT EXISTS mplads_summaries (
  snapshot_id       bigint  NOT NULL REFERENCES snapshots(id),
  constituency_slug text    NOT NULL REFERENCES constituencies(slug),
  status            text    NOT NULL CHECK (status IN ('reported', 'not_applicable', 'pending')),
  allocated_cr      numeric CHECK (allocated_cr >= 0),
  expenditure_cr    numeric CHECK (expenditure_cr >= 0),
  expenditure_pct   numeric CHECK (expenditure_pct BETWEEN 0 AND 100),
  as_of             date,
  review_status     text,
  data              jsonb   NOT NULL,              -- block without `works` (see mplads_works)
  PRIMARY KEY (snapshot_id, constituency_slug)
);

CREATE TABLE IF NOT EXISTS mplads_works (
  snapshot_id           bigint  NOT NULL REFERENCES snapshots(id),
  constituency_slug     text    NOT NULL REFERENCES constituencies(slug),
  position              integer NOT NULL,          -- order as published by the source
  work_id               text    NOT NULL,          -- eSAKSHI work ID
  description           text    NOT NULL,
  category              text,
  implementing_agency   text,
  status                text    NOT NULL CHECK (status IN ('recommended', 'sanctioned', 'in_progress', 'completed', 'other')),
  status_raw            text,
  recommended_on        date,
  completed_on          date,
  recommended_amount_cr numeric CHECK (recommended_amount_cr >= 0),
  final_amount_cr       numeric CHECK (final_amount_cr >= 0),
  paid_cr               numeric CHECK (paid_cr >= 0),
  has_image             boolean,
  PRIMARY KEY (snapshot_id, constituency_slug, position)
);

CREATE TABLE IF NOT EXISTS affidavits (
  snapshot_id             bigint  NOT NULL REFERENCES snapshots(id),
  constituency_slug       text    NOT NULL REFERENCES constituencies(slug),
  status                  text    NOT NULL CHECK (status IN ('reported', 'not_applicable', 'pending')),
  election_year           integer,
  assets_inr              bigint  CHECK (assets_inr >= 0),
  liabilities_inr         bigint  CHECK (liabilities_inr >= 0),
  declared_criminal_cases integer CHECK (declared_criminal_cases >= 0),  -- declarations, not convictions
  review_status           text,
  data                    jsonb   NOT NULL,
  PRIMARY KEY (snapshot_id, constituency_slug)
);

CREATE TABLE IF NOT EXISTS elections (
  snapshot_id       bigint  NOT NULL REFERENCES snapshots(id),
  constituency_slug text    NOT NULL REFERENCES constituencies(slug),
  status            text    NOT NULL CHECK (status IN ('reported', 'not_applicable', 'pending')),
  election_year     integer,
  votes             integer CHECK (votes >= 0),
  margin            integer CHECK (margin >= 0),
  review_status     text,
  data              jsonb   NOT NULL,
  PRIMARY KEY (snapshot_id, constituency_slug)
);

-- The card's source list, in order.
CREATE TABLE IF NOT EXISTS member_sources (
  snapshot_id       bigint  NOT NULL REFERENCES snapshots(id),
  constituency_slug text    NOT NULL REFERENCES constituencies(slug),
  position          integer NOT NULL,
  name              text    NOT NULL,
  url               text    NOT NULL,
  retrieved_at      date,
  licence           text,
  PRIMARY KEY (snapshot_id, constituency_slug, position)
);

-- The current snapshot is the most recently *loaded* one: loads happen only after approval.
-- (bigserial ids are not strictly ordered across YugabyteDB nodes, so load time is used.)
CREATE INDEX IF NOT EXISTS snapshots_loaded_at_idx ON snapshots (loaded_at DESC);
CREATE INDEX IF NOT EXISTS performance_seat_idx ON performance (constituency_slug, snapshot_id);
