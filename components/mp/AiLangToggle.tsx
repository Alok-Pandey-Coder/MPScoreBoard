'use client';

import React, { useState } from 'react';
import { Languages } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { LANG_NATIVE_NAME } from '@/lib/i18n';
import type { AiLang } from '@/lib/ai/summary';

/** Each option is written in its own language, like the site language switcher. */
const OPTIONS: Array<{ id: AiLang; label: string; htmlLang: string }> = [
  { id: 'hi', label: LANG_NATIVE_NAME.hi, htmlLang: 'hi' },
  { id: 'en', label: LANG_NATIVE_NAME.en, htmlLang: 'en' },
  { id: 'hinglish', label: 'Hinglish', htmlLang: 'hi-Latn' },
];

/**
 * Language of generated text (summary or draft). It follows the UI language
 * until the reader picks one; that pick applies while the UI language stays
 * the same, and switching the UI language resets it. Derived during render,
 * so no effect is needed to sync it.
 */
export function useAiLang(): [AiLang, (lang: AiLang) => void] {
  const { lang: uiLang } = useLang();
  const [choice, setChoice] = useState<{ ui: typeof uiLang; lang: AiLang } | null>(null);
  const lang: AiLang = choice && choice.ui === uiLang ? choice.lang : uiLang;
  return [lang, (next) => setChoice({ ui: uiLang, lang: next })];
}

interface AiLangToggleProps {
  value: AiLang;
  onChange: (lang: AiLang) => void;
  /** Accessible name of the button group, e.g. "Summary language". */
  label: string;
  showIcon?: boolean;
}

export function AiLangToggle({ value, onChange, label, showIcon = false }: AiLangToggleProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center gap-1 bg-stone-100 dark:bg-[#141C29] p-1 rounded-lg border border-stone-200 dark:border-[#222F42] self-start sm:self-auto text-xs font-mono"
    >
      {showIcon && <Languages className="w-3.5 h-3.5 text-stone-400 ml-1.5 mr-0.5" aria-hidden="true" />}
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          lang={opt.htmlLang}
          onClick={() => onChange(opt.id)}
          aria-pressed={value === opt.id}
          className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
            value === opt.id
              ? 'bg-white dark:bg-stone-100 text-stone-900 dark:text-stone-950 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
