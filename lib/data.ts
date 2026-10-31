/**
 * lib/data.ts — the only data-access layer.
 *
 * Every page, API route and server component reads MP data through this
 * module. Records come from the latest approved snapshot in YugabyteDB when
 * DATABASE_URL is set (lib/db.ts), and from the JSON snapshot built by the
 * Python pipeline otherwise (data/processed/mps.json). If the database is
 * configured but unreachable, the JSON snapshot is served and getDataSource()
 * says so, so the site (and the offline demo) never goes blank.
 */
import mpsJson from '@/data/processed/mps.json';
import snapshotJson from '@/data/processed/snapshot.json';
import aliasesJson from '@/data/processed/aliases.json';
import delhiPcJson from '@/data/processed/delhi_pc.json';
import type { MPRecord, SnapshotMetadata } from '@/types/mp';
import type {
  ConstituencyCollection,
  ConstituencyFeature,
  LocationResolveRequest,
  LocationResolveResponse,
} from '@/types/location';
import {
  calculateDistanceKm,
  getBoundingBox,
  isPointInBBox,
  isPointInMultiPolygon,
  isPointInPolygon,
  type Coordinate,
  type MultiPolygonCoordinates,
  type PolygonCoordinates,
} from './spatial';
import { lookupPincode } from './delhi_pincodes';

export type DataSource = 'yugabytedb' | 'json-snapshot' | 'json-snapshot (database unreachable)';

interface Dataset {
  mps: MPRecord[];
  bySlug: Map<string, MPRecord>;
  snapshot: SnapshotMetadata;
  source: DataSource;
}

const slugRedirects = (aliasesJson as { slug_redirects?: Record<string, string> }).slug_redirects ?? {};
const constituencies = delhiPcJson as unknown as ConstituencyCollection;

function dataset(mps: MPRecord[], snapshot: SnapshotMetadata, source: DataSource): Dataset {
  return { mps, bySlug: new Map(mps.map((mp) => [mp.slug, mp])), snapshot, source };
}

// JSON imports are typed structurally by TS; the pipeline validates the shape
// against types/mp.ts (scripts/07_validate.py), so the cast is checked there.
const jsonDataset = (source: DataSource) =>
  dataset(mpsJson as unknown as MPRecord[], snapshotJson as unknown as SnapshotMetadata, source);

async function loadDataset(): Promise<Dataset> {
  // Imported lazily so the JSON path (tests, offline demo) never loads the pg driver.
  const db = await import('./db');
  if (!db.isDatabaseConfigured()) return jsonDataset('json-snapshot');
  try {
    const latest = await db.readLatestSnapshot();
    if (latest && latest.records.length > 0) return dataset(latest.records, latest.meta, 'yugabytedb');
    console.warn('[data] YugabyteDB has no snapshot loaded yet; serving the JSON snapshot. Run scripts/load_db.py.');
  } catch (error) {
    console.warn('[data] YugabyteDB unreachable; serving the JSON snapshot.', error instanceof Error ? error.message : error);
  }
  return jsonDataset('json-snapshot (database unreachable)');
}

// One load per server process (and per build), shared by every caller.
let cached: Promise<Dataset> | null = null;
function getDataset(): Promise<Dataset> {
  cached ??= loadDataset();
  return cached;
}

// ── MP records ──────────────────────────────────────────────────────────────

export async function getAllMPs(): Promise<MPRecord[]> {
  return (await getDataset()).mps;
}

/** Exact lookup on the canonical slug, e.g. "new-delhi-delhi". */
export async function getMPBySlug(slug: string): Promise<MPRecord | undefined> {
  return (await getDataset()).bySlug.get(slug.trim().toLowerCase());
}

/**
 * Maps an alias or old slug (e.g. "new-delhi") to its canonical slug, or
 * returns null when the slug is unknown. Canonical slugs map to themselves.
 */
export async function resolveCanonicalSlug(slug: string): Promise<string | null> {
  const { bySlug } = await getDataset();
  const normalized = slug.trim().toLowerCase();
  if (bySlug.has(normalized)) return normalized;
  const target = slugRedirects[normalized];
  return target && bySlug.has(target) ? target : null;
}

// ── Snapshot metadata ───────────────────────────────────────────────────────

export async function getSnapshotMeta(): Promise<SnapshotMetadata> {
  return (await getDataset()).snapshot;
}

/** Snapshot build date (YYYY-MM-DD), or "unknown". */
export async function getSnapshotDate(): Promise<string> {
  const generatedAt = (await getDataset()).snapshot.generated_at;
  return typeof generatedAt === 'string' && generatedAt.length >= 10 ? generatedAt.slice(0, 10) : 'unknown';
}

/** Where the records currently served come from (shown by /api/health). */
export async function getDataSource(): Promise<DataSource> {
  return (await getDataset()).source;
}

// ── Constituency geometry and location lookup ───────────────────────────────

export function getConstituencyGeoJSON(): ConstituencyCollection {
  return constituencies;
}

function containsPoint(feature: ConstituencyFeature, point: Coordinate): boolean {
  const geom = feature.geometry;
  if (!geom) return false;
  const coords = geom.coordinates as PolygonCoordinates | MultiPolygonCoordinates;
  if (!isPointInBBox(point, getBoundingBox(coords))) return false;
  return geom.type === 'Polygon'
    ? isPointInPolygon(point, coords as PolygonCoordinates)
    : isPointInMultiPolygon(point, coords as MultiPolygonCoordinates);
}

function byCoords(data: Dataset, lat: number, lng: number): LocationResolveResponse {
  const point: Coordinate = [lng, lat]; // GeoJSON order is [lng, lat]
  const exact = constituencies.features.find((feature) => containsPoint(feature, point));
  if (exact) {
    return {
      success: true,
      matched_by: 'coordinates',
      constituency: exact.properties.pc_name,
      slug: exact.properties.slug,
      confidence: 'exact',
      resolved_coords: { lat, lng },
      mp: data.bySlug.get(exact.properties.slug),
    };
  }

  // Slight border deltas or GPS drift: take the nearest constituency centre.
  let nearest: ConstituencyFeature | null = null;
  let minDistance = Infinity;
  for (const feature of constituencies.features) {
    const [cLat, cLng] = feature.properties.center;
    const distance = calculateDistanceKm(lat, lng, cLat, cLng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = feature;
    }
  }
  if (nearest && minDistance < 25) {
    return {
      success: true,
      matched_by: 'coordinates',
      constituency: nearest.properties.pc_name,
      slug: nearest.properties.slug,
      confidence: 'approximate',
      resolved_coords: { lat, lng },
      mp: data.bySlug.get(nearest.properties.slug),
    };
  }

  return {
    success: false,
    matched_by: 'none',
    confidence: 'none',
    error: 'This location is outside the constituencies covered so far.',
  };
}

function byPincode(data: Dataset, pincode: string): LocationResolveResponse {
  const entry = lookupPincode(pincode);
  if (!entry) {
    return {
      success: false,
      matched_by: 'pincode',
      confidence: 'none',
      error: `Pincode '${pincode}' was not found in the pincode directory.`,
    };
  }
  return {
    success: true,
    matched_by: 'pincode',
    constituency: entry.constituency_name,
    slug: entry.constituency_slug,
    confidence: 'exact',
    resolved_coords: { lat: entry.lat, lng: entry.lng },
    mp: data.bySlug.get(entry.constituency_slug),
  };
}

/** Point-in-polygon lookup, with a nearest-centre fallback within 25 km. */
export async function resolveLocationByCoords(lat: number, lng: number): Promise<LocationResolveResponse> {
  return byCoords(await getDataset(), lat, lng);
}

/** Resolves lat/lng, a pincode, or a free-text constituency/MP query. */
export async function resolveLocation(req: LocationResolveRequest): Promise<LocationResolveResponse> {
  const data = await getDataset();
  if (typeof req.lat === 'number' && typeof req.lng === 'number') {
    return byCoords(data, req.lat, req.lng);
  }
  if (req.pincode?.trim()) {
    return byPincode(data, req.pincode.trim());
  }

  const q = req.query?.trim().toLowerCase();
  if (!q) {
    return {
      success: false,
      matched_by: 'none',
      confidence: 'none',
      error: 'Provide lat/lng, a pincode, or a search query.',
    };
  }
  if (/^\d{6}$/.test(q)) return byPincode(data, q);

  const mp = data.mps.find(
    (m) => m.constituency.toLowerCase().includes(q) || m.name.toLowerCase().includes(q) || m.slug.includes(q),
  );
  if (!mp) {
    return {
      success: false,
      matched_by: 'query',
      confidence: 'none',
      error: `No match found for '${req.query}'. Try an MP name or constituency.`,
    };
  }
  const feature = constituencies.features.find((f) => f.properties.slug === mp.slug);
  const [lat, lng] = feature?.properties.center ?? [28.6139, 77.209];
  return {
    success: true,
    matched_by: 'query',
    constituency: mp.constituency,
    slug: mp.slug,
    confidence: 'exact',
    resolved_coords: { lat, lng },
    mp,
  };
}
