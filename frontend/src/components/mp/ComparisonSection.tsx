import React from 'react';
import { BarChart3, Info } from 'lucide-react';
import { MPRecord } from '../../types/mp';
import { compareWithAverage } from '../../lib/comparisons';

interface ComparisonSectionProps {
  mp: MPRecord;
}

export const ComparisonSection: React.FC<ComparisonSectionProps> = ({ mp }) => {
  if (mp.is_minister || mp.performance.status === 'not_applicable') {
    return null;
  }

  const perf = mp.performance;
  const nat = perf.prs_averages?.national;
  const state = perf.prs_averages?.state;

  if (!nat || !state) return null;

  const metrics = [
    {
      title: 'Attendance',
      mpVal: perf.attendance_pct,
      stateVal: state.attendance_pct,
      natVal: nat.attendance_pct,
      type: 'percentage' as const,
      maxVal: 100,
      unit: '%',
    },
    {
      title: 'Debates Participated',
      mpVal: perf.debates,
      stateVal: state.debates,
      natVal: nat.debates,
      type: 'count' as const,
      maxVal: Math.max(perf.debates || 0, state.debates || 0, nat.debates || 0, 35) * 1.2,
      unit: '',
    },
    {
      title: 'Questions Asked',
      mpVal: perf.questions,
      stateVal: state.questions,
      natVal: nat.questions,
      type: 'count' as const,
      maxVal: Math.max(perf.questions || 0, state.questions || 0, nat.questions || 0, 300) * 1.2,
      unit: '',
    },
    {
      title: 'Private Member Bills',
      mpVal: perf.private_member_bills,
      stateVal: state.private_member_bills,
      natVal: nat.private_member_bills,
      type: 'count' as const,
      maxVal: Math.max(perf.private_member_bills || 0, state.private_member_bills || 0, nat.private_member_bills || 0, 5) * 1.2,
      unit: '',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Compared with Averages</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Benchmarked against state (Delhi, 7 seats) and national averages
          </p>
        </div>

        {/* Mandatory Neutrality Notice (PRD 5.9 Constraint 3) */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium self-start sm:self-auto border border-slate-200/60 dark:border-slate-700">
          <Info className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
          <span>These indicators show activity, not the quality of an MP&apos;s work.</span>
        </div>
      </div>

      <div className="space-y-6">
        {metrics.map((metric) => {
          const stateComp = compareWithAverage(metric.mpVal, metric.stateVal, metric.type);
          const natComp = compareWithAverage(metric.mpVal, metric.natVal, metric.type);

          const mpWidth = metric.mpVal !== null ? Math.min(100, (metric.mpVal / metric.maxVal) * 100) : 0;
          const stateWidth = metric.stateVal !== null ? Math.min(100, (metric.stateVal / metric.maxVal) * 100) : 0;
          const natWidth = metric.natVal !== null ? Math.min(100, (metric.natVal / metric.maxVal) * 100) : 0;

          return (
            <div key={metric.title} className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3.5">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {metric.title}
                </span>
                <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-2">
                  <span>
                    MP: <strong className="text-slate-900 dark:text-white">{metric.mpVal ?? 'N/A'}{metric.unit}</strong>
                  </span>
                  <span>·</span>
                  <span>
                    State avg: <strong className="text-slate-700 dark:text-slate-300">{metric.stateVal ?? 'N/A'}{metric.unit}</strong>
                  </span>
                  <span>·</span>
                  <span>
                    National avg: <strong className="text-slate-700 dark:text-slate-300">{metric.natVal ?? 'N/A'}{metric.unit}</strong>
                  </span>
                </div>
              </div>

              {/* Comparative Visual Bars */}
              <div className="space-y-2.5 mb-3.5">
                {/* MP Bar */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="w-24 text-slate-700 dark:text-slate-300 font-semibold shrink-0 truncate">
                    {mp.name}
                  </span>
                  <div className="flex-1 h-3.5 bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${mpWidth}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-bold text-slate-900 dark:text-white">
                    {metric.mpVal ?? 'N/A'}{metric.unit}
                  </span>
                </div>

                {/* State Avg Bar */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="w-24 text-slate-500 dark:text-slate-400 shrink-0">State Avg</span>
                  <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-500 dark:bg-slate-400 rounded-full transition-all duration-500"
                      style={{ width: `${stateWidth}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-medium text-slate-600 dark:text-slate-400">
                    {metric.stateVal ?? 'N/A'}{metric.unit}
                  </span>
                </div>

                {/* National Avg Bar */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="w-24 text-slate-500 dark:text-slate-400 shrink-0">National Avg</span>
                  <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400 dark:bg-slate-500 rounded-full transition-all duration-500"
                      style={{ width: `${natWidth}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-medium text-slate-600 dark:text-slate-400">
                    {metric.natVal ?? 'N/A'}{metric.unit}
                  </span>
                </div>
              </div>

              {/* Neutral Descriptive Summary Badges */}
              <div className="pt-2.5 border-t border-slate-200/50 dark:border-slate-700/60 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                  {stateComp.comparisonText} state average
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                  {natComp.comparisonText} national average
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
