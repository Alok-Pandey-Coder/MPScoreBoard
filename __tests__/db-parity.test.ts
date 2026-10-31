/**
 * __tests__/db-parity.test.ts
 * Proves the YugabyteDB round trip is lossless: the latest approved snapshot,
 * read back through lib/db.ts, equals data/processed/mps.json field for field.
 * Runs only when DATABASE_URL is set (after scripts/load_db.py); skipped otherwise.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = path.resolve(__dirname, '..');
const run = process.env.DATABASE_URL ? describe : describe.skip;

run('YugabyteDB snapshot parity', () => {
  it('reads back exactly the approved mps.json and snapshot', async () => {
    const { readLatestSnapshot } = await import('@/lib/db');
    const latest = await readLatestSnapshot();
    expect(latest).not.toBeNull();

    const bytes = fs.readFileSync(path.join(ROOT, 'data/processed/mps.json'));
    const expected = JSON.parse(bytes.toString('utf-8'));
    // Compare as JSON values (18 and 18.0 are the same number).
    expect(JSON.parse(JSON.stringify(latest!.records))).toEqual(expected);
    expect(latest!.meta.sha256).toBe(crypto.createHash('sha256').update(bytes).digest('hex'));
  });
});
