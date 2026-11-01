/**
 * __tests__/i18n-card.test.ts
 * Hindi report card: every interface string has Hindi text, names stay as
 * published (PRD 5.6), and Hindi summaries and drafts follow the same
 * guardrails as the English ones.
 */

import fs from 'fs';
import path from 'path';
import { cardMessages } from '../lib/messages/card';
import {
  BANNED_HI,
  containsBannedWords,
  generateTemplateSummary,
  parseSummaryRequest,
  verifyGuardrails,
} from '../lib/ai/summary';
import type { MPRecord } from '../types/mp';

const ROOT = path.join(__dirname, '..');
const records: MPRecord[] = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'processed', 'mps.json'), 'utf-8'));
const CARD_DIR = path.join(ROOT, 'components', 'mp');
const cardFiles = fs
  .readdirSync(CARD_DIR)
  .filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'))
  .map((f) => ({ name: f, text: fs.readFileSync(path.join(CARD_DIR, f), 'utf-8') }));

const DEVANAGARI = /[ऀ-ॿ]/;
/** First-person or gendered verb forms that would assume the writer's or MP's gender. */
const GENDERED_HI = /हूँ|हूं|करता|करती|चाहता|चाहती|रहा हूँ|रही हूँ|लिखता|लिखती|\bवह\b/;

/** Calls message functions with sample arguments so their output can be checked. */
function render(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (typeof value === 'function') {
    const fn = value as (...args: unknown[]) => unknown;
    const samples: unknown[][] = [
      Array(fn.length).fill('X'),
      Array(fn.length).fill(3),
      Array(fn.length).fill(null),
      ['SC', 'X', 'X'],
      ['ST', 'X', 'X'],
      ['First Term'],
      ['18th Lok Sabha'],
    ];
    return samples.map((args) => String(fn(...args)));
  }
  throw new Error(`Unexpected message value: ${typeof value}`);
}

describe('cardMessages', () => {
  const en = cardMessages.en as Record<string, unknown>;
  const hi = cardMessages.hi as Record<string, unknown>;

  it('has the same keys in English and Hindi', () => {
    expect(Object.keys(hi).sort()).toEqual(Object.keys(en).sort());
  });

  it.each(Object.keys(en))('"%s" has a non-empty Hindi value', (key) => {
    const value = hi[key];
    expect(typeof value === 'string' || typeof value === 'function').toBe(true);
    for (const text of render(value)) {
      if (key === 'listSeparator') expect(text.length).toBeGreaterThan(0);
      else expect(text.trim().length).toBeGreaterThan(0);
    }
  });

  it('uses Devanagari for Hindi interface text (apart from acronyms and passthroughs)', () => {
    // Keys whose Hindi value is legitimately a passthrough or punctuation.
    const passthrough = new Set(['listSeparator', 'termNumber', 'termLabel']);
    for (const [key, value] of Object.entries(hi)) {
      if (passthrough.has(key)) continue;
      const texts = render(value);
      expect([key, texts.some((t) => DEVANAGARI.test(t))]).toEqual([key, true]);
    }
  });

  it('contains no banned judgement words in either language', () => {
    for (const lang of ['en', 'hi'] as const) {
      for (const value of Object.values(cardMessages[lang] as Record<string, unknown>)) {
        for (const text of render(value)) expect(containsBannedWords(text)).toBe(false);
      }
    }
  });

  it('describes declared cases as allegations, not convictions, in Hindi', () => {
    expect(cardMessages.hi.affidavitDeclaredIn(2024)).toBe('2024 के चुनावी हलफ़नामे में घोषित');
    expect(cardMessages.hi.affidavitCasesNote).toContain('आरोप');
    expect(cardMessages.hi.affidavitCasesNote).toContain('दोषसिद्धि नहीं');
    expect(cardMessages.hi.notApplicableMinister).toContain('लागू नहीं');
  });
});

describe('report card components', () => {
  it.each(cardFiles.map((f) => [f.name, f.text] as const))(
    '%s does not translate names, constituencies, works, agencies or education',
    (_name, text) => {
      // Only state and party may be shown in Hindi (PRD 5.6).
      expect(text).not.toMatch(/\blocalize(?!State\b|Party\b)[A-Z]\w*/);
      expect(text).not.toMatch(/translateWorkDescription|HINDI_[A-Z_]+/);
    }
  );

  it.each(cardFiles.map((f) => [f.name, f.text] as const))(
    '%s keeps its Hindi text in lib/messages, not inline',
    (_name, text) => {
      expect(text).not.toMatch(DEVANAGARI);
      expect(text).not.toMatch(/lang === 'hi' \?/);
    }
  );
});

describe('Hindi template summary', () => {
  it.each(records.map((r) => [r.slug, r] as const))('%s passes the guardrails', (_slug, mp) => {
    const text = generateTemplateSummary(mp, 'hi');
    expect(DEVANAGARI.test(text)).toBe(true);
    expect(verifyGuardrails(text, mp)).toBe(true);
    expect(containsBannedWords(text)).toBe(false);
    for (const word of BANNED_HI) expect(text).not.toContain(word);
    expect(text).not.toMatch(GENDERED_HI);
    // Names exactly as published.
    expect(text).toContain(mp.name);
    expect(text).toContain(mp.constituency);
    if (mp.is_minister || mp.performance.status === 'not_applicable') expect(text).toContain('लागू नहीं');
  });

  it('says not available instead of zero for missing Hindi metrics', () => {
    const mp = records.find((r) => r.performance.status === 'reported') as MPRecord;
    const blank = { ...mp, performance: { ...mp.performance, debates: null, private_member_bills: null } };
    const text = generateTemplateSummary(blank, 'hi');
    expect(text).toContain('बहस: उपलब्ध नहीं');
    expect(text).toContain('निजी सदस्य विधेयक: उपलब्ध नहीं');
  });
});

describe('API request parsing accepts Hindi', () => {
  it('parses a Hindi summary request', () => {
    expect(parseSummaryRequest({ slug: 'new-delhi-delhi', lang: 'hi' })).toEqual({ slug: 'new-delhi-delhi', lang: 'hi' });
  });
});
