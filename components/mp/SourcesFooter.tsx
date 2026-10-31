import React from 'react';
import Link from 'next/link';
import { ExternalLink, Database, BookOpen } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { formatDate, formatReviewStatus } from '@/lib/formatters';

interface SourcesFooterProps {
  mp: MPRecord;
}

export const SourcesFooter: React.FC<SourcesFooterProps> = ({ mp }) => {
  return (
    <div className="bg-white dark:bg-[#0E1420] rounded-xl p-5 sm:p-7 border border-stone-200/90 dark:border-[#1E2636] transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-stone-100 dark:border-[#1A2333]">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-sans tracking-tight flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Sources</span>
          </h3>
          <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-0.5">
            Each source used on this card, with its retrieval date
          </p>
        </div>

        <Link
          href="/about"
          className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5 self-start sm:self-auto"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Full Methodology &amp; Rules</span>
        </Link>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 text-[11px] font-mono">
        {[
          { label: 'Parliament activity', status: mp.is_minister ? 'Not applicable (minister)' : formatReviewStatus(mp.performance.review_status) },
          { label: 'MPLADS', status: formatReviewStatus(mp.mplads?.review_status) },
          { label: 'Affidavit', status: formatReviewStatus(mp.affidavit?.review_status) },
        ].map((row) => (
          <div key={row.label} className="bg-stone-50/80 dark:bg-[#121A26] p-2.5 rounded-lg border border-stone-200/80 dark:border-[#1E293B]">
            <dt className="text-stone-500 dark:text-stone-400">{row.label} review status</dt>
            <dd className="text-stone-800 dark:text-stone-200 mt-0.5">{row.status ?? 'Not recorded'}</dd>
          </div>
        ))}
      </dl>

      <div className="space-y-2.5">
        {mp.sources.map((src, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-stone-50/80 dark:bg-[#121A26] p-3.5 rounded-lg border border-stone-200/80 dark:border-[#1E293B] text-xs font-mono transition-colors"
          >
            <div>
              <div className="font-semibold text-stone-900 dark:text-white flex items-center gap-1.5 text-xs font-sans">
                <span>{src.name}</span>
                {src.licence && (
                  <span className="px-1.5 py-0.2 rounded bg-stone-200 dark:bg-[#1C2738] text-stone-700 dark:text-stone-300 text-[10px] font-mono border border-stone-300 dark:border-[#28374D]">
                    {src.licence}
                  </span>
                )}
              </div>
              <div className="text-stone-500 dark:text-stone-400 text-[11px] mt-0.5">
                {src.retrieved_at ?? src.retrievedAt ? `Retrieved ${formatDate(src.retrieved_at ?? src.retrievedAt)}` : 'Retrieval date not recorded'}
              </div>
            </div>

            <a
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline font-mono text-[11px] self-start sm:self-auto"
            >
              <span className="truncate max-w-xs">{src.url}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
