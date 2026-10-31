'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const FloatingThemePill: React.FC = () => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleTheme();
        }}
        type="button"
        className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border shadow-xl backdrop-blur-xl transition-all duration-200 cursor-pointer ${
          isDark
            ? 'bg-[#0E1420]/95 border-[#222E42] text-stone-200 hover:border-amber-500/60'
            : 'bg-white/95 border-stone-300 text-stone-800 hover:border-stone-500'
        }`}
        title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        aria-label="Toggle Light and Dark Mode"
      >
        <Sun className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />

        {/* Pill Slider Track */}
        <div
          className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 relative ${
            isDark ? 'bg-amber-600' : 'bg-stone-300'
          }`}
        >
          <div
            className={`w-3 h-3 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
              isDark ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </div>

        <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-stone-400' : 'text-stone-600'}`} />

        <span className="text-[10px] font-mono font-bold tracking-wider uppercase select-none">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      </button>
    </div>
  );
};
