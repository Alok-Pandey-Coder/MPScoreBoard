/**
 * __tests__/i18n-data.test.ts
 * PRD 5.6 "Names: preserve the official spelling": the Hindi UI localizes
 * state and party names only. MP names, constituencies, education text,
 * runner-up names and MPLADS work descriptions/agencies stay as published.
 * Hindi-script aliases remain available for search only. Missing values are
 * never replaced with an invented party/reservation.
 */

import fs from 'fs';
import path from 'path';
import mpsData from '@/data/processed/mps.json';
import type { MPRecord } from '@/types/mp';
import { localizeMP, localizeParty, localizeState, localizeName, localizeConstituency } from '@/lib/i18n';
import { searchMPs } from '@/lib/search';

const mps = mpsData as unknown as MPRecord[];
const ROOT = path.join(__dirname, '..');

describe('localizeMP (hi) keeps official spellings', () => {
  it.each(mps.map((mp) => [mp.name, mp] as const))('%s', (_name, mp) => {
    const hi = localizeMP(mp, 'hi');
    expect(hi.name).toBe(mp.name);
    expect(hi.constituency).toBe(mp.constituency);
    expect(hi.profile?.education).toBe(mp.profile?.education);
    expect(hi.affidavit?.education).toBe(mp.affidavit?.education);
    expect(hi.election?.runner_up?.name).toBe(mp.election?.runner_up?.name);

    const works = mp.mplads?.works ?? [];
    const hiWorks = hi.mplads?.works ?? [];
    expect(hiWorks).toHaveLength(works.length);
    works.forEach((w, i) => {
      expect(hiWorks[i].description).toBe(w.description);
      expect(hiWorks[i].implementing_agency).toBe(w.implementing_agency);
    });
  });

  it('still localizes state and party names', () => {
    const mp = mps[0];
    const hi = localizeMP(mp, 'hi');
    expect(hi.state).toBe(localizeState(mp.state, 'hi'));
    expect(hi.state).toBe('दिल्ली');
    expect(hi.party).toBe(localizeParty(mp.party, 'hi'));
    expect(hi.party).toBe('भाजपा');
  });

  it('returns the record untouched for English', () => {
    expect(localizeMP(mps[0], 'en')).toBe(mps[0]);
  });

  it('deprecated name/constituency helpers are identity functions', () => {
    expect(localizeName('Bansuri Swaraj', 'hi')).toBe('Bansuri Swaraj');
    expect(localizeConstituency('North West Delhi (SC)', 'hi')).toBe('North West Delhi (SC)');
  });
});

describe('Hindi search aliases', () => {
  it.each([
    ['बांसुरी', 'Bansuri Swaraj'],
    ['मनोज', 'Manoj Kumar Tiwari'],
    ['चांदनी चौक', 'Praveen Khandelwal'],
    ['पश्चिम दिल्ली', 'Kamaljeet Sehrawat'],
  ])('"%s" finds %s', (query, expected) => {
    const names = searchMPs(query, mps).map((m) => m.name);
    expect(names).toContain(expected);
  });

  it('works on Hindi-localized records too', () => {
    const hiMps = mps.map((mp) => localizeMP(mp, 'hi'));
    expect(searchMPs('बांसुरी', hiMps).map((m) => m.name)).toContain('Bansuri Swaraj');
  });
});

describe('missing values are never invented', () => {
  it('localizeParty returns empty for a missing party', () => {
    expect(localizeParty(null, 'hi')).toBe('');
    expect(localizeParty(undefined, 'en')).toBe('');
    expect(localizeParty('', 'hi')).toBe('');
  });

  it('localizeMP does not fill a missing party', () => {
    const noParty = { ...mps[0], party: '', party_full: undefined } as MPRecord;
    expect(localizeMP(noParty, 'hi').party).toBe('');
  });

  it('map/home/explore/state components contain no invented party/reservation fallbacks', () => {
    const dirs = ['components/map', 'components/home', 'components/explore', 'components/state'];
    const files = dirs.flatMap((d) =>
      fs
        .readdirSync(path.join(ROOT, d))
        .filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'))
        .map((f) => path.join(ROOT, d, f)),
    );
    const invented = /(\|\||\?\?)\s*['"](BJP|INC|AAP|GEN|SC|ST)['"]/;
    for (const f of files) {
      expect({ file: path.relative(ROOT, f), hit: invented.test(fs.readFileSync(f, 'utf8')) }).toEqual({
        file: path.relative(ROOT, f),
        hit: false,
      });
    }
  });
});
