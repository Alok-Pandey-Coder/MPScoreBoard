/**
 * lib/types.ts — Canonical TypeScript types for "Mera MP, Mera Report Card".
 *
 * Money values: always in ₹ crore (Cr).
 * Percentages: always in the range 0–100 (not 0–1).
 * Missing/unknown values: null (never substitute zero).
 * Ministers: performance fields are null and isMinister === true.
 *   utilisationPct = spentCr / releasedCr * 100.
 *   Null when releasedCr is null or zero.
 */

// ── Averages ────────────────────────────────────────────────────────────────

/**
 * One metric's average, computed over non-minister, non-null values.
 * n is the count of MPs included.
 */
export interface MetricAverage {
  value: number | null;
  /** Number of MPs included in this average (ministers and nulls excluded). */
  n: number;
}

/** State-level or national-level averages for the four core performance metrics. */
export interface Averages {
  attendancePct: MetricAverage;
  debates: MetricAverage;
  questions: MetricAverage;
  privateBills: MetricAverage;
}

// ── Sub-records ─────────────────────────────────────────────────────────────

/** One Lok Sabha term's parliamentary activity record. */
export interface TermRecord {
  lokSabha: string;          // e.g. "18th Lok Sabha"
  constituency: string;
  state: string;
  party: string;
  fromYear: number;
  toYear: number | null;     // null = currently sitting
  attendancePct: number | null;
  debates: number | null;
  questions: number | null;
  privateBills: number | null;
}

/** An MPLADS-funded work item. */
export interface Work {
  id: string;
  title: string;
  category:
    | 'roads'
    | 'water'
    | 'education'
    | 'health'
    | 'sanitation'
    | 'community'
    | 'other';
  locality: string | null;
  sanctionedCr: number | null;  // ₹ crore
  spentCr: number | null;       // ₹ crore
  status: 'recommended' | 'sanctioned' | 'in_progress' | 'completed';
  recommendedOn: string | null; // ISO date YYYY-MM-DD
  completedOn: string | null;   // ISO date YYYY-MM-DD
}

/** A private member bill introduced by the MP. */
export interface Bill {
  id: string;
  title: string;
  introducedOn: string; // ISO date YYYY-MM-DD
  type: 'private_member';
  status: 'introduced' | 'discussed' | 'withdrawn' | 'lapsed' | 'other';
}

/** Provenance record for a data field or the whole record. */
export interface Source {
  name: string;
  url: string;
  retrievedAt: string; // ISO date YYYY-MM-DD
}

// ── MP ──────────────────────────────────────────────────────────────────────

export interface MP {
  /** Constituency-based stable slug, e.g. "test-region-07-test-state-a". */
  slug: string;
  name: string;
  party: string;
  state: string;
  constituency: string;
  reservation?: 'GEN' | 'SC' | 'ST';
  /** e.g. "18th Lok Sabha" */
  term: string;
  /** ISO date — set only for by-election winners (mid-term entry). */
  sinceDate?: string;
  /** True for cabinet/state ministers. Performance fields will be null. */
  isMinister: boolean;
  /** True for all test-data records. Must be false in real production data. */
  isTest: boolean;

  profile: {
    education: string | null;
    profession: string | null;
    photoUrl: string | null;
  };

  /** Previous + current terms, newest first. */
  history: TermRecord[];

  /**
   * Parliamentary activity metrics.
   * Absent for ministers (isMinister === true) — show "Not applicable".
   * Individual fields may still be null if the source did not report them.
   */
  performance?: {
    attendancePct: number | null;
    debates: number | null;
    questions: number | null;
    privateBills: number | null;
    asOf: string; // ISO date of the data snapshot from the source
    attendanceBySession: { session: string; pct: number | null }[];
  };

  /**
   * MPLADS fund utilisation.
   * utilisationPct = spentCr / releasedCr * 100.
   * Null when either releasedCr or spentCr is null, or releasedCr === 0.
   * Absent entirely when no MPLADS data is available for this MP.
   */
  mplads?: {
    entitlementCr: number | null;
    releasedCr: number | null;
    spentCr: number | null;
    utilisationPct: number | null;
    unspentCr: number | null;
    asOf: string;
    byYear: { fy: string; releasedCr: number | null; spentCr: number | null }[];
  };

  /** MPLADS-funded works. Empty array = MP has zero sanctioned works. */
  works: Work[];

  /** Private member bills. Empty array = none introduced. */
  bills: Bill[];

  /**
   * Declared affidavit data from the election commission filing.
   * Absent when affidavit data has not been collected yet.
   * Cases are allegations/pending cases, NOT convictions.
   */
  affidavit?: {
    totalAssetsRs: number | null;   // ₹ (not crore — raw affidavit unit)
    declaredCases: number | null;
    education: string | null;
    electionYear: number;
  };

  /** At least one source is required per MP record. */
  sources: Source[];
}

// ── Snapshot ─────────────────────────────────────────────────────────────────

/**
 * Top-level data file written by the generator / pipeline.
 * Loader reads this from mps.json (real) or mps.test.json (test fallback).
 */
export interface Snapshot {
  meta: {
    /** "test" for seeded fake data; "real" for production pipeline output. */
    dataMode: 'test' | 'real';
    /** ISO datetime when this snapshot was generated. */
    generatedAt: string;
    /** PRNG seed used for test data. Absent for real data. */
    seed?: number;
    mpCount: number;
    /** GeoJSON boundary vintage, e.g. "2008-delimitation". */
    boundaryVintage?: string;
  };
  mps: MP[];
  nationalAverages: Averages;
  /** Keyed by state name, e.g. "Test State A". */
  stateAverages: Record<string, Averages>;
}
