export interface MPSource {
  name: string;
  url: string;
  retrieved_at: string;
  raw_file?: string;
  licence?: string;
}

export interface MPProfile {
  age: number | null;
  gender: string | null;
  education: string | null;
  term_number: string | null;
  as_of: string;
  source: MPSource;
}

export interface NationalStateAverages {
  attendance_pct: number;
  debates: number;
  questions: number;
  private_member_bills: number;
}

export interface MPPerformance {
  status: "reported" | "not_applicable" | "pending";
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
    national: NationalStateAverages;
    state: NationalStateAverages;
  };
  source?: MPSource;
}

export interface MPBackground {
  declared_criminal_cases: number | null;
  declared_assets_inr: number | null;
  declared_liabilities_inr: number | null;
  education_detailed: string | null;
  affidavit_year: number;
  note: string;
  source: MPSource;
}

export interface MPLADSFund {
  entitled_inr_crore: number | null;
  released_inr_crore: number | null;
  spent_inr_crore: number | null;
  unspent_inr_crore: number | null;
  utilisation_pct: number | null;
  as_of: string;
  source: MPSource;
}

export interface MPRecord {
  slug: string;
  name: string;
  constituency: string;
  state: string;
  party: string;
  party_full: string;
  reservation: "GEN" | "SC" | "ST";
  term: string;
  since_date: string;
  is_minister: boolean;
  special_role: string | null;
  sansad_mpsno?: number;
  sansad_status?: string;
  identity_review_status?: string;
  profile: MPProfile;
  performance: MPPerformance;
  background?: MPBackground;
  mplads?: MPLADSFund;
  center_coords?: [number, number]; // [lat, lng]
}

export interface ConstituencySummary {
  slug: string;
  name: string;
  state: string;
  reservation: "GEN" | "SC" | "ST";
  mp_name: string;
  party: string;
  party_full: string;
  is_minister: boolean;
  attendance_pct: number | null;
  questions: number | null;
  debates: number | null;
  center_coords: [number, number];
}

export interface LocationResolveRequest {
  lat?: number;
  lng?: number;
  pincode?: string;
  query?: string;
}

export interface LocationResolveResponse {
  success: boolean;
  matched_by: "coordinates" | "pincode" | "query" | "none";
  constituency?: string;
  slug?: string;
  confidence: "exact" | "approximate" | "none";
  resolved_coords?: {
    lat: number;
    lng: number;
  };
  mp?: MPRecord;
  error?: string;
}

