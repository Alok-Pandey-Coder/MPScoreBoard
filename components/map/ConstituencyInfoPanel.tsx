'use client';

import React from 'react';
import { X, Award, ChevronRight, User } from 'lucide-react';
import { ConstituencyGeoData } from '@/lib/indiaGeoData';
import Link from 'next/link';
import { useLang, useMessages } from '@/context/LanguageContext';
import { mapMessages } from '@/lib/messages/map';
import { NOT_AVAILABLE_TEXT } from '@/lib/formatters';
import { localizeParty, localizeReservation } from '@/lib/i18n';

export interface ConstituencyInfoPanelProps {
  constituency: ConstituencyGeoData;
  onClose: () => void;
}

export const ConstituencyInfoPanel: React.FC<ConstituencyInfoPanelProps> = ({
  constituency,
  onClose,
}) => {
  const t = useMessages(mapMessages);
  const { lang } = useLang();
  return (
    <div className="w-80 rounded-xl bg-white/95 dark:bg-[#171D24]/95 border border-amber-500/80 shadow-2xl backdrop-blur-md overflow-hidden text-stone-800 dark:text-[#F3F4F6] animate-in fade-in zoom-in-95 duration-200 transition-colors duration-200">
      <div className="p-3 border-b border-stone-200 dark:border-[#303A45] flex items-center justify-between bg-stone-50/90 dark:bg-[#14191F]/90">
        <div>
          {constituency.reservation && (
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
              {t.seatType(localizeReservation(constituency.reservation, lang))}
            </span>
          )}
          <h4 className="text-sm font-bold text-stone-900 dark:text-white mt-1 font-['Outfit',sans-serif]">
            {constituency.name}
          </h4>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-stone-400 dark:text-[#9BAABD] hover:text-stone-700 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-[#1D242D] transition-colors cursor-pointer"
          aria-label={t.closeConstituencyPanel}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3.5 space-y-3">
        {/* MP Details */}
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-full bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-[#303A45] flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-sm shrink-0">
            {constituency.sittingMP?.charAt(0) || <User className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-stone-900 dark:text-white truncate">
              {constituency.sittingMP || NOT_AVAILABLE_TEXT[lang]}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {constituency.party && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-100 dark:bg-[#1D242D] text-stone-700 dark:text-slate-300 font-medium border border-stone-200 dark:border-[#303A45]">
                  {localizeParty(constituency.party, lang)}
                </span>
              )}
              {constituency.isMinister && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 flex items-center gap-0.5">
                  <Award className="w-2.5 h-2.5" /> {t.minister}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Benchmarks if available */}
        <div className="grid grid-cols-3 gap-1.5 bg-stone-50 dark:bg-[#14191F]/80 p-2 rounded-lg border border-stone-200 dark:border-[#303A45] text-center">
          <div>
            <div className="text-[9px] text-stone-500 dark:text-[#9BAABD] uppercase">{t.attendance}</div>
            <div className="text-xs font-bold text-stone-900 dark:text-white font-mono mt-0.5">
              {constituency.attendancePct !== null && constituency.attendancePct !== undefined ? `${constituency.attendancePct}%` : NOT_AVAILABLE_TEXT[lang]}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-stone-500 dark:text-[#9BAABD] uppercase">{t.debates}</div>
            <div className="text-xs font-bold text-stone-900 dark:text-white font-mono mt-0.5">
              {constituency.debates ?? NOT_AVAILABLE_TEXT[lang]}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-stone-500 dark:text-[#9BAABD] uppercase">{t.questions}</div>
            <div className="text-xs font-bold text-stone-900 dark:text-white font-mono mt-0.5">
              {constituency.questions ?? NOT_AVAILABLE_TEXT[lang]}
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link href={`/mp/${constituency.slug}`}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md transition-colors font-medium cursor-pointer"
        >
          <span>{t.openFullReportCard}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
