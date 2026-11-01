import fs from 'fs';
import path from 'path';
import type { MPRecord } from '../../types/mp';

export function getAllMPsSync(): MPRecord[] {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'processed', 'mps.json'), 'utf-8'));
}
