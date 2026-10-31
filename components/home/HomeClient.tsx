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
import { ArrowRight, MapPin, Users, Compass, ShieldCheck } from 'lucide-react';

const NagrikStyleMap = dynamic(
  () => import('@/components/map/NagrikStyleMap').then((mod) => mod.NagrikStyleMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] rounded-2xl bg-[#0C1017] border border-[#1E2636] flex items-center justify-center text-stone-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          <span className="text-xs font-mono font-medium text-stone-400">Loading Geospatial Block Atlas...</span>
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
    <div className="space-y-16 py-6 sm:py-10">
      {/* 1. Authoritative Editorial Hero Masthead */}
      <section className="relative text-center max-w-4xl mx-auto px-4 sm:px-6 pt-2 pb-4">
        {/* Editorial Eyebrow Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-stone-100 dark:bg-[#131B27] border border-stone-200 dark:border-[#222E42] text-xs font-mono text-stone-700 dark:text-stone-300 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="tracking-wide">
            18TH LOK SABHA · PUBLIC RECORD LEDGER · DELHI
          </span>
        </div>

        {/* Headline: Serious, Grounded, Human Editorial Typography */}
        <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-stone-900 dark:text-stone-100 tracking-tight font-sans leading-[1.12] mb-5">
          Every Question. Every Rupee.{' '}
          <span className="text-amber-600 dark:text-amber-400 underline decoration-amber-500/30 underline-offset-8">
            Accounted For.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
          An open, non-partisan scrutiny of Delhi&apos;s 7 Members of Parliament — tracking parliamentary attendance, floor questions, legislative participation, and ₹35 Cr in local development funds. Sourced directly from official Parliament and election records.
        </p>

        {/* Smart Search Bar with Fast Select Chips */}
        <div className="mb-8">
          <UnifiedSearchBar
            mps={mps}
            onSelectGeographicalFeature={handleSelectGeographicalFeature}
          />
        </div>

        {/* Quick Nav Anchors */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
          <a
            href="#find-constituency"
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-950 font-bold rounded-lg transition-all shadow-sm cursor-pointer"
          >
            <span>Explore Ward Block Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <a
            href="#delhi-mps"
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-[#131B27] hover:bg-stone-200 dark:hover:bg-[#1A2433] text-stone-800 dark:text-stone-200 font-semibold rounded-lg border border-stone-200 dark:border-[#222E42] transition-all cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-amber-500" />
            <span>Review 7 MP Dossiers</span>
          </a>
          <a
            href="#national-states"
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-[#131B27] hover:bg-stone-200 dark:hover:bg-[#1A2433] text-stone-800 dark:text-stone-200 font-semibold rounded-lg border border-stone-200 dark:border-[#222E42] transition-all cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-stone-400" />
            <span>All-India Directory</span>
          </a>
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

      {/* 3. Active Delhi Lok Sabha Members Dossier Grid */}
      <section id="delhi-mps" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200 dark:border-[#1E2636]">
          <div>
            <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-600 dark:text-amber-400 mb-0.5">
              18TH LOK SABHA
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-sans tracking-tight">
              Delhi Sitting Members of Parliament
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Each card lists its sources, retrieval dates and review status.
            </p>
          </div>
          <span className="text-xs font-mono font-medium px-3 py-1 bg-stone-100 dark:bg-[#131B27] text-stone-700 dark:text-stone-300 rounded-md border border-stone-200 dark:border-[#222E42] self-start sm:self-auto">
            Sources linked on every card
          </span>
        </div>

        <QuickCardsGrid mps={mps} />
      </section>

      {/* 4. State Overview Cards Grid */}
      <section id="national-states" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200 dark:border-[#1E2636]">
          <div>
            <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-600 dark:text-amber-400 mb-0.5">
              TERRITORIAL COVERAGE
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-sans tracking-tight">
              Explore Lok Sabha by State &amp; UT
            </h2>
          </div>
          <Link
            href="/explore"
            className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Open All-India Vector Atlas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <NagrikStateCardsGrid />
      </section>

      {/* 5. All-India Vector Map Explorer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-[#1E2636]">
          <div>
            <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-stone-500 dark:text-stone-400 mb-0.5">
              PAN-INDIA GEOSPATIAL VECTOR
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 font-sans tracking-tight">
              Republic of India — 36 States &amp; 543 Parliamentary Seats
            </h3>
          </div>
        </div>

        <IndiaAtlasMap mps={mps} className="w-full" />
      </section>

      {/* 6. Step-by-Step Dropdown Selector */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-3">
          <span className="text-[11px] font-mono uppercase tracking-widest font-semibold text-stone-500 dark:text-stone-400">
            or pick state and constituency directly
          </span>
        </div>
        <StateConstituencyPicker mps={mps} />
      </section>
    </div>
  );
};
