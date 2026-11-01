'use client';

import React, { useState, useSyncExternalStore } from 'react';
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
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { MPRecord } from '@/types/mp';
import { useLang, useMessages } from '@/context/LanguageContext';
import { cardMessages } from '@/lib/messages/card';
import { formatDate, formatNumber, formatPct } from '@/lib/formatters';
import { compareWithAverage, describeAgainstAverage } from '@/lib/comparisons';
import { isSmallSample } from '@/lib/stateAverages';
import { localizeParty, localizeState, type Lang } from '@/lib/i18n';

interface ComparisonSectionProps {
  mp: MPRecord;
  /** How many MPs the state average is based on (see lib/stateAverages.ts). */
  stateAverageN?: number;
}

// Neutral colour tokens (WCAG AA on both themes). Colour only tells the series
// apart; it never signals better or worse.
const COLORS = {
  mp: { base: '#F59E0B', hover: '#D97706', track: 'rgba(245, 158, 11, 0.12)' },
  state: { base: '#38BDF8', hover: '#0284C7', track: 'rgba(56, 189, 248, 0.12)' },
  national: { base: '#94A3B8', hover: '#64748B', track: 'rgba(148, 163, 184, 0.12)' },
};
const SERIES_HOVER = [COLORS.mp.hover, COLORS.state.hover, COLORS.national.hover];
const TRACK_EMPTY = 'rgba(148, 163, 184, 0.18)';

type ViewMode = 'pie' | 'rings' | 'bar';
type MetricType = 'percentage' | 'count';

interface MetricItem {
  id: string;
  title: string;
  subtitle: string;
  mpVal: number | null;
  stateVal: number | null;
  natVal: number | null;
  type: MetricType;
  maxVal: number;
}

/** One chart segment. `display` is the formatted figure; track segments have none. */
interface ChartDatum {
  name: string;
  value: number;
  display: string | null;
  fill: string;
  role?: string;
}

interface PieTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: ChartDatum }>;
  valueLabel: string;
}

/** Recharts tooltip body; recharts injects `active` and `payload`. */
function PieTooltip({ active, payload, valueLabel }: PieTooltipProps) {
  const data = active ? payload?.[0]?.payload : undefined;
  if (!data || data.display === null) return null;
  return (
    <div className="bg-stone-900/95 dark:bg-[#0B111A]/95 text-white p-2.5 rounded-lg border border-stone-700/80 dark:border-stone-700 shadow-xl text-xs font-mono backdrop-blur-xs min-w-[160px] z-50">
      <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-stone-800">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: data.fill }} />
        <span className="font-bold text-stone-200">{data.name}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-stone-400">{valueLabel}</span>
        <span className="font-bold text-amber-400">{data.display}</span>
      </div>
      {data.role && <div className="text-[10px] text-stone-500 mt-1 italic">{data.role}</div>}
    </div>
  );
}

const present = (v: number | null | undefined): v is number => v !== null && v !== undefined && Number.isFinite(v);
const toNull = (v: number | null | undefined): number | null => (present(v) ? v : null);

function formatMetric(value: number | null, type: MetricType, lang: Lang): string {
  return type === 'percentage' ? formatPct(value, lang) : formatNumber(value, lang);
}

// Charts measure their container, so they render only after hydration.
const noopSubscribe = () => () => {};
function useIsClient(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/** Neutral "vs state average" badge; the wording comes from lib/comparisons. */
function StateComparisonBadge({ m, stateName, lang, unavailable, selfOnly, selfOnlyText }: { m: MetricItem; stateName: string; lang: Lang; unavailable: string; selfOnly: boolean; selfOnlyText: string }) {
  // An average based on this MP alone is their own figure; comparing them with it says nothing.
  const relation = selfOnly ? 'similar' : compareWithAverage(m.mpVal, m.stateVal, m.type, lang).relation;
  const text = selfOnly
    ? selfOnlyText
    : describeAgainstAverage(m.mpVal, m.stateVal, m.type, { kind: 'state', name: stateName }, lang) ?? unavailable;
  const Icon = relation === 'higher' ? TrendingUp : relation === 'lower' ? TrendingDown : Minus;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-200/60 dark:bg-[#1A2536] text-stone-600 dark:text-stone-300 text-center">
      <Icon className="w-3 h-3 shrink-0" aria-hidden="true" />
      <span>{text}</span>
    </span>
  );
}

export const ComparisonSection: React.FC<ComparisonSectionProps> = ({ mp, stateAverageN }) => {
  const t = useMessages(cardMessages);
  const { lang } = useLang();
  const [viewMode, setViewMode] = useState<ViewMode>('pie');
  const isClient = useIsClient();
  const [activePieIndex, setActivePieIndex] = useState<Record<string, number | null>>({});

  if (mp.is_minister || mp.performance.status === 'not_applicable') {
    return null;
  }

  const perf = mp.performance;
  const nat = perf.prs_averages?.national;
  const state = perf.prs_averages?.state;
  const stateName = localizeState(mp.state, lang);

  if (!nat && !state) {
    return (
      <div className="bg-white dark:bg-[#0E1420] rounded-xl p-5 sm:p-7 border border-stone-200/90 dark:border-[#1E2636] shadow-sm transition-colors">
        <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 font-sans tracking-tight">
          {t.comparisonHeading}
        </h2>
        <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-2">{t.averagesNotAvailable}</p>
      </div>
    );
  }

  // Name exactly as published; the first word keeps chart labels short.
  const firstName = mp.name.split(' ')[0] || mp.name;
  const mpRole = `${mp.name} (${localizeParty(mp.party, lang)})`;
  const stateShort = t.stateAverageShort(stateName);
  const stateRole = t.stateAverageLabel(stateName);
  const nationalShort = t.nationalAverageShort;
  const smallSample = isSmallSample(stateAverageN);
  const selfOnly = smallSample && stateAverageN === 1;

  const countMax = (floor: number, factor: number, ...values: Array<number | null | undefined>) =>
    Math.max(floor, ...values.filter(present)) * factor;

  const metrics: MetricItem[] = [
    {
      id: 'attendance',
      title: t.metricAttendance,
      subtitle: t.subtitleAttendance,
      mpVal: toNull(perf.attendance_pct),
      stateVal: toNull(state?.attendance_pct),
      natVal: toNull(nat?.attendance_pct),
      type: 'percentage',
      maxVal: 100,
    },
    {
      id: 'debates',
      title: t.metricDebates,
      subtitle: t.subtitleDebates,
      mpVal: toNull(perf.debates),
      stateVal: toNull(state?.debates),
      natVal: toNull(nat?.debates),
      type: 'count',
      maxVal: countMax(35, 1.15, perf.debates, state?.debates, nat?.debates),
    },
    {
      id: 'questions',
      title: t.metricQuestions,
      subtitle: t.subtitleQuestions,
      mpVal: toNull(perf.questions),
      stateVal: toNull(state?.questions),
      natVal: toNull(nat?.questions),
      type: 'count',
      maxVal: countMax(200, 1.15, perf.questions, state?.questions, nat?.questions),
    },
    {
      id: 'bills',
      title: t.metricBills,
      subtitle: t.subtitleBills,
      mpVal: toNull(perf.private_member_bills),
      stateVal: toNull(state?.private_member_bills),
      natVal: toNull(nat?.private_member_bills),
      type: 'count',
      maxVal: countMax(4, 1.25, perf.private_member_bills, state?.private_member_bills, nat?.private_member_bills),
    },
  ];

  const fmt = (m: MetricItem, v: number | null) => formatMetric(v, m.type, lang);

  const views: Array<{ id: ViewMode; label: string; title: string; Icon: typeof PieChartIcon }> = [
    { id: 'pie', label: t.viewPie, title: t.viewPieTitle, Icon: PieChartIcon },
    { id: 'rings', label: t.viewRings, title: t.viewRingsTitle, Icon: CircleDot },
    { id: 'bar', label: t.viewBars, title: t.viewBarsTitle, Icon: LayoutGrid },
  ];

  const cardHeader = (m: MetricItem) => (
    <div className="mb-2">
      <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm font-sans">{m.title}</h3>
      <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 truncate">{m.subtitle}</p>
    </div>
  );

  const centerLabel = (m: MetricItem) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
      <span
        className={`font-extrabold font-mono text-stone-900 dark:text-white tabular-nums tracking-tight ${
          m.mpVal === null ? 'text-xs max-w-[80px]' : 'text-xl sm:text-2xl'
        }`}
      >
        {fmt(m, m.mpVal)}
      </span>
      <span className="text-[10px] font-mono uppercase text-amber-600 dark:text-amber-400 font-bold -mt-0.5">{firstName}</span>
    </div>
  );

  const legendRows = (m: MetricItem) => (
    <>
      <div className="my-2 flex items-center justify-center">
        <StateComparisonBadge m={m} stateName={stateName} lang={lang} unavailable={t.comparisonUnavailable} selfOnly={selfOnly} selfOnlyText={t.stateAverageSelfOnly} />
      </div>
      <dl className="pt-2.5 border-t border-stone-200/70 dark:border-[#1A2536] space-y-1.5 text-[11px] font-mono">
        <div className="flex items-center justify-between gap-2">
          <dt className="flex items-center gap-1.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" aria-hidden="true" />
            <span className="text-stone-700 dark:text-stone-300 font-medium truncate max-w-[90px]">{firstName}</span>
          </dt>
          <dd className="font-bold font-mono text-stone-900 dark:text-white tabular-nums text-right">{fmt(m, m.mpVal)}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="flex items-center gap-1.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0" aria-hidden="true" />
            <span className="text-stone-500 dark:text-stone-400 truncate">{stateShort}</span>
          </dt>
          <dd className="font-mono text-stone-700 dark:text-stone-300 tabular-nums text-right">{fmt(m, m.stateVal)}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="flex items-center gap-1.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" aria-hidden="true" />
            <span className="text-stone-500 dark:text-stone-400 truncate">{nationalShort}</span>
          </dt>
          <dd className="font-mono text-stone-500 dark:text-stone-400 tabular-nums text-right">{fmt(m, m.natVal)}</dd>
        </div>
      </dl>
    </>
  );

  const chartPlaceholder = (
    <div className="w-24 h-24 rounded-full border-4 border-dashed border-stone-200 dark:border-stone-800 animate-pulse" />
  );

  const sourceName = perf.source?.name ?? null;

  return (
    <div className="bg-white dark:bg-[#0E1420] rounded-xl p-5 sm:p-7 border border-stone-200/90 dark:border-[#1E2636] shadow-xs transition-colors">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-100 dark:border-[#1A2333]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {t.comparisonEyebrow}
            </span>
            <span className="text-stone-400 dark:text-stone-600" aria-hidden="true">·</span>
            <span className="text-xs font-mono text-stone-500 dark:text-stone-400">{t.term18}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 font-sans tracking-tight flex items-center gap-2 mt-0.5">
            <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span>{t.comparisonHeading}</span>
          </h2>
          <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-0.5">
            {t.comparisonSubtitle(stateName)}
            {perf.as_of ? t.comparisonAsOfSuffix(formatDate(perf.as_of, lang)) : ''}
          </p>
          {smallSample && (
            <p className="text-xs font-mono text-stone-600 dark:text-stone-300 mt-1">
              {selfOnly ? t.stateAverageSelfOnly : t.stateAverageSmallSample(stateName, stateAverageN)}
            </p>
          )}
        </div>

        {/* View mode switcher */}
        <div
          role="group"
          aria-label={t.viewModeLabel}
          className="inline-flex items-center p-1 rounded-lg bg-stone-100 dark:bg-[#141C28] border border-stone-200 dark:border-[#222E42] text-xs font-mono self-start sm:self-auto"
        >
          {views.map(({ id, label, title, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setViewMode(id)}
              aria-pressed={viewMode === id}
              title={title}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === id
                  ? 'bg-white dark:bg-stone-100 text-stone-950 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mandatory non-ranking disclaimer */}
      <div className="bg-stone-50 dark:bg-[#121A26] border border-stone-200 dark:border-[#1E293B] rounded-lg p-3 mb-6 flex items-center gap-2.5 text-xs font-mono text-stone-600 dark:text-stone-400">
        <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" aria-hidden="true" />
        <span>{t.activityNotQuality}</span>
      </div>

      {/* VIEW 1: donut charts (default) */}
      {viewMode === 'pie' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m) => {
              // Missing values are left out of the chart, never drawn as zero.
              const series: ChartDatum[] = [
                { name: firstName, value: m.mpVal ?? 0, display: fmt(m, m.mpVal), fill: COLORS.mp.base, role: mpRole },
                { name: stateShort, value: m.stateVal ?? 0, display: fmt(m, m.stateVal), fill: COLORS.state.base, role: stateRole },
                { name: nationalShort, value: m.natVal ?? 0, display: fmt(m, m.natVal), fill: COLORS.national.base, role: t.nationalRole },
              ];
              const values = [m.mpVal, m.stateVal, m.natVal];
              const indexed = series.map((d, i) => ({ d, i })).filter(({ i }) => present(values[i]) && (values[i] as number) > 0);
              const pieData: ChartDatum[] = indexed.length
                ? indexed.map(({ d }) => d)
                : [{ name: '', value: 1, display: null, fill: TRACK_EMPTY }];

              return (
                <div
                  key={m.id}
                  className="bg-stone-50/80 dark:bg-[#121A26] rounded-xl p-4 sm:p-5 border border-stone-200/90 dark:border-[#1E293B] hover:border-amber-500/50 transition-all flex flex-col justify-between"
                >
                  {cardHeader(m)}
                  <div className="relative w-full h-[170px] flex items-center justify-center my-1" aria-hidden="true">
                    {!isClient ? (
                      chartPlaceholder
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height={170}>
                          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <Tooltip content={<PieTooltip valueLabel={t.tooltipValue} />} />
                            <Pie
                              data={pieData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={46}
                              outerRadius={68}
                              paddingAngle={indexed.length > 1 ? 3 : 0}
                              cornerRadius={4}
                              startAngle={90}
                              endAngle={-270}
                              stroke="none"
                              animationDuration={800}
                              onMouseEnter={(_, index) => setActivePieIndex((prev) => ({ ...prev, [m.id]: index }))}
                              onMouseLeave={() => setActivePieIndex((prev) => ({ ...prev, [m.id]: null }))}
                            >
                              {pieData.map((entry, index) => {
                                const seriesIndex = indexed[index]?.i;
                                const hovered = activePieIndex[m.id] === index && seriesIndex !== undefined;
                                return (
                                  <Cell
                                    key={`cell-${m.id}-${index}`}
                                    fill={hovered ? SERIES_HOVER[seriesIndex] : entry.fill}
                                    className="transition-colors duration-200 cursor-pointer"
                                  />
                                );
                              })}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        {centerLabel(m)}
                      </>
                    )}
                  </div>
                  {legendRows(m)}
                </div>
              );
            })}
          </div>

          <div className="p-3.5 bg-stone-50 dark:bg-[#121A26] rounded-lg border border-stone-200/80 dark:border-[#1E293B] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-stone-600 dark:text-stone-400">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-bold text-stone-800 dark:text-stone-200 uppercase text-[10px] tracking-wider">{t.chartGuide}</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" aria-hidden="true" />
                <strong>{mpRole}</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-400" aria-hidden="true" />
                <strong>{stateRole}</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-400" aria-hidden="true" />
                <strong>{t.nationalAverageLabel}</strong>
              </div>
            </div>
            {sourceName && <div className="text-[11px] text-stone-500">{t.sourceLabel(sourceName)}</div>}
          </div>
        </div>
      )}

      {/* VIEW 2: concentric rings */}
      {viewMode === 'rings' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => {
            const ring = (value: number | null, name: string, color: { base: string; track: string }, role: string): ChartDatum[] =>
              value === null
                ? [{ name: '', value: m.maxVal, display: null, fill: TRACK_EMPTY }]
                : [
                    { name, value, display: fmt(m, value), fill: color.base, role },
                    { name: '', value: Math.max(0, m.maxVal - value), display: null, fill: color.track },
                  ];
            const rings = [
              { data: ring(m.natVal, nationalShort, COLORS.national, t.nationalRole), inner: 24, outer: 32 },
              { data: ring(m.stateVal, stateShort, COLORS.state, stateRole), inner: 36, outer: 45 },
              { data: ring(m.mpVal, firstName, COLORS.mp, mpRole), inner: 49, outer: 59 },
            ];

            return (
              <div
                key={m.id}
                className="bg-stone-50/80 dark:bg-[#121A26] rounded-xl p-4 sm:p-5 border border-stone-200/90 dark:border-[#1E293B] hover:border-amber-500/50 transition-all flex flex-col justify-between"
              >
                {cardHeader(m)}
                <div className="relative w-full h-[170px] flex items-center justify-center my-1" aria-hidden="true">
                  {!isClient ? (
                    chartPlaceholder
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={170}>
                        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                          <Tooltip content={<PieTooltip valueLabel={t.tooltipValue} />} />
                          {rings.map((r, ri) => (
                            <Pie
                              key={ri}
                              data={r.data}
                              dataKey="value"
                              cx="50%"
                              cy="50%"
                              innerRadius={r.inner}
                              outerRadius={r.outer}
                              startAngle={90}
                              endAngle={-270}
                              stroke="none"
                            >
                              {r.data.map((d, di) => (
                                <Cell key={di} fill={d.fill} />
                              ))}
                            </Pie>
                          ))}
                        </PieChart>
                      </ResponsiveContainer>
                      {centerLabel(m)}
                    </>
                  )}
                </div>
                {legendRows(m)}
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: horizontal bars */}
      {viewMode === 'bar' && (
        <div className="space-y-4">
          {metrics.map((m) => {
            const width = (v: number | null) => (v === null ? 0 : Math.min(100, (v / m.maxVal) * 100));
            const rows = [
              { label: firstName, value: m.mpVal, bar: 'bg-amber-600 dark:bg-amber-500', h: 'h-3', strong: true },
              { label: stateShort, value: m.stateVal, bar: 'bg-sky-500 dark:bg-sky-400', h: 'h-2.5', strong: false },
              { label: nationalShort, value: m.natVal, bar: 'bg-stone-400 dark:bg-stone-600', h: 'h-2.5', strong: false },
            ];
            return (
              <div
                key={m.id}
                className="p-4 rounded-lg bg-stone-50/80 dark:bg-[#121A26] border border-stone-200/80 dark:border-[#1E293B]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono mb-3">
                  <span className="font-bold text-stone-900 dark:text-stone-100">{m.title}</span>
                  <StateComparisonBadge m={m} stateName={stateName} lang={lang} unavailable={t.comparisonUnavailable} selfOnly={selfOnly} selfOnlyText={t.stateAverageSelfOnly} />
                </div>
                <dl className="space-y-2 text-[11px] font-mono">
                  {rows.map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <dt className="w-24 text-stone-600 dark:text-stone-400 truncate">{row.label}</dt>
                      <div className={`flex-1 bg-stone-200 dark:bg-[#1A2536] rounded-full ${row.h} overflow-hidden`} aria-hidden="true">
                        <div
                          className={`${row.bar} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${width(row.value)}%` }}
                        />
                      </div>
                      <dd
                        className={`w-20 text-right tabular-nums ${
                          row.strong ? 'font-bold text-stone-900 dark:text-white' : 'text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        {fmt(m, row.value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
