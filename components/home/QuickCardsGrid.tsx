'use client';

import React from 'react';
import Link from 'next/link';
import { Award, ArrowUpRight, Scale } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { NOT_AVAILABLE_TEXT, formatPct } from '@/lib/formatters';
import { useLang, useMessages } from '@/context/LanguageContext';
import { homeMessages } from '@/lib/messages/home';

interface QuickCardsGridProps {
  mps: MPRecord[];
}

export const QuickCardsGrid: React.FC<QuickCardsGridProps> = ({ mps }) => {
  const t = useMessages(homeMessages);
  const { lang } = useLang();
  const notAvailable = NOT_AVAILABLE_TEXT[lang];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {mps.map((mp) => {
        const isMinister = mp.is_minister || mp.performance.status === 'not_applicable';
        const attendance = mp.performance.attendance_pct;
        const questions = mp.performance.questions;
        const criminalCases = mp.affidavit?.declared_criminal_cases ?? null;
        const education = mp.profile?.education ?? null;
        const stateAtt = mp.performance.prs_averages?.state?.attendance_pct ?? null;
        const stateQ = mp.performance.prs_averages?.state?.questions ?? null;

        return (
          <Link
            key={mp.slug}
            href={`/mp/${mp.slug}`}
            className="group bg-white dark:bg-[#0E1420] rounded-xl p-5 border border-stone-200/90 dark:border-[#1E2636] hover:border-amber-500/80 dark:hover:border-amber-500/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer relative"
          >
            <div>
              {/* Top Dossier Header: Seat + Category */}
              <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-stone-100 dark:border-[#1A2333]">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-stone-500 dark:text-stone-400">
                  <span className="text-stone-900 dark:text-stone-200 font-bold">{mp.constituency}</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-[#16202E] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-[#223044] font-bold">
                    {mp.party}
                  </span>
                  {mp.reservation && mp.reservation !== 'GEN' && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-bold">
                      {mp.reservation}
                    </span>
                  )}
                </div>
              </div>

              {/* Member Profile Seal & Name */}
              <div className="flex items-start gap-3.5 mb-4">
                <div className="w-11 h-11 rounded-lg bg-stone-100 dark:bg-[#16202E] border border-stone-200 dark:border-[#26344A] flex items-center justify-center font-bold font-mono text-stone-800 dark:text-stone-200 text-sm shrink-0 group-hover:border-amber-500/60 transition-colors">
                  {mp.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors text-base font-sans line-clamp-1">
                    {mp.name}
                  </h3>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-2 mt-0.5">
                    <span>{mp.term || t.defaultTerm}</span>
                    {education && (
                      <>
                        <span>·</span>
                        <span className="truncate max-w-[120px]">{education}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Indicators Ledger Display */}
              <div className="bg-stone-50 dark:bg-[#121A26] rounded-lg p-3 border border-stone-200/80 dark:border-[#1E293B] mb-3">
                {isMinister ? (
                  <div className="text-xs space-y-1.5">
                    <div className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 font-mono text-[11px]">
                      <Award className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>{t.ministerNotApplicable}</span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-snug">
                      {t.ministerNote}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-white dark:bg-[#0E1420] rounded-md p-2 border border-stone-200/70 dark:border-[#1C2738]">
                      <div className="text-[10px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        {t.attendance}
                      </div>
                      <div className="text-base font-extrabold font-mono text-stone-900 dark:text-white mt-0.5 tabular-nums">
                        {formatPct(attendance, lang)}
                      </div>
                      <div className="text-[9px] text-stone-400 font-mono mt-0.5">
                        {stateAtt !== null ? t.stateAvg(mp.state, `${stateAtt}%`) : t.stateAvgNotAvailable}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#0E1420] rounded-md p-2 border border-stone-200/70 dark:border-[#1C2738]">
                      <div className="text-[10px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        {t.questions}
                      </div>
                      <div className="text-base font-extrabold font-mono text-stone-900 dark:text-white mt-0.5 tabular-nums">
                        {questions !== null && questions !== undefined ? questions : notAvailable}
                      </div>
                      <div className="text-[9px] text-stone-400 font-mono mt-0.5">
                        {stateQ !== null ? t.stateAvg(mp.state, String(stateQ)) : t.stateAvgNotAvailable}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sworn Affidavit Snapshot Rule */}
              <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400 px-1 py-1">
                <span className="flex items-center gap-1">
                  <Scale className="w-3 h-3 text-stone-400" />
                  <span>{t.pendingCases}</span>
                </span>
                <span className="font-semibold text-stone-700 dark:text-stone-300">
                  {criminalCases !== null ? criminalCases : notAvailable}
                </span>
              </div>
            </div>

            {/* Dossier Card Footer */}
            <div className="pt-3 mt-2 border-t border-stone-100 dark:border-[#1A2333] flex items-center justify-between text-xs font-mono font-medium text-stone-600 dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              <span>{t.viewDossier}</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>
        );
      })}
    </div>
  );
};
