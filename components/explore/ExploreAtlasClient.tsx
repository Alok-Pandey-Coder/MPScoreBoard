'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { IndiaAtlasMap } from '@/components/map/IndiaAtlasMap';
import { UnifiedSearchBar } from '@/components/home/UnifiedSearchBar';
import { INDIA_STATES } from '@/lib/indiaGeoData';
import { useLang, useMessages } from '@/context/LanguageContext';
import { exploreMessages } from '@/lib/messages/explore';
import { localizeMP, localizeState } from '@/lib/i18n';

interface ExploreAtlasClientProps {
  mps: MPRecord[];
}

export const ExploreAtlasClient: React.FC<ExploreAtlasClientProps> = ({ mps }) => {
  const [selectedStateId, setSelectedStateId] = useState<string>('delhi');
  const t = useMessages(exploreMessages);
  const { lang } = useLang();
  const localizedMps = useMemo(() => mps.map((mp) => localizeMP(mp, lang)), [mps, lang]);
  const [selectedSlug, setSelectedSlug] = useState<string | undefined>(undefined);

  const handleSelectFeature = (stateId: string, constituencySlug?: string) => {
    setSelectedStateId(stateId);
    if (constituencySlug) {
      setSelectedSlug(constituencySlug);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#232c37]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/"
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.backHome}</span>
            </Link>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold">{t.eyebrow}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            {t.title}
          </h1>
        </div>

        {/* Search Bar in Explorer */}
        <div className="w-full sm:w-96">
          <UnifiedSearchBar
            mps={localizedMps}
            onSelectGeographicalFeature={handleSelectFeature}
          />
        </div>
      </div>

      {/* State Quick Switcher Pills */}
      <div
        role="group"
        aria-label={t.quickJumpAria}
        className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar"
      >
        <span className="text-slate-400 font-bold uppercase text-[10px] shrink-0 mr-1">
          {t.quickJump}
        </span>
        {INDIA_STATES.slice(0, 10).map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => handleSelectFeature(s.id)}
            aria-pressed={selectedStateId === s.id}
            aria-label={t.stateSeatsAria(localizeState(s.name, lang), s.seats)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              selectedStateId === s.id
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                : 'bg-white dark:bg-[#161c24] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#27323f] hover:border-cyan-500/50'
            }`}
          >
            {localizeState(s.name, lang)} ({s.seats})
          </button>
        ))}
      </div>

      {/* The Master Atlas Map Component */}
      <IndiaAtlasMap
        mps={localizedMps}
        initialStateId={selectedStateId}
        initialConstituencySlug={selectedSlug}
        className="w-full h-[680px]"
      />
    </div>
  );
};

