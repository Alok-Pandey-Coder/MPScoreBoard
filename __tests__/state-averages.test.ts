/**
 * __tests__/state-averages.test.ts
 * PRD 5.6 / T6: a PRS state average based on only one or two MPs must say so,
 * and must not be presented as a comparison of an MP with themselves.
 */

import { getAllMPs } from '@/lib/data';
import { isSmallSample, stateAverageSampleSize } from '@/lib/stateAverages';
import { cardMessages } from '@/lib/messages/card';

describe('stateAverageSampleSize', () => {
  it('counts only non-minister MPs with reported activity, per state', async () => {
    const mps = await getAllMPs();
    const delhi = mps.filter((m) => m.state === 'Delhi');
    const goa = mps.filter((m) => m.state === 'Goa');
    expect(stateAverageSampleSize(mps, 'Delhi')).toBe(delhi.filter((m) => !m.is_minister).length);
    // Goa: one of its two MPs is a minister (PRS excludes ministers), so the average covers one MP.
    expect(goa).toHaveLength(2);
    expect(stateAverageSampleSize(mps, 'Goa')).toBe(1);
  });

  it('is 0 for a state with no data', async () => {
    expect(stateAverageSampleSize(await getAllMPs(), 'Nowhere')).toBe(0);
  });

  it('agrees with the PRS-published average: a one-MP average equals that MP\'s own value', async () => {
    const mps = await getAllMPs();
    const only = mps.find((m) => m.state === 'Goa' && !m.is_minister)!;
    const avg = only.performance.prs_averages!.state;
    expect(avg.attendance_pct).toBe(only.performance.attendance_pct);
    expect(avg.questions).toBe(only.performance.questions);
  });
});

describe('isSmallSample', () => {
  it('flags one or two MPs only', () => {
    expect(isSmallSample(1)).toBe(true);
    expect(isSmallSample(2)).toBe(true);
    expect(isSmallSample(0)).toBe(false);
    expect(isSmallSample(3)).toBe(false);
    expect(isSmallSample(undefined)).toBe(false);
  });
});

describe('small-sample wording', () => {
  it('exists in English and Hindi, names the state and the count, and is neutral', () => {
    expect(cardMessages.en.stateAverageSmallSample('Goa', 2)).toBe('The Goa average is based on only 2 MPs.');
    expect(cardMessages.hi.stateAverageSmallSample('गोवा', 2)).toContain('2');
    expect(cardMessages.hi.stateAverageSmallSample('गोवा', 2)).toContain('गोवा');
    for (const text of [cardMessages.en.stateAverageSelfOnly, cardMessages.hi.stateAverageSelfOnly]) {
      expect(text.length).toBeGreaterThan(10);
      expect(text).not.toMatch(/best|worst|lazy|failed|useless|आलसी|नाकाम|बेकार/i);
    }
  });
});
