import type { Feature, FeatureCollection, Polygon, MultiPolygon } from 'geojson';
import type { MPRecord } from './mp';

/** Properties carried by each feature in data/processed/delhi_pc.json. */
export interface ConstituencyFeatureProps {
  slug: string;
  pc_name: string;
  pc_no: number;
  state: string;
  reservation: 'GEN' | 'SC' | 'ST';
  mp_name: string;
  party: string;
  /** [lat, lng] label/centre point. */
  center: [number, number];
}

export type ConstituencyFeature = Feature<Polygon | MultiPolygon, ConstituencyFeatureProps>;
export type ConstituencyCollection = FeatureCollection<Polygon | MultiPolygon, ConstituencyFeatureProps>;

export interface LocationResolveRequest {
  lat?: number;
  lng?: number;
  pincode?: string;
  query?: string;
}

export interface LocationResolveResponse {
  success: boolean;
  matched_by: 'coordinates' | 'pincode' | 'query' | 'none';
  constituency?: string;
  slug?: string;
  confidence: 'exact' | 'approximate' | 'none';
  resolved_coords?: { lat: number; lng: number };
  mp?: MPRecord;
  error?: string;
}
