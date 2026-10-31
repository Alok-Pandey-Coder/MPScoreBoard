import { MPRecord, MpladsWork } from '@/types/mp';
import { Lang } from '@/lib/i18n';

/**
 * lib/i18n/localizeData.ts
 * 
 * Provides complete Devanagari Hindi localization for all MP data records,
 * names, constituencies, political parties, education, reservation categories,
 * election results, and MPLADS works.
 *
 * When lang === 'hi', every data string is displayed in natural Hindi.
 * When lang === 'en', data strings are returned as published.
 */

export const HINDI_MP_NAMES: Record<string, string> = {
  'Praveen Khandelwal': 'प्रवीन खंडेलवाल',
  'Harsh Malhotra': 'हर्ष मल्होत्रा',
  'Bansuri Swaraj': 'बांसुरी स्वराज',
  'Manoj Kumar Tiwari': 'मनोज कुमार तिवारी',
  'Manoj Tiwari': 'मनोज तिवारी',
  'Yogender Chandolia': 'योगेंद्र चंदोलिया',
  'Yogendra Chandoliya': 'योगेंद्र चंदोलिया',
  'Ramvir Singh Bidhuri': 'रामवीर सिंह बिधूड़ी',
  'Kamaljeet Sehrawat': 'कमलजीत सहरावत',
};

export const HINDI_CONSTITUENCIES: Record<string, string> = {
  'Chandni Chowk': 'चांदनी चौक',
  'East Delhi': 'पूर्वी दिल्ली',
  'New Delhi': 'नई दिल्ली',
  'North East Delhi': 'उत्तर पूर्व दिल्ली',
  'North West Delhi (SC)': 'उत्तर पश्चिम दिल्ली (अ.जा.)',
  'North West Delhi': 'उत्तर पश्चिम दिल्ली',
  'South Delhi': 'दक्षिण दिल्ली',
  'West Delhi': 'पश्चिम दिल्ली',
};

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

export const HINDI_EDUCATION_LEVELS: Record<string, string> = {
  Graduate: 'स्नातक',
  'Post Graduate': 'परास्नातक',
  'Post Graduate and above': 'स्नातकोत्तर एवं उच्चतर',
  'Graduate Professional': 'व्यावसायिक स्नातक',
  Doctorate: 'डॉक्टरेट',
  '12th Pass': '12वीं उत्तीर्ण',
  '10th Pass': '10वीं उत्तीर्ण',
  Others: 'अन्य',
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

export const HINDI_RUNNER_UPS: Record<string, string> = {
  'Jai Parkash Agarwal': 'जय प्रकाश अग्रवाल',
  'Jai Prakash Agarwal': 'जय प्रकाश अग्रवाल',
  'Kuldeep Kumar': 'कुलदीप कुमार',
  'Somnath Bharti': 'सोमनाथ भारती',
  'Kanhaiya Kumar': 'कन्हैया कुमार',
  'Udit Raj': 'उदित राज',
  'Mahabal Mishra': 'महाबल मिश्रा',
  'Sahi Ram Pehalwan': 'सही राम पहलवान',
  'Sahi Ram': 'सही राम',
};

export const HINDI_AFFIDAVIT_EDUCATION: Record<string, string> = {
  'LLB from Delhi University, 1986; B.A. from Ramjas College, Delhi, 1983.':
    'दिल्ली विश्वविद्यालय से एलएलबी (1986); रामजस कॉलेज, दिल्ली से बी.ए. (1983)।',
  'LLB from Delhi University, 1987.': 'दिल्ली विश्वविद्यालय से एलएलबी (1987)।',
  'Master of Studies (M.St.) from St. Catherines College, University of Oxford, UK in 2009; 2007 - Barrister-at-Law, Honourable Inns of Inner Temple, London, U.K.':
    'मास्टर ऑफ स्टडीज (एम.एस.टी.), सेंट कैथरीन कॉलेज, ऑक्सफोर्ड विश्वविद्यालय, यूके (2009); बैरिस्टर-एट-लॉ, ऑनरेबल इनर टेम्पल, लंदन (2007)।',
  'M.P.Ed. from Banaras Hindu University, Varanasi, Uttar Pradesh.':
    'बनारस हिंदू विश्वविद्यालय (बीएचयू), वाराणसी, उत्तर प्रदेश से एमपीएड।',
  'B.A. (Political Science and History) from Swami Vivekanand Subharti University, Meerut, Uttar Pradesh, 2022.':
    'स्वामी विवेकानंद सुभारती विश्वविद्यालय, मेरठ, उत्तर प्रदेश से बी.ए. (राजनीति विज्ञान एवं इतिहास, 2022)।',
  'B.A. from Deshbandu Gupta College, Delhi University, 1973.':
    'देशबंधु गुप्ता कॉलेज, दिल्ली विश्वविद्यालय से बी.ए. (1973)।',
  'M.Com from Himachal Pradesh University, Shimla, 1995.':
    'हिमाचल प्रदेश विश्वविद्यालय, शिमला से एम.कॉम (1995)।',
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

export const HINDI_AGENCIES: Record<string, string> = {
  MCD: 'एमसीडी (दिल्ली नगर निगम)',
  DDA: 'डीडीए (दिल्ली विकास प्राधिकरण)',
  PWD: 'पीडब्ल्यूडी (लोक निर्माण विभाग)',
  DJB: 'डीजेबी (दिल्ली जल बोर्ड)',
  NDMC: 'एनडीएमसी (नई दिल्ली नगर पालिका)',
};

/** Translates an English MPLADS work description into natural, clean Hindi */
export function translateWorkDescription(desc: string | null | undefined): string {
  if (!desc) return 'कार्य विवरण उपलब्ध नहीं';
  
  let text = desc;

  // Common phrase substitutions
  const replacements: [RegExp, string][] = [
    [/Providing (&|and) Installation of Children play equipment(s)?/gi, 'बच्चों के खेल उपकरण व झूले लगाने का कार्य'],
    [/children play area/gi, 'बच्चों के खेलने का क्षेत्र'],
    [/Providing and (Fixing|fixing of) RCC Benches?/gi, 'आरसीसी बेंच लगाने की व्यवस्था'],
    [/Provision of lighting arrangements?/gi, 'स्ट्रीट लाइट व प्रकाश व्यवस्था का कार्य'],
    [/Provision of lighting poles \(with fittings\)/gi, 'लाइटिंग पोल (फिटिंग सहित) लगाने का कार्य'],
    [/Provision of 20 M height 2 HM Pole with LED lights/gi, 'एलईडी लाइट सहित 20 मीटर हाई मास्ट पोल की स्थापना'],
    [/Provision of Lighting arrangment with (street light & Poles|Street Light Poles)/gi, 'स्ट्रीट लाइट व पोल सहित प्रकाश व्यवस्था'],
    [/Supply and Installation of Open Gym Equipment/gi, 'ओपन जिम उपकरणों की आपूर्ति एवं स्थापना'],
    [/Installing of 21 units water cooler with water purifier \(100 LPH\)/gi, 'वाटर प्यूरीफायर सहित 21 यूनिट वाटर कूलर (100 एलपीएच) की स्थापना'],
    [/Installation of Two Boom Barriers/gi, 'दो बूम बैरियर लगाने का कार्य'],
    [/100 numbers of RCC chairs benches with Arm Rest/gi, 'हत्थे वाली 100 नग आरसीसी कुर्सियां व बेंच लगाने का कार्य'],
    [/50 numbers of Victorian type garden benches/gi, '50 नग विक्टोरियन शैली के गार्डन बेंच लगाने का कार्य'],
    [/Installation of Semi High Mast Light/gi, 'सेमी हाई मास्ट लाइट लगाने का कार्य'],
    [/Installation of High Mast Light and Street Light/gi, 'हाई मास्ट लाइट और स्ट्रीट लाइट की स्थापना'],
    [/Repair and maintenance/gi, 'मरम्मत एवं रखरखाव कार्य'],
    [/at various locations in/gi, 'विभिन्न स्थानों पर'],
    [/in various blocks of/gi, 'विभिन्न ब्लॉकों में'],
    [/Ward No\.?\s*(\d+)/gi, 'वार्ड सं. $1'],
    [/Ward\s*(\d+)/gi, 'वार्ड $1'],
    [/under my MPLAD funds/gi, 'सांसद निधि (MPLADS) से'],
    [/from my MPLAD funds/gi, 'सांसद निधि (MPLADS) से'],
    [/opposite H\.No\./gi, 'मकान सं. के सामने'],
    [/Near/gi, 'के पास'],
    [/Mpl\. Park/gi, 'निगम पार्क'],
    [/in Park/gi, 'पार्क में'],
    [/in park/gi, 'पार्क में'],
    [/Shahdara North Zone/gi, 'शाहदरा उत्तर ज़ोन'],
    [/Central Zone/gi, 'मध्य ज़ोन'],
    [/South Zone/gi, 'दक्षिण ज़ोन'],
    [/West Zone/gi, 'पश्चिम ज़ोन'],
    [/Rohini Zone/gi, 'रोहिणी ज़ोन'],
    [/under RZ/gi, 'रोहिणी ज़ोन के तहत'],
    [/CNZ\/ MCD/gi, 'मध्य ज़ोन / एमसीडी'],
  ];

  for (const [pattern, replacement] of replacements) {
    text = text.replace(pattern, replacement);
  }

  return text;
}

export function localizeName(name: string | undefined | null, lang: Lang): string {
  if (!name) return '';
  if (lang !== 'hi') return name;
  return HINDI_MP_NAMES[name] || HINDI_RUNNER_UPS[name] || name;
}

export function localizeConstituency(constituency: string | undefined | null, lang: Lang): string {
  if (!constituency) return '';
  if (lang !== 'hi') return constituency;
  return HINDI_CONSTITUENCIES[constituency] || constituency;
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
 * Returns a localized clone of an MPRecord when lang === 'hi'.
 * When lang === 'en', returns the original record untouched.
 */
export function localizeMP(mp: MPRecord, lang: Lang): MPRecord {
  if (lang !== 'hi') return mp;

  const partyInfo = HINDI_PARTIES[mp.party] || (mp.party_full ? HINDI_PARTIES[mp.party_full] : undefined);
  const localizedName = HINDI_MP_NAMES[mp.name] || mp.name;
  const localizedConstituency = HINDI_CONSTITUENCIES[mp.constituency] || mp.constituency;
  const localizedState = HINDI_STATES[mp.state] || mp.state;
  const localizedParty = partyInfo ? partyInfo.short : mp.party;
  const localizedPartyFull = partyInfo ? partyInfo.full : mp.party_full;
  const localizedReservation =
    mp.reservation === 'SC' || mp.reservation === 'ST'
      ? (HINDI_RESERVATION[mp.reservation] as 'GEN' | 'SC' | 'ST')
      : mp.reservation;
  const localizedTerm = HINDI_TERMS[mp.term] || mp.term;

  // Localize Profile
  const profile = mp.profile
    ? {
        ...mp.profile,
        education: mp.profile.education ? (HINDI_EDUCATION_LEVELS[mp.profile.education] || mp.profile.education) : undefined,
        gender: mp.profile.gender ? (HINDI_TERMS[mp.profile.gender] || mp.profile.gender) : undefined,
        term_number: mp.profile.term_number ? (HINDI_TERMS[mp.profile.term_number] || mp.profile.term_number) : undefined,
      }
    : undefined;

  // Localize Affidavit
  const affidavit = mp.affidavit
    ? {
        ...mp.affidavit,
        education: mp.affidavit.education
          ? (HINDI_AFFIDAVIT_EDUCATION[mp.affidavit.education] || mp.affidavit.education)
          : undefined,
      }
    : undefined;

  // Localize Election Runner Up
  const election = mp.election
    ? {
        ...mp.election,
        runner_up: mp.election.runner_up
          ? {
              ...mp.election.runner_up,
              name: mp.election.runner_up.name
                ? (HINDI_RUNNER_UPS[mp.election.runner_up.name] || mp.election.runner_up.name)
                : null,
              party: mp.election.runner_up.party
                ? (HINDI_PARTIES[mp.election.runner_up.party]?.short || mp.election.runner_up.party)
                : null,
            }
          : null,
      }
    : undefined;

  // Localize MPLADS works
  const mplads = mp.mplads
    ? {
        ...mp.mplads,
        works: mp.mplads.works
          ? mp.mplads.works.map((w): MpladsWork => ({
              ...w,
              category: w.category ? (HINDI_MPLADS_CATEGORIES[w.category] || w.category) : null,
              description: translateWorkDescription(w.description),
              implementing_agency: w.implementing_agency
                ? (HINDI_AGENCIES[w.implementing_agency] || w.implementing_agency)
                : null,
            }))
          : undefined,
      }
    : undefined;

  return {
    ...mp,
    name: localizedName,
    constituency: localizedConstituency,
    state: localizedState,
    party: localizedParty,
    party_full: localizedPartyFull,
    reservation: localizedReservation,
    term: localizedTerm,
    profile,
    affidavit,
    election,
    mplads,
  };
}
