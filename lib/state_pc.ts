/**
 * Constituency polygons for states other than Delhi (built by
 * scripts/build_state_pc_geojson.py into data/processed/<state>_pc.geojson).
 * Delhi's polygons live in delhi_pc.json and are read through lib/data.ts.
 */
import fs from 'fs';
import path from 'path';
import type { ConstituencyCollection } from '@/types/location';

const STATE_PC_FILES: Record<string, string> = { goa: 'goa_pc.geojson' };

const cache = new Map<string, ConstituencyCollection>();

export function hasStatePcMap(stateId: string): boolean {
  return stateId in STATE_PC_FILES;
}

/** Parsed once per server instance; throws if the file is missing. */
export function getStatePcCollection(stateId: string): ConstituencyCollection | null {
  const file = STATE_PC_FILES[stateId];
  if (!file) return null;
  let collection = cache.get(stateId);
  if (!collection) {
    collection = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'data', 'processed', file), 'utf-8')
    ) as ConstituencyCollection;
    cache.set(stateId, collection);
  }
  return collection;
}
