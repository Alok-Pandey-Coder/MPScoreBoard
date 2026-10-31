import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { getAllMPs } from '@/lib/data';
import { CompareClient } from '@/components/compare/CompareClient';
import { CompareLoading } from './CompareLoading';

export const metadata: Metadata = {
  title: 'Compare Lok Sabha MPs — Mera MP, Mera Report Card',
  description: 'Side-by-side neutral comparison of parliamentary attendance, debates, questions, and private member bills.',
};

export default async function ComparePage() {
  const mps = await getAllMPs();

  return (
    <Suspense fallback={<CompareLoading />}>
      <CompareClient mps={mps} />
    </Suspense>
  );
}
