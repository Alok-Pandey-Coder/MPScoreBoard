'use client';

import React, { useMemo, useState } from 'react';
import { Hammer, ExternalLink } from 'lucide-react';
import { MPRecord, MpladsWork, MpladsWorkStatus } from '@/types/mp';
import { formatCroreOrLakh, formatDate, formatNumber, NOT_AVAILABLE } from '@/lib/formatters';

interface MpladsWorksSectionProps {
  mp: MPRecord;
}

type StatusFilter = 'all' | 'completed' | 'not_completed';

/** Official public dashboard; it has no linkable work-level pages (docs/mplads_works_source_review.md). */
const ESAKSHI_DASHBOARD = 'https://mplads.mospi.gov.in/digigov/dashboard.html';

const STATUS_LABELS: Record<MpladsWorkStatus, string> = {
  recommended: 'Recommended',
  sanctioned: 'Sanctioned',
  in_progress: 'In progress',
  completed: 'Completed',
  other: 'Other',
};

// Neutral greys/blues only; the text label carries the meaning.
const STATUS_CLASSES: Record<MpladsWorkStatus, string> = {
  recommended: 'bg-stone-100 text-stone-700 border-stone-300 dark:bg-[#16202E] dark:text-stone-300 dark:border-[#26344A]',
  sanctioned: 'bg-stone-100 text-stone-800 border-stone-300 dark:bg-[#16202E] dark:text-stone-200 dark:border-[#26344A]',
  in_progress: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30',
  completed: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-400/40',
  other: 'bg-stone-50 text-stone-600 border-stone-200 dark:bg-[#121A26] dark:text-stone-400 dark:border-[#1E293B]',
};

const FILTERS: Array<{ id: StatusFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'completed', label: 'Completed' },
  { id: 'not_completed', label: 'Not completed' },
];

const tileClass =
  'p-3.5 rounded-lg bg-stone-50 dark:bg-[#121A26] border border-stone-200/80 dark:border-[#1E293B]';

function statusLabel(work: MpladsWork): string {
  return STATUS_LABELS[work.status] ?? work.status_raw ?? 'Other';
}

export const MpladsWorksSection: React.FC<MpladsWorksSectionProps> = ({ mp }) => {
  const mplads = mp.mplads;
  const isReported = !!mplads && mplads.status === 'reported';
  const works: MpladsWork[] = useMemo(
    () => (isReported && Array.isArray(mplads?.works) ? mplads.works : []),
    [isReported, mplads]
  );
  const counts = isReported ? mplads?.works_count ?? null : null;
  const [filter, setFilter] = useState<StatusFilter>('all');

  const filtered = useMemo(() => {
    if (filter === 'completed') return works.filter((w) => w.status === 'completed');
    if (filter === 'not_completed') return works.filter((w) => w.status !== 'completed');
    return works;
  }, [filter, works]);

  const asOf = mplads?.as_of ? formatDate(mplads.as_of) : null;
  const source = mplads?.source ?? null;
  const totalBySource = counts?.recommended ?? null;

  const countTiles = [
    { label: 'Recommended', value: counts?.recommended },
    { label: 'Sanctioned', value: counts?.sanctioned },
    { label: 'Completed', value: counts?.completed },
    { label: 'Pending', value: counts?.pending },
  ];

  return (
    <div className="bg-white dark:bg-[#0E1420] rounded-xl p-5 sm:p-7 border border-stone-200/90 dark:border-[#1E2636] shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-4 border-b border-stone-100 dark:border-[#1A2333]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 font-sans tracking-tight flex items-center gap-2">
            <Hammer className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span>MPLADS Works</span>
          </h2>
          <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-0.5">
            Works listed by the source, in the order published{asOf ? ` · as of ${asOf}` : ''}
          </p>
          <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mt-1">
            Verify a work on the{' '}
            <a
              href={ESAKSHI_DASHBOARD}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 dark:text-blue-300 hover:underline"
            >
              official MoSPI eSAKSHI dashboard
            </a>{' '}
            using its eSAKSHI work ID (the portal has no per-work links).
          </p>
        </div>
        {isReported && source?.name && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-50 dark:bg-[#141C29] text-stone-600 dark:text-stone-400 text-[11px] font-mono border border-stone-200/80 dark:border-[#222F42] self-start sm:self-auto">
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
      </div>

      {!isReported ? (
        <p className="text-sm text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-[#121A26] border border-stone-200 dark:border-[#1E293B] rounded-lg p-5">
          MPLADS works data not available for this seat yet.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {countTiles.map((t) => {
              const text = formatNumber(t.value);
              return (
                <div key={t.label} className={tileClass}>
                  <span className="text-[10px] font-mono font-semibold text-stone-500 dark:text-stone-400 uppercase">
                    {t.label}
                  </span>
                  <div
                    className={`font-bold font-mono text-stone-900 dark:text-white mt-1 tabular-nums ${
                      text === NOT_AVAILABLE ? 'text-sm' : 'text-lg'
                    }`}
                  >
                    {text}
                  </div>
                </div>
              );
            })}
          </div>

          {works.length === 0 ? (
            <p className="text-sm text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-[#121A26] border border-stone-200 dark:border-[#1E293B] rounded-lg p-5">
              No individual works are listed by the source for this seat yet.
            </p>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div role="group" aria-label="Filter works by status" className="flex flex-wrap gap-1.5">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFilter(f.id)}
                      aria-pressed={filter === f.id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        filter === f.id
                          ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-950 dark:border-stone-100'
                          : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200 dark:bg-[#141C28] dark:text-stone-300 dark:border-[#222E42] dark:hover:bg-[#1A2536]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400" aria-live="polite">
                  {mplads?.works_is_partial
                    ? `Showing ${filtered.length} of ${totalBySource ?? 'an unknown number of'} works listed by the source`
                    : `Showing ${filtered.length} of ${works.length} works`}
                </p>
              </div>

              {filtered.length === 0 ? (
                <p className="text-sm text-stone-600 dark:text-stone-400 p-4">No works match this filter.</p>
              ) : (
                <ul className="space-y-2.5">
                  {filtered.map((w, idx) => (
                    <li
                      key={`${w.work_id}-${idx}`}
                      className="p-3.5 rounded-lg bg-stone-50/80 dark:bg-[#121A26] border border-stone-200/80 dark:border-[#1E293B] text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm break-words min-w-0">
                          {w.description || 'Description not available from the source.'}
                        </p>
                        <span
                          className={`self-start shrink-0 px-2 py-0.5 rounded border text-[10px] font-mono font-semibold ${
                            STATUS_CLASSES[w.status] ?? STATUS_CLASSES.other
                          }`}
                        >
                          {statusLabel(w)}
                        </span>
                      </div>
                      <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px] text-stone-600 dark:text-stone-400">
                        <div className="flex gap-1 min-w-0">
                          <dt className="shrink-0">Agency:</dt>
                          <dd className="break-words min-w-0">{w.implementing_agency ?? NOT_AVAILABLE}</dd>
                        </div>
                        <div className="flex gap-1">
                          <dt>Recommended on:</dt>
                          <dd>{formatDate(w.recommended_on)}</dd>
                        </div>
                        <div className="flex gap-1">
                          <dt>Completed on:</dt>
                          <dd>{formatDate(w.completed_on)}</dd>
                        </div>
                        <div className="flex gap-1">
                          <dt>Recommended amount:</dt>
                          <dd>{formatCroreOrLakh(w.recommended_amount_cr)}</dd>
                        </div>
                        {w.final_amount_cr !== null && w.final_amount_cr !== undefined && (
                          <div className="flex gap-1">
                            <dt>Final amount:</dt>
                            <dd>{formatCroreOrLakh(w.final_amount_cr)}</dd>
                          </div>
                        )}
                        {w.paid_cr !== null && w.paid_cr !== undefined && (
                          <div className="flex gap-1">
                            <dt>Paid:</dt>
                            <dd>{formatCroreOrLakh(w.paid_cr)}</dd>
                          </div>
                        )}
                        <div className="flex gap-1 min-w-0">
                          <dt className="shrink-0">eSAKSHI work ID:</dt>
                          <dd className="break-all">{w.work_id || NOT_AVAILABLE}</dd>
                        </div>
                      </dl>
                      {source?.url && (
                        <p className="mt-2 pt-2 border-t border-stone-200/70 dark:border-[#1E293B] font-mono text-[10px] text-stone-500 dark:text-stone-400">
                          Source:{' '}
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 hover:underline"
                          >
                            {source.name}
                            <ExternalLink className="w-3 h-3" aria-hidden="true" />
                            <span className="sr-only">(opens in a new tab)</span>
                          </a>
                          {source.retrieved_at ? ` · retrieved ${formatDate(source.retrieved_at)}` : ''}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
