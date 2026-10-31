import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ChevronRight, MapPin } from 'lucide-react';
import { MPRecord } from '../../types/mp';
import { searchMPs } from '../../lib/search';

interface UnifiedSearchBarProps {
  mps: MPRecord[];
  autoFocus?: boolean;
  onSelect?: () => void;
  onSelectGeographicalFeature?: (stateId: string, constituencySlug?: string) => void;
}

export const UnifiedSearchBar: React.FC<UnifiedSearchBarProps> = ({
  mps,
  autoFocus = false,
  onSelect,
  onSelectGeographicalFeature,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MPRecord[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const matched = searchMPs(query, mps);
    setResults(matched);
    setIsOpen(true);
    setSelectedIndex(0);
  }, [query, mps]);

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
    navigate(`/mp/${mp.slug}`);
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
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search Input Box */}
      <div className="relative flex items-center group">
        <Search className="absolute left-4 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim() && results.length > 0) setIsOpen(true);
          }}
          autoFocus={autoFocus}
          placeholder="Search by MP name, seat (e.g. Bansuri, New Delhi, Manoj)..."
          className="w-full pl-12 pr-11 py-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xl shadow-slate-200/50 dark:shadow-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-96 overflow-y-auto z-50 divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
          {results.length > 0 ? (
            <div>
              <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <span>Matching Constituencies &amp; MPs ({results.length})</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Use ↑↓ keys to navigate</span>
              </div>
              {results.map((mp, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={mp.slug}
                    onClick={() => handleSelect(mp)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left px-4 py-3.5 flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/60'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200 dark:border-slate-700">
                        {mp.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white text-sm">
                            {mp.name}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                            {mp.party}
                          </span>
                          {mp.is_minister && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 font-medium">
                              Minister
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1 font-medium">
                            <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                            {mp.constituency}
                          </span>
                          <span>•</span>
                          <span>{mp.state}</span>
                          {mp.reservation && mp.reservation !== 'GEN' && (
                            <>
                              <span>•</span>
                              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                ({mp.reservation})
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected
                          ? 'text-blue-600 dark:text-blue-400 translate-x-1'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                No matching MP or constituency found
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                Try searching for Delhi seats like &quot;Chandni Chowk&quot;, &quot;New Delhi&quot;, or MP names like &quot;Bansuri&quot; or &quot;Manoj&quot;.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
