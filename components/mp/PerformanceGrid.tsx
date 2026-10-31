import React from 'react';
import { Calendar, HelpCircle, MessageSquare, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { formatDate } from '@/lib/formatters';
import { Tooltip } from '../common/Tooltip';

interface PerformanceGridProps {
  mp: MPRecord;
}

export const PerformanceGrid: React.FC<PerformanceGridProps> = ({ mp }) => {
  const isMinister = mp.is_minister || mp.performance.status === 'not_applicable';
  const perf = mp.performance;
  const asOf = formatDate(perf.as_of);

  if (isMinister) {
    return (
      <div className="bg-white dark:bg-[#0E1420] rounded-xl p-5 sm:p-7 border border-stone-200/90 dark:border-[#1E2636] shadow-sm transition-colors">
        <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-stone-100 dark:border-[#1A2333]">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 font-sans tracking-tight">
              Parliamentary Activity Indicators
            </h2>
            <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-0.5">
              18th Lok Sabha Official Sittings Data
            </p>
          </div>
          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded border border-amber-500/30">
            Ministerial Status
          </span>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-stone-900 dark:text-amber-300 text-sm sm:text-base font-sans">
              Indicators Not Applicable (Union Minister of State)
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              As a serving member of the Union Council of Ministers, {mp.name} represents the Government in Parliament. Under constitutional conventions, ministers do not sign the attendance register, submit private parliamentary questions, or sponsor private member bills.
            </p>
            <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 pt-0.5">
              Source convention: Lok Sabha Rules of Procedure &amp; Conduct of Business.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const indicators = [
    {
      id: 'attendance',
      label: 'Attendance Rate',
      value: perf.attendance_pct !== null && perf.attendance_pct !== undefined ? `${perf.attendance_pct}%` : 'Not available',
      unit: '',
      icon: CheckCircle2,
      tooltip: 'Percentage of total Lok Sabha sittings attended by the member during the 18th Lok Sabha sessions.',
      source: 'PRS / Lok Sabha',
    },
    {
      id: 'debates',
      label: 'Debates Participated',
      value: perf.debates !== null && perf.debates !== undefined ? perf.debates.toString() : 'Not available',
      unit: 'debates',
      icon: MessageSquare,
      tooltip: 'Number of floor debates, budget discussions, and legislative deliberations participated in.',
      source: 'PRS Legislative Research',
    },
    {
      id: 'questions',
      label: 'Questions Asked',
      value: perf.questions !== null && perf.questions !== undefined ? perf.questions.toString() : 'Not available',
      unit: 'questions',
      icon: HelpCircle,
      tooltip: 'Total starred and unstarred parliamentary questions submitted to ministries regarding public issues.',
      source: 'Lok Sabha Questions Portal',
    },
    {
      id: 'bills',
      label: 'Private Member Bills',
      value: perf.private_member_bills !== null && perf.private_member_bills !== undefined ? perf.private_member_bills.toString() : '0',
      unit: 'bills',
      icon: FileText,
      tooltip: 'Bills introduced by the MP in an individual capacity to propose legislative changes.',
      source: 'Lok Sabha Bills Portal',
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
            Quantitative participation records for the 18th Lok Sabha
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-[#141C29] px-2.5 py-1 rounded border border-stone-200 dark:border-[#222F42] self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-stone-400" />
          <span>Verified as of {asOf}</span>
        </div>
      </div>

      {/* Grid of 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {indicators.map((ind) => {
          const Icon = ind.icon;
          return (
            <div
              key={ind.id}
              className="bg-stone-50/80 dark:bg-[#121A26] rounded-lg p-4 border border-stone-200/80 dark:border-[#1E293B] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                    <Icon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                      {ind.label}
                    </span>
                  </div>
                  <Tooltip content={ind.tooltip} />
                </div>

                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-stone-900 dark:text-white my-2 tabular-nums">
                  {ind.value}
                </div>
              </div>

              <div className="pt-2.5 border-t border-stone-200/60 dark:border-[#1A2536] flex items-center justify-between text-[10px] font-mono text-stone-500 dark:text-stone-400">
                <span>{ind.source}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
