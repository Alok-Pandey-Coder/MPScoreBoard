import React from 'react';
import type { Metadata } from 'next';
import snapshotData from '@/data/processed/snapshot.json';
import { AboutContent } from './AboutContent';

export const metadata: Metadata = {
  title: 'About the data — Mera MP',
  description: 'Where the data comes from, what each indicator means and does not mean, how ministers are handled, and known limits.',
};

export default function AboutPage() {
  return <AboutContent snapshotVersion={snapshotData.snapshot_version} />;
}
