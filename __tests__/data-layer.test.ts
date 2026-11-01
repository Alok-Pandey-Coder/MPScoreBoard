/**
 * __tests__/data-layer.test.ts
 * The single data-access layer (lib/data.ts) and the shared API helpers
 * (lib/api.ts): canonical lookups, slug redirects, location resolution,
 * snapshot metadata, body validation and rate limiting.
 */

import {
  getAllMPs,
  getDataSource,
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
  it('is computed from the data and names no state', async () => {
    const mps = await getAllMPs();
    const coverage = getCoverage(mps);
    expect(coverage.seatCount).toBe(mps.length);
    const note = coverageNote(coverage);
    expect(note).toBe(`Report cards for ${coverage.seatCount} of ${TOTAL_LOK_SABHA_SEATS} constituencies so far. More are being added.`);
    expect(note).not.toMatch(/delhi/i);
  });

  it('sums MPLADS only over reported seats and keeps null when none are reported', async () => {
    const mps = await getAllMPs();
    const expected = mps.reduce((total, mp) => total + (mp.mplads?.allocated_cr ?? 0), 0);
    expect(getCoverage(mps).mpladsAllocatedCr).toBeCloseTo(expected, 4);
    const none = mps.map((mp) => ({ ...mp, mplads: { status: 'pending' as const } }));
    expect(getCoverage(none).mpladsAllocatedCr).toBeNull();
    expect(getCoverage(none).mpladsSpentCr).toBeNull();
  });
});

describe('data source', () => {
  it('serves the JSON snapshot when DATABASE_URL is not set', async () => {
    expect(process.env.DATABASE_URL).toBeUndefined();
    await expect(getDataSource()).resolves.toBe('json-snapshot');
  });
});

describe('MP records', () => {
  it('serves the seven Delhi and two Goa seats with unique slugs', async () => {
    const mps = await getAllMPs();
    expect(mps).toHaveLength(9);
    expect(new Set(mps.map((mp) => mp.slug)).size).toBe(9);
    expect(mps.filter((mp) => mp.state === 'Delhi')).toHaveLength(7);
    expect(mps.filter((mp) => mp.state === 'Goa')).toHaveLength(2);
  });

  it('matches only canonical slugs, case-insensitively', async () => {
    expect((await getMPBySlug('new-delhi-delhi'))?.constituency).toBe('New Delhi');
    expect((await getMPBySlug('  NEW-DELHI-DELHI '))?.slug).toBe('new-delhi-delhi');
    // A short alias is not served as duplicate content; it must redirect instead.
    expect(await getMPBySlug('new-delhi')).toBeUndefined();
    expect(await getMPBySlug('nowhere')).toBeUndefined();
  });

  it('resolves aliases to canonical slugs for 308 redirects', async () => {
    expect(await resolveCanonicalSlug('new-delhi')).toBe('new-delhi-delhi');
    expect(await resolveCanonicalSlug('north-west-delhi')).toBe('north-west-delhi-delhi');
    expect(await resolveCanonicalSlug('south-delhi-delhi')).toBe('south-delhi-delhi');
    expect(await resolveCanonicalSlug('varanasi')).toBeNull();
  });
});

describe('snapshot metadata', () => {
  it('derives the snapshot date from snapshot.json rather than a hardcoded value', async () => {
    const meta = await getSnapshotMeta();
    expect(await getSnapshotDate()).toBe(meta.generated_at.slice(0, 10));
    expect(meta.record_count).toBe((await getAllMPs()).length);
  });
});

describe('location resolution', () => {
  it('finds the constituency containing a point (Connaught Place → New Delhi)', async () => {
    const result = await resolveLocationByCoords(28.6315, 77.2167);
    expect(result.success).toBe(true);
    expect(result.slug).toBe('new-delhi-delhi');
    expect(result.mp?.slug).toBe('new-delhi-delhi');
  });

  it('rejects points far outside the covered constituencies', async () => {
    const result = await resolveLocationByCoords(19.076, 72.8777); // Mumbai
    expect(result.success).toBe(false);
    expect(result.confidence).toBe('none');
  });

  it('resolves a free-text MP or constituency query', async () => {
    expect((await resolveLocation({ query: 'chandni' })).slug).toBe('chandni-chowk-delhi');
    expect((await resolveLocation({ query: 'zzzz' })).success).toBe(false);
    expect((await resolveLocation({})).success).toBe(false);
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
