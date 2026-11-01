'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Landmark, Building2, ArrowUpRight } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { useLang, useMessages } from '@/context/LanguageContext';
import { localizeState } from '@/lib/i18n';
import { homeMessages } from '@/lib/messages/home';
import { REAL_INDIA_STATES } from '@/lib/realIndiaMapData';
import { stateIdOf } from '@/lib/stateId';
import { getStateIcon, getStateImage } from '@/lib/stateImages';

interface NagrikStateCardsGridProps {
  mps: MPRecord[];
  /** When set, cards cover every state/UT and "Constituencies" opens that state's map. */
  onSelectState?: (stateId: string) => void;
  /** Filters the cards by state name or code (only with onSelectState). */
  query?: string;
}

const UNION_TERRITORIES = new Set([
  'delhi', 'chandigarh', 'puducherry', 'ladakh', 'jammu-kashmir',
  'lakshadweep', 'andaman-nicobar', 'dadra-daman-diu',
]);

// Seat counts are fixed by delimitation; whether a state has report cards is
// read from the data, so a state lights up as soon as its records are added.
const FEATURED_STATES = [
  { id: 'delhi', name: 'Delhi', type: 'Union Territory', seats: 7, icon: Landmark },
  { id: 'uttar-pradesh', name: 'Uttar Pradesh', type: 'State', seats: 80, icon: Building2 },
  { id: 'maharashtra', name: 'Maharashtra', type: 'State', seats: 48, icon: Landmark },
  { id: 'west-bengal', name: 'West Bengal', type: 'State', seats: 42, icon: Building2 },
  { id: 'karnataka', name: 'Karnataka', type: 'State', seats: 28, icon: Landmark },
  { id: 'tamil-nadu', name: 'Tamil Nadu', type: 'State', seats: 39, icon: Building2 },
];

const PAGE_SIZE = 6;

export const NagrikStateCardsGrid: React.FC<NagrikStateCardsGridProps> = ({ mps, onSelectState, query = '' }) => {
  const t = useMessages(homeMessages);
  const { lang } = useLang();
  const cardsByState = new Map<string, number>();
  for (const mp of mps) {
    const id = stateIdOf(mp.state);
    cardsByState.set(id, (cardsByState.get(id) ?? 0) + 1);
  }

  const q = query.trim().toLowerCase();
  const cards = onSelectState
    ? REAL_INDIA_STATES.map((r, i) => {
        const featured = FEATURED_STATES.find((f) => f.id === r.id);
        return {
          id: r.id,
          name: r.name,
          code: r.code,
          type: UNION_TERRITORIES.has(r.id) ? 'Union Territory' : 'State',
          seats: r.seats,
          icon: featured?.icon ?? (i % 2 ? Building2 : Landmark),
        };
      })
        .filter((c) => !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q)
        // States with report cards first, then alphabetical.
        .sort((a, b) => (cardsByState.has(b.id) ? 1 : 0) - (cardsByState.has(a.id) ? 1 : 0) || a.name.localeCompare(b.name))
    : FEATURED_STATES;

  // Six cards per page; the page resets whenever the search text changes.
  const [page, setPage] = useState(0);
  const [lastQuery, setLastQuery] = useState(query);
  if (lastQuery !== query) {
    setLastQuery(query);
    setPage(0);
  }
  const pageCount = Math.max(1, Math.ceil(cards.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = cards.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const tabClass =
    'py-2.5 text-center text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#222B37] hover:text-stone-900 dark:hover:text-white transition-colors';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {visible.map((st) => {
          const Icon = st.icon;
          const image = getStateImage(st.id);
          const stateIcon = getStateIcon(st.id);
          const cardCount = cardsByState.get(st.id) ?? 0;
          const available = cardCount > 0;

          return (
            <div
              key={st.id}
              className="group rounded-lg border border-stone-200 dark:border-[#2A3340] bg-white dark:bg-[#1A2029] hover:border-amber-500/60 overflow-hidden transition-colors"
            >
              <div
                onClick={onSelectState ? () => onSelectState(st.id) : undefined}
                className={`flex items-center gap-4 p-5 ${onSelectState ? 'cursor-pointer' : ''}`}
              >
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image.file}
                    alt={image.subject}
                    title={image.subject}
                    loading="lazy"
                    className="w-14 h-14 shrink-0 rounded-lg object-cover border border-stone-200 dark:border-[#2A3340]"
                  />
                ) : stateIcon ? (
                  // The SVG is used as a mask so it takes the text colour in light and dark themes.
                  <span
                    role="img"
                    aria-label={stateIcon.label}
                    title={stateIcon.label}
                    className="block w-12 h-12 shrink-0 bg-sky-600 dark:bg-sky-300"
                    style={{
                      maskImage: `url(${stateIcon.file})`,
                      WebkitMaskImage: `url(${stateIcon.file})`,
                      maskRepeat: 'no-repeat',
                      WebkitMaskRepeat: 'no-repeat',
                      maskPosition: 'center',
                      WebkitMaskPosition: 'center',
                      maskSize: 'contain',
                      WebkitMaskSize: 'contain',
                    }}
                  />
                ) : (
                  <Icon className="w-12 h-12 shrink-0 stroke-[1.1] text-sky-600 dark:text-sky-300" aria-hidden="true" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 truncate">
                    {localizeState(st.name, lang)}
                  </h3>
                  <p className="text-sm text-stone-500 dark:text-stone-400 truncate">
                    {st.type === 'State' ? t.typeState : t.typeUnionTerritory}
                  </p>
                </div>
                <div className="hidden sm:block self-stretch border-l border-stone-200 dark:border-[#2A3340] pl-5 text-left">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                    {t.lokSabhaSeats}
                  </div>
                  <div className="text-lg font-extrabold font-mono text-stone-900 dark:text-white tabular-nums">{st.seats}</div>
                  <div className={`text-[10px] font-mono ${available ? 'text-blue-700 dark:text-blue-300 font-bold' : 'text-stone-500 dark:text-stone-400'}`}>
                    {available ? t.cardsAvailable(cardCount, st.seats) : t.cardsComingSoon}
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 shrink-0 text-amber-500" aria-hidden="true" />
              </div>

              <div className="grid grid-cols-3 divide-x divide-stone-200 dark:divide-[#2A3340] border-t border-stone-200 dark:border-[#2A3340]">
                {onSelectState ? (
                  <button type="button" onClick={() => onSelectState(st.id)} className={`${tabClass} cursor-pointer`}>
                    {t.linkConstituencies}
                  </button>
                ) : (
                  <Link href={available ? '#find-constituency' : `/state/${st.id}`} className={tabClass}>
                    {t.linkConstituencies}
                  </Link>
                )}
                <Link href={`/state/${st.id}`} className={tabClass}>
                  {t.linkMPs}
                </Link>
                <Link href="/about" className={tabClass}>
                  {t.aboutData}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-3 text-xs font-mono">
          <button
            type="button"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-[#2A3340] text-stone-700 dark:text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-amber-500 cursor-pointer"
          >
            {t.pagePrev}
          </button>
          <span className="text-stone-500 dark:text-stone-400">{t.pageOf(currentPage + 1, pageCount)}</span>
          <button
            type="button"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage >= pageCount - 1}
            className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-[#2A3340] text-stone-700 dark:text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-amber-500 cursor-pointer"
          >
            {t.pageNext}
          </button>
        </div>
      )}
    </div>
  );
};
