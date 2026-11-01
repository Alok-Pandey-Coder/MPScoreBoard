/**
 * The Hindi site rewrites `mp.state` to Hindi (localizeMP), so anything that groups or matches
 * records by state must go through stateIdOf; otherwise Delhi and Goa lose their report cards
 * and the state list is ordered differently from the English site.
 */
import { stateIdOf } from '../lib/stateId';
import { HINDI_STATES, localizeMP, localizeState } from '../lib/i18n/localizeData';
import { REAL_INDIA_STATES } from '../lib/realIndiaMapData';
import { INDIA_STATES } from '../lib/indiaGeoData';
import { getAllMPsSync } from './helpers/mps';

describe('stateIdOf', () => {
  it('maps a Hindi state name back to the id of one of its English spellings', () => {
    // Several English spellings can share one Hindi name (e.g. "and" vs "&"), so match any of them.
    for (const hi of new Set(Object.values(HINDI_STATES))) {
      const spellings = Object.entries(HINDI_STATES).filter(([, v]) => v === hi).map(([en]) => stateIdOf(en));
      expect(spellings).toContain(stateIdOf(hi));
    }
  });

  it('is unchanged for English names', () => {
    expect(stateIdOf('Delhi')).toBe('delhi');
    expect(stateIdOf('West Bengal')).toBe('west-bengal');
  });

  it('groups every record under the same state id in both languages', () => {
    const mps = getAllMPsSync();
    const ids = (lang: 'en' | 'hi') => mps.map((mp) => stateIdOf(localizeMP(mp, lang).state));
    expect(ids('hi')).toEqual(ids('en'));
  });
});

describe('Hindi state names', () => {
  it('cover every state and union territory used by the atlas and the state pages', () => {
    for (const name of [...REAL_INDIA_STATES.map((s) => s.name), ...INDIA_STATES.map((s) => s.name)]) {
      expect(localizeState(name, 'hi')).not.toBe(name);
    }
  });
});
