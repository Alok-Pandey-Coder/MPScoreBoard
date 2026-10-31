'use client';

import React, { createContext, useCallback, useContext, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const STORAGE_KEY = 'mera-mp-theme';
const CHANGE_EVENT = 'mera-mp-theme-change';

// The inline script in app/layout.tsx applies the saved theme to <html> before
// hydration; <html data-theme> is therefore the source of truth here.
function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

function applyTheme(t: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', t === 'dark');
  root.dataset.theme = t;
  root.style.colorScheme = t;
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {
    // Storage blocked (private mode): the theme still applies for this page.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useSyncExternalStore<Theme>(subscribe, readTheme, () => 'dark');
  const setTheme = useCallback((t: Theme) => applyTheme(t), []);
  const toggleTheme = useCallback(() => applyTheme(readTheme() === 'light' ? 'dark' : 'light'), []);

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
