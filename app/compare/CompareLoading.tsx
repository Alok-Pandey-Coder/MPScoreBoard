'use client';

import React from 'react';
import { useMessages } from '@/context/LanguageContext';
import { compareMessages } from '@/lib/messages/compare';

/** Suspense fallback for /compare, in the chosen UI language. */
export function CompareLoading() {
  const t = useMessages(compareMessages);
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-400" role="status">
      <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto mb-3" />
      <p className="text-sm font-semibold">{t.loading}</p>
    </div>
  );
}
