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
import { Compass, ArrowRight } from 'lucide-react';

// Dynamic import with SSR false for MapLibre container
const NagrikStyleMap = dynamic(
  () => import('@/components/map/NagrikStyleMap').then((mod) => mod.NagrikStyleMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[620px] rounded-3xl bg-[#171D24] border border-[#303A45] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <span className="text-xs font-semibold">Loading Geospatial Atlas...</span>
        </div>
      </div>
    ),
  }
);

interface HomeClientProps {
  mps: MPRecord[];
}

export const HomeClient: React.FC<HomeClientProps> = ({ mps }) => {
  const [selectedMapSlug, setSelectedMapSlug] = useState<string>('new-delhi-delhi');

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
    <div className="space-y-16 py-8 sm:py-12">
      {/* 1. Hero Section matching Nagrik Image 5 editorial style */}
      <section className="relative text-center max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#171e27] border border-[#2b3746] text-xs font-semibold mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-cyan-400 font-['Outfit'] tracking-wide">
            18th Lok Sabha Parliamentary Intelligence Platform
          </span>
        </div>

        {/* Editorial Title (Direct inspiration from Nagrik "Your city shouldn't run on autopilot") */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight font-['Outfit'] leading-[1.12] mb-5">
          Your Parliament shouldn&apos;t run on{' '}
          <span className="text-cyan-500 dark:text-cyan-400 underline decoration-cyan-500/40 underline-offset-8">
            autopilot.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
          Know who represents you. Track parliamentary activity, attendance, floor questions and local development funds through transparent public data.
        </p>

        {/* Global Smart Search Bar */}
        <div className="mb-6">
          <UnifiedSearchBar
            mps={mps}
            onSelectGeographicalFeature={handleSelectGeographicalFeature}
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          <a
            href="#find-constituency"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-md cursor-pointer"
          >
            <span>Explore Delhi Map</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#national-states"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#171e27] hover:bg-[#1d2733] text-white font-semibold rounded-xl border border-[#2b3746] transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>All States Directory</span>
          </a>
        </div>
      </section>

      {/* 2. Interactive Constituency Map Section (Matching Nagrik Image 3 & 4) */}
      <section id="find-constituency" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">
        {/* Territory Status & Live Metrics Strip */}
        <NagrikTerritoryBar />

        {/* The Master MapLibre Interactive Map */}
        <NagrikStyleMap
          mps={mps}
          selectedSlug={selectedMapSlug}
          onSelectConstituency={(slug) => setSelectedMapSlug(slug)}
        />
      </section>

      {/* 3. State Overview Cards Grid (Matching Nagrik Image 5) */}
      <section id="national-states" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-[#232c37]">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-600 dark:text-cyan-400 mb-0.5">
              Territorial Representation
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
              Explore Lok Sabha by State
            </h2>
          </div>
          <Link
            href="/explore"
            className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open All-India Vector Atlas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* The Nagrik-style State Landmark Cards */}
        <NagrikStateCardsGrid />
      </section>

      {/* 4. All-India Vector Map Explorer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#232c37]">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-amber-500 dark:text-amber-400 mb-0.5">
              Geospatial Vector Overview
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
              Republic of India — 36 States &amp; 543 Seats
            </h2>
          </div>
        </div>

        <IndiaAtlasMap mps={mps} className="w-full" />
      </section>

      {/* 5. Active Delhi Lok Sabha Members Grid */}
      <section id="delhi-mps" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-[#232c37]">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
              Delhi Sitting Members of Parliament
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              18th Lok Sabha (2024–Present) • 7 Constituencies Verified
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 dark:bg-[#161d26] text-cyan-600 dark:text-cyan-400 rounded-full border border-slate-200 dark:border-[#273342] self-start sm:self-auto">
            100% Sourced Records
          </span>
        </div>

        <QuickCardsGrid mps={mps} />
      </section>

      {/* 6. Step-by-Step Dropdown Selector */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-4">
          <span className="text-xs uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500">
            or pick your constituency directly
          </span>
        </div>
        <StateConstituencyPicker mps={mps} />
      </section>
    </div>
  );
};

