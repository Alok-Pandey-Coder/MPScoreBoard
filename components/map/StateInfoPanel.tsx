'use client';

import React from 'react';
import { X, MapPin, ChevronRight, BarChart2 } from 'lucide-react';
import { StateGeoData, DELHI_CONSTITUENCIES } from '@/lib/indiaGeoData';
import { MPRecord } from '@/types/mp';
import Link from 'next/link';
import { useLang, useMessages } from '@/context/LanguageContext';
import { mapMessages } from '@/lib/messages/map';
import { localizeParty, localizeState } from '@/lib/i18n';
import { NOT_AVAILABLE_TEXT } from '@/lib/formatters';

export interface StateInfoPanelProps {
  state: StateGeoData;
  mps: MPRecord[];
  selectedConstituencySlug: string | null;
  onSelectConstituency: (slug: string) => void;
  onClose: () => void;
}

export const StateInfoPanel: React.FC<StateInfoPanelProps> = ({
  state,
  mps,
  selectedConstituencySlug,
  onSelectConstituency,
  onClose,
}) => {
  const t = useMessages(mapMessages);
  const { lang } = useLang();

  // Available mapped constituencies for this state
  const isDelhi = state.id === 'delhi';
  const constituencies = isDelhi ? DELHI_CONSTITUENCIES : [];
  const localizedStateName = localizeState(state.name, lang);

  return (
    <div className="h-full max-h-[520px] flex flex-col rounded-xl bg-white/95 dark:bg-[#171D24]/95 border border-stone-200 dark:border-[#303A45] shadow-2xl backdrop-blur-md overflow-hidden text-stone-800 dark:text-[#F3F4F6] transition-colors duration-200">
      {/* Header */}
      <div className="p-4 border-b border-stone-200 dark:border-[#303A45] flex items-start justify-between bg-stone-50/90 dark:bg-[#14191F]/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800">
              {state.code}
            </span>
            <span className="text-xs uppercase tracking-wider text-stone-500 dark:text-[#9BAABD]">
              {state.type === 'ut' ? t.typeUnionTerritory : t.typeState}
            </span>
          </div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-white mt-1 font-['Outfit',sans-serif]">
            {localizedStateName}
          </h3>
          <p className="text-xs text-stone-600 dark:text-[#9BAABD] flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-cyan-600 dark:text-[#55BCE8]" />
            {t.capital(state.capital)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-stone-400 dark:text-[#9BAABD] hover:text-stone-700 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-[#1D242D] transition-colors cursor-pointer"
          aria-label={t.closeStatePanel}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-2 p-3 bg-stone-50/60 dark:bg-[#1D242D]/50 border-b border-stone-200 dark:border-[#303A45]">
        <div className="bg-white dark:bg-[#14191F]/70 p-2.5 rounded-lg border border-stone-200 dark:border-[#303A45]">
          <span className="text-[10px] text-stone-500 dark:text-[#9BAABD] uppercase tracking-wider block">
            {t.lsSeats}
          </span>
          <span className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">
            {state.seats}
          </span>
        </div>
        <div className="bg-white dark:bg-[#14191F]/70 p-2.5 rounded-lg border border-stone-200 dark:border-[#303A45]">
          <span className="text-[10px] text-stone-500 dark:text-[#9BAABD] uppercase tracking-wider block">
            {t.activeData}
          </span>
          <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400 font-mono">
            {state.coveredRecords} / {state.seats}
          </span>
        </div>
      </div>

      {/* State Average Performance */}
      {state.avgAttendance !== undefined && (
        <div className="p-3 bg-stone-50/40 dark:bg-[#14191F]/40 border-b border-stone-200 dark:border-[#303A45] text-xs">
          <div className="flex items-center gap-1.5 text-stone-600 dark:text-[#9BAABD] mb-2 font-medium">
            <BarChart2 className="w-3.5 h-3.5 text-cyan-600 dark:text-[#55BCE8]" />
            <span>{t.stateBaseline}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="text-[10px] text-stone-500 dark:text-[#9BAABD]">{t.avgAttendance}</div>
              <div className="font-semibold text-stone-900 dark:text-white font-mono">
                {state.avgAttendance}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-stone-500 dark:text-[#9BAABD]">{t.avgDebates}</div>
              <div className="font-semibold text-stone-900 dark:text-white font-mono">
                {state.avgDebates ?? NOT_AVAILABLE_TEXT[lang]}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-stone-500 dark:text-[#9BAABD]">{t.avgQuestions}</div>
              <div className="font-semibold text-stone-900 dark:text-white font-mono">
                {state.avgQuestions ?? NOT_AVAILABLE_TEXT[lang]}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Constituency List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        <div className="text-xs font-semibold text-stone-600 dark:text-[#9BAABD] px-1 flex items-center justify-between">
          <span>{t.constituenciesCount(constituencies.length > 0 ? constituencies.length : state.seats)}</span>
          {isDelhi && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{t.boundaryData}</span>
          )}
        </div>

        {constituencies.length > 0 ? (
          constituencies.map((c) => {
            const isSelected = selectedConstituencySlug === c.slug;
            return (
              <div
                key={c.slug}
                onClick={() => onSelectConstituency(c.slug)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-50 dark:bg-[#1D242D] border-amber-500 shadow-xs'
                    : 'bg-white dark:bg-[#14191F]/60 border-stone-200 dark:border-[#303A45] hover:border-stone-400 dark:hover:border-slate-500 hover:bg-stone-50 dark:hover:bg-[#1D242D]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-stone-900 dark:text-white">
                    {c.name}
                  </span>
                  {c.party && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-medium">
                      {localizeParty(c.party, lang)}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-stone-500 dark:text-[#9BAABD] mt-0.5 flex items-center justify-between">
                  <span>{t.mpLabel(c.sittingMP || NOT_AVAILABLE_TEXT[lang])}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400 dark:text-[#9BAABD]" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-xs text-stone-600 dark:text-[#9BAABD] bg-stone-50 dark:bg-[#14191F]/40 rounded-lg border border-stone-200 dark:border-[#303A45]/60 mt-2">
            <p className="font-medium text-stone-800 dark:text-slate-300">{t.phase2Title}</p>
            <p className="text-[11px] mt-1 text-stone-500 dark:text-slate-400">
              {t.phase2Body(localizedStateName)}
            </p>
            <Link href={`/state/${state.id}`}
              className="mt-3 inline-flex items-center gap-1 text-xs text-cyan-600 dark:text-[#55BCE8] hover:underline"
            >
              {t.exploreStatePortal(localizedStateName)}
            </Link>
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="p-3 border-t border-stone-200 dark:border-[#303A45] bg-stone-50/90 dark:bg-[#14191F]/90">
        <Link href={`/state/${state.id}`}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-md transition-all cursor-pointer"
        >
          <span>{t.exploreAllSeats(state.seats, localizedStateName)}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
