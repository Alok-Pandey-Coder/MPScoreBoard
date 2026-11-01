/**
 * __tests__/state-coverage.test.ts
 * State pages and the map must take their coverage from the data, so a state
 * with report cards (Goa) is shown as available and Delhi is not special-cased.
 */

import fs from 'fs';
import path from 'path';
import { getAllMPs } from '@/lib/data';
import { coverageText, coveredCount, recordsForState, toStateId } from '@/lib/stateCoverage';

const ROOT = path.resolve(__dirname, '..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

describe('state coverage helpers', () => {
  it('turns state names into the ids used by state pages', () => {
    expect(toStateId('Goa')).toBe('goa');
    expect(toStateId('Uttar Pradesh')).toBe('uttar-pradesh');
    expect(toStateId('  West   Bengal ')).toBe('west-bengal');
  });

  it('lists a state\'s report cards by constituency, from the data', async () => {
    const mps = await getAllMPs();
    expect(recordsForState(mps, 'goa').map((m) => m.slug)).toEqual(['north-goa-goa', 'south-goa-goa']);
    expect(coveredCount(mps, 'delhi')).toBe(7);
    expect(coveredCount(mps, 'goa')).toBe(2);
    expect(coveredCount(mps, 'uttar-pradesh')).toBe(0);
  });

  it('formats coverage without inventing a percentage for empty states', () => {
    expect(coverageText(2, 2)).toBe('2 / 2 (100%)');
    expect(coverageText(7, 7)).toBe('7 / 7 (100%)');
    expect(coverageText(0, 80)).toBe('0 / 80');
    expect(coverageText(1, 3)).toBe('1 / 3 (33%)');
  });
});

describe('no hard-coded Delhi coverage in state and map components', () => {
  const files = ['components/state/StateExplorationClient.tsx', 'components/map/IndiaAtlasMap.tsx'];

  it.each(files)('%s does not special-case Delhi coverage numbers', (file) => {
    const source = read(file);
    expect(source).not.toMatch(/'7 \/ 7/);
    expect(source).not.toMatch(/===\s*'delhi'\s*\?\s*7\s*:\s*0/);
  });

  it('the state page builds its seat list from the data, not from a Delhi-only list', () => {
    const source = read('components/state/StateExplorationClient.tsx');
    expect(source).not.toMatch(/DELHI_CONSTITUENCIES/);
    expect(source).toMatch(/recordsForState\(/);
  });
});
