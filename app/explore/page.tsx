import React from 'react';
import type { Metadata } from 'next';
import { getAllMPs } from '@/lib/data';
import { ExploreAtlasClient } from '@/components/explore/ExploreAtlasClient';

export const metadata: Metadata = {
  title: 'Map — Mera MP',
  description: 'Map of Indian states and Lok Sabha constituencies. Full MP report cards are available for Delhi for now.',
};

export default function ExplorePage() {
  const mps = getAllMPs();
  return <ExploreAtlasClient mps={mps} />;
}

