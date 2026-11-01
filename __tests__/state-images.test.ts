/**
 * Every state picture must carry its provenance (AGENTS.md: every fact needs a source URL and
 * retrieval date) and point at a file that exists.
 */
import fs from 'fs';
import path from 'path';
import { getAllStateImages, getStateIcon } from '@/lib/stateImages';
import { REAL_INDIA_STATES } from '@/lib/realIndiaMapData';

describe('state card pictures', () => {
  const stateIds = new Set(REAL_INDIA_STATES.map((s) => s.id));

  // A plain loop: it.each rejects an empty list, and the manifest starts empty.
  for (const image of getAllStateImages()) {
    it(`${image.stateId} has a real file and full provenance`, () => {
      expect(stateIds.has(image.stateId)).toBe(true);
      expect(fs.existsSync(path.join(process.cwd(), 'public', image.file))).toBe(true);
      expect(image.subject).toBeTruthy();
      expect(image.source_url).toMatch(/^https:\/\//);
      expect(image.licence).toBeTruthy();
      expect(image.retrieved_at).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  }

  it('manifest parses (empty is allowed: states without a picture show an icon)', () => {
    expect(Array.isArray(getAllStateImages())).toBe(true);
  });

  it('every state and union territory has a licensed icon file with provenance', () => {
    for (const { id } of REAL_INDIA_STATES) {
      const icon = getStateIcon(id);
      expect(icon).toBeDefined();
      expect(fs.readFileSync(path.join(process.cwd(), 'public', icon!.file), 'utf-8').startsWith('<svg')).toBe(true);
      expect(icon!.licence).toBe('MIT');
      expect(icon!.source_url).toMatch(/^https:\/\/api\.iconify\.design\//);
      expect(icon!.retrieved_at).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
