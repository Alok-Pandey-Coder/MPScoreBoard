import { NextResponse } from 'next/server';

/** PRD §6.3 error contract: { error: { code, message } }. */
export function apiError(
  code: 'INVALID_REQUEST' | 'INVALID_SLUG' | 'RATE_LIMITED' | 'INTERNAL',
  message: string,
  status: number,
  headers?: Record<string, string>,
) {
  return NextResponse.json({ error: { code, message } }, { status, headers });
}

/** Maximum accepted JSON body size for POST routes (PRD §6.3: ≤ 2 KB). */
export const MAX_BODY_BYTES = 2048;

/**
 * Reads a small JSON object body. Returns null for oversize, malformed or
 * non-object bodies so the caller can answer INVALID_REQUEST.
 */
export async function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Fixed-window, in-memory, per-IP limiter. Per server instance only. */
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return function check(key: string): { ok: true } | { ok: false; retryAfterSec: number } {
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return { ok: true };
    }
    entry.count += 1;
    if (entry.count > limit) {
      return { ok: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
    }
    return { ok: true };
  };
}

/** Best-effort client IP for rate limiting; never stored or logged. */
export function clientKey(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'local';
}
