import { NextResponse } from 'next/server';
import { getMPBySlug } from '@/lib/data';
import { generateCitizenDraft } from '@/lib/ai/draft';
import { apiError, clientKey, createRateLimiter, readJsonBody } from '@/lib/api';
import type { CitizenIntent } from '@/types/mp';

const INTENTS: readonly CitizenIntent[] = ['mplads_works', 'parliament_question', 'attendance_clarification', 'general_feedback'];
const ALLOWED_KEYS = new Set(['slug', 'intent', 'lang', 'citizenName', 'locality']);
const MAX_FIELD = 60;

// PRD §6.3: 10 requests per minute per IP.
const limit = createRateLimiter(10, 60_000);

function optionalText(value: unknown): string | undefined | false {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value.length > MAX_FIELD) return false;
  return value;
}

/** Template draft only; citizenName/locality are used transiently and never logged. */
export async function POST(request: Request) {
  const allowed = limit(clientKey(request));
  if (!allowed.ok) {
    return apiError('RATE_LIMITED', 'Too many requests. Please try again shortly.', 429, {
      'Retry-After': String(allowed.retryAfterSec),
    });
  }

  const body = await readJsonBody(request);
  const citizenName = optionalText(body?.citizenName);
  const locality = optionalText(body?.locality);
  if (
    !body ||
    typeof body.slug !== 'string' ||
    !INTENTS.includes(body.intent as CitizenIntent) ||
    (body.lang !== 'en' && body.lang !== 'hinglish') ||
    citizenName === false ||
    locality === false ||
    Object.keys(body).some((key) => !ALLOWED_KEYS.has(key))
  ) {
    return apiError(
      'INVALID_REQUEST',
      `Expected { slug, intent: ${INTENTS.join(' | ')}, lang: "en" | "hinglish", citizenName?, locality? } (text ≤ ${MAX_FIELD} chars).`,
      400,
    );
  }

  const mp = getMPBySlug(body.slug);
  if (!mp) return apiError('INVALID_SLUG', 'No MP found for this constituency.', 404);

  const draft = generateCitizenDraft(mp, {
    intent: body.intent as CitizenIntent,
    lang: body.lang as 'en' | 'hinglish',
    citizenName,
    locality,
  });
  return NextResponse.json({ subject: draft.subject, text: draft.body, source: 'template', lang: draft.lang });
}
