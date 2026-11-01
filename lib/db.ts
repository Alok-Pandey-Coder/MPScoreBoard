import 'server-only';
import { Pool, types, type PoolConfig } from 'pg';
import type { MPRecord, MpladsWork, SnapshotMetadata, Source } from '@/types/mp';

/**
 * lib/db.ts — read-only access to the approved snapshot in YugabyteDB (YSQL).
 * Written by scripts/load_db.py; schema in db/schema.sql. The app never writes.
 */

// Return numbers and dates the way the JSON snapshot has them:
// numeric → number, bigint → number (all values are far below 2^53), date → 'YYYY-MM-DD'.
types.setTypeParser(1700, (v) => parseFloat(v));
types.setTypeParser(20, (v) => Number(v));
types.setTypeParser(1082, (v) => v);

let pool: Pool | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/** Connection-URL parameters that configure TLS; removed when the CA is supplied as text so they cannot override it. */
const URL_TLS_PARAMS = ['ssl', 'sslmode', 'sslrootcert', 'sslcert', 'sslkey', 'uselibpqcompat'];

/**
 * Pool settings from the environment, or null when no database is configured.
 *
 * - DATABASE_URL: postgresql://user:password@host:5433/db. For a local file
 *   certificate add ?sslmode=verify-full&sslrootcert=certs/root.crt (path relative to the project root).
 * - DATABASE_CA_CERT (optional): the CA certificate as PEM text, for hosts that cannot ship a
 *   file such as Vercel. A literal backslash-n sequence is accepted as a line break, so the PEM
 *   can be pasted as one line. The server certificate and host name are always verified.
 *
 * Pure (no connection is made), so it is unit-tested.
 */
export function buildPoolConfig(env: Record<string, string | undefined>): PoolConfig | null {
  const url = env.DATABASE_URL?.trim();
  if (!url) return null;
  const base = { max: 3, connectionTimeoutMillis: 5_000, idleTimeoutMillis: 10_000 };
  const ca = env.DATABASE_CA_CERT?.replace(/\\n/g, '\n').trim();
  if (!ca) return { connectionString: url, ...base };

  const parsed = new URL(url);
  for (const key of URL_TLS_PARAMS) parsed.searchParams.delete(key);
  return { connectionString: parsed.toString(), ssl: { ca, rejectUnauthorized: true }, ...base };
}

function getPool(): Pool {
  if (!pool) {
    const config = buildPoolConfig(process.env);
    if (!config) throw new Error('DATABASE_URL is not set');
    pool = new Pool(config);
    // An idle pooled connection can be reset by the network; without a handler that would crash the server.
    pool.on('error', (error) => console.warn('[db] idle connection error:', error.message));
  }
  return pool;
}

/** One cheap round trip (SELECT 1), for /api/health?deep=1. Never throws; the error text is not exposed. */
export async function pingDatabase(): Promise<{ ok: boolean; ms: number }> {
  const started = Date.now();
  try {
    await getPool().query('SELECT 1');
    return { ok: true, ms: Date.now() - started };
  } catch {
    return { ok: false, ms: Date.now() - started };
  }
}

interface MemberRow {
  slug: string;
  constituency: string;
  state: string;
  reservation: MPRecord['reservation'];
  name: string;
  party: string;
  party_full: string | null;
  term: string;
  since_date: string | null;
  is_minister: boolean;
  special_role: MPRecord['special_role'];
  sansad_mpsno: number | null;
  sansad_status: string | null;
  identity_review_status: string | null;
  profile: MPRecord['profile'] | null;
  image_url: string | null;
  image_source: Source | null;
  normalisation_notes: string[];
  performance: MPRecord['performance'];
  mplads: (Record<string, unknown> & { _works_in_table?: boolean }) | null;
  affidavit: MPRecord['affidavit'] | null;
  election: MPRecord['election'] | null;
}

type WorkRow = MpladsWork & { slug: string };
type SourceRow = { slug: string; name: string; url: string; retrieved_at: string | null; licence: string | null };

/** Rebuilds the MPRecord shape of data/processed/mps.json from the normalised rows. */
export function assembleRecords(members: MemberRow[], works: WorkRow[], sources: SourceRow[]): MPRecord[] {
  const worksBySeat = new Map<string, MpladsWork[]>();
  for (const { slug, ...work } of works) {
    worksBySeat.set(slug, [...(worksBySeat.get(slug) ?? []), work]);
  }
  const sourcesBySeat = new Map<string, Source[]>();
  for (const { slug, licence, ...source } of sources) {
    sourcesBySeat.set(slug, [...(sourcesBySeat.get(slug) ?? []), { ...source, ...(licence ? { licence } : {}) } as Source]);
  }

  return members.map((m) => {
    const { _works_in_table: hadWorks, ...mplads } = m.mplads ?? {};
    // Values are passed through unchanged (null stays null) so the result matches mps.json exactly.
    return {
      slug: m.slug,
      name: m.name,
      constituency: m.constituency,
      state: m.state,
      party: m.party,
      party_full: m.party_full,
      reservation: m.reservation,
      term: m.term,
      since_date: m.since_date,
      is_minister: m.is_minister,
      special_role: m.special_role,
      sansad_mpsno: m.sansad_mpsno,
      sansad_status: m.sansad_status,
      identity_review_status: m.identity_review_status,
      profile: m.profile,
      performance: m.performance,
      mplads: m.mplads ? { ...mplads, ...(hadWorks ? { works: worksBySeat.get(m.slug) ?? [] } : {}) } : null,
      affidavit: m.affidavit,
      election: m.election,
      sources: sourcesBySeat.get(m.slug) ?? [],
      normalisation_notes: m.normalisation_notes,
      ...(m.image_url ? { image_url: m.image_url, image_source: m.image_source } : {}),
    } as unknown as MPRecord;
  });
}

/** The latest approved snapshot, or null if none has been loaded yet. */
export async function readLatestSnapshot(): Promise<{ meta: SnapshotMetadata; records: MPRecord[] } | null> {
  const client = await getPool().connect();
  try {
    const latest = await client.query<{ id: string; meta: SnapshotMetadata }>(
      'SELECT id, meta FROM snapshots ORDER BY loaded_at DESC LIMIT 1',
    );
    if (latest.rowCount === 0) return null;
    const { id, meta } = latest.rows[0];

    const [members, works, sources] = await Promise.all([
      client.query<MemberRow>(
        `SELECT c.slug, c.name AS constituency, c.state, c.reservation,
                m.name, m.party, m.party_full, m.term, m.since_date, m.is_minister, m.special_role, m.sansad_mpsno,
                m.sansad_status, m.identity_review_status, m.profile, m.image_url, m.image_source, m.normalisation_notes,
                p.data AS performance, s.data AS mplads, a.data AS affidavit, e.data AS election
           FROM member_records m
           JOIN constituencies c ON c.slug = m.constituency_slug
           JOIN performance p ON p.snapshot_id = m.snapshot_id AND p.constituency_slug = m.constituency_slug
           LEFT JOIN mplads_summaries s ON s.snapshot_id = m.snapshot_id AND s.constituency_slug = m.constituency_slug
           LEFT JOIN affidavits a ON a.snapshot_id = m.snapshot_id AND a.constituency_slug = m.constituency_slug
           LEFT JOIN elections e ON e.snapshot_id = m.snapshot_id AND e.constituency_slug = m.constituency_slug
          WHERE m.snapshot_id = $1
          ORDER BY c.slug`,
        [id],
      ),
      client.query<WorkRow>(
        `SELECT constituency_slug AS slug, work_id, description, category, implementing_agency, status, status_raw,
                recommended_on, completed_on, recommended_amount_cr, final_amount_cr, paid_cr, has_image
           FROM mplads_works WHERE snapshot_id = $1 ORDER BY constituency_slug, position`,
        [id],
      ),
      client.query<SourceRow>(
        `SELECT constituency_slug AS slug, name, url, retrieved_at, licence
           FROM member_sources WHERE snapshot_id = $1 ORDER BY constituency_slug, position`,
        [id],
      ),
    ]);
    return { meta, records: assembleRecords(members.rows, works.rows, sources.rows) };
  } finally {
    client.release();
  }
}
