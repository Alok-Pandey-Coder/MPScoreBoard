'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const FloatingThemePill: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleTheme();
        }}
        type="button"
        className={`flex items-center gap-2.5 px-4 py-2 rounded-full border shadow-2xl backdrop-blur-xl transition-all duration-300 cursor-pointer ${
          isDark
            ? 'bg-[#151c24]/95 border-[#2f3b4a] text-slate-200 hover:border-cyan-400/80 shadow-cyan-950/40 hover:scale-105'
            : 'bg-white/95 border-slate-300 text-slate-800 hover:border-blue-500 shadow-slate-300/60 hover:scale-105'
        }`}
        title={`Toggle to ${isDark ? 'Light' : 'Dark'} Theme`}
        aria-label="Toggle Light and Dark Theme"
      >
        <Sun className={`w-3.5 h-3.5 transition-colors ${isDark ? 'text-amber-400' : 'text-slate-400'}`} />

        {/* Pill Slider Track */}
        <div
          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 relative ${
            isDark ? 'bg-cyan-500' : 'bg-slate-300'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
              isDark ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </div>

        <Moon className={`w-3.5 h-3.5 transition-colors ${isDark ? 'text-slate-500' : 'text-blue-600'}`} />

        <span className="text-[11px] font-bold tracking-wider uppercase ml-1 select-none">
          {isDark ? 'Dark Atlas' : 'Light'}
        </span>
      </button>
    </div>
  );
};
