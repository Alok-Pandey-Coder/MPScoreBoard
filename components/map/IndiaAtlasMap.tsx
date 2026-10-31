'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  INDIA_STATES,
  DELHI_CONSTITUENCIES,
  StateGeoData,
  ConstituencyGeoData,
} from '@/lib/indiaGeoData';
import { MPRecord } from '@/types/mp';
import { MapControls } from './MapControls';
import { StateInfoPanel } from './StateInfoPanel';
import { ConstituencyInfoPanel } from './ConstituencyInfoPanel';
import { Compass } from 'lucide-react';

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
  const [selectedStateId, setSelectedStateId] = useState<string | null>(initialStateId || null);
  const [selectedConstituencySlug, setSelectedConstituencySlug] = useState<string | null>(
    initialConstituencySlug || null
  );
  const [hoveredState, setHoveredState] = useState<StateGeoData | null>(null);
  const [hoveredConstituency, setHoveredConstituency] = useState<ConstituencyGeoData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const [viewBox, setViewBox] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 100,
    y: 50,
    w: 750,
    h: 850,
  });

  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (initialStateId) {
      handleStateSelect(initialStateId);
    }
  }, [initialStateId]);

  useEffect(() => {
    if (initialConstituencySlug) {
      setSelectedConstituencySlug(initialConstituencySlug);
      const isDelhi = DELHI_CONSTITUENCIES.some((c) => c.slug === initialConstituencySlug);
      if (isDelhi) {
        handleStateSelect('delhi');
      }
    }
  }, [initialConstituencySlug]);

  const handleStateSelect = (stateId: string) => {
    setSelectedStateId(stateId);
    setSelectedConstituencySlug(null);

    if (stateId === 'delhi') {
      setViewBox({ x: 320, y: 260, w: 120, h: 120 });
    } else {
      if (stateId === 'uttar-pradesh') {
        setViewBox({ x: 350, y: 250, w: 220, h: 180 });
      } else if (stateId === 'maharashtra') {
        setViewBox({ x: 230, y: 460, w: 230, h: 190 });
      } else if (stateId === 'kerala') {
        setViewBox({ x: 310, y: 760, w: 90, h: 150 });
      } else if (stateId === 'karnataka') {
        setViewBox({ x: 280, y: 580, w: 140, h: 200 });
      } else {
        setViewBox({ x: 150, y: 150, w: 550, h: 600 });
      }
    }
  };

  const handleResetToNational = () => {
    setSelectedStateId(null);
    setSelectedConstituencySlug(null);
    setViewBox({ x: 100, y: 50, w: 750, h: 850 });
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
    ? INDIA_STATES.find((s) => s.id === selectedStateId)
    : null;

  const selectedConstituencyObj = selectedConstituencySlug
    ? DELHI_CONSTITUENCIES.find((c) => c.slug === selectedConstituencySlug)
    : null;

  const isDelhiZoomed = selectedStateId === 'delhi';

  return (
    <div
      className={`relative w-full rounded-3xl bg-[#0c1015] border border-[#232c37] overflow-hidden shadow-2xl flex flex-col ${className}`}
      style={{ minHeight: '620px' }}
      onMouseMove={handleMouseMove}
    >
      {/* Top Map Context Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[#171e27]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#27323f] text-xs shadow-md">
        <Compass className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span className="font-bold text-white font-['Outfit']">
          {selectedStateObj ? selectedStateObj.name : 'Republic of India — 18th Lok Sabha'}
        </span>
        <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-[#1a222d] border border-[#2b3746]">
          {selectedStateObj ? `${selectedStateObj.seats} LS Seats` : '543 Parliamentary Seats'}
        </span>
      </div>

      {/* Floating Map Controls */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleResetToNational}
        selectedState={selectedStateId}
        onBackToNational={handleResetToNational}
      />

      {/* Side Information Panel */}
      {selectedStateObj && (
        <div className="absolute left-4 bottom-4 top-16 z-20 w-80 sm:w-96 hidden md:block">
          <StateInfoPanel
            state={selectedStateObj}
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
      <div className="relative w-full h-[600px] flex items-center justify-center p-2">
        <svg
          ref={svgRef}
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          className="w-full h-full cursor-grab active:cursor-grabbing transition-all duration-700 ease-out select-none"
        >
          {/* Subtle grid pattern background */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#171d25"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="1000" height="1000" fill="url(#grid)" />

          {/* All-India States Boundary Layer */}
          <g id="states-layer">
            {INDIA_STATES.map((state) => {
              const isSelected = selectedStateId === state.id;
              const isHovered = hoveredState?.id === state.id;
              const isDelhi = state.id === 'delhi';

              let fill = '#161c24';
              let stroke = '#2a3543';
              let strokeWidth = '1.2';

              if (isDelhi) {
                fill = '#152433';
                stroke = '#06B6D4';
                strokeWidth = '2';
              }

              if (isSelected) {
                fill = '#2c2518';
                stroke = '#F5AA27';
                strokeWidth = '2.5';
              } else if (isHovered) {
                fill = '#1d2733';
                stroke = '#38BDF8';
                strokeWidth = '2';
              }

              return (
                <path
                  key={state.id}
                  d={state.path}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  className="transition-all duration-200 cursor-pointer"
                  onClick={() => handleStateSelect(state.id)}
                  onMouseEnter={() => setHoveredState(state)}
                  onMouseLeave={() => setHoveredState(null)}
                />
              );
            })}
          </g>

          {/* Delhi Constituency Boundaries Layer */}
          {isDelhiZoomed && (
            <g id="delhi-constituencies-layer" className="animate-in fade-in duration-300">
              {DELHI_CONSTITUENCIES.map((constituency) => {
                const isSelected = selectedConstituencySlug === constituency.slug;
                const isHovered = hoveredConstituency?.slug === constituency.slug;

                return (
                  <path
                    key={constituency.slug}
                    d={constituency.path}
                    fill={isSelected ? '#F5AA27' : isHovered ? '#38BDF8' : '#1e2733'}
                    fillOpacity={isSelected ? 0.8 : isHovered ? 0.65 : 0.5}
                    stroke={isSelected ? '#F5AA27' : isHovered ? '#38BDF8' : '#38BDF8'}
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                    strokeDasharray={isSelected ? 'none' : '4,2'}
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

          {/* Labels & Seat Indicators Layer */}
          <g id="labels-layer" pointerEvents="none">
            {INDIA_STATES.map((state) => {
              if (isDelhiZoomed && state.id !== 'delhi') return null;

              const posMap: Record<string, [number, number]> = {
                delhi: [362, 301],
                'uttar-pradesh': [450, 330],
                maharashtra: [330, 530],
                rajasthan: [270, 330],
                'madhya-pradesh': [390, 430],
                gujarat: [220, 450],
                karnataka: [340, 660],
                'tamil-nadu': [380, 810],
                kerala: [345, 830],
                'andhra-pradesh': [420, 670],
                telangana: [405, 570],
                odisha: [510, 500],
                'west-bengal': [590, 430],
                bihar: [535, 370],
                punjab: [315, 230],
                haryana: [345, 270],
                'jammu-kashmir': [300, 140],
                ladakh: [360, 110],
                assam: [670, 340],
              };

              const coords = posMap[state.id];
              if (!coords) return null;

              const isSelected = selectedStateId === state.id;

              return (
                <g key={`label-${state.id}`} transform={`translate(${coords[0]}, ${coords[1]})`}>
                  <text
                    textAnchor="middle"
                    fill={isSelected ? '#F5AA27' : '#F3F4F6'}
                    fontSize={isDelhiZoomed ? '4' : '11'}
                    fontWeight="700"
                    fontFamily="Outfit, sans-serif"
                    className="drop-shadow-sm select-none"
                  >
                    {state.code}
                  </text>
                  <text
                    textAnchor="middle"
                    y={isDelhiZoomed ? '4' : '10'}
                    fill={isSelected ? '#F5AA27' : '#9BAABD'}
                    fontSize={isDelhiZoomed ? '3' : '8'}
                    fontWeight="600"
                    className="select-none"
                  >
                    {state.seats}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Hover Tooltip */}
      {hoveredState && tooltipPos && !isDelhiZoomed && (
        <div
          className="absolute z-30 pointer-events-none bg-[#171e27] text-white p-3 rounded-xl border border-cyan-400 shadow-xl text-xs -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="font-bold text-white font-['Outfit'] text-sm">
            {hoveredState.name}
          </div>
          <div className="text-[11px] text-slate-300 mt-0.5 space-y-0.5">
            <div>Lok Sabha Seats: <strong className="text-amber-400">{hoveredState.seats}</strong></div>
            <div>Active Records: <strong className="text-cyan-400">{hoveredState.coveredRecords}</strong></div>
            {hoveredState.avgAttendance && (
              <div>State Avg Attendance: <strong>{hoveredState.avgAttendance}%</strong></div>
            )}
          </div>
          <span className="text-[9px] text-cyan-400 font-semibold block mt-1">
            Click to zoom into state →
          </span>
        </div>
      )}

      {/* Constituency Hover Tooltip */}
      {hoveredConstituency && tooltipPos && isDelhiZoomed && (
        <div
          className="absolute z-30 pointer-events-none bg-[#171e27] text-white p-3 rounded-xl border border-amber-400 shadow-xl text-xs -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="font-bold text-white font-['Outfit'] text-sm">
            {hoveredConstituency.name}
          </div>
          <div className="text-[11px] text-slate-300 mt-0.5">
            <div>MP: <strong className="text-white">{hoveredConstituency.sittingMP}</strong></div>
            <div>Party: <strong className="text-cyan-400">{hoveredConstituency.party}</strong></div>
          </div>
          <span className="text-[9px] text-amber-400 font-semibold block mt-1">
            Click to view constituency card →
          </span>
        </div>
      )}
    </div>
  );
};

