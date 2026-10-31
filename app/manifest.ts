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
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
