import type { MPRecord } from '@/types/mp';
import type { Lang } from '@/lib/i18n';

/** Lok Sabha seats in the 18th Lok Sabha. */
export const TOTAL_LOK_SABHA_SEATS = 543;

export interface Coverage {
  /** Report cards in the snapshot. */
  seatCount: number;
  stateCount: number;
  /** Sum of MPLADS allocated (₹ crore) across reported seats; null if none reported. */
  mpladsAllocatedCr: number | null;
  mpladsSpentCr: number | null;
  /** Seats whose MPLADS figures feed the totals above. */
  mpladsSeats: number;
}

function sum(values: Array<number | null | undefined>): number | null {
  const present = values.filter((v): v is number => typeof v === 'number');
  return present.length ? present.reduce((a, b) => a + b, 0) : null;
}

/** Coverage figures computed from the data, so the copy never hard-codes a state or count. */
export function getCoverage(mps: MPRecord[]): Coverage {
  const reported = mps.filter((mp) => mp.mplads?.status === 'reported');
  return {
    seatCount: mps.length,
    stateCount: new Set(mps.map((mp) => mp.state)).size,
    mpladsAllocatedCr: sum(reported.map((mp) => mp.mplads?.allocated_cr)),
    mpladsSpentCr: sum(reported.map((mp) => mp.mplads?.expenditure_cr)),
    mpladsSeats: reported.length,
  };
}

/** e.g. "Report cards for 7 of 543 constituencies so far. More are being added." */
export function coverageNote(c: Coverage, lang: Lang = 'en'): string {
  if (lang === 'hi') {
    const phrase =
      c.seatCount === 1 ? 'निर्वाचन क्षेत्र का रिपोर्ट कार्ड उपलब्ध है' : 'निर्वाचन क्षेत्रों के रिपोर्ट कार्ड उपलब्ध हैं';
    return `अब तक ${TOTAL_LOK_SABHA_SEATS} में से ${c.seatCount} ${phrase}। और जोड़े जा रहे हैं।`;
  }
  const noun = c.seatCount === 1 ? 'constituency' : 'constituencies';
  return `Report cards for ${c.seatCount} of ${TOTAL_LOK_SABHA_SEATS} ${noun} so far. More are being added.`;
}
