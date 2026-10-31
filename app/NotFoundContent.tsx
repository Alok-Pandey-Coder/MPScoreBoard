'use client';

import Link from 'next/link';
import type { MPRecord } from '@/types/mp';
import { UnifiedSearchBar } from '@/components/home/UnifiedSearchBar';
import { useMessages } from '@/context/LanguageContext';
import { errorMessages } from '@/lib/messages/errors';

/** Client half of the 404 page, in the chosen UI language. */
export function NotFoundContent({ mps }: { mps: MPRecord[] }) {
  const t = useMessages(errorMessages);
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-6">
      <div className="bg-white dark:bg-[#0E1420] rounded-xl p-5 sm:p-7 border border-stone-200/90 dark:border-[#1E2636] shadow-sm space-y-4">
        <p className="text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400">404</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
          {t.notFoundTitle}
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400">{t.notFoundBody}</p>
        <UnifiedSearchBar mps={mps} />
        <ul aria-label={t.notFoundLinksAria} className="flex flex-wrap gap-3 text-sm pt-2">
          <li>
            <Link href="/" className="underline text-stone-800 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white">
              {t.home}
            </Link>
          </li>
          <li>
            <Link href="/#mp-cards" className="underline text-stone-800 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white">
              {t.allCards}
            </Link>
          </li>
          <li>
            <Link href="/about" className="underline text-stone-800 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white">
              {t.about}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
