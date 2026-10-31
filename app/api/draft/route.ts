import { NextResponse } from "next/server";
import { createDraft, draftIntents, type DraftIntent, type SummaryLanguage } from "@/lib/actions";
import { getMPBySlug } from "@/lib/data";

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(request: Request) {
  let body: { slug?: unknown; intent?: unknown; lang?: unknown };
  try {
    body = await request.json() as { slug?: unknown; intent?: unknown; lang?: unknown };
  } catch {
    return errorResponse("INVALID_REQUEST", "Request body must be valid JSON.", 400);
  }

  const validIntent = typeof body.intent === "string" && body.intent in draftIntents;
  const validLanguage = body.lang === "en" || body.lang === "hinglish";
  if (typeof body.slug !== "string" || !validIntent || !validLanguage) {
    return errorResponse("INVALID_REQUEST", "Unknown slug, intent, or language.", 400);
  }

  const mp = getMPBySlug(body.slug);
  if (!mp) return errorResponse("INVALID_SLUG", "No MP found for this constituency.", 404);

  const intent = body.intent as DraftIntent;
  const lang = body.lang as SummaryLanguage;
  return NextResponse.json({ text: createDraft(mp, intent, lang), source: "template", lang });
}
