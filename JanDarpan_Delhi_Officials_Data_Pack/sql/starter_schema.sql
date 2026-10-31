-- PostgreSQL starter schema for the initial JanDarpan representative dataset
CREATE TABLE officials (
  official_id TEXT PRIMARY KEY,
  official_name TEXT NOT NULL,
  house TEXT NOT NULL CHECK (house IN ('Delhi Legislative Assembly','Lok Sabha')),
  role TEXT NOT NULL CHECK (role IN ('MLA','MP')),
  constituency_number INTEGER,
  constituency TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Delhi',
  party_current_source_value TEXT,
  legislative_term TEXT,
  election_year INTEGER,
  member_status TEXT,
  primary_source_url TEXT NOT NULL,
  cross_check_source_url TEXT,
  source_date TEXT,
  validation_status TEXT NOT NULL,
  validation_notes TEXT,
  CHECK ((role = 'MLA' AND constituency_number BETWEEN 1 AND 70) OR (role = 'MP' AND constituency_number IS NULL))
);

CREATE TABLE source_observations (
  observation_id BIGSERIAL PRIMARY KEY,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_retrieved_on DATE NOT NULL,
  subject_name_as_reported TEXT NOT NULL,
  constituency_as_reported TEXT,
  attendance_percent NUMERIC(5,2),
  questions_asked INTEGER,
  identity_match_status TEXT NOT NULL,
  review_note TEXT,
  CHECK (attendance_percent IS NULL OR attendance_percent BETWEEN 0 AND 100),
  CHECK (questions_asked IS NULL OR questions_asked >= 0)
);

CREATE TABLE affidavit_records (
  affidavit_id BIGSERIAL PRIMARY KEY,
  official_id TEXT NOT NULL REFERENCES officials(official_id),
  election_year INTEGER NOT NULL,
  individual_affidavit_url TEXT,
  document_sha256 TEXT,
  declared_total_assets_inr NUMERIC(18,2),
  movable_assets_inr NUMERIC(18,2),
  immovable_assets_inr NUMERIC(18,2),
  declared_liabilities_inr NUMERIC(18,2),
  education_as_declared TEXT,
  criminal_case_declarations JSONB,
  source_page_refs JSONB,
  review_status TEXT NOT NULL DEFAULT 'not_reviewed',
  reviewed_at TIMESTAMPTZ,
  reviewer_note TEXT
);
