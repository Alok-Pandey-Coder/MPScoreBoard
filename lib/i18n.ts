/**
 * lib/i18n.ts — UI languages.
 *
 * Interface text is translated; source data (MP and constituency names, work
 * descriptions, affidavit text) is always shown exactly as published.
 *
 * Each feature keeps its text in a `defineMessages({ en, hi })` block next to
 * its code (lib/i18n/messages/*.ts). `hi` is type-checked against `en`, so a
 * missing or extra Hindi entry fails the build.
 */

export type Lang = 'en' | 'hi';

export const DEFAULT_LANG: Lang = 'en';
export const LANG_STORAGE_KEY = 'mera-mp-lang';

/** Name of each language, written in that language (for the switcher). */
export const LANG_NATIVE_NAME: Record<Lang, string> = { en: 'English', hi: 'हिंदी' };

/** BCP 47 locale used for dates and numbers. */
export const LOCALE: Record<Lang, string> = { en: 'en-IN', hi: 'hi-IN' };

export type Messages<T> = { en: T; hi: T };

/**
 * Declares one namespace of UI text. Values may be strings or functions for
 * text with numbers or names in it, e.g. `seats: (n: number) => \`${n} seats\``.
 */
export function defineMessages<T extends Record<string, unknown>>(messages: { en: T; hi: NoInfer<T> }): Messages<T> {
  return messages;
}

export function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'hi';
}
