import { NextResponse } from 'next/server';
import { getAllMPs, getDataSource, getSnapshotDate, getSnapshotMeta } from '@/lib/data';

// Reports which data source is serving (YugabyteDB or the JSON snapshot) and
// which approved snapshot, so a deploy can be checked at a glance.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [mps, source, snapshotDate, meta] = await Promise.all([
      getAllMPs(),
      getDataSource(),
      getSnapshotDate(),
      getSnapshotMeta(),
    ]);
    return NextResponse.json({
      status: 'ok',
      dataSource: source,
      snapshotVersion: meta.snapshot_version,
      snapshotSha256: meta.sha256,
      snapshotDate,
      mpCount: mps.length,
    });
  } catch {
    return NextResponse.json({ status: 'error', error: 'Health check failed.' }, { status: 500 });
  }
}
