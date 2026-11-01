import { HINDI_STATES } from '@/lib/i18n/localizeData';

const ENGLISH_BY_HINDI = Object.fromEntries(Object.entries(HINDI_STATES).map(([en, hi]) => [hi, en]));

/**
 * The state id ("goa", "west-bengal") for a state name in either language.
 *
 * `localizeMP` rewrites `mp.state` to Hindi on the Hindi site, so grouping or matching
 * records by a slug of that field silently fails there (Delhi and Goa looked like states
 * without report cards). Always derive the id through this function.
 */
export function stateIdOf(state: string): string {
  const english = ENGLISH_BY_HINDI[state.trim()] ?? state;
  return english.trim().toLowerCase().replace(/\s+/g, '-');
}
