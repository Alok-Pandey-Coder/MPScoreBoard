import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MPRecord } from '../types/mp';
import { IndiaAtlasMap } from '../components/map/IndiaAtlasMap';
import { UnifiedSearchBar } from '../components/home/UnifiedSearchBar';
import { INDIA_STATES } from '../data/indiaGeoData';

interface ExploreAtlasPageProps {
  mps: MPRecord[];
}

export const ExploreAtlasPage: React.FC<ExploreAtlasPageProps> = ({ mps }) => {
  const [selectedStateId, setSelectedStateId] = useState<string>('delhi');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232c37]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-cyan-400 font-semibold">Geospatial Explorer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            India Parliamentary Atlas
          </h1>
        </div>

        {/* Search Bar in Explorer */}
        <div className="w-full sm:w-96">
          <UnifiedSearchBar
            mps={mps}
            onSelectGeographicalFeature={handleSelectFeature}
          />
        </div>
      </div>

      {/* State Quick Switcher Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-slate-400 font-bold uppercase text-[10px] shrink-0 mr-1">
          Quick Jump:
        </span>
        {INDIA_STATES.slice(0, 10).map((s) => (
          <button
            key={s.id}
            onClick={() => handleSelectFeature(s.id)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold shrink-0 transition-all ${
              selectedStateId === s.id
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                : 'bg-[#161c24] text-slate-300 border-[#27323f] hover:border-cyan-500/50'
            }`}
          >
            {s.name} ({s.seats})
          </button>
        ))}
      </div>

      {/* The Master Atlas Map Component */}
      <IndiaAtlasMap
        mps={mps}
        initialStateId={selectedStateId}
        initialConstituencySlug={selectedSlug}
        className="w-full h-[680px]"
      />
    </div>
  );
};

