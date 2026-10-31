"use client";

import React, { useEffect, useState, useRef } from "react";

interface MPPerformance {
  status: string;
  attendance_pct: number | null;
  debates: number | null;
  questions: number | null;
  private_member_bills: number | null;
  prs_averages?: {
    national: { attendance_pct: number; debates: number; questions: number; private_member_bills: number };
    state: { attendance_pct: number; debates: number; questions: number; private_member_bills: number };
  };
}

interface MPRecord {
  slug: string;
  name: string;
  constituency: string;
  party: string;
  reservation: string;
  is_minister: boolean;
  profile: {
    age: number | null;
    education: string | null;
    term_number: string | null;
  };
  performance: MPPerformance;
  background?: {
    declared_criminal_cases: number | null;
    declared_assets_inr: number | null;
    education_detailed: string | null;
    note: string;
  };
}

interface LocationResult {
  success: boolean;
  matched_by: string;
  constituency?: string;
  slug?: string;
  confidence: string;
  resolved_coords?: { lat: number; lng: number };
  mp?: MPRecord;
  error?: string;
}

interface SearchSuggestion {
  id: string;
  type: "constituency" | "mp" | "pincode" | "area";
  title: string;
  subtitle: string;
  slug: string;
  coords: { lat: number; lng: number };
}

// Exact Palette from Reference Screenshot 1:
// 7 Parliamentary Zones with harmonious high-contrast GIS fills & thin bright strokes
const PARLIAMENTARY_THEMES: Record<string, { fill: string; stroke: string; name: string }> = {
  "north-west-delhi-delhi": { fill: "#365314", stroke: "#84cc16", name: "North West Delhi" }, // Olive / Forest Green
  "west-delhi-delhi": { fill: "#14532d", stroke: "#4ade80", name: "West Delhi" }, // Kelly / Vivid Green
  "chandni-chowk-delhi": { fill: "#0e7490", stroke: "#38bdf8", name: "Chandni Chowk" }, // Electric Cyan / Teal
  "new-delhi-delhi": { fill: "#1e3a8a", stroke: "#60a5fa", name: "New Delhi" }, // Royal Deep Blue
  "south-delhi-delhi": { fill: "#881337", stroke: "#f87171", name: "South Delhi" }, // Deep Burgundy / Crimson
  "east-delhi-delhi": { fill: "#78350f", stroke: "#fbbf24", name: "East Delhi" }, // Warm Amber / Ochre
  "north-east-delhi-delhi": { fill: "#581c87", stroke: "#c084fc", name: "North East Delhi" }, // Deep Violet / Purple
};

export default function TestFrontend() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const geojsonLayerRef = useRef<any>(null);
  const numberMarkersRef = useRef<any[]>([]);
  const targetReticleRef = useRef<any>(null);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("Ready to test location APIs.");
  const [selectedResult, setSelectedResult] = useState<LocationResult | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>("chandni-chowk-delhi");
  const [activeWardNumber, setActiveWardNumber] = useState<string>("20");
  const [inputQuery, setInputQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [apiResponseRaw, setApiResponseRaw] = useState<any>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeSlugRef = useRef<string | null>("chandni-chowk-delhi");
  activeSlugRef.current = activeSlug;

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      const getLeaflet = (): Promise<any> => {
        return new Promise((resolve) => {
          if ((window as any).L) return resolve((window as any).L);
          const interval = setInterval(() => {
            if ((window as any).L) {
              clearInterval(interval);
              resolve((window as any).L);
            }
          }, 100);
        });
      };

      const L = await getLeaflet();
      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous instance or stale leaflet id if hot-reloaded
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if ((mapContainerRef.current as any)._leaflet_id != null) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      // Initialize map with dark background
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
        minZoom: 9,
        maxZoom: 16,
      }).setView([28.6350, 77.1600], 11);
      mapInstanceRef.current = map;

      // Pure dark/black GIS basemap with subtle gray roads and muted labels
      // Using Carto Dark / ESRI Dark Base with dark filter
      const darkTile = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 16,
        className: "dark-gis-tile-layer",
      }).addTo(map);

      // Add scale control (bottom-right 10km like Screenshot 1)
      L.control.scale({ imperial: false, position: "bottomright" }).addTo(map);

      // Fetch and draw all constituency block polygons
      try {
        const res = await fetch("/api/geojson");
        const geojson = await res.json();

        if (isMounted) {
          const geoLayer = L.geoJSON(geojson, {
            style: (feature: any) => {
              const slug = feature.properties?.pc_slug || feature.properties?.slug;
              const theme = PARLIAMENTARY_THEMES[slug] || { fill: "#1e293b", stroke: "#64748b" };
              return {
                fillColor: theme.fill,
                weight: 1.2,
                opacity: 0.95,
                color: theme.stroke,
                dashArray: "",
                fillOpacity: 0.72,
              };
            },
            onEachFeature: (feature: any, layer: any) => {
              const props = feature.properties;
              const slug = props.pc_slug || props.slug;
              const wardNum = props.ward_display || props.pc_no || "";

              // Tooltip on hover
              layer.bindTooltip(
                `<div style="font-weight:700; font-size:12px; color:#f8fafc;">${props.Ward_Name || props.pc_name}</div><div style="font-size:11px; color:#94a3b8;">${props.pc_name || ''}</div>`,
                { direction: "center", className: "dark-map-tooltip" }
              );

              // Render white number label with subtle dark outline on each block (Screenshot 1 requirement)
              if (props.center && wardNum) {
                const numberIcon = L.divIcon({
                  className: "gis-ward-number-label",
                  html: `
                    <div style="
                      color: #ffffff;
                      font-weight: 800;
                      font-size: 11px;
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
                mouseover: (e: any) => {
                  const l = e.target;
                  l.setStyle({ fillOpacity: 0.92, weight: 2.5, color: "#ffffff" });
                  l.bringToFront();
                },
                mouseout: (e: any) => {
                  const s = feature.properties?.pc_slug || feature.properties?.slug;
                  const l = e.target;
                  if (activeSlugRef.current === s) {
                    l.setStyle({ fillOpacity: 0.85, weight: 2.2, color: "#ffffff" });
                  } else {
                    geoLayer.resetStyle(l);
                  }
                },
                click: () => {
                  if (slug) {
                    handleSelectConstituency(slug, wardNum, props.center ? { lat: props.center[0], lng: props.center[1] } : undefined);
                  }
                },
              });
            },
          }).addTo(map);

          geojsonLayerRef.current = geoLayer;
          map.fitBounds(geoLayer.getBounds(), { padding: [15, 15] });

          // Default initial selection (Ward 20 - Chandni Chowk, exact match to screenshot)
          setOrangeTargetReticle(28.6562, 77.2307, "20");
          handleSelectConstituency("chandni-chowk-delhi", "20");
        }
      } catch (err) {
        console.error("Failed to load GeoJSON:", err);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }
    };
  }, []);

  // Display the exact orange target reticle from Reference Screenshot 1
  const setOrangeTargetReticle = (lat: number, lng: number, labelText?: string) => {
    if (!mapInstanceRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (targetReticleRef.current) {
      targetReticleRef.current.remove();
      targetReticleRef.current = null;
    }

    // Exact reticle matching screenshot: orange circle with crosshair and centered number
    const reticleIcon = L.divIcon({
      className: "orange-reticle-marker",
      html: `
        <div style="position: relative; width: 34px; height: 34px; transform: translate(-50%, -50%); cursor: pointer;">
          <!-- Outer orange dashed/glowing target ring -->
          <div style="
            position: absolute;
            inset: 0;
            border: 2px solid #f97316;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(249, 115, 22, 0.7);
            background: rgba(249, 115, 22, 0.12);
          "></div>
          <!-- Crosshair ticks -->
          <div style="position: absolute; top: -6px; left: 16px; width: 2px; height: 6px; background: #f97316;"></div>
          <div style="position: absolute; bottom: -6px; left: 16px; width: 2px; height: 6px; background: #f97316;"></div>
          <div style="position: absolute; top: 16px; left: -6px; width: 6px; height: 2px; background: #f97316;"></div>
          <div style="position: absolute; top: 16px; right: -6px; width: 6px; height: 2px; background: #f97316;"></div>
          <!-- Number -->
          <div style="
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #f97316;
            font-size: 13px;
            font-weight: 900;
            text-shadow: 0 0 3px #000, 0 0 6px #000;
          ">${labelText || "20"}</div>
        </div>
      `,
      iconSize: [0, 0],
    });

    const reticle = L.marker([lat, lng], { icon: reticleIcon, interactive: false }).addTo(mapInstanceRef.current);
    targetReticleRef.current = reticle;
  };

  // Highlight selected parliamentary block and dim others
  const updateMapHighlight = (slug: string, lat?: number, lng?: number, wardNum?: string) => {
    if (!mapInstanceRef.current || !geojsonLayerRef.current) return;

    geojsonLayerRef.current.eachLayer((layer: any) => {
      const s = layer.feature?.properties?.pc_slug || layer.feature?.properties?.slug;
      const theme = PARLIAMENTARY_THEMES[s] || { fill: "#1e293b", stroke: "#64748b" };

      if (s === slug) {
        layer.setStyle({
          fillColor: theme.fill,
          fillOpacity: 0.88,
          weight: 2.2,
          color: "#ffffff",
        });
      } else {
        layer.setStyle({
          fillColor: theme.fill,
          fillOpacity: 0.5,
          weight: 1.0,
          color: theme.stroke,
        });
      }
    });

    if (lat && lng) {
      setOrangeTargetReticle(lat, lng, wardNum);
    }
  };

  // Select Constituency and Fetch Details
  const handleSelectConstituency = async (slug: string, wardNum?: string, coordsOverride?: { lat: number; lng: number }) => {
    setLoading(true);
    setActiveSlug(slug);
    if (wardNum) setActiveWardNumber(wardNum);
    setShowDropdown(false);
    setStatusMessage(`Loading ${slug}...`);

    try {
      const res = await fetch(`/api/constituencies/${slug}`);
      const data = await res.json();
      setApiResponseRaw(data);

      if (data.status === "success") {
        const mpData = data.data;
        setSelectedResult({
          success: true,
          matched_by: "selection",
          constituency: mpData.constituency,
          slug: mpData.slug,
          confidence: "exact",
          mp: mpData,
        });

        const lat = coordsOverride?.lat || (mpData.center_coords ? mpData.center_coords[0] : 28.6139);
        const lng = coordsOverride?.lng || (mpData.center_coords ? mpData.center_coords[1] : 77.209);
        updateMapHighlight(slug, lat, lng, wardNum);
        setStatusMessage(`Active: ${mpData.constituency}`);
      }
    } catch (e: any) {
      setStatusMessage(`Error loading MP: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Real-time Search typing with debounce & auto-detection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputQuery(val);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (!val.trim() || val.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    // Auto-detect instant: 6-digit Delhi Pincode (110xxx)
    if (/^110\d{3}$/.test(val.trim())) {
      triggerLocate({ pincode: val.trim() });
      setShowDropdown(false);
      return;
    }

    // Debounced suggestion fetch (180ms)
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(val)}`);
        const json = await res.json();
        if (json.suggestions && json.suggestions.length > 0) {
          setSuggestions(json.suggestions);
          setShowDropdown(true);
        } else {
          setSuggestions([]);
          setShowDropdown(false);
        }
      } catch (err) {
        console.error("Search fetch failed:", err);
      }
    }, 180);
  };

  // Universal Trigger Locate API
  const triggerLocate = async (payload: { lat?: number; lng?: number; pincode?: string; query?: string }) => {
    setLoading(true);
    setStatusMessage("Querying /api/locate...");
    try {
      const res = await fetch("/api/locate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setApiResponseRaw(data);

      if (data.status === "success" && data.result.success) {
        setSelectedResult(data.result);
        setActiveSlug(data.result.slug);
        setStatusMessage(`Matched: ${data.result.constituency} (${data.result.matched_by})`);

        if (data.result.resolved_coords) {
          const { lat, lng } = data.result.resolved_coords;
          updateMapHighlight(data.result.slug, lat, lng, "📍");
          mapInstanceRef.current?.flyTo([lat, lng], 12, { duration: 0.8 });
        }
      } else {
        setSelectedResult(null);
        setStatusMessage(`Location not resolved: ${data.result?.error || data.message || "Not found"}`);
      }
    } catch (e: any) {
      setStatusMessage(`API Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (s: SearchSuggestion) => {
    setInputQuery(s.title);
    setShowDropdown(false);
    handleSelectConstituency(s.slug, undefined, s.coords);
    mapInstanceRef.current?.flyTo([s.coords.lat, s.coords.lng], 12, { duration: 0.8 });
  };

  // Auto-Detect GPS Location Button
  const handleAutoLocate = () => {
    if (!navigator.geolocation) {
      setStatusMessage("Geolocation not supported by your browser.");
      return;
    }

    setLoading(true);
    setStatusMessage("Requesting device GPS coordinates...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setStatusMessage(`GPS: (${latitude.toFixed(4)}, ${longitude.toFixed(4)}). Querying Point-in-Polygon...`);
        triggerLocate({ lat: latitude, lng: longitude });
      },
      (err) => {
        setLoading(false);
        setStatusMessage(`Geolocation failed: ${err.message}. You can type your Pincode or Area above.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const mp = selectedResult?.mp;
  const activeTheme = activeSlug ? PARLIAMENTARY_THEMES[activeSlug] : PARLIAMENTARY_THEMES["chandni-chowk-delhi"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#05070d", color: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Top Header */}
      <header style={{ padding: "12px 24px", background: "#090d16", borderBottom: "1px solid #1a2234", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", zIndex: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.2rem" }}>🗳️</span>
            <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "700", color: "#38bdf8" }}>
              Mera MP Delhi — Constituency Block Tracker
            </h1>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "#94a3b8" }}>
            Dark GIS Visualization • Parliamentary Blocks • Live Search & Geolocation
          </p>
        </div>

        {/* Search & Auto-Locate Controls */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", position: "relative" }}>
          <button
            onClick={handleAutoLocate}
            disabled={loading}
            style={{
              padding: "9px 16px",
              background: "linear-gradient(135deg, #0284c7, #0369a1)",
              color: "#fff",
              border: "1px solid #38bdf8",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "0.85rem",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 8px rgba(2, 132, 199, 0.3)",
            }}
          >
            {loading ? "Detecting..." : "📍 Auto-Detect My Location"}
          </button>

          {/* Autocomplete Input */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Type Pincode (e.g. 110001), MP, or Area..."
              value={inputQuery}
              onChange={handleInputChange}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              style={{
                padding: "9px 14px",
                borderRadius: "8px",
                border: "1px solid #1f293d",
                background: "#0d1322",
                color: "#fff",
                fontSize: "0.9rem",
                width: "320px",
                outline: "none",
              }}
            />

            {/* Live Autocomplete Dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <div style={{
                position: "absolute",
                top: "44px",
                left: 0,
                width: "100%",
                background: "#090d16",
                border: "1px solid #1f293d",
                borderRadius: "8px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
                zIndex: 1000,
                maxHeight: "300px",
                overflowY: "auto",
              }}>
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleSelectSuggestion(s)}
                    style={{
                      padding: "10px 14px",
                      borderBottom: "1px solid #141c2e",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#141d30")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ fontSize: "0.88rem", fontWeight: "600", color: "#f1f5f9", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>{s.type === "constituency" ? "🏛️" : s.type === "mp" ? "👤" : "📍"}</span>
                      {s.title}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "2px" }}>
                      {s.subtitle}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Subheader: Fast Parliamentary Block Selector */}
      <div style={{ padding: "8px 24px", background: "#05070d", borderBottom: "1px solid #141c2e", display: "flex", gap: "8px", alignItems: "center", overflowX: "auto" }}>
        <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Parliamentary Blocks:</span>
        {Object.entries(PARLIAMENTARY_THEMES).map(([slug, theme]) => (
          <button
            key={slug}
            onClick={() => handleSelectConstituency(slug)}
            style={{
              padding: "4px 10px",
              background: activeSlug === slug ? theme.fill : "#0d1322",
              border: `1px solid ${activeSlug === slug ? "#ffffff" : theme.stroke}`,
              borderRadius: "4px",
              color: "#fff",
              fontSize: "0.75rem",
              fontWeight: "700",
              cursor: "pointer",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: theme.stroke, display: "inline-block" }}></span>
            {theme.name}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "#38bdf8", fontWeight: "500" }}>
          ● {statusMessage}
        </span>
      </div>

      {/* Main Grid: Pure Dark GIS Map & MP Inspection Card */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", flex: 1, overflow: "hidden" }}>
        {/* Left: Pure Dark GIS Map */}
        <div style={{ position: "relative", height: "100%", width: "100%", background: "#080808" }}>
          <div ref={mapContainerRef} style={{ height: "100%", width: "100%", background: "#080808" }} />

          {/* Map Legend (Bottom-Left) */}
          <div style={{
            position: "absolute",
            bottom: "16px",
            left: "16px",
            background: "rgba(5, 7, 13, 0.92)",
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1px solid #1a2234",
            fontSize: "0.75rem",
            zIndex: 1000,
            boxShadow: "0 4px 14px rgba(0,0,0,0.7)",
          }}>
            <div style={{ fontWeight: "700", marginBottom: "6px", color: "#38bdf8" }}>7 Parliamentary Blocks:</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
              {Object.entries(PARLIAMENTARY_THEMES).map(([slug, theme]) => (
                <div key={slug} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }} onClick={() => handleSelectConstituency(slug)}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: theme.fill, border: `1px solid ${theme.stroke}`, display: "inline-block" }}></span>
                  <span style={{ color: "#cbd5e1" }}>{theme.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Inspection Card */}
        <div style={{ padding: "24px", overflowY: "auto", background: "#090d16", borderLeft: "1px solid #141c2e" }}>
          {mp ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <div style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    background: activeTheme?.fill || "#0284c7",
                    border: `1px solid ${activeTheme?.stroke || '#38bdf8'}`,
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    color: "#ffffff",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                  }}>
                    {mp.constituency} ({mp.reservation}) {activeWardNumber ? `• Ward ${activeWardNumber}` : ''}
                  </div>
                  <h2 style={{ margin: "0 0 4px 0", fontSize: "1.6rem", fontWeight: "800" }}>{mp.name}</h2>
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>
                    {mp.party} • 18th Lok Sabha • {mp.is_minister ? "Union Minister" : "Member of Parliament"}
                  </p>
                </div>
                <div style={{ textAlign: "right", fontSize: "0.8rem", color: "#94a3b8", background: "#05070d", padding: "8px 12px", borderRadius: "6px", border: "1px solid #141c2e" }}>
                  <div>Match: <strong style={{ color: "#38bdf8" }}>{selectedResult?.matched_by}</strong></div>
                  <div>Status: <strong style={{ color: "#10b981" }}>{selectedResult?.confidence}</strong></div>
                </div>
              </div>

              {/* Parliamentary Indicators */}
              <h3 style={{ fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", borderBottom: "1px solid #141c2e", paddingBottom: "6px", marginTop: "24px" }}>
                Parliamentary Indicators (Official Records)
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                <div style={{ background: "#05070d", padding: "14px", borderRadius: "8px", border: "1px solid #141c2e" }}>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "600" }}>ATTENDANCE</div>
                  <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#38bdf8", marginTop: "4px" }}>
                    {mp.performance.attendance_pct !== null ? `${mp.performance.attendance_pct}%` : "N/A (Minister)"}
                  </div>
                  {mp.performance.prs_averages && (
                    <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "6px" }}>
                      State Avg: {mp.performance.prs_averages.state.attendance_pct}% • Nat: {mp.performance.prs_averages.national.attendance_pct}%
                    </div>
                  )}
                </div>

                <div style={{ background: "#05070d", padding: "14px", borderRadius: "8px", border: "1px solid #141c2e" }}>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "600" }}>DEBATES</div>
                  <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#10b981", marginTop: "4px" }}>
                    {mp.performance.debates !== null ? mp.performance.debates : "N/A (Minister)"}
                  </div>
                  {mp.performance.prs_averages && (
                    <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "6px" }}>
                      State Avg: {mp.performance.prs_averages.state.debates} • Nat: {mp.performance.prs_averages.national.debates}
                    </div>
                  )}
                </div>

                <div style={{ background: "#05070d", padding: "14px", borderRadius: "8px", border: "1px solid #141c2e" }}>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "600" }}>QUESTIONS ASKED</div>
                  <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#f59e0b", marginTop: "4px" }}>
                    {mp.performance.questions !== null ? mp.performance.questions : "N/A (Minister)"}
                  </div>
                  {mp.performance.prs_averages && (
                    <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "6px" }}>
                      State Avg: {mp.performance.prs_averages.state.questions} • Nat: {mp.performance.prs_averages.national.questions}
                    </div>
                  )}
                </div>

                <div style={{ background: "#05070d", padding: "14px", borderRadius: "8px", border: "1px solid #141c2e" }}>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "600" }}>PRIVATE BILLS</div>
                  <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#ec4899", marginTop: "4px" }}>
                    {mp.performance.private_member_bills !== null ? mp.performance.private_member_bills : "N/A (Minister)"}
                  </div>
                  {mp.performance.prs_averages && (
                    <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "6px" }}>
                      National Avg: {mp.performance.prs_averages.national.private_member_bills}
                    </div>
                  )}
                </div>
              </div>

              {/* Background */}
              <h3 style={{ fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", borderBottom: "1px solid #141c2e", paddingBottom: "6px", marginTop: "24px" }}>
                Candidate Background (Affidavit / ECI)
              </h3>
              <div style={{ background: "#05070d", padding: "14px", borderRadius: "8px", border: "1px solid #141c2e", marginTop: "12px", fontSize: "0.88rem" }}>
                <div><strong>Education:</strong> {mp.profile.education || "N/A"}</div>
                <div style={{ marginTop: "6px" }}><strong>Declared Criminal Cases:</strong> {mp.background?.declared_criminal_cases ?? "Not available"} (as declared in election affidavit)</div>
                <div style={{ marginTop: "6px" }}><strong>Age:</strong> {mp.profile.age || "N/A"} years • <strong>Term:</strong> {mp.profile.term_number || "1st Term"}</div>
              </div>

              {/* Raw JSON Debug */}
              <details style={{ marginTop: "20px", background: "#05070d", borderRadius: "8px", border: "1px solid #141c2e", padding: "10px 14px" }}>
                <summary style={{ cursor: "pointer", fontSize: "0.85rem", color: "#38bdf8", fontWeight: "600" }}>
                  View Raw JSON Response (Backend Diagnostic)
                </summary>
                <pre style={{ fontSize: "0.75rem", color: "#94a3b8", overflowX: "auto", marginTop: "10px", background: "#020408", padding: "10px", borderRadius: "6px" }}>
                  {JSON.stringify(apiResponseRaw || selectedResult, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", color: "#64748b" }}>
              <div style={{ fontSize: "3.5rem" }}>🗺️</div>
              <h3 style={{ margin: "14px 0 6px 0", color: "#e2e8f0" }}>No Block Selected</h3>
              <p style={{ margin: 0, fontSize: "0.88rem", maxWidth: "320px", lineHeight: "1.5" }}>
                Type your Pincode (e.g. 110001), MP name, or click any constituency block on the map to inspect.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
