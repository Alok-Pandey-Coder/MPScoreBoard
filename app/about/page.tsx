import React from 'react';
import type { Metadata } from 'next';
import snapshotData from '@/data/processed/snapshot.json';
import { getAllMPs } from '@/lib/data';
import { getCoverage, TOTAL_LOK_SABHA_SEATS } from '@/lib/coverage';
import { AboutContent } from './AboutContent';

export const metadata: Metadata = {
  title: 'About the data — Mera MP',
  description: 'Where the data comes from, what each indicator means and does not mean, how ministers are handled, affidavit data, known limits and how AI is used.',
};

export default async function AboutPage() {
  // Coverage is computed from the data so the limitations copy never hard-codes a state or count.
  const { seatCount, stateCount } = getCoverage(await getAllMPs());
  return (
    <AboutContent
      snapshotVersion={snapshotData.snapshot_version}
      coverage={{ seatCount, stateCount, totalSeats: TOTAL_LOK_SABHA_SEATS }}
    />
  );
}
