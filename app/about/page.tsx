import React from 'react';
import type { Metadata } from 'next';
import snapshotData from '@/data/processed/snapshot.json';
import { getAllMPs } from '@/lib/data';
import { getCoverage, TOTAL_LOK_SABHA_SEATS } from '@/lib/coverage';
import { AboutContent } from './AboutContent';

export const metadata: Metadata = {
  title: 'About the Product & Data — Mera MP',
  description: 'Explore the vision, product UI tour, verified data sources, minister handling, affidavit data, known limits and how AI is used.',
};

export default async function AboutPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const initialTab = resolvedParams?.tab === 'data' ? 'data' : 'product';

  // Coverage is computed from the data so the limitations copy never hard-codes a state or count.
  const { seatCount, stateCount } = getCoverage(await getAllMPs());
  return (
    <AboutContent
      snapshotVersion={snapshotData.snapshot_version}
      coverage={{ seatCount, stateCount, totalSeats: TOTAL_LOK_SABHA_SEATS }}
      initialTab={initialTab}
    />
  );
}
