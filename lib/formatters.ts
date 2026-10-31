import { LOCALE, type Lang } from './i18n';

export const NOT_AVAILABLE = 'Not available';

/** "Not available" in each UI language. */
export const NOT_AVAILABLE_TEXT: Record<Lang, string> = { en: NOT_AVAILABLE, hi: 'उपलब्ध नहीं' };

const CRORE: Record<Lang, string> = { en: 'Cr', hi: 'करोड़' };
const LAKH: Record<Lang, string> = { en: 'lakh', hi: 'लाख' };

// Digits stay Western (0–9) in both languages, as is usual on Hindi websites;
// en-IN grouping (1,00,000) is used for both.
const amount = (value: number) => value.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 });

/**
 * Format Indian currency values in Crores with Indian digit groupings
 */
export function formatRupeesInCrore(rupees: number | null | undefined, lang: Lang = 'en'): string {
  if (rupees === null || rupees === undefined) return NOT_AVAILABLE_TEXT[lang];
  return `₹${amount(rupees / 10000000)} ${CRORE[lang]}`;
}

/**
 * Format raw crore number to string
 */
export function formatCrore(cr: number | null | undefined, lang: Lang = 'en'): string {
  if (cr === null || cr === undefined) return NOT_AVAILABLE_TEXT[lang];
  return `₹${amount(cr)} ${CRORE[lang]}`;
}

/**
 * Format percentage with neutral display
 */
export function formatPct(val: number | null | undefined, lang: Lang = 'en'): string {
  if (val === null || val === undefined) return NOT_AVAILABLE_TEXT[lang];
  return `${val}%`;
}

/**
 * Format count numbers
 */
export function formatNumber(val: number | null | undefined, lang: Lang = 'en'): string {
  if (val === null || val === undefined) return NOT_AVAILABLE_TEXT[lang];
  return val.toLocaleString('en-IN');
}

/**
 * Format dates into friendly "13 Aug 2026" (English) or "13 अग॰ 2026" (Hindi).
 */
export function formatDate(dateStr: string | null | undefined, lang: Lang = 'en'): string {
  if (!dateStr) return NOT_AVAILABLE_TEXT[lang];
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(lang === 'en' ? 'en-GB' : LOCALE[lang], {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      numberingSystem: 'latn',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format an amount given in crore. Amounts below ₹1 crore are shown in lakh
 * (1 crore = 100 lakh) so small works stay readable. 0 displays as "₹0 Cr".
 */
export function formatCroreOrLakh(cr: number | null | undefined, lang: Lang = 'en'): string {
  if (cr === null || cr === undefined || Number.isNaN(cr)) return NOT_AVAILABLE_TEXT[lang];
  if (cr !== 0 && Math.abs(cr) < 1) {
    return `₹${amount(cr * 100)} ${LAKH[lang]}`;
  }
  return formatCrore(cr, lang);
}

const REVIEW_STATUS_LABELS: Record<Lang, Record<string, string>> = {
  en: {
    parsed: 'Parsed from source, not yet manually reviewed',
    cross_checked: 'Cross-checked against a second source',
    user_verified: 'Manually checked against the source',
    secondary_only: 'Secondary source only',
    pending: 'Pending',
  },
  hi: {
    parsed: 'स्रोत से लिया गया, अभी हाथ से जाँचा नहीं गया',
    cross_checked: 'दूसरे स्रोत से मिलान किया गया',
    user_verified: 'स्रोत से हाथ से जाँचा गया',
    secondary_only: 'केवल द्वितीयक स्रोत',
    pending: 'लंबित',
  },
};

/** Human-readable label for a record's review_status; null when absent. */
export function formatReviewStatus(status: string | null | undefined, lang: Lang = 'en'): string | null {
  if (!status) return null;
  return REVIEW_STATUS_LABELS[lang][status] ?? status.replace(/_/g, ' ');
}
