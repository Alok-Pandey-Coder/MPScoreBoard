import { NextResponse } from 'next/server';
import { getMPBySlug } from '@/lib/data';
import { DRAFT_REQUEST_SHAPE, generateCitizenDraft, parseDraftRequest } from '@/lib/ai/draft';
import { apiError, clientKey, createRateLimiter, readJsonBody } from '@/lib/api';

// PRD §6.3: 10 requests per minute per IP.
const limit = createRateLimiter(10, 60_000);

/** Template draft only; citizenName/locality are used transiently and never logged. */
export async function POST(request: Request) {
  const allowed = limit(clientKey(request));
  if (!allowed.ok) {
    return apiError('RATE_LIMITED', 'Too many requests. Please try again shortly.', 429, {
      'Retry-After': String(allowed.retryAfterSec),
    });
  }

  const parsed = parseDraftRequest(await readJsonBody(request));
  if (!parsed) return apiError('INVALID_REQUEST', DRAFT_REQUEST_SHAPE, 400);

  const mp = getMPBySlug(parsed.slug);
  if (!mp) return apiError('INVALID_SLUG', 'No MP found for this constituency.', 404);

  const draft = generateCitizenDraft(mp, {
    intent: parsed.intent,
    lang: parsed.lang,
    citizenName: parsed.citizenName,
    locality: parsed.locality,
  });
  return NextResponse.json({ subject: draft.subject, text: draft.body, source: 'template', lang: draft.lang });
}
