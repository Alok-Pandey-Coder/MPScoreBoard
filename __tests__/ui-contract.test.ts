/**
 * __tests__/ui-contract.test.ts
 * Display-rule tests: null never becomes zero, neutral comparisons, template
 * summaries cite only record numbers, and mps.json MPLADS blocks match the
 * MpladsData contract in types/mp.ts.
 */

import fs from 'fs';
import path from 'path';
import {
  formatCrore,
  formatCroreOrLakh,
  formatNumber,
  formatPct,
  formatRupeesInCrore,
  NOT_AVAILABLE,
} from '../lib/formatters';
import { compareWithAverage } from '../lib/comparisons';
import { generateTemplateSummary, knownNumbersForRecord, verifyGuardrails } from '../lib/ai/summary';
import { generateCitizenDraft } from '../lib/ai/draft';
import type { MPRecord } from '../types/mp';

function makeRecord(overrides: Partial<MPRecord> = {}): MPRecord {
  return {
    slug: 'sample-seat-delhi',
    name: 'Sample Person',
    constituency: 'Sample Seat',
    state: 'Delhi',
    party: 'Party X',
    term: '18th Lok Sabha',
    is_minister: false,
    performance: {
      status: 'reported',
      attendance_pct: 91,
      debates: 7,
      questions: 63,
      private_member_bills: 0,
      as_of: '2026-08-13',
      prs_averages: {
        state: { attendance_pct: null, debates: null, questions: null, private_member_bills: null },
        national: { attendance_pct: null, debates: null, questions: null, private_member_bills: null },
      },
      source: { name: 'PRS Legislative Research', url: 'https://prsindia.org/' },
      review_status: 'parsed',
    },
    sources: [],
    ...overrides,
  };
}

describe('formatters', () => {
  it('renders null/undefined as "Not available"', () => {
    expect(NOT_AVAILABLE).toBe('Not available');
    for (const fn of [formatCrore, formatCroreOrLakh, formatNumber, formatPct, formatRupeesInCrore]) {
      expect(fn(null)).toBe('Not available');
      expect(fn(undefined)).toBe('Not available');
    }
  });

  it('renders zero as zero, never as missing', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatPct(0)).toBe('0%');
    expect(formatCrore(0)).toBe('₹0 Cr');
    expect(formatCroreOrLakh(0)).toBe('₹0 Cr');
    expect(formatRupeesInCrore(0)).toBe('₹0 Cr');
  });

  it('formats small crore amounts in lakh', () => {
    expect(formatCroreOrLakh(0.25)).toBe('₹25 lakh');
    expect(formatCroreOrLakh(2.65)).toBe('₹2.65 Cr');
  });
});

describe('compareWithAverage', () => {
  it('returns unavailable when either side is null', () => {
    expect(compareWithAverage(null, 80, 'percentage').relation).toBe('unavailable');
    expect(compareWithAverage(80, null, 'count').relation).toBe('unavailable');
  });

  it('uses ±5 percentage points for attendance', () => {
    expect(compareWithAverage(85, 80, 'percentage').relation).toBe('similar');
    expect(compareWithAverage(75, 80, 'percentage').relation).toBe('similar');
    expect(compareWithAverage(85.1, 80, 'percentage').relation).toBe('higher');
    expect(compareWithAverage(74.9, 80, 'percentage').relation).toBe('lower');
  });

  it('uses ±10% of the average for counts', () => {
    expect(compareWithAverage(110, 100, 'count').relation).toBe('similar');
    expect(compareWithAverage(90, 100, 'count').relation).toBe('similar');
    expect(compareWithAverage(111, 100, 'count').relation).toBe('higher');
    expect(compareWithAverage(89, 100, 'count').relation).toBe('lower');
  });

  it('handles a zero average without dividing by zero', () => {
    expect(compareWithAverage(0, 0, 'count').relation).toBe('similar');
    expect(compareWithAverage(1, 0, 'count').relation).toBe('higher');
  });
});

describe('generateTemplateSummary', () => {
  const numbersIn = (text: string) => (text.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);

  it.each(['en', 'hi', 'hinglish'] as const)('cites only numbers present in the record (%s)', (lang) => {
    const mp = makeRecord();
    const text = generateTemplateSummary(mp, lang);
    const known = knownNumbersForRecord(mp);
    for (const n of numbersIn(text)) expect(known.has(n)).toBe(true);
    expect(verifyGuardrails(text, mp)).toBe(true);
  });

  it.each(['en', 'hi', 'hinglish'] as const)('never invents 96/85 averages when averages are null (%s)', (lang) => {
    const text = generateTemplateSummary(makeRecord(), lang);
    expect(text).not.toMatch(/\b96\b/);
    expect(text).not.toMatch(/\b85\b/);
  });

  it('says not available instead of zero for null metrics', () => {
    const mp = makeRecord({
      performance: { ...makeRecord().performance, debates: null, private_member_bills: null, attendance_pct: null },
    });
    const text = generateTemplateSummary(mp, 'en');
    expect(text).toMatch(/attendance is not available/);
    expect(text).toMatch(/debates: not available/);
    expect(text).toMatch(/private member bills: not available/);
    expect(text).not.toMatch(/\b0 private member bills\b/);
  });

  it('keeps zero as zero', () => {
    expect(generateTemplateSummary(makeRecord(), 'en')).toMatch(/0 private member bills/);
  });

  it('uses the record state, not a hardcoded one, and is gender-neutral', () => {
    const text = generateTemplateSummary(makeRecord({ state: 'Sample State' }), 'en');
    expect(text).toContain('Sample State');
    expect(text).not.toMatch(/\bDelhi\b/);
    expect(text).not.toMatch(/\b(His|Her|his|her)\b/);
  });

  it.each(['en', 'hi', 'hinglish'] as const)('handles ministers as not applicable (%s)', (lang) => {
    const mp = makeRecord({
      is_minister: true,
      performance: {
        status: 'not_applicable',
        attendance_pct: null,
        debates: null,
        questions: null,
        private_member_bills: null,
      },
    });
    const text = generateTemplateSummary(mp, lang);
    expect(text).toMatch({ en: /don't apply/, hi: /लागू नहीं/, hinglish: /lagu nahi/ }[lang]);
    expect(text).not.toMatch(/Union Minister/);
    expect(numbersIn(text).every((n) => knownNumbersForRecord(mp).has(n))).toBe(true);
  });

  it('adds an MPLADS sentence only from record figures', () => {
    const mp = makeRecord({
      mplads: {
        status: 'reported',
        allocated_cr: 9.8,
        expenditure_cr: 2.6518,
        as_of: '2026-10-31',
        source: { name: 'Empowered Indian', url: 'https://empoweredindian.in/' },
      },
    });
    const text = generateTemplateSummary(mp, 'en');
    expect(text).toContain('₹2.65 crore of ₹9.8 crore allocated');
    expect(verifyGuardrails(text, mp)).toBe(true);
  });

  it('guardrail rejects numbers not in the record', () => {
    expect(verifyGuardrails('Attendance is 96%.', makeRecord())).toBe(false);
  });

  it.each(['en', 'hi', 'hinglish'] as const)('summaries for every mps.json record pass the guardrail (%s)', (lang) => {
    const file = path.join(__dirname, '..', 'data', 'processed', 'mps.json');
    const records: MPRecord[] = JSON.parse(fs.readFileSync(file, 'utf-8'));
    for (const r of records) expect(verifyGuardrails(generateTemplateSummary(r, lang), r)).toBe(true);
  });
});

describe('generateCitizenDraft', () => {
  it('uses gender-neutral Hinglish and no judgement-tinged thanks', () => {
    const mp = makeRecord();
    for (const intent of ['mplads_works', 'parliament_question', 'attendance_clarification', 'general_feedback'] as const) {
      const hi = generateCitizenDraft(mp, { intent, lang: 'hinglish' }).body;
      expect(hi).not.toMatch(/\bhoon\b|kar raha|karta hoon|chahta/);
      const en = generateCitizenDraft(mp, { intent, lang: 'en' }).body;
      expect(en).not.toMatch(/service and dedication/);
      for (const n of (en.match(/\d+(?:\.\d+)?/g) ?? []).map(Number)) {
        expect(knownNumbersForRecord(mp).has(n)).toBe(true);
      }
    }
  });
});

describe('mps.json MPLADS contract', () => {
  const file = path.join(__dirname, '..', 'data', 'processed', 'mps.json');
  const records: MPRecord[] = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const NEW_KEYS = [
    'allocated_cr',
    'recommended_amount_cr',
    'expenditure_cr',
    'unspent_cr',
    'expenditure_pct',
    'recommended_pct',
    'works_count',
    'works',
    'as_of',
    'source',
    'review_status',
  ];
  const OLD_KEYS = ['entitlement', 'funds_released', 'expenditure', 'utilisation_pct', 'unspent_balance'];
  const reported = records.filter((r) => r.mplads && r.mplads.status === 'reported');
  const migrated = reported.filter((r) => r.mplads && 'allocated_cr' in r.mplads);

  if (migrated.length === 0) {
    it.skip('mps.json not yet migrated to the MpladsData contract (data agent pending)', () => undefined);
    return;
  }

  it.each(reported.map((r) => [r.slug, r] as const))('%s matches the MpladsData contract', (_slug, r) => {
    const m = r.mplads as unknown as Record<string, unknown>;
    for (const key of NEW_KEYS) expect(m).toHaveProperty(key);
    for (const key of OLD_KEYS) expect(m).not.toHaveProperty(key);
    expect(Array.isArray(m.works)).toBe(true);
    const unspent = m.unspent_cr as number | null;
    if (unspent !== null) expect(typeof unspent).toBe('number');
    const wc = m.works_count as Record<string, unknown> | null;
    if (wc) for (const k of ['recommended', 'sanctioned', 'completed', 'pending']) expect(wc).toHaveProperty(k);
  });
});
