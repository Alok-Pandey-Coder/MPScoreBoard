'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Building, ChevronRight, Award } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { INDIA_STATES, DELHI_CONSTITUENCIES } from '@/lib/indiaGeoData';
import { IndiaAtlasMap } from '@/components/map/IndiaAtlasMap';

interface StateExplorationClientProps {
  mps: MPRecord[];
  stateParam: string;
}

export const StateExplorationClient: React.FC<StateExplorationClientProps> = ({
  mps,
  stateParam,
}) => {
  const stateId = stateParam?.toLowerCase() || 'delhi';

  const state =
    INDIA_STATES.find(
      (s) => s.id === stateId || s.name.toLowerCase().includes(stateId)
    ) || INDIA_STATES[0];

  const isDelhi = state.id === 'delhi';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#232c37]">
        <div>
          <Link
            href="/"
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All-India Atlas</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
              {state.name}
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#161d26] border border-slate-200 dark:border-[#273342] text-cyan-600 dark:text-cyan-400 font-bold">
              {state.seats} Lok Sabha Seats
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Capital: {state.capital} • State representation in the 18th Lok Sabha
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Map Focusing on State */}
        <div className="lg:col-span-7">
          <IndiaAtlasMap
            mps={mps}
            initialStateId={state.id}
            className="w-full h-[560px]"
          />
        </div>

        {/* Right: Constituencies List & Details */}
        <div className="lg:col-span-5 bg-white dark:bg-[#161c24] border border-slate-200 dark:border-[#27323f] rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-cyan-500" />
            <span>Constituencies in {state.name}</span>
          </h2>

          {isDelhi ? (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {DELHI_CONSTITUENCIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/mp/${c.slug}`}
                  className="block p-4 rounded-2xl bg-slate-50 dark:bg-[#1a222d] hover:bg-slate-100 dark:hover:bg-[#1f2937] border border-slate-200 dark:border-[#27323f] hover:border-cyan-500/60 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white font-['Outfit'] group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          {c.name}
                        </span>
                        {c.reservation && c.reservation !== 'GEN' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {c.reservation}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{c.sittingMP}</span>
                        <span>•</span>
                        <span className="text-cyan-600 dark:text-cyan-400 font-bold">{c.party}</span>
                        {c.isMinister && (
                          <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-0.5">
                            <Award className="w-3 h-3" />
                            Minister
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-[#1a222d] border border-slate-200 dark:border-[#27323f] rounded-2xl p-5 text-xs text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
              <p>
                <strong>{state.name}</strong> is represented by{' '}
                <strong>{state.seats} elected Members of Parliament</strong> in the lower house.
              </p>
              <p>
                Report cards for {state.name} are not available yet. States are being added one at a time; this page
                will list each MP&apos;s report card once its data has been collected and checked.
              </p>
              <div className="pt-2">
                <Link
                  href="/explore"
                  className="text-cyan-600 dark:text-cyan-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Explore on national map</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

