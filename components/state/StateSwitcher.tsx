'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { INDIA_STATES } from '@/lib/indiaGeoData';
import { useLang, useMessages } from '@/context/LanguageContext';
import { localizeState } from '@/lib/i18n';
import { stateIdOf } from '@/lib/stateId';
import { stateMessages } from '@/lib/messages/state';

interface StateSwitcherProps {
  currentId: string;
  mps: MPRecord[];
}

/** Dropdown to jump between state and union territory pages (like a city switcher). */
export const StateSwitcher: React.FC<StateSwitcherProps> = ({ currentId, mps }) => {
  const t = useMessages(stateMessages);
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const withCards = useMemo(() => new Set(mps.map((mp) => stateIdOf(mp.state))), [mps]);
  // States with report cards first, then alphabetical.
  const states = useMemo(
    () =>
      [...INDIA_STATES].sort(
        (a, b) => (withCards.has(b.id) ? 1 : 0) - (withCards.has(a.id) ? 1 : 0) || a.name.localeCompare(b.name)
      ),
    [withCards]
  );
  const current = INDIA_STATES.find((s) => s.id === currentId);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.switchState}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1a222d] border border-slate-200 dark:border-[#27323f] text-sm font-semibold text-slate-900 dark:text-white hover:border-cyan-500/60 transition-colors cursor-pointer"
      >
        <span>{current ? localizeState(current.name, lang) : t.switchState}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-2 z-50 w-64 max-h-80 overflow-y-auto rounded-xl border border-slate-200 dark:border-[#27323f] bg-white dark:bg-[#161c24] shadow-xl"
        >
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#27323f] hover:bg-slate-50 dark:hover:bg-[#1a222d]"
          >
            <span>{t.allStates}</span>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{t.india}</span>
          </Link>
          {states.map((s) => {
            const isCurrent = s.id === currentId;
            return (
              <Link
                key={s.id}
                href={`/state/${s.id}`}
                // Replace, not push: hopping between states should not stack history entries,
                // otherwise Back walks through every state visited instead of leaving them.
                replace
                role="option"
                aria-selected={isCurrent}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-[#1a222d] ${
                  isCurrent ? 'text-cyan-600 dark:text-cyan-400 font-semibold' : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                <span className="truncate">{localizeState(s.name, lang)}</span>
                <span className="flex items-center gap-2 shrink-0">
                  {withCards.has(s.id) && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                      {t.liveBadge}
                    </span>
                  )}
                  {isCurrent && <Check className="w-4 h-4" aria-hidden="true" />}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
