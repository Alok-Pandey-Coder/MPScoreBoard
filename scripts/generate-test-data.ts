/**
 * scripts/generate-test-data.ts
 *
 * Seeded test-data generator for "Mera MP, Mera Report Card".
 * Run: npm run data:test
 * Output:
 *   data/processed/mps.test.json    — Snapshot with 16 fictional MPs
 *   data/processed/regions.test.geojson — GeoJSON FeatureCollection (16 cells)
 *
 * Design:
 *  - Uses mulberry32 PRNG so the same seed always produces the same output.
 *  - All names are fictional. No real politicians, no real parties.
 *  - All MPs: isTest = true, meta.dataMode = "test".
 *  - utilisationPct = spentCr / releasedCr * 100 (null when either is null or releasedCr === 0).
 *
 * Edge cases embedded:
 *  minister (null performance), null mplads, null affidavit, by-election MP,
 *  3-term history, 0 works, >25 works, attendancePct at 0 and 100,
 *  MultiPolygon region, polygon with a hole.
 */

import fs from 'fs';
import path from 'path';
import type {
  Snapshot, MP, TermRecord, Work, Bill, Source, Averages, MetricAverage,
} from '../lib/types';

// ─── PRNG ──────────────────────────────────────────────────────────────────

/**
 * mulberry32 — a fast, seedable 32-bit PRNG.
 * Returns a closure that produces a float in [0, 1).
 */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function randInt(rand: () => number, min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function randFloat(rand: () => number, min: number, max: number, decimals = 1): number {
  const v = rand() * (max - min) + min;
  const factor = 10 ** decimals;
  return Math.round(v * factor) / factor;
}

function randChoice<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

/**
 * utilisationPct = spentCr / releasedCr * 100
 * Null when releasedCr is null, zero, or spentCr is null.
 */
function calcUtilisation(spent: number | null, released: number | null): number | null {
  if (spent === null || released === null || released === 0) return null;
  return Math.round((spent / released) * 1000) / 10; // one decimal place
}

function isoDate(year: number, month = 1, day = 1): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ─── Static lookup tables ───────────────────────────────────────────────────

const STATES: readonly string[] = ['Test State A', 'Test State B', 'Test State C'];
const PARTIES: readonly string[] = ['Test Party A', 'Test Party B', 'Test Party C'];
const EDUCATIONS: readonly string[] = ['Graduate', 'Post Graduate', 'Doctorate', '12th Pass', null as unknown as string];
const PROFESSIONS: readonly string[] = ['Farmer', 'Lawyer', 'Businessman', 'Social Worker', 'Teacher'];
const WORK_CATEGORIES: readonly Work['category'][] = [
  'roads', 'water', 'education', 'health', 'sanitation', 'community', 'other',
];
const WORK_STATUSES: readonly Work['status'][] = [
  'recommended', 'sanctioned', 'in_progress', 'completed',
];
const BILL_STATUSES: readonly Bill['status'][] = [
  'introduced', 'discussed', 'withdrawn', 'lapsed', 'other',
];
const LOK_SABHAS: readonly string[] = [
  '15th Lok Sabha', '16th Lok Sabha', '17th Lok Sabha', '18th Lok Sabha',
];
const SESSIONS: readonly string[] = [
  'Budget Session 2024', 'Monsoon Session 2024', 'Winter Session 2024',
  'Budget Session 2025', 'Monsoon Session 2025',
];

// ─── GeoJSON geometry helpers ───────────────────────────────────────────────

// 16 cells arranged in a 4-col × 4-row grid over the Delhi-NCR bounding box.
// lng: 76.80 – 77.60 (width 0.80, divided into 4 cols of 0.20 each)
// lat: 28.30 – 29.00 (height 0.70, divided into 4 rows of 0.175 each)
const GRID_COLS = 4;
const LNG_MIN = 76.80;
const LAT_MIN = 28.30;
const CELL_WIDTH  = 0.20;
const CELL_HEIGHT = 0.175;

type LngLat = [number, number];
type Ring = LngLat[];
type GeoPolygon = { type: 'Polygon'; coordinates: Ring[] };
type GeoMultiPolygon = { type: 'MultiPolygon'; coordinates: Ring[][] };

/** Build a simple rectangular ring (closed, CCW). */
function rect(lngMin: number, latMin: number, w: number, h: number): Ring {
  return [
    [lngMin,     latMin],
    [lngMin + w, latMin],
    [lngMin + w, latMin + h],
    [lngMin,     latMin + h],
    [lngMin,     latMin],
  ];
}

/** Cell index (0-based) → (col, row). */
function cellPos(i: number): { col: number; row: number } {
  return { col: i % GRID_COLS, row: Math.floor(i / GRID_COLS) };
}

/** Build the outer rect for cell i. */
function cellRect(i: number): { lngMin: number; latMin: number } {
  const { col, row } = cellPos(i);
  return {
    lngMin: LNG_MIN + col * CELL_WIDTH,
    latMin: LAT_MIN + row * CELL_HEIGHT,
  };
}

/**
 * Build the geometry for a given cell index (0-based).
 *
 * Special cases:
 *  index 4 (Region 05) → MultiPolygon: main rect split with a gap.
 *  index 9 (Region 10) → Polygon with a hole (inner cutout).
 *  All others          → Polygon.
 */
function buildGeometry(i: number): GeoPolygon | GeoMultiPolygon {
  const { lngMin, latMin } = cellRect(i);

  if (i === 4) {
    // MultiPolygon: two non-adjacent rectangles (left half and right half, with a gap)
    const gap = 0.01;
    const halfW = (CELL_WIDTH - gap) / 2;
    const poly1 = rect(lngMin, latMin, halfW, CELL_HEIGHT);
    const poly2 = rect(lngMin + halfW + gap, latMin, halfW, CELL_HEIGHT);
    return { type: 'MultiPolygon', coordinates: [[poly1], [poly2]] };
  }

  if (i === 9) {
    // Polygon with a hole: outer ring + inner ring (CCW outer, CW hole)
    const outer = rect(lngMin, latMin, CELL_WIDTH, CELL_HEIGHT);
    const hPad = 0.04; // hole padding from the edge
    // Inner ring is clockwise (hole convention for GeoJSON)
    const hole: Ring = [
      [lngMin + hPad,            latMin + hPad],
      [lngMin + hPad,            latMin + CELL_HEIGHT - hPad],
      [lngMin + CELL_WIDTH - hPad, latMin + CELL_HEIGHT - hPad],
      [lngMin + CELL_WIDTH - hPad, latMin + hPad],
      [lngMin + hPad,            latMin + hPad],
    ];
    return { type: 'Polygon', coordinates: [outer, hole] };
  }

  return { type: 'Polygon', coordinates: [rect(lngMin, latMin, CELL_WIDTH, CELL_HEIGHT)] };
}

// ─── Work generator ─────────────────────────────────────────────────────────

function makeWork(rand: () => number, mpSlug: string, idx: number): Work {
  const status = randChoice(rand, WORK_STATUSES);
  const sanctioned = randFloat(rand, 0.1, 5.0, 2);
  const spentRatio = status === 'completed' ? 1.0 : randFloat(rand, 0, 0.95, 2);
  const spent = Math.round(sanctioned * spentRatio * 100) / 100;
  return {
    id: `${mpSlug}-work-${String(idx + 1).padStart(3, '0')}`,
    title: `Work ${idx + 1} — ${randChoice(rand, ['Road widening', 'Water supply', 'School renovation', 'Health centre', 'Community hall', 'Drainage', 'Street lights', 'Park development', 'Bridge repair', 'Footpath'])}`,
    category: randChoice(rand, WORK_CATEGORIES),
    locality: `Locality ${randInt(rand, 1, 50)}`,
    sanctionedCr: sanctioned,
    spentCr: spent,
    status,
    recommendedOn: isoDate(randInt(rand, 2024, 2025), randInt(rand, 1, 12), randInt(rand, 1, 28)),
    completedOn: status === 'completed'
      ? isoDate(randInt(rand, 2025, 2026), randInt(rand, 1, 12), randInt(rand, 1, 28))
      : null,
  };
}

function makeBill(rand: () => number, mpSlug: string, idx: number): Bill {
  return {
    id: `${mpSlug}-bill-${String(idx + 1).padStart(3, '0')}`,
    title: `The ${randChoice(rand, ['Consumer Protection', 'Environment', 'Education Access', 'Digital Rights', 'Agricultural Support', 'Worker Welfare', 'Healthcare Access'])} (Amendment) Bill, ${randInt(rand, 2024, 2026)}`,
    introducedOn: isoDate(randInt(rand, 2024, 2026), randInt(rand, 1, 12), randInt(rand, 1, 28)),
    type: 'private_member',
    status: randChoice(rand, BILL_STATUSES),
  };
}

// ─── History generator ──────────────────────────────────────────────────────

function makeHistory(
  rand: () => number,
  constituency: string,
  state: string,
  numTerms: number,
): TermRecord[] {
  const records: TermRecord[] = [];
  for (let t = 0; t < numTerms; t++) {
    const lsIndex = LOK_SABHAS.length - 1 - t;
    const ls = LOK_SABHAS[Math.max(0, lsIndex)];
    const fromYear = 2024 - t * 5;
    records.push({
      lokSabha: ls,
      constituency,
      state,
      party: randChoice(rand, PARTIES),
      fromYear,
      toYear: t === 0 ? null : fromYear + 5,
      attendancePct: t === 0 ? null : randFloat(rand, 50, 100, 1),
      debates: t === 0 ? null : randInt(rand, 0, 80),
      questions: t === 0 ? null : randInt(rand, 0, 300),
      privateBills: t === 0 ? null : randInt(rand, 0, 5),
    });
  }
  return records; // newest first
}

// ─── Averages calculator ────────────────────────────────────────────────────

function calcMetricAvg(values: (number | null)[]): MetricAverage {
  const valid = values.filter((v): v is number => v !== null);
  if (valid.length === 0) return { value: null, n: 0 };
  const sum = valid.reduce((a, b) => a + b, 0);
  return { value: Math.round((sum / valid.length) * 10) / 10, n: valid.length };
}

function computeAverages(mps: MP[]): Averages {
  // Ministers and nulls excluded per spec.
  const eligible = mps.filter(m => !m.isMinister && m.performance);
  return {
    attendancePct: calcMetricAvg(eligible.map(m => m.performance!.attendancePct)),
    debates:       calcMetricAvg(eligible.map(m => m.performance!.debates)),
    questions:     calcMetricAvg(eligible.map(m => m.performance!.questions)),
    privateBills:  calcMetricAvg(eligible.map(m => m.performance!.privateBills)),
  };
}

// ─── Main generator ─────────────────────────────────────────────────────────

/**
 * Generate the full Snapshot from a seed.
 * Exported so unit tests can call it directly without file I/O.
 */
export function generateSnapshot(seed: number): Snapshot {
  const rand = mulberry32(seed);

  /**
   * Layout: 16 MPs mapped to 3 states.
   * Indices 0-6  → Test State A (7 MPs)
   * Indices 7-14 → Test State B (8 MPs)
   * Index  15    → Test State C (1 MP)
   */
  function stateForIndex(i: number): string {
    if (i < 7) return 'Test State A';
    if (i < 15) return 'Test State B';
    return 'Test State C';
  }

  const TEST_SOURCE: Source = {
    name: 'Test Data Generator',
    url: 'https://example.com/test-data',
    retrievedAt: '2026-10-31',
  };

  const mps: MP[] = [];

  for (let i = 0; i < 16; i++) {
    const regionNum = String(i + 1).padStart(2, '0');
    const state = stateForIndex(i);
    const stateSlug = slugify(state);
    const constituency = `Test Region ${regionNum}`;
    const slug = `test-region-${regionNum}-${stateSlug}`;
    const party = randChoice(rand, PARTIES);
    const isMinister = i === 2; // Region 03 = minister (edge case 1)

    // ── History ────────────────────────────────────────────────────────────
    let numTerms = 1;
    if (i === 0) numTerms = 3; // Region 01: 3-term veteran (edge case 5)
    else if (i === 4) numTerms = 1; // by-election — only current term
    const history = makeHistory(rand, constituency, state, numTerms);

    // ── Performance ────────────────────────────────────────────────────────
    let performanceField: MP['performance'];
    if (!isMinister) {
      // Edge case 8: Region 14 (index 13) has attendancePct = 0
      // Edge case 9: Region 16 (index 15) has attendancePct = 100
      let attendancePct: number | null;
      if (i === 13) attendancePct = 0;
      else if (i === 15) attendancePct = 100;
      else attendancePct = randFloat(rand, 50, 99, 1);

      performanceField = {
        attendancePct,
        debates:      randInt(rand, 0, 80),
        questions:    randInt(rand, 0, 300),
        privateBills: randInt(rand, 0, 5),
        asOf: '2026-10-31',
        attendanceBySession: SESSIONS.map(session => ({
          session,
          pct: randFloat(rand, 40, 100, 1),
        })),
      };
    }
    // Ministers: performanceField remains undefined (absent, not null-obj)

    // ── MPLADS ────────────────────────────────────────────────────────────
    let mpladsField: MP['mplads'];
    if (i !== 6) { // Region 07 (index 6): null mplads (edge case 2)
      const entitlementCr = 25.0;
      const releasedCr = randFloat(rand, 10, 25, 2);
      const spentCr = randFloat(rand, 0, releasedCr, 2);
      const utilisationPct = calcUtilisation(spentCr, releasedCr);
      const unspentCr = Math.round((releasedCr - spentCr) * 100) / 100;

      // byYear: 2 fiscal years
      const fy1Released = randFloat(rand, 5, 12, 2);
      const fy1Spent = randFloat(rand, 0, fy1Released, 2);
      const fy2Released = Math.round((releasedCr - fy1Released) * 100) / 100;
      const fy2Spent = Math.round((spentCr - fy1Spent) * 100) / 100;

      mpladsField = {
        entitlementCr,
        releasedCr,
        spentCr,
        utilisationPct,
        unspentCr,
        asOf: '2026-03-31',
        byYear: [
          { fy: '2024-25', releasedCr: fy1Released, spentCr: fy1Spent },
          { fy: '2025-26', releasedCr: fy2Released, spentCr: fy2Spent },
        ],
      };
    }

    // ── Works ──────────────────────────────────────────────────────────────
    let works: Work[] = [];
    if (i === 8) {
      works = []; // Region 09 (index 8): zero works (edge case 6)
    } else if (i === 1) {
      // Region 02 (index 1): 28 works — tests pagination (edge case 7)
      works = Array.from({ length: 28 }, (_, j) => makeWork(rand, slug, j));
    } else {
      works = Array.from({ length: randInt(rand, 1, 10) }, (_, j) => makeWork(rand, slug, j));
    }

    // ── Bills ──────────────────────────────────────────────────────────────
    const numBills = isMinister ? 0 : randInt(rand, 0, 4);
    const bills: Bill[] = Array.from({ length: numBills }, (_, j) => makeBill(rand, slug, j));

    // ── Affidavit ──────────────────────────────────────────────────────────
    let affidavitField: MP['affidavit'];
    if (i !== 10) { // Region 11 (index 10): null affidavit (edge case 3)
      affidavitField = {
        totalAssetsRs: randInt(rand, 500000, 100000000),
        declaredCases: randInt(rand, 0, 3),
        education: randChoice(rand, EDUCATIONS) ?? null,
        electionYear: 2024,
      };
    }

    // ── By-election sinceDate ───────────────────────────────────────────────
    const sinceDate: string | undefined = i === 4
      ? '2025-03-15' // Region 05: by-election (edge case 4)
      : undefined;

    const mp: MP = {
      slug,
      name: `Test MP ${regionNum}`,
      party,
      state,
      constituency,
      reservation: randChoice(rand, ['GEN', 'SC', 'ST'] as const),
      term: '18th Lok Sabha',
      ...(sinceDate !== undefined && { sinceDate }),
      isMinister,
      isTest: true,
      profile: {
        education: randChoice(rand, EDUCATIONS) ?? null,
        profession: randChoice(rand, PROFESSIONS),
        photoUrl: null,
      },
      history,
      ...(performanceField !== undefined && { performance: performanceField }),
      ...(mpladsField !== undefined && { mplads: mpladsField }),
      works,
      bills,
      ...(affidavitField !== undefined && { affidavit: affidavitField }),
      sources: [TEST_SOURCE],
    };

    mps.push(mp);
  }

  // ── Averages ───────────────────────────────────────────────────────────────
  const nationalAverages = computeAverages(mps);
  const stateAverages: Record<string, Averages> = {};
  for (const state of STATES) {
    stateAverages[state] = computeAverages(mps.filter(m => m.state === state));
  }

  return {
    meta: {
      dataMode: 'test',
      generatedAt: '2026-10-31T00:00:00.000Z',
      seed,
      mpCount: mps.length,
      boundaryVintage: 'synthetic-test-grid-v1',
    },
    mps,
    nationalAverages,
    stateAverages,
  };
}

// ─── GeoJSON FeatureCollection ──────────────────────────────────────────────

interface GeoFeature {
  type: 'Feature';
  geometry: GeoPolygon | GeoMultiPolygon;
  properties: {
    slug: string;
    constituency: string;
    state: string;
    mpName: string;
    isTest: boolean;
  };
}

interface GeoFeatureCollection {
  type: 'FeatureCollection';
  features: GeoFeature[];
}

function buildGeoJSON(mps: MP[]): GeoFeatureCollection {
  const features: GeoFeature[] = mps.map((mp, i) => ({
    type: 'Feature',
    geometry: buildGeometry(i),
    properties: {
      slug: mp.slug,
      constituency: mp.constituency,
      state: mp.state,
      mpName: mp.name,
      isTest: true,
    },
  }));
  return { type: 'FeatureCollection', features };
}

// ─── CLI entry point ────────────────────────────────────────────────────────

function main() {
  const SEED = 42;
  const snapshot = generateSnapshot(SEED);
  const geojson  = buildGeoJSON(snapshot.mps);

  const outDir = path.resolve(process.cwd(), 'data', 'processed');
  fs.mkdirSync(outDir, { recursive: true });

  const mpPath  = path.join(outDir, 'mps.test.json');
  const geoPath = path.join(outDir, 'regions.test.geojson');

  fs.writeFileSync(mpPath,  JSON.stringify(snapshot, null, 2), 'utf-8');
  fs.writeFileSync(geoPath, JSON.stringify(geojson,  null, 2), 'utf-8');

  // ── Summary print ──────────────────────────────────────────────────────────
  const stateCounts: Record<string, number> = {};
  for (const mp of snapshot.mps) {
    stateCounts[mp.state] = (stateCounts[mp.state] ?? 0) + 1;
  }

  console.log(`\n✓ Generated ${snapshot.mps.length} MPs`);
  for (const [state, count] of Object.entries(stateCounts)) {
    console.log(`  ${state}: ${count} MPs`);
  }

  const minister    = snapshot.mps.find(m => m.isMinister);
  const nullMplads  = snapshot.mps.find(m => !m.mplads);
  const nullAff     = snapshot.mps.find(m => !m.affidavit);
  const byElection  = snapshot.mps.find(m => m.sinceDate !== undefined);
  const veteran     = snapshot.mps.find(m => m.history.length >= 3);
  const zeroWorks   = snapshot.mps.find(m => m.works.length === 0);
  const manyWorks   = snapshot.mps.find(m => m.works.length > 25);
  const pct0        = snapshot.mps.find(m => m.performance?.attendancePct === 0);
  const pct100      = snapshot.mps.find(m => m.performance?.attendancePct === 100);
  const multiPoly   = snapshot.mps[4]; // index 4
  const withHole    = snapshot.mps[9]; // index 9

  console.log('\nEdge cases:');
  console.log(`  minister (no performance): ${minister?.constituency} (${minister?.state})`);
  console.log(`  null mplads:              ${nullMplads?.constituency} (${nullMplads?.state})`);
  console.log(`  null affidavit:           ${nullAff?.constituency} (${nullAff?.state})`);
  console.log(`  by-election MP:           ${byElection?.constituency} (sinceDate: ${byElection?.sinceDate})`);
  console.log(`  3-term history:           ${veteran?.constituency} (${veteran?.history.length} terms)`);
  console.log(`  0 works:                  ${zeroWorks?.constituency}`);
  console.log(`  ${manyWorks?.works.length} works (>25):           ${manyWorks?.constituency}`);
  console.log(`  attendancePct=0:          ${pct0?.constituency}`);
  console.log(`  attendancePct=100:        ${pct100?.constituency}`);
  console.log(`  MultiPolygon region:      ${multiPoly.constituency}`);
  console.log(`  polygon with hole:        ${withHole.constituency}`);

  console.log(`\n✓ Wrote ${mpPath}`);
  console.log(`✓ Wrote ${geoPath}\n`);
}

if (require.main === module) {
  main();
}
