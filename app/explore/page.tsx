import React from 'react';
import type { Metadata } from 'next';
import { getAllMPs } from '@/lib/data';
import { ExploreAtlasClient } from '@/components/explore/ExploreAtlasClient';

export const metadata: Metadata = {
  title: 'Map — Mera MP',
  description: 'Map of Indian states and Lok Sabha constituencies. MP report cards are being added state by state.',
};

export default async function ExplorePage() {
  const mps = await getAllMPs();
  return <ExploreAtlasClient mps={mps} />;
}

