import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { getAllMPRecords } from '@/lib/mp-data';
import { CompareClient } from '@/components/compare/CompareClient';

export const metadata: Metadata = {
  title: 'Compare Lok Sabha MPs — Mera MP, Mera Report Card',
  description: 'Side-by-side neutral comparison of parliamentary attendance, debates, questions, and private member bills.',
};

export default function ComparePage() {
  const mps = getAllMPRecords();

  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-400">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold">Loading MP comparison matrix...</p>
        </div>
      }
    >
      <CompareClient mps={mps} />
    </Suspense>
  );
}
