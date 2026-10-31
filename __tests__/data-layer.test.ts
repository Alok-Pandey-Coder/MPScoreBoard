/**
 * __tests__/data-layer.test.ts
 * The single data-access layer (lib/data.ts) and the shared API helpers
 * (lib/api.ts): canonical lookups, slug redirects, location resolution,
 * snapshot metadata, body validation and rate limiting.
 */

import {
  getAllMPs,
  getMPBySlug,
  getSnapshotDate,
  getSnapshotMeta,
  resolveCanonicalSlug,
  resolveLocation,
  resolveLocationByCoords,
} from '@/lib/data';
import { createRateLimiter, MAX_BODY_BYTES, readJsonBody } from '@/lib/api';
import { coverageNote, getCoverage, TOTAL_LOK_SABHA_SEATS } from '@/lib/coverage';

describe('coverage copy', () => {
  it('is computed from the data and names no state', () => {
    const coverage = getCoverage(getAllMPs());
    expect(coverage.seatCount).toBe(getAllMPs().length);
    const note = coverageNote(coverage);
    expect(note).toBe(`Report cards for ${coverage.seatCount} of ${TOTAL_LOK_SABHA_SEATS} constituencies so far. More are being added.`);
    expect(note).not.toMatch(/delhi/i);
  });

  it('sums MPLADS only over reported seats and keeps null when none are reported', () => {
    const mps = getAllMPs();
    const expected = mps.reduce((total, mp) => total + (mp.mplads?.allocated_cr ?? 0), 0);
    expect(getCoverage(mps).mpladsAllocatedCr).toBeCloseTo(expected, 4);
    const none = mps.map((mp) => ({ ...mp, mplads: { status: 'pending' as const } }));
    expect(getCoverage(none).mpladsAllocatedCr).toBeNull();
    expect(getCoverage(none).mpladsSpentCr).toBeNull();
  });
});

describe('MP records', () => {
  it('serves the seven Delhi seats with unique slugs', () => {
    const mps = getAllMPs();
    expect(mps).toHaveLength(7);
    expect(new Set(mps.map((mp) => mp.slug)).size).toBe(7);
    expect(mps.every((mp) => mp.state === 'Delhi')).toBe(true);
  });

  it('matches only canonical slugs, case-insensitively', () => {
    expect(getMPBySlug('new-delhi-delhi')?.constituency).toBe('New Delhi');
    expect(getMPBySlug('  NEW-DELHI-DELHI ')?.slug).toBe('new-delhi-delhi');
    // A short alias is not served as duplicate content; it must redirect instead.
    expect(getMPBySlug('new-delhi')).toBeUndefined();
    expect(getMPBySlug('nowhere')).toBeUndefined();
  });

  it('resolves aliases to canonical slugs for 308 redirects', () => {
    expect(resolveCanonicalSlug('new-delhi')).toBe('new-delhi-delhi');
    expect(resolveCanonicalSlug('north-west-delhi')).toBe('north-west-delhi-delhi');
    expect(resolveCanonicalSlug('south-delhi-delhi')).toBe('south-delhi-delhi');
    expect(resolveCanonicalSlug('varanasi')).toBeNull();
  });
});

describe('snapshot metadata', () => {
  it('derives the snapshot date from snapshot.json rather than a hardcoded value', () => {
    const meta = getSnapshotMeta();
    expect(getSnapshotDate()).toBe(meta.generated_at.slice(0, 10));
    expect(meta.record_count).toBe(getAllMPs().length);
  });
});

describe('location resolution', () => {
  it('finds the constituency containing a point (Connaught Place → New Delhi)', () => {
    const result = resolveLocationByCoords(28.6315, 77.2167);
    expect(result.success).toBe(true);
    expect(result.slug).toBe('new-delhi-delhi');
    expect(result.mp?.slug).toBe('new-delhi-delhi');
  });

  it('rejects points far outside Delhi', () => {
    const result = resolveLocationByCoords(19.076, 72.8777); // Mumbai
    expect(result.success).toBe(false);
    expect(result.confidence).toBe('none');
  });

  it('resolves a free-text MP or constituency query', () => {
    expect(resolveLocation({ query: 'chandni' }).slug).toBe('chandni-chowk-delhi');
    expect(resolveLocation({ query: 'zzzz' }).success).toBe(false);
    expect(resolveLocation({}).success).toBe(false);
  });
});

describe('API helpers', () => {
  const post = (body: string) => new Request('http://localhost/api', { method: 'POST', body });

  it('accepts a small JSON object body', async () => {
    await expect(readJsonBody(post('{"slug":"new-delhi-delhi"}'))).resolves.toEqual({ slug: 'new-delhi-delhi' });
  });

  it('rejects malformed, non-object and oversize bodies', async () => {
    await expect(readJsonBody(post('{bad json'))).resolves.toBeNull();
    await expect(readJsonBody(post('[1,2]'))).resolves.toBeNull();
    await expect(readJsonBody(post('"text"'))).resolves.toBeNull();
    await expect(readJsonBody(post(JSON.stringify({ x: 'a'.repeat(MAX_BODY_BYTES) })))).resolves.toBeNull();
  });

  it('rate-limits per key within a window and reports Retry-After', () => {
    const check = createRateLimiter(2, 60_000);
    expect(check('a').ok).toBe(true);
    expect(check('a').ok).toBe(true);
    const third = check('a');
    expect(third.ok).toBe(false);
    if (!third.ok) expect(third.retryAfterSec).toBeGreaterThan(0);
    // Separate clients are counted separately.
    expect(check('b').ok).toBe(true);
  });
});
