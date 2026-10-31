'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building, ArrowRight } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { useLang, useMessages } from '@/context/LanguageContext';
import { localizeState } from '@/lib/i18n';
import { homeMessages } from '@/lib/messages/home';

interface StateConstituencyPickerProps {
  mps: MPRecord[];
}

export const StateConstituencyPicker: React.FC<StateConstituencyPickerProps> = ({ mps }) => {
  const router = useRouter();
  const t = useMessages(homeMessages);
  const { lang } = useLang();

  // Extract unique states
  const states = Array.from(new Set(mps.map((m) => m.state)));
  const [selectedState, setSelectedState] = useState<string>(states[0] || 'Delhi');

  // Filter constituencies for selected state
  const availableMPs = mps.filter((m) => m.state === selectedState);
  const [selectedSlug, setSelectedSlug] = useState<string>(
    availableMPs[0]?.slug || ''
  );

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    const filtered = mps.filter((m) => m.state === state);
    if (filtered.length > 0) {
      setSelectedSlug(filtered[0].slug);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSlug) {
      router.push(`/mp/${selectedSlug}`);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0E1420] rounded-xl p-5 sm:p-6 border border-stone-200/90 dark:border-[#1E2636] shadow-sm transition-colors">
      <div className="flex items-center gap-2 mb-3.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
        <Building className="w-3.5 h-3.5" />
        <span>{t.pickerTitle}</span>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        {/* State Select */}
        <div className="sm:col-span-5">
          <label
            htmlFor="state-select"
            className="block text-xs font-mono font-medium text-stone-600 dark:text-stone-400 mb-1"
          >
            {t.selectState}
          </label>
          <div className="relative">
            <select
              id="state-select"
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#141C29] border border-stone-200 dark:border-[#222F42] rounded-lg text-stone-900 dark:text-stone-100 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all appearance-none cursor-pointer"
            >
              {states.map((st) => (
                <option key={st} value={st} className="dark:bg-[#141C29]">
                  {localizeState(st, lang)} ({t.seatsOption(mps.filter((m) => m.state === st).length)})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-400">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Constituency Select */}
        <div className="sm:col-span-5">
          <label
            htmlFor="constituency-select"
            className="block text-xs font-mono font-medium text-stone-600 dark:text-stone-400 mb-1"
          >
            {t.selectSeat}
          </label>
          <div className="relative">
            <select
              id="constituency-select"
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#141C29] border border-stone-200 dark:border-[#222F42] rounded-lg text-stone-900 dark:text-stone-100 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all appearance-none cursor-pointer"
            >
              {availableMPs.map((mp) => (
                <option key={mp.slug} value={mp.slug} className="dark:bg-[#141C29]">
                  {mp.constituency} — {mp.name} ({mp.party})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-400">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-950 rounded-lg text-xs font-mono font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <span>{t.open}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
