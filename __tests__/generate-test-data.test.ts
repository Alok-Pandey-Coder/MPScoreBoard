/**
 * __tests__/generate-test-data.test.ts
 * Unit tests for the seeded test-data generator.
 */

import { generateSnapshot } from '../scripts/generate-test-data';
import type { Snapshot } from '../lib/types';

describe('generateSnapshot(42)', () => {
  let snapshot: Snapshot;

  beforeAll(() => {
    snapshot = generateSnapshot(42);
  });

  // ── Determinism ────────────────────────────────────────────────────────────
  it('same seed produces identical output (determinism)', () => {
    const a = generateSnapshot(42);
    const b = generateSnapshot(42);
    expect(a).toEqual(b);
  });

  it('different seeds produce different outputs', () => {
    const a = generateSnapshot(42);
    const b = generateSnapshot(99);
    expect(a.mps[0].party).not.toEqual(b.mps[0].party); // party is randomised
  });

  // ── Counts ────────────────────────────────────────────────────────────────
  it('produces exactly 16 MPs', () => {
    expect(snapshot.mps).toHaveLength(16);
  });

  it('meta.mpCount matches mps.length', () => {
    expect(snapshot.meta.mpCount).toBe(snapshot.mps.length);
  });

  it('has exactly 3 states', () => {
    const states = new Set(snapshot.mps.map(m => m.state));
    expect(states.size).toBe(3);
    expect(states.has('Test State A')).toBe(true);
    expect(states.has('Test State B')).toBe(true);
    expect(states.has('Test State C')).toBe(true);
  });

  it('Test State A has 7 MPs', () => {
    expect(snapshot.mps.filter(m => m.state === 'Test State A')).toHaveLength(7);
  });

  it('Test State B has 8 MPs', () => {
    expect(snapshot.mps.filter(m => m.state === 'Test State B')).toHaveLength(8);
  });

  it('Test State C has 1 MP', () => {
    expect(snapshot.mps.filter(m => m.state === 'Test State C')).toHaveLength(1);
  });

  // ── Global flags ──────────────────────────────────────────────────────────
  it('all MPs have isTest = true', () => {
    snapshot.mps.forEach(mp => expect(mp.isTest).toBe(true));
  });

  it('meta.dataMode is "test"', () => {
    expect(snapshot.meta.dataMode).toBe('test');
  });

  it('meta.seed is 42', () => {
    expect(snapshot.meta.seed).toBe(42);
  });

  // ── Slug uniqueness ───────────────────────────────────────────────────────
  it('all slugs are unique', () => {
    const slugs = snapshot.mps.map(m => m.slug);
    expect(new Set(slugs).size).toBe(16);
  });

  it('slug format is lowercase-hyphenated', () => {
    snapshot.mps.forEach(mp => {
      expect(mp.slug).toMatch(/^[a-z0-9-]+$/);
    });
  });

  // ── Edge case 1: minister has null performance fields ─────────────────────
  it('edge-1: exactly one minister exists', () => {
    const ministers = snapshot.mps.filter(m => m.isMinister);
    expect(ministers).toHaveLength(1);
  });

  it('edge-1: minister has no performance object', () => {
    const minister = snapshot.mps.find(m => m.isMinister)!;
    expect(minister.performance).toBeUndefined();
  });

  it('edge-1: minister is Test Region 03', () => {
    const minister = snapshot.mps.find(m => m.isMinister)!;
    expect(minister.constituency).toBe('Test Region 03');
  });

  // ── Edge case 2: null MPLADS ─────────────────────────────────────────────
  it('edge-2: at least one MP has no mplads data', () => {
    expect(snapshot.mps.find(m => !m.mplads)).toBeDefined();
  });

  it('edge-2: null mplads is Test Region 07', () => {
    const mp = snapshot.mps.find(m => m.constituency === 'Test Region 07')!;
    expect(mp.mplads).toBeUndefined();
  });

  // ── Edge case 3: null affidavit ──────────────────────────────────────────
  it('edge-3: at least one MP has no affidavit', () => {
    expect(snapshot.mps.find(m => !m.affidavit)).toBeDefined();
  });

  it('edge-3: null affidavit is Test Region 11', () => {
    const mp = snapshot.mps.find(m => m.constituency === 'Test Region 11')!;
    expect(mp.affidavit).toBeUndefined();
  });

  // ── Edge case 4: by-election MP ──────────────────────────────────────────
  it('edge-4: at least one MP has sinceDate set', () => {
    expect(snapshot.mps.find(m => m.sinceDate !== undefined)).toBeDefined();
  });

  it('edge-4: by-election MP is Test Region 05', () => {
    const mp = snapshot.mps.find(m => m.constituency === 'Test Region 05')!;
    expect(mp.sinceDate).toBeDefined();
    expect(mp.sinceDate).toBe('2025-03-15');
  });

  // ── Edge case 5: 3-term history ──────────────────────────────────────────
  it('edge-5: at least one MP has >= 3 history records', () => {
    expect(snapshot.mps.find(m => m.history.length >= 3)).toBeDefined();
  });

  it('edge-5: 3-term MP is Test Region 01 with 3 records', () => {
    const mp = snapshot.mps.find(m => m.constituency === 'Test Region 01')!;
    expect(mp.history).toHaveLength(3);
  });

  // ── Edge case 6: zero works ──────────────────────────────────────────────
  it('edge-6: at least one MP has zero works', () => {
    expect(snapshot.mps.find(m => m.works.length === 0)).toBeDefined();
  });

  it('edge-6: zero-works MP is Test Region 09', () => {
    const mp = snapshot.mps.find(m => m.constituency === 'Test Region 09')!;
    expect(mp.works).toHaveLength(0);
  });

  // ── Edge case 7: >25 works (pagination test) ─────────────────────────────
  it('edge-7: at least one MP has > 25 works', () => {
    expect(snapshot.mps.find(m => m.works.length > 25)).toBeDefined();
  });

  it('edge-7: many-works MP is Test Region 02 with 28 works', () => {
    const mp = snapshot.mps.find(m => m.constituency === 'Test Region 02')!;
    expect(mp.works.length).toBeGreaterThan(25);
    expect(mp.works).toHaveLength(28);
  });

  // ── Edge case 8: attendancePct = 0 ──────────────────────────────────────
  it('edge-8: attendancePct = 0 boundary is present', () => {
    const pcts = snapshot.mps.flatMap(m =>
      m.performance ? [m.performance.attendancePct] : [],
    );
    expect(pcts).toContain(0);
  });

  it('edge-8: zero-attendance MP is Test Region 14', () => {
    const mp = snapshot.mps.find(m => m.constituency === 'Test Region 14')!;
    expect(mp.performance?.attendancePct).toBe(0);
  });

  // ── Edge case 9: attendancePct = 100 ─────────────────────────────────────
  it('edge-9: attendancePct = 100 boundary is present', () => {
    const pcts = snapshot.mps.flatMap(m =>
      m.performance ? [m.performance.attendancePct] : [],
    );
    expect(pcts).toContain(100);
  });

  it('edge-9: full-attendance MP is Test Region 16', () => {
    const mp = snapshot.mps.find(m => m.constituency === 'Test Region 16')!;
    expect(mp.performance?.attendancePct).toBe(100);
  });

  // ── utilisationPct formula ────────────────────────────────────────────────
  it('utilisationPct = spentCr / releasedCr * 100 for all non-null values', () => {
    snapshot.mps
      .filter(m => m.mplads?.releasedCr && m.mplads.spentCr !== null)
      .forEach(m => {
        const expected = (m.mplads!.spentCr! / m.mplads!.releasedCr!) * 100;
        expect(m.mplads!.utilisationPct).toBeCloseTo(expected, 1);
      });
  });

  it('utilisationPct is null when releasedCr is zero or null', () => {
    // Structural: if mplads has null releasedCr, utilisationPct must be null
    snapshot.mps
      .filter(m => m.mplads && (m.mplads.releasedCr === null || m.mplads.releasedCr === 0))
      .forEach(m => {
        expect(m.mplads!.utilisationPct).toBeNull();
      });
  });

  // ── Sources ───────────────────────────────────────────────────────────────
  it('every MP has at least one source', () => {
    snapshot.mps.forEach(mp => {
      expect(mp.sources.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ── Averages ──────────────────────────────────────────────────────────────
  it('nationalAverages excludes the minister', () => {
    // n must be <= 15 (16 total - 1 minister)
    expect(snapshot.nationalAverages.attendancePct.n).toBeLessThanOrEqual(15);
  });

  it('stateAverages has entries for all 3 states', () => {
    expect(Object.keys(snapshot.stateAverages)).toHaveLength(3);
  });

  it('stateAverages for Test State C (1 MP, non-minister) has n <= 1', () => {
    const avg = snapshot.stateAverages['Test State C'];
    expect(avg.attendancePct.n).toBeLessThanOrEqual(1);
  });

  // ── Work and bill ID uniqueness ───────────────────────────────────────────
  it('work IDs are unique within each MP', () => {
    snapshot.mps.forEach(mp => {
      const ids = mp.works.map(w => w.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  it('bill IDs are unique within each MP', () => {
    snapshot.mps.forEach(mp => {
      const ids = mp.bills.map(b => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
