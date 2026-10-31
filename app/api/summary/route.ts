import { NextResponse } from "next/server";
import { createSummary, type SummaryLanguage } from "@/lib/actions";
import { getMPBySlug, getSnapshotDate } from "@/lib/data";

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(request: Request) {
  let body: { slug?: unknown; lang?: unknown };
  try {
    body = await request.json() as { slug?: unknown; lang?: unknown };
  } catch {
    return errorResponse("INVALID_REQUEST", "Request body must be valid JSON.", 400);
  }

  if (typeof body.slug !== "string" || !["en", "hinglish"].includes(String(body.lang))) {
    return errorResponse("INVALID_REQUEST", 'Expected { slug: string, lang: "en" | "hinglish" }.', 400);
  }

  const mp = getMPBySlug(body.slug);
  if (!mp) return errorResponse("INVALID_SLUG", "No MP found for this constituency.", 404);

  const lang = body.lang as SummaryLanguage;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const prompt = `Summarise only these facts in 3 neutral sentences, in ${lang === "hinglish" ? "Roman Hindi mixed with English" : "English"}: ${JSON.stringify(mp)}`;
      const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: AbortSignal.timeout(8000),
      });
      if (upstream.ok) {
        const data = await upstream.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        const inputNumbers = new Set(JSON.stringify(mp).match(/\b\d+(?:\.\d+)?\b/g) ?? []);
        const outputNumbers = text?.match(/\b\d+(?:\.\d+)?\b/g) ?? [];
        if (text && outputNumbers.every((number) => inputNumbers.has(number))) {
          return NextResponse.json({ text, source: "llm", lang, dataAsOf: getSnapshotDate(), generatedAt: new Date().toISOString() });
        }
      }
    } catch {
      // Template fallback below keeps the API reliable when Gemini is unavailable.
    }
  }
  return NextResponse.json({
    text: createSummary(mp, lang),
    source: "template",
    lang,
    dataAsOf: getSnapshotDate(),
    generatedAt: new Date().toISOString(),
  });
}
