'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { Feature, Geometry } from 'geojson';
import { Search, Navigation, MapPin, ChevronRight } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import Link from 'next/link';
import { useLang, useMessages } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { localizeParty } from '@/lib/i18n';
import { NOT_AVAILABLE_TEXT } from '@/lib/formatters';
import { mapMessages } from '@/lib/messages/map';

/** Properties of ward features (delhi_wards_enriched.geojson) or PC features (delhi_pc.json). */
interface MapFeatureProps {
  pc_slug?: string;
  slug?: string;
  pc_name?: string;
  Ward_Name?: string;
  Ward_No?: string | number;
  ward_display?: string;
  center?: [number, number];
}
type MapFeature = Feature<Geometry, MapFeatureProps>;
type FeatureLayer = L.Path & { feature?: MapFeature };

const featureSlug = (feature?: MapFeature) => feature?.properties?.pc_slug || feature?.properties?.slug || '';

interface NagrikStyleMapProps {
  mps: MPRecord[];
  onSelectConstituency?: (slug: string) => void;
  selectedSlug?: string | null;
}

// 7 Parliamentary block theme palette: Dark mode
export const PARLIAMENTARY_THEMES_DARK: Record<string, { fill: string; stroke: string; name: string }> = {
  'north-west-delhi-delhi': { fill: '#365314', stroke: '#84cc16', name: 'North West Delhi' }, // Olive / Forest Green
  'west-delhi-delhi': { fill: '#14532d', stroke: '#4ade80', name: 'West Delhi' }, // Kelly / Vivid Green
  'chandni-chowk-delhi': { fill: '#0e7490', stroke: '#38bdf8', name: 'Chandni Chowk' }, // Electric Cyan / Teal
  'new-delhi-delhi': { fill: '#1e3a8a', stroke: '#60a5fa', name: 'New Delhi' }, // Royal Deep Blue
  'south-delhi-delhi': { fill: '#881337', stroke: '#f87171', name: 'South Delhi' }, // Deep Burgundy / Crimson
  'east-delhi-delhi': { fill: '#78350f', stroke: '#fbbf24', name: 'East Delhi' }, // Warm Amber / Ochre
  'north-east-delhi-delhi': { fill: '#581c87', stroke: '#c084fc', name: 'North East Delhi' }, // Deep Violet / Purple
};

// 7 Parliamentary block theme palette: Light mode (Clean, high-contrast, identifiable pastel & vivid accents)
export const PARLIAMENTARY_THEMES_LIGHT: Record<string, { fill: string; stroke: string; name: string }> = {
  'north-west-delhi-delhi': { fill: '#d9f99d', stroke: '#65a30d', name: 'North West Delhi' }, // Lime 200 / 600
  'west-delhi-delhi': { fill: '#bbf7d0', stroke: '#16a34a', name: 'West Delhi' }, // Green 200 / 600
  'chandni-chowk-delhi': { fill: '#bae6fd', stroke: '#0284c7', name: 'Chandni Chowk' }, // Sky 200 / 600
  'new-delhi-delhi': { fill: '#bfdbfe', stroke: '#2563eb', name: 'New Delhi' }, // Blue 200 / 600
  'south-delhi-delhi': { fill: '#fecdd3', stroke: '#e11d48', name: 'South Delhi' }, // Rose 200 / 600
  'east-delhi-delhi': { fill: '#fde68a', stroke: '#d97706', name: 'East Delhi' }, // Amber 200 / 600
  'north-east-delhi-delhi': { fill: '#e9d5ff', stroke: '#9333ea', name: 'North East Delhi' }, // Purple 200 / 600
};

// Export PARLIAMENTARY_THEMES for backwards compatibility
export const PARLIAMENTARY_THEMES = PARLIAMENTARY_THEMES_DARK;

const ESRI_TILES = {
  dark: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  light: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
};

const DELHI_SEATS = [
  { slug: 'new-delhi-delhi', name: 'New Delhi', number: 4, center: [28.6139, 77.209] as [number, number], defaultWard: 'NDMC_1', color: '#60a5fa' },
  { slug: 'chandni-chowk-delhi', name: 'Chandni Chowk', number: 1, center: [28.6562, 77.2310] as [number, number], defaultWard: '20', color: '#38bdf8' },
  { slug: 'east-delhi-delhi', name: 'East Delhi', number: 2, center: [28.6270, 77.2950] as [number, number], defaultWard: '200', color: '#fbbf24' },
  { slug: 'north-east-delhi-delhi', name: 'North East Delhi', number: 3, center: [28.7050, 77.2650] as [number, number], defaultWard: '226', color: '#c084fc' },
  { slug: 'north-west-delhi-delhi', name: 'North West Delhi (SC)', number: 5, center: [28.7250, 77.1000] as [number, number], defaultWard: '31', color: '#84cc16' },
  { slug: 'south-delhi-delhi', name: 'South Delhi', number: 6, center: [28.5000, 77.1800] as [number, number], defaultWard: '158', color: '#f87171' },
  { slug: 'west-delhi-delhi', name: 'West Delhi', number: 7, center: [28.6300, 77.0600] as [number, number], defaultWard: '126', color: '#4ade80' },
];

function createWardNumberIcon(wardNum: string, isDark: boolean) {
  return L.divIcon({
    className: 'gis-ward-number-label',
    html: `
      <div style="
        color: ${isDark ? '#ffffff' : '#0f172a'};
        font-weight: 800;
        font-size: 11px;
        font-family: 'JetBrains Mono', monospace;
        text-shadow: ${isDark ? '0 0 2px #000, 0 0 4px #000, 0 1px 2px #000' : '0 0 2px #fff, 0 0 4px #fff, 0 1px 2px #fff'};
        white-space: nowrap;
        cursor: pointer;
        pointer-events: none;
        transform: translate(-50%, -50%);
        user-select: none;
        letter-spacing: -0.02em;
      ">${wardNum}</div>
    `,
    iconSize: [0, 0],
  });
}

export const NagrikStyleMap: React.FC<NagrikStyleMapProps> = ({
  mps,
  onSelectConstituency,
  selectedSlug: externalSelectedSlug,
}) => {
  const { isDark } = useTheme();
  const isDarkRef = useRef(isDark);
  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const numberMarkersRef = useRef<Array<L.Marker & { _wardNum?: string }>>([]);
  const targetReticleRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [selectedSlug, setSelectedSlug] = useState<string>(
    externalSelectedSlug || 'chandni-chowk-delhi'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [locating, setLocating] = useState(false);
  const [userLocationError, setUserLocationError] = useState<'geoUnsupported' | 'geoFailed' | null>(null);
  const [hoveredInfo, setHoveredInfo] = useState<{ name: string; pcName: string; wardNum: string } | null>(null);

  const t = useMessages(mapMessages);
  // Leaflet tooltips read the current language's text via a ref.
  const { lang } = useLang();
  const messagesRef = useRef(t);
  useEffect(() => {
    messagesRef.current = t;
  }, [t]);

  // Leaflet event handlers read the selection via a ref.
  const activeSlugRef = useRef<string>(selectedSlug);
  useEffect(() => {
    activeSlugRef.current = selectedSlug;
  }, [selectedSlug]);

  // Move or create the orange target reticle marker matching reference screenshot
  const updateTargetReticle = (lat: number, lng: number, label: string) => {
    if (!mapInstanceRef.current) return;

    if (targetReticleRef.current) {
      targetReticleRef.current.remove();
      targetReticleRef.current = null;
    }

    const currentDark = isDarkRef.current;
    const reticleHtml = `
      <div style="position:relative; width:44px; height:44px; transform:translate(-50%, -50%); pointer-events:none;">
        <div style="position:absolute; inset:2px; border:2px solid #f97316; border-radius:50%; box-shadow:0 0 10px rgba(249,115,22,0.9), inset 0 0 6px rgba(249,115,22,0.5);"></div>
        <div style="position:absolute; top:50%; left:-5px; right:-5px; height:1.5px; background:#f97316; transform:translateY(-50%);"></div>
        <div style="position:absolute; left:50%; top:-5px; bottom:-5px; width:1.5px; background:#f97316; transform:translateX(-50%);"></div>
        <div style="position:absolute; inset:6px; background:${currentDark ? '#0f172a' : '#ffffff'}; border:2px solid #f97316; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#ea580c; font-weight:900; font-size:12px; font-family:monospace; box-shadow:0 0 8px rgba(0,0,0,${currentDark ? '0.85' : '0.2'});">${label || ''}</div>
      </div>
    `;

    const reticleIcon = L.divIcon({
      className: 'target-reticle-marker',
      html: reticleHtml,
      iconSize: [0, 0],
    });

    targetReticleRef.current = L.marker([lat, lng], {
      icon: reticleIcon,
      interactive: false,
      zIndexOffset: 1000,
    }).addTo(mapInstanceRef.current);
  };

  // Fly to constituency and highlight representative ward
  const focusConstituency = (slug: string, wardLabel?: string, centerCoords?: [number, number]) => {
    setSelectedSlug(slug);
    if (onSelectConstituency) onSelectConstituency(slug);

    const seat = DELHI_SEATS.find((s) => s.slug === slug);
    const center = centerCoords || seat?.center || [28.6350, 77.1600];
    const wardNum = wardLabel || seat?.defaultWard || '';

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([center[0], center[1]], 11.5, {
        animate: true,
        duration: 0.8,
      });
      updateTargetReticle(center[0], center[1], wardNum);
    }
  };

  // Initialize Map
  useEffect(() => {
    let isMounted = true;
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    // Leaflet refuses to re-initialise a container it has seen (React strict-mode remount).
    const container = mapContainerRef.current as HTMLDivElement & { _leaflet_id?: number | null };
    if (container._leaflet_id != null) {
      container._leaflet_id = null;
    }

    const currentDark = isDarkRef.current;

    // 1. Initialize map on ESRI canvas basemap
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      // Esri basemap terms require visible attribution.
      attributionControl: true,
      minZoom: 9,
      maxZoom: 16,
    }).setView([28.6350, 77.1600], 10.5);
    mapInstanceRef.current = map;

    // 2. GIS basemap (ESRI Dark Canvas or Light Canvas depending on active theme)
    const initialTileUrl = currentDark ? ESRI_TILES.dark : ESRI_TILES.light;
    const tileLayer = L.tileLayer(initialTileUrl, {
      maxZoom: 16,
      className: currentDark ? 'dark-gis-tile-layer' : 'light-gis-tile-layer',
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // 3. Add bottom-right 10km scale bar
    L.control.scale({ imperial: false, position: 'bottomright' }).addTo(map);

    // 4. Fetch 290 detailed interlocking ward boundary polygons
    fetch('/api/geojson')
      .then((res) => res.json())
      .then((geojson) => {
        if (!isMounted || !mapInstanceRef.current) return;

        numberMarkersRef.current.forEach((m) => m.remove());
        numberMarkersRef.current = [];

        const geoLayer = L.geoJSON(geojson, {
          style: (feature?: MapFeature) => {
            const slug = featureSlug(feature);
            const themes = isDarkRef.current ? PARLIAMENTARY_THEMES_DARK : PARLIAMENTARY_THEMES_LIGHT;
            const theme = themes[slug] || (isDarkRef.current ? { fill: '#1e293b', stroke: '#64748b' } : { fill: '#e2e8f0', stroke: '#94a3b8' });
            const isSelected = activeSlugRef.current === slug;
            return {
              fillColor: theme.fill,
              weight: isSelected ? 2.5 : 1.2,
              opacity: 0.95,
              color: isSelected ? (isDarkRef.current ? '#ffffff' : '#0f172a') : theme.stroke,
              dashArray: '',
              fillOpacity: isSelected ? (isDarkRef.current ? 0.85 : 0.80) : (isDarkRef.current ? 0.72 : 0.65),
            };
          },
          onEachFeature: (feature: MapFeature, layer: L.Layer) => {
            const props = feature.properties;
            const slug = featureSlug(feature);
            const wardNum = String(props.ward_display || props.Ward_No || '');

            // Tooltip on hover
            layer.bindTooltip(
              () =>
                `<div style="font-family:sans-serif;"><div style="font-weight:700; font-size:12px; color:${isDarkRef.current ? '#f8fafc' : '#0f172a'};">${props.Ward_Name || props.pc_name}</div><div style="font-size:11px; color:${isDarkRef.current ? '#94a3b8' : '#475569'};">${props.pc_name || ''} · ${messagesRef.current.wardTooltip(wardNum)}</div></div>`,
              { direction: 'center', className: 'dark-map-tooltip' }
            );

            // Render ward number label on each block
            if (props.center && wardNum) {
              const numberIcon = createWardNumberIcon(wardNum, isDarkRef.current);
              const numMarker = L.marker([props.center[0], props.center[1]], {
                icon: numberIcon,
                interactive: false,
              }).addTo(map) as L.Marker & { _wardNum?: string };
              numMarker._wardNum = wardNum;
              numberMarkersRef.current.push(numMarker);
            }

            layer.on({
              mouseover: (e: L.LeafletMouseEvent) => {
                const l = e.target as L.Path;
                l.setStyle({ fillOpacity: 0.92, weight: 2.2, color: isDarkRef.current ? '#ffffff' : '#0f172a' });
                l.bringToFront();
                setHoveredInfo({
                  name: props.Ward_Name || props.pc_name || '',
                  pcName: props.pc_name || '',
                  wardNum: wardNum,
                });
              },
              mouseout: (e: L.LeafletMouseEvent) => {
                const l = e.target as L.Path;
                if (activeSlugRef.current === slug) {
                  l.setStyle({ fillOpacity: isDarkRef.current ? 0.85 : 0.80, weight: 2.5, color: isDarkRef.current ? '#ffffff' : '#0f172a' });
                } else {
                  geoLayer.resetStyle(l);
                }
                setHoveredInfo(null);
              },
              click: () => {
                if (slug) {
                  focusConstituency(
                    slug,
                    wardNum,
                    props.center ? [props.center[0], props.center[1]] : undefined
                  );
                }
              },
            });
          },
        }).addTo(map);

        geojsonLayerRef.current = geoLayer;

        // Position initial target reticle (Ward 20 in Chandni Chowk as in Reference Screenshot)
        updateTargetReticle(28.6570, 77.2318, '20');
      })
      .catch((err) => console.error('Failed to load GeoJSON:', err));

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Live Theme Reaction: Update Basemap Tiles, Polygons, and Labels without full remount
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // 1. Update Tile Layer URL & class
    if (tileLayerRef.current) {
      const newUrl = isDark ? ESRI_TILES.dark : ESRI_TILES.light;
      tileLayerRef.current.setUrl(newUrl);
      const container = tileLayerRef.current.getContainer();
      if (container) {
        container.className = `leaflet-layer ${isDark ? 'dark-gis-tile-layer' : 'light-gis-tile-layer'}`;
      }
    }

    // 2. Update GeoJSON Layer Polygon Styles
    if (geojsonLayerRef.current) {
      const themes = isDark ? PARLIAMENTARY_THEMES_DARK : PARLIAMENTARY_THEMES_LIGHT;
      geojsonLayerRef.current.eachLayer((l) => {
        const layer = l as FeatureLayer;
        const s = featureSlug(layer.feature);
        const theme = themes[s] || (isDark ? { fill: '#1e293b', stroke: '#64748b' } : { fill: '#e2e8f0', stroke: '#94a3b8' });
        const isSelected = activeSlugRef.current === s;
        layer.setStyle({
          fillColor: theme.fill,
          weight: isSelected ? 2.5 : 1.2,
          opacity: 0.95,
          color: isSelected ? (isDark ? '#ffffff' : '#0f172a') : theme.stroke,
          dashArray: '',
          fillOpacity: isSelected ? (isDark ? 0.85 : 0.80) : (isDark ? 0.72 : 0.65),
        });
      });
    }

    // 3. Update Ward Number Markers with matching contrast
    numberMarkersRef.current.forEach((marker) => {
      if (marker._wardNum) {
        marker.setIcon(createWardNumberIcon(marker._wardNum, isDark));
      }
    });

    // 4. Update Target Reticle center pill
    const seat = DELHI_SEATS.find((s) => s.slug === activeSlugRef.current);
    if (seat) {
      updateTargetReticle(seat.center[0], seat.center[1], seat.defaultWard);
    }
  }, [isDark]);

  // Update layer styles when selectedSlug changes
  useEffect(() => {
    if (!geojsonLayerRef.current) return;
    const themes = isDark ? PARLIAMENTARY_THEMES_DARK : PARLIAMENTARY_THEMES_LIGHT;
    geojsonLayerRef.current.eachLayer((l) => {
      const layer = l as FeatureLayer;
      const s = featureSlug(layer.feature);
      const theme = themes[s] || (isDark ? { fill: '#1e293b', stroke: '#64748b' } : { fill: '#e2e8f0', stroke: '#94a3b8' });
      const isSelected = selectedSlug === s;
      layer.setStyle({
        fillColor: theme.fill,
        weight: isSelected ? 2.5 : 1.2,
        opacity: 0.95,
        color: isSelected ? (isDark ? '#ffffff' : '#0f172a') : theme.stroke,
        fillOpacity: isSelected ? (isDark ? 0.85 : 0.80) : (isDark ? 0.72 : 0.65),
      });
      if (isSelected) {
        layer.bringToFront();
      }
    });
  }, [selectedSlug, isDark]);

  // Handle Geolocation button with Point-in-Polygon location resolution
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setUserLocationError('geoUnsupported');
      return;
    }
    setLocating(true);
    setUserLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`/api/locate?lat=${latitude}&lng=${longitude}`);
          const data = await res.json();
          setLocating(false);

          if (data.status === 'success' && data.result) {
            const matchedSlug = data.result.slug;
            focusConstituency(matchedSlug, undefined, [latitude, longitude]);

            if (mapInstanceRef.current) {
              if (userMarkerRef.current) {
                userMarkerRef.current.remove();
              }
              const pinHtml = `
                <div style="position:relative; width:22px; height:22px; transform:translate(-50%, -50%);">
                  <span style="position:absolute; inset:0; border-radius:50%; background:#f59e0b; opacity:0.75; animation:ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
                  <span style="position:absolute; inset:3px; border-radius:50%; background:#d97706; border:2px solid #ffffff; box-shadow:0 0 8px rgba(0,0,0,0.8);"></span>
                </div>
              `;
              const userIcon = L.divIcon({ html: pinHtml, className: 'user-gps-marker', iconSize: [0, 0] });
              userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(mapInstanceRef.current);
            }
          } else {
            focusConstituency('new-delhi-delhi', undefined, [latitude, longitude]);
          }
        } catch {
          setLocating(false);
          focusConstituency('new-delhi-delhi', undefined, [latitude, longitude]);
        }
      },
      () => {
        setLocating(false);
        setUserLocationError('geoFailed');
        focusConstituency('new-delhi-delhi');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const filteredSeats = DELHI_SEATS.filter((s) => {
    const q = searchQuery.toLowerCase();
    const mp = mps.find((m) => m.slug === s.slug);
    return (
      s.name.toLowerCase().includes(q) ||
      (mp && mp.name.toLowerCase().includes(q)) ||
      (mp && mp.party.toLowerCase().includes(q))
    );
  });

  const activeSeat = DELHI_SEATS.find((s) => s.slug === selectedSlug) || DELHI_SEATS[0];
  const activeMP = mps.find((m) => m.slug === selectedSlug);

  return (
    <div className="relative isolate bg-white dark:bg-[#0C1017] border border-stone-200 dark:border-[#1E2636] rounded-2xl overflow-hidden shadow-xl transition-colors duration-200">
      {/* Editorial Header Bar */}
      <div className="border-b border-stone-200 dark:border-[#1E2636] px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-stone-50/90 dark:bg-[#0E1420]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-500 tracking-wider uppercase">
              {t.wardMapEyebrow}
            </span>
            <span className="text-stone-400 dark:text-stone-600">·</span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">{t.wardMapRegion}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white font-sans mt-0.5 tracking-tight">
            {t.wardMapTitle}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-white dark:bg-[#151D2A] border border-stone-200 dark:border-[#243144] text-stone-700 dark:text-stone-300 font-medium flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{t.wardMapChip}</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Map (Left) + Search & Browse (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left Map View (8 Cols) */}
        <div className="lg:col-span-8 relative min-h-[460px] lg:min-h-[620px] bg-stone-100 dark:bg-[#080808]">
          {/* Integrated Map Meta Pill */}
          <div className="absolute top-4 left-4 z-[500] flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 dark:bg-[#0E1420]/90 backdrop-blur-md border border-stone-200 dark:border-[#232F42] text-[11px] font-mono text-stone-700 dark:text-stone-300 shadow-md">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>
                {isDark
                  ? t.basemapPill
                  : lang === 'hi'
                  ? 'ESRI लाइट बेस मैप · पैमाना 10 km'
                  : 'ESRI Pure Light Base · Scale 10 km'}
              </span>
            </div>
          </div>

          {/* Leaflet Map DOM Container */}
          <div ref={mapContainerRef} className="w-full h-full min-h-[460px] lg:min-h-[620px]" />

          {/* Hover Overlay */}
          {hoveredInfo && (
            <div className="absolute top-4 right-4 z-[500] pointer-events-none bg-white/95 dark:bg-[#0C121D]/95 backdrop-blur-md border border-amber-500/50 p-3 rounded-xl shadow-xl text-xs max-w-xs animate-in fade-in duration-100 font-sans">
              <div className="text-[10px] font-mono uppercase font-bold text-amber-600 dark:text-amber-400">
                {t.hoverWard(hoveredInfo.wardNum)}
              </div>
              <div className="text-sm font-bold text-stone-900 dark:text-white mt-0.5">
                {hoveredInfo.name}
              </div>
              <div className="text-stone-600 dark:text-stone-300 text-[11px] mt-1 font-mono">
                {t.lokSabhaLabel} <strong className="text-stone-900 dark:text-white">{hoveredInfo.pcName}</strong>
              </div>
            </div>
          )}

          {/* Bottom Left Note */}
          <div className="absolute bottom-3 left-4 z-[500] text-[11px] font-mono text-stone-600 dark:text-stone-400 bg-white/90 dark:bg-[#0C121D]/90 backdrop-blur-md px-3 py-1 rounded-md border border-stone-200 dark:border-[#222E40] max-w-md hidden sm:block shadow-xs">
            {t.wardMapClickNote}
          </div>
        </div>

        {/* Right Search & Browse Panel (4 Cols - Refined Editorial Dossier) */}
        <div className="lg:col-span-4 bg-stone-50/90 dark:bg-[#0E1420] border-t lg:border-t-0 lg:border-l border-stone-200 dark:border-[#1E2636] p-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Search Input Box */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="text"
                placeholder={t.seatSearchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#141C29] border border-stone-300 dark:border-[#232F42] rounded-xl text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
              />
            </div>

            {/* Amber Action Button: Use My Location */}
            <button
              onClick={handleUseLocation}
              disabled={locating}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold text-xs font-mono uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
              <span>{locating ? t.locating : t.useMyLocation}</span>
            </button>

            {userLocationError && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 text-center font-mono">{t[userLocationError]}</p>
            )}

            <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400 px-1 border-b border-stone-200 dark:border-[#1E2636] pb-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>{t.delhiCenter}</span>
              </span>
            </div>

            {/* Browse Constituencies List */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
                <span>{t.constituenciesCount(filteredSeats.length)}</span>
                <span className="text-amber-600 dark:text-amber-400">{t.clickToInspect}</span>
              </div>

              <div className="space-y-1.5 max-h-[210px] overflow-y-auto pr-1">
                {filteredSeats.map((s) => {
                  const isSelected = selectedSlug === s.slug;
                  const mp = mps.find((m) => m.slug === s.slug);
                  const theme = isDark ? PARLIAMENTARY_THEMES_DARK[s.slug] : PARLIAMENTARY_THEMES_LIGHT[s.slug];
                  return (
                    <button
                      key={s.slug}
                      onClick={() => focusConstituency(s.slug)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-[#182232] border-amber-500 text-stone-900 dark:text-white shadow-xs'
                          : 'bg-white dark:bg-[#121A26] border-stone-200 dark:border-[#1F2B3D] hover:border-stone-400 dark:hover:border-stone-600 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: theme?.stroke || s.color }}
                        />
                        <div>
                          <div className="font-semibold text-xs text-stone-900 dark:text-white">
                            {s.name}
                          </div>
                          <div className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                            {mp ? `${mp.name} (${mp.party})` : t.mpRecordFallback}
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          isSelected ? 'text-amber-600 dark:text-amber-400 translate-x-0.5' : 'text-stone-400 dark:text-stone-500'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Constituency Bottom Card */}
          {activeSeat && (
            <div className="mt-4 pt-3.5 border-t border-stone-200 dark:border-[#1E2636] bg-white dark:bg-[#121A26] p-4 rounded-xl border border-stone-200 dark:border-[#232F42] shadow-xs">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wide">
                    {t.selectedSeat}
                  </div>
                  <h4 className="text-base font-bold text-stone-900 dark:text-white font-sans">
                    {activeSeat.name}
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-[#1A2536] text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold">
                  {activeMP?.party ? localizeParty(activeMP.party, lang) : NOT_AVAILABLE_TEXT[lang]}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3 p-2 bg-stone-50 dark:bg-[#0E1520] rounded-lg border border-stone-200 dark:border-[#1A2536]">
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-stone-200 dark:border-[#2B3B52] bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs font-mono font-bold text-stone-600 dark:text-stone-300">
                  {activeMP?.image_url ? (
                    <img
                      src={activeMP.image_url}
                      alt={activeMP.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    activeMP?.name ? activeMP.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'MP'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">{t.representative}</div>
                  <div className="text-xs font-bold text-stone-900 dark:text-white font-sans truncate">{activeMP?.name || t.sittingMPFallback}</div>
                </div>
              </div>
              <div className="text-xs text-stone-700 dark:text-stone-300 mb-3 space-y-1">
                {activeMP?.is_minister && (
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                    {t.ministerNotApplicable}
                  </div>
                )}
                {!activeMP?.is_minister && activeMP?.performance?.attendance_pct !== null && (
                  <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-stone-500 dark:text-stone-400 border-t border-stone-200 dark:border-[#1C2738]">
                    <span>{t.labelAttendance} <strong className="text-stone-800 dark:text-stone-200">{activeMP?.performance?.attendance_pct}%</strong></span>
                    <span>{t.labelQuestions} <strong className="text-stone-800 dark:text-stone-200">{activeMP?.performance?.questions}</strong></span>
                  </div>
                )}
              </div>

              <Link
                href={`/mp/${activeSeat.slug}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-950 font-bold text-xs font-mono uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <span>{t.viewFullDossier}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
