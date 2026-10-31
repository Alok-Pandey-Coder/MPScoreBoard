import React from 'react';
import type { Metadata } from 'next';
import { getAllMPs } from '@/lib/data';
import { ExploreAtlasClient } from '@/components/explore/ExploreAtlasClient';

export const metadata: Metadata = {
  title: 'All-India Geospatial Atlas — 543 Lok Sabha Constituencies',
  description: 'Interactive map of all Indian states, Union Territories, and Lok Sabha parliamentary constituencies with source data.',
};

export default function ExplorePage() {
  const mps = getAllMPs();
  return <ExploreAtlasClient mps={mps} />;
}

