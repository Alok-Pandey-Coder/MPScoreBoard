import React from 'react';
import { BarChart3, Info } from 'lucide-react';
import { MPRecord } from '@/types/mp';

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
      title: 'Attendance Rate',
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
    <div className="bg-white dark:bg-[#0E1420] rounded-xl p-5 sm:p-7 border border-stone-200/90 dark:border-[#1E2636] shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-stone-100 dark:border-[#1A2333]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 font-sans tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>Comparative Averages Benchmark</span>
          </h2>
          <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-0.5">
            Benchmarked against state (Delhi, 7 seats) and national 18th Lok Sabha baselines
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-50 dark:bg-[#141C29] text-stone-600 dark:text-stone-400 text-[11px] font-mono self-start sm:self-auto border border-stone-200/80 dark:border-[#222F42]">
          <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span>These indicators describe activity volume, not qualitative performance.</span>
        </div>
      </div>

      <div className="space-y-6">
        {metrics.map((m) => {
          const mpW = Math.min(100, Math.max(4, ((m.mpVal || 0) / m.maxVal) * 100));
          const stateW = Math.min(100, Math.max(4, ((m.stateVal || 0) / m.maxVal) * 100));
          const natW = Math.min(100, Math.max(4, ((m.natVal || 0) / m.maxVal) * 100));

          return (
            <div key={m.title} className="p-4 rounded-lg bg-stone-50/80 dark:bg-[#121A26] border border-stone-200/80 dark:border-[#1E293B]">
              <div className="flex items-center justify-between text-xs font-mono mb-3">
                <span className="font-bold text-stone-900 dark:text-stone-100">{m.title}</span>
                <span className="text-stone-500">
                  {mp.name}: <strong className="text-stone-900 dark:text-white">{m.mpVal ?? 'N/A'}{m.unit}</strong>
                </span>
              </div>

              {/* Multi-Bar Comparison */}
              <div className="space-y-2 text-[11px] font-mono">
                {/* MP Bar */}
                <div className="flex items-center gap-3">
                  <span className="w-24 text-stone-600 dark:text-stone-400 truncate">{mp.name.split(' ')[0]}</span>
                  <div className="flex-1 bg-stone-200 dark:bg-[#1A2536] rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-amber-600 dark:bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${mpW}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-bold text-stone-900 dark:text-white tabular-nums">
                    {m.mpVal ?? 0}{m.unit}
                  </span>
                </div>

                {/* State Avg Bar */}
                <div className="flex items-center gap-3">
                  <span className="w-24 text-stone-500 dark:text-stone-400">Delhi Avg</span>
                  <div className="flex-1 bg-stone-200 dark:bg-[#1A2536] rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-stone-500 dark:bg-stone-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${stateW}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-stone-600 dark:text-stone-400 tabular-nums">
                    {m.stateVal ?? 0}{m.unit}
                  </span>
                </div>

                {/* National Avg Bar */}
                <div className="flex items-center gap-3">
                  <span className="w-24 text-stone-500 dark:text-stone-400">National Avg</span>
                  <div className="flex-1 bg-stone-200 dark:bg-[#1A2536] rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-stone-400 dark:bg-stone-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${natW}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-stone-600 dark:text-stone-400 tabular-nums">
                    {m.natVal ?? 0}{m.unit}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
