import React from 'react';
import { Info, Building2, ExternalLink } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { formatCrore, formatDate, formatPct, formatReviewStatus } from '@/lib/formatters';

interface MpladsSectionProps {
  mp: MPRecord;
}

const tileClass =
  'p-3.5 rounded-lg bg-stone-50 dark:bg-[#121A26] border border-stone-200/80 dark:border-[#1E293B]';
const tileLabelClass = 'text-[10px] font-mono font-semibold text-stone-500 dark:text-stone-400 uppercase';
const tileValueClass = 'text-base sm:text-lg font-bold font-mono text-stone-900 dark:text-white mt-1 tabular-nums';

export const MpladsSection: React.FC<MpladsSectionProps> = ({ mp }) => {
  const mplads = mp.mplads;
  const isReported = !!mplads && mplads.status === 'reported';

  const asOf = mplads?.as_of ? formatDate(mplads.as_of) : null;
  const source = mplads?.source ?? null;
  const isSecondary = mplads?.review_status === 'secondary_only';
  const reviewLabel = formatReviewStatus(mplads?.review_status);
  const unspent = mplads?.unspent_cr;
  const unspentAnomaly = unspent !== null && unspent !== undefined && unspent < 0;
  const crossChecks = (mplads?.cross_check ?? []).filter((c) => c.differences && c.differences.length > 0);

  return (
    <div className="bg-white dark:bg-[#0E1420] rounded-xl p-5 sm:p-7 border border-stone-200/90 dark:border-[#1E2636] shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-4 border-b border-stone-100 dark:border-[#1A2333]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 font-sans tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span>Local Area Development Funds (MPLADS)</span>
          </h2>
          <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-0.5">
            18th Lok Sabha{asOf ? ` · as of ${asOf}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {isReported && source?.name && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-50 dark:bg-[#141C29] text-stone-600 dark:text-stone-400 text-[11px] font-mono border border-stone-200/80 dark:border-[#222F42]">
              {source.url ? (
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                  <span>Source: {source.name}</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              ) : (
                <span>Source: {source.name}</span>
              )}
            </span>
          )}
          {isReported && isSecondary && (
            <span className="inline-flex items-center px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300 text-[11px] font-mono font-semibold border border-blue-200 dark:border-blue-500/30">
              Secondary source — official eSAKSHI check pending
            </span>
          )}
        </div>
      </div>

      {!isReported ? (
        <div className="bg-stone-50 dark:bg-[#121A26] border border-stone-200 dark:border-[#1E293B] rounded-lg p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-stone-200 dark:bg-[#192231] text-stone-600 dark:text-stone-300 flex items-center justify-center shrink-0 border border-stone-300 dark:border-[#26344A]">
            <Info className="w-5 h-5" aria-hidden="true" />
          </div>
          <p className="text-sm text-stone-700 dark:text-stone-300">
            {mplads?.status === 'not_applicable'
              ? 'MPLADS figures are not applicable for this record.'
              : 'MPLADS data not available for this seat yet.'}
          </p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 min-[400px]:grid-cols-3 gap-3 mb-3">
            <div className={tileClass}>
              <span className={tileLabelClass}>Allocated</span>
              <div className={tileValueClass}>{formatCrore(mplads.allocated_cr)}</div>
            </div>
            <div className={tileClass}>
              <span className={tileLabelClass}>Spent</span>
              <div className={tileValueClass}>{formatCrore(mplads.expenditure_cr)}</div>
            </div>
            <div className={tileClass}>
              <span className={tileLabelClass}>Unspent</span>
              <div className={tileValueClass}>{unspentAnomaly ? 'Check source' : formatCrore(unspent)}</div>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <div className={tileClass}>
              <dt className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Spent: {formatPct(mplads.expenditure_pct)} of allocated
              </dt>
              <dd className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mt-1">
                Expenditure ÷ amount allocated to the MP in this term.
              </dd>
            </div>
            <div className={tileClass}>
              <dt className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Recommended for works: {formatPct(mplads.recommended_pct)} of allocated
              </dt>
              <dd className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mt-1">
                Amount the MP has recommended for works ({formatCrore(mplads.recommended_amount_cr)}) ÷ amount allocated.
                Recommended is not the same as spent.
              </dd>
            </div>
          </dl>

          <div className="space-y-2 text-xs font-mono text-stone-500 dark:text-stone-400">
            <p className="flex items-start gap-2 bg-stone-50 dark:bg-[#121A26] p-3 rounded-lg border border-stone-200 dark:border-[#1E293B]">
              <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>Fund use is usually lower early in a term.</span>
            </p>
            <p>
              {asOf ? `As of ${asOf}` : 'As-of date not available'}
              {reviewLabel ? ` · Review status: ${reviewLabel}` : ''}
            </p>
          </div>

          {crossChecks.length > 0 && (
            <details className="mt-4 rounded-lg border border-stone-200 dark:border-[#1E293B] p-3 text-xs">
              <summary className="cursor-pointer font-semibold text-stone-700 dark:text-stone-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                Another aggregator reports different figures
              </summary>
              <div className="mt-2 space-y-3">
                {crossChecks.map((c, i) => (
                  <div key={i} className="font-mono text-[11px] text-stone-600 dark:text-stone-400">
                    <p className="font-semibold">
                      {c.source?.url ? (
                        <a href={c.source.url} target="_blank" rel="noopener noreferrer" className="underline">
                          {c.source.name}
                        </a>
                      ) : (
                        c.source?.name ?? 'Other source'
                      )}
                      {c.as_of ? ` (as of ${formatDate(c.as_of)})` : ''}
                    </p>
                    <ul className="list-disc pl-5 mt-1 space-y-0.5">
                      {c.differences.map((d, j) => (
                        <li key={j}>{d}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
};
