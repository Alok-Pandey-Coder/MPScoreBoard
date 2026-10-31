'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ChevronRight, MapPin } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { MPAvatar } from '@/components/ui/MPAvatar';
import { searchMPs } from '@/lib/search';
import { coverageNote, getCoverage } from '@/lib/coverage';
import { useLang, useMessages } from '@/context/LanguageContext';
import { homeMessages } from '@/lib/messages/home';

interface UnifiedSearchBarProps {
  mps: MPRecord[];
  autoFocus?: boolean;
  onSelect?: () => void;
  onSelectGeographicalFeature?: (stateId: string, constituencySlug?: string) => void;
}

/** Shortcut chips under the search box; capped so they stay one or two rows. */
const MAX_QUICK_SEATS = 8;
const toStateId = (state: string) => state.trim().toLowerCase().replace(/\s+/g, '-');

export const UnifiedSearchBar: React.FC<UnifiedSearchBarProps> = ({
  mps,
  autoFocus = false,
  onSelect,
  onSelectGeographicalFeature,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const router = useRouter();
  const t = useMessages(homeMessages);
  const { lang } = useLang();
  const quickSeats = useMemo(
    () =>
      mps.slice(0, MAX_QUICK_SEATS).map((mp) => ({
        slug: mp.slug,
        stateId: toStateId(mp.state),
        name: mp.constituency.replace(/\s*\((SC|ST)\)$/, ''),
      })),
    [mps],
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Results are derived from the query; typing opens the list and resets the highlight.
  const results = useMemo<MPRecord[]>(() => (query.trim() ? searchMPs(query, mps) : []), [query, mps]);
  const updateQuery = (value: string) => {
    setQuery(value);
    setIsOpen(value.trim().length > 0);
    setSelectedIndex(0);
  };

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (mp: MPRecord) => {
    setIsOpen(false);
    setQuery('');
    if (onSelectGeographicalFeature) {
      const stateId = mp.state.toLowerCase().replace(/\s+/g, '-');
      onSelectGeographicalFeature(stateId, mp.slug);
    }
    if (onSelect) onSelect();
    router.push(`/mp/${mp.slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto space-y-3">
      {/* Search Input Box */}
      <div className="relative flex items-center group">
        <Search className="absolute left-4 w-4 h-4 text-stone-400 dark:text-stone-500 pointer-events-none group-focus-within:text-amber-500 transition-colors" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => updateQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim() && results.length > 0) setIsOpen(true);
          }}
          autoFocus={autoFocus}
          placeholder={t.searchPlaceholder}
          className="w-full pl-11 pr-11 py-3.5 bg-white dark:bg-[#121824] border border-stone-300 dark:border-[#222E42] rounded-xl text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm"
        />
        {query && (
          <button
            onClick={() => {
              updateQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-3.5 p-1 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 rounded-md hover:bg-stone-100 dark:hover:bg-[#1A2333] transition-colors"
            aria-label={t.clearSearch}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Fast Seat Quick Filter Chips */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
        <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mr-1 hidden sm:inline">
          {t.jumpTo}
        </span>
        {quickSeats.map((seat) => (
          <button
            key={seat.slug}
            type="button"
            onClick={() => {
              // On the home page, focus the seat on the map; elsewhere open its card.
              if (onSelectGeographicalFeature) {
                onSelectGeographicalFeature(seat.stateId, seat.slug);
              } else {
                router.push(`/mp/${seat.slug}`);
              }
            }}
            className="px-2.5 py-1 rounded-md bg-stone-100 dark:bg-[#121824] hover:bg-stone-200 dark:hover:bg-[#1A2333] text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white border border-stone-200/90 dark:border-[#222E42] text-[11px] font-medium transition-colors cursor-pointer"
          >
            {seat.name}
          </button>
        ))}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#121824] rounded-xl shadow-xl border border-stone-200 dark:border-[#222E42] max-h-96 overflow-y-auto z-50 divide-y divide-stone-100 dark:divide-[#1C2638] animate-in fade-in duration-100">
          {results.length > 0 ? (
            <div>
              <div className="px-4 py-2 bg-stone-50 dark:bg-[#0E131E] text-[10px] font-mono font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center justify-between border-b border-stone-100 dark:border-[#1E283A]">
                <span>{t.resultsHeading(results.length)}</span>
                <span className="text-[10px] text-stone-400 dark:text-stone-500">{t.keyboardHint}</span>
              </div>
              {results.map((mp, index) => {
                const isSelected = index === selectedIndex;
                const attendance = mp.performance?.attendance_pct;
                return (
                  <button
                    key={mp.slug}
                    onClick={() => handleSelect(mp)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/10 dark:bg-[#1A2333] border-l-2 border-amber-500'
                        : 'hover:bg-stone-50 dark:hover:bg-[#151D2A]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MPAvatar imageUrl={mp.image_url} name={mp.name} size="sm" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-900 dark:text-white text-xs">
                            {mp.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-100 dark:bg-[#1C2637] text-stone-700 dark:text-stone-300 font-medium border border-stone-200 dark:border-[#2C3B52]">
                            {mp.party}
                          </span>
                          {mp.is_minister && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 font-medium">
                              {t.minister}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                          <MapPin className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>{mp.constituency}</span>
                          <span>·</span>
                          <span>{mp.state}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {attendance !== null && !mp.is_minister && (
                        <div className="text-right hidden sm:block">
                          <div className="text-[10px] text-stone-400 font-mono">{t.attendance}</div>
                          <div className="text-xs font-bold font-mono text-stone-800 dark:text-stone-200 tabular-nums">
                            {attendance}%
                          </div>
                        </div>
                      )}
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-stone-500 dark:text-stone-400">
              {t.noMatch(query)} {coverageNote(getCoverage(mps), lang)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
