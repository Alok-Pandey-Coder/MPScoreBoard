import realRecords from "@/data/processed/mps.json";
import testSnapshot from "@/data/processed/mps.test.json";

export interface ReportMetric {
  label: string;
  value: number | null;
  stateAverage: number | null;
  nationalAverage: number | null;
  suffix?: string;
}

export interface ReportSource {
  name: string;
  url: string;
  retrievedAt: string;
}

export interface ReportMP {
  slug: string;
  name: string;
  party: string;
  constituency: string;
  state: string;
  term: string;
  reservation: string;
  isMinister: boolean;
  education: string | null;
  metrics: ReportMetric[];
  performanceAsOf: string | null;
  mpladsPending: boolean;
  affidavitPending: boolean;
  affidavit: { totalAssetsRs: number | null; declaredCases: number | null; education: string | null; electionYear: number | null } | null;
  isTest: boolean;
  attendanceBySession: Array<{ session: string; pct: number | null }>;
  history: Array<{ lokSabha: string; constituency: string; state: string; party: string; fromYear: number; toYear: number | null }>;
  mplads: {
    entitlementCr: number | null;
    releasedCr: number | null;
    spentCr: number | null;
    utilisationPct: number | null;
    unspentCr: number | null;
    asOf: string | null;
    byYear: Array<{ fy: string; releasedCr: number | null; spentCr: number | null }>;
  } | null;
  works: Array<{ id: string; title: string; category: string; locality: string | null; spentCr: number | null; status: string }>;
  bills: Array<{ id: string; title: string; introducedOn: string; status: string }>;
  sources: ReportSource[];
}

interface LegacyMetricAverages {
  attendance_pct: number | null;
  debates: number | null;
  questions: number | null;
  private_member_bills: number | null;
}

interface LegacyRecord {
  slug: string;
  name: string;
  party: string;
  constituency: string;
  state: string;
  term: string;
  reservation?: string;
  is_minister: boolean;
  isTest?: boolean;
  history?: Array<{ lokSabha: string; constituency: string; state: string; party: string; fromYear: number; toYear: number | null }>;
  profile?: { education?: string | null };
  performance?: {
    status?: string;
    attendance_pct: number | null;
    debates: number | null;
    questions: number | null;
    private_member_bills: number | null;
    as_of?: string | null;
    attendanceBySession?: Array<{ session: string; pct: number | null }>;
    prs_averages?: {
      national?: LegacyMetricAverages;
      state?: LegacyMetricAverages;
    };
  };
  mplads?: {
    status?: string;
    entitlement?: number | null;
    funds_released?: number | null;
    expenditure?: number | null;
    utilisation_pct?: number | null;
    unspent_balance?: number | null;
    as_of?: string | null;
    byYear?: Array<{ fy: string; releasedCr: number | null; spentCr: number | null }>;
  };
  affidavit?: { status?: string; totalAssetsRs?: number | null; declaredCases?: number | null; education?: string | null; electionYear?: number | null; assets?: number | null; declared_criminal_cases?: number | null; election_year?: number | null };
  works?: Array<{ id: string; title: string; category: string; locality: string | null; spentCr?: number | null; spent_cr?: number | null; status: string }>;
  bills?: Array<{ id: string; title: string; introducedOn?: string; introduced_on?: string; status: string }>;
  sources?: Array<{ name: string; url: string; retrieved_at: string }>;
}

interface TestRecord {
  slug: string;
  name: string;
  party: string;
  constituency: string;
  state: string;
  term: string;
  reservation?: string;
  isMinister: boolean;
  isTest: boolean;
  profile?: { education?: string | null };
  history?: LegacyRecord["history"];
  performance?: {
    attendancePct: number | null;
    debates: number | null;
    questions: number | null;
    privateBills: number | null;
    asOf?: string | null;
    attendanceBySession?: Array<{ session: string; pct: number | null }>;
  };
  mplads?: unknown;
  affidavit?: LegacyRecord["affidavit"];
  works?: LegacyRecord["works"];
  bills?: LegacyRecord["bills"];
  sources?: Array<{ name: string; url: string; retrievedAt: string }>;
}

const isTestMode = process.env.MP_DATA_MODE === "test";
const records = isTestMode
  ? (testSnapshot.mps as TestRecord[]).map((record) => ({
      ...record,
      is_minister: record.isMinister,
      profile: record.profile,
      isTest: record.isTest,
      history: record.history,
      performance: record.performance
        ? {
            attendance_pct: record.performance.attendancePct,
            debates: record.performance.debates,
            questions: record.performance.questions,
            private_member_bills: record.performance.privateBills,
            as_of: record.performance.asOf,
            attendanceBySession: record.performance.attendanceBySession,
          }
        : undefined,
      sources: record.sources?.map((source) => ({
        name: source.name,
        url: source.url,
        retrieved_at: source.retrievedAt,
      })),
      mplads: record.mplads,
      affidavit: record.affidavit,
      works: record.works,
      bills: record.bills,
    })) as LegacyRecord[]
  : (realRecords as LegacyRecord[]);

function metric(
  label: string,
  value: number | null,
  stateAverage: number | null,
  nationalAverage: number | null,
  suffix?: string,
): ReportMetric {
  return { label, value, stateAverage, nationalAverage, suffix };
}

function toReportMP(record: LegacyRecord): ReportMP {
  const performance = record.performance;
  const state = performance?.prs_averages?.state;
  const national = performance?.prs_averages?.national;

  return {
    slug: record.slug,
    name: record.name,
    party: record.party,
    constituency: record.constituency,
    state: record.state,
    term: record.term,
    reservation: record.reservation ?? "GEN",
    isMinister: record.is_minister,
    education: record.profile?.education ?? null,
    metrics: [
      metric("Attendance", performance?.attendance_pct ?? null, state?.attendance_pct ?? null, national?.attendance_pct ?? null, "%"),
      metric("Debates", performance?.debates ?? null, state?.debates ?? null, national?.debates ?? null),
      metric("Questions", performance?.questions ?? null, state?.questions ?? null, national?.questions ?? null),
      metric("Private member bills", performance?.private_member_bills ?? null, state?.private_member_bills ?? null, national?.private_member_bills ?? null),
    ],
    performanceAsOf: performance?.as_of ?? null,
    mpladsPending: record.mplads?.status === "pending",
    affidavitPending: record.affidavit?.status === "pending",
    affidavit: record.affidavit && record.affidavit.status !== "pending"
      ? {
          totalAssetsRs: record.affidavit.totalAssetsRs ?? record.affidavit.assets ?? null,
          declaredCases: record.affidavit.declaredCases ?? record.affidavit.declared_criminal_cases ?? null,
          education: record.affidavit.education ?? null,
          electionYear: record.affidavit.electionYear ?? record.affidavit.election_year ?? null,
        }
      : null,
    isTest: record.isTest ?? false,
    attendanceBySession: performance?.attendanceBySession ?? [],
    history: record.history ?? [],
    mplads: record.mplads && record.mplads.status !== "pending"
      ? {
          entitlementCr: record.mplads.entitlement ?? null,
          releasedCr: record.mplads.funds_released ?? null,
          spentCr: record.mplads.expenditure ?? null,
          utilisationPct: record.mplads.utilisation_pct ?? null,
          unspentCr: record.mplads.unspent_balance ?? null,
          asOf: record.mplads.as_of ?? null,
          byYear: record.mplads.byYear ?? [],
        }
      : null,
    works: (record.works ?? []).map((work) => ({
      id: work.id,
      title: work.title,
      category: work.category,
      locality: work.locality,
      spentCr: work.spentCr ?? work.spent_cr ?? null,
      status: work.status,
    })),
    bills: (record.bills ?? []).map((bill) => ({
      id: bill.id,
      title: bill.title,
      introducedOn: bill.introducedOn ?? bill.introduced_on ?? "",
      status: bill.status,
    })),
    sources: (record.sources ?? []).map((source) => ({
      name: source.name,
      url: source.url,
      retrievedAt: source.retrieved_at,
    })),
  };
}

const reportMPs = records.map(toReportMP);

export function getAllMPs(): ReportMP[] {
  return reportMPs;
}

export function getMPBySlug(slug: string): ReportMP | undefined {
  return reportMPs.find((mp) => mp.slug === slug);
}

export function searchMPs(query: string): ReportMP[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [];
  return reportMPs
    .map((mp) => ({
      mp,
      score: Math.min(
        ...[mp.name, mp.constituency, mp.state, mp.party].map((value) => {
          const candidate = value.toLocaleLowerCase();
          return candidate.includes(normalized) ? 0 : editDistance(normalized, candidate);
        }),
      ),
    }))
    .filter(({ score }) => score === 0 || (normalized.length >= 4 && score <= 2))
    .sort((a, b) => a.score - b.score)
    .map(({ mp }) => mp);
}

function editDistance(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let row = 1; row <= left.length; row += 1) {
    let diagonal = previous[0];
    previous[0] = row;
    for (let column = 1; column <= right.length; column += 1) {
      const above = previous[column];
      previous[column] = left[row - 1] === right[column - 1]
        ? diagonal
        : 1 + Math.min(diagonal, previous[column], previous[column - 1]);
      diagonal = above;
    }
  }
  return previous[right.length];
}

export function getSnapshotDate(): string {
  return isTestMode ? "2026-10-31 (synthetic test data)" : "2026-10-30";
}
