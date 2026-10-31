'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, Database, BookOpen, Clock, MessageSquareWarning } from 'lucide-react';
import { MPRecord, Source } from '@/types/mp';
import { formatDate, formatReviewStatus } from '@/lib/formatters';
import { useLang, useMessages } from '@/context/LanguageContext';
import { cardMessages, CardMessages } from '@/lib/messages/card';
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

const ISSUES_URL = 'https://github.com/Alok-Pandey-Coder/MPScoreBoard/issues/new';

function roleLabel(role: Role, t: CardMessages): string {
  switch (role) {
    case 'primary':
      return t.roleSource;
    case 'secondary':
      return t.roleSecondary;
    case 'cross-check':
      return t.roleCrossCheck;
  }
}

/**
 * One entry per distinct source URL, labelled with every part of this card it
 * feeds. Section sources come first so their labels win over the general list.
 */
function collectSources(mp: MPRecord, t: CardMessages): SourceEntry[] {
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

  if (!mp.is_minister) add(mp.performance.source, t.usedForParliament);
  add(mp.profile?.source, t.usedForProfile);
  const mpladsRole: Role = mp.mplads?.review_status === 'secondary_only' ? 'secondary' : 'primary';
  add(mp.mplads?.source, t.usedForMplads, mpladsRole);
  mp.mplads?.cross_check?.forEach((check) => add(check.source, t.usedForMpladsCrossCheck, 'cross-check'));
  add(mp.affidavit?.source, t.usedForAffidavit);
  add(mp.election?.source, t.usedForElection);
  // The record-level list only contributes sources not already labelled above.
  for (const src of mp.sources) {
    if (src.url && !entries.has(src.url)) {
      add(src, /sansad|government|nct/i.test(src.name) ? t.usedForIdentity : t.usedForCard);
    }
  }
  return Array.from(entries.values());
}

export const SourcesFooter: React.FC<SourcesFooterProps> = ({ mp }) => {
  const t = useMessages(cardMessages);
  const { lang } = useLang();
  const sources = collectSources(mp, t);
  const perf = mp.performance;
  const freshness = [
    {
      label: t.freshnessParliament,
      asOf: mp.is_minister
        ? t.notApplicableMinister
        : perf.period
          ? `${formatDate(perf.period.from, lang)} – ${formatDate(perf.period.to, lang)}`
          : formatDate(perf.as_of, lang),
      status: mp.is_minister ? null : formatReviewStatus(perf.review_status, lang),
    },
    {
      label: t.freshnessMplads,
      asOf: formatDate(mp.mplads?.as_of, lang),
      status: formatReviewStatus(mp.mplads?.review_status, lang),
    },
    {
      label: t.freshnessAffidavit,
      asOf: mp.affidavit?.election_year ? t.electionYear(mp.affidavit.election_year) : formatDate(mp.affidavit?.as_of, lang),
      status: formatReviewStatus(mp.affidavit?.review_status, lang),
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
            <span>{t.sourcesHeading}</span>
          </h2>
          <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-0.5">
            {t.sourcesSubtitle}
          </p>
        </div>
        <Link
          href="/about"
          className="text-xs font-mono font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1.5 self-start sm:self-auto"
        >
          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t.fullMethodology}</span>
        </Link>
      </div>

      {/* 1. What we take, and from where */}
      <section aria-labelledby="sources-table">
        <h3 id="sources-table" className={subheading}>
          {t.sourcesTableHeading}
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
                  <p className="text-stone-600 dark:text-stone-300 mt-1">{src.usedFor.join('; ')}</p>
                  <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mt-0.5">
                    {roleLabel(src.role, t)} · {src.retrieved ? t.retrievedOn(formatDate(src.retrieved, lang)) : t.asOfMissing}
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
          {t.freshnessHeading}
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
          {freshness.map((row) => (
            <div key={row.label} className={box}>
              <dt className="text-stone-500 dark:text-stone-400">{row.label}</dt>
              <dd className="text-stone-900 dark:text-stone-100 mt-0.5">{row.asOf}</dd>
              {row.status && <dd className="text-stone-600 dark:text-stone-300 mt-0.5">{row.status}</dd>}
            </div>
          ))}
        </dl>
        <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mt-2">
          {t.snapshotNote(formatDate(snapshotJson.generated_at, lang))}
        </p>
      </section>

      {/* 3. Get something corrected */}
      <section aria-labelledby="corrections">
        <h3 id="corrections" className={subheading}>
          <MessageSquareWarning className="w-4 h-4 text-stone-500" aria-hidden="true" />
          {t.correctionsHeading}
        </h3>
        <p className="text-xs text-stone-600 dark:text-stone-300">
          {t.correctionsBefore}{' '}
          <a href={issueUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 dark:text-blue-300 hover:underline">
            {t.correctionsLink}
          </a>{' '}
          {t.correctionsAfter}
        </p>
      </section>
    </div>
  );
};
