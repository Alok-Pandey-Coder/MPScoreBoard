import type { MPRecord } from '@/types/mp';

/**
 * How many MPs a PRS state average covers: the state's non-minister MPs with
 * reported activity (PRS excludes ministers). Computed from the data, so it is
 * only meaningful when the dataset holds every seat of that state; the
 * pipeline already makes that assumption when it reconciles state averages
 * against PRS's published figures.
 */
export function stateAverageSampleSize(mps: MPRecord[], state: string): number {
  return mps.filter((mp) => mp.state === state && !mp.is_minister && mp.performance.status === 'reported').length;
}

/** True when the average is small enough that readers should be told what it is based on (PRD 5.6, T6). */
export function isSmallSample(n: number | undefined): n is number {
  return typeof n === 'number' && n >= 1 && n <= 2;
}
