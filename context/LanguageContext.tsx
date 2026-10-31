'use client';

import React, { createContext, useCallback, useContext, useSyncExternalStore } from 'react';
import { DEFAULT_LANG, LANG_STORAGE_KEY, isLang, type Lang, type Messages } from '@/lib/i18n';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
const CHANGE_EVENT = 'mera-mp-lang-change';

// The inline script in app/layout.tsx applies the saved language to <html lang>
// before hydration, so <html lang> is the source of truth (as with the theme).
function readLang(): Lang {
  const lang = document.documentElement.lang;
  return isLang(lang) ? lang : DEFAULT_LANG;
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

function applyLang(lang: Lang) {
  document.documentElement.lang = lang;
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Storage blocked (private mode): the choice still applies for this page.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Server render and first hydration use English; a saved Hindi choice
  // switches in immediately after hydration.
  const lang = useSyncExternalStore<Lang>(subscribe, readLang, () => DEFAULT_LANG);
  const setLang = useCallback((next: Lang) => applyLang(next), []);
  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
};

export function useLang(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLang must be used within a LanguageProvider');
  return context;
}

/** Returns the current language's block of a `defineMessages` namespace. */
export function useMessages<T>(messages: Messages<T>): T {
  return messages[useLang().lang];
}
