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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#232c37]">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-3">
            <GitCompare className="w-8 h-8 text-cyan-500" />
            <span>Compare Lok Sabha MPs</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Neutral, side-by-side indicator benchmarking without scoring or rankings
          </p>
        </div>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-[#1a222d] hover:bg-slate-200 dark:hover:bg-[#232d3b] text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors self-start sm:self-auto border border-slate-200 dark:border-[#2f3b4a] cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <span>Share Comparison</span>
        </button>
      </div>

      {/* Mandatory Non-ranking Notice */}
      <div className="bg-slate-50 dark:bg-[#171D24] border border-slate-200 dark:border-[#303A45] rounded-2xl p-4 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          Comparisons reflect quantitative activity indicators from official parliamentary logs. They do not constitute a rank, score, or performance evaluation.
        </span>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Selector MP A */}
        <div className="bg-white dark:bg-[#171D24] p-5 rounded-3xl border border-slate-200 dark:border-[#303A45] shadow-sm">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Select Member A
          </label>
          <select
            value={selectedA}
            onChange={(e) => setSelectedA(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1D242D] border border-slate-300 dark:border-[#303A45] rounded-2xl text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
          >
            {mps.map((m) => (
              <option key={m.slug} value={m.slug} className="dark:bg-[#1D242D]">
                {m.name} ({m.constituency}, {m.party})
              </option>
            ))}
          </select>
        </div>

        {/* Selector MP B */}
        <div className="bg-white dark:bg-[#171D24] p-5 rounded-3xl border border-slate-200 dark:border-[#303A45] shadow-sm">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Select Member B
          </label>
          <select
            value={selectedB}
            onChange={(e) => setSelectedB(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1D242D] border border-slate-300 dark:border-[#303A45] rounded-2xl text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
          >
            {mps.map((m) => (
              <option key={m.slug} value={m.slug} className="dark:bg-[#1D242D]">
                {m.name} ({m.constituency}, {m.party})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Matrix Table / Cards */}
      <div className="bg-white dark:bg-[#171D24] rounded-3xl border border-slate-200 dark:border-[#303A45] shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-[#27323f]">
        {/* Header Identity Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-[#27323f]">
          {/* Card MP A */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#1D242D] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#303A45]">
                {mpA.party}
              </span>
              {mpA.is_minister && (
                <span className="text-xs px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800/60">
                  Union Minister
                </span>
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
              {mpA.name}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {mpA.constituency}, {mpA.state}
            </p>
            <Link
              href={`/mp/${mpA.slug}`}
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
            >
              <span>View Full Report Card</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card MP B */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#1D242D] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#303A45]">
                {mpB.party}
              </span>
              {mpB.is_minister && (
                <span className="text-xs px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800/60">
                  Union Minister
                </span>
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
              {mpB.name}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {mpB.constituency}, {mpB.state}
            </p>
            <Link
              href={`/mp/${mpB.slug}`}
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
            >
              <span>View Full Report Card</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Row 1: Attendance */}
        <div className="p-6 bg-slate-50/50 dark:bg-[#14191F]/50">
          <div className="text-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Parliamentary Attendance Rate
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="text-center md:text-right">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                {mpA.performance?.attendance_pct !== null && mpA.performance?.attendance_pct !== undefined
                  ? `${mpA.performance.attendance_pct}%`
                  : 'N/A (Minister)'}
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                {mpB.performance?.attendance_pct !== null && mpB.performance?.attendance_pct !== undefined
                  ? `${mpB.performance.attendance_pct}%`
                  : 'N/A (Minister)'}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Debates */}
        <div className="p-6">
          <div className="text-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Debates Participated
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="text-center md:text-right">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                {mpA.performance?.debates !== null && mpA.performance?.debates !== undefined
                  ? mpA.performance.debates
                  : 'N/A'}
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                {mpB.performance?.debates !== null && mpB.performance?.debates !== undefined
                  ? mpB.performance.debates
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Questions */}
        <div className="p-6 bg-slate-50/50 dark:bg-[#14191F]/50">
          <div className="text-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Questions Submitted
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="text-center md:text-right">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                {mpA.performance?.questions !== null && mpA.performance?.questions !== undefined
                  ? mpA.performance.questions
                  : 'N/A'}
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                {mpB.performance?.questions !== null && mpB.performance?.questions !== undefined
                  ? mpB.performance.questions
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Private Member Bills */}
        <div className="p-6">
          <div className="text-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Private Member Bills
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="text-center md:text-right">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                {mpA.performance?.private_member_bills !== null && mpA.performance?.private_member_bills !== undefined
                  ? mpA.performance.private_member_bills
                  : 0}
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
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

