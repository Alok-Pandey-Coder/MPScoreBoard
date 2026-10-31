'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Info,
  PieChart as PieChartIcon,
  CircleDot,
  LayoutGrid,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { MPRecord } from '@/types/mp';

interface ComparisonSectionProps {
  mp: MPRecord;
}

// Color tokens adhering to UI/UX Pro Max and WCAG AA guidelines
const COLORS = {
  mp: {
    base: '#F59E0B',      // Amber 500
    hover: '#D97706',     // Amber 600
    track: 'rgba(245, 158, 11, 0.12)',
    label: 'Member of Parliament',
  },
  state: {
    base: '#38BDF8',      // Sky 400
    hover: '#0284C7',     // Sky 600
    track: 'rgba(56, 189, 248, 0.12)',
    label: 'Delhi State Avg',
  },
  national: {
    base: '#94A3B8',      // Slate 400
    hover: '#64748B',     // Slate 500
    track: 'rgba(148, 163, 184, 0.12)',
    label: 'National Avg',
  },
};

interface MetricItem {
  id: string;
  title: string;
  subtitle: string;
  mpVal: number | null | undefined;
  stateVal: number | null | undefined;
  natVal: number | null | undefined;
  type: 'percentage' | 'count';
  maxVal: number;
  unit: string;
}

export const ComparisonSection: React.FC<ComparisonSectionProps> = ({ mp }) => {
  const [viewMode, setViewMode] = useState<'pie' | 'rings' | 'bar'>('pie');
  const [isMounted, setIsMounted] = useState(false);
  const [activePieIndex, setActivePieIndex] = useState<{ [metricId: string]: number | null }>({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (mp.is_minister || mp.performance.status === 'not_applicable') {
    return null;
  }

  const perf = mp.performance;
  const nat = perf.prs_averages?.national;
  const state = perf.prs_averages?.state;

  if (!nat || !state) return null;

  const firstName = mp.name.split(' ')[0] || mp.name;

  const metrics: MetricItem[] = [
    {
      id: 'attendance',
      title: 'Attendance Rate',
      subtitle: 'Official floor sittings attended',
      mpVal: perf.attendance_pct,
      stateVal: state.attendance_pct,
      natVal: nat.attendance_pct,
      type: 'percentage',
      maxVal: 100,
      unit: '%',
    },
    {
      id: 'debates',
      title: 'Debates Participated',
      subtitle: 'Floor & legislative deliberations',
      mpVal: perf.debates,
      stateVal: state.debates,
      natVal: nat.debates,
      type: 'count',
      maxVal: Math.max(perf.debates || 0, state.debates || 0, nat.debates || 0, 35) * 1.15,
      unit: '',
    },
    {
      id: 'questions',
      title: 'Questions Asked',
      subtitle: 'Starred & unstarred parliamentary inquiries',
      mpVal: perf.questions,
      stateVal: state.questions,
      natVal: nat.questions,
      type: 'count',
      maxVal: Math.max(perf.questions || 0, state.questions || 0, nat.questions || 0, 200) * 1.15,
      unit: '',
    },
    {
      id: 'bills',
      title: 'Private Member Bills',
      subtitle: 'Individual legislative sponsorship',
      mpVal: perf.private_member_bills,
      stateVal: state.private_member_bills,
      natVal: nat.private_member_bills,
      type: 'count',
      maxVal: Math.max(perf.private_member_bills || 0, state.private_member_bills || 0, nat.private_member_bills || 0, 4) * 1.25,
      unit: '',
    },
  ];

  // Custom Editorial Tooltip for Recharts Pie Chart
  const CustomPieTooltip = ({ active, payload, unit }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-stone-900/95 dark:bg-[#0B111A]/95 text-white p-2.5 rounded-lg border border-stone-700/80 dark:border-stone-700 shadow-xl text-xs font-mono backdrop-blur-xs min-w-[160px] z-50">
          <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-stone-800">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: data.fill }}
            />
            <span className="font-bold text-stone-200">{data.name}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-stone-400">Value:</span>
            <span className="font-bold text-amber-400">
              {data.actualVal ?? 0}{unit}
            </span>
          </div>
          {data.role && (
            <div className="text-[10px] text-stone-500 mt-1 italic">
              {data.role}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-[#0E1420] rounded-xl p-5 sm:p-7 border border-stone-200/90 dark:border-[#1E2636] shadow-xs transition-colors">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-100 dark:border-[#1A2333]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              BENCHMARK LEDGER
            </span>
            <span className="text-stone-400 dark:text-stone-600">·</span>
            <span className="text-xs font-mono text-stone-500 dark:text-stone-400">18TH LOK SABHA</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 font-sans tracking-tight flex items-center gap-2 mt-0.5">
            <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>Comparative Averages Benchmark</span>
          </h2>
          <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-0.5">
            Benchmarked against state (Delhi, 7 seats) and national 18th Lok Sabha baselines
          </p>
        </div>

        {/* View Mode Switcher: Pie vs Rings vs Bar */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center p-1 rounded-lg bg-stone-100 dark:bg-[#141C28] border border-stone-200 dark:border-[#222E42] text-xs font-mono">
            <button
              onClick={() => setViewMode('pie')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === 'pie'
                  ? 'bg-white dark:bg-stone-100 text-stone-950 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
              title="View Recharts Pie / Donut Charts"
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span>Pie Chart</span>
            </button>
            <button
              onClick={() => setViewMode('rings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === 'rings'
                  ? 'bg-white dark:bg-stone-100 text-stone-950 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
              title="View Recharts Radial Concentric Gauges"
            >
              <CircleDot className="w-3.5 h-3.5" />
              <span>Rings</span>
            </button>
            <button
              onClick={() => setViewMode('bar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === 'bar'
                  ? 'bg-white dark:bg-stone-100 text-stone-950 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
              title="View comparative horizontal ledger bars"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Bars</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Non-ranking Disclaimer */}
      <div className="bg-stone-50 dark:bg-[#121A26] border border-stone-200 dark:border-[#1E293B] rounded-lg p-3 mb-6 flex items-center gap-2.5 text-xs font-mono text-stone-600 dark:text-stone-400">
        <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        <span>These indicators describe activity volume, not qualitative performance or rankings.</span>
      </div>

      {/* VIEW 1: RECHARTS PIE / DONUT BENCHMARK CHARTS (Default) */}
      {viewMode === 'pie' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m) => {
              const mpNum = m.mpVal ?? 0;
              const stateNum = m.stateVal ?? 0;
              const natNum = m.natVal ?? 0;

              const diffVsState = mpNum - stateNum;
              const isHigherThanState = diffVsState > 0;
              const isEqual = Math.abs(diffVsState) < 0.1;

              // Data for Recharts Donut Pie
              // Safe fallback for 0 values to ensure slices are visually represented
              const total = mpNum + stateNum + natNum;
              const safeTotal = total === 0 ? 1 : total;

              const pieData = [
                {
                  name: `${firstName} (MP)`,
                  value: total === 0 ? 1 : Math.max(0.1, mpNum),
                  actualVal: m.mpVal,
                  fill: COLORS.mp.base,
                  role: `${mp.name} (${mp.party})`,
                },
                {
                  name: 'Delhi State Avg',
                  value: total === 0 ? 1 : Math.max(0.1, stateNum),
                  actualVal: m.stateVal,
                  fill: COLORS.state.base,
                  role: 'Delhi 7 Lok Sabha Seats',
                },
                {
                  name: 'National Avg',
                  value: total === 0 ? 1 : Math.max(0.1, natNum),
                  actualVal: m.natVal,
                  fill: COLORS.national.base,
                  role: 'All 543 Parliamentary Seats',
                },
              ];

              return (
                <div
                  key={m.id}
                  className="bg-stone-50/80 dark:bg-[#121A26] rounded-xl p-4 sm:p-5 border border-stone-200/90 dark:border-[#1E293B] hover:border-amber-500/50 transition-all flex flex-col justify-between"
                >
                  {/* Card Title */}
                  <div className="mb-2">
                    <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm font-sans">
                      {m.title}
                    </h3>
                    <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 truncate">
                      {m.subtitle}
                    </p>
                  </div>

                  {/* Recharts Donut Pie Chart */}
                  <div className="relative w-full h-[170px] flex items-center justify-center my-1">
                    {!isMounted ? (
                      <div className="w-24 h-24 rounded-full border-4 border-dashed border-stone-200 dark:border-stone-800 animate-pulse" />
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height={170}>
                          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <Tooltip content={<CustomPieTooltip unit={m.unit} />} />
                            <Pie
                              data={pieData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={46}
                              outerRadius={68}
                              paddingAngle={3}
                              cornerRadius={4}
                              startAngle={90}
                              endAngle={-270}
                              stroke="none"
                              animationDuration={800}
                              onMouseEnter={(_, index) =>
                                setActivePieIndex((prev) => ({ ...prev, [m.id]: index }))
                              }
                              onMouseLeave={() =>
                                setActivePieIndex((prev) => ({ ...prev, [m.id]: null }))
                              }
                            >
                              {pieData.map((entry, index) => (
                                <Cell
                                  key={`cell-${m.id}-${index}`}
                                  fill={
                                    activePieIndex[m.id] === index
                                      ? index === 0
                                        ? COLORS.mp.hover
                                        : index === 1
                                        ? COLORS.state.hover
                                        : COLORS.national.hover
                                      : entry.fill
                                  }
                                  className="transition-colors duration-200 cursor-pointer"
                                />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>

                        {/* Center Metric Display */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                          <span className="text-xl sm:text-2xl font-extrabold font-mono text-stone-900 dark:text-white tabular-nums tracking-tight">
                            {m.mpVal ?? '0'}{m.unit}
                          </span>
                          <span className="text-[10px] font-mono uppercase text-amber-600 dark:text-amber-400 font-bold -mt-0.5">
                            {firstName}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Relative Benchmark Delta Badge */}
                  <div className="my-2 flex items-center justify-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isEqual
                          ? 'bg-stone-200/60 dark:bg-[#1A2536] text-stone-600 dark:text-stone-300'
                          : isHigherThanState
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-stone-200/60 dark:bg-[#1A2536] text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      {isEqual ? (
                        <>
                          <Minus className="w-3 h-3" />
                          <span>Equal to Delhi avg</span>
                        </>
                      ) : isHigherThanState ? (
                        <>
                          <TrendingUp className="w-3 h-3 text-emerald-500" />
                          <span>
                            +{diffVsState.toFixed(m.type === 'percentage' ? 0 : 1)}{m.unit} vs Delhi
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-3 h-3 text-stone-400" />
                          <span>
                            {diffVsState.toFixed(m.type === 'percentage' ? 0 : 1)}{m.unit} vs Delhi
                          </span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Mini-Ledger Breakdown */}
                  <div className="pt-2.5 border-t border-stone-200/70 dark:border-[#1A2536] space-y-1.5 text-[11px] font-mono">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                        <span className="text-stone-700 dark:text-stone-300 font-medium truncate max-w-[90px]">
                          {firstName}
                        </span>
                      </div>
                      <span className="font-bold font-mono text-stone-900 dark:text-white tabular-nums">
                        {m.mpVal ?? 'N/A'}{m.unit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0" />
                        <span className="text-stone-500 dark:text-stone-400">Delhi Avg</span>
                      </div>
                      <span className="font-mono text-stone-700 dark:text-stone-300 tabular-nums">
                        {m.stateVal ?? 'N/A'}{m.unit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                        <span className="text-stone-500 dark:text-stone-400">National Avg</span>
                      </div>
                      <span className="font-mono text-stone-500 dark:text-stone-400 tabular-nums">
                        {m.natVal ?? 'N/A'}{m.unit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Master Pie Chart Legend */}
          <div className="p-3.5 bg-stone-50 dark:bg-[#121A26] rounded-lg border border-stone-200/80 dark:border-[#1E293B] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-stone-600 dark:text-stone-400">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-bold text-stone-800 dark:text-stone-200 uppercase text-[10px] tracking-wider">
                Pie Slices Guide:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span>
                  <strong>{mp.name}</strong> ({mp.party})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-400" />
                <span>
                  <strong>Delhi Baseline</strong> (7 Seats)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-400" />
                <span>
                  <strong>National Baseline</strong> (543 Seats)
                </span>
              </div>
            </div>

            <div className="text-[11px] text-stone-500">
              Powered by Recharts · Source: PRS Legislative Research
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: RECHARTS CONCENTRIC RADIAL RINGS */}
      {viewMode === 'rings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m) => {
              const mpNum = m.mpVal ?? 0;
              const stateNum = m.stateVal ?? 0;
              const natNum = m.natVal ?? 0;

              const diffVsState = mpNum - stateNum;
              const isHigherThanState = diffVsState > 0;
              const isEqual = Math.abs(diffVsState) < 0.1;

              // Data for concentric pies in Recharts
              const mpData = [
                { name: `${firstName} (MP)`, value: mpNum, actualVal: m.mpVal, fill: COLORS.mp.base },
                { name: 'Remaining', value: Math.max(0, m.maxVal - mpNum), fill: COLORS.mp.track },
              ];
              const stateData = [
                { name: 'Delhi Avg', value: stateNum, actualVal: m.stateVal, fill: COLORS.state.base },
                { name: 'Remaining', value: Math.max(0, m.maxVal - stateNum), fill: COLORS.state.track },
              ];
              const natData = [
                { name: 'National Avg', value: natNum, actualVal: m.natVal, fill: COLORS.national.base },
                { name: 'Remaining', value: Math.max(0, m.maxVal - natNum), fill: COLORS.national.track },
              ];

              return (
                <div
                  key={m.id}
                  className="bg-stone-50/80 dark:bg-[#121A26] rounded-xl p-4 sm:p-5 border border-stone-200/90 dark:border-[#1E293B] hover:border-amber-500/50 transition-all flex flex-col justify-between"
                >
                  <div className="mb-2">
                    <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm font-sans">
                      {m.title}
                    </h3>
                    <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 truncate">
                      {m.subtitle}
                    </p>
                  </div>

                  {/* Concentric Multi-Pie in Recharts */}
                  <div className="relative w-full h-[170px] flex items-center justify-center my-1">
                    {!isMounted ? (
                      <div className="w-24 h-24 rounded-full border-4 border-dashed border-stone-200 dark:border-stone-800 animate-pulse" />
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height={170}>
                          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <Tooltip content={<CustomPieTooltip unit={m.unit} />} />
                            {/* Inner Ring: National */}
                            <Pie
                              data={natData}
                              dataKey="value"
                              cx="50%"
                              cy="50%"
                              innerRadius={24}
                              outerRadius={32}
                              startAngle={90}
                              endAngle={-270}
                              stroke="none"
                            >
                              <Cell fill={COLORS.national.base} />
                              <Cell fill={COLORS.national.track} />
                            </Pie>
                            {/* Middle Ring: Delhi State */}
                            <Pie
                              data={stateData}
                              dataKey="value"
                              cx="50%"
                              cy="50%"
                              innerRadius={36}
                              outerRadius={45}
                              startAngle={90}
                              endAngle={-270}
                              stroke="none"
                            >
                              <Cell fill={COLORS.state.base} />
                              <Cell fill={COLORS.state.track} />
                            </Pie>
                            {/* Outer Ring: MP */}
                            <Pie
                              data={mpData}
                              dataKey="value"
                              cx="50%"
                              cy="50%"
                              innerRadius={49}
                              outerRadius={59}
                              startAngle={90}
                              endAngle={-270}
                              stroke="none"
                            >
                              <Cell fill={COLORS.mp.base} />
                              <Cell fill={COLORS.mp.track} />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>

                        {/* Center Metric Display */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                          <span className="text-xl sm:text-2xl font-extrabold font-mono text-stone-900 dark:text-white tabular-nums tracking-tight">
                            {m.mpVal ?? '0'}{m.unit}
                          </span>
                          <span className="text-[10px] font-mono uppercase text-amber-600 dark:text-amber-400 font-bold -mt-0.5">
                            {firstName}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Relative Delta Badge */}
                  <div className="my-2 flex items-center justify-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isEqual
                          ? 'bg-stone-200/60 dark:bg-[#1A2536] text-stone-600 dark:text-stone-300'
                          : isHigherThanState
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-stone-200/60 dark:bg-[#1A2536] text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      {isEqual ? (
                        <>
                          <Minus className="w-3 h-3" />
                          <span>Equal to Delhi avg</span>
                        </>
                      ) : isHigherThanState ? (
                        <>
                          <TrendingUp className="w-3 h-3 text-emerald-500" />
                          <span>
                            +{diffVsState.toFixed(m.type === 'percentage' ? 0 : 1)}{m.unit} vs Delhi
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-3 h-3 text-stone-400" />
                          <span>
                            {diffVsState.toFixed(m.type === 'percentage' ? 0 : 1)}{m.unit} vs Delhi
                          </span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Mini-Ledger Breakdown */}
                  <div className="pt-2.5 border-t border-stone-200/70 dark:border-[#1A2536] space-y-1.5 text-[11px] font-mono">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                        <span className="text-stone-700 dark:text-stone-300 font-medium truncate max-w-[90px]">
                          {firstName}
                        </span>
                      </div>
                      <span className="font-bold font-mono text-stone-900 dark:text-white tabular-nums">
                        {m.mpVal ?? 'N/A'}{m.unit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0" />
                        <span className="text-stone-500 dark:text-stone-400">Delhi Avg</span>
                      </div>
                      <span className="font-mono text-stone-700 dark:text-stone-300 tabular-nums">
                        {m.stateVal ?? 'N/A'}{m.unit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                        <span className="text-stone-500 dark:text-stone-400">National Avg</span>
                      </div>
                      <span className="font-mono text-stone-500 dark:text-stone-400 tabular-nums">
                        {m.natVal ?? 'N/A'}{m.unit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Master Rings Legend */}
          <div className="p-3.5 bg-stone-50 dark:bg-[#121A26] rounded-lg border border-stone-200/80 dark:border-[#1E293B] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-stone-600 dark:text-stone-400">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-bold text-stone-800 dark:text-stone-200 uppercase text-[10px] tracking-wider">
                Gauge Rings Guide:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border-2 border-amber-500 bg-amber-500/20" />
                <span>Outer: <strong>{mp.name}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border-2 border-sky-400 bg-sky-400/20" />
                <span>Middle: <strong>Delhi Avg (7 Seats)</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border-2 border-slate-400 bg-slate-400/20" />
                <span>Inner: <strong>National Avg (543 Seats)</strong></span>
              </div>
            </div>

            <div className="text-[11px] text-stone-500">
              Source: PRS Legislative Research
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: TRADITIONAL COMPARATIVE LEDGER BARS */}
      {viewMode === 'bar' && (
        <div className="space-y-4">
          {metrics.map((m) => {
            const mpW = Math.min(100, Math.max(4, ((m.mpVal || 0) / m.maxVal) * 100));
            const stateW = Math.min(100, Math.max(4, ((m.stateVal || 0) / m.maxVal) * 100));
            const natW = Math.min(100, Math.max(4, ((m.natVal || 0) / m.maxVal) * 100));

            return (
              <div
                key={m.id}
                className="p-4 rounded-lg bg-stone-50/80 dark:bg-[#121A26] border border-stone-200/80 dark:border-[#1E293B]"
              >
                <div className="flex items-center justify-between text-xs font-mono mb-3">
                  <span className="font-bold text-stone-900 dark:text-stone-100">{m.title}</span>
                  <span className="text-stone-500">
                    {mp.name}: <strong className="text-stone-900 dark:text-white">{m.mpVal ?? 'N/A'}{m.unit}</strong>
                  </span>
                </div>

                {/* Multi-Bar Comparison */}
                <div className="space-y-2 text-[11px] font-mono">
                  {/* MP Bar */}
                  <div className="flex items-center gap-3">
                    <span className="w-24 text-stone-600 dark:text-stone-400 truncate">{firstName}</span>
                    <div className="flex-1 bg-stone-200 dark:bg-[#1A2536] rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-amber-600 dark:bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${mpW}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-bold text-stone-900 dark:text-white tabular-nums">
                      {m.mpVal ?? 0}{m.unit}
                    </span>
                  </div>

                  {/* State Avg Bar */}
                  <div className="flex items-center gap-3">
                    <span className="w-24 text-stone-500 dark:text-stone-400">Delhi Avg</span>
                    <div className="flex-1 bg-stone-200 dark:bg-[#1A2536] rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-sky-500 dark:bg-sky-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${stateW}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-stone-600 dark:text-stone-400 tabular-nums">
                      {m.stateVal ?? 0}{m.unit}
                    </span>
                  </div>

                  {/* National Avg Bar */}
                  <div className="flex items-center gap-3">
                    <span className="w-24 text-stone-500 dark:text-stone-400">National Avg</span>
                    <div className="flex-1 bg-stone-200 dark:bg-[#1A2536] rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-stone-400 dark:bg-stone-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${natW}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-stone-600 dark:text-stone-400 tabular-nums">
                      {m.natVal ?? 0}{m.unit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
