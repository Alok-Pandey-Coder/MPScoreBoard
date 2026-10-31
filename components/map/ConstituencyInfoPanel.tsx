'use client';

import React from 'react';
import { X, Award, ChevronRight, User } from 'lucide-react';
import { ConstituencyGeoData } from '@/lib/indiaGeoData';
import Link from 'next/link';

export interface ConstituencyInfoPanelProps {
  constituency: ConstituencyGeoData;
  onClose: () => void;
}

export const ConstituencyInfoPanel: React.FC<ConstituencyInfoPanelProps> = ({
  constituency,
  onClose,
}) => {
  return (
    <div className="w-80 rounded-xl bg-[#171D24]/95 border border-amber-400/80 shadow-2xl backdrop-blur-md overflow-hidden text-[#F3F4F6] animate-in fade-in zoom-in-95 duration-200">
      <div className="p-3 border-b border-[#303A45] flex items-center justify-between bg-[#14191F]/90">
        <div>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
            {constituency.reservation || 'GEN'} Seat
          </span>
          <h4 className="text-sm font-bold text-white mt-1 font-['Outfit',sans-serif]">
            {constituency.name}
          </h4>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-[#9BAABD] hover:text-white rounded-lg hover:bg-[#1D242D] transition-colors"
          aria-label="Close constituency panel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3.5 space-y-3">
        {/* MP Details */}
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-[#303A45] flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
            {constituency.sittingMP?.charAt(0) || <User className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">
              {constituency.sittingMP}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1D242D] text-slate-300 font-medium border border-[#303A45]">
                {constituency.party || 'BJP'}
              </span>
              {constituency.isMinister && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-0.5">
                  <Award className="w-2.5 h-2.5" /> Minister
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Benchmarks if available */}
        <div className="grid grid-cols-3 gap-1.5 bg-[#14191F]/80 p-2 rounded-lg border border-[#303A45] text-center">
          <div>
            <div className="text-[9px] text-[#9BAABD] uppercase">Attendance</div>
            <div className="text-xs font-bold text-white font-mono mt-0.5">
              {constituency.attendancePct ? `${constituency.attendancePct}%` : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-[#9BAABD] uppercase">Debates</div>
            <div className="text-xs font-bold text-white font-mono mt-0.5">
              {constituency.debates ?? '—'}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-[#9BAABD] uppercase">Questions</div>
            <div className="text-xs font-bold text-white font-mono mt-0.5">
              {constituency.questions ?? '—'}
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link href={`/mp/${constituency.slug}`}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-colors font-medium"
        >
          <span>Open Full Report Card</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

