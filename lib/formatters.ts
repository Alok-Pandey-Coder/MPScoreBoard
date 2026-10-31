export const NOT_AVAILABLE = 'Not available';

/**
 * Format Indian currency values in Crores with Indian digit groupings
 */
export function formatRupeesInCrore(rupees: number | null | undefined): string {
  if (rupees === null || rupees === undefined) return NOT_AVAILABLE;
  const cr = rupees / 10000000;
  return `₹${cr.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 })} Cr`;
}

/**
 * Format raw crore number to string
 */
export function formatCrore(cr: number | null | undefined): string {
  if (cr === null || cr === undefined) return NOT_AVAILABLE;
  return `₹${cr.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 })} Cr`;
}

/**
 * Format percentage with neutral display
 */
export function formatPct(val: number | null | undefined): string {
  if (val === null || val === undefined) return NOT_AVAILABLE;
  return `${val}%`;
}

/**
 * Format count numbers
 */
export function formatNumber(val: number | null | undefined): string {
  if (val === null || val === undefined) return NOT_AVAILABLE;
  return val.toLocaleString('en-IN');
}

/**
 * Format dates into friendly "as of 13 Aug 2026"
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return NOT_AVAILABLE;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}


/**
 * Format an amount given in crore. Amounts below ₹1 crore are shown in lakh
 * (1 crore = 100 lakh) so small works stay readable. 0 displays as "₹0 Cr".
 */
export function formatCroreOrLakh(cr: number | null | undefined): string {
  if (cr === null || cr === undefined || Number.isNaN(cr)) return NOT_AVAILABLE;
  if (cr !== 0 && Math.abs(cr) < 1) {
    const lakh = cr * 100;
    return `₹${lakh.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 })} lakh`;
  }
  return formatCrore(cr);
}

const REVIEW_STATUS_LABELS: Record<string, string> = {
  parsed: 'Parsed from source, not yet manually reviewed',
  cross_checked: 'Cross-checked against a second source',
  user_verified: 'Manually checked against the source',
  secondary_only: 'Secondary source only',
  pending: 'Pending',
};

/** Human-readable label for a record's review_status; null when absent. */
export function formatReviewStatus(status: string | null | undefined): string | null {
  if (!status) return null;
  return REVIEW_STATUS_LABELS[status] ?? status.replace(/_/g, ' ');
}
