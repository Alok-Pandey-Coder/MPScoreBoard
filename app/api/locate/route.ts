import { NextRequest, NextResponse } from 'next/server';
import { resolveLocation } from '@/lib/data';
import { apiError, readJsonBody } from '@/lib/api';
import type { LocationResolveRequest, LocationResolveResponse } from '@/types/location';

function respond(result: LocationResolveResponse) {
  return NextResponse.json(
    { status: result.success ? 'success' : 'not_found', result },
    { status: result.success ? 200 : 404 },
  );
}

/** Accepts only the known fields, with the right types. */
function toRequest(input: Record<string, unknown>): LocationResolveRequest | null {
  const req: LocationResolveRequest = {};
  if (input.lat !== undefined || input.lng !== undefined) {
    const lat = Number(input.lat);
    const lng = Number(input.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    req.lat = lat;
    req.lng = lng;
  }
  if (typeof input.pincode === 'string') req.pincode = input.pincode.slice(0, 6);
  if (typeof input.query === 'string') req.query = input.query.slice(0, 100);
  return req;
}

export async function POST(req: NextRequest) {
  const body = await readJsonBody(req);
  const parsed = body && toRequest(body);
  if (!parsed) return apiError('INVALID_REQUEST', 'Expected { lat, lng } or { pincode } or { query }.', 400);
  return respond(await resolveLocation(parsed));
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const parsed = toRequest({
    lat: params.get('lat') ?? undefined,
    lng: params.get('lng') ?? undefined,
    pincode: params.get('pincode') ?? undefined,
    query: params.get('q') ?? params.get('query') ?? undefined,
  });
  if (!parsed) return apiError('INVALID_REQUEST', 'lat and lng must be numbers.', 400);
  return respond(await resolveLocation(parsed));
}
