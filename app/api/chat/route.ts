import { NextResponse } from "next/server";
import { answerFromSnapshot, type SummaryLanguage } from "@/lib/actions";
import { getMPBySlug } from "@/lib/data";

export async function POST(request: Request) {
  let body: { slug?: unknown; question?: unknown; lang?: unknown };
  try { body = await request.json() as typeof body; } catch { return NextResponse.json({ error: { code: "INVALID_REQUEST", message: "Invalid JSON." } }, { status: 400 }); }
  if (typeof body.slug !== "string" || typeof body.question !== "string" || body.question.length < 1 || body.question.length > 500 || (body.lang !== "en" && body.lang !== "hinglish")) {
    return NextResponse.json({ error: { code: "INVALID_REQUEST", message: "Expected slug, question (1-500 chars), and language." } }, { status: 400 });
  }
  const mp = getMPBySlug(body.slug);
  if (!mp) return NextResponse.json({ error: { code: "INVALID_SLUG", message: "No MP found." } }, { status: 404 });
  return NextResponse.json({ text: answerFromSnapshot(mp, body.question, body.lang as SummaryLanguage), source: "template" });
}
