import realRecords from "@/data/processed/mps.json";
import testSnapshot from "@/data/processed/mps.test.json";
import delhiPcGeoJSON from "@/data/processed/delhi_pc.json";
import {
  ConstituencySummary,
  LocationResolveRequest,
  LocationResolveResponse,
} from "./types";
import {
  isPointInBBox,
  isPointInPolygon,
  isPointInMultiPolygon,
  getBoundingBox,
  Coordinate,
  calculateDistanceKm,
} from "./spatial";
import { lookupPincode } from "./delhi_pincodes";

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
  party_full?: string;
  constituency: string;
  state: string;
  term: string;
  reservation: string;
  isMinister: boolean;
  is_minister?: boolean;
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
  profile?: any;
  performance?: any;
  background?: any;
  center_coords?: [number, number];
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
  party_full?: string;
  constituency: string;
  state: string;
  term: string;
  reservation?: string;
  is_minister: boolean;
  isTest?: boolean;
  history?: Array<{ lokSabha: string; constituency: string; state: string; party: string; fromYear: number; toYear: number | null }>;
  profile?: { education?: string | null; age?: number | null; gender?: string | null; term_number?: string | null; source?: any };
  performance?: {
    status?: string;
    attendance_pct: number | null;
    debates: number | null;
    questions: number | null;
    private_member_bills: number | null;
    as_of?: string | null;
    period?: { from: string; to: string };
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
  affidavit?: {
    status?: string;
    totalAssetsRs?: number | null;
    declaredCases?: number | null;
    education?: string | null;
    electionYear?: number | null;
    assets?: number | null;
    declared_criminal_cases?: number | null;
    election_year?: number | null;
  };
  background?: {
    declared_criminal_cases?: number | null;
    declared_assets_inr?: number | null;
    declared_liabilities_inr?: number | null;
    education_detailed?: string | null;
    affidavit_year?: number;
    note?: string;
    source?: any;
  };
  works?: Array<{ id: string; title: string; category: string; locality: string | null; spentCr?: number | null; spent_cr?: number | null; status: string }>;
  bills?: Array<{ id: string; title: string; introducedOn?: string; introduced_on?: string; status: string }>;
  sources?: Array<{ name: string; url: string; retrieved_at: string }>;
  center_coords?: [number, number];
}

interface TestRecord {
  slug: string;
  name: string;
  party: string;
  party_full?: string;
  constituency: string;
  state: string;
  term: string;
  reservation?: string;
  isMinister: boolean;
  isTest: boolean;
  profile?: { education?: string | null; age?: number | null; gender?: string | null; term_number?: string | null; source?: any };
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
      mplads: record.mplads as LegacyRecord["mplads"],
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
    party_full: record.party_full || record.party,
    constituency: record.constituency,
    state: record.state,
    term: record.term,
    reservation: record.reservation ?? "GEN",
    isMinister: record.is_minister,
    is_minister: record.is_minister,
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
    profile: record.profile,
    performance: record.performance,
    background: record.background || (record.affidavit ? {
      declared_criminal_cases: record.affidavit.declaredCases ?? record.affidavit.declared_criminal_cases ?? 0,
      declared_assets_inr: record.affidavit.totalAssetsRs ?? record.affidavit.assets ?? null,
    } : undefined),
    center_coords: record.center_coords,
  };
}

const reportMPs = records.map(toReportMP);

export function getAllMPs(): ReportMP[] {
  return reportMPs;
}

export function getMPBySlug(slug: string): ReportMP | undefined {
  const normalized = slug.trim().toLowerCase();
  return reportMPs.find(
    (mp) =>
      mp.slug.toLowerCase() === normalized ||
      mp.constituency.toLowerCase().replace(/\s+/g, "-") === normalized
  );
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

// ── Spatial & Location Services ─────────────────────────────────────────────

export function getGeoJSON(): any {
  return delhiPcGeoJSON;
}

export function getConstituenciesSummary(): ConstituencySummary[] {
  const mps = getAllMPs();
  let geojson: any = null;
  try {
    geojson = getGeoJSON();
  } catch {
    geojson = { features: [] };
  }

  return mps.map((mp) => {
    const feat = geojson.features?.find(
      (f: any) => f.properties?.slug === mp.slug || f.properties?.pc_name?.toLowerCase() === mp.constituency.toLowerCase()
    );
    const center: [number, number] = feat?.properties?.center || [28.6139, 77.209];
    const attMetric = mp.metrics.find((m) => m.label === "Attendance");
    const qMetric = mp.metrics.find((m) => m.label === "Questions");
    const dMetric = mp.metrics.find((m) => m.label === "Debates");

    return {
      slug: mp.slug,
      name: mp.constituency,
      state: mp.state,
      reservation: (mp.reservation || "GEN") as "GEN" | "SC" | "ST",
      mp_name: mp.name,
      party: mp.party,
      party_full: mp.party_full || mp.party,
      is_minister: mp.isMinister,
      attendance_pct: attMetric?.value ?? null,
      questions: qMetric?.value ?? null,
      debates: dMetric?.value ?? null,
      center_coords: center,
    };
  });
}

/**
 * Resolves which constituency a [lat, lng] falls into via Point-in-Polygon Ray Casting.
 */
export function resolveLocationByCoords(lat: number, lng: number): LocationResolveResponse {
  const geojson = getGeoJSON();
  const point: Coordinate = [lng, lat]; // GeoJSON uses [longitude, latitude]

  let matchedFeature: any = null;

  if (geojson.features) {
    for (const feature of geojson.features) {
      const geom = feature.geometry;
      if (!geom) continue;

      const bbox = getBoundingBox(geom.coordinates);
      if (!isPointInBBox(point, bbox)) {
        continue; // Skip features outside bbox
      }

      let isInside = false;
      if (geom.type === "Polygon") {
        isInside = isPointInPolygon(point, geom.coordinates);
      } else if (geom.type === "MultiPolygon") {
        isInside = isPointInMultiPolygon(point, geom.coordinates);
      }

      if (isInside) {
        matchedFeature = feature;
        break;
      }
    }
  }

  // If outside exact polygon boundaries (e.g. slight border delta or GPS drift), find nearest constituency center
  if (!matchedFeature) {
    let minDistance = Infinity;
    let nearestFeature: any = null;

    if (geojson.features) {
      for (const feature of geojson.features) {
        const center = feature.properties?.center;
        if (center) {
          const d = calculateDistanceKm(lat, lng, center[0], center[1]);
          if (d < minDistance) {
            minDistance = d;
            nearestFeature = feature;
          }
        }
      }
    }

    // Only match nearest if within 25km of Delhi center
    if (nearestFeature && minDistance < 25) {
      const mp = getMPBySlug(nearestFeature.properties.slug);
      return {
        success: true,
        matched_by: "coordinates",
        constituency: nearestFeature.properties.pc_name,
        slug: nearestFeature.properties.slug,
        confidence: "approximate",
        resolved_coords: { lat, lng },
        mp: mp || undefined,
      };
    }

    return {
      success: false,
      matched_by: "none",
      confidence: "none",
      error: `Coordinates (${lat}, ${lng}) fall outside Delhi Parliamentary Constituencies.`,
    };
  }

  const mp = getMPBySlug(matchedFeature.properties.slug);
  return {
    success: true,
    matched_by: "coordinates",
    constituency: matchedFeature.properties.pc_name,
    slug: matchedFeature.properties.slug,
    confidence: "exact",
    resolved_coords: { lat, lng },
    mp: mp || undefined,
  };
}

/**
 * Resolves location using a Delhi Pincode.
 */
export function resolveLocationByPincode(pincode: string): LocationResolveResponse {
  const entry = lookupPincode(pincode);
  if (!entry) {
    return {
      success: false,
      matched_by: "pincode",
      confidence: "none",
      error: `Pincode '${pincode}' was not found in the Delhi directory. Please try auto-location or another Delhi pincode (e.g. 110001, 110016, 110085).`,
    };
  }

  const mp = getMPBySlug(entry.constituency_slug);
  return {
    success: true,
    matched_by: "pincode",
    constituency: entry.constituency_name,
    slug: entry.constituency_slug,
    confidence: "exact",
    resolved_coords: {
      lat: entry.lat,
      lng: entry.lng,
    },
    mp: mp || undefined,
  };
}

/**
 * Universal resolver: handles lat/lng, pincode, or text query
 */
export function resolveLocation(req: LocationResolveRequest): LocationResolveResponse {
  if (typeof req.lat === "number" && typeof req.lng === "number") {
    return resolveLocationByCoords(req.lat, req.lng);
  }

  if (req.pincode && req.pincode.trim().length > 0) {
    return resolveLocationByPincode(req.pincode);
  }

  if (req.query && req.query.trim().length > 0) {
    const q = req.query.trim().toLowerCase();

    // Check if query is 6-digit pincode
    if (/^\d{6}$/.test(q)) {
      return resolveLocationByPincode(q);
    }

    // Check if query matches constituency or MP name
    const mps = getAllMPs();
    const matchedMP = mps.find(
      (m) =>
        m.constituency.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.slug.toLowerCase().includes(q)
    );

    if (matchedMP) {
      const geojson = getGeoJSON();
      const feat = geojson.features?.find((f: any) => f.properties.slug === matchedMP.slug);
      const center = feat?.properties?.center || [28.6139, 77.209];

      return {
        success: true,
        matched_by: "query",
        constituency: matchedMP.constituency,
        slug: matchedMP.slug,
        confidence: "exact",
        resolved_coords: {
          lat: center[0],
          lng: center[1],
        },
        mp: matchedMP,
      };
    }

    return {
      success: false,
      matched_by: "query",
      confidence: "none",
      error: `No match found for query '${req.query}'. Try searching by MP name or constituency.`,
    };
  }

  return {
    success: false,
    matched_by: "none",
    confidence: "none",
    error: "Missing search criteria. Please provide either lat/lng, pincode, or search query.",
  };
}
