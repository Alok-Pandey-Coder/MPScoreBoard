import { MPRecord } from '../types/mp';
import aliasesData from '../data/aliases.json';

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

    return nameMatch || constMatch || stateMatch || partyMatch || slugMatch;
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

