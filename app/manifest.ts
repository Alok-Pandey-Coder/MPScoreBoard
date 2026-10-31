import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mera MP",
    short_name: "Mera MP",
    description: "Source-backed Lok Sabha MP report cards.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8faf9",
    theme_color: "#0f766e",
    icons: [
      { src: "/icon.png", sizes: "2940x1440", type: "image/png" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/favicon.ico", sizes: "32x32", type: "image/x-icon" }
    ],
  };
}
