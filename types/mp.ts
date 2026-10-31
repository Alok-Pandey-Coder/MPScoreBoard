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

export interface MpladsData {
  status: 'reported' | 'pending' | 'not_applicable';
  entitlement?: number | null;
  funds_released?: number | null;
  expenditure?: number | null;
  utilisation_pct?: number | null;
  unspent_balance?: number | null;
  works?: {
    recommended?: number;
    sanctioned?: number;
    completed?: number;
  } | null;
  as_of?: string | null;
  source?: Source | null;
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
  image_url?: string;
  image_source?: Source;
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

