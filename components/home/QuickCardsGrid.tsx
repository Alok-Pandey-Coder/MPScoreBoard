import React from 'react';
import Link from 'next/link';
import { ChevronRight, Award, ShieldAlert, GraduationCap, ArrowUpRight, Scale } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { MPAvatar } from '@/components/ui/MPAvatar';

interface QuickCardsGridProps {
  mps: MPRecord[];
}

export const QuickCardsGrid: React.FC<QuickCardsGridProps> = ({ mps }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {mps.map((mp) => {
        const isMinister = mp.is_minister || mp.performance.status === 'not_applicable';
        const attendance = mp.performance.attendance_pct;
        const questions = mp.performance.questions;
        const criminalCases = mp.affidavit?.declared_criminal_cases ?? null;
        const education = mp.profile?.education || 'Graduate';

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
                <MPAvatar
                  imageUrl={mp.image_url}
                  name={mp.name}
                  size="md"
                />
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors text-base font-sans line-clamp-1">
                    {mp.name}
                  </h3>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-2 mt-0.5">
                    <span>{mp.term || '18th Lok Sabha'}</span>
                    <span>·</span>
                    <span className="truncate max-w-[120px]">{education}</span>
                  </div>
                </div>
              </div>

              {/* Key Indicators Ledger Display */}
              <div className="bg-stone-50 dark:bg-[#121A26] rounded-lg p-3 border border-stone-200/80 dark:border-[#1E293B] mb-3">
                {isMinister ? (
                  <div className="text-xs space-y-1.5">
                    <div className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 font-mono text-[11px]">
                      <Award className="w-3.5 h-3.5 shrink-0" />
                      <span>Union Minister of State</span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-snug">
                      Ministers answer on behalf of Government; questions &amp; private debates not applicable per parliamentary rules.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-white dark:bg-[#0E1420] rounded-md p-2 border border-stone-200/70 dark:border-[#1C2738]">
                      <div className="text-[10px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        Attendance
                      </div>
                      <div className="text-base font-extrabold font-mono text-stone-900 dark:text-white mt-0.5 tabular-nums">
                        {attendance !== null ? `${attendance}%` : 'N/A'}
                      </div>
                      <div className="text-[9px] text-stone-400 font-mono mt-0.5">
                        State Avg: 96%
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#0E1420] rounded-md p-2 border border-stone-200/70 dark:border-[#1C2738]">
                      <div className="text-[10px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        Questions
                      </div>
                      <div className="text-base font-extrabold font-mono text-stone-900 dark:text-white mt-0.5 tabular-nums">
                        {questions !== null ? questions : 'N/A'}
                      </div>
                      <div className="text-[9px] text-stone-400 font-mono mt-0.5">
                        State Avg: 172
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sworn Affidavit Snapshot Rule */}
              <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400 px-1 py-1">
                <span className="flex items-center gap-1">
                  <Scale className="w-3 h-3 text-stone-400" />
                  <span>Criminal Cases:</span>
                </span>
                <span className={`font-semibold ${criminalCases && criminalCases > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-stone-700 dark:text-stone-300'}`}>
                  {criminalCases !== null ? criminalCases : '0'} declared
                </span>
              </div>
            </div>

            {/* Dossier Card Footer */}
            <div className="pt-3 mt-2 border-t border-stone-100 dark:border-[#1A2333] flex items-center justify-between text-xs font-mono font-medium text-stone-600 dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              <span>View Dossier &amp; Sources</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>
        );
      })}
    </div>
  );
};
