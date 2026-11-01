'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import L from 'leaflet';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { ChevronRight, MapPin } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { useLang, useMessages } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { localizeParty } from '@/lib/i18n';
import { NOT_AVAILABLE_TEXT } from '@/lib/formatters';
import { mapMessages } from '@/lib/messages/map';
import { LocateMySeat } from '@/components/map/LocateMySeat';

interface PcProps {
  slug: string;
  pc_name: string;
  pc_no: number;
  center: [number, number];
}
type PcFeature = Feature<Geometry, PcProps>;
type PcLayer = L.Path & { feature?: PcFeature };

// Same Esri basemaps as the Delhi map (NagrikStyleMap).
const ESRI_TILES = {
  dark: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  light: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
};

// One accent per seat, cycled in constituency-number order.
const SEAT_COLORS = [
  { fill: '#bfdbfe', stroke: '#2563eb', darkFill: '#1e3a8a', darkStroke: '#60a5fa' },
  { fill: '#fecdd3', stroke: '#e11d48', darkFill: '#881337', darkStroke: '#f87171' },
  { fill: '#bbf7d0', stroke: '#16a34a', darkFill: '#14532d', darkStroke: '#4ade80' },
  { fill: '#fde68a', stroke: '#d97706', darkFill: '#78350f', darkStroke: '#fbbf24' },
];

function seatStyle(index: number, selected: boolean, dark: boolean): L.PathOptions {
  const c = SEAT_COLORS[index % SEAT_COLORS.length];
  return {
    fillColor: dark ? c.darkFill : c.fill,
    color: selected ? (dark ? '#ffffff' : '#0f172a') : dark ? c.darkStroke : c.stroke,
    weight: selected ? 3 : 1.5,
    opacity: 0.95,
    fillOpacity: selected ? (dark ? 0.85 : 0.8) : dark ? 0.72 : 0.65,
  };
}

function seatLabelIcon(name: string, dark: boolean) {
  return L.divIcon({
    className: 'gis-ward-number-label',
    html: `<div style="color:${dark ? '#ffffff' : '#0f172a'};font-weight:800;font-size:13px;font-family:'JetBrains Mono',monospace;text-shadow:${
      dark ? '0 0 2px #000,0 0 4px #000' : '0 0 2px #fff,0 0 4px #fff'
    };white-space:nowrap;pointer-events:none;transform:translate(-50%,-50%);user-select:none;">${name}</div>`,
    iconSize: [0, 0],
  });
}

interface StateConstituencyMapProps {
  stateId: string;
  mps: MPRecord[];
  selectedSlug: string | null;
  onSelectConstituency: (slug: string) => void;
}

/** Constituency polygons of one state on the Esri basemap, from /api/geojson?state=<id>. */
export const StateConstituencyMap: React.FC<StateConstituencyMapProps> = ({
  stateId,
  mps,
  selectedSlug,
  onSelectConstituency,
}) => {
  const t = useMessages(mapMessages);
  const { lang } = useLang();
  const { isDark } = useTheme();

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const layersRef = useRef<Map<string, { layer: PcLayer; index: number }>>(new Map());
  const labelsRef = useRef<Array<{ marker: L.Marker; name: string }>>([]);
  const boundsRef = useRef<L.LatLngBounds | null>(null);

  // Leaflet handlers read the latest props through refs.
  const darkRef = useRef(isDark);
  const slugRef = useRef(selectedSlug);
  const mpsRef = useRef(mps);
  const selectRef = useRef(onSelectConstituency);
  const tRef = useRef(t);
  useEffect(() => {
    darkRef.current = isDark;
    slugRef.current = selectedSlug;
    mpsRef.current = mps;
    selectRef.current = onSelectConstituency;
    tRef.current = t;
  });

  // undefined = loading, null = failed.
  const [features, setFeatures] = useState<PcFeature[] | null | undefined>(undefined);
  const [hovered, setHovered] = useState<{ name: string; mp: string | null } | null>(null);

  // Build the map once per state.
  useEffect(() => {
    if (!containerRef.current) return;
    let alive = true;
    const dark = darkRef.current;
    const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true, minZoom: 7, maxZoom: 16 });
    mapRef.current = map;
    tileRef.current = L.tileLayer(dark ? ESRI_TILES.dark : ESRI_TILES.light, {
      maxZoom: 16,
      className: dark ? 'dark-gis-tile-layer' : 'light-gis-tile-layer',
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    }).addTo(map);
    L.control.scale({ imperial: false, position: 'bottomright' }).addTo(map);
    map.setView([15.35, 74.0], 9);

    fetch(`/api/geojson?state=${encodeURIComponent(stateId)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((fc: FeatureCollection<Geometry, PcProps>) => {
        if (!alive) return;
        const geo = L.geoJSON(fc, {
          style: (f) => {
            const i = fc.features.findIndex((x) => x.properties.slug === (f as PcFeature).properties.slug);
            return seatStyle(i, slugRef.current === (f as PcFeature).properties.slug, darkRef.current);
          },
          onEachFeature: (feature, layer) => {
            const f = feature as PcFeature;
            const index = fc.features.findIndex((x) => x.properties.slug === f.properties.slug);
            layersRef.current.set(f.properties.slug, { layer: layer as PcLayer, index });
            layer.bindTooltip(
              () => {
                const mp = mpsRef.current.find((m) => m.slug === f.properties.slug);
                return `<div style="font-family:sans-serif;"><div style="font-weight:700;font-size:12px;color:${
                  darkRef.current ? '#f8fafc' : '#0f172a'
                };">${f.properties.pc_name}</div><div style="font-size:11px;color:${darkRef.current ? '#94a3b8' : '#475569'};">${
                  mp ? mp.name : ''
                }</div></div>`;
              },
              { sticky: true, className: 'dark-map-tooltip' }
            );
            layer.on({
              mouseover: (e: L.LeafletMouseEvent) => {
                (e.target as L.Path).setStyle({ fillOpacity: 0.92, weight: 2.5 });
                const mp = mpsRef.current.find((m) => m.slug === f.properties.slug);
                setHovered({ name: f.properties.pc_name, mp: mp?.name ?? null });
              },
              mouseout: (e: L.LeafletMouseEvent) => {
                (e.target as L.Path).setStyle(seatStyle(index, slugRef.current === f.properties.slug, darkRef.current));
                setHovered(null);
              },
              click: () => selectRef.current(f.properties.slug),
            });
            const [lat, lng] = f.properties.center;
            labelsRef.current.push({
              marker: L.marker([lat, lng], { icon: seatLabelIcon(f.properties.pc_name, dark), interactive: false }).addTo(map),
              name: f.properties.pc_name,
            });
          },
        }).addTo(map);
        boundsRef.current = geo.getBounds();
        map.fitBounds(boundsRef.current, { padding: [30, 30] });
        setFeatures(fc.features as PcFeature[]);
      })
      .catch(() => alive && setFeatures(null));

    return () => {
      alive = false;
      layersRef.current.clear();
      labelsRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [stateId]);

  // Theme: swap basemap, restyle seats and labels.
  useEffect(() => {
    if (tileRef.current) {
      tileRef.current.setUrl(isDark ? ESRI_TILES.dark : ESRI_TILES.light);
      const el = tileRef.current.getContainer();
      if (el) el.className = `leaflet-layer ${isDark ? 'dark-gis-tile-layer' : 'light-gis-tile-layer'}`;
    }
    layersRef.current.forEach(({ layer, index }, slug) => layer.setStyle(seatStyle(index, slug === selectedSlug, isDark)));
    labelsRef.current.forEach(({ marker, name }) => marker.setIcon(seatLabelIcon(name, isDark)));
  }, [isDark, selectedSlug]);

  // Selection: highlight the seat and zoom to it; clearing it frames the whole state.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const entry = selectedSlug ? layersRef.current.get(selectedSlug) : undefined;
    if (entry) {
      entry.layer.bringToFront();
      map.flyToBounds((entry.layer as unknown as L.Polygon).getBounds(), { padding: [30, 30], duration: 0.8 });
    } else if (boundsRef.current) {
      map.flyToBounds(boundsRef.current, { padding: [30, 30], duration: 0.8 });
    }
  }, [selectedSlug, features]);

  const mpFor = (slug: string) => mps.find((m) => m.slug === slug);
  const activeMP = selectedSlug ? mpFor(selectedSlug) : undefined;
  const activeFeature = features?.find((f) => f.properties.slug === selectedSlug);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
      <div className="lg:col-span-8 relative min-h-[460px] lg:min-h-[560px] bg-stone-100 dark:bg-[#080808]">
        <div className="absolute top-4 left-4 z-[500] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 dark:bg-[#0E1420]/90 backdrop-blur-md border border-stone-200 dark:border-[#232F42] text-[11px] font-mono text-stone-700 dark:text-stone-300 shadow-md">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>{isDark ? t.pcBasemapDark : t.pcBasemapLight}</span>
        </div>

        <div ref={containerRef} className="w-full h-full min-h-[460px] lg:min-h-[560px]" />

        {features === undefined && (
          <p className="absolute inset-0 z-[400] flex items-center justify-center text-xs font-mono text-stone-500 animate-pulse pointer-events-none">
            {t.pcMapLoading}
          </p>
        )}
        {features === null && (
          <p className="absolute inset-0 z-[400] flex items-center justify-center text-xs font-mono text-amber-600 pointer-events-none">
            {t.pcMapFailed}
          </p>
        )}

        {hovered && (
          <div className="absolute top-4 right-4 z-[500] pointer-events-none bg-white/95 dark:bg-[#0C121D]/95 backdrop-blur-md border border-amber-500/50 p-3 rounded-xl shadow-xl text-xs max-w-xs font-sans">
            <div className="text-[10px] font-mono uppercase font-bold text-amber-600 dark:text-amber-400">{t.lokSabhaLabel}</div>
            <div className="text-sm font-bold text-stone-900 dark:text-white mt-0.5">{hovered.name}</div>
            {hovered.mp && <div className="text-stone-600 dark:text-stone-300 text-[11px] mt-1 font-mono">{hovered.mp}</div>}
          </div>
        )}

        <div className="absolute bottom-3 left-4 z-[500] text-[11px] font-mono text-stone-600 dark:text-stone-400 bg-white/90 dark:bg-[#0C121D]/90 backdrop-blur-md px-3 py-1 rounded-md border border-stone-200 dark:border-[#222E40] max-w-md hidden sm:block shadow-xs">
          {t.pcMapNote} · {t.pcMapSource}
        </div>
      </div>

      <div className="lg:col-span-4 bg-stone-50/90 dark:bg-[#0E1420] border-t lg:border-t-0 lg:border-l border-stone-200 dark:border-[#1E2636] p-5 space-y-4">
        <LocateMySeat stateId={stateId} onResolved={onSelectConstituency} />

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-[#1E2636] pb-2">
          <MapPin className="w-3 h-3 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <span>{t.constituenciesCount(features?.length ?? 0)}</span>
          {selectedSlug && (
            <button
              onClick={() => onSelectConstituency('')}
              className="ml-auto text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              {t.resetView}
            </button>
          )}
        </div>
        <div className="space-y-1.5">
          {(features ?? []).map((f, i) => {
            const mp = mpFor(f.properties.slug);
            const isSelected = selectedSlug === f.properties.slug;
            const c = SEAT_COLORS[i % SEAT_COLORS.length];
            return (
              <button
                key={f.properties.slug}
                onClick={() => onSelectConstituency(f.properties.slug)}
                className={`w-full text-left p-2.5 rounded-lg border flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-amber-50 dark:bg-[#182232] border-amber-500'
                    : 'bg-white dark:bg-[#121A26] border-stone-200 dark:border-[#1F2B3D] hover:border-stone-400'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: isDark ? c.darkStroke : c.stroke }} />
                  <span>
                    <span className="block text-xs font-semibold text-stone-900 dark:text-white">{f.properties.pc_name}</span>
                    <span className="block text-[10px] font-mono text-stone-500 dark:text-stone-400">
                      {mp ? `${mp.name} (${mp.party})` : t.mpRecordFallback}
                    </span>
                  </span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400" aria-hidden="true" />
              </button>
            );
          })}
        </div>

        {activeFeature && activeMP ? (
          <div className="bg-white dark:bg-[#121A26] p-4 rounded-xl border border-stone-200 dark:border-[#232F42] space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase">{t.selectedSeat}</div>
                <h4 className="text-base font-bold text-stone-900 dark:text-white">{activeFeature.properties.pc_name}</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-[#1A2536] text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold">
                {activeMP.party ? localizeParty(activeMP.party, lang) : NOT_AVAILABLE_TEXT[lang]}
              </span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-stone-50 dark:bg-[#0E1520] rounded-lg border border-stone-200 dark:border-[#1A2536]">
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-stone-200 dark:border-[#2B3B52] bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs font-mono font-bold text-stone-600 dark:text-stone-300">
                {activeMP.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={activeMP.image_url} alt={activeMP.name} className="w-full h-full object-cover object-top" />
                ) : (
                  activeMP.name.split(' ').map((n) => n[0]).slice(0, 2).join('')
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">{t.representative}</div>
                <div className="text-sm font-bold text-stone-900 dark:text-white truncate">{activeMP.name}</div>
              </div>
            </div>
            {activeMP.is_minister ? (
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">{t.ministerNotApplicable}</div>
            ) : (
              activeMP.performance?.attendance_pct != null && (
                <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-stone-500 dark:text-stone-400 border-t border-stone-200 dark:border-[#1C2738]">
                  <span>{t.labelAttendance} <strong className="text-stone-800 dark:text-stone-200">{activeMP.performance.attendance_pct}%</strong></span>
                  <span>{t.labelQuestions} <strong className="text-stone-800 dark:text-stone-200">{activeMP.performance.questions ?? NOT_AVAILABLE_TEXT[lang]}</strong></span>
                </div>
              )
            )}
            <Link
              href={`/mp/${activeMP.slug}`}
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-950 font-bold text-xs font-mono uppercase tracking-wider rounded-lg"
            >
              <span>{t.viewFullDossier}</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <p className="p-4 rounded-xl border border-dashed border-stone-300 dark:border-[#232F42] text-[11px] font-mono text-stone-500 dark:text-stone-400 text-center">
            {t.selectSeatPrompt}
          </p>
        )}
      </div>
    </div>
  );
};
