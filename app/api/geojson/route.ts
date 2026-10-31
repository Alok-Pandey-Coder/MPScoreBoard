import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

let cachedWardsGeo: any = null;
let cachedPCGeo: any = null;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "pc" or "wards" (default)

    const dataDir = path.join(process.cwd(), "data", "processed");

    if (type === "pc") {
      if (!cachedPCGeo) {
        const filePath = path.join(dataDir, "delhi_pc.geojson");
        cachedPCGeo = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      }
      return NextResponse.json(cachedPCGeo);
    }

    // Default to enriched wards (exact match to reference screenshot)
    if (!cachedWardsGeo) {
      const filePath = path.join(dataDir, "delhi_wards_enriched.geojson");
      if (fs.existsSync(filePath)) {
        cachedWardsGeo = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } else {
        // Fallback to PC if wards file missing
        const fallbackPath = path.join(dataDir, "delhi_pc.geojson");
        cachedWardsGeo = JSON.parse(fs.readFileSync(fallbackPath, "utf-8"));
      }
    }

    return NextResponse.json(cachedWardsGeo, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
