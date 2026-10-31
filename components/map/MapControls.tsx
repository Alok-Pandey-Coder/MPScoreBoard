'use client';

import React from 'react';
import { Plus, Minus, RotateCcw, ArrowLeft } from 'lucide-react';
import { useMessages } from '@/context/LanguageContext';
import { mapMessages } from '@/lib/messages/map';

export interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  selectedState?: string | null;
  onBackToNational?: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  selectedState,
  onBackToNational,
}) => {
  const t = useMessages(mapMessages);
  return (
    <div className="absolute right-4 top-4 z-20 flex flex-col gap-2 items-end">
      {selectedState && onBackToNational && (
        <button
          onClick={onBackToNational}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/95 dark:bg-[#171D24]/90 text-amber-700 dark:text-amber-400 border border-stone-200 dark:border-[#303A45] hover:bg-stone-100 dark:hover:bg-[#1D242D] hover:border-amber-500/50 shadow-md dark:shadow-lg backdrop-blur-md transition-all duration-200 cursor-pointer"
          title={t.backToNationalTitle}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.allIndiaMap}</span>
        </button>
      )}

      <div className="flex flex-col rounded-lg overflow-hidden bg-white/95 dark:bg-[#171D24]/90 border border-stone-200 dark:border-[#303A45] shadow-md dark:shadow-xl backdrop-blur-md divide-y divide-stone-200 dark:divide-[#303A45]">
        <button
          onClick={onZoomIn}
          className="p-2 text-stone-600 dark:text-[#9BAABD] hover:text-stone-900 dark:hover:text-[#F3F4F6] hover:bg-stone-100 dark:hover:bg-[#1D242D] transition-colors cursor-pointer"
          title={t.zoomIn}
          aria-label={t.zoomIn}
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-2 text-stone-600 dark:text-[#9BAABD] hover:text-stone-900 dark:hover:text-[#F3F4F6] hover:bg-stone-100 dark:hover:bg-[#1D242D] transition-colors cursor-pointer"
          title={t.zoomOut}
          aria-label={t.zoomOut}
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={onReset}
          className="p-2 text-stone-600 dark:text-[#9BAABD] hover:text-cyan-600 dark:hover:text-[#55BCE8] hover:bg-stone-100 dark:hover:bg-[#1D242D] transition-colors cursor-pointer"
          title={t.resetView}
          aria-label={t.resetView}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
