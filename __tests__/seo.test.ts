/**
 * __tests__/seo.test.ts
 * PRD §10.6: sitemap.xml and robots.txt are generated from the dataset with
 * absolute URLs based on NEXT_PUBLIC_SITE_URL.
 */

import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import { getAllMPs } from '@/lib/data';

const ORIGINAL_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  if (ORIGINAL_SITE_URL === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL_SITE_URL;
});

describe('sitemap', () => {
  it('lists the main pages and every report card as absolute URLs', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.test/';
    const urls = (await sitemap()).map((entry) => entry.url);
    const mps = await getAllMPs();

    expect(mps.length).toBeGreaterThanOrEqual(7);
    for (const path of ['/', '/about', '/compare', '/explore']) {
      expect(urls).toContain(`https://example.test${path}`);
    }
    const cardUrls = urls.filter((url) => url.startsWith('https://example.test/mp/'));
    expect(cardUrls).toHaveLength(mps.length);
    for (const mp of mps) expect(cardUrls).toContain(`https://example.test/mp/${mp.slug}`);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('falls back to localhost when NEXT_PUBLIC_SITE_URL is unset', async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls.every((url) => url.startsWith('http://localhost:3000/'))).toBe(true);
  });
});

describe('robots', () => {
  it('allows all crawlers and points to the sitemap', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.test';
    const result = robots();
    expect(result.rules).toEqual({ userAgent: '*', allow: '/' });
    expect(result.sitemap).toBe('https://example.test/sitemap.xml');
  });
});
