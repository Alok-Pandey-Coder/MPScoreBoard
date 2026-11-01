import type { MetadataRoute } from 'next';
import { getAllMPs, getSnapshotDate } from '@/lib/data';

/** Absolute site origin (no trailing slash), from NEXT_PUBLIC_SITE_URL. */
function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
}

const STATIC_PATHS = ['/', '/about', '/compare', '/explore'] as const;

/** PRD §10.6: every page route plus one URL per report card, built from the dataset. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const snapshotDate = await getSnapshotDate();
  const lastModified = snapshotDate === 'unknown' ? undefined : snapshotDate;

  const pages: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: path === '/' ? `${base}/` : `${base}${path}`,
    lastModified,
  }));
  const cards: MetadataRoute.Sitemap = (await getAllMPs()).map((mp) => ({
    url: `${base}/mp/${mp.slug}`,
    lastModified,
  }));
  return [...pages, ...cards];
}
