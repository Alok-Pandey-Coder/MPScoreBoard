import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllMPs } from '@/lib/data';
import { UnifiedSearchBar } from '@/components/home/UnifiedSearchBar';

export const metadata: Metadata = {
  title: 'Page not found — Mera MP, Mera Report Card',
};

export default function NotFound() {
  const mps = getAllMPs();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-6">
      <div className="bg-white dark:bg-[#0E1420] rounded-xl p-5 sm:p-7 border border-stone-200/90 dark:border-[#1E2636] shadow-sm space-y-4">
        <p className="text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400">404</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
          We couldn&apos;t find that page
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          The link may be mistyped or the page may have moved. Search for an MP, constituency or state below.
        </p>
        <UnifiedSearchBar mps={mps} />
        <ul className="flex flex-wrap gap-3 text-sm pt-2">
          <li>
            <Link href="/" className="underline text-stone-800 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white">
              Home
            </Link>
          </li>
          <li>
            <Link href="/#mp-cards" className="underline text-stone-800 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white">
              All MP report cards
            </Link>
          </li>
          <li>
            <Link href="/about" className="underline text-stone-800 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white">
              About &amp; methodology
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
