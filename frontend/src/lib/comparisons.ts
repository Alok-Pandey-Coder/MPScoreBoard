export interface ComparisonResult {
  comparisonText: string;
  relation: 'similar' | 'higher' | 'lower' | 'unavailable';
  diffValue: number | null;
  unit: string;
}

/**
 * Computes neutral comparison strictly per PRD Section 5.6
 * - Attendance: within ±5 percentage points -> "similar to"; above -> "higher than"; below -> "lower than"
 * - Counts: within ±10% of average -> "similar to"; above -> "higher than"; below -> "lower than"
 */
export function compareWithAverage(
  mpValue: number | null | undefined,
  avgValue: number | null | undefined,
  metricType: 'percentage' | 'count'
): ComparisonResult {
  if (mpValue === null || mpValue === undefined || avgValue === null || avgValue === undefined) {
    return {
      comparisonText: 'Average comparison unavailable',
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
        comparisonText: 'similar to average',
        relation: 'similar',
        diffValue: Math.abs(diff),
        unit: 'percentage points',
      };
    } else if (diff > 5) {
      return {
        comparisonText: `${diff.toFixed(1)} points higher than`,
        relation: 'higher',
        diffValue: diff,
        unit: 'percentage points',
      };
    } else {
      return {
        comparisonText: `${Math.abs(diff).toFixed(1)} points lower than`,
        relation: 'lower',
        diffValue: diff,
        unit: 'percentage points',
      };
    }
  } else {
    // Count rule: ±10% of average
    if (avgValue === 0) {
      if (mpValue === 0) {
        return {
          comparisonText: 'similar to average',
          relation: 'similar',
          diffValue: 0,
          unit: '',
        };
      }
      return {
        comparisonText: 'higher than average',
        relation: 'higher',
        diffValue: mpValue,
        unit: '',
      };
    }

    const pctDiff = (diff / avgValue) * 100;
    if (Math.abs(pctDiff) <= 10) {
      return {
        comparisonText: 'similar to average',
        relation: 'similar',
        diffValue: Math.abs(diff),
        unit: '',
      };
    } else if (diff > 0) {
      return {
        comparisonText: `${diff.toFixed(1)} higher than`,
        relation: 'higher',
        diffValue: diff,
        unit: '',
      };
    } else {
      return {
        comparisonText: `${Math.abs(diff).toFixed(1)} lower than`,
        relation: 'lower',
        diffValue: diff,
        unit: '',
      };
    }
  }
}

