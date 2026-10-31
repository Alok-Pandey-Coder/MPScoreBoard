import React from 'react';
import { BarChart3, Info, ExternalLink } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { compareWithAverage } from '@/lib/comparisons';
import { formatDate } from '@/lib/formatters';

interface ComparisonSectionProps {
  mp: MPRecord;
}

function isPresent(v: number | null | undefined): v is number {
  return v !== null && v !== undefined && Number.isFinite(v);
}

interface BarRowProps {
  label: string;
  value: number | null | undefined;
  unit: string;
  maxVal: number;
  barClass: string;
  emphasis?: boolean;
}

const BarRow: React.FC<BarRowProps> = ({ label, value, unit, maxVal, barClass, emphasis }) => {
  const present = isPresent(value);
  const width = present && maxVal > 0 ? Math.min(100, (value / maxVal) * 100) : 0;
  const text = present ? `${value}${unit}` : 'Not available';
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 sm:w-40 shrink-0 text-stone-600 dark:text-stone-400 leading-tight">{label}</span>
      <div
        className="flex-1 min-w-0 bg-stone-200 dark:bg-[#1A2536] rounded-full h-3 overflow-hidden"
        role="img"
        aria-label={`${label}: ${text}`}
      >
        {present && (
          <div className={`${barClass} h-full rounded-full transition-all duration-500`} style={{ width: `${width}%` }} />
        )}
      </div>
      <span
        className={`w-20 shrink-0 text-right tabular-nums ${
          emphasis ? 'font-bold text-stone-900 dark:text-white' : 'text-stone-600 dark:text-stone-400'
        }`}
      >
        {text}
      </span>
    </div>
  );
};

export const ComparisonSection: React.FC<ComparisonSectionProps> = ({ mp }) => {
  if (mp.is_minister || mp.performance.status === 'not_applicable') {
    return null;
  }

  const perf = mp.performance;
  const nat = perf.prs_averages?.national;
  const state = perf.prs_averages?.state;

  if (!nat && !state) {
    return (
      <div className="bg-white dark:bg-[#0E1420] rounded-xl p-5 sm:p-7 border border-stone-200/90 dark:border-[#1E2636] shadow-sm transition-colors">
        <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 font-sans tracking-tight">
          Compared to Averages
        </h2>
        <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-2">
          Averages not available from the source.
        </p>
      </div>
    );
  }

  const maxOf = (...vals: Array<number | null | undefined>) => Math.max(0, ...vals.filter(isPresent)) * 1.15;

  const metrics = [
    {
      title: 'Attendance',
      mpVal: perf.attendance_pct,
      stateVal: state?.attendance_pct,
      natVal: nat?.attendance_pct,
      type: 'percentage' as const,
      maxVal: 100,
      unit: '%',
    },
    {
      title: 'Debates',
      mpVal: perf.debates,
      stateVal: state?.debates,
      natVal: nat?.debates,
      type: 'count' as const,
      maxVal: maxOf(perf.debates, state?.debates, nat?.debates),
      unit: '',
    },
    {
      title: 'Questions',
      mpVal: perf.questions,
      stateVal: state?.questions,
      natVal: nat?.questions,
      type: 'count' as const,
      maxVal: maxOf(perf.questions, state?.questions, nat?.questions),
      unit: '',
    },
    {
      title: 'Private Member Bills',
      mpVal: perf.private_member_bills,
      stateVal: state?.private_member_bills,
      natVal: nat?.private_member_bills,
      type: 'count' as const,
      maxVal: maxOf(perf.private_member_bills, state?.private_member_bills, nat?.private_member_bills),
      unit: '',
    },
  ];

  const asOf = perf.as_of ? formatDate(perf.as_of) : null;

  const describe = (avg: number | null | undefined, which: string, mpVal: number | null | undefined, type: 'percentage' | 'count') => {
    const r = compareWithAverage(mpVal, avg, type);
    if (r.relation === 'unavailable') return null;
    if (r.relation === 'similar') return `similar to the ${which} average`;
    const unit = type === 'percentage' ? ' points' : '';
    const amount = Math.abs(r.diffValue ?? 0);
    const amountText = Number.isInteger(amount) ? String(amount) : amount.toFixed(1);
    return `${amountText}${unit} ${r.relation} than the ${which} average`;
  };

  return (
    <div className="bg-white dark:bg-[#0E1420] rounded-xl p-5 sm:p-7 border border-stone-200/90 dark:border-[#1E2636] shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-stone-100 dark:border-[#1A2333]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 font-sans tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span>Compared to Averages</span>
          </h2>
          <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-0.5">
            PRS-published {mp.state} and national averages for the 18th Lok Sabha
            {asOf ? `, as of ${asOf}` : ''}
            {perf.source?.url && (
              <>
                {' · '}
                <a
                  href={perf.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline hover:text-stone-900 dark:hover:text-white"
                >
                  {perf.source.name}
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </>
            )}
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-50 dark:bg-[#141C29] text-stone-600 dark:text-stone-400 text-[11px] font-mono self-start sm:self-auto border border-stone-200/80 dark:border-[#222F42]">
          <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" aria-hidden="true" />
          <span>These indicators show activity, not the quality of an MP&apos;s work.</span>
        </div>
      </div>

      <div className="space-y-6">
        {metrics.map((m) => {
          const stateText = describe(m.stateVal, `${mp.state}`, m.mpVal, m.type);
          const natText = describe(m.natVal, 'national', m.mpVal, m.type);
          const summary = [stateText, natText].filter(Boolean).join('; ');

          return (
            <div key={m.title} className="p-4 rounded-lg bg-stone-50/80 dark:bg-[#121A26] border border-stone-200/80 dark:border-[#1E293B]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono mb-3">
                <span className="font-bold text-stone-900 dark:text-stone-100">{m.title}</span>
                <span className="text-stone-500 dark:text-stone-400">
                  {isPresent(m.mpVal) ? (summary ? `${mp.name}: ${summary}` : 'Average comparison unavailable') : 'Not available from the source.'}
                </span>
              </div>

              <div className="space-y-2 text-[11px] font-mono">
                <BarRow label={mp.name} value={m.mpVal} unit={m.unit} maxVal={m.maxVal} barClass="bg-blue-700 dark:bg-blue-400" emphasis />
                <BarRow
                  label={`PRS-published ${mp.state} average`}
                  value={m.stateVal}
                  unit={m.unit}
                  maxVal={m.maxVal}
                  barClass="bg-stone-500 dark:bg-stone-400"
                />
                <BarRow
                  label="PRS-published national average"
                  value={m.natVal}
                  unit={m.unit}
                  maxVal={m.maxVal}
                  barClass="bg-stone-400 dark:bg-stone-600"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
