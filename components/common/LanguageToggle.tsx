'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { useLang, useMessages } from '@/context/LanguageContext';
import { LANG_NATIVE_NAME, type Lang } from '@/lib/i18n';
import { commonMessages } from '@/lib/messages/common';

/** Switches the UI between English and Hindi; shows the language you will switch to. */
export const LanguageToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, setLang } = useLang();
  const t = useMessages(commonMessages);
  const next: Lang = lang === 'en' ? 'hi' : 'en';

  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      lang={next}
      title={t.switchLanguage}
      aria-label={t.switchLanguage}
      className={`h-11 px-3 flex items-center gap-1.5 rounded-xl border text-sm font-semibold transition-colors cursor-pointer bg-stone-100 dark:bg-slate-800/80 border-stone-200 dark:border-slate-700 text-stone-700 dark:text-stone-200 hover:bg-stone-200/80 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${className}`}
    >
      <Languages className="w-4 h-4" aria-hidden="true" />
      <span>{LANG_NATIVE_NAME[next]}</span>
    </button>
  );
};
