'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { GitCompare, Share2, ExternalLink, Info } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { Toast } from '@/components/common/Toast';

interface CompareClientProps {
  mps: MPRecord[];
}

export const CompareClient: React.FC<CompareClientProps> = ({ mps }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const slugA = searchParams?.get('a') || mps[0]?.slug || '';
  const slugB = searchParams?.get('b') || mps[2]?.slug || mps[1]?.slug || '';

  const [selectedA, setSelectedA] = useState(slugA);
  const [selectedB, setSelectedB] = useState(slugB);
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    if (selectedA && selectedB) {
      router.replace(`/compare?a=${selectedA}&b=${selectedB}`, { scroll: false });
    }
  }, [selectedA, selectedB, router]);

  const mpA = mps.find((m) => m.slug === selectedA) || mps[0];
  const mpB = mps.find((m) => m.slug === selectedB) || mps[1];

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setToastOpen(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200 dark:border-[#1E2636]">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-0.5">
            PARLIAMENTARY BENCHMARK MATRIX
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white font-sans tracking-tight flex items-center gap-2.5">
            <GitCompare className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <span>Side-by-Side MP Comparison</span>
          </h1>
          <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-1">
            Factual indicator benchmarking without subjective scoring or ordinal rankings
          </p>
        </div>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-stone-100 dark:bg-[#141C28] hover:bg-stone-200 dark:hover:bg-[#1E2838] text-stone-700 dark:text-stone-300 rounded-lg text-xs font-mono font-semibold transition-colors self-start sm:self-auto border border-stone-200 dark:border-[#222E42] cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-stone-400" />
          <span>Share Link</span>
        </button>
      </div>

      {/* Mandatory Non-ranking Notice */}
      <div className="bg-stone-50 dark:bg-[#101622] border border-stone-200 dark:border-[#1E2636] rounded-lg p-3.5 flex items-center gap-3 text-xs font-mono text-stone-600 dark:text-stone-400">
        <Info className="w-4 h-4 text-amber-500 shrink-0" />
        <span>
          Comparisons reflect quantitative activity indicators from official parliamentary logs. They do not constitute a rank, score, or performance evaluation.
        </span>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Selector MP A */}
        <div className="bg-white dark:bg-[#0E1420] p-4 sm:p-5 rounded-xl border border-stone-200/90 dark:border-[#1E2636] shadow-xs">
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
            Member A
          </label>
          <select
            value={selectedA}
            onChange={(e) => setSelectedA(e.target.value)}
            className="w-full px-3 py-2.5 bg-stone-50 dark:bg-[#141C29] border border-stone-200 dark:border-[#222F42] rounded-lg text-stone-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            {mps.map((m) => (
              <option key={m.slug} value={m.slug} className="dark:bg-[#141C29]">
                {m.name} ({m.constituency}, {m.party})
              </option>
            ))}
          </select>
        </div>

        {/* Selector MP B */}
        <div className="bg-white dark:bg-[#0E1420] p-4 sm:p-5 rounded-xl border border-stone-200/90 dark:border-[#1E2636] shadow-xs">
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
            Member B
          </label>
          <select
            value={selectedB}
            onChange={(e) => setSelectedB(e.target.value)}
            className="w-full px-3 py-2.5 bg-stone-50 dark:bg-[#141C29] border border-stone-200 dark:border-[#222F42] rounded-lg text-stone-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            {mps.map((m) => (
              <option key={m.slug} value={m.slug} className="dark:bg-[#141C29]">
                {m.name} ({m.constituency}, {m.party})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Matrix Table / Cards */}
      <div className="bg-white dark:bg-[#0E1420] rounded-xl border border-stone-200/90 dark:border-[#1E2636] shadow-xs overflow-hidden divide-y divide-stone-100 dark:divide-[#182232]">
        {/* Header Identity Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-100 dark:divide-[#182232]">
          {/* Card MP A */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-[#16202E] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-[#223044]">
                {mpA.party}
              </span>
              {mpA.is_minister && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/30">
                  Minister
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white font-sans">
              {mpA.name}
            </h2>
            <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mb-3">
              {mpA.constituency}, {mpA.state}
            </p>
            <Link
              href={`/mp/${mpA.slug}`}
              className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              <span>View Full Dossier</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Card MP B */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-[#16202E] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-[#223044]">
                {mpB.party}
              </span>
              {mpB.is_minister && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/30">
                  Minister
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white font-sans">
              {mpB.name}
            </h2>
            <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mb-3">
              {mpB.constituency}, {mpB.state}
            </p>
            <Link
              href={`/mp/${mpB.slug}`}
              className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              <span>View Full Dossier</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Row 1: Attendance */}
        <div className="p-5 bg-stone-50/50 dark:bg-[#0C121D]/50">
          <div className="text-center mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Parliamentary Attendance Rate
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center font-mono">
            <div className="text-center md:text-right">
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tabular-nums">
                {mpA.performance?.attendance_pct !== null && mpA.performance?.attendance_pct !== undefined
                  ? `${mpA.performance.attendance_pct}%`
                  : mpA.is_minister
                    ? 'Not applicable (minister)'
                    : 'Not available'}
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tabular-nums">
                {mpB.performance?.attendance_pct !== null && mpB.performance?.attendance_pct !== undefined
                  ? `${mpB.performance.attendance_pct}%`
                  : mpB.is_minister
                    ? 'Not applicable (minister)'
                    : 'Not available'}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Debates */}
        <div className="p-5">
          <div className="text-center mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Debates Participated
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center font-mono">
            <div className="text-center md:text-right">
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tabular-nums">
                {mpA.performance?.debates !== null && mpA.performance?.debates !== undefined
                  ? mpA.performance.debates
                  : 'Not available'}
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tabular-nums">
                {mpB.performance?.debates !== null && mpB.performance?.debates !== undefined
                  ? mpB.performance.debates
                  : 'Not available'}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Questions */}
        <div className="p-5 bg-stone-50/50 dark:bg-[#0C121D]/50">
          <div className="text-center mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Questions Submitted
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center font-mono">
            <div className="text-center md:text-right">
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tabular-nums">
                {mpA.performance?.questions !== null && mpA.performance?.questions !== undefined
                  ? mpA.performance.questions
                  : 'Not available'}
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tabular-nums">
                {mpB.performance?.questions !== null && mpB.performance?.questions !== undefined
                  ? mpB.performance.questions
                  : 'Not available'}
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Private Member Bills */}
        <div className="p-5">
          <div className="text-center mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Private Member Bills
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center font-mono">
            <div className="text-center md:text-right">
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tabular-nums">
                {mpA.performance?.private_member_bills !== null && mpA.performance?.private_member_bills !== undefined
                  ? mpA.performance.private_member_bills
                  : 0}
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tabular-nums">
                {mpB.performance?.private_member_bills !== null && mpB.performance?.private_member_bills !== undefined
                  ? mpB.performance.private_member_bills
                  : 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast
        message="Comparison link copied to clipboard!"
        isOpen={toastOpen}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
};
