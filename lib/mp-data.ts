import mpsJson from '@/data/processed/mps.json';
import { MPRecord } from '@/types/mp';

export function getAllMPRecords(): MPRecord[] {
  return mpsJson as unknown as MPRecord[];
}

export function getMPRecordBySlug(slug: string): MPRecord | undefined {
  const normalized = slug.trim().toLowerCase();
  return (mpsJson as unknown as MPRecord[]).find(
    (mp) =>
      mp.slug.toLowerCase() === normalized ||
      mp.constituency.toLowerCase().replace(/\s+/g, '-') === normalized
  );
}

