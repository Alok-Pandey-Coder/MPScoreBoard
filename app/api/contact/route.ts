import { NextResponse } from "next/server";
import { getMPBySlug } from "@/lib/data";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug || !getMPBySlug(slug)) return NextResponse.json({ error: { code: "INVALID_SLUG", message: "No MP found." } }, { status: 404 });
  if (process.env.MP_DATA_MODE !== "test") return NextResponse.json({ error: { code: "NOT_AVAILABLE", message: "Trusted contact data is not available yet." } }, { status: 501 });
  return NextResponse.json({ source: "synthetic-test-data", contact: { office: "Test constituency office", email: "example@example.com", phone: null } });
}
