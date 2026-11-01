import { MPRecord } from '../types/mp';
import aliasesData from '@/data/processed/aliases.json';
import { HINDI_STATES, HINDI_PARTIES } from './i18n/localizeData';

/**
 * SEARCH-ONLY Hindi-script aliases for MP names, keyed by the official
 * (published) English spelling. They let a Hindi user typing "बांसुरी" find
 * the MP. Never render these: names are displayed exactly as published
 * (PRD 5.6).
 */
export const HINDI_SEARCH_ALIASES_MP_NAMES: Record<string, string> = {
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

/**
 * SEARCH-ONLY Hindi-script aliases for constituency names, keyed by the
 * official English name. Never render these (PRD 5.6).
 */
export const HINDI_SEARCH_ALIASES_CONSTITUENCIES: Record<string, string> = {
  'Chandni Chowk': 'चांदनी चौक',
  'East Delhi': 'पूर्वी दिल्ली',
  'New Delhi': 'नई दिल्ली',
  'North East Delhi': 'उत्तर पूर्व दिल्ली',
  'North West Delhi (SC)': 'उत्तर पश्चिम दिल्ली (अ.जा.)',
  'North West Delhi': 'उत्तर पश्चिम दिल्ली',
  'South Delhi': 'दक्षिण दिल्ली',
  'West Delhi': 'पश्चिम दिल्ली',
};

// Simple Levenshtein distance implementation
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1).toLowerCase() === a.charAt(j - 1).toLowerCase()) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function searchMPs(query: string, mps: MPRecord[]): MPRecord[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  // Check alias table first
  let resolvedQuery = clean;
  if (aliasesData.mp && (aliasesData.mp as Record<string, string>)[clean]) {
    resolvedQuery = (aliasesData.mp as Record<string, string>)[clean].toLowerCase();
  } else if (aliasesData.constituency && (aliasesData.constituency as Record<string, string>)[clean]) {
    resolvedQuery = (aliasesData.constituency as Record<string, string>)[clean].toLowerCase();
  }

  // Direct substring and token matches
  const directMatches = mps.filter((mp) => {
    const nameMatch = mp.name.toLowerCase().includes(resolvedQuery);
    const constMatch = mp.constituency.toLowerCase().includes(resolvedQuery);
    const stateMatch = mp.state.toLowerCase().includes(resolvedQuery);
    const partyMatch = mp.party.toLowerCase().includes(resolvedQuery) ||
      (mp.party_full && mp.party_full.toLowerCase().includes(resolvedQuery));
    const slugMatch = mp.slug.toLowerCase().includes(resolvedQuery);

    const q = query.trim();
    const hiName = HINDI_SEARCH_ALIASES_MP_NAMES[mp.name] || '';
    const hiConst = HINDI_SEARCH_ALIASES_CONSTITUENCIES[mp.constituency] || '';
    const hiState = HINDI_STATES[mp.state] || '';
    const hiParty = HINDI_PARTIES[mp.party]?.short || '';
    const hiPartyFull = HINDI_PARTIES[mp.party]?.full || '';
    const hiMatch = hiName.includes(q) || hiConst.includes(q) || hiState.includes(q) || hiParty.includes(q) || hiPartyFull.includes(q);

    return nameMatch || constMatch || stateMatch || partyMatch || slugMatch || hiMatch;
  });

  if (directMatches.length > 0) {
    return directMatches;
  }

  // If query length >= 4, attempt typo-tolerant search (edit distance <= 2)
  if (clean.length >= 4) {
    const fuzzyMatches = mps.filter((mp) => {
      const words = [
        ...mp.name.toLowerCase().split(/\s+/),
        ...mp.constituency.toLowerCase().split(/\s+/),
        mp.state.toLowerCase(),
      ];
      return words.some((word) => levenshteinDistance(clean, word) <= 2);
    });

    return fuzzyMatches;
  }

  return [];
}

