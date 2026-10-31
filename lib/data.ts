import fs from "fs";
import path from "path";
import {
  MPRecord,
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

let cachedMPs: MPRecord[] | null = null;
let cachedGeoJSON: any | null = null;

const DATA_DIR = path.join(process.cwd(), "data", "processed");

export function getAllMPs(): MPRecord[] {
  if (cachedMPs) return cachedMPs;
  const filePath = path.join(DATA_DIR, "mps.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(`Data file not found at ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  cachedMPs = JSON.parse(raw);
  return cachedMPs!;
}

export function getMPBySlug(slug: string): MPRecord | null {
  const mps = getAllMPs();
  const found = mps.find(
    (m) => m.slug.toLowerCase() === slug.toLowerCase() ||
           m.constituency.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()
  );
  return found || null;
}

export function getGeoJSON(): any {
  if (cachedGeoJSON) return cachedGeoJSON;
  const filePath = path.join(DATA_DIR, "delhi_pc.geojson");
  if (!fs.existsSync(filePath)) {
    throw new Error(`GeoJSON file not found at ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  cachedGeoJSON = JSON.parse(raw);
  return cachedGeoJSON;
}

export function getConstituenciesSummary(): ConstituencySummary[] {
  const mps = getAllMPs();
  const geojson = getGeoJSON();

  return mps.map((mp) => {
    // Find matching feature in geojson to get center
    const feat = geojson.features.find(
      (f: any) => f.properties.slug === mp.slug
    );
    const center: [number, number] = feat?.properties?.center || [28.6139, 77.209];

    return {
      slug: mp.slug,
      name: mp.constituency,
      state: mp.state,
      reservation: mp.reservation,
      mp_name: mp.name,
      party: mp.party,
      party_full: mp.party_full,
      is_minister: mp.is_minister,
      attendance_pct: mp.performance.attendance_pct,
      questions: mp.performance.questions,
      debates: mp.performance.debates,
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

  // If outside exact polygon boundaries (e.g. slight border delta or GPS drift), find nearest constituency center
  if (!matchedFeature) {
    let minDistance = Infinity;
    let nearestFeature: any = null;

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
      const feat = geojson.features.find((f: any) => f.properties.slug === matchedMP.slug);
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

