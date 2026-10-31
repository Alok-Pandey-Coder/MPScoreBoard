/**
 * __tests__/i18n-home.test.ts
 * Home and map UI text: the coverage note in both languages, and a non-empty
 * Hindi value for every English key in homeMessages and mapMessages.
 */

import { coverageNote, TOTAL_LOK_SABHA_SEATS, type Coverage } from '@/lib/coverage';
import { homeMessages } from '@/lib/messages/home';
import { mapMessages } from '@/lib/messages/map';

const coverage = (seatCount: number): Coverage => ({
  seatCount,
  stateCount: 1,
  mpladsAllocatedCr: null,
  mpladsSpentCr: null,
  mpladsSeats: 0,
});

describe('coverageNote', () => {
  it('keeps the English text unchanged', () => {
    expect(coverageNote(coverage(7))).toBe(
      `Report cards for 7 of ${TOTAL_LOK_SABHA_SEATS} constituencies so far. More are being added.`,
    );
    expect(coverageNote(coverage(1), 'en')).toBe(
      `Report cards for 1 of ${TOTAL_LOK_SABHA_SEATS} constituency so far. More are being added.`,
    );
  });

  it('has a Hindi version with the counts and no hard-coded state', () => {
    for (const n of [1, 7, 120]) {
      const hi = coverageNote(coverage(n), 'hi');
      expect(hi).toContain(String(n));
      expect(hi).toContain(String(TOTAL_LOK_SABHA_SEATS));
      expect(hi).not.toMatch(/Delhi|दिल्ली/);
      expect(hi).toMatch(/[ऀ-ॿ]/);
    }
  });
});

/** Calls a message value with sample arguments of the right type. */
function render(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (typeof value === 'function') {
    const args = Array.from({ length: value.length }, (_, i) => (i % 2 === 0 ? 7 : 'Sample'));
    return [String((value as (...a: unknown[]) => unknown)(...args))];
  }
  if (value && typeof value === 'object') return Object.values(value).flatMap(render);
  return [];
}

describe.each([
  ['homeMessages', homeMessages],
  ['mapMessages', mapMessages],
] as const)('%s', (_name, messages) => {
  const en = messages.en as Record<string, unknown>;
  const hi = messages.hi as Record<string, unknown>;

  it('has the same keys in English and Hindi', () => {
    expect(Object.keys(hi).sort()).toEqual(Object.keys(en).sort());
  });

  it.each(Object.keys(en))('%s has a non-empty Hindi value', (key) => {
    const values = render(hi[key]);
    expect(values.length).toBeGreaterThan(0);
    for (const v of values) expect(v.trim().length).toBeGreaterThan(0);
    // Nested groups (e.g. region names) must cover the same entries.
    if (en[key] && typeof en[key] === 'object') {
      expect(Object.keys(hi[key] as object).sort()).toEqual(Object.keys(en[key] as object).sort());
    }
  });

  it('uses no judgemental words in Hindi', () => {
    const all = Object.values(hi).flatMap(render).join(' ');
    for (const word of ['आपराधिक सांसद', 'सबसे खराब', 'सबसे अच्छा', 'आलसी', 'नाकाम', 'बेकार']) {
      expect(all).not.toContain(word);
    }
  });
});
