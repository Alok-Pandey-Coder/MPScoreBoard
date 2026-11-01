import type { MPRecord } from '@/types/mp';

/** "Uttar Pradesh" → "uttar-pradesh": the id used by state pages and the map. */
export const toStateId = (state: string): string => state.trim().toLowerCase().replace(/\s+/g, '-');

/** The report-card records for one state (by state id), ordered by constituency name. */
export function recordsForState<T extends Pick<MPRecord, 'state' | 'constituency'>>(mps: T[], stateId: string): T[] {
  return mps
    .filter((mp) => toStateId(mp.state) === stateId)
    .sort((a, b) => a.constituency.localeCompare(b.constituency));
}

/** How many of a state's seats have a report card, counted from the data (never a literal). */
export function coveredCount(mps: Array<Pick<MPRecord, 'state' | 'constituency'>>, stateId: string): number {
  return recordsForState(mps, stateId).length;
}

/** "2 / 2 (100%)", or "0 / 80" when nothing is covered. */
export function coverageText(covered: number, seats: number): string {
  return covered > 0 && seats > 0 ? `${covered} / ${seats} (${Math.round((covered * 100) / seats)}%)` : `${covered} / ${seats}`;
}
