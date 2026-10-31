import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { apiError } from '@/lib/api';
import { getConstituencyGeoJSON } from '@/lib/data';

const CACHE_HEADERS = { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' };
const WARDS_FILE = path.join(process.cwd(), 'data', 'processed', 'delhi_wards_enriched.geojson');

// Parsed once per server instance; the ward layer is ~700 KB.
let cachedWards: unknown = null;

/** GET ?type=pc → constituency polygons; default → MCD ward polygons. */
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type');
  if (type === 'pc') {
    return NextResponse.json(getConstituencyGeoJSON(), { headers: CACHE_HEADERS });
  }
  try {
    if (!cachedWards) {
      cachedWards = fs.existsSync(WARDS_FILE)
        ? JSON.parse(fs.readFileSync(WARDS_FILE, 'utf-8'))
        : getConstituencyGeoJSON();
    }
    return NextResponse.json(cachedWards, { headers: CACHE_HEADERS });
  } catch {
    return apiError('INTERNAL', 'Map boundaries are temporarily unavailable.', 500);
  }
}
