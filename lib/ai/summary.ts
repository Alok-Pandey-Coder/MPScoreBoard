import { MPRecord } from '../../types/mp';
import { formatDate } from '../formatters';

/**
 * Languages for generated text (summary and draft): English, Hindi in
 * Devanagari, and Hinglish (Hindi in Roman script). Separate from the UI
 * language (lib/i18n.ts), which only has 'en' and 'hi'.
 */
export const AI_LANGS = ['en', 'hi', 'hinglish'] as const;
export type AiLang = (typeof AI_LANGS)[number];

export function isAiLang(value: unknown): value is AiLang {
  return typeof value === 'string' && (AI_LANGS as readonly string[]).includes(value);
}

/** Human-readable list for API error messages: "en" | "hi" | "hinglish". */
export const AI_LANGS_TEXT = AI_LANGS.map((l) => `"${l}"`).join(' | ');

/**
 * Validates a /api/summary body: exactly { slug: string, lang: AiLang }.
 * Returns null for anything else.
 */
export function parseSummaryRequest(body: Record<string, unknown> | null): { slug: string; lang: AiLang } | null {
  if (!body || typeof body.slug !== 'string' || !isAiLang(body.lang)) return null;
  if (Object.keys(body).some((key) => key !== 'slug' && key !== 'lang')) return null;
  return { slug: body.slug, lang: body.lang };
}

/** Words the PRD (§5.9) forbids in any copy or AI output (English). */
const BANNED_EN = /\b(criminal mp|worst|best|lazy|failed|useless)\b/i;
/** Hindi equivalents; `\b` does not work for Devanagari, so plain substrings. */
export const BANNED_HI = ['आपराधिक सांसद', 'सबसे खराब', 'सबसे अच्छा', 'आलसी', 'नाकाम', 'बेकार'] as const;

/** True when text contains a word banned by PRD §5.9, in English or Hindi. */
export function containsBannedWords(text: string): boolean {
  return BANNED_EN.test(text) || BANNED_HI.some((word) => text.includes(word));
}

export interface SummaryResult {
  text: string;
  source: 'template' | 'llm';
  lang: AiLang;
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

function mpladsSentence(mp: MPRecord, lang: AiLang): string | null {
  const m = mp.mplads;
  if (!m || m.status !== 'reported') return null;
  if (!isPresent(m.expenditure_cr) || !isPresent(m.allocated_cr)) return null;
  const date = m.as_of ? formatDate(m.as_of, lang === 'hi' ? 'hi' : 'en') : null;
  const sourceName = m.source?.name ?? null;
  if (lang === 'hi') {
    return `MPLADS के तहत आवंटित ₹${crore(m.allocated_cr)} करोड़ में से ₹${crore(m.expenditure_cr)} करोड़ खर्च हुए हैं${
      date ? ` (${date} तक)` : ''
    }${sourceName ? `, स्रोत: ${sourceName}` : ''}।`;
  }
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
export function generateTemplateSummary(mp: MPRecord, lang: AiLang): string {
  if (lang === 'hi') return hindiTemplateSummary(mp);
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
 * Hindi (Devanagari) template summary. Same facts and order as the English
 * one; digits stay 0–9 so the guardrail can check every number.
 */
function hindiTemplateSummary(mp: MPRecord): string {
  const isMinister = mp.is_minister || mp.performance.status === 'not_applicable';
  const perf = mp.performance;
  const asOf = perf.as_of ? formatDate(perf.as_of, 'hi') : null;
  const sourceName = perf.source?.name ?? null;
  const stAtt = perf.prs_averages?.state?.attendance_pct;
  const natAtt = perf.prs_averages?.national?.attendance_pct;
  const mpladsLine = mpladsSentence(mp, 'hi');
  const sentences: string[] = [];
  const intro = `${mp.name} 18वीं लोकसभा में ${mp.state} के ${mp.constituency} निर्वाचन क्षेत्र से सांसद`;

  if (isMinister) {
    sentences.push(`${intro} और मंत्री हैं।`);
    sentences.push(
      'मंत्री उपस्थिति रजिस्टर पर हस्ताक्षर नहीं करते, प्रश्न नहीं पूछते और निजी सदस्य विधेयक पेश नहीं करते, इसलिए ये संकेतक लागू नहीं होते।'
    );
    if (mpladsLine) sentences.push(mpladsLine);
    return sentences.join(' ');
  }

  sentences.push(`${intro} हैं।`);
  const prefix = asOf ? `${asOf} तक` : 'स्रोत के अनुसार';
  if (isPresent(perf.attendance_pct)) {
    const avgParts: string[] = [];
    if (isPresent(stAtt)) avgParts.push(`PRS द्वारा प्रकाशित ${mp.state} का औसत ${stAtt}%`);
    if (isPresent(natAtt)) avgParts.push(`राष्ट्रीय औसत ${natAtt}%`);
    sentences.push(
      `${prefix} दर्ज उपस्थिति ${perf.attendance_pct}% है${avgParts.length ? `, जबकि ${avgParts.join(' और ')} है` : ''}।`
    );
  } else {
    sentences.push(`${prefix} उपस्थिति का आँकड़ा स्रोत से उपलब्ध नहीं है।`);
  }
  const count = (value: number | null | undefined, label: string) =>
    isPresent(value) ? `${value} ${label}` : `${label}: उपलब्ध नहीं`;
  sentences.push(
    `${sourceName ? `${sourceName} के रिकॉर्ड में` : 'स्रोत के रिकॉर्ड में'} ${count(perf.debates, 'बहस')}, ${count(
      perf.questions,
      'प्रश्न'
    )} और ${count(perf.private_member_bills, 'निजी सदस्य विधेयक')} दर्ज हैं।`
  );
  if (mpladsLine) sentences.push(mpladsLine);
  sentences.push('ये संकेतक गतिविधि दिखाते हैं, सांसद के काम की गुणवत्ता नहीं।');
  return sentences.join(' ');
}

/**
 * Client-side summary getter (PRD FR-11, FR-12): asks /api/summary, which
 * uses the LLM when configured, and falls back to the local template on any
 * error or timeout so the card works offline.
 */
export async function getMPSummary(
  mp: MPRecord,
  lang: AiLang = 'en'
): Promise<SummaryResult> {
  try {
    const res = await fetch('/api/summary', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug: mp.slug, lang }),
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) {
      const data = (await res.json()) as Partial<SummaryResult>;
      if (typeof data.text === 'string' && (data.source === 'llm' || data.source === 'template')) {
        return { text: data.text, source: data.source, lang, generatedAt: data.generatedAt ?? new Date().toISOString() };
      }
    }
  } catch {
    // Offline, timeout or server error: use the template below.
  }
  return { text: generateTemplateSummary(mp, lang), source: 'template', lang, generatedAt: new Date().toISOString() };
}
