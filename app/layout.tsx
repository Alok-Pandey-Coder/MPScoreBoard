import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const SITE_DESCRIPTION =
  'A neutral, source-backed report card for your Lok Sabha MP: attendance, debates, questions, MPLADS funds and declared affidavit details, each with its source and date.';

export const metadata: Metadata = {
  // Absolute base for canonical and Open Graph URLs; set NEXT_PUBLIC_SITE_URL on deploy.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Mera MP, Mera Report Card — 18th Lok Sabha',
  description: SITE_DESCRIPTION,
  openGraph: {
    title: 'Mera MP, Mera Report Card',
    description: SITE_DESCRIPTION,
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400&family=Outfit:wght@500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var saved = localStorage.getItem('mera-mp-theme');
                if (saved === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.dataset.theme = 'light';
                  document.documentElement.style.colorScheme = 'light';
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.dataset.theme = 'dark';
                  document.documentElement.style.colorScheme = 'dark';
                }
              } catch (e) {
                document.documentElement.classList.add('dark');
              }

              // Auto-unregister stale PWA Service Worker & clear old caches
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(regs) {
                  for (var r of regs) { r.unregister(); }
                });
                if ('caches' in window) {
                  caches.keys().then(function(names) {
                    for (var n of names) { caches.delete(n); }
                  });
                }
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#14191F] text-slate-900 dark:text-[#F3F4F6] transition-colors duration-200">
        <ThemeProvider>
          <Header />
          <div className="flex-1 w-full">{children}</div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
