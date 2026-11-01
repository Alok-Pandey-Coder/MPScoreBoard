'use client';

import React, { useState, useRef } from 'react';
import { REAL_INDIA_STATES, RealStateData } from '@/lib/realIndiaMapData';
import { coveredCount, coverageText } from '@/lib/stateCoverage';
import { DELHI_CONSTITUENCIES, ConstituencyGeoData } from '@/lib/indiaGeoData';
import { MPRecord } from '@/types/mp';
import { MapControls } from './MapControls';
import { StateInfoPanel } from './StateInfoPanel';
import { ConstituencyInfoPanel } from './ConstituencyInfoPanel';
import { Compass, Sparkles } from 'lucide-react';
import { useMessages } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { mapMessages } from '@/lib/messages/map';

// ============================================================================
// Regional Thematic Color Palette Configuration
// ============================================================================
export interface RegionConfig {
  id: string;
  name: string;
  shortName: string;
  totalSeats: number;
  color: string;
  fill: string;
  hoverFill: string;
  stroke: string;
  glow: string;
  badgeBg: string;
}

export const REGIONS_DARK: Record<string, RegionConfig> = {
  delhi: {
    id: 'delhi',
    name: 'Delhi',
    shortName: 'Delhi',
    totalSeats: 7,
    color: '#06B6D4', // Vibrant Electric Cyan
    fill: 'rgba(6, 182, 212, 0.40)',
    hoverFill: 'rgba(6, 182, 212, 0.70)',
    stroke: '#22D3EE',
    glow: 'rgba(6, 182, 212, 0.8)',
    badgeBg: '#083344',
  },
  north: {
    id: 'north',
    name: 'Northern Region',
    shortName: 'North',
    totalSeats: 39,
    color: '#38BDF8', // Crisp Sky Blue
    fill: 'rgba(56, 189, 248, 0.26)',
    hoverFill: 'rgba(56, 189, 248, 0.55)',
    stroke: '#38BDF8',
    glow: 'rgba(56, 189, 248, 0.6)',
    badgeBg: '#0c2233',
  },
  central: {
    id: 'central',
    name: 'Central Region',
    shortName: 'Central',
    totalSeats: 120,
    color: '#F59E0B', // Amber / Golden Ochre
    fill: 'rgba(245, 158, 11, 0.28)',
    hoverFill: 'rgba(245, 158, 11, 0.58)',
    stroke: '#FBBF24',
    glow: 'rgba(245, 158, 11, 0.6)',
    badgeBg: '#2c1e08',
  },
  west: {
    id: 'west',
    name: 'Western Region',
    shortName: 'West',
    totalSeats: 103,
    color: '#10B981', // Emerald Green
    fill: 'rgba(16, 185, 129, 0.26)',
    hoverFill: 'rgba(16, 185, 129, 0.55)',
    stroke: '#34D399',
    glow: 'rgba(16, 185, 129, 0.6)',
    badgeBg: '#0b261a',
  },
  east: {
    id: 'east',
    name: 'Eastern Region',
    shortName: 'East',
    totalSeats: 117,
    color: '#A855F7', // Royal Purple / Violet
    fill: 'rgba(168, 85, 247, 0.28)',
    hoverFill: 'rgba(168, 85, 247, 0.58)',
    stroke: '#C084FC',
    glow: 'rgba(168, 85, 247, 0.6)',
    badgeBg: '#231238',
  },
  south: {
    id: 'south',
    name: 'Southern Region',
    shortName: 'South',
    totalSeats: 132,
    color: '#F43F5E', // Rose Crimson / Coral
    fill: 'rgba(244, 63, 94, 0.26)',
    hoverFill: 'rgba(244, 63, 94, 0.55)',
    stroke: '#FB7185',
    glow: 'rgba(244, 63, 94, 0.6)',
    badgeBg: '#2e0f17',
  },
  northeast: {
    id: 'northeast',
    name: 'North-Eastern Region',
    shortName: 'North-East',
    totalSeats: 25,
    color: '#14B8A6', // Jade / Turquoise
    fill: 'rgba(20, 184, 166, 0.28)',
    hoverFill: 'rgba(20, 184, 166, 0.58)',
    stroke: '#2DD4BF',
    glow: 'rgba(20, 184, 166, 0.6)',
    badgeBg: '#092522',
  },
};

export const REGIONS_LIGHT: Record<string, RegionConfig> = {
  delhi: {
    id: 'delhi',
    name: 'Delhi',
    shortName: 'Delhi',
    totalSeats: 7,
    color: '#0891b2', // Deep Cyan
    fill: 'rgba(6, 182, 212, 0.24)',
    hoverFill: 'rgba(6, 182, 212, 0.45)',
    stroke: '#0891b2',
    glow: 'rgba(6, 182, 212, 0.4)',
    badgeBg: '#ffffff',
  },
  north: {
    id: 'north',
    name: 'Northern Region',
    shortName: 'North',
    totalSeats: 39,
    color: '#0284c7', // Sky Blue
    fill: 'rgba(56, 189, 248, 0.20)',
    hoverFill: 'rgba(56, 189, 248, 0.42)',
    stroke: '#0284c7',
    glow: 'rgba(56, 189, 248, 0.4)',
    badgeBg: '#ffffff',
  },
  central: {
    id: 'central',
    name: 'Central Region',
    shortName: 'Central',
    totalSeats: 120,
    color: '#d97706', // Amber 600
    fill: 'rgba(245, 158, 11, 0.20)',
    hoverFill: 'rgba(245, 158, 11, 0.42)',
    stroke: '#d97706',
    glow: 'rgba(245, 158, 11, 0.4)',
    badgeBg: '#ffffff',
  },
  west: {
    id: 'west',
    name: 'Western Region',
    shortName: 'West',
    totalSeats: 103,
    color: '#059669', // Emerald 600
    fill: 'rgba(16, 185, 129, 0.20)',
    hoverFill: 'rgba(16, 185, 129, 0.42)',
    stroke: '#059669',
    glow: 'rgba(16, 185, 129, 0.4)',
    badgeBg: '#ffffff',
  },
  east: {
    id: 'east',
    name: 'Eastern Region',
    shortName: 'East',
    totalSeats: 117,
    color: '#9333ea', // Purple 600
    fill: 'rgba(168, 85, 247, 0.20)',
    hoverFill: 'rgba(168, 85, 247, 0.42)',
    stroke: '#9333ea',
    glow: 'rgba(168, 85, 247, 0.4)',
    badgeBg: '#ffffff',
  },
  south: {
    id: 'south',
    name: 'Southern Region',
    shortName: 'South',
    totalSeats: 132,
    color: '#e11d48', // Rose 600
    fill: 'rgba(244, 63, 94, 0.20)',
    hoverFill: 'rgba(244, 63, 94, 0.42)',
    stroke: '#e11d48',
    glow: 'rgba(244, 63, 94, 0.4)',
    badgeBg: '#ffffff',
  },
  northeast: {
    id: 'northeast',
    name: 'North-Eastern Region',
    shortName: 'North-East',
    totalSeats: 25,
    color: '#0d9488', // Teal 600
    fill: 'rgba(20, 184, 166, 0.20)',
    hoverFill: 'rgba(20, 184, 166, 0.42)',
    stroke: '#0d9488',
    glow: 'rgba(20, 184, 166, 0.4)',
    badgeBg: '#ffffff',
  },
};

// Preserve backwards-compatible export
export const REGIONS = REGIONS_DARK;

// ============================================================================
// Layout Coordinates for Number Pointers & Badges (Matching Real Centroids)
// ============================================================================
interface PointerConfig {
  anchor: [number, number];
  badge: [number, number];
  hasPointer: boolean;
}

const REAL_STATE_POINTERS: Record<string, PointerConfig> = {
  delhi: { anchor: [347.8, 299.9], badge: [412, 298], hasPointer: true },
  'uttar-pradesh': { anchor: [440.9, 348.6], badge: [440.9, 348.6], hasPointer: false },
  maharashtra: { anchor: [309.0, 569.7], badge: [309.0, 569.7], hasPointer: false },
  'west-bengal': { anchor: [641.8, 435.8], badge: [641.8, 435.8], hasPointer: false },
  bihar: { anchor: [576.2, 384.7], badge: [576.2, 384.7], hasPointer: false },
  'tamil-nadu': { anchor: [384.7, 809.5], badge: [384.7, 809.5], hasPointer: false },
  'madhya-pradesh': { anchor: [379.4, 442.8], badge: [379.4, 442.8], hasPointer: false },
  karnataka: { anchor: [324.1, 704.8], badge: [324.1, 704.8], hasPointer: false },
  gujarat: { anchor: [209.0, 476.7], badge: [209.0, 476.7], hasPointer: false },
  rajasthan: { anchor: [302.4, 355.9], badge: [302.4, 355.9], hasPointer: false },
  'andhra-pradesh': { anchor: [434.7, 665.8], badge: [434.7, 665.8], hasPointer: false },
  odisha: { anchor: [548.5, 537.3], badge: [548.5, 537.3], hasPointer: false },
  kerala: { anchor: [327.0, 827.9], badge: [265.0, 838.0], hasPointer: true },
  telangana: { anchor: [395.3, 615.7], badge: [395.3, 615.7], hasPointer: false },
  assam: { anchor: [767.0, 367.1], badge: [767.0, 367.1], hasPointer: false },
  jharkhand: { anchor: [576.9, 444.1], badge: [576.9, 444.1], hasPointer: false },
  punjab: { anchor: [303.4, 235.7], badge: [242.0, 228.0], hasPointer: true },
  chhattisgarh: { anchor: [479.8, 507.3], badge: [479.8, 507.3], hasPointer: false },
  haryana: { anchor: [329.1, 284.3], badge: [272.0, 284.3], hasPointer: true },
  'jammu-kashmir': { anchor: [289.2, 157.9], badge: [225.0, 155.0], hasPointer: true },
  ladakh: { anchor: [317.1, 130.5], badge: [385.0, 105.0], hasPointer: true },
  uttarakhand: { anchor: [401.2, 260.3], badge: [458.0, 240.0], hasPointer: true },
  'himachal-pradesh': { anchor: [343.7, 206.0], badge: [396.0, 190.0], hasPointer: true },
  'arunachal-pradesh': { anchor: [826.1, 321.6], badge: [875.0, 290.0], hasPointer: true },
  manipur: { anchor: [796.6, 412.0], badge: [846.0, 412.0], hasPointer: true },
  tripura: { anchor: [738.4, 443.5], badge: [700.0, 488.0], hasPointer: true },
  meghalaya: { anchor: [727.3, 388.0], badge: [727.3, 388.0], hasPointer: false },
  goa: { anchor: [264.1, 683.5], badge: [215.0, 690.0], hasPointer: true },
  'dadra-daman-diu': { anchor: [229.8, 541.1], badge: [170.0, 545.0], hasPointer: true },
  sikkim: { anchor: [652.1, 330.7], badge: [652.1, 292.0], hasPointer: true },
  nagaland: { anchor: [810.7, 374.5], badge: [858.0, 370.0], hasPointer: true },
  mizoram: { anchor: [768.5, 455.2], badge: [812.0, 470.0], hasPointer: true },
  puducherry: { anchor: [415.7, 788.0], badge: [465.0, 788.0], hasPointer: true },
  chandigarh: { anchor: [338.3, 239.0], badge: [280.0, 252.0], hasPointer: true },
  'andaman-nicobar': { anchor: [771.5, 791.8], badge: [825.0, 791.8], hasPointer: true },
  lakshadweep: { anchor: [237.8, 831.5], badge: [180.0, 831.5], hasPointer: true },
};

interface IndiaAtlasMapProps {
  mps: MPRecord[];
  initialStateId?: string;
  initialConstituencySlug?: string;
  onSelectMP?: (slug: string) => void;
  className?: string;
}

export const IndiaAtlasMap: React.FC<IndiaAtlasMapProps> = ({
  mps,
  initialStateId,
  initialConstituencySlug,
  onSelectMP,
  className = '',
}) => {
  const { isDark } = useTheme();
  const activeRegions = isDark ? REGIONS_DARK : REGIONS_LIGHT;

  const t = useMessages(mapMessages);
  const regionShortName = (id: string) => t.regionShortName[id as keyof typeof t.regionShortName] ?? activeRegions[id]?.shortName;
  const regionName = (id: string) => t.regionName[id as keyof typeof t.regionName] ?? activeRegions[id]?.name;
  // A Delhi constituency implies the Delhi state view.
  const impliedStateId = (stateId?: string, slug?: string) =>
    stateId || (slug && DELHI_CONSTITUENCIES.some((c) => c.slug === slug) ? 'delhi' : undefined);

  const [selectedStateId, setSelectedStateId] = useState<string | null>(
    impliedStateId(initialStateId, initialConstituencySlug) || null
  );
  const [selectedConstituencySlug, setSelectedConstituencySlug] = useState<string | null>(
    initialConstituencySlug || null
  );
  const [hoveredState, setHoveredState] = useState<RealStateData | null>(null);
  const [hoveredConstituency, setHoveredConstituency] = useState<ConstituencyGeoData | null>(null);
  const [activeRegionFilter, setActiveRegionFilter] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Default viewBox framing the 100% authentic bounds of India
  const NATIONAL_VIEWBOX = { x: 90, y: 35, w: 820, h: 910 };

  /** The SVG viewBox that frames a state, or null for an unknown state. */
  const viewBoxForState = (stateId: string | null | undefined) => {
    const st = stateId ? REAL_INDIA_STATES.find((s) => s.id === stateId) : undefined;
    if (!st) return null;
    if (st.id === 'delhi') {
      // Balanced National Capital Region (NCR) framing (centered at Delhi [347.8, 299.9])
      return { x: 308, y: 262, w: 78, h: 76 };
    }
    const [cx, cy] = st.centroid;
    const span = st.seats > 30 ? 220 : st.seats > 10 ? 150 : 100;
    return { x: Math.max(50, cx - span / 2), y: Math.max(30, cy - span / 2), w: span, h: span };
  };

  const [viewBox, setViewBox] = useState<{ x: number; y: number; w: number; h: number }>(
    () => viewBoxForState(selectedStateId) ?? NATIONAL_VIEWBOX
  );

  const svgRef = useRef<SVGSVGElement>(null);

  // When the parent changes the requested state/constituency, follow it
  // (React's "adjust state while rendering" pattern instead of an effect).
  const [requested, setRequested] = useState({ initialStateId, initialConstituencySlug });
  if (requested.initialStateId !== initialStateId || requested.initialConstituencySlug !== initialConstituencySlug) {
    setRequested({ initialStateId, initialConstituencySlug });
    const stateId = impliedStateId(initialStateId, initialConstituencySlug);
    if (stateId) {
      setSelectedStateId(stateId);
      setViewBox(viewBoxForState(stateId) ?? NATIONAL_VIEWBOX);
    }
    setSelectedConstituencySlug(initialConstituencySlug || null);
  }

  const handleStateSelect = (stateId: string) => {
    setSelectedStateId(stateId);
    setSelectedConstituencySlug(null);
    const box = viewBoxForState(stateId);
    if (box) setViewBox(box);
  };

  const handleResetToNational = () => {
    setSelectedStateId(null);
    setSelectedConstituencySlug(null);
    setActiveRegionFilter(null);
    setViewBox(NATIONAL_VIEWBOX);
  };

  const handleZoomIn = () => {
    setViewBox((prev) => ({
      x: prev.x + prev.w * 0.1,
      y: prev.y + prev.h * 0.1,
      w: prev.w * 0.8,
      h: prev.h * 0.8,
    }));
  };

  const handleZoomOut = () => {
    setViewBox((prev) => ({
      x: Math.max(0, prev.x - prev.w * 0.125),
      y: Math.max(0, prev.y - prev.h * 0.125),
      w: Math.min(1000, prev.w * 1.25),
      h: Math.min(1000, prev.h * 1.25),
    }));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const selectedStateObj = selectedStateId
    ? REAL_INDIA_STATES.find((s) => s.id === selectedStateId)
    : null;

  const selectedConstituencyObj = selectedConstituencySlug
    ? DELHI_CONSTITUENCIES.find((c) => c.slug === selectedConstituencySlug)
    : null;

  const isDelhiZoomed = selectedStateId === 'delhi';

  return (
    <div
      className={`relative isolate w-full rounded-3xl bg-stone-50 dark:bg-[#070b10] border border-stone-200 dark:border-[#232c37] overflow-hidden shadow-2xl flex flex-col transition-colors duration-200 ${className}`}
      style={{ minHeight: '660px' }}
      onMouseMove={handleMouseMove}
    >
      {/* Top Map Context & Info Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-white/95 dark:bg-[#10151d]/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-stone-200 dark:border-[#27323f] text-xs shadow-md dark:shadow-xl">
        <Compass className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-pulse" />
        <span className="font-bold text-stone-900 dark:text-white font-['Outfit']">
          {selectedStateObj ? selectedStateObj.name : t.nationalTitle}
        </span>
        <span className="text-[11px] font-semibold text-cyan-800 dark:text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-100/80 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-800">
          {selectedStateObj ? t.stateSeats(selectedStateObj.seats) : t.nationalSeats}
        </span>
        {!selectedStateObj && (
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-amber-800 dark:text-amber-300 font-medium px-2 py-0.5 rounded-full bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/80">
            <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>{t.atlasBadge}</span>
          </span>
        )}
      </div>

      {/* Floating Map Controls */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleResetToNational}
        selectedState={selectedStateId}
        onBackToNational={handleResetToNational}
      />

      {/* Side Information Panel (when a state is clicked) */}
      {selectedStateObj && (
        <div className="absolute left-4 bottom-4 top-16 z-20 w-80 sm:w-96 hidden md:block">
          <StateInfoPanel
            state={{
              id: selectedStateObj.id,
              name: selectedStateObj.name,
              code: selectedStateObj.code,
              type: selectedStateObj.id === 'delhi' || selectedStateObj.seats <= 1 ? 'ut' : 'state',
              seats: selectedStateObj.seats,
              coveredRecords: coveredCount(mps, selectedStateObj.id),
              capital: selectedStateObj.name,
              centroid: selectedStateObj.centroid,
              bounds: [[68, 6], [97, 37]],
              path: selectedStateObj.path,
            }}
            mps={mps}
            selectedConstituencySlug={selectedConstituencySlug}
            onSelectConstituency={(slug) => {
              setSelectedConstituencySlug(slug);
              if (onSelectMP) onSelectMP(slug);
            }}
            onClose={() => setSelectedStateId(null)}
          />
        </div>
      )}

      {/* Floating Constituency Info Popup */}
      {selectedConstituencyObj && (
        <div className="absolute right-4 bottom-4 z-20 hidden sm:block">
          <ConstituencyInfoPanel
            constituency={selectedConstituencyObj}
            onClose={() => setSelectedConstituencySlug(null)}
          />
        </div>
      )}

      {/* Interactive Vector Geospatial Map (SVG) */}
      <div className="relative w-full h-[620px] flex items-center justify-center p-2">
        <svg
          ref={svgRef}
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          className="w-full h-full cursor-grab active:cursor-grabbing transition-all duration-700 ease-out select-none"
        >
          {/* Subtle grid pattern background & filters */}
          <defs>
            <pattern id="grid-dark" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#121820" strokeWidth="0.8" />
            </pattern>
            <pattern id="grid-light" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* Opaque SVG canvas background for crisp rendering */}
          <rect width="1000" height="1000" fill={isDark ? '#070b10' : '#f8fafc'} />
          <rect width="1000" height="1000" fill={isDark ? 'url(#grid-dark)' : 'url(#grid-light)'} />

          {/* ============================================================= */}
          {/* Layer 1: Authentic Real India State Geographic Boundaries     */}
          {/* ============================================================= */}
          <g id="real-states-layer">
            {REAL_INDIA_STATES.map((state) => {
              const isSelected = selectedStateId === state.id;
              const isHovered = hoveredState?.id === state.id;
              const isDelhi = state.id === 'delhi';
              const region = activeRegions[state.region] || activeRegions.north;

              const isDimmed = activeRegionFilter && activeRegionFilter !== state.region && !isSelected && !isHovered;

              let fill = region.fill;
              let stroke = region.stroke;
              let strokeWidth = '0.9';
              let opacity = isDimmed ? 0.35 : 1;

              if (isDelhi) {
                fill = region.fill;
                stroke = region.stroke;
                strokeWidth = '2';
              }

              if (isSelected) {
                fill = isDark ? '#3b2f15' : '#fef3c7';
                stroke = isDark ? '#F5AA27' : '#d97706';
                strokeWidth = '2.4';
                opacity = 1;
              } else if (isHovered) {
                fill = region.hoverFill;
                stroke = isDark ? '#FFFFFF' : '#0f172a';
                strokeWidth = '2';
                opacity = 1;
              }

              return (
                <path
                  key={state.id}
                  d={state.path}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={opacity}
                  className="transition-all duration-200 cursor-pointer"
                  onClick={() => handleStateSelect(state.id)}
                  onMouseEnter={() => setHoveredState(state)}
                  onMouseLeave={() => setHoveredState(null)}
                />
              );
            })}
          </g>

          {/* ============================================================= */}
          {/* Layer 2: Delhi Constituency Boundaries (When zoomed into Delhi) */}
          {/* ============================================================= */}
          {isDelhiZoomed && (
            <g id="delhi-constituencies-layer" className="animate-in fade-in duration-300">
              {DELHI_CONSTITUENCIES.map((constituency) => {
                const isSelected = selectedConstituencySlug === constituency.slug;
                const isHovered = hoveredConstituency?.slug === constituency.slug;

                return (
                  <path
                    key={constituency.slug}
                    d={constituency.path}
                    fill={
                      isSelected
                        ? (isDark ? '#F5AA27' : '#d97706')
                        : isHovered
                        ? (isDark ? '#38BDF8' : '#0284c7')
                        : (isDark ? '#083344' : '#e0f2fe')
                    }
                    fillOpacity={isSelected ? 0.85 : isHovered ? 0.75 : (isDark ? 0.6 : 0.8)}
                    stroke={
                      isSelected
                        ? (isDark ? '#F5AA27' : '#b45309')
                        : isHovered
                        ? (isDark ? '#38BDF8' : '#0369a1')
                        : (isDark ? '#22D3EE' : '#0284c7')
                    }
                    strokeWidth={isSelected ? '0.3' : '0.15'}
                    strokeDasharray={isSelected ? 'none' : '0.4,0.2'}
                    className="transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      setSelectedConstituencySlug(constituency.slug);
                      if (onSelectMP) onSelectMP(constituency.slug);
                    }}
                    onMouseEnter={() => setHoveredConstituency(constituency)}
                    onMouseLeave={() => setHoveredConstituency(null)}
                  />
                );
              })}
            </g>
          )}

          {/* ============================================================= */}
          {/* Layer 3: Pointers & Number Badges Pointing to Real States     */}
          {/* ============================================================= */}
          <g id="numbers-pointer-layer">
            {REAL_INDIA_STATES.map((state) => {
              if (isDelhiZoomed && state.id !== 'delhi') return null;

              const pointer = REAL_STATE_POINTERS[state.id];
              if (!pointer) return null;

              const isSelected = selectedStateId === state.id;
              const isHovered = hoveredState?.id === state.id;
              const isDelhi = state.id === 'delhi';
              const region = activeRegions[state.region] || activeRegions.north;
              const isDimmed = activeRegionFilter && activeRegionFilter !== state.region && !isSelected && !isHovered;

              const opacity = isDimmed ? 0.35 : 1;

              // -------------------------------------------------------------
              // A. SPECIAL DELHI BEACON & CALLOUT BADGE
              // -------------------------------------------------------------
              if (isDelhi) {
                return (
                  <g
                    key={`pointer-${state.id}`}
                    opacity={opacity}
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => handleStateSelect(state.id)}
                    onMouseEnter={() => setHoveredState(state)}
                    onMouseLeave={() => setHoveredState(null)}
                  >
                    {/* Pulsing ring beacon on Delhi centroid */}
                    <circle cx={pointer.anchor[0]} cy={pointer.anchor[1]} r="4.5" fill={isDark ? '#06B6D4' : '#0891b2'} />
                    <circle
                      cx={pointer.anchor[0]}
                      cy={pointer.anchor[1]}
                      r="10"
                      fill="none"
                      stroke={isDark ? '#22D3EE' : '#06b6d4'}
                      strokeWidth="1.8"
                      opacity="0.8"
                    />

                    {/* Connecting pointer line */}
                    {!isDelhiZoomed && (
                      <>
                        <line
                          x1={pointer.anchor[0]}
                          y1={pointer.anchor[1]}
                          x2={pointer.badge[0] - 32}
                          y2={pointer.badge[1]}
                          stroke={isDark ? '#22D3EE' : '#0891b2'}
                          strokeWidth="2"
                        />
                        {/* Callout Pill Badge for Delhi */}
                        <g transform={`translate(${pointer.badge[0]}, ${pointer.badge[1]})`}>
                          <rect
                            x="-32"
                            y="-13"
                            width="64"
                            height="26"
                            rx="8"
                            fill={
                              isHovered || isSelected
                                ? (isDark ? '#06B6D4' : '#0891b2')
                                : (isDark ? '#083344' : '#ffffff')
                            }
                            stroke={isDark ? '#22D3EE' : '#0891b2'}
                            strokeWidth={isHovered ? '2.5' : '1.8'}
                            filter={isDark ? 'drop-shadow(0 4px 10px rgba(6,182,212,0.5))' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))'}
                          />
                          <text
                            textAnchor="middle"
                            y="-2"
                            fill={
                              isHovered || isSelected
                                ? '#FFFFFF'
                                : (isDark ? '#E0F2FE' : '#0e7490')
                            }
                            fontSize="7.5"
                            fontWeight="800"
                            fontFamily="Outfit, sans-serif"
                            letterSpacing="0.4"
                          >
                            {t.delhiBadgeSeats}
                          </text>
                          <text
                            textAnchor="middle"
                            y="8"
                            fill={
                              isHovered || isSelected
                                ? '#FFFFFF'
                                : (isDark ? '#38BDF8' : '#0284c7')
                            }
                            fontSize="8"
                            fontWeight="800"
                            fontFamily="Outfit, sans-serif"
                          >
                            {t.delhiBadgeLive}
                          </text>
                        </g>
                      </>
                    )}
                  </g>
                );
              }

              // -------------------------------------------------------------
              // B. STATES WITH POINTER LINES (e.g. Punjab, Kerala, Haryana)
              // -------------------------------------------------------------
              if (pointer.hasPointer) {
                return (
                  <g
                    key={`pointer-${state.id}`}
                    opacity={opacity}
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => handleStateSelect(state.id)}
                    onMouseEnter={() => setHoveredState(state)}
                    onMouseLeave={() => setHoveredState(null)}
                  >
                    {/* Anchor dot on state */}
                    <circle
                      cx={pointer.anchor[0]}
                      cy={pointer.anchor[1]}
                      r={isHovered ? 4 : 3}
                      fill={isHovered ? (isDark ? '#FFFFFF' : '#0f172a') : region.color}
                      stroke={isDark ? '#070b10' : '#ffffff'}
                      strokeWidth="1.2"
                    />

                    {/* Connecting leader pointer line */}
                    <line
                      x1={pointer.anchor[0]}
                      y1={pointer.anchor[1]}
                      x2={pointer.badge[0]}
                      y2={pointer.badge[1]}
                      stroke={isHovered ? (isDark ? '#FFFFFF' : '#0f172a') : region.stroke}
                      strokeWidth={isHovered ? 1.8 : 1.2}
                      strokeDasharray="3,2"
                      opacity={isHovered ? 1 : 0.75}
                    />

                    {/* Offset Number Badge */}
                    <g transform={`translate(${pointer.badge[0]}, ${pointer.badge[1]})`}>
                      <rect
                        x="-20"
                        y="-11"
                        width="40"
                        height="22"
                        rx="7"
                        fill={isHovered || isSelected ? region.color : region.badgeBg}
                        fillOpacity={isHovered || isSelected ? 1 : (isDark ? 0.92 : 0.98)}
                        stroke={isHovered || isSelected ? (isDark ? '#FFFFFF' : '#0f172a') : region.stroke}
                        strokeWidth={isHovered || isSelected ? 2 : 1.2}
                        filter={isDark ? 'drop-shadow(0 3px 6px rgba(0,0,0,0.7))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))'}
                      />
                      <text
                        textAnchor="middle"
                        y="-1.5"
                        fill={isHovered || isSelected ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748b')}
                        fontSize="6.5"
                        fontWeight="700"
                        fontFamily="Outfit, sans-serif"
                      >
                        {state.code}
                      </text>
                      <text
                        textAnchor="middle"
                        y="7.5"
                        fill={isHovered || isSelected ? '#FFFFFF' : region.color}
                        fontSize="9.5"
                        fontWeight="800"
                        fontFamily="Outfit, sans-serif"
                      >
                        {state.seats}
                      </text>
                    </g>
                  </g>
                );
              }

              // -------------------------------------------------------------
              // C. LARGE STATES (Direct centered number pill badge)
              // -------------------------------------------------------------
              return (
                <g
                  key={`pointer-${state.id}`}
                  transform={`translate(${pointer.badge[0]}, ${pointer.badge[1]})`}
                  opacity={opacity}
                  className="cursor-pointer transition-transform duration-200"
                  onClick={() => handleStateSelect(state.id)}
                  onMouseEnter={() => setHoveredState(state)}
                  onMouseLeave={() => setHoveredState(null)}
                >
                  {/* Number Pill Badge */}
                  <rect
                    x="-23"
                    y="-13"
                    width="46"
                    height="26"
                    rx="8"
                    fill={isHovered || isSelected ? region.color : region.badgeBg}
                    fillOpacity={isHovered || isSelected ? 1 : (isDark ? 0.88 : 0.98)}
                    stroke={isHovered || isSelected ? (isDark ? '#FFFFFF' : '#0f172a') : region.stroke}
                    strokeWidth={isHovered || isSelected ? 2 : 1.2}
                    filter={isDark ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.7))' : 'drop-shadow(0 2px 5px rgba(0,0,0,0.12))'}
                  />
                  {/* State Code Abbreviation */}
                  <text
                    textAnchor="middle"
                    y="-2"
                    fill={isHovered || isSelected ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748b')}
                    fontSize="7"
                    fontWeight="700"
                    fontFamily="Outfit, sans-serif"
                    letterSpacing="0.4"
                  >
                    {state.code}
                  </text>
                  {/* State LS Seat Count (Prominent Number) */}
                  <text
                    textAnchor="middle"
                    y="8.5"
                    fill={isHovered || isSelected ? '#FFFFFF' : region.color}
                    fontSize="10.5"
                    fontWeight="800"
                    fontFamily="Outfit, sans-serif"
                  >
                    {state.seats}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* ================================================================= */}
      {/* Bottom Region Filter / Legend Bar */}
      {/* ================================================================= */}
      <div className="px-4 py-3 bg-stone-100/90 dark:bg-[#0a0f16] border-t border-stone-200 dark:border-[#232c37] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-stone-600 dark:text-slate-400 uppercase tracking-wider mr-1">
            {t.regionsLabel}
          </span>

          {/* All India Reset Pill */}
          <button
            onClick={() => {
              setActiveRegionFilter(null);
              handleResetToNational();
            }}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all border ${
              activeRegionFilter === null
                ? 'bg-stone-900 text-white border-stone-900 dark:bg-slate-800 dark:border-slate-600 shadow-sm'
                : 'bg-white text-stone-700 border-stone-300 dark:bg-[#151c24] dark:text-slate-400 dark:border-[#25303d] hover:text-stone-950 dark:hover:text-white'
            }`}
          >
            {t.allIndia}
          </button>

          {/* Regional Filter Pills */}
          {Object.values(activeRegions).map((reg) => {
            const isActive = activeRegionFilter === reg.id;
            return (
              <button
                key={reg.id}
                onClick={() => {
                  setActiveRegionFilter(isActive ? null : reg.id);
                  if (reg.id === 'delhi') {
                    handleStateSelect('delhi');
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all border ${
                  isActive
                    ? 'text-white border-white shadow-md'
                    : 'bg-white text-stone-700 border-stone-300 dark:bg-[#131922] dark:text-slate-300 dark:border-[#263240] hover:border-stone-400 dark:hover:border-slate-500'
                }`}
                style={{
                  backgroundColor: isActive ? reg.color : undefined,
                  borderColor: isActive ? (isDark ? '#FFFFFF' : reg.color) : undefined,
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
                  style={{ backgroundColor: reg.color }}
                />
                <span>{regionShortName(reg.id)}</span>
                <span className="text-[10px] opacity-80">({reg.totalSeats})</span>
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-stone-500 dark:text-slate-400 hidden lg:block">
          {t.atlasClickHint}
        </div>
      </div>

      {/* ================================================================= */}
      {/* State Hover Tooltip */}
      {/* ================================================================= */}
      {hoveredState && tooltipPos && !isDelhiZoomed && (
        <div
          className="absolute z-30 pointer-events-none bg-white/95 dark:bg-[#10151d]/95 backdrop-blur-md text-stone-900 dark:text-white p-3.5 rounded-2xl border shadow-xl dark:shadow-2xl text-xs -translate-x-1/2 -translate-y-full mb-3 font-sans"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            borderColor: activeRegions[hoveredState.region].color,
          }}
        >
          <div className="flex items-center justify-between gap-3 border-b border-stone-200 dark:border-slate-700 pb-1.5 mb-2">
            <div>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 border border-stone-200 dark:border-slate-700">
                {hoveredState.code}
              </span>
              <span className="font-bold text-stone-900 dark:text-white font-['Outfit'] text-sm ml-1.5">
                {hoveredState.name}
              </span>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
              style={{
                backgroundColor: activeRegions[hoveredState.region].color,
              }}
            >
              {regionShortName(hoveredState.region)}
            </span>
          </div>

          <div className="text-[11px] text-stone-600 dark:text-slate-300 space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-stone-500 dark:text-slate-400">{t.tooltipSeats}</span>
              <strong className="text-stone-900 dark:text-white text-xs">{hoveredState.seats}</strong>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-stone-500 dark:text-slate-400">{t.tooltipRegion}</span>
              <span className="text-stone-800 dark:text-slate-200">{regionName(hoveredState.region)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-stone-500 dark:text-slate-400">{t.tooltipRecords}</span>
              <strong className="text-cyan-600 dark:text-cyan-400">{coverageText(coveredCount(mps, hoveredState.id), hoveredState.seats)}</strong>
            </div>
          </div>

          <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold block mt-2 pt-1 border-t border-stone-200 dark:border-slate-800/80">
            {hoveredState.id === 'delhi' ? t.tooltipZoomDelhi : t.tooltipInspectState}
          </span>
        </div>
      )}

      {/* ================================================================= */}
      {/* Delhi Constituency Hover Tooltip */}
      {/* ================================================================= */}
      {hoveredConstituency && tooltipPos && isDelhiZoomed && (
        <div
          className="absolute z-30 pointer-events-none bg-white/95 dark:bg-[#10151d]/95 backdrop-blur-md text-stone-900 dark:text-white p-3 rounded-2xl border border-cyan-500 dark:border-cyan-400 shadow-xl dark:shadow-2xl text-xs -translate-x-1/2 -translate-y-full mb-3 font-sans"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="font-bold text-stone-900 dark:text-white font-['Outfit'] text-sm">
            {hoveredConstituency.name}
          </div>
          <div className="text-[11px] text-stone-600 dark:text-slate-300 mt-1 space-y-0.5">
            <div>{t.tooltipSittingMP} <strong className="text-stone-900 dark:text-white">{hoveredConstituency.sittingMP}</strong> ({hoveredConstituency.party})</div>
            {hoveredConstituency.attendancePct && (
              <div>{t.tooltipAttendance} <strong className="text-emerald-600 dark:text-emerald-400">{hoveredConstituency.attendancePct}%</strong></div>
            )}
            <div>{t.tooltipQuestions} <strong className="text-cyan-600 dark:text-cyan-400">{hoveredConstituency.questions}</strong> | {t.tooltipDebates} <strong className="text-amber-600 dark:text-amber-400">{hoveredConstituency.debates}</strong></div>
          </div>
          <span className="text-[9px] text-cyan-600 dark:text-cyan-400 font-semibold block mt-1">
            {t.tooltipViewReportCard}
          </span>
        </div>
      )}
    </div>
  );
};
