import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Search, Navigation, Layers, Info, MapPin, ChevronRight, User, Award, CheckCircle2 } from 'lucide-react';
import delhiGeoJSON from '../../data/delhiConstituenciesGeo.json';
import { MPRecord } from '../../types/mp';
import { Link } from 'react-router-dom';

interface NagrikStyleMapProps {
  mps: MPRecord[];
  onSelectConstituency?: (slug: string) => void;
  selectedSlug?: string | null;
}

export const NagrikStyleMap: React.FC<NagrikStyleMapProps> = ({
  mps,
  onSelectConstituency,
  selectedSlug: externalSelectedSlug,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    externalSelectedSlug || 'new-delhi-delhi'
  );
  const [hoveredFeature, setHoveredFeature] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locating, setLocating] = useState(false);
  const [userLocationError, setUserLocationError] = useState<string | null>(null);

  // Sync external prop
  useEffect(() => {
    if (externalSelectedSlug) {
      setSelectedSlug(externalSelectedSlug);
      highlightAndFlyTo(externalSelectedSlug);
    }
  }, [externalSelectedSlug]);

  const highlightAndFlyTo = (slug: string) => {
    try {
      const feat = delhiGeoJSON.features.find((f) => f.properties.slug === slug);
      if (!feat || !map.current) return;

      const coords = feat.geometry.coordinates[0];
      if (!coords || coords.length === 0) return;
      const centerLng = coords.reduce((acc, c) => acc + c[0], 0) / coords.length;
      const centerLat = coords.reduce((acc, c) => acc + c[1], 0) / coords.length;

      if (typeof map.current.flyTo === 'function') {
        map.current.flyTo({
          center: [centerLng, centerLat],
          zoom: 11.2,
          essential: true,
          duration: 1000,
        });
      }
    } catch (err) {
      console.warn('flyTo skipped:', err);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize MapLibre with dark CartoDB tile layer
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors © CARTO',
          },
        },
        layers: [
          {
            id: 'carto-dark-layer',
            type: 'raster',
            source: 'carto-dark',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [77.16, 28.63],
      zoom: 10,
      pitch: 0,
      attributionControl: false,
    });

    map.current.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

    map.current.on('load', () => {
      if (!map.current) return;

      // Add GeoJSON source
      map.current.addSource('delhi-constituencies', {
        type: 'geojson',
        data: delhiGeoJSON as any,
      });

      // Polygon Fill Layer
      map.current.addLayer({
        id: 'constituency-fills',
        type: 'fill',
        source: 'delhi-constituencies',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.55,
        },
      });

      // Polygon Outline Layer
      map.current.addLayer({
        id: 'constituency-borders',
        type: 'line',
        source: 'delhi-constituencies',
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 1.5,
          'line-opacity': 0.8,
        },
      });

      // Click on constituency
      map.current.on('click', 'constituency-fills', (e: any) => {
        if (!e.features || !e.features[0]) return;
        const slug = e.features[0].properties.slug;
        setSelectedSlug(slug);
        if (onSelectConstituency) onSelectConstituency(slug);
        highlightAndFlyTo(slug);
      });

      // Hover effects
      map.current.on('mousemove', 'constituency-fills', (e: any) => {
        if (!e.features || !e.features[0]) return;
        map.current!.getCanvas().style.cursor = 'pointer';
        setHoveredFeature(e.features[0].properties);
      });

      map.current.on('mouseleave', 'constituency-fills', () => {
        map.current!.getCanvas().style.cursor = '';
        setHoveredFeature(null);
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Handle Geolocation
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setUserLocationError('Geolocation not supported by your browser.');
      return;
    }
    setLocating(true);
    setUserLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        if (map.current) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 12,
            duration: 1500,
          });
          // Default to New Delhi or closest
          setSelectedSlug('new-delhi-delhi');
        }
      },
      (err) => {
        setLocating(false);
        setUserLocationError('Could not detect location. Showing Central Delhi.');
        if (map.current) {
          map.current.flyTo({ center: [77.209, 28.6139], zoom: 11 });
        }
      },
      { timeout: 7000 }
    );
  };

  // Filter constituencies
  const filteredFeatures = delhiGeoJSON.features.filter((f) => {
    const q = searchQuery.toLowerCase();
    return (
      f.properties.name.toLowerCase().includes(q) ||
      f.properties.mp.toLowerCase().includes(q) ||
      f.properties.party.toLowerCase().includes(q)
    );
  });

  const activeFeature = delhiGeoJSON.features.find((f) => f.properties.slug === selectedSlug);
  const activeMP = mps.find((m) => m.slug === selectedSlug);

  return (
    <div className="bg-[#11161d] border border-[#232b35] rounded-3xl overflow-hidden shadow-2xl">
      {/* Tab Header inspired by Nagrik image 3 & 4 */}
      <div className="border-b border-[#232b35] px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-[#141a22]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-amber-400 font-mono tracking-wider">
            01
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Outfit']">
            Find your constituency
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-[#1b222c] border border-[#2b3542] text-slate-300 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            7 Delhi Parliamentary Seats
          </span>
        </div>
      </div>

      {/* Main Grid: Map (Left) + Search & Browse (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left Map View (8 Cols) */}
        <div className="lg:col-span-8 relative min-h-[460px] lg:min-h-[600px] bg-[#0c1015]">
          {/* Top In-Map Controls (Layers, Info) */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#171d25]/90 backdrop-blur-md border border-[#2c3644] text-xs font-semibold text-slate-200 hover:text-white shadow-lg"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Layers</span>
            </button>
            <div className="p-2 rounded-xl bg-[#171d25]/90 backdrop-blur-md border border-[#2c3644] text-slate-400 hover:text-white shadow-lg">
              <Info className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Map Container */}
          <div ref={mapContainer} className="w-full h-full min-h-[460px] lg:min-h-[600px]" />

          {/* Hover Tooltip Overlay */}
          {hoveredFeature && (
            <div className="absolute top-4 right-4 z-10 pointer-events-none bg-[#171e27]/95 backdrop-blur-md border border-cyan-500/60 p-3 rounded-2xl shadow-2xl text-xs max-w-xs animate-in fade-in duration-150">
              <div className="text-[10px] uppercase font-bold text-cyan-400">
                Seat #{hoveredFeature.number} • {hoveredFeature.state}
              </div>
              <div className="text-base font-bold text-white font-['Outfit'] mt-0.5">
                {hoveredFeature.name}
              </div>
              <div className="text-slate-300 mt-1 flex items-center gap-2">
                <span>MP: <strong className="text-white">{hoveredFeature.mp}</strong></span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#202936] text-cyan-300 border border-slate-700">
                  {hoveredFeature.party}
                </span>
              </div>
              {hoveredFeature.attendance !== null && (
                <div className="text-slate-400 text-[11px] mt-1">
                  Attendance: <strong className="text-white">{hoveredFeature.attendance}%</strong>
                </div>
              )}
            </div>
          )}

          {/* Bottom Left Note */}
          <div className="absolute bottom-3 left-4 z-10 text-[11px] text-slate-400 bg-[#12171e]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#26303d] max-w-md hidden sm:block">
            Click map to explore constituency. Official 18th Lok Sabha boundaries.
          </div>
        </div>

        {/* Right Search & Browse Panel (4 Cols - Nagrik Style) */}
        <div className="lg:col-span-4 bg-[#141a22] border-t lg:border-t-0 lg:border-l border-[#232b35] p-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Search Input Box */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search seat, MP or landmark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#1b222c] border border-[#2a3442] rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Amber Action Button: Use My Location */}
            <button
              onClick={handleUseLocation}
              disabled={locating}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#F5AA27] hover:bg-[#e0981b] active:scale-98 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all"
            >
              <Navigation className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
              <span>{locating ? 'Detecting Location...' : 'Use my location'}</span>
            </button>

            {userLocationError && (
              <p className="text-xs text-amber-400 text-center">{userLocationError}</p>
            )}

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Delhi Coordinates: 28.61° N, 77.20° E</span>
              </span>
            </div>

            {/* Browse Constituencies Accordion List */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                <span>Browse Constituencies ({filteredFeatures.length})</span>
                <span className="text-cyan-400">Click to focus</span>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {filteredFeatures.map((f) => {
                  const isSelected = selectedSlug === f.properties.slug;
                  return (
                    <button
                      key={f.properties.slug}
                      onClick={() => {
                        setSelectedSlug(f.properties.slug);
                        if (onSelectConstituency) onSelectConstituency(f.properties.slug);
                        highlightAndFlyTo(f.properties.slug);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#1e2733] border-amber-400 ring-1 ring-amber-400/40 text-white'
                          : 'bg-[#171e27] border-[#252f3d] hover:border-slate-600 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: f.properties.color }}
                        />
                        <div>
                          <div className="font-semibold text-xs text-white">
                            {f.properties.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {f.properties.mp} ({f.properties.party})
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isSelected ? 'text-amber-400 translate-x-1' : 'text-slate-500'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Constituency Bottom Card */}
          {activeFeature && (
            <div className="mt-4 pt-4 border-t border-[#232b35] bg-[#1a212b] p-4 rounded-2xl border border-[#2a3542]">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="text-[10px] text-cyan-400 font-bold uppercase">
                    Selected Parliamentary Seat
                  </div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    {activeFeature.properties.name}
                  </h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#202936] text-amber-400 border border-amber-500/40 font-bold">
                  {activeFeature.properties.party}
                </span>
              </div>

              <div className="text-xs text-slate-300 mb-3 flex items-center justify-between">
                <span>MP: <strong className="text-white">{activeFeature.properties.mp}</strong></span>
                {activeFeature.properties.is_minister && (
                  <span className="text-[10px] text-amber-400 font-medium">Union Minister</span>
                )}
              </div>

              <Link
                to={`/mp/${activeFeature.properties.slug}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors"
              >
                <span>View Full Report Card</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

