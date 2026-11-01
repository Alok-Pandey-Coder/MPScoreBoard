import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import aliasesJson from '@/data/processed/aliases.json';
import { getAllMPs, getMPBySlug, resolveCanonicalSlug } from '@/lib/data';
import { MPReportCardClient } from '@/components/mp/MPReportCardClient';
import { stateAverageSampleSize } from '@/lib/stateAverages';

/**
 * Only the slugs returned by generateStaticParams exist. Any other slug is
 * answered by Next's own 404 handling, which renders app/not-found.tsx into
 * the server HTML. With the default (`true`), an unknown slug is rendered on
 * demand and notFound() from that render falls back to an empty error shell
 * that is filled in only on the client.
 * See node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/dynamicParams.md
 */
export const dynamicParams = false;

const slugRedirects =
  (aliasesJson as { slug_redirects?: Record<string, string> }).slug_redirects ?? {};

export async function generateStaticParams() {
  const canonical = (await getAllMPs()).map((mp) => mp.slug);
  // PRD §5.7: old or short slugs are prerendered too, as permanent redirects.
  const aliases: string[] = [];
  for (const alias of Object.keys(slugRedirects)) {
    if (!canonical.includes(alias) && (await resolveCanonicalSlug(alias))) aliases.push(alias);
  }
  return [...canonical, ...aliases].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mp = await getMPBySlug(slug);
  if (!mp) {
    return { title: 'MP Not Found — Mera MP, Mera Report Card' };
  }
  const title = `${mp.name} — ${mp.constituency}, ${mp.state}: Lok Sabha report card`;
  const description = `Attendance, debates, questions, MPLADS funds and declared affidavit details for ${mp.name} (${mp.constituency}, ${mp.state}), with sources and dates.`;
  return {
    title,
    description,
    alternates: { canonical: `/mp/${mp.slug}` },
    openGraph: { title, description, type: 'profile', url: `/mp/${mp.slug}` },
    twitter: { card: 'summary', title, description },
  };
}

export default async function MPPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mp = await getMPBySlug(slug);
  if (!mp) {
    // PRD §5.7: old or short slugs redirect permanently to the canonical card.
    const canonical = await resolveCanonicalSlug(slug);
    if (canonical) permanentRedirect(`/mp/${canonical}`);
    notFound();
  }

  const stateAverageN = stateAverageSampleSize(await getAllMPs(), mp.state);
  return <MPReportCardClient mp={mp} stateAverageN={stateAverageN} />;
}
