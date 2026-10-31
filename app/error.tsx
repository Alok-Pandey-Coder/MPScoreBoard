'use client';

import Link from 'next/link';
import { useMessages } from '@/context/LanguageContext';
import { errorMessages } from '@/lib/messages/errors';

export default function Error({ retry }: { error: unknown; retry: () => void }) {
  const t = useMessages(errorMessages);
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div
        role="alert"
        className="bg-white dark:bg-[#0E1420] rounded-xl p-5 sm:p-7 border border-stone-200/90 dark:border-[#1E2636] shadow-sm space-y-4"
      >
        <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
          {t.errorTitle}
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          {t.errorBody}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="px-4 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 text-sm font-semibold hover:bg-stone-800 dark:hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {t.retry}
          </button>
          <Link href="/" className="text-sm underline text-stone-800 dark:text-stone-200">
            {t.goHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
