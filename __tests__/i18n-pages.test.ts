/**
 * __tests__/i18n-pages.test.ts
 * Hindi coverage for the about, compare, map, state and error pages: every
 * message has a non-empty Hindi value, and the neutral wording rules hold.
 */

import type { Messages } from '../lib/i18n';
import { aboutMessages } from '../lib/messages/about';
import { compareMessages } from '../lib/messages/compare';
import { exploreMessages } from '../lib/messages/explore';
import { stateMessages } from '../lib/messages/state';
import { errorMessages } from '../lib/messages/errors';

const NAMESPACES: Record<string, Messages<Record<string, unknown>>> = {
  about: aboutMessages,
  compare: compareMessages,
  explore: exploreMessages,
  state: stateMessages,
  errors: errorMessages,
};

const DEVANAGARI = /[ऀ-ॿ]/;
// Punctuation-only fragments that join translated pieces of one sentence.
const JOINERS = new Set(['.', '।']);

/** Resolves a message value to text, calling functions with sample args. */
function render(value: unknown): string {
  if (typeof value === 'function') {
    const args = Array.from({ length: value.length }, (_, i) => (i === 0 ? 'Delhi' : 7));
    return String((value as (...a: unknown[]) => unknown)(...args));
  }
  return String(value);
}

describe.each(Object.entries(NAMESPACES))('%s messages', (_name, messages) => {
  it('has the same keys in English and Hindi', () => {
    expect(Object.keys(messages.hi).sort()).toEqual(Object.keys(messages.en).sort());
  });

  it.each(Object.keys(messages.en))('has a non-empty Hindi value for %s', (key) => {
    const en = messages.en[key];
    const hi = messages.hi[key];
    expect(typeof hi).toBe(typeof en);
    const text = render(hi).trim();
    expect(text.length).toBeGreaterThan(0);
    if (!JOINERS.has(text)) expect(text).toMatch(DEVANAGARI);
  });

  it('uses no ranking or judgemental labels in Hindi', () => {
    const banned = ['आपराधिक सांसद', 'सबसे खराब', 'सबसे अच्छा', 'आलसी', 'नाकाम', 'बेकार'];
    for (const value of Object.values(messages.hi)) {
      const text = render(value);
      for (const word of banned) expect(text).not.toContain(word);
    }
  });

  it('keeps digits Western (0-9) in Hindi', () => {
    for (const value of Object.values(messages.hi)) {
      expect(render(value)).not.toMatch(/[०-९]/);
    }
  });
});

describe('about page disclaimer', () => {
  it('has the Hindi disclaimer with its full meaning', () => {
    const hi = aboutMessages.hi.disclaimer;
    expect(hi).toContain('मेरा सांसद, मेरा रिपोर्ट कार्ड');
    expect(hi).toContain('स्वतंत्र नागरिक परियोजना');
    expect(hi).toContain('hackCBS 9.0');
    expect(hi).toContain('भारत की संसद');
    expect(hi).toContain('भारत निर्वाचन आयोग');
    expect(hi).toContain('राजनीतिक दल');
    expect(aboutMessages.hi.disclaimerHeading).toContain('अस्वीकरण');
  });

  it('shows ministers as not applicable, never zero', () => {
    expect(aboutMessages.hi.ministersNotApplicable).toBe('लागू नहीं (मंत्री)');
    expect(compareMessages.hi.notApplicableMinister).toBe('लागू नहीं (मंत्री)');
  });

  it('fills the snapshot version into the Hindi text', () => {
    expect(aboutMessages.hi.snapshotVersion('2026-10-31')).toContain('2026-10-31');
  });
});
