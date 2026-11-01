import { NextResponse } from 'next/server';
import { getAllMPs, getDataSource, getDatabaseStatus, getSnapshotDate, getSnapshotMeta } from '@/lib/data';
import { apiError, clientKey, createRateLimiter } from '@/lib/api';

/**
 * Deploy check: which data source is serving and which approved snapshot.
 *
 *   GET /api/health          → what the server loaded (no database round trip)
 *   GET /api/health?deep=1   → also pings the database (SELECT 1) and reports latency
 *
 * `database.status`: not_configured (no DATABASE_URL), ok (serving from the database),
 * empty (configured, but no snapshot loaded yet), unreachable (configured, but the
 * connection failed). `status` is "degraded" when a configured database is not in use;
 * the site keeps serving the bundled JSON snapshot, so the HTTP code stays 200.
 * Nothing here reveals the host, user or any credential.
 */
export const dynamic = 'force-dynamic';

// The deep check touches the database, so it is rate-limited per IP.
const deepLimit = createRateLimiter(10, 60_000);

export async function GET(request: Request) {
  const deep = new URL(request.url).searchParams.get('deep') === '1';
  if (deep) {
    const allowed = deepLimit(clientKey(request));
    if (!allowed.ok) {
      return apiError('RATE_LIMITED', 'Too many deep health checks. Please try again shortly.', 429, {
        'Retry-After': String(allowed.retryAfterSec),
      });
    }
  }

  try {
    const [mps, source, databaseStatus, snapshotDate, meta] = await Promise.all([
      getAllMPs(),
      getDataSource(),
      getDatabaseStatus(),
      getSnapshotDate(),
      getSnapshotMeta(),
    ]);

    const database: Record<string, unknown> = {
      configured: databaseStatus !== 'not_configured',
      status: databaseStatus,
    };
    if (deep) {
      if (databaseStatus === 'not_configured') {
        database.reachable = null;
      } else {
        const { pingDatabase } = await import('@/lib/db');
        const ping = await pingDatabase();
        database.reachable = ping.ok;
        database.latencyMs = ping.ms;
      }
    }

    const degraded = databaseStatus === 'empty' || databaseStatus === 'unreachable';
    return NextResponse.json({
      status: degraded ? 'degraded' : 'ok',
      dataSource: source,
      database,
      snapshotVersion: meta.snapshot_version,
      snapshotSha256: meta.sha256,
      snapshotDate,
      mpCount: mps.length,
    });
  } catch {
    return NextResponse.json({ status: 'error', error: 'Health check failed.' }, { status: 500 });
  }
}
