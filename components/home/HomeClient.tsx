'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MPRecord } from '@/types/mp';
import { NagrikTerritoryBar } from '@/components/home/NagrikTerritoryBar';
import { NagrikStateCardsGrid } from '@/components/home/NagrikStateCardsGrid';
import { IndiaAtlasMap } from '@/components/map/IndiaAtlasMap';
import { QuickCardsGrid } from '@/components/home/QuickCardsGrid';
import { UnifiedSearchBar } from '@/components/home/UnifiedSearchBar';
import { StateConstituencyPicker } from '@/components/home/StateConstituencyPicker';
import { ArrowRight, Users, Compass, Landmark } from 'lucide-react';
import { coverageNote, getCoverage, TOTAL_LOK_SABHA_SEATS } from '@/lib/coverage';
import { useLang, useMessages } from '@/context/LanguageContext';
import { homeMessages } from '@/lib/messages/home';

type SansadViewKey = 'facade' | 'chamber' | 'panoramic';

const SANSAD_VIEWS: Record<SansadViewKey, { src: string; label: string; tag: string }> = {
  facade: {
    src: '/images/sansad/sansad-facade.jpg',
    label: 'Samvidhan Sadan Colonnade',
    tag: 'Historic Parliament House, New Delhi',
  },
  chamber: {
    src: '/images/sansad/sansad-chamber.jpg',
    label: 'Lok Sabha Chamber',
    tag: 'New Parliament Building (18th Lok Sabha)',
  },
  panoramic: {
    src: '/images/sansad/sansad-panoramic.jpg',
    label: 'Central Vista Vista',
    tag: 'Sovereign Parliamentary Complex',
  },
};

const MapLoading: React.FC = () => {
  const t = useMessages(homeMessages);
  return (
    <div className="w-full h-[600px] rounded-2xl bg-[#0C1017] border border-[#1E2636] flex items-center justify-center text-stone-400">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        <span className="text-xs font-mono font-medium text-stone-400">{t.loadingMap}</span>
      </div>
    </div>
  );
};

const NagrikStyleMap = dynamic(
  () => import('@/components/map/NagrikStyleMap').then((mod) => mod.NagrikStyleMap),
  {
    ssr: false,
    loading: () => <MapLoading />,
  }
);

interface HomeClientProps {
  mps: MPRecord[];
}

export const HomeClient: React.FC<HomeClientProps> = ({ mps }) => {
  const [selectedMapSlug, setSelectedMapSlug] = useState<string>('new-delhi-delhi');
  const [activeSansadView, setActiveSansadView] = useState<SansadViewKey>('facade');
  const coverage = getCoverage(mps);
  const t = useMessages(homeMessages);
  const { lang } = useLang();

  const handleSelectGeographicalFeature = (stateId: string, constituencySlug?: string) => {
    if (constituencySlug) {
      setSelectedMapSlug(constituencySlug);
    }
    const mapEl = document.getElementById('find-constituency');
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* 1. Authoritative Editorial Hero Masthead with Sansad Architectural Backdrop */}
      <section className="relative overflow-hidden rounded-3xl border border-stone-200 dark:border-[#1E2636] bg-stone-100 dark:bg-[#0A0E17] shadow-xl dark:shadow-2xl transition-all duration-700 max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16 lg:py-20">
        {/* Layer 0: High-Resolution Sansad Architectural Photography (Full Color, Vivid, Completely Visible) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <img
            key={activeSansadView}
            src={SANSAD_VIEWS[activeSansadView].src}
            alt={SANSAD_VIEWS[activeSansadView].label}
            className="w-full h-full object-cover object-center transition-all duration-700 ease-out opacity-80 sm:opacity-85 dark:opacity-75 contrast-105 brightness-[0.98] dark:brightness-[0.88]"
          />

          {/* Smooth Ambient Scrim to ensure crisp contrast across light & dark themes without any blur blocks */}
          <div className="absolute inset-0 bg-stone-100/50 dark:bg-[#0A0E17]/65 transition-colors" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-100 via-transparent to-stone-100/60 dark:from-[#0A0E17] dark:via-transparent dark:to-[#0A0E17]/80" />
        </div>

        {/* Perspective Switcher Controls */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1 rounded-full bg-stone-900/85 dark:bg-[#0E1420]/90 backdrop-blur-md border border-stone-700/60 dark:border-[#222E42] text-[10px] font-mono text-stone-200 shadow-lg">
          <div className="flex items-center gap-1 pl-2.5 pr-1 text-amber-400 font-semibold">
            <Landmark className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
            <span className="hidden sm:inline">Sansad:</span>
          </div>
          {(Object.keys(SANSAD_VIEWS) as SansadViewKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setActiveSansadView(k)}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer font-medium ${
                activeSansadView === k
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
              title={SANSAD_VIEWS[k].label}
            >
              {k === 'facade' ? 'Colonnade' : k === 'chamber' ? 'Lok Sabha' : 'Panorama'}
            </button>
          ))}
        </div>

        {/* Layer 1: Fully Transparent Central Editorial Content (Zero Blur, Zero Blockers) */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Editorial Eyebrow Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-stone-100/90 dark:bg-[#131B27]/90 backdrop-blur-xs border border-stone-300 dark:border-[#222E42] text-xs font-mono text-stone-800 dark:text-stone-200 mb-6 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="tracking-wide">
              {t.heroEyebrow}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-stone-900 dark:text-stone-100 tracking-tight font-sans leading-[1.12] mb-5">
            {t.heroTitleLead}{' '}
            <span className="text-amber-600 dark:text-amber-400 underline decoration-amber-500/40 underline-offset-8">
              {t.heroTitleAccent}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 max-w-2xl mx-auto mb-3 leading-relaxed font-normal">
            {t.heroIntro}
          </p>
          <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mb-8">{coverageNote(coverage, lang)}</p>

          {/* Smart Search Bar with Fast Select Chips */}
          <div className="mb-8 max-w-2xl mx-auto">
            <UnifiedSearchBar
              mps={mps}
              onSelectGeographicalFeature={handleSelectGeographicalFeature}
            />
          </div>

          {/* Quick Nav Anchors */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono mb-6">
            <a
              href="#find-constituency"
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-950 font-bold rounded-lg transition-all shadow-sm cursor-pointer"
            >
              <span>{t.ctaMap}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
            <a
              href="#mp-cards"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-[#131B27]/90 hover:bg-white dark:hover:bg-[#1A2433] text-stone-800 dark:text-stone-200 font-semibold rounded-lg border border-stone-200 dark:border-[#222E42] transition-all cursor-pointer shadow-xs"
            >
              <Users className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
              <span>{t.ctaCards}</span>
            </a>
            <a
              href="#by-state"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-[#131B27]/90 hover:bg-white dark:hover:bg-[#1A2433] text-stone-800 dark:text-stone-200 font-semibold rounded-lg border border-stone-200 dark:border-[#222E42] transition-all cursor-pointer shadow-xs"
            >
              <Compass className="w-3.5 h-3.5 text-stone-400" aria-hidden="true" />
              <span>{t.ctaStates}</span>
            </a>
          </div>

          {/* Architectural Attribution Sub-footer */}
          <div className="pt-2 text-[10px] font-mono text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1.5 opacity-90">
            <Landmark className="w-3 h-3 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span className="font-semibold text-stone-700 dark:text-stone-300">{SANSAD_VIEWS[activeSansadView].label}</span>
            <span className="text-stone-500 dark:text-stone-400 hidden sm:inline">· {SANSAD_VIEWS[activeSansadView].tag}</span>
          </div>
        </div>
      </section>

      {/* 2. Interactive Constituency Map Section */}
      <section id="find-constituency" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">
        {/* Territory Status & Live Metrics Strip */}
        <NagrikTerritoryBar mps={mps} />

        {/* The Master Leaflet Dark GIS Map with 290 Wards */}
        <NagrikStyleMap
          mps={mps}
          selectedSlug={selectedMapSlug}
          onSelectConstituency={(slug) => setSelectedMapSlug(slug)}
        />
      </section>

      {/* 3. MP report cards */}
      <section id="mp-cards" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200 dark:border-[#1E2636]">
          <div>
            <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-600 dark:text-amber-400 mb-0.5">
              {t.termEyebrow}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-sans tracking-tight">
              {t.cardsTitle}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {t.cardsIntro}
            </p>
          </div>
          <span className="text-xs font-mono font-medium px-3 py-1 bg-stone-100 dark:bg-[#131B27] text-stone-700 dark:text-stone-300 rounded-md border border-stone-200 dark:border-[#222E42] self-start sm:self-auto">
            {t.cardsBadge}
          </span>
        </div>

        <QuickCardsGrid mps={mps} />
      </section>

      {/* 4. State Overview Cards Grid */}
      <section id="by-state" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200 dark:border-[#1E2636]">
          <div>
            <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-600 dark:text-amber-400 mb-0.5">
              {t.statesEyebrow}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-sans tracking-tight">
              {t.statesTitle}
            </h2>
          </div>
          <Link
            href="/explore"
            className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>{t.openMap}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <NagrikStateCardsGrid mps={mps} />
      </section>

      {/* 5. Map of India */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-[#1E2636]">
          <div>
            <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-stone-500 dark:text-stone-400 mb-0.5">
              {t.indiaEyebrow}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 font-sans tracking-tight">
              {t.indiaTitle(TOTAL_LOK_SABHA_SEATS)}
            </h3>
          </div>
        </div>

        <IndiaAtlasMap mps={mps} className="w-full" />
      </section>

      {/* 6. Step-by-Step Dropdown Selector */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-3">
          <span className="text-[11px] font-mono uppercase tracking-widest font-semibold text-stone-500 dark:text-stone-400">
            {t.pickerLead}
          </span>
        </div>
        <StateConstituencyPicker mps={mps} />
      </section>
    </div>
  );
};
