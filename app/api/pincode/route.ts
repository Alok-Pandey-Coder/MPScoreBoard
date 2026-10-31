import { NextResponse } from "next/server";
import { getMPBySlug } from "@/lib/data";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { pincode?: unknown };
  if (typeof body.pincode !== "string" || !/^\d{6}$/.test(body.pincode)) return NextResponse.json({ error: { code: "INVALID_REQUEST", message: "Enter a 6-digit pincode." } }, { status: 400 });
  if (process.env.MP_DATA_MODE !== "test") return NextResponse.json({ error: { code: "NOT_AVAILABLE", message: "Verified pincode mapping is not available yet." } }, { status: 501 });
  const mp = body.pincode === "110001" ? getMPBySlug("test-region-01-test-state-a") : undefined;
  return NextResponse.json({ source: "synthetic-test-data", matches: mp ? [{ slug: mp.slug, constituency: mp.constituency, state: mp.state, mp: mp.name }] : [] });
}
