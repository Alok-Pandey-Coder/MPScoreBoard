import React from 'react';
import Link from 'next/link';
import { Calendar, HelpCircle, MessageSquare, FileText, CheckCircle2, Info, ExternalLink } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { formatDate, formatNumber, formatPct, formatReviewStatus, NOT_AVAILABLE } from '@/lib/formatters';
import { Tooltip } from '../common/Tooltip';

interface PerformanceGridProps {
  mp: MPRecord;
}

export const MINISTER_EXPLANATION =
  "Ministers don't sign the attendance register, ask questions or introduce private member bills, so these indicators don't apply.";

export const PerformanceGrid: React.FC<PerformanceGridProps> = ({ mp }) => {
  const isMinister = mp.is_minister || mp.performance.status === 'not_applicable';
  const perf = mp.performance;
  const asOf = perf.as_of ? formatDate(perf.as_of) : null;
  const sourceName = perf.source?.name ?? null;
  const sourceUrl = perf.source?.url ?? null;
  const reviewStatus = formatReviewStatus(perf.review_status);

  const sourceLine = sourceName ? (
    sourceUrl ? (
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 hover:underline text-stone-600 dark:text-stone-300"
      >
        <span>Source: {sourceName}</span>
        <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
      </a>
    ) : (
      <span>Source: {sourceName}</span>
    )
  ) : (
    <span>Source not recorded</span>
  );

  if (isMinister) {
    return (
      <div className="bg-white dark:bg-[#0E1420] rounded-xl p-5 sm:p-7 border border-stone-200/90 dark:border-[#1E2636] shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-stone-100 dark:border-[#1A2333]">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 font-sans tracking-tight">
              Key Parliamentary Indicators
            </h2>
            <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-0.5">18th Lok Sabha</p>
          </div>
          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 bg-stone-100 dark:bg-[#141C29] text-stone-700 dark:text-stone-300 rounded border border-stone-200 dark:border-[#222F42] self-start sm:self-auto">
            Not applicable (minister)
          </span>
        </div>

        <div className="bg-stone-50 dark:bg-[#121A26] border border-stone-200 dark:border-[#1E293B] rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-stone-200 dark:bg-[#192231] text-stone-600 dark:text-stone-300 flex items-center justify-center shrink-0 border border-stone-300 dark:border-[#26344A]">
            <Info className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base font-sans">
              Attendance, debates, questions and private member bills: not applicable
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{MINISTER_EXPLANATION}</p>
            <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 pt-0.5">
              PRS Legislative Research excludes ministers from these indicators.{' '}
              <Link href="/about#minister-policy" className="underline hover:text-stone-900 dark:hover:text-white">
                How we handle ministers
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const indicators = [
    {
      id: 'attendance',
      label: 'Attendance',
      value: formatPct(perf.attendance_pct),
      icon: CheckCircle2,
      tooltip: 'Share of Lok Sabha sittings the MP attended in the 18th Lok Sabha, as reported by the source.',
    },
    {
      id: 'debates',
      label: 'Debates',
      value: formatNumber(perf.debates),
      icon: MessageSquare,
      tooltip: 'Number of debates the MP participated in, as reported by the source.',
    },
    {
      id: 'questions',
      label: 'Questions',
      value: formatNumber(perf.questions),
      icon: HelpCircle,
      tooltip: 'Number of starred and unstarred questions asked, as reported by the source.',
    },
    {
      id: 'bills',
      label: 'Private Member Bills',
      value: formatNumber(perf.private_member_bills),
      icon: FileText,
      tooltip: 'Bills introduced by the MP in an individual capacity (not on behalf of the government).',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#0E1420] rounded-xl p-5 sm:p-7 border border-stone-200/90 dark:border-[#1E2636] shadow-sm transition-colors">
      {/* Block Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-4 border-b border-stone-100 dark:border-[#1A2333]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 font-sans tracking-tight">
            Key Parliamentary Indicators
          </h2>
          <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-0.5">
            18th Lok Sabha. These indicators show activity, not the quality of an MP&apos;s work.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-500 dark:text-stone-400 self-start sm:self-auto">
          <span className="flex items-center gap-1.5 bg-stone-50 dark:bg-[#141C29] px-2.5 py-1 rounded border border-stone-200 dark:border-[#222F42]">
            <Calendar className="w-3.5 h-3.5 text-stone-400" aria-hidden="true" />
            <span>{asOf ? `As of ${asOf}` : 'As-of date not available'}</span>
          </span>
          {reviewStatus && (
            <span className="bg-stone-50 dark:bg-[#141C29] px-2.5 py-1 rounded border border-stone-200 dark:border-[#222F42]">
              Review status: {reviewStatus}
            </span>
          )}
        </div>
      </div>

      {/* Grid of 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {indicators.map((ind) => {
          const Icon = ind.icon;
          const missing = ind.value === NOT_AVAILABLE;
          return (
            <div
              key={ind.id}
              className="bg-stone-50/80 dark:bg-[#121A26] rounded-lg p-4 border border-stone-200/80 dark:border-[#1E293B] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                    <Icon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                      {ind.label}
                    </span>
                  </div>
                  <Tooltip content={ind.tooltip} />
                </div>

                <div
                  className={`font-extrabold font-mono text-stone-900 dark:text-white my-2 tabular-nums ${
                    missing ? 'text-sm' : 'text-2xl sm:text-3xl'
                  }`}
                >
                  {missing ? 'Not available from the source.' : ind.value}
                </div>
              </div>

              <div className="pt-2.5 border-t border-stone-200/60 dark:border-[#1A2536] flex flex-col gap-0.5 text-[10px] font-mono text-stone-500 dark:text-stone-400">
                {sourceLine}
                {asOf && <span>as of {asOf}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
