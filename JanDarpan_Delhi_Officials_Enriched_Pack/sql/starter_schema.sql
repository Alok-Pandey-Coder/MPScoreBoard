-- JanDarpan affidavit enrichment starter schema (PostgreSQL)
CREATE TABLE IF NOT EXISTS official_affidavit_declarations (
    id BIGSERIAL PRIMARY KEY,
    official_id TEXT NOT NULL REFERENCES officials(official_id),
    election_year SMALLINT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('MLA','MP')),
    affidavit_subject_name TEXT NOT NULL,
    source_profile_url TEXT,
    education_category TEXT,
    education_detail TEXT,
    age_at_nomination SMALLINT,
    declared_criminal_case_count INTEGER,
    has_serious_criminal_cases BOOLEAN,
    declared_total_assets_inr NUMERIC(18,2),
    movable_assets_inr NUMERIC(18,2),
    immovable_assets_inr NUMERIC(18,2),
    declared_liabilities_inr NUMERIC(18,2),
    liabilities_profile_summary_inr NUMERIC(18,2),
    other_disputed_liabilities_inr NUMERIC(18,2),
    pan_declared BOOLEAN,
    source_document_url TEXT,
    source_document_pages TEXT,
    retrieved_at TIMESTAMPTZ NOT NULL,
    validation_status TEXT NOT NULL,
    validation_note TEXT,
    UNIQUE (official_id, election_year)
);

CREATE TABLE IF NOT EXISTS official_affidavit_case_counters (
    id BIGSERIAL PRIMARY KEY,
    official_id TEXT NOT NULL REFERENCES officials(official_id),
    election_year SMALLINT NOT NULL,
    total_cases INTEGER,
    serious_ipc_charge_count INTEGER,
    serious_bns_charge_count INTEGER,
    other_ipc_charge_count INTEGER,
    other_bns_charge_count INTEGER,
    source_url TEXT,
    source_document_pages TEXT,
    note TEXT
);
