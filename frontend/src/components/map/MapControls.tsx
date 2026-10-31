import React from 'react';
import { Plus, Minus, RotateCcw, ArrowLeft, Layers } from 'lucide-react';

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
  return (
    <div className="absolute right-4 top-4 z-20 flex flex-col gap-2 items-end">
      {selectedState && onBackToNational && (
        <button
          onClick={onBackToNational}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#171D24]/90 text-amber-400 border border-[#303A45] hover:bg-[#1D242D] hover:border-amber-400/50 shadow-lg backdrop-blur-md transition-all duration-200"
          title="Return to National India Map"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All India Map</span>
        </button>
      )}

      <div className="flex flex-col rounded-lg overflow-hidden bg-[#171D24]/90 border border-[#303A45] shadow-xl backdrop-blur-md divide-y divide-[#303A45]">
        <button
          onClick={onZoomIn}
          className="p-2 text-[#9BAABD] hover:text-[#F3F4F6] hover:bg-[#1D242D] transition-colors"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-2 text-[#9BAABD] hover:text-[#F3F4F6] hover:bg-[#1D242D] transition-colors"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={onReset}
          className="p-2 text-[#9BAABD] hover:text-[#55BCE8] hover:bg-[#1D242D] transition-colors"
          title="Reset View"
          aria-label="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

