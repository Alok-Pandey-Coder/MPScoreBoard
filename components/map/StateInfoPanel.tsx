'use client';

import React from 'react';
import { X, MapPin, ChevronRight, BarChart2 } from 'lucide-react';
import { StateGeoData, DELHI_CONSTITUENCIES } from '@/lib/indiaGeoData';
import { MPRecord } from '@/types/mp';
import Link from 'next/link';

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

  // Available mapped constituencies for this state
  const isDelhi = state.id === 'delhi';
  const constituencies = isDelhi ? DELHI_CONSTITUENCIES : [];

  return (
    <div className="h-full max-h-[520px] flex flex-col rounded-xl bg-[#171D24]/95 border border-[#303A45] shadow-2xl backdrop-blur-md overflow-hidden text-[#F3F4F6]">
      {/* Header */}
      <div className="p-4 border-b border-[#303A45] flex items-start justify-between bg-[#14191F]/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              {state.code}
            </span>
            <span className="text-xs uppercase tracking-wider text-[#9BAABD]">
              {state.type === 'ut' ? 'Union Territory' : 'State'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1 font-['Outfit',sans-serif]">
            {state.name}
          </h3>
          <p className="text-xs text-[#9BAABD] flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-[#55BCE8]" />
            Capital: {state.capital}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-[#9BAABD] hover:text-white rounded-lg hover:bg-[#1D242D] transition-colors"
          aria-label="Close state panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-2 p-3 bg-[#1D242D]/50 border-b border-[#303A45]">
        <div className="bg-[#14191F]/70 p-2.5 rounded-lg border border-[#303A45]">
          <span className="text-[10px] text-[#9BAABD] uppercase tracking-wider block">
            LS Seats
          </span>
          <span className="text-lg font-bold text-amber-400 font-mono">
            {state.seats}
          </span>
        </div>
        <div className="bg-[#14191F]/70 p-2.5 rounded-lg border border-[#303A45]">
          <span className="text-[10px] text-[#9BAABD] uppercase tracking-wider block">
            Active Data
          </span>
          <span className="text-lg font-bold text-cyan-400 font-mono">
            {state.coveredRecords} / {state.seats}
          </span>
        </div>
      </div>

      {/* State Average Performance */}
      {state.avgAttendance !== undefined && (
        <div className="p-3 bg-[#14191F]/40 border-b border-[#303A45] text-xs">
          <div className="flex items-center gap-1.5 text-[#9BAABD] mb-2 font-medium">
            <BarChart2 className="w-3.5 h-3.5 text-[#55BCE8]" />
            <span>State Baseline Benchmarks</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="text-[10px] text-[#9BAABD]">Avg Attendance</div>
              <div className="font-semibold text-white font-mono">
                {state.avgAttendance}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#9BAABD]">Avg Debates</div>
              <div className="font-semibold text-white font-mono">
                {state.avgDebates ?? '—'}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#9BAABD]">Avg Questions</div>
              <div className="font-semibold text-white font-mono">
                {state.avgQuestions ?? '—'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Constituency List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        <div className="text-xs font-semibold text-[#9BAABD] px-1 flex items-center justify-between">
          <span>Constituencies ({constituencies.length > 0 ? constituencies.length : state.seats})</span>
          {isDelhi && (
            <span className="text-[10px] text-emerald-400 font-medium">Boundary data</span>
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
                    ? 'bg-[#1D242D] border-amber-400 shadow-md'
                    : 'bg-[#14191F]/60 border-[#303A45] hover:border-slate-500 hover:bg-[#1D242D]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white">
                    {c.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 font-medium">
                    {c.party || 'BJP'}
                  </span>
                </div>
                <div className="text-[11px] text-[#9BAABD] mt-0.5 flex items-center justify-between">
                  <span>MP: {c.sittingMP}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#9BAABD]" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-xs text-[#9BAABD] bg-[#14191F]/40 rounded-lg border border-[#303A45]/60 mt-2">
            <p className="font-medium text-slate-300">Phase 2 Constituency Data</p>
            <p className="text-[11px] mt-1 text-slate-400">
              National seat boundaries for {state.name} are queued for subsequent data ingestion.
            </p>
            <Link href={`/state/${state.id}`}
              className="mt-3 inline-flex items-center gap-1 text-xs text-[#55BCE8] hover:underline"
            >
              Explore {state.name} State Portal →
            </Link>
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="p-3 border-t border-[#303A45] bg-[#14191F]/90">
        <Link href={`/state/${state.id}`}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-md transition-all"
        >
          <span>Explore All {state.seats} Seats in {state.name}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

