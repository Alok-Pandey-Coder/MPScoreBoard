'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, MapPin, Search } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { REAL_INDIA_STATES, RealStateData } from '@/lib/realIndiaMapData';
import { useLang, useMessages } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { localizeState } from '@/lib/i18n';
import { NagrikStateCardsGrid } from '@/components/home/NagrikStateCardsGrid';
import { stateIdOf } from '@/lib/stateId';
import { mapMessages } from '@/lib/messages/map';

// States whose constituency/ward geometry is shipped; others show an outline only.
// Delhi has the ward-level Leaflet map; states in PC_MAP_STATES get an SVG constituency map.
const DETAILED_MAP_STATES = new Set(['delhi']);
const PC_MAP_STATES = new Set(['goa']);

function MapLoading({ height }: { height: string }) {
  const t = useMessages(mapMessages);
  return (
    <div
      style={{ height: `${height}px` }}
      className="w-full bg-stone-100 dark:bg-[#0C1017] flex items-center justify-center animate-pulse"
    >
      <div className="text-stone-500 font-mono text-sm tracking-wide">{t.mapLoading}</div>
    </div>
  );
}

const StateConstituencyMap = dynamic(
  () => import('@/components/map/StateConstituencyMap').then((mod) => mod.StateConstituencyMap),
  {
    ssr: false,
    loading: () => <MapLoading height="560" />,
  }
);

const NagrikStyleMap = dynamic(
  () => import('@/components/map/NagrikStyleMap').then((mod) => mod.NagrikStyleMap),
  {
    ssr: false,
    loading: () => <MapLoading height="620" />,
  }
);

/** Bounding box of an SVG path made of absolute M/L commands. */
function pathBounds(path: string) {
  const nums = (path.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    minX = Math.min(minX, nums[i]);
    maxX = Math.max(maxX, nums[i]);
    minY = Math.min(minY, nums[i + 1]);
    maxY = Math.max(maxY, nums[i + 1]);
  }
  return { minX, minY, maxX, maxY };
}

interface StateMapExplorerProps {
  mps: MPRecord[];
  selectedStateId: string | null;
  onSelectState: (stateId: string | null) => void;
  selectedSlug: string | null;
  onSelectConstituency: (slug: string) => void;
}

const StateOutline: React.FC<{ state: RealStateData; mps: MPRecord[] }> = ({ state, mps }) => {
  const t = useMessages(mapMessages);
  const { lang } = useLang();
  const { isDark } = useTheme();
  const name = localizeState(state.name, lang);
  const box = useMemo(() => {
    const b = pathBounds(state.path);
    const pad = Math.max(b.maxX - b.minX, b.maxY - b.minY) * 0.08;
    return `${b.minX - pad} ${b.minY - pad} ${b.maxX - b.minX + pad * 2} ${b.maxY - b.minY + pad * 2}`;
  }, [state.path]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-[460px]">
      <div className="relative bg-stone-100 dark:bg-[#080C12] p-6 pb-12 flex items-center justify-center min-h-[360px]">
        <svg viewBox={box} className="w-full h-[360px]" role="img" aria-label={t.stateOutlineTitle(name)}>
          <path
            d={state.path}
            fill={isDark ? 'rgba(6,182,212,0.28)' : 'rgba(6,182,212,0.22)'}
            stroke={isDark ? '#22D3EE' : '#0891b2'}
            strokeWidth="1.2"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <p className="absolute bottom-3 left-4 right-4 text-[11px] font-mono text-stone-600 dark:text-stone-400">
          {t.boundariesPending}
        </p>
      </div>

      <div className="p-5 space-y-4 bg-stone-50/90 dark:bg-[#0E1420] border-t md:border-t-0 md:border-l border-stone-200 dark:border-[#1E2636]">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            {state.code}
          </div>
          <h4 className="text-xl font-bold text-stone-900 dark:text-white">{name}</h4>
          <div className="text-xs font-mono text-stone-500 dark:text-stone-400">{t.seatsInState(state.seats)}</div>
        </div>

        {mps.length === 0 ? (
          <p className="p-4 rounded-xl border border-dashed border-stone-300 dark:border-[#232F42] text-xs font-mono text-stone-500 dark:text-stone-400">
            {t.noMpsYet}
          </p>
        ) : (
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
              {t.mpsInState(mps.length)}
            </div>
            <div className="space-y-1.5">
              {mps.map((mp) => (
                <Link
                  key={mp.slug}
                  href={`/mp/${mp.slug}`}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-lg border bg-white dark:bg-[#121A26] border-stone-200 dark:border-[#1F2B3D] hover:border-amber-500 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-stone-900 dark:text-white truncate">{mp.name}</div>
                    <div className="text-[10px] font-mono text-stone-500 dark:text-stone-400 truncate">
                      {mp.constituency} · {mp.party}
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-amber-600 dark:text-amber-400 shrink-0">
                    {t.viewReportCard}
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const StateMapExplorer: React.FC<StateMapExplorerProps> = ({
  mps,
  selectedStateId,
  onSelectState,
  selectedSlug,
  onSelectConstituency,
}) => {
  const t = useMessages(mapMessages);
  const { lang } = useLang();
  const [query, setQuery] = useState('');

  const mpsByState = useMemo(() => {
    const m = new Map<string, MPRecord[]>();
    for (const mp of mps) {
      const id = stateIdOf(mp.state);
      m.set(id, [...(m.get(id) ?? []), mp]);
    }
    return m;
  }, [mps]);

  const selected = selectedStateId ? REAL_INDIA_STATES.find((s) => s.id === selectedStateId) : undefined;

  return (
    <div className="relative isolate bg-white dark:bg-[#0C1017] border border-stone-200 dark:border-[#1E2636] rounded-2xl overflow-hidden shadow-xl">
      <div className="border-b border-stone-200 dark:border-[#1E2636] px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-stone-50/90 dark:bg-[#0E1420]">
        <div>
          <div className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-500 tracking-wider uppercase">
            {t.explorerEyebrow}
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white tracking-tight">
            {selected ? localizeState(selected.name, lang) : t.explorerTitle}
          </h3>
        </div>
        {selected && (
          <button
            onClick={() => onSelectState(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-white dark:bg-[#151D2A] border border-stone-200 dark:border-[#243144] text-stone-700 dark:text-stone-300 hover:border-amber-500 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            {t.allStates}
          </button>
        )}
      </div>

      {selected ? (
        DETAILED_MAP_STATES.has(selected.id) ? (
          <NagrikStyleMap
            mps={mpsByState.get(selected.id) ?? []}
            selectedSlug={selectedSlug}
            onSelectConstituency={onSelectConstituency}
          />
        ) : PC_MAP_STATES.has(selected.id) ? (
          <StateConstituencyMap
            stateId={selected.id}
            mps={mpsByState.get(selected.id) ?? []}
            selectedSlug={selectedSlug}
            onSelectConstituency={onSelectConstituency}
          />
        ) : (
          <StateOutline state={selected} mps={mpsByState.get(selected.id) ?? []} />
        )
      ) : (
        <div className="p-5 sm:p-6 space-y-4">
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            {t.explorerEmpty}
          </p>
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400 pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.explorerSearch}
              aria-label={t.explorerSearch}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#141C29] border border-stone-300 dark:border-[#232F42] rounded-xl text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <NagrikStateCardsGrid mps={mps} onSelectState={onSelectState} query={query} />
        </div>
      )}
    </div>
  );
};
