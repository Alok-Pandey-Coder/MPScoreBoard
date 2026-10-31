import React from 'react';
import Link from 'next/link';
import { ExternalLink, Database, BookOpen, Clock, MessageSquareWarning } from 'lucide-react';
import { MPRecord, Source } from '@/types/mp';
import { formatDate, formatReviewStatus } from '@/lib/formatters';
import snapshotJson from '@/data/processed/snapshot.json';

interface SourcesFooterProps {
  mp: MPRecord;
}

type Role = 'primary' | 'secondary' | 'cross-check';

interface SourceEntry {
  name: string;
  url: string;
  licence?: string;
  retrieved?: string;
  role: Role;
  usedFor: string[];
}

const ROLE_LABEL: Record<Role, string> = {
  primary: 'Source',
  secondary: 'Secondary source · official check pending',
  'cross-check': 'Cross-check only · not shown as the main figure',
};

const ISSUES_URL = 'https://github.com/Alok-Pandey-Coder/MPScoreBoard/issues/new';

/**
 * One entry per distinct source URL, labelled with every part of this card it
 * feeds. Section sources come first so their labels win over the general list.
 */
function collectSources(mp: MPRecord): SourceEntry[] {
  const entries = new Map<string, SourceEntry>();
  const add = (src: Source | null | undefined, usedFor: string, role: Role = 'primary') => {
    if (!src?.url) return;
    const existing = entries.get(src.url);
    if (existing) {
      if (!existing.usedFor.includes(usedFor)) existing.usedFor.push(usedFor);
      return;
    }
    entries.set(src.url, {
      name: src.name,
      url: src.url,
      licence: src.licence,
      retrieved: src.retrieved_at ?? src.retrievedAt,
      role,
      usedFor: [usedFor],
    });
  };

  if (!mp.is_minister) add(mp.performance.source, 'Parliament activity indicators and PRS averages');
  add(mp.profile?.source, 'Profile (age, education level, term)');
  const mpladsRole: Role = mp.mplads?.review_status === 'secondary_only' ? 'secondary' : 'primary';
  add(mp.mplads?.source, 'MPLADS funds and the works list', mpladsRole);
  mp.mplads?.cross_check?.forEach((check) => add(check.source, 'MPLADS cross-check', 'cross-check'));
  add(mp.affidavit?.source, 'Declared assets, cases and education (election affidavit)');
  add(mp.election?.source, '2024 election result');
  // The record-level list only contributes sources not already labelled above.
  for (const src of mp.sources) {
    if (src.url && !entries.has(src.url)) {
      add(src, /sansad|government|nct/i.test(src.name) ? 'MP identity and constituency' : 'Card data');
    }
  }
  return Array.from(entries.values());
}

export const SourcesFooter: React.FC<SourcesFooterProps> = ({ mp }) => {
  const sources = collectSources(mp);
  const perf = mp.performance;
  const freshness = [
    {
      label: 'Parliament activity',
      asOf: mp.is_minister
        ? 'Not applicable (minister)'
        : perf.period
          ? `${formatDate(perf.period.from)} – ${formatDate(perf.period.to)}`
          : formatDate(perf.as_of),
      status: mp.is_minister ? null : formatReviewStatus(perf.review_status),
    },
    { label: 'MPLADS funds and works', asOf: formatDate(mp.mplads?.as_of), status: formatReviewStatus(mp.mplads?.review_status) },
    {
      label: 'Election affidavit',
      asOf: mp.affidavit?.election_year ? `${mp.affidavit.election_year} election` : formatDate(mp.affidavit?.as_of),
      status: formatReviewStatus(mp.affidavit?.review_status),
    },
  ];
  const issueUrl = `${ISSUES_URL}?${new URLSearchParams({
    title: `Data issue: ${mp.constituency} (${mp.slug})`,
    body: `Card: /mp/${mp.slug}\nWhich figure looks wrong:\nWhat the source says (with link):\n`,
  }).toString()}`;

  const subheading = 'text-sm font-bold text-stone-900 dark:text-stone-100 font-sans flex items-center gap-2 mb-3 scroll-mt-24';
  const box = 'bg-stone-50/80 dark:bg-[#121A26] p-3.5 rounded-lg border border-stone-200/80 dark:border-[#1E293B]';

  return (
    <div className="bg-white dark:bg-[#0E1420] rounded-xl p-5 sm:p-7 border border-stone-200/90 dark:border-[#1E2636] transition-colors space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100 dark:border-[#1A2333]">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-sans tracking-tight flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span>Sources &amp; evidence</span>
          </h2>
          <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-0.5">
            Where every figure on this card comes from. Records here are copies; verify anything you rely on with the source.
          </p>
        </div>
        <Link
          href="/about"
          className="text-xs font-mono font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1.5 self-start sm:self-auto"
        >
          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Full methodology</span>
        </Link>
      </div>

      {/* 1. What we take, and from where */}
      <section aria-labelledby="sources-table">
        <h3 id="sources-table" className={subheading}>
          What we take, and from where
        </h3>
        <ol className="space-y-2.5">
          {sources.map((src, index) => (
            <li key={src.url} className={`${box} text-xs`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-stone-900 dark:text-white font-sans flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-stone-400">{index + 1}.</span>
                    <span>{src.name}</span>
                    {src.licence && (
                      <span className="px-1.5 rounded bg-stone-200 dark:bg-[#1C2738] text-stone-700 dark:text-stone-300 text-[10px] font-mono border border-stone-300 dark:border-[#28374D]">
                        {src.licence}
                      </span>
                    )}
                  </p>
                  <p className="text-stone-600 dark:text-stone-300 mt-1">Used for: {src.usedFor.join('; ')}</p>
                  <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mt-0.5">
                    {ROLE_LABEL[src.role]} · {src.retrieved ? `retrieved ${formatDate(src.retrieved)}` : 'retrieval date not recorded'}
                  </p>
                </div>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 hover:underline font-mono text-[11px] self-start shrink-0 max-w-full"
                >
                  <span className="truncate max-w-[16rem]">{src.url.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 2. How current it is */}
      <section aria-labelledby="freshness">
        <h3 id="freshness" className={subheading}>
          <Clock className="w-4 h-4 text-stone-500" aria-hidden="true" />
          How current it is
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
          {freshness.map((row) => (
            <div key={row.label} className={box}>
              <dt className="text-stone-500 dark:text-stone-400">{row.label}</dt>
              <dd className="text-stone-900 dark:text-stone-100 mt-0.5">As of: {row.asOf}</dd>
              {row.status && <dd className="text-stone-600 dark:text-stone-300 mt-0.5">Review: {row.status}</dd>}
            </div>
          ))}
        </dl>
        <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mt-2">
          This card is built from a snapshot generated on {formatDate(snapshotJson.generated_at)}. Figures are not live.
        </p>
      </section>

      {/* 3. Get something corrected */}
      <section aria-labelledby="corrections">
        <h3 id="corrections" className={subheading}>
          <MessageSquareWarning className="w-4 h-4 text-stone-500" aria-hidden="true" />
          Get something corrected
        </h3>
        <p className="text-xs text-stone-600 dark:text-stone-300">
          Spotted a figure that doesn&apos;t match its source?{' '}
          <a href={issueUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 dark:text-blue-300 hover:underline">
            Report it on GitHub
          </a>{' '}
          with a link to the source page. We fix the data at the source capture, not by hand-editing numbers.
        </p>
      </section>
    </div>
  );
};
