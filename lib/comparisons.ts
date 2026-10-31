import type { Lang } from './i18n';

export interface ComparisonResult {
  comparisonText: string;
  relation: 'similar' | 'higher' | 'lower' | 'unavailable';
  diffValue: number | null;
  unit: string;
}

/** Fixed wording for each relation; neutral in both languages (PRD §5.9). */
const TEXT = {
  en: {
    unavailable: 'Average comparison unavailable',
    similar: 'similar to average',
    pointsHigher: (d: string) => `${d} points higher than`,
    pointsLower: (d: string) => `${d} points lower than`,
    higherThanAverage: 'higher than average',
    countHigher: (d: string) => `${d} higher than`,
    countLower: (d: string) => `${d} lower than`,
    percentagePoints: 'percentage points',
  },
  hi: {
    unavailable: 'औसत से तुलना उपलब्ध नहीं',
    similar: 'औसत के लगभग बराबर',
    pointsHigher: (d: string) => `औसत से ${d} अंक अधिक`,
    pointsLower: (d: string) => `औसत से ${d} अंक कम`,
    higherThanAverage: 'औसत से अधिक',
    countHigher: (d: string) => `औसत से ${d} अधिक`,
    countLower: (d: string) => `औसत से ${d} कम`,
    percentagePoints: 'प्रतिशत अंक',
  },
} as const;

/**
 * Computes neutral comparison strictly per PRD Section 5.6
 * - Attendance: within ±5 percentage points -> "similar to"; above -> "higher than"; below -> "lower than"
 * - Counts: within ±10% of average -> "similar to"; above -> "higher than"; below -> "lower than"
 */
export function compareWithAverage(
  mpValue: number | null | undefined,
  avgValue: number | null | undefined,
  metricType: 'percentage' | 'count',
  lang: Lang = 'en'
): ComparisonResult {
  const t = TEXT[lang];
  if (mpValue === null || mpValue === undefined || avgValue === null || avgValue === undefined) {
    return {
      comparisonText: t.unavailable,
      relation: 'unavailable',
      diffValue: null,
      unit: metricType === 'percentage' ? '%' : '',
    };
  }

  const diff = mpValue - avgValue;

  if (metricType === 'percentage') {
    // Attendance rule: ±5 percentage points
    if (Math.abs(diff) <= 5) {
      return {
        comparisonText: t.similar,
        relation: 'similar',
        diffValue: Math.abs(diff),
        unit: t.percentagePoints,
      };
    } else if (diff > 5) {
      return {
        comparisonText: t.pointsHigher(diff.toFixed(1)),
        relation: 'higher',
        diffValue: diff,
        unit: t.percentagePoints,
      };
    } else {
      return {
        comparisonText: t.pointsLower(Math.abs(diff).toFixed(1)),
        relation: 'lower',
        diffValue: diff,
        unit: t.percentagePoints,
      };
    }
  } else {
    // Count rule: ±10% of average
    if (avgValue === 0) {
      if (mpValue === 0) {
        return {
          comparisonText: t.similar,
          relation: 'similar',
          diffValue: 0,
          unit: '',
        };
      }
      return {
        comparisonText: t.higherThanAverage,
        relation: 'higher',
        diffValue: mpValue,
        unit: '',
      };
    }

    const pctDiff = (diff / avgValue) * 100;
    if (Math.abs(pctDiff) <= 10) {
      return {
        comparisonText: t.similar,
        relation: 'similar',
        diffValue: Math.abs(diff),
        unit: '',
      };
    } else if (diff > 0) {
      return {
        comparisonText: t.countHigher(diff.toFixed(1)),
        relation: 'higher',
        diffValue: diff,
        unit: '',
      };
    } else {
      return {
        comparisonText: t.countLower(Math.abs(diff).toFixed(1)),
        relation: 'lower',
        diffValue: diff,
        unit: '',
      };
    }
  }
}

/** Which average a value is compared with: a named state's, or the national one. */
export type AverageScope = { kind: 'state'; name: string } | { kind: 'national' };

/**
 * One neutral phrase for the report card, e.g. "similar to the Delhi average"
 * or "6.5 points higher than the national average" (Hindi: "राष्ट्रीय औसत से
 * 6.5 अंक अधिक"). Returns null when either value is missing.
 */
export function describeAgainstAverage(
  mpValue: number | null | undefined,
  avgValue: number | null | undefined,
  metricType: 'percentage' | 'count',
  scope: AverageScope,
  lang: Lang = 'en'
): string | null {
  const r = compareWithAverage(mpValue, avgValue, metricType, lang);
  if (r.relation === 'unavailable') return null;
  const amount = Math.abs(r.diffValue ?? 0);
  const amountText = Number.isInteger(amount) ? String(amount) : amount.toFixed(1);

  if (lang === 'hi') {
    const base = scope.kind === 'state' ? `${scope.name} के औसत` : 'राष्ट्रीय औसत';
    if (r.relation === 'similar') return `${base} के लगभग बराबर`;
    const unit = metricType === 'percentage' ? ' अंक' : '';
    return `${base} से ${amountText}${unit} ${r.relation === 'higher' ? 'अधिक' : 'कम'}`;
  }

  const which = scope.kind === 'state' ? scope.name : 'national';
  if (r.relation === 'similar') return `similar to the ${which} average`;
  const unit = metricType === 'percentage' ? ' points' : '';
  return `${amountText}${unit} ${r.relation} than the ${which} average`;
}
