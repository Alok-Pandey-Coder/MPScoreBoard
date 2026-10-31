import React from 'react';
import { Landmark, Calendar, CheckCircle2, TrendingUp, IndianRupee } from 'lucide-react';

export const NagrikTerritoryBar: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Territory Bar with Live Weather/AQI style chips */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#232c37]">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1a222d] border border-[#2b3746] flex items-center justify-center text-cyan-400 shrink-0">
            <Landmark className="w-8 h-8" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              NATIONAL CAPITAL TERRITORY · 18TH LOK SABHA (2024–2029)
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-['Outfit'] tracking-tight mt-0.5">
              DELHI LOK SABHA
            </h1>
          </div>
        </div>

        {/* Right Status Chips */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Active Term (18th LS)</span>
          </span>

          <span className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>State Avg: 96% Attendance</span>
          </span>

          <span className="px-3 py-1.5 rounded-xl bg-[#161d26] border border-[#273342] text-slate-400 font-medium hidden sm:flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>31 Oct 2026, 3:45 PM</span>
          </span>
        </div>
      </div>

      {/* 4 Counter Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-[#141a22] p-4.5 rounded-3xl border border-[#232c37]">
        <div className="px-3 py-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Constituencies Mapped
          </span>
          <div className="text-3xl font-black text-white font-['Outfit'] mt-1">
            7
          </div>
          <span className="text-[11px] text-slate-400">All 7 Lok Sabha seats</span>
        </div>

        <div className="px-3 py-1 border-l border-[#232c37]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Sitting MPs Tracked
          </span>
          <div className="text-3xl font-black text-amber-400 font-['Outfit'] mt-1">
            7
          </div>
          <span className="text-[11px] text-slate-400">100% verified provenance</span>
        </div>

        <div className="px-3 py-1 border-l border-[#232c37]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Parliamentary Questions
          </span>
          <div className="text-3xl font-black text-cyan-400 font-['Outfit'] mt-1">
            1,031
          </div>
          <span className="text-[11px] text-slate-400">Submitted across ministries</span>
        </div>

        <div className="px-3 py-1 border-l border-[#232c37]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            MPLADS Funds Tracked
          </span>
          <div className="text-3xl font-black text-emerald-400 font-['Outfit'] mt-1">
            ₹ 35.0 Cr
          </div>
          <span className="text-[11px] text-slate-400">Entitlement baseline</span>
        </div>
      </div>

      {/* Subnavigation Tabs Bar (Nagrik style tabs) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-[#232c37] no-scrollbar">
        <button
          type="button"
          className="px-4 py-2.5 rounded-xl font-bold text-slate-950 bg-amber-400 shadow-md shrink-0 flex items-center gap-1.5"
        >
          <span className="font-mono text-[10px]">01</span>
          <span>Find your constituency</span>
        </button>

        <a
          href="#delhi-mps"
          className="px-4 py-2.5 rounded-xl font-semibold text-slate-300 hover:text-white hover:bg-[#1a222d] transition-colors shrink-0 flex items-center gap-1.5"
        >
          <span className="font-mono text-[10px] text-slate-500">02</span>
          <span>People (MPs)</span>
        </a>

        <a
          href="#national-states"
          className="px-4 py-2.5 rounded-xl font-semibold text-slate-300 hover:text-white hover:bg-[#1a222d] transition-colors shrink-0 flex items-center gap-1.5"
        >
          <span className="font-mono text-[10px] text-slate-500">03</span>
          <span>Explore All States</span>
        </a>

        <a
          href="/compare"
          className="px-4 py-2.5 rounded-xl font-semibold text-slate-300 hover:text-white hover:bg-[#1a222d] transition-colors shrink-0 flex items-center gap-1.5"
        >
          <span className="font-mono text-[10px] text-slate-500">04</span>
          <span>Compare MPs</span>
        </a>

        <a
          href="/about"
          className="px-4 py-2.5 rounded-xl font-semibold text-slate-300 hover:text-white hover:bg-[#1a222d] transition-colors shrink-0 flex items-center gap-1.5"
        >
          <span className="font-mono text-[10px] text-slate-500">05</span>
          <span>Sources</span>
        </a>
      </div>
    </div>
  );
};

