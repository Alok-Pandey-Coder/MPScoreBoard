'use client';

import React from 'react';
import Link from 'next/link';
import { Landmark, Building2, ArrowUpRight } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { useLang, useMessages } from '@/context/LanguageContext';
import { localizeState } from '@/lib/i18n';
import { homeMessages } from '@/lib/messages/home';

interface NagrikStateCardsGridProps {
  mps: MPRecord[];
}

// Seat counts are fixed by delimitation; whether a state has report cards is
// read from the data, so a state lights up as soon as its records are added.
const FEATURED_STATES = [
  { id: 'delhi', name: 'Delhi', regionalName: 'दिल्ली', type: 'Union Territory', seats: 7, icon: Landmark },
  { id: 'uttar-pradesh', name: 'Uttar Pradesh', regionalName: 'उत्तर प्रदेश', type: 'State', seats: 80, icon: Building2 },
  { id: 'maharashtra', name: 'Maharashtra', regionalName: 'महाराष्ट्र', type: 'State', seats: 48, icon: Landmark },
  { id: 'west-bengal', name: 'West Bengal', regionalName: 'পশ্চিমবঙ্গ', type: 'State', seats: 42, icon: Building2 },
  { id: 'karnataka', name: 'Karnataka', regionalName: 'ಕರ್ನಾಟಕ', type: 'State', seats: 28, icon: Landmark },
  { id: 'tamil-nadu', name: 'Tamil Nadu', regionalName: 'தமிழ்நாடு', type: 'State', seats: 39, icon: Building2 },
];

const toStateId = (state: string) => state.trim().toLowerCase().replace(/\s+/g, '-');

export const NagrikStateCardsGrid: React.FC<NagrikStateCardsGridProps> = ({ mps }) => {
  const t = useMessages(homeMessages);
  const { lang } = useLang();
  const cardsByState = new Map<string, number>();
  for (const mp of mps) {
    const id = toStateId(mp.state);
    cardsByState.set(id, (cardsByState.get(id) ?? 0) + 1);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {FEATURED_STATES.map((st) => {
        const Icon = st.icon;
        const cardCount = cardsByState.get(st.id) ?? 0;
        const available = cardCount > 0;

        return (
          <div
            key={st.id}
            className="group bg-white dark:bg-[#0E1420] border border-stone-200/90 dark:border-[#1E2636] hover:border-amber-500/60 rounded-xl p-5 transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-[#16202E] border border-stone-200 dark:border-[#26344A] flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:border-amber-500/60 transition-colors">
                    <Icon className="w-5 h-5 stroke-[1.75]" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {localizeState(st.name, lang)}
                    </h3>
                    <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                      {st.regionalName} · {st.type === 'State' ? t.typeState : t.typeUnionTerritory}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono uppercase font-bold tracking-wider text-stone-400">
                    {t.lokSabhaSeats}
                  </div>
                  <div className="text-base font-extrabold font-mono text-stone-900 dark:text-white flex items-center justify-end gap-1 tabular-nums">
                    <span>{st.seats}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-500 transition-colors" aria-hidden="true" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4 font-mono text-[11px]">
                <span
                  className={`px-2 py-0.5 rounded border ${
                    available
                      ? 'bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/30 font-bold'
                      : 'bg-stone-100 dark:bg-[#151D2A] text-stone-600 dark:text-stone-400 border-stone-200 dark:border-[#222E42]'
                  }`}
                >
                  {available ? t.cardsAvailable(cardCount, st.seats) : t.cardsComingSoon}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-[#1A2333] flex items-center justify-between text-xs font-mono text-stone-500 dark:text-stone-400">
              <Link
                href={available ? '#find-constituency' : `/state/${st.id}`}
                className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
              >
                {t.linkConstituencies}
              </Link>
              <span aria-hidden="true">·</span>
              <Link
                href={`/state/${st.id}`}
                className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
              >
                {t.linkMPs}
              </Link>
              <span aria-hidden="true">·</span>
              <Link href="/about" className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors">
                {t.aboutData}
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};
