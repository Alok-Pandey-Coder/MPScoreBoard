import { NextResponse } from "next/server";
import { getAllMPs } from "@/lib/data";

export function GET() {
  return NextResponse.json(getAllMPs().map((mp) => ({
    slug: mp.slug,
    name: mp.name,
    constituency: mp.constituency,
    state: mp.state,
    party: mp.party,
  })), {
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  });
}
