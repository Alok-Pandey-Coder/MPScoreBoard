export interface Source {
  name: string;
  url: string;
  retrieved_at?: string;
  retrievedAt?: string;
  raw_file?: string;
  licence?: string;
}

export interface MetricAverages {
  attendance_pct: number | null;
  debates: number | null;
  questions: number | null;
  private_member_bills: number | null;
}

export interface PerformanceData {
  status: 'reported' | 'not_applicable' | 'pending';
  attendance_pct: number | null;
  debates: number | null;
  questions: number | null;
  private_member_bills: number | null;
  period?: {
    from: string;
    to: string;
  };
  as_of?: string;
  prs_averages?: {
    national: MetricAverages;
    state: MetricAverages;
  };
  source?: Source;
  review_status?: string;
}

export type MpladsWorkStatus = 'recommended' | 'sanctioned' | 'in_progress' | 'completed' | 'other';

/** One MPLADS work as published by the source. Amounts in INR crore. */
export interface MpladsWork {
  /** eSAKSHI work identifier, kept as a string. */
  work_id: string;
  description: string;
  category: string | null;
  implementing_agency: string | null;
  status: MpladsWorkStatus;
  /** Status string exactly as the source published it. */
  status_raw: string | null;
  recommended_on: string | null;
  completed_on: string | null;
  recommended_amount_cr: number | null;
  final_amount_cr: number | null;
  paid_cr: number | null;
  has_image: boolean | null;
}

/** A second source's figures for the same MP, kept for cross-checking only. */
export interface MpladsCrossCheck {
  source: Source;
  as_of: string | null;
  allocated_cr: number | null;
  expenditure_cr: number | null;
  works_recommended: number | null;
  works_sanctioned: number | null;
  works_completed: number | null;
  /** Human-readable differences against the primary figures. */
  differences: string[];
}

/**
 * MPLADS block. All money in INR crore; percentages 0–100.
 * Percentages are computed from the amounts here, never copied blindly from
 * a source field whose definition differs.
 */
export interface MpladsData {
  status: 'reported' | 'pending' | 'not_applicable';
  /** Scheme entitlement per MP per year (₹5 crore); null if not sourced. */
  annual_entitlement_cr?: number | null;
  /** Cumulative amount allocated to the MP in this term, per source. */
  allocated_cr?: number | null;
  /** Total recommended by the MP for works. */
  recommended_amount_cr?: number | null;
  /** Total expenditure (spent). */
  expenditure_cr?: number | null;
  /** allocated − expenditure, as published or computed (see normalisation_notes). */
  unspent_cr?: number | null;
  /** expenditure ÷ allocated × 100. */
  expenditure_pct?: number | null;
  /** recommended_amount ÷ allocated × 100. */
  recommended_pct?: number | null;
  works_count?: {
    recommended: number | null;
    sanctioned: number | null;
    completed: number | null;
    pending: number | null;
  } | null;
  /** Work-level records; may be a partial list (compare length with works_count). */
  works?: MpladsWork[];
  /** True when `works` is known to be a subset of the source's full list. */
  works_is_partial?: boolean;
  as_of?: string | null;
  source?: Source | null;
  cross_check?: MpladsCrossCheck[];
  review_status?: string | null;
}

export interface AffidavitData {
  status: 'reported' | 'pending' | 'not_applicable';
  election_year?: number | null;
  assets?: number | null;
  liabilities?: number | null;
  declared_criminal_cases?: number | null;
  education?: string | null;
  as_of?: string | null;
  source?: Source | null;
  review_status?: string | null;
}

export interface ProfileData {
  age?: number;
  gender?: string;
  education?: string;
  term_number?: string;
  as_of?: string;
  source?: Source;
}

export interface MPRecord {
  slug: string;
  name: string;
  constituency: string;
  state: string;
  party: string;
  party_full?: string;
  reservation?: 'GEN' | 'SC' | 'ST';
  term: string;
  since_date?: string;
  is_minister: boolean;
  special_role?: 'Speaker' | 'Deputy Speaker' | null;
  sansad_mpsno?: number;
  sansad_status?: string;
  profile?: ProfileData;
  performance: PerformanceData;
  mplads?: MpladsData;
  affidavit?: AffidavitData;
  sources: Source[];
  normalisation_notes?: string[];
}

export interface SnapshotMetadata {
  snapshot_version: string;
  generated_at: string;
  record_count: number;
  sha256: string;
  pipeline: string;
  coverage: string;
  source_status: Record<string, string>;
}

export type CitizenIntent = 
  | 'mplads_works'
  | 'parliament_question'
  | 'attendance_clarification'
  | 'general_feedback';

