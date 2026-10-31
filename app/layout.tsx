import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeToggle from "./theme-toggle";
import PWARegister from "./pwa-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mera MP — Delhi report cards",
  description: "Neutral, source-backed report cards for Delhi Lok Sabha MPs.",
  openGraph: {
    title: "Mera MP — Delhi report cards",
    description: "Neutral, source-backed report cards for Delhi Lok Sabha MPs.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const isTestData = process.env.MP_DATA_MODE === "test";
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <PWARegister />
        {isTestData && <div role="status" style={{ background: "#fff3d4", color: "#805b00", fontSize: ".8rem", fontWeight: 700, padding: "8px 16px", textAlign: "center" }}>TEST DATA — fictional records for development only</div>}
        <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 10 }}><ThemeToggle /></div>
        {children}
      </body>
    </html>
  );
}
