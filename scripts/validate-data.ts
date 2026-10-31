/**
 * scripts/validate-data.ts
 *
 * Validates data/processed/mps.test.json (or mps.json if present).
 * Run: npm run data:validate
 *
 * Exit codes:
 *   0 — passed (warnings may be printed)
 *   1 — hard error (duplicate slug, out-of-range value, etc.) or
 *       REQUIRE_REAL_DATA=1 + dataMode = "test"
 *
 * Safety guard: if REQUIRE_REAL_DATA=1 and dataMode is "test",
 * validation FAILS so test data can't be shipped as real data.
 */

import fs from 'fs';
import path from 'path';
import type { Snapshot, MP } from '../lib/types';

// ─── Loader ─────────────────────────────────────────────────────────────────

function loadSnapshot(): { snapshot: Snapshot; geoPath: string } {
  const processed = path.resolve(process.cwd(), 'data', 'processed');

  const realMpPath  = path.join(processed, 'mps.json');
  const testMpPath  = path.join(processed, 'mps.test.json');
  const realGeoPath = path.join(processed, 'regions.geojson');
  const testGeoPath = path.join(processed, 'regions.test.geojson');

  // Prefer real mps.json — but only if it has the Snapshot shape ({meta, mps[]}).
  // The legacy mps.json in this repo is a plain array (pre-Step-1 data),
  // so we detect that and fall back to the test files gracefully.
  let mpPath = testMpPath;
  let geoPath = testGeoPath;

  if (fs.existsSync(realMpPath)) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- shape probe
      const probe = JSON.parse(fs.readFileSync(realMpPath, 'utf-8')) as any;
      if (probe && !Array.isArray(probe) && Array.isArray(probe.mps) && probe.meta) {
        mpPath  = realMpPath;
        geoPath = fs.existsSync(realGeoPath) ? realGeoPath : testGeoPath;
      }
    } catch {
      // parse failed — fall through to test files
    }
  }

  if (!fs.existsSync(mpPath)) {
    console.error('FATAL: No mps.json (Snapshot shape) or mps.test.json found in data/processed/');
    process.exit(1);
  }

  const raw = fs.readFileSync(mpPath, 'utf-8');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSON parse needs any
  const snapshot = JSON.parse(raw) as any;

  // Minimal top-level shape check before we trust it
  if (!snapshot || !Array.isArray(snapshot.mps) || !snapshot.meta) {
    console.error('FATAL: File does not look like a valid Snapshot (missing .mps or .meta).');
    process.exit(1);
  }

  return { snapshot: snapshot as Snapshot, geoPath };
}

// ─── Validator ───────────────────────────────────────────────────────────────

interface ValidationResult {
  errors: string[];
  warnings: string[];
}

export function validateSnapshot(
  snapshot: Snapshot,
  geoRaw: string | null,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const { mps, meta } = snapshot;

  // ── REQUIRE_REAL_DATA guard ────────────────────────────────────────────────
  if (meta.dataMode === 'test' && process.env.REQUIRE_REAL_DATA === '1') {
    errors.push(
      'FATAL: dataMode = "test" but REQUIRE_REAL_DATA=1. Test data must not be deployed as real.',
    );
  }

  // ── Test data warning ──────────────────────────────────────────────────────
  if (meta.dataMode === 'test') {
    warnings.push(
      '⚠  WARNING: dataMode = "test". This is TEST DATA. Do not publish as real.',
    );
  }

  // ── Duplicate slugs ────────────────────────────────────────────────────────
  const slugsSeen = new Set<string>();
  for (const mp of mps) {
    if (slugsSeen.has(mp.slug)) {
      errors.push(`Duplicate slug: "${mp.slug}"`);
    }
    slugsSeen.add(mp.slug);
  }

  for (const mp of mps) {
    const ctx = `MP "${mp.slug}"`;

    // ── Required fields ──────────────────────────────────────────────────────
    const required: (keyof MP)[] = ['name', 'party', 'state', 'constituency', 'term'];
    for (const field of required) {
      if (!mp[field]) errors.push(`${ctx}: missing required field "${field}"`);
    }

    // ── At least one source ──────────────────────────────────────────────────
    if (!mp.sources || mp.sources.length === 0) {
      errors.push(`${ctx}: sources[] must have at least one entry`);
    }

    // ── Attendance range ─────────────────────────────────────────────────────
    if (mp.performance?.attendancePct !== null && mp.performance?.attendancePct !== undefined) {
      const pct = mp.performance.attendancePct;
      if (pct < 0 || pct > 100) {
        errors.push(`${ctx}: performance.attendancePct out of range [0,100]: ${pct}`);
      }
    }

    // ── MPLADS: can't spend more than released ───────────────────────────────
    if (mp.mplads) {
      const { releasedCr, spentCr, utilisationPct } = mp.mplads;
      if (
        releasedCr !== null && spentCr !== null &&
        spentCr > releasedCr + 0.01 // 0.01 tolerance for float rounding
      ) {
        errors.push(`${ctx}: mplads.spentCr (${spentCr}) > releasedCr (${releasedCr})`);
      }

      // utilisationPct range check
      if (utilisationPct !== null && (utilisationPct < 0 || utilisationPct > 100.1)) {
        errors.push(`${ctx}: mplads.utilisationPct out of range: ${utilisationPct}`);
      }

      // utilisationPct recompute check (warn if drifted)
      if (releasedCr !== null && releasedCr > 0 && spentCr !== null && utilisationPct !== null) {
        const expected = (spentCr / releasedCr) * 100;
        if (Math.abs(expected - utilisationPct) > 0.5) {
          warnings.push(
            `${ctx}: utilisationPct stored (${utilisationPct}) differs from recomputed (${expected.toFixed(1)}) by > 0.5`,
          );
        }
      }

      // byYear sum check (soft warning, ±5%)
      const byYearReleased = mp.mplads.byYear.reduce((s, y) => s + (y.releasedCr ?? 0), 0);
      const byYearSpent    = mp.mplads.byYear.reduce((s, y) => s + (y.spentCr ?? 0), 0);

      if (releasedCr !== null && releasedCr > 0) {
        const releasedDiff = Math.abs(byYearReleased - releasedCr) / releasedCr;
        if (releasedDiff > 0.05) {
          warnings.push(
            `${ctx}: byYear sum of releasedCr (${byYearReleased.toFixed(2)}) differs from mplads.releasedCr (${releasedCr}) by > 5%`,
          );
        }
      }
      if (spentCr !== null && spentCr > 0) {
        const spentDiff = Math.abs(byYearSpent - spentCr) / spentCr;
        if (spentDiff > 0.05) {
          warnings.push(
            `${ctx}: byYear sum of spentCr (${byYearSpent.toFixed(2)}) differs from mplads.spentCr (${spentCr}) by > 5%`,
          );
        }
      }
    }

    // ── Work IDs unique within MP ────────────────────────────────────────────
    const workIds = new Set<string>();
    for (const work of mp.works ?? []) {
      if (workIds.has(work.id)) {
        errors.push(`${ctx}: duplicate work id "${work.id}"`);
      }
      workIds.add(work.id);
    }

    // ── Bill IDs unique within MP ────────────────────────────────────────────
    const billIds = new Set<string>();
    for (const bill of mp.bills ?? []) {
      if (billIds.has(bill.id)) {
        errors.push(`${ctx}: duplicate bill id "${bill.id}"`);
      }
      billIds.add(bill.id);
    }

    // ── isTest consistency ───────────────────────────────────────────────────
    if (meta.dataMode === 'test' && !mp.isTest) {
      warnings.push(`${ctx}: dataMode is "test" but mp.isTest is false`);
    }
  }

  // ── GeoJSON slug 1:1 match ───────────────────────────────────────────────
  if (geoRaw !== null) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSON parse
      const geo = JSON.parse(geoRaw) as any;
      const geoSlugs: Set<string> = new Set(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSON parse
        (geo.features ?? []).map((f: any) => f.properties?.slug as string),
      );
      const mpSlugs = new Set(mps.map(m => m.slug));

      for (const s of mpSlugs) {
        if (!geoSlugs.has(s)) errors.push(`GeoJSON missing feature for MP slug "${s}"`);
      }
      for (const s of geoSlugs) {
        if (!mpSlugs.has(s)) errors.push(`GeoJSON has extra feature for unknown slug "${s}"`);
      }
    } catch {
      errors.push('GeoJSON file could not be parsed as JSON');
    }
  }

  return { errors, warnings };
}

// ─── CLI entry point ─────────────────────────────────────────────────────────

function main() {
  const { snapshot, geoPath } = loadSnapshot();

  const geoRaw = fs.existsSync(geoPath)
    ? fs.readFileSync(geoPath, 'utf-8')
    : null;

  if (!geoRaw) {
    console.warn(`⚠  GeoJSON not found at ${geoPath} — skipping geo checks`);
  }

  const { errors, warnings } = validateSnapshot(snapshot, geoRaw);

  for (const w of warnings) console.warn(w);

  if (errors.length === 0) {
    console.log(`✓  ${snapshot.mps.length} MPs validated`);
    if (geoRaw) console.log(`✓  GeoJSON: features checked, slugs match 1:1`);
    console.log(`✓  No hard errors\n`);
    process.exit(0);
  } else {
    console.error('\n✗  Validation FAILED:\n');
    for (const e of errors) console.error(`  ${e}`);
    console.error(`\n${errors.length} error(s)\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
