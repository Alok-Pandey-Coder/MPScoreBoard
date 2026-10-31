import type { Metadata } from "next";
import "./globals.css";
import ThemeToggle from "./theme-toggle";
import PWARegister from "./pwa-register";

export const metadata: Metadata = {
  title: "Mera MP — Delhi report cards",
  description: "Neutral, source-backed report cards for Delhi Lok Sabha MPs.",
  openGraph: {
    title: "Mera MP — Delhi report cards",
    description: "Neutral, source-backed report cards for Delhi Lok Sabha MPs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isTestData = process.env.MP_DATA_MODE === "test";
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
      <body>
        <PWARegister />
        {isTestData && (
          <div
            role="status"
            style={{
              background: "#fff3d4",
              color: "#805b00",
              fontSize: ".8rem",
              fontWeight: 700,
              padding: "8px 16px",
              textAlign: "center",
            }}
          >
            TEST DATA — fictional records for development only
          </div>
        )}
        <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 10 }}>
          <ThemeToggle />
        </div>
        {children}
      </body>
    </html>
  );
}
