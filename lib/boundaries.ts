import fs from "node:fs";
import path from "node:path";

export interface BoundaryFeature {
  slug: string;
  constituency: string;
  state: string;
  mpName: string;
  coordinates: number[][][];
}

interface GeoFeature {
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
  properties: {
    slug: string;
    constituency: string;
    state: string;
    mpName: string;
  };
}

function outerRing(feature: GeoFeature): number[][][] {
  return feature.geometry.type === "Polygon"
    ? feature.geometry.coordinates as number[][][]
    : (feature.geometry.coordinates as number[][][][])[0];
}

export function getBoundaryFeatures(): BoundaryFeature[] {
  if (process.env.MP_DATA_MODE !== "test") return [];
  const file = path.join(process.cwd(), "data", "processed", "regions.test.geojson");
  const testRegions = JSON.parse(fs.readFileSync(file, "utf8")) as { features: GeoFeature[] };
  return testRegions.features.map((feature) => ({
    ...feature.properties,
    coordinates: outerRing(feature),
  }));
}
