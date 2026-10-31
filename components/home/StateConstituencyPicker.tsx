'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building, ArrowRight } from 'lucide-react';
import { MPRecord } from '@/types/mp';

interface StateConstituencyPickerProps {
  mps: MPRecord[];
}

export const StateConstituencyPicker: React.FC<StateConstituencyPickerProps> = ({ mps }) => {
  const router = useRouter();

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
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none transition-colors">
      <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
        <Building className="w-4 h-4" />
        <span>Step-by-Step Constituency Selector</span>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
        {/* State Select */}
        <div className="sm:col-span-5">
          <label
            htmlFor="state-select"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Select State / UT
          </label>
          <div className="relative">
            <select
              id="state-select"
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all appearance-none cursor-pointer"
            >
              {states.map((st) => (
                <option key={st} value={st} className="dark:bg-slate-800">
                  {st} ({mps.filter((m) => m.state === st).length} Seats)
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Constituency Select */}
        <div className="sm:col-span-5">
          <label
            htmlFor="constituency-select"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Select Parliamentary Seat
          </label>
          <div className="relative">
            <select
              id="constituency-select"
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all appearance-none cursor-pointer"
            >
              {availableMPs.map((mp) => (
                <option key={mp.slug} value={mp.slug} className="dark:bg-slate-800">
                  {mp.constituency} — {mp.name} ({mp.party})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            <span>View Card</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
