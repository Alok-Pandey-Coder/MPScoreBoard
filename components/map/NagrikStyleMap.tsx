'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { Feature, Geometry } from 'geojson';
import { Search, Navigation, MapPin, ChevronRight } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import Link from 'next/link';
import { useLang, useMessages } from '@/context/LanguageContext';
import { localizeConstituency } from '@/lib/i18n';
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

// Exact 7 Parliamentary block theme palette matching Reference Screenshot
const PARLIAMENTARY_THEMES: Record<string, { fill: string; stroke: string; name: string }> = {
  'north-west-delhi-delhi': { fill: '#365314', stroke: '#84cc16', name: 'North West Delhi' }, // Olive / Forest Green
  'west-delhi-delhi': { fill: '#14532d', stroke: '#4ade80', name: 'West Delhi' }, // Kelly / Vivid Green
  'chandni-chowk-delhi': { fill: '#0e7490', stroke: '#38bdf8', name: 'Chandni Chowk' }, // Electric Cyan / Teal
  'new-delhi-delhi': { fill: '#1e3a8a', stroke: '#60a5fa', name: 'New Delhi' }, // Royal Deep Blue
  'south-delhi-delhi': { fill: '#881337', stroke: '#f87171', name: 'South Delhi' }, // Deep Burgundy / Crimson
  'east-delhi-delhi': { fill: '#78350f', stroke: '#fbbf24', name: 'East Delhi' }, // Warm Amber / Ochre
  'north-east-delhi-delhi': { fill: '#581c87', stroke: '#c084fc', name: 'North East Delhi' }, // Deep Violet / Purple
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

export const NagrikStyleMap: React.FC<NagrikStyleMapProps> = ({
  mps,
  onSelectConstituency,
  selectedSlug: externalSelectedSlug,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const numberMarkersRef = useRef<L.Marker[]>([]);
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
  // Leaflet tooltips are bound once, so they read the current language's text via a ref.
  const { lang } = useLang();
  const messagesRef = useRef(t);
  useEffect(() => {
    messagesRef.current = t;
  }, [t]);

  // Leaflet event handlers are created once, so they read the selection via a ref.
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

    const reticleHtml = `
      <div style="position:relative; width:44px; height:44px; transform:translate(-50%, -50%); pointer-events:none;">
        <div style="position:absolute; inset:2px; border:2px solid #f97316; border-radius:50%; box-shadow:0 0 10px rgba(249,115,22,0.9), inset 0 0 6px rgba(249,115,22,0.5);"></div>
        <div style="position:absolute; top:50%; left:-5px; right:-5px; height:1.5px; background:#f97316; transform:translateY(-50%);"></div>
        <div style="position:absolute; left:50%; top:-5px; bottom:-5px; width:1.5px; background:#f97316; transform:translateX(-50%);"></div>
        <div style="position:absolute; inset:6px; background:#0f172a; border:2px solid #f97316; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#f97316; font-weight:900; font-size:12px; font-family:monospace; box-shadow:0 0 8px rgba(0,0,0,0.85);">${label || ''}</div>
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
    const wardNum = wardLabel || seat?.defaultWard || '20';

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

    // 1. Initialize map on #080808 pure dark basemap
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      // Esri basemap terms require visible attribution.
      attributionControl: true,
      minZoom: 9,
      maxZoom: 16,
    }).setView([28.6350, 77.1600], 10.5);
    mapInstanceRef.current = map;

    // 2. Pure dark GIS basemap (ESRI Dark Canvas, NO WATERMARKS, subtle dark-gray roads)
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 16,
        className: 'dark-gis-tile-layer',
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      }
    ).addTo(map);

    // 3. Add bottom-right 10km dark scale bar (matching Screenshot 1 & 2)
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
            const theme = PARLIAMENTARY_THEMES[slug] || { fill: '#1e293b', stroke: '#64748b' };
            const isSelected = activeSlugRef.current === slug;
            return {
              fillColor: theme.fill,
              weight: isSelected ? 2.0 : 1.2,
              opacity: 0.95,
              color: isSelected ? '#ffffff' : theme.stroke,
              dashArray: '',
              fillOpacity: isSelected ? 0.85 : 0.72,
            };
          },
          onEachFeature: (feature: MapFeature, layer: L.Layer) => {
            const props = feature.properties;
            const slug = featureSlug(feature);
            const wardNum = String(props.ward_display || props.Ward_No || '');

            // Tooltip on hover
            layer.bindTooltip(
              () =>
                `<div style="font-family:sans-serif;"><div style="font-weight:700; font-size:12px; color:#f8fafc;">${props.Ward_Name || props.pc_name}</div><div style="font-size:11px; color:#94a3b8;">${localizeConstituency(props.pc_name || '', lang)} · ${messagesRef.current.wardTooltip(wardNum)}</div></div>`,
              { direction: 'center', className: 'dark-map-tooltip' }
            );

            // Render bold white number label with dark outline on each block
            if (props.center && wardNum) {
              const numberIcon = L.divIcon({
                className: 'gis-ward-number-label',
                html: `
                  <div style="
                    color: #ffffff;
                    font-weight: 800;
                    font-size: 11px;
                    font-family: 'JetBrains Mono', monospace;
                    text-shadow: 0 0 2px #000, 0 0 4px #000, 0 1px 2px #000;
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

              const numMarker = L.marker([props.center[0], props.center[1]], {
                icon: numberIcon,
                interactive: false,
              }).addTo(map);

              numberMarkersRef.current.push(numMarker);
            }

            layer.on({
              mouseover: (e: L.LeafletMouseEvent) => {
                const l = e.target as L.Path;
                l.setStyle({ fillOpacity: 0.92, weight: 2.2, color: '#ffffff' });
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
                  l.setStyle({ fillOpacity: 0.85, weight: 2.0, color: '#ffffff' });
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

  // Update layer styles when selectedSlug changes
  useEffect(() => {
    if (!geojsonLayerRef.current) return;
    geojsonLayerRef.current.eachLayer((l) => {
      const layer = l as FeatureLayer;
      const s = featureSlug(layer.feature);
      const theme = PARLIAMENTARY_THEMES[s] || { fill: '#1e293b', stroke: '#64748b' };
      const isSelected = selectedSlug === s;
      layer.setStyle({
        fillColor: theme.fill,
        weight: isSelected ? 2.0 : 1.2,
        opacity: 0.95,
        color: isSelected ? '#ffffff' : theme.stroke,
        fillOpacity: isSelected ? 0.85 : 0.72,
      });
      if (isSelected) {
        layer.bringToFront();
      }
    });
  }, [selectedSlug]);

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
    <div className="bg-[#0C1017] border border-[#1E2636] rounded-2xl overflow-hidden shadow-xl transition-all">
      {/* Editorial Header Bar */}
      <div className="border-b border-[#1E2636] px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-[#0E1420]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-amber-500 tracking-wider uppercase">
              {t.wardMapEyebrow}
            </span>
            <span className="text-stone-600">·</span>
            <span className="text-xs text-stone-400 font-mono">{t.wardMapRegion}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white font-sans mt-0.5 tracking-tight">
            {t.wardMapTitle}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-[#151D2A] border border-[#243144] text-stone-300 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{t.wardMapChip}</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Map (Left) + Search & Browse (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left Map View (8 Cols) */}
        <div className="lg:col-span-8 relative min-h-[460px] lg:min-h-[620px] bg-[#080808]">
          {/* Integrated Map Meta Pill */}
          <div className="absolute top-4 left-4 z-[500] flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E1420]/90 backdrop-blur-md border border-[#232F42] text-[11px] font-mono text-stone-300 shadow-md">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{t.basemapPill}</span>
            </div>
          </div>

          {/* Leaflet Map DOM Container */}
          <div ref={mapContainerRef} className="w-full h-full min-h-[460px] lg:min-h-[620px]" />

          {/* Hover Overlay */}
          {hoveredInfo && (
            <div className="absolute top-4 right-4 z-[500] pointer-events-none bg-[#0C121D]/95 backdrop-blur-md border border-amber-500/50 p-3 rounded-xl shadow-xl text-xs max-w-xs animate-in fade-in duration-100 font-sans">
              <div className="text-[10px] font-mono uppercase font-bold text-amber-400">
                {t.hoverWard(hoveredInfo.wardNum)}
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                {hoveredInfo.name}
              </div>
              <div className="text-stone-300 text-[11px] mt-1 font-mono">
                {t.lokSabhaLabel} <strong className="text-white">{hoveredInfo.pcName}</strong>
              </div>
            </div>
          )}

          {/* Bottom Left Note */}
          <div className="absolute bottom-3 left-4 z-[500] text-[11px] font-mono text-stone-400 bg-[#0C121D]/90 backdrop-blur-md px-3 py-1 rounded-md border border-[#222E40] max-w-md hidden sm:block">
            {t.wardMapClickNote}
          </div>
        </div>

        {/* Right Search & Browse Panel (4 Cols - Refined Editorial Dossier) */}
        <div className="lg:col-span-4 bg-[#0E1420] border-t lg:border-t-0 lg:border-l border-[#1E2636] p-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Search Input Box */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="text"
                placeholder={t.seatSearchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#141C29] border border-[#232F42] rounded-xl text-xs sm:text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Amber Action Button: Use My Location */}
            <button
              onClick={handleUseLocation}
              disabled={locating}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-stone-950 font-bold text-xs font-mono uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
              <span>{locating ? t.locating : t.useMyLocation}</span>
            </button>

            {userLocationError && (
              <p className="text-[11px] text-amber-400 text-center font-mono">{t[userLocationError]}</p>
            )}

            <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 px-1 border-b border-[#1E2636] pb-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>{t.delhiCenter}</span>
              </span>
            </div>

            {/* Browse Constituencies List */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 mb-2">
                <span>{t.constituenciesCount(filteredSeats.length)}</span>
                <span className="text-amber-400">{t.clickToInspect}</span>
              </div>

              <div className="space-y-1.5 max-h-[210px] overflow-y-auto pr-1">
                {filteredSeats.map((s) => {
                  const isSelected = selectedSlug === s.slug;
                  const mp = mps.find((m) => m.slug === s.slug);
                  const theme = PARLIAMENTARY_THEMES[s.slug];
                  return (
                    <button
                      key={s.slug}
                      onClick={() => focusConstituency(s.slug)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#182232] border-amber-500 text-white shadow-xs'
                          : 'bg-[#121A26] border-[#1F2B3D] hover:border-stone-600 text-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: theme?.stroke || s.color }}
                        />
                        <div>
                          <div className="font-semibold text-xs text-white">
                            {localizeConstituency(s.name, lang)}
                          </div>
                          <div className="text-[10px] font-mono text-stone-400">
                            {mp ? `${mp.name} (${mp.party})` : t.mpRecordFallback}
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          isSelected ? 'text-amber-400 translate-x-0.5' : 'text-stone-500'
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
            <div className="mt-4 pt-3.5 border-t border-[#1E2636] bg-[#121A26] p-4 rounded-xl border border-[#232F42]">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wide">
                    {t.selectedSeat}
                  </div>
                  <h4 className="text-base font-bold text-white font-sans">
                    {localizeConstituency(activeSeat.name, lang)}
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A2536] text-amber-300 border border-amber-500/30 font-bold">
                  {activeMP?.party || 'BJP'}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3 p-2 bg-[#0E1520] rounded-lg border border-[#1A2536]">
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#2B3B52] bg-stone-800 flex items-center justify-center text-xs font-mono font-bold text-stone-300">
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
                  <div className="text-[10px] text-stone-400 font-mono">{t.representative}</div>
                  <div className="text-xs font-bold text-white font-sans truncate">{activeMP?.name || t.sittingMPFallback}</div>
                </div>
              </div>
              <div className="text-xs text-stone-300 mb-3 space-y-1">
                {activeMP?.is_minister && (
                  <div className="text-[10px] text-amber-400 font-mono">
                    {t.ministerNotApplicable}
                  </div>
                )}
                {!activeMP?.is_minister && activeMP?.performance?.attendance_pct !== null && (
                  <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-stone-400 border-t border-[#1C2738]">
                    <span>{t.labelAttendance} <strong className="text-stone-200">{activeMP?.performance?.attendance_pct}%</strong></span>
                    <span>{t.labelQuestions} <strong className="text-stone-200">{activeMP?.performance?.questions}</strong></span>
                  </div>
                )}
              </div>

              <Link
                href={`/mp/${activeSeat.slug}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-stone-100 hover:bg-white text-stone-950 font-bold text-xs font-mono uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer"
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
