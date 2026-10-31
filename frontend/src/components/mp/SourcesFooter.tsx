import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Database, BookOpen } from 'lucide-react';
import { MPRecord } from '../../types/mp';
import { formatDate } from '../../lib/formatters';

interface SourcesFooterProps {
  mp: MPRecord;
}

export const SourcesFooter: React.FC<SourcesFooterProps> = ({ mp }) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Card Provenance &amp; Primary Sources</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Every number on this card is linked to an official public record
          </p>
        </div>

        <Link
          to="/about"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 self-start sm:self-auto"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Full Methodology &amp; FAQ</span>
        </Link>
      </div>

      <div className="space-y-3">
        {mp.sources.map((src, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs transition-colors"
          >
            <div>
              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 font-['Outfit'] text-sm">
                <span>{src.name}</span>
                {src.licence && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] border border-slate-200 dark:border-slate-600 font-medium">
                    {src.licence}
                  </span>
                )}
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                {src.retrieved_at ? `Retrieved: ${formatDate(src.retrieved_at)}` : 'Captured from snapshot'}
              </div>
            </div>

            <a
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium self-start sm:self-auto"
            >
              <span className="truncate max-w-xs">{src.url}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
