'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useMessages } from '@/context/LanguageContext';
import { commonMessages } from '@/lib/messages/common';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { toggleTheme, isDark } = useTheme();
  const t = useMessages(commonMessages);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleTheme();
      }}
      type="button"
      className={`relative w-11 h-11 flex items-center justify-center rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer ${
        isDark
          ? 'bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-800 hover:text-amber-300 shadow-sm'
          : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 shadow-sm'
      } ${className}`}
      aria-label={isDark ? t.switchToLight : t.switchToDark}
      title={isDark ? t.switchToLight : t.switchToDark}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 scale-100" />
        ) : (
          <Moon className="w-4 h-4 transition-transform duration-300 rotate-0 scale-100 text-slate-600" />
        )}
      </div>
    </button>
  );
};

