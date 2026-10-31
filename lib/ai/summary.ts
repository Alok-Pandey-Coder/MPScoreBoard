import { MPRecord } from '../../types/mp';
import { formatDate } from '../formatters';

export interface SummaryResult {
  text: string;
  source: 'template' | 'llm';
  lang: 'en' | 'hinglish';
  generatedAt: string;
}

/** Numbers that are part of fixed template wording rather than data. */
const TEMPLATE_CONSTANTS = ['18'];

function collectNumbers(value: unknown, out: Set<number>): void {
  if (value === null || value === undefined) return;
  if (typeof value === 'number') {
    if (Number.isFinite(value)) out.add(value);
    return;
  }
  if (typeof value === 'string') {
    for (const match of value.match(/\d+(?:\.\d+)?/g) ?? []) out.add(parseFloat(match));
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectNumbers(item, out));
    return;
  }
  if (typeof value === 'object') {
    Object.values(value as Record<string, unknown>).forEach((item) => collectNumbers(item, out));
  }
}

/** Every number that appears anywhere in the MP record (including date parts). */
export function knownNumbersForRecord(mp: MPRecord): Set<number> {
  const known = new Set<number>(TEMPLATE_CONSTANTS.map(Number));
  collectNumbers(mp, known);
  return known;
}

/**
 * Validates that all numbers mentioned in text exist in the MP record (PRD FR-14)
 */
export function verifyGuardrails(text: string, mp: MPRecord): boolean {
  const numbersInText = text.match(/\d+(?:\.\d+)?/g);
  if (!numbersInText) return true;
  const known = knownNumbersForRecord(mp);
  const knownList = Array.from(known);
  for (const num of numbersInText) {
    const decimals = num.includes('.') ? num.split('.')[1].length : 0;
    const factor = 10 ** decimals;
    const value = parseFloat(num);
    // A number matches if it equals a record value rounded to the same precision.
    const matches = knownList.some((k) => Math.round(k * factor) / factor === value);
    if (!matches) {
      console.warn(`Guardrail triggered: number ${num} in text not found in source MP record.`);
      return false;
    }
  }
  return true;
}

function isPresent(value: number | null | undefined): value is number {
  return value !== null && value !== undefined && Number.isFinite(value);
}

/** Crore amount rounded to at most 2 decimals, with Indian grouping. */
function crore(value: number): string {
  return value.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
}

function mpladsSentence(mp: MPRecord, lang: 'en' | 'hinglish'): string | null {
  const m = mp.mplads;
  if (!m || m.status !== 'reported') return null;
  if (!isPresent(m.expenditure_cr) || !isPresent(m.allocated_cr)) return null;
  const date = m.as_of ? formatDate(m.as_of) : null;
  const sourceName = m.source?.name ?? null;
  if (lang === 'en') {
    return `Under MPLADS, ₹${crore(m.expenditure_cr)} crore of ₹${crore(m.allocated_cr)} crore allocated had been spent${
      date ? ` as of ${date}` : ''
    }${sourceName ? `, according to ${sourceName}` : ''}.`;
  }
  return `MPLADS ke tahat ₹${crore(m.allocated_cr)} crore allocated mein se ₹${crore(m.expenditure_cr)} crore kharch hue hain${
    date ? ` (${date} tak)` : ''
  }${sourceName ? `, source: ${sourceName}` : ''}.`;
}

/**
 * Generate deterministic template summary (PRD FR-12).
 * Every number in the output comes from the MP record; missing values are
 * stated as not available rather than replaced.
 */
export function generateTemplateSummary(mp: MPRecord, lang: 'en' | 'hinglish'): string {
  const isMinister = mp.is_minister || mp.performance.status === 'not_applicable';
  const perf = mp.performance;
  const asOf = perf.as_of ? formatDate(perf.as_of) : null;
  const sourceName = perf.source?.name ?? null;
  const stAtt = perf.prs_averages?.state?.attendance_pct;
  const natAtt = perf.prs_averages?.national?.attendance_pct;
  const mpladsLine = mpladsSentence(mp, lang);
  const sentences: string[] = [];

  if (lang === 'en') {
    if (isMinister) {
      sentences.push(`${mp.name} represents ${mp.constituency}, ${mp.state} in the 18th Lok Sabha and is a minister.`);
      sentences.push(
        "Ministers don't sign the attendance register, ask questions or introduce private member bills, so these indicators don't apply."
      );
      if (mpladsLine) sentences.push(mpladsLine);
      return sentences.join(' ');
    }

    sentences.push(`${mp.name} represents ${mp.constituency}, ${mp.state} in the 18th Lok Sabha.`);

    const prefix = asOf ? `As of ${asOf}` : 'According to the source';
    if (isPresent(perf.attendance_pct)) {
      const avgParts: string[] = [];
      if (isPresent(stAtt)) avgParts.push(`a PRS-published ${mp.state} average of ${stAtt}%`);
      if (isPresent(natAtt)) avgParts.push(`a national average of ${natAtt}%`);
      sentences.push(
        `${prefix}, recorded attendance is ${perf.attendance_pct}%${
          avgParts.length ? `, compared with ${avgParts.join(' and ')}` : ''
        }.`
      );
    } else {
      sentences.push(`${prefix}, attendance is not available from the source.`);
    }

    const count = (value: number | null | undefined, label: string) =>
      isPresent(value) ? `${value} ${label}` : `${label}: not available`;
    sentences.push(
      `${sourceName ? `${sourceName} records` : 'The source records'} ${count(perf.debates, 'debates')}, ${count(
        perf.questions,
        'questions'
      )} and ${count(perf.private_member_bills, 'private member bills')}.`
    );
    if (mpladsLine) sentences.push(mpladsLine);
    sentences.push("These indicators show activity, not the quality of an MP's work.");
    return sentences.join(' ');
  }

  // Hinglish (Roman script)
  if (isMinister) {
    sentences.push(`${mp.name} 18th Lok Sabha mein ${mp.state} ke ${mp.constituency} kshetra ke Sansad hain aur mantri hain.`);
    sentences.push(
      'Mantri attendance register sign nahi karte, sawal nahi puchte aur private member bill pesh nahi karte, isliye ye indicators lagu nahi hote.'
    );
    if (mpladsLine) sentences.push(mpladsLine);
    return sentences.join(' ');
  }

  sentences.push(`${mp.name} 18th Lok Sabha mein ${mp.state} ke ${mp.constituency} kshetra ke Sansad hain.`);
  const prefix = asOf ? `${asOf} tak ke records ke anusar` : 'Source ke anusar';
  if (isPresent(perf.attendance_pct)) {
    const avgParts: string[] = [];
    if (isPresent(stAtt)) avgParts.push(`${mp.state} ka PRS average ${stAtt}%`);
    if (isPresent(natAtt)) avgParts.push(`national average ${natAtt}%`);
    sentences.push(
      `${prefix}, attendance ${perf.attendance_pct}% darj hai${avgParts.length ? `, jabki ${avgParts.join(' aur ')} hai` : ''}.`
    );
  } else {
    sentences.push(`${prefix}, attendance source se uplabdh nahi hai.`);
  }
  const count = (value: number | null | undefined, label: string) =>
    isPresent(value) ? `${value} ${label}` : `${label} (uplabdh nahi)`;
  sentences.push(
    `Records mein ${count(perf.debates, 'debates')}, ${count(perf.questions, 'questions')} aur ${count(
      perf.private_member_bills,
      'private member bills'
    )} darj hain.`
  );
  if (mpladsLine) sentences.push(mpladsLine);
  sentences.push('Ye indicators activity dikhate hain, kaam ki quality nahi.');
  return sentences.join(' ');
}

/**
 * Main summary getter with timeout and fallback (PRD FR-11, FR-12)
 */
export async function getMPSummary(
  mp: MPRecord,
  lang: 'en' | 'hinglish' = 'en'
): Promise<SummaryResult> {
  const templateText = generateTemplateSummary(mp, lang);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        text: templateText,
        source: 'template',
        lang,
        generatedAt: new Date().toISOString(),
      });
    }, 250);
  });
}
