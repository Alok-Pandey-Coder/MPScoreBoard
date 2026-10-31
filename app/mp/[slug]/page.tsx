import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllMPs, getMPBySlug, resolveCanonicalSlug } from '@/lib/data';
import { MPReportCardClient } from '@/components/mp/MPReportCardClient';

export function generateStaticParams() {
  return getAllMPs().map((mp) => ({ slug: mp.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mp = getMPBySlug(slug);
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
  const mp = getMPBySlug(slug);
  if (!mp) {
    // PRD §5.7: old or short slugs redirect permanently to the canonical card.
    const canonical = resolveCanonicalSlug(slug);
    if (canonical) permanentRedirect(`/mp/${canonical}`);
    notFound();
  }

  return <MPReportCardClient mp={mp} />;
}
