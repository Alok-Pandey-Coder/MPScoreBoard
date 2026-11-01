'use client';

import React, { useMemo, useState } from 'react';
import { Hammer, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { MPRecord, MpladsWork, MpladsWorkStatus } from '@/types/mp';
import { formatCroreOrLakh, formatDate, formatNumber, NOT_AVAILABLE_TEXT } from '@/lib/formatters';
import { useLang, useMessages } from '@/context/LanguageContext';
import { cardMessages, type CardMessages } from '@/lib/messages/card';
import { commonMessages } from '@/lib/messages/common';

interface MpladsWorksSectionProps {
  mp: MPRecord;
}

type StatusFilter = 'all' | 'completed' | 'not_completed';
type StatusKey = 'statusRecommended' | 'statusSanctioned' | 'statusInProgress' | 'statusCompleted' | 'statusOther';

/** Official public dashboard; it has no linkable work-level pages (docs/mplads_works_source_review.md). */
const ESAKSHI_DASHBOARD = 'https://mplads.mospi.gov.in/digigov/dashboard.html';

const STATUS_LABEL_KEYS: Record<MpladsWorkStatus, StatusKey> = {
  recommended: 'statusRecommended',
  sanctioned: 'statusSanctioned',
  in_progress: 'statusInProgress',
  completed: 'statusCompleted',
  other: 'statusOther',
};

// Neutral greys/blues only; the text label carries the meaning.
const STATUS_CLASSES: Record<MpladsWorkStatus, string> = {
  recommended: 'bg-stone-100 text-stone-700 border-stone-300 dark:bg-[#16202E] dark:text-stone-300 dark:border-[#26344A]',
  sanctioned: 'bg-stone-100 text-stone-800 border-stone-300 dark:bg-[#16202E] dark:text-stone-200 dark:border-[#26344A]',
  in_progress: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30',
  completed: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-400/40',
  other: 'bg-stone-50 text-stone-600 border-stone-200 dark:bg-[#121A26] dark:text-stone-400 dark:border-[#1E293B]',
};

const FILTERS: Array<{ id: StatusFilter; labelKey: 'filterAll' | 'filterCompleted' | 'filterNotCompleted' }> = [
  { id: 'all', labelKey: 'filterAll' },
  { id: 'completed', labelKey: 'filterCompleted' },
  { id: 'not_completed', labelKey: 'filterNotCompleted' },
];

const PAGE_SIZE = 10;

const tileClass =
  'p-3.5 rounded-lg bg-stone-50 dark:bg-[#121A26] border border-stone-200/80 dark:border-[#1E293B]';

/** Translated label for a known status; the source's raw text otherwise. */
function statusLabel(work: MpladsWork, t: CardMessages): string {
  const key = STATUS_LABEL_KEYS[work.status];
  return key ? t[key] : (work.status_raw ?? t.statusOther);
}

export const MpladsWorksSection: React.FC<MpladsWorksSectionProps> = ({ mp }) => {
  const t = useMessages(cardMessages);
  const common = useMessages(commonMessages);
  const { lang } = useLang();
  const notAvailable = NOT_AVAILABLE_TEXT[lang];
  const mplads = mp.mplads;
  const isReported = !!mplads && mplads.status === 'reported';
  const works: MpladsWork[] = useMemo(
    () => (isReported && Array.isArray(mplads?.works) ? mplads.works : []),
    [isReported, mplads]
  );
  const counts = isReported ? mplads?.works_count ?? null : null;
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState<number>(1);

  const filtered = useMemo(() => {
    if (filter === 'completed') return works.filter((w) => w.status === 'completed');
    if (filter === 'not_completed') return works.filter((w) => w.status !== 'completed');
    return works;
  }, [filter, works]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const paginatedWorks = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const startIdx = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(safePage * PAGE_SIZE, filtered.length);

  const asOf = mplads?.as_of ? formatDate(mplads.as_of, lang) : null;
  const source = mplads?.source ?? null;
  const totalBySource = counts?.recommended ?? null;

  const countTiles = [
    { label: t.countRecommended, value: counts?.recommended },
    { label: t.countSanctioned, value: counts?.sanctioned },
    { label: t.countCompleted, value: counts?.completed },
    { label: t.countPending, value: counts?.pending },
  ];

  return (
    <div className="bg-white dark:bg-[#0E1420] rounded-xl p-5 sm:p-7 border border-stone-200/90 dark:border-[#1E2636] shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-4 border-b border-stone-100 dark:border-[#1A2333]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 font-sans tracking-tight flex items-center gap-2">
            <Hammer className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span>{t.worksHeading}</span>
          </h2>
          <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-0.5">
            {t.worksSubtitle}
            {asOf ? ` · ${t.asOfLower(asOf)}` : ''}
          </p>
          <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mt-1">
            {t.worksVerifyBefore}
            <a
              href={ESAKSHI_DASHBOARD}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 dark:text-blue-300 hover:underline"
            >
              {t.worksVerifyLink}
            </a>
            {t.worksVerifyAfter}
          </p>
        </div>
        {isReported && source?.name && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-50 dark:bg-[#141C29] text-stone-600 dark:text-stone-400 text-[11px] font-mono border border-stone-200/80 dark:border-[#222F42] self-start sm:self-auto">
            {source.url ? (
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                <span>{t.sourceLabel(source.name)}</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            ) : (
              <span>{t.sourceLabel(source.name)}</span>
            )}
          </span>
        )}
      </div>

      {!isReported ? (
        <p className="text-sm text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-[#121A26] border border-stone-200 dark:border-[#1E293B] rounded-lg p-5">
          {t.worksNotAvailable}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {countTiles.map((tile) => {
              const isUnavailable = tile.value === null || tile.value === undefined;
              const text = formatNumber(tile.value, lang);
              return (
                <div key={tile.label} className={tileClass}>
                  <span className="text-[10px] font-mono font-semibold text-stone-500 dark:text-stone-400 uppercase">
                    {tile.label}
                  </span>
                  <div
                    className={`font-bold font-mono text-stone-900 dark:text-white mt-1 tabular-nums ${
                      isUnavailable ? 'text-sm' : 'text-lg'
                    }`}
                  >
                    {text}
                  </div>
                  {isUnavailable && tile.label === t.countSanctioned && (
                    <span className="block text-[10px] font-mono text-stone-400 dark:text-stone-500 mt-0.5">
                      ({t.sanctionedNoteNotReported})
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {works.length === 0 ? (
            <p className="text-sm text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-[#121A26] border border-stone-200 dark:border-[#1E293B] rounded-lg p-5">
              {t.worksNoneListed}
            </p>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div role="group" aria-label={t.worksFilterLabel} className="flex flex-wrap gap-1.5">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setFilter(f.id);
                        setPage(1);
                      }}
                      aria-pressed={filter === f.id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        filter === f.id
                          ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-950 dark:border-stone-100'
                          : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200 dark:bg-[#141C28] dark:text-stone-300 dark:border-[#222E42] dark:hover:bg-[#1A2536]'
                      }`}
                    >
                      {t[f.labelKey]}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400" aria-live="polite">
                  {filtered.length === 0
                    ? null
                    : mplads?.works_is_partial
                      ? t.worksShowingWindowPartial(startIdx, endIdx, filtered.length, totalBySource)
                      : t.worksShowingWindow(startIdx, endIdx, filtered.length)}
                </p>
              </div>

              {filtered.length === 0 ? (
                <p className="text-sm text-stone-600 dark:text-stone-400 p-4">{t.worksNoMatch}</p>
              ) : (
                <>
                  <ul className="space-y-2.5">
                    {paginatedWorks.map((w, idx) => {
                      const costCr = w.final_amount_cr ?? w.recommended_amount_cr ?? null;
                      return (
                        <li
                          key={`${w.work_id}-${idx}`}
                          className="p-3.5 rounded-lg bg-stone-50/80 dark:bg-[#121A26] border border-stone-200/80 dark:border-[#1E293B] text-xs transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm break-words">
                                {w.description || t.workNoDescription}
                              </p>
                              {w.category && (
                                <span className="inline-block mt-0.5 text-[10px] font-mono text-stone-500 dark:text-stone-400">
                                  {w.category}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 self-start shrink-0">
                              {costCr !== null && (
                                <span className="font-mono text-xs font-bold text-stone-900 dark:text-white tabular-nums bg-stone-100 dark:bg-[#192333] px-2 py-0.5 rounded border border-stone-200/80 dark:border-[#26344A]">
                                  {formatCroreOrLakh(costCr, lang)}
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 rounded border text-[10px] font-mono font-semibold ${
                                  STATUS_CLASSES[w.status] ?? STATUS_CLASSES.other
                                }`}
                              >
                                {statusLabel(w, t)}
                              </span>
                            </div>
                          </div>
                          <dl className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-[11px] text-stone-600 dark:text-stone-400">
                            <div className="flex gap-1 min-w-0">
                              <dt className="shrink-0">{t.workAgency}</dt>
                              <dd className="break-words min-w-0">{w.implementing_agency ?? notAvailable}</dd>
                            </div>
                            {w.recommended_on && (
                              <div className="flex gap-1">
                                <dt>{t.workRecommendedOn}</dt>
                                <dd>{formatDate(w.recommended_on, lang)}</dd>
                              </div>
                            )}
                            {w.completed_on && (
                              <div className="flex gap-1">
                                <dt>{t.workCompletedOn}</dt>
                                <dd>{formatDate(w.completed_on, lang)}</dd>
                              </div>
                            )}
                            {w.final_amount_cr !== null && w.final_amount_cr !== undefined && (
                              <div className="flex gap-1">
                                <dt>{t.workFinalAmount}</dt>
                                <dd className="font-semibold text-stone-900 dark:text-stone-100 tabular-nums">
                                  {formatCroreOrLakh(w.final_amount_cr, lang)}
                                </dd>
                              </div>
                            )}
                            {w.recommended_amount_cr !== null && w.recommended_amount_cr !== undefined && (
                              <div className="flex gap-1">
                                <dt>{t.workRecommendedAmount}</dt>
                                <dd className="font-semibold text-stone-900 dark:text-stone-100 tabular-nums">
                                  {formatCroreOrLakh(w.recommended_amount_cr, lang)}
                                </dd>
                              </div>
                            )}
                            {w.paid_cr !== null && w.paid_cr !== undefined && (
                              <div className="flex gap-1">
                                <dt>{t.workPaid}</dt>
                                <dd className="tabular-nums">{formatCroreOrLakh(w.paid_cr, lang)}</dd>
                              </div>
                            )}
                            <div className="flex gap-1 min-w-0">
                              <dt className="shrink-0">{t.workId}</dt>
                              <dd className="break-all">{w.work_id || notAvailable}</dd>
                            </div>
                          </dl>
                          {source?.url && (
                            <p className="mt-2.5 pt-2 border-t border-stone-200/70 dark:border-[#1E293B] font-mono text-[10px] text-stone-500 dark:text-stone-400">
                              {t.sourceWord}{' '}
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 hover:underline"
                              >
                                {source.name}
                                <ExternalLink className="w-3 h-3" aria-hidden="true" />
                                <span className="sr-only">{common.opensInNewTab}</span>
                              </a>
                              {source.retrieved_at ? t.workRetrievedSuffix(formatDate(source.retrieved_at, lang)) : ''}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  {totalPages > 1 && (
                    <nav
                      aria-label={t.worksPaginationAria}
                      className="mt-4 pt-4 border-t border-stone-200/80 dark:border-[#1E293B] flex items-center justify-between gap-2"
                    >
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={safePage === 1}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200 dark:bg-[#141C28] dark:text-stone-300 dark:border-[#222E42] dark:hover:bg-[#1A2536]"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{t.worksPaginationPrevious}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPage(p)}
                            aria-current={p === safePage ? 'page' : undefined}
                            aria-label={t.worksPaginationPageAria(p)}
                            className={`min-w-8 h-8 px-2 rounded-lg text-xs font-mono font-semibold border transition-colors ${
                              p === safePage
                                ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-950 dark:border-stone-100'
                                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-200 dark:bg-[#141C28] dark:text-stone-300 dark:border-[#222E42] dark:hover:bg-[#1A2536]'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={safePage === totalPages}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200 dark:bg-[#141C28] dark:text-stone-300 dark:border-[#222E42] dark:hover:bg-[#1A2536]"
                      >
                        <span>{t.worksPaginationNext}</span>
                        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </nav>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
