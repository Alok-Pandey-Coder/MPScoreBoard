/**
 * __tests__/validate-data.test.ts
 * Unit tests for the validator logic (in-memory, no file I/O).
 */

import { validateSnapshot } from '../scripts/validate-data';
import type { Snapshot, MP, Source } from '../lib/types';

// ─── Minimal fixtures ────────────────────────────────────────────────────────

const GOOD_SOURCE: Source = {
  name: 'Test',
  url: 'https://example.com',
  retrievedAt: '2026-10-31',
};

function makeMP(overrides: Partial<MP> = {}): MP {
  return {
    slug: 'test-region-01-test-state-a',
    name: 'Test MP 01',
    party: 'Test Party A',
    state: 'Test State A',
    constituency: 'Test Region 01',
    term: '18th Lok Sabha',
    isMinister: false,
    isTest: true,
    profile: { education: 'Graduate', profession: 'Farmer', photoUrl: null },
    history: [],
    works: [],
    bills: [],
    sources: [GOOD_SOURCE],
    ...overrides,
  };
}

function makeSnapshot(mps: MP[], dataMode: 'test' | 'real' = 'test'): Snapshot {
  return {
    meta: {
      dataMode,
      generatedAt: '2026-10-31T00:00:00.000Z',
      seed: 42,
      mpCount: mps.length,
    },
    mps,
    nationalAverages: {
      attendancePct: { value: null, n: 0 },
      debates: { value: null, n: 0 },
      questions: { value: null, n: 0 },
      privateBills: { value: null, n: 0 },
    },
    stateAverages: {},
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('validateSnapshot — clean data', () => {
  it('passes a minimal valid snapshot', () => {
    const snap = makeSnapshot([makeMP()]);
    const { errors, warnings } = validateSnapshot(snap, null);
    expect(errors).toHaveLength(0);
    // One warning: dataMode = "test"
    expect(warnings.some(w => w.includes('TEST DATA'))).toBe(true);
  });
});

describe('validateSnapshot — slug checks', () => {
  it('fails on duplicate slugs', () => {
    const mp1 = makeMP({ slug: 'dupe-slug' });
    const mp2 = makeMP({ slug: 'dupe-slug', constituency: 'Test Region 02' });
    const { errors } = validateSnapshot(makeSnapshot([mp1, mp2]), null);
    expect(errors.some(e => e.includes('Duplicate slug'))).toBe(true);
  });

  it('passes when all slugs are unique', () => {
    const mp1 = makeMP({ slug: 'slug-one' });
    const mp2 = makeMP({ slug: 'slug-two', constituency: 'Test Region 02' });
    const { errors } = validateSnapshot(makeSnapshot([mp1, mp2]), null);
    expect(errors.filter(e => e.includes('slug'))).toHaveLength(0);
  });
});

describe('validateSnapshot — required fields', () => {
  it('fails when name is missing', () => {
    const mp = makeMP({ name: '' });
    const { errors } = validateSnapshot(makeSnapshot([mp]), null);
    expect(errors.some(e => e.includes('"name"'))).toBe(true);
  });

  it('fails when sources is empty', () => {
    const mp = makeMP({ sources: [] });
    const { errors } = validateSnapshot(makeSnapshot([mp]), null);
    expect(errors.some(e => e.includes('sources[]'))).toBe(true);
  });
});

describe('validateSnapshot — attendance range', () => {
  it('fails on attendancePct > 100', () => {
    const mp = makeMP({
      performance: {
        attendancePct: 110,
        debates: 5,
        questions: 20,
        privateBills: 0,
        asOf: '2026-10-31',
        attendanceBySession: [],
      },
    });
    const { errors } = validateSnapshot(makeSnapshot([mp]), null);
    expect(errors.some(e => e.includes('attendancePct out of range'))).toBe(true);
  });

  it('fails on attendancePct < 0', () => {
    const mp = makeMP({
      performance: {
        attendancePct: -5,
        debates: 5,
        questions: 20,
        privateBills: 0,
        asOf: '2026-10-31',
        attendanceBySession: [],
      },
    });
    const { errors } = validateSnapshot(makeSnapshot([mp]), null);
    expect(errors.some(e => e.includes('attendancePct out of range'))).toBe(true);
  });

  it('passes on attendancePct = 0', () => {
    const mp = makeMP({
      performance: {
        attendancePct: 0,
        debates: 0,
        questions: 0,
        privateBills: 0,
        asOf: '2026-10-31',
        attendanceBySession: [],
      },
    });
    const { errors } = validateSnapshot(makeSnapshot([mp]), null);
    expect(errors.filter(e => e.includes('attendancePct'))).toHaveLength(0);
  });
});

describe('validateSnapshot — MPLADS checks', () => {
  it('fails when spentCr > releasedCr', () => {
    const mp = makeMP({
      mplads: {
        entitlementCr: 25,
        releasedCr: 10,
        spentCr: 15,           // > released
        utilisationPct: 150,
        unspentCr: -5,
        asOf: '2026-03-31',
        byYear: [],
      },
    });
    const { errors } = validateSnapshot(makeSnapshot([mp]), null);
    expect(errors.some(e => e.includes('spentCr') && e.includes('releasedCr'))).toBe(true);
  });

  it('warns when utilisationPct differs from recomputed value by >0.5', () => {
    const mp = makeMP({
      mplads: {
        entitlementCr: 25,
        releasedCr: 20,
        spentCr: 10,
        utilisationPct: 99,    // clearly wrong; should be 50
        unspentCr: 10,
        asOf: '2026-03-31',
        byYear: [],
      },
    });
    const { warnings } = validateSnapshot(makeSnapshot([mp]), null);
    expect(warnings.some(w => w.includes('utilisationPct'))).toBe(true);
  });

  it('warns when byYear sum of releasedCr differs >5%', () => {
    const mp = makeMP({
      mplads: {
        entitlementCr: 25,
        releasedCr: 20,
        spentCr: 10,
        utilisationPct: 50,
        unspentCr: 10,
        asOf: '2026-03-31',
        byYear: [
          { fy: '2024-25', releasedCr: 5, spentCr: 5 }, // sum = 5, but total = 20 → >5% diff
        ],
      },
    });
    const { warnings } = validateSnapshot(makeSnapshot([mp]), null);
    expect(warnings.some(w => w.includes('byYear sum of releasedCr'))).toBe(true);
  });
});

describe('validateSnapshot — ID uniqueness', () => {
  it('fails on duplicate work IDs within one MP', () => {
    const mp = makeMP({
      works: [
        {
          id: 'dup-work', title: 'A', category: 'roads', locality: null,
          sanctionedCr: 1, spentCr: 1, status: 'completed',
          recommendedOn: null, completedOn: null,
        },
        {
          id: 'dup-work', title: 'B', category: 'water', locality: null,
          sanctionedCr: 1, spentCr: 0, status: 'sanctioned',
          recommendedOn: null, completedOn: null,
        },
      ],
    });
    const { errors } = validateSnapshot(makeSnapshot([mp]), null);
    expect(errors.some(e => e.includes('duplicate work id'))).toBe(true);
  });

  it('fails on duplicate bill IDs within one MP', () => {
    const mp = makeMP({
      bills: [
        { id: 'dup-bill', title: 'Bill A', introducedOn: '2024-01-01', type: 'private_member', status: 'introduced' },
        { id: 'dup-bill', title: 'Bill B', introducedOn: '2024-02-01', type: 'private_member', status: 'lapsed' },
      ],
    });
    const { errors } = validateSnapshot(makeSnapshot([mp]), null);
    expect(errors.some(e => e.includes('duplicate bill id'))).toBe(true);
  });
});

describe('validateSnapshot — GeoJSON slug matching', () => {
  it('fails when GeoJSON is missing an MP slug', () => {
    const mp = makeMP({ slug: 'missing-in-geo' });
    const geo = JSON.stringify({ type: 'FeatureCollection', features: [] });
    const { errors } = validateSnapshot(makeSnapshot([mp]), geo);
    expect(errors.some(e => e.includes('missing-in-geo'))).toBe(true);
  });

  it('fails when GeoJSON has an extra slug not in MPs', () => {
    const mp = makeMP({ slug: 'valid-slug' });
    const geo = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: null, properties: { slug: 'valid-slug' } },
        { type: 'Feature', geometry: null, properties: { slug: 'extra-slug' } },
      ],
    });
    const { errors } = validateSnapshot(makeSnapshot([mp]), geo);
    expect(errors.some(e => e.includes('extra-slug'))).toBe(true);
  });

  it('passes when GeoJSON slugs match MPs exactly', () => {
    const mp = makeMP({ slug: 'exact-match' });
    const geo = JSON.stringify({
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: null, properties: { slug: 'exact-match' } }],
    });
    const { errors } = validateSnapshot(makeSnapshot([mp]), geo);
    expect(errors.filter(e => e.includes('slug'))).toHaveLength(0);
  });
});

describe('validateSnapshot — REQUIRE_REAL_DATA guard', () => {
  const originalEnv = process.env.REQUIRE_REAL_DATA;

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.REQUIRE_REAL_DATA;
    else process.env.REQUIRE_REAL_DATA = originalEnv;
  });

  it('fails when dataMode=test and REQUIRE_REAL_DATA=1', () => {
    process.env.REQUIRE_REAL_DATA = '1';
    const snap = makeSnapshot([makeMP()], 'test');
    const { errors } = validateSnapshot(snap, null);
    expect(errors.some(e => e.includes('REQUIRE_REAL_DATA'))).toBe(true);
  });

  it('passes when dataMode=real and REQUIRE_REAL_DATA=1', () => {
    process.env.REQUIRE_REAL_DATA = '1';
    const mp = makeMP({ isTest: false });
    const snap = makeSnapshot([mp], 'real');
    const { errors } = validateSnapshot(snap, null);
    expect(errors.filter(e => e.includes('REQUIRE_REAL_DATA'))).toHaveLength(0);
  });
});
