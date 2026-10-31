import { NextRequest, NextResponse } from "next/server";
import { getAllMPs, getGeoJSON } from "@/lib/data";
import { DELHI_PINCODES } from "@/lib/delhi_pincodes";

export interface SearchSuggestion {
  id: string;
  type: "constituency" | "mp" | "pincode" | "area";
  title: string;
  subtitle: string;
  slug: string;
  coords: { lat: number; lng: number };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    if (!q || q.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions: SearchSuggestion[] = [];
    const mps = getAllMPs();
    const geo = getGeoJSON();

    // 1. Match Constituencies
    for (const mp of mps) {
      if (mp.constituency.toLowerCase().includes(q)) {
        const feat = geo.features.find((f: any) => f.properties.slug === mp.slug);
        const center = feat?.properties?.center || [28.6139, 77.209];
        suggestions.push({
          id: `const-${mp.slug}`,
          type: "constituency",
          title: mp.constituency,
          subtitle: `Lok Sabha Constituency • MP: ${mp.name} (${mp.party})`,
          slug: mp.slug,
          coords: { lat: center[0], lng: center[1] },
        });
      }
    }

    // 2. Match MPs
    for (const mp of mps) {
      if (mp.name.toLowerCase().includes(q)) {
        const feat = geo.features.find((f: any) => f.properties.slug === mp.slug);
        const center = feat?.properties?.center || [28.6139, 77.209];
        suggestions.push({
          id: `mp-${mp.slug}`,
          type: "mp",
          title: mp.name,
          subtitle: `Member of Parliament • ${mp.constituency} (${mp.party})`,
          slug: mp.slug,
          coords: { lat: center[0], lng: center[1] },
        });
      }
    }

    // 3. Match Pincodes & Areas
    for (const [code, info] of Object.entries(DELHI_PINCODES)) {
      const codeMatch = code.includes(q);
      const areaMatch = info.area.toLowerCase().includes(q);

      if (codeMatch || areaMatch) {
        suggestions.push({
          id: `pin-${code}`,
          type: codeMatch ? "pincode" : "area",
          title: `${code} - ${info.area.split(",")[0]}`,
          subtitle: `${info.area} • In ${info.constituency_name}`,
          slug: info.constituency_slug,
          coords: { lat: info.lat, lng: info.lng },
        });
      }
      if (suggestions.length >= 10) break; // limit to 10 suggestions
    }

    return NextResponse.json({
      query: q,
      count: suggestions.length,
      suggestions: suggestions.slice(0, 8),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

