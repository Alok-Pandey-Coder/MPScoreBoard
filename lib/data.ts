/**
 * lib/data.ts — the only data-access layer.
 *
 * Every page, API route and server component reads MP data through this
 * module. The data comes from the static snapshot built by the Python
 * pipeline (data/processed/mps.json); swapping it for a database later only
 * means changing the loaders here.
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

// JSON imports are typed structurally by TS; the pipeline validates the shape
// against types/mp.ts (scripts/07_validate.py), so the cast is checked there.
const mps = mpsJson as unknown as MPRecord[];
const snapshot = snapshotJson as unknown as SnapshotMetadata;
const slugRedirects = (aliasesJson as { slug_redirects?: Record<string, string> }).slug_redirects ?? {};
const constituencies = delhiPcJson as unknown as ConstituencyCollection;

const bySlug = new Map(mps.map((mp) => [mp.slug, mp]));

// ── MP records ──────────────────────────────────────────────────────────────

export function getAllMPs(): MPRecord[] {
  return mps;
}

/** Exact lookup on the canonical slug, e.g. "new-delhi-delhi". */
export function getMPBySlug(slug: string): MPRecord | undefined {
  return bySlug.get(slug.trim().toLowerCase());
}

/**
 * Maps an alias or old slug (e.g. "new-delhi") to its canonical slug, or
 * returns null when the slug is unknown. Canonical slugs map to themselves.
 */
export function resolveCanonicalSlug(slug: string): string | null {
  const normalized = slug.trim().toLowerCase();
  if (bySlug.has(normalized)) return normalized;
  const target = slugRedirects[normalized];
  return target && bySlug.has(target) ? target : null;
}

// ── Snapshot metadata ───────────────────────────────────────────────────────

export function getSnapshotMeta(): SnapshotMetadata {
  return snapshot;
}

/** Snapshot build date (YYYY-MM-DD), or "unknown". */
export function getSnapshotDate(): string {
  const generatedAt = snapshot.generated_at;
  return typeof generatedAt === 'string' && generatedAt.length >= 10 ? generatedAt.slice(0, 10) : 'unknown';
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

/** Point-in-polygon lookup, with a nearest-centre fallback within 25 km. */
export function resolveLocationByCoords(lat: number, lng: number): LocationResolveResponse {
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
      mp: getMPBySlug(exact.properties.slug),
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
      mp: getMPBySlug(nearest.properties.slug),
    };
  }

  return {
    success: false,
    matched_by: 'none',
    confidence: 'none',
    error: 'This location is outside the Delhi parliamentary constituencies covered so far.',
  };
}

export function resolveLocationByPincode(pincode: string): LocationResolveResponse {
  const entry = lookupPincode(pincode);
  if (!entry) {
    return {
      success: false,
      matched_by: 'pincode',
      confidence: 'none',
      error: `Pincode '${pincode}' was not found in the Delhi directory.`,
    };
  }
  return {
    success: true,
    matched_by: 'pincode',
    constituency: entry.constituency_name,
    slug: entry.constituency_slug,
    confidence: 'exact',
    resolved_coords: { lat: entry.lat, lng: entry.lng },
    mp: getMPBySlug(entry.constituency_slug),
  };
}

/** Resolves lat/lng, a pincode, or a free-text constituency/MP query. */
export function resolveLocation(req: LocationResolveRequest): LocationResolveResponse {
  if (typeof req.lat === 'number' && typeof req.lng === 'number') {
    return resolveLocationByCoords(req.lat, req.lng);
  }
  if (req.pincode?.trim()) {
    return resolveLocationByPincode(req.pincode.trim());
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
  if (/^\d{6}$/.test(q)) return resolveLocationByPincode(q);

  const mp = mps.find(
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
