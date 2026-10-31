import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mera MP Delhi - API Test Harness",
  description: "Test harness for Delhi Lok Sabha MP Performance and Location APIs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossOrigin=""
          async
        ></script>
        <style>{`
          .leaflet-container {
            background-color: #080808 !important;
          }
          .dark-gis-tile-layer {
            filter: brightness(0.65) contrast(1.3) grayscale(0.2);
          }
          .leaflet-control-scale-line {
            background: rgba(9, 13, 22, 0.9) !important;
            border: 1px solid #334155 !important;
            border-top: none !important;
            color: #cbd5e1 !important;
            font-size: 10px !important;
            font-weight: 700 !important;
            padding: 2px 5px !important;
          }
          .dark-map-tooltip {
            background: rgba(9, 13, 22, 0.95) !important;
            border: 1px solid #334155 !important;
            color: #f8fafc !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.6) !important;
            border-radius: 6px !important;
            padding: 4px 8px !important;
          }
          .dark-map-tooltip::before {
            border-top-color: #334155 !important;
          }
        `}</style>
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
