import React from 'react';
import type { Metadata } from 'next';
import snapshotData from '@/data/processed/snapshot.json';
import { getAllMPs } from '@/lib/data';
import { getCoverage, TOTAL_LOK_SABHA_SEATS } from '@/lib/coverage';
import { AboutContent } from '../AboutContent';

export const metadata: Metadata = {
  title: 'Data Sources, Provenance & Methodology — Mera MP',
  description: 'Where the data comes from, what each indicator means, how ministers are handled, affidavit data, known limits and how AI is used.',
};

export default async function AboutDataPage() {
  const { seatCount, stateCount } = getCoverage(await getAllMPs());
  return (
    <AboutContent
      snapshotVersion={snapshotData.snapshot_version}
      coverage={{ seatCount, stateCount, totalSeats: TOTAL_LOK_SABHA_SEATS }}
      initialTab="data"
    />
  );
}
