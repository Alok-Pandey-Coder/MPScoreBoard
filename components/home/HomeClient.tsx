'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { MPRecord } from '@/types/mp';
import { StateMapExplorer } from '@/components/map/StateMapExplorer';
import { REAL_INDIA_STATES } from '@/lib/realIndiaMapData';
import { NagrikTerritoryBar } from '@/components/home/NagrikTerritoryBar';
import { IndiaAtlasMap } from '@/components/map/IndiaAtlasMap';
import { UnifiedSearchBar } from '@/components/home/UnifiedSearchBar';
import { StateConstituencyPicker } from '@/components/home/StateConstituencyPicker';
import { ArrowRight, Compass, Landmark } from 'lucide-react';
import { localizeMP } from '@/lib/i18n';
import { coverageNote, getCoverage, TOTAL_LOK_SABHA_SEATS } from '@/lib/coverage';
import { useLang, useMessages } from '@/context/LanguageContext';
import { homeMessages } from '@/lib/messages/home';

type SansadViewKey = 'facade' | 'chamber' | 'panoramic';

interface SansadViewItem {
  src: string;
  labelEn: string;
  labelHi: string;
  tagEn: string;
  tagHi: string;
  shortEn: string;
  shortHi: string;
}

const SANSAD_VIEWS: Record<SansadViewKey, SansadViewItem> = {
  facade: {
    src: '/images/sansad/sansad-facade.jpg',
    labelEn: 'Samvidhan Sadan Colonnade',
    labelHi: 'संविधान सदन (ऐतिहासिक संसद भवन)',
    tagEn: 'Historic Parliament House, New Delhi',
    tagHi: 'ऐतिहासिक संसद भवन, नई दिल्ली',
    shortEn: 'Colonnade',
    shortHi: 'संविधान सदन',
  },
  chamber: {
    src: '/images/sansad/sansad-chamber.jpg',
    labelEn: 'Lok Sabha Chamber',
    labelHi: '18वीं लोकसभा कक्ष',
    tagEn: 'New Parliament Building (18th Lok Sabha)',
    tagHi: 'नवीन संसद भवन (18वीं लोकसभा)',
    shortEn: 'Lok Sabha',
    shortHi: 'लोकसभा',
  },
  panoramic: {
    src: '/images/sansad/sansad-panoramic.jpg',
    labelEn: 'Central Vista Sansad Complex',
    labelHi: 'सेंट्रल विस्टा संसद परिसर',
    tagEn: 'Architectural Panorama, Central Vista, New Delhi',
    tagHi: 'वास्तुशिल्प परिदृश्य, सेंट्रल विस्टा, नई दिल्ली',
    shortEn: 'Panorama',
    shortHi: 'संसद परिसर',
  },
};

const SLIDE_KEYS: SansadViewKey[] = ['facade', 'chamber', 'panoramic'];

interface HomeClientProps {
  mps: MPRecord[];
}

export const HomeClient: React.FC<HomeClientProps> = ({ mps }) => {
  const [selectedMapSlug, setSelectedMapSlug] = useState<string | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const coverage = getCoverage(mps);
  const t = useMessages(homeMessages);
  const { lang } = useLang();
  const localizedMps = useMemo(() => mps.map((mp) => localizeMP(mp, lang)), [mps, lang]);

  // Arriving from another page's atlas (/?state=<id>): open that state's map.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('state');
    if (!id || !REAL_INDIA_STATES.some((s) => s.id === id)) return;
    const frame = requestAnimationFrame(() => {
      setSelectedStateId(id);
      document.getElementById('find-constituency')?.scrollIntoView();
      // The param has been consumed. Drop it from this history entry so Back, refresh or a
      // later "All states" click does not reopen this state; the hash is kept.
      const url = new URL(window.location.href);
      url.searchParams.delete('state');
      window.history.replaceState(window.history.state, '', url);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Auto-advance sliding images every 2.8 seconds (2-3s interval)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setSlideIndex((prev) => prev + 1);
    }, 2800);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Infinite forward loop: when reaching the clone slide at index 3, seamlessly reset to index 0
  useEffect(() => {
    if (slideIndex === SLIDE_KEYS.length) {
      const resetTimeout = setTimeout(() => {
        setIsTransitioning(false);
        setSlideIndex(0);
      }, 700); // Wait for the 700ms slide transition to finish
      return () => clearTimeout(resetTimeout);
    }
  }, [slideIndex]);

  const activeIndex = slideIndex % SLIDE_KEYS.length;
  const currentKey = SLIDE_KEYS[activeIndex];
  const currentView = SANSAD_VIEWS[currentKey];

  const handleSelectGeographicalFeature = (stateId: string, constituencySlug?: string) => {
    setSelectedStateId(stateId);
    setSelectedMapSlug(constituencySlug ?? null);
    scrollToStateMap();
  };

  const scrollToStateMap = () => {
    const mapEl = document.getElementById('find-constituency');
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* 1. Authoritative Editorial Hero Masthead with Sansad Architectural Sliding Backdrop */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative overflow-hidden rounded-3xl border border-stone-200 dark:border-[#1E2636] bg-stone-100 dark:bg-[#0A0E17] shadow-xl dark:shadow-2xl transition-all duration-700 max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16 lg:py-20"
      >
        {/* Automatic Sliding Carousel Backdrop */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div
            className="flex w-full h-full"
            style={{
              transform: `translateX(-${slideIndex * 100}%)`,
              transition: isTransitioning ? 'transform 700ms cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
            }}
          >
            {[...SLIDE_KEYS, SLIDE_KEYS[0]].map((key, idx) => {
              const view = SANSAD_VIEWS[key];
              return (
                <div key={`${key}-${idx}`} className="w-full h-full shrink-0 relative">
                  <img
                    src={view.src}
                    alt={lang === 'hi' ? view.labelHi : view.labelEn}
                    className="w-full h-full object-cover object-center opacity-85 sm:opacity-90 dark:opacity-80 contrast-105 brightness-[0.98] dark:brightness-[0.90]"
                  />
                </div>
              );
            })}
          </div>

          {/* Smooth Ambient Scrim to ensure crisp contrast across light & dark themes without any blur blocks */}
          <div className="absolute inset-0 bg-stone-100/50 dark:bg-[#0A0E17]/65 transition-colors" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-100 via-transparent to-stone-100/60 dark:from-[#0A0E17] dark:via-transparent dark:to-[#0A0E17]/80" />
        </div>

        {/* Central Editorial Content */}
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
              mps={localizedMps}
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
              href="#by-state"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-[#131B27]/90 hover:bg-white dark:hover:bg-[#1A2433] text-stone-800 dark:text-stone-200 font-semibold rounded-lg border border-stone-200 dark:border-[#222E42] transition-all cursor-pointer shadow-xs"
            >
              <Compass className="w-3.5 h-3.5 text-stone-400" aria-hidden="true" />
              <span>{t.ctaStates}</span>
            </a>
          </div>

          {/* Architectural Attribution Sub-footer updating with active slide */}
          <div className="pt-2 text-[10px] font-mono text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1.5 opacity-90 transition-opacity duration-300">
            <Landmark className="w-3 h-3 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span className="font-semibold text-stone-700 dark:text-stone-300">
              {lang === 'hi' ? currentView.labelHi : currentView.labelEn}
            </span>
            <span className="text-stone-500 dark:text-stone-400 hidden sm:inline">
              · {lang === 'hi' ? currentView.tagHi : currentView.tagEn}
            </span>
            <span className="text-stone-400 dark:text-stone-600 ml-1">
              ({activeIndex + 1}/{SLIDE_KEYS.length})
            </span>
          </div>
        </div>
      </section>

      {/* 2. Interactive Constituency Map Section */}
      <section id="find-constituency" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">
        {/* Territory Status & Live Metrics Strip */}
        <NagrikTerritoryBar mps={localizedMps} />

        <div id="by-state" className="scroll-mt-20" />
        {/* State-by-state map picker: no map until a state or UT is chosen */}
        <StateMapExplorer
          mps={localizedMps}
          selectedStateId={selectedStateId}
          onSelectState={(id) => {
            setSelectedStateId(id);
            setSelectedMapSlug(null);
          }}
          selectedSlug={selectedMapSlug}
          onSelectConstituency={(slug) => setSelectedMapSlug(slug || null)}
        />
      </section>

      {/* 4. Map of India */}
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

        <IndiaAtlasMap
          mps={localizedMps}
          className="w-full"
          onOpenStateMap={(stateId) => {
            setSelectedStateId(stateId);
            setSelectedMapSlug(null);
            scrollToStateMap();
          }}
        />
      </section>

      {/* 5. Step-by-Step Dropdown Selector */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-3">
          <span className="text-[11px] font-mono uppercase tracking-widest font-semibold text-stone-500 dark:text-stone-400">
            {t.pickerLead}
          </span>
        </div>
        <StateConstituencyPicker mps={localizedMps} />
      </section>
    </div>
  );
};
