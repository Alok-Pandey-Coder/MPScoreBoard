import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllMPRecords, getMPRecordBySlug } from '@/lib/mp-data';
import { MPReportCardClient } from '@/components/mp/MPReportCardClient';

export function generateStaticParams() {
  return getAllMPRecords().map((mp) => ({ slug: mp.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mp = getMPRecordBySlug(slug);
  if (!mp) {
    return {
      title: 'MP Not Found — Mera MP, Mera Report Card',
    };
  }
  return {
    title: `${mp.name} — ${mp.constituency}, ${mp.state}: 18th Lok Sabha Report Card`,
    description: `Track parliamentary attendance, debates, questions, MPLADS fund utilization, and sworn affidavits for ${mp.name} (${mp.constituency}, ${mp.party}).`,
  };
}

export default async function MPPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mp = getMPRecordBySlug(slug);

  if (!mp) {
    notFound();
  }

  return <MPReportCardClient mp={mp} />;
}
