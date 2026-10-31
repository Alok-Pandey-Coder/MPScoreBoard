/**
 * Format Indian currency values in Crores with Indian digit groupings
 */
export function formatRupeesInCrore(rupees: number | null | undefined): string {
  if (rupees === null || rupees === undefined) return 'Not available';
  const cr = rupees / 10000000;
  return `₹${cr.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 })} Cr`;
}

/**
 * Format raw crore number to string
 */
export function formatCrore(cr: number | null | undefined): string {
  if (cr === null || cr === undefined) return 'Not available';
  return `₹${cr.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 })} Cr`;
}

/**
 * Format percentage with neutral display
 */
export function formatPct(val: number | null | undefined): string {
  if (val === null || val === undefined) return 'Not available';
  return `${val}%`;
}

/**
 * Format count numbers
 */
export function formatNumber(val: number | null | undefined): string {
  if (val === null || val === undefined) return 'Not available';
  return val.toLocaleString('en-IN');
}

/**
 * Format dates into friendly "as of 13 Aug 2026"
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Not available';
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

