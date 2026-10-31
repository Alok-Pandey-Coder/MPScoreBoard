import { NextResponse } from 'next/server';
import { getMPBySlug, getSnapshotDate } from '@/lib/data';
import { AI_LANGS_TEXT, generateTemplateSummary, parseSummaryRequest } from '@/lib/ai/summary';
import { generateLlmSummary } from '@/lib/ai/llm';
import { apiError, clientKey, createRateLimiter, readJsonBody } from '@/lib/api';

// PRD §6.3: 20 requests per minute per IP.
const limit = createRateLimiter(20, 60_000);
// LLM output cached per (slug, lang) for the life of the server instance.
const cache = new Map<string, string>();

export async function POST(request: Request) {
  const allowed = limit(clientKey(request));
  if (!allowed.ok) {
    return apiError('RATE_LIMITED', 'Too many requests. Please try again shortly.', 429, {
      'Retry-After': String(allowed.retryAfterSec),
    });
  }

  const parsed = parseSummaryRequest(await readJsonBody(request));
  if (!parsed) {
    return apiError('INVALID_REQUEST', `Expected { slug: string, lang: ${AI_LANGS_TEXT} }.`, 400);
  }

  const mp = getMPBySlug(parsed.slug);
  if (!mp) return apiError('INVALID_SLUG', 'No MP found for this constituency.', 404);

  const lang = parsed.lang;
  const cacheKey = `${mp.slug}:${lang}`;
  let text = cache.get(cacheKey) ?? null;
  if (!text) {
    text = await generateLlmSummary(mp, lang);
    if (text) cache.set(cacheKey, text);
  }

  return NextResponse.json({
    text: text ?? generateTemplateSummary(mp, lang),
    source: text ? 'llm' : 'template',
    lang,
    dataAsOf: getSnapshotDate(),
    generatedAt: new Date().toISOString(),
  });
}
