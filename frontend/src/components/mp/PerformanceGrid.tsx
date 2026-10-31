import React from 'react';
import { Calendar, HelpCircle, MessageSquare, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { MPRecord } from '../../types/mp';
import { formatDate } from '../../lib/formatters';
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
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Parliamentary Activity Indicators
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sitting data for the 18th Lok Sabha
            </p>
          </div>
          <span className="text-xs px-3 py-1 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold rounded-full border border-amber-200 dark:border-amber-800/60">
            Ministerial Exemption
          </span>
        </div>

        <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/60 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-amber-700 dark:text-amber-400" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-amber-950 dark:text-amber-200 text-base">
              Performance Indicators Not Applicable (Union Minister)
            </h3>
            <p className="text-sm text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
              As a serving Minister in the Union Council of Ministers, {mp.name} represents the Government in Parliament. Under parliamentary convention, ministers do not sign the attendance register, pose parliamentary questions, or introduce private member bills.
            </p>
            <p className="text-xs text-amber-800/70 dark:text-amber-400/60 pt-1">
              Their ministerial accountability is carried out through executive leadership, policy formulation, and official answers.
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
      source: 'PRS Legislative Research / Lok Sabha',
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
      source: 'PRS Legislative Research',
    },
    {
      id: 'bills',
      label: 'Private Member Bills',
      value: perf.private_member_bills !== null && perf.private_member_bills !== undefined ? perf.private_member_bills.toString() : '0',
      unit: 'bills',
      icon: FileText,
      tooltip: 'Bills introduced by the MP in an individual capacity to propose legislative changes.',
      source: 'PRS Legislative Research',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* Block Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
            Key Parliamentary Indicators
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quantitative participation records for the 18th Lok Sabha
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700 self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Records as of {asOf}</span>
        </div>
      </div>

      {/* Grid of 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {indicators.map((ind) => {
          const Icon = ind.icon;
          return (
            <div
              key={ind.id}
              className="bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      {ind.label}
                    </span>
                  </div>
                  <Tooltip content={ind.tooltip} />
                </div>

                <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] my-2">
                  {ind.value}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>{ind.source}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
