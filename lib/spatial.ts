/**
 * Spatial utilities for Point-In-Polygon detection and Bounding Box calculation.
 * Implements Ray-Casting algorithm for 2D Polygons and MultiPolygons.
 */

export type Coordinate = [number, number]; // [lng, lat]
export type PolygonCoordinates = Coordinate[][]; // Ring 0 is outer boundary, Ring 1+ are holes
export type MultiPolygonCoordinates = Coordinate[][][];

export interface BoundingBox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

/**
 * Calculates Bounding Box for fast preliminary intersection check
 */
export function getBoundingBox(coords: PolygonCoordinates | MultiPolygonCoordinates): BoundingBox {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  function update(pt: Coordinate) {
    const [lng, lat] = pt;
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  }

  // Handle MultiPolygon or Polygon
  if (Array.isArray(coords[0]) && Array.isArray(coords[0][0]) && Array.isArray(coords[0][0][0])) {
    // MultiPolygon
    (coords as MultiPolygonCoordinates).forEach(poly => poly.forEach(ring => ring.forEach(update)));
  } else {
    // Polygon
    (coords as PolygonCoordinates).forEach(ring => ring.forEach(update));
  }

  return { minLng, minLat, maxLng, maxLat };
}

/**
 * Checks if a point [lng, lat] is inside a bounding box
 */
export function isPointInBBox(pt: Coordinate, bbox: BoundingBox): boolean {
  const [lng, lat] = pt;
  return lng >= bbox.minLng && lng <= bbox.maxLng && lat >= bbox.minLat && lat <= bbox.maxLat;
}

/**
 * Ray-casting algorithm to test if a point is inside a single polygon ring
 */
function isPointInRing(point: Coordinate, ring: Coordinate[]): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Point in Polygon (including outer boundary and excluding holes)
 */
export function isPointInPolygon(point: Coordinate, rings: PolygonCoordinates): boolean {
  if (rings.length === 0) return false;
  // Point must be inside the outer ring (index 0)
  if (!isPointInRing(point, rings[0])) {
    return false;
  }
  // Point must NOT be inside any hole (index 1..n)
  for (let i = 1; i < rings.length; i++) {
    if (isPointInRing(point, rings[i])) {
      return false; // inside a hole
    }
  }
  return true;
}

/**
 * Point in MultiPolygon
 */
export function isPointInMultiPolygon(point: Coordinate, multiPoly: MultiPolygonCoordinates): boolean {
  for (const poly of multiPoly) {
    if (isPointInPolygon(point, poly)) {
      return true;
    }
  }
  return false;
}

/**
 * Distance in km between two lat/lng points using Haversine formula
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

