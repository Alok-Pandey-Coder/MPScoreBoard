import React from 'react';
import { Database, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { MPRecord } from '@/types/mp';
import { formatDate, formatNumber } from '@/lib/formatters';

interface NagrikTerritoryBarProps {
  mps: MPRecord[];
}

export const NagrikTerritoryBar: React.FC<NagrikTerritoryBarProps> = ({ mps }) => {
  const seatCount = mps.length;
  const reportingQuestions = mps.filter(
    (mp) => !mp.is_minister && mp.performance.questions !== null && mp.performance.questions !== undefined
  );
  const questionsTotal = reportingQuestions.length
    ? reportingQuestions.reduce((sum, mp) => sum + (mp.performance.questions as number), 0)
    : null;
  const perfAsOf = reportingQuestions
    .map((mp) => mp.performance.as_of)
    .filter((d): d is string => !!d)
    .sort()
    .pop();
  const affidavitCount = mps.filter((mp) => mp.affidavit?.status === 'reported').length;
  const ministerCount = mps.filter((mp) => mp.is_minister).length;

  return (
    <div className="space-y-6 pt-2">
      {/* Top Editorial Metadata Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-stone-200 dark:border-[#1E2636]">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold mb-1">
            <span>National Capital Territory of Delhi</span>
            <span className="text-stone-400 dark:text-stone-600">·</span>
            <span>18th Lok Sabha (2024–2029)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight font-sans">
            Delhi MP Report Cards
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl font-normal leading-relaxed">
            Source-backed public monitoring of legislative engagement, attendance records, questions asked, and local constituency expenditure for all 7 parliamentary seats.
          </p>
        </div>

        {/* Right Status Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="px-2.5 py-1 rounded-md bg-stone-100 dark:bg-[#131B27] border border-stone-300/80 dark:border-[#222E42] text-stone-700 dark:text-stone-300 flex items-center gap-1.5 font-mono text-[11px]">
            <Database className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" aria-hidden="true" />
            <span>{seatCount} seats · sources linked on each card</span>
          </span>

          <Link
            href="/about"
            className="px-2.5 py-1 rounded-md bg-stone-100 dark:bg-[#131B27] border border-stone-300/80 dark:border-[#222E42] text-stone-700 dark:text-stone-300 flex items-center gap-1.5 font-mono text-[11px] hover:underline"
          >
            <BookOpen className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" aria-hidden="true" />
            <span>Sources &amp; review status</span>
          </Link>
        </div>
      </div>

      {/* 4 Essential Civic Ledger Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-[#101622] p-4 sm:p-5 rounded-2xl border border-stone-200/90 dark:border-[#1E2636] shadow-sm">
        <div className="p-2 sm:p-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-medium">
            Seats Mapped
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white font-mono mt-0.5 tabular-nums">
            {seatCount}
          </div>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            Lok Sabha constituencies
          </span>
        </div>

        <div className="p-2 sm:p-3 border-l border-stone-200 dark:border-[#1E2636]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-medium">
            Sitting MPs Tracked
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-0.5 tabular-nums">
            {seatCount}
          </div>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            Affidavit data for {affidavitCount} of {seatCount}
          </span>
        </div>

        <div className="p-2 sm:p-3 border-l-0 sm:border-l border-t sm:border-t-0 border-stone-200 dark:border-[#1E2636] pt-3 sm:pt-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-medium">
            Questions Asked (total)
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white font-mono mt-0.5 tabular-nums">
            {formatNumber(questionsTotal)}
          </div>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            {reportingQuestions.length} MPs, PRS{perfAsOf ? `, as of ${formatDate(perfAsOf)}` : ''}
            {ministerCount ? ` · ${ministerCount} minister not applicable` : ''}
          </span>
        </div>

        <div className="p-2 sm:p-3 border-l border-t sm:border-t-0 border-stone-200 dark:border-[#1E2636] pt-3 sm:pt-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-medium">
            MPLADS Entitlement
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white font-mono mt-0.5 tabular-nums">
            ₹5 Cr
          </div>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            Per MP per year (MPLADS guidelines)
          </span>
        </div>
      </div>

      {/* Editorial Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-stone-200 dark:border-[#1E2636] no-scrollbar">
        <a
          href="#find-constituency"
          className="px-3.5 py-2 rounded-lg font-semibold text-stone-900 dark:text-white bg-stone-200/90 dark:bg-[#1A2333] border border-stone-300 dark:border-[#2C384D] shrink-0 flex items-center gap-2"
        >
          <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 font-bold">01</span>
          <span>Constituency Block Map</span>
        </a>

        <a
          href="#delhi-mps"
          className="px-3.5 py-2 rounded-lg font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#141B28] transition-colors shrink-0 flex items-center gap-2"
        >
          <span className="font-mono text-[10px] text-stone-400 dark:text-stone-600 font-bold">02</span>
          <span>Sitting Members of Parliament</span>
        </a>

        <a
          href="#national-states"
          className="px-3.5 py-2 rounded-lg font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#141B28] transition-colors shrink-0 flex items-center gap-2"
        >
          <span className="font-mono text-[10px] text-stone-400 dark:text-stone-600 font-bold">03</span>
          <span>All-India Directory</span>
        </a>

        <a
          href="/about"
          className="px-3.5 py-2 rounded-lg font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#141B28] transition-colors shrink-0 flex items-center gap-2"
        >
          <span className="font-mono text-[10px] text-stone-400 dark:text-stone-600 font-bold">04</span>
          <span>Methodology &amp; Standards</span>
        </a>
      </div>
    </div>
  );
};
