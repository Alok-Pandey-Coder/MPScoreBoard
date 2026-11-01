import { MPRecord, MpladsWork } from '@/types/mp';
import { Lang } from '@/lib/i18n';

/**
 * lib/i18n/localizeData.ts
 *
 * Hindi display localization for MP data records.
 *
 * PRD 5.6 "Names: preserve the official spelling": MP names, constituency
 * names, runner-up names, education text, MPLADS work descriptions and
 * implementing agency names are ALWAYS displayed exactly as published, in
 * both the English and Hindi UI. Only state names, political party names and
 * UI-label style fields (reservation category, term, gender, MPLADS sector
 * category) are localized for display.
 *
 * Hindi-script name/constituency aliases used for search live in
 * lib/search.ts and must never be used for display.
 */

export const HINDI_STATES: Record<string, string> = {
  Delhi: 'दिल्ली',
  'Andhra Pradesh': 'आंध्र प्रदेश',
  'Arunachal Pradesh': 'अरुणाचल प्रदेश',
  Assam: 'असम',
  Bihar: 'बिहार',
  Chhattisgarh: 'छत्तीसगढ़',
  Goa: 'गोवा',
  Gujarat: 'गुजरात',
  Haryana: 'हरियाणा',
  'Himachal Pradesh': 'हिमाचल प्रदेश',
  Jharkhand: 'झारखंड',
  Karnataka: 'कर्नाटक',
  Kerala: 'केरल',
  'Madhya Pradesh': 'मध्य प्रदेश',
  Maharashtra: 'महाराष्ट्र',
  Manipur: 'मणिपुर',
  Meghalaya: 'मेघालय',
  Mizoram: 'मिज़ोरम',
  Nagaland: 'नागालैंड',
  Odisha: 'ओडिशा',
  Punjab: 'पंजाब',
  Rajasthan: 'राजस्थान',
  Sikkim: 'सिक्किम',
  'Tamil Nadu': 'तमिलनाडु',
  Telangana: 'तेलंगाना',
  Tripura: 'त्रिपुरा',
  'Uttar Pradesh': 'उत्तर प्रदेश',
  Uttarakhand: 'उत्तराखंड',
  'West Bengal': 'पश्चिम बंगाल',
  'Jammu and Kashmir': 'जम्मू और कश्मीर',
  Ladakh: 'लद्दाख',
  Puducherry: 'पुडुचेरी',
  Chandigarh: 'चंडीगढ़',
  'Andaman and Nicobar Islands': 'अंडमान और निकोबार द्वीप समूह',
  'Dadra and Nagar Haveli and Daman and Diu': 'दादरा और नगर हवेली एवं दमन और दीव',
  Lakshadweep: 'लक्षद्वीप',
  // Spellings used by the atlas data (lib/realIndiaMapData.ts, lib/indiaGeoData.ts).
  'Jammu & Kashmir': 'जम्मू और कश्मीर',
  'Andaman & Nicobar': 'अंडमान और निकोबार द्वीप समूह',
  'Andaman & Nicobar Islands': 'अंडमान और निकोबार द्वीप समूह',
  'Daman & Diu': 'दमन और दीव',
  'Dadra & Nagar Haveli and Daman & Diu': 'दादरा और नगर हवेली एवं दमन और दीव',
  'Delhi (NCT)': 'दिल्ली (एनसीटी)',
};

export const HINDI_PARTIES: Record<string, { short: string; full: string }> = {
  BJP: { short: 'भाजपा', full: 'भारतीय जनता पार्टी' },
  'Bharatiya Janata Party': { short: 'भाजपा', full: 'भारतीय जनता पार्टी' },
  AAP: { short: 'आप', full: 'आम आदमी पार्टी' },
  'Aam Aadmi Party': { short: 'आप', full: 'आम आदमी पार्टी' },
  INC: { short: 'कांग्रेस', full: 'भारतीय राष्ट्रीय कांग्रेस' },
  'Indian National Congress': { short: 'कांग्रेस', full: 'भारतीय राष्ट्रीय कांग्रेस' },
  IND: { short: 'निर्दलीय', full: 'निर्दलीय' },
  Independent: { short: 'निर्दलीय', full: 'निर्दलीय' },
  SP: { short: 'सपा', full: 'समाजवादी पार्टी' },
  'Samajwadi Party': { short: 'सपा', full: 'समाजवादी पार्टी' },
  AITC: { short: 'तृणमूल कांग्रेस', full: 'अखिल भारतीय तृणमूल कांग्रेस' },
  TMC: { short: 'तृणमूल कांग्रेस', full: 'अखिल भारतीय तृणमूल कांग्रेस' },
  DMK: { short: 'द्रमुक', full: 'द्रविड़ मुन्नेत्र कषगम' },
  TDP: { short: 'तेदेपा', full: 'तेलुगु देशम पार्टी' },
  'JD(U)': { short: 'जद(यू)', full: 'जनता दल (यूनाइटेड)' },
  JDU: { short: 'जद(यू)', full: 'जनता दल (यूनाइटेड)' },
  'Janata Dal (United)': { short: 'जद(यू)', full: 'जनता दल (यूनाइटेड)' },
  SHS: { short: 'शिवसेना', full: 'शिवसेना' },
  'Shiv Sena': { short: 'शिवसेना', full: 'शिवसेना' },
  'Shiv Sena (UBT)': { short: 'शिवसेना (यूबीटी)', full: 'शिवसेना (उद्धव बालासाहेब ठाकरे)' },
  'NCP (SP)': { short: 'राकांपा (शरदचंद्र)', full: 'राष्ट्रवादी कांग्रेस पार्टी (शरदचंद्र पवार)' },
  'CPI(M)': { short: 'माकपा', full: 'भारत की कम्युनिस्ट पार्टी (मार्क्सवादी)' },
  RJD: { short: 'राजद', full: 'राष्ट्रीय जनता दल' },
  YSRCP: { short: 'वाईएसआरसीपी', full: 'युवजन श्रमिक रायथू कांग्रेस पार्टी' },
};

export const HINDI_RESERVATION: Record<string, string> = {
  GEN: 'सामान्य',
  SC: 'अनुसूचित जाति',
  ST: 'अनुसूचित जनजाति',
};

export const HINDI_TERMS: Record<string, string> = {
  '18th Lok Sabha': '18वीं लोकसभा',
  'First Term': 'पहला कार्यकाल',
  'Second Term': 'दूसरा कार्यकाल',
  'Third Term': 'तीसरा कार्यकाल',
  'Fourth Term': 'चौथा कार्यकाल',
  'Fifth Term': 'पांचवां कार्यकाल',
  Male: 'पुरुष',
  Female: 'महिला',
  Speaker: 'लोकसभा अध्यक्ष',
  'Deputy Speaker': 'उपाध्यक्ष',
  Minister: 'केंद्रीय मंत्री',
};

export const HINDI_MPLADS_CATEGORIES: Record<string, string> = {
  'Normal/Others': 'सामान्य / अन्य विकास कार्य',
  'Repair and Renovation': 'मरम्मत एवं नवीनीकरण',
  Education: 'शिक्षा अवसंरचना',
  'Drinking Water': 'पेयजल व्यवस्था',
  'Health & Family Welfare': 'स्वास्थ्य एवं परिवार कल्याण',
  'Roads, Pathways & Bridges': 'सड़कें, गलियां एवं पुल',
  Sanitation: 'स्वच्छता एवं जल निकासी',
  Electricity: 'प्रकाश व्यवस्था एवं बिजली',
  'Community Infrastructure': 'सामुदायिक अवसंरचना',
};

/**
 * @deprecated Names are shown exactly as published (PRD 5.6). Returns the
 * input unchanged (empty string for missing input); kept only so existing
 * callers keep compiling. Render the raw value instead.
 */
export function localizeName(name: string | undefined | null, _lang?: Lang): string {
  void _lang;
  return name ?? '';
}

/**
 * @deprecated Constituency names are shown exactly as published (PRD 5.6).
 * Returns the input unchanged; render the raw value instead.
 */
export function localizeConstituency(constituency: string | undefined | null, _lang?: Lang): string {
  void _lang;
  return constituency ?? '';
}

export function localizeState(state: string | undefined | null, lang: Lang): string {
  if (!state) return '';
  if (lang !== 'hi') return state;
  return HINDI_STATES[state] || state;
}

export function localizeParty(party: string | undefined | null, lang: Lang, full = false): string {
  if (!party) return '';
  if (lang !== 'hi') return party;
  const p = HINDI_PARTIES[party];
  if (p) return full ? p.full : p.short;
  return party;
}

export function localizeReservation(reservation: 'GEN' | 'SC' | 'ST' | undefined, lang: Lang): string {
  if (!reservation) return '';
  if (lang !== 'hi') return reservation;
  return HINDI_RESERVATION[reservation] || reservation;
}

/**
 * Returns a display-localized clone of an MPRecord when lang === 'hi'.
 * When lang === 'en', returns the original record untouched.
 *
 * Localized: state, party / party_full, runner-up party, reservation label,
 * term, gender, term number, MPLADS sector category.
 * Never changed: name, constituency, education (profile and affidavit),
 * runner-up name, MPLADS work description and implementing agency.
 */
export function localizeMP(mp: MPRecord, lang: Lang): MPRecord {
  if (lang !== 'hi') return mp;

  const partyInfo = HINDI_PARTIES[mp.party] || (mp.party_full ? HINDI_PARTIES[mp.party_full] : undefined);
  const localizedReservation =
    mp.reservation === 'SC' || mp.reservation === 'ST'
      ? (HINDI_RESERVATION[mp.reservation] as 'GEN' | 'SC' | 'ST')
      : mp.reservation;

  const profile = mp.profile
    ? {
        ...mp.profile,
        gender: mp.profile.gender ? (HINDI_TERMS[mp.profile.gender] || mp.profile.gender) : mp.profile.gender,
        term_number: mp.profile.term_number
          ? (HINDI_TERMS[mp.profile.term_number] || mp.profile.term_number)
          : mp.profile.term_number,
      }
    : mp.profile;

  const election = mp.election
    ? {
        ...mp.election,
        runner_up: mp.election.runner_up
          ? {
              ...mp.election.runner_up,
              party: mp.election.runner_up.party
                ? (HINDI_PARTIES[mp.election.runner_up.party]?.short || mp.election.runner_up.party)
                : mp.election.runner_up.party,
            }
          : mp.election.runner_up,
      }
    : mp.election;

  const mplads = mp.mplads
    ? {
        ...mp.mplads,
        works: mp.mplads.works
          ? mp.mplads.works.map((w): MpladsWork => ({
              ...w,
              category: w.category ? (HINDI_MPLADS_CATEGORIES[w.category] || w.category) : w.category,
            }))
          : mp.mplads.works,
      }
    : mp.mplads;

  return {
    ...mp,
    state: HINDI_STATES[mp.state] || mp.state,
    party: partyInfo ? partyInfo.short : mp.party,
    party_full: partyInfo ? partyInfo.full : mp.party_full,
    reservation: localizedReservation,
    term: HINDI_TERMS[mp.term] || mp.term,
    profile,
    election,
    mplads,
  };
}
