import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { getBaseUrl } from '@/lib/seo';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'POTS Tracker',
  description:
    'Track POTS symptoms and behavior to identify triggers and patterns. Log daily or log incidents; export for your doctor; get gentle AI insights.',
  openGraph: {
    type: 'website',
    siteName: 'POTS Tracker',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'POTS Tracker' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/logo.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

const themeScript = `
(function(){
  var t = localStorage.getItem('pots-tracker-theme');
  if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased bg-background-soft text-foreground-soft">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
            <footer className="py-4 text-center text-sm [color:var(--color-footer-muted)]">
              <a href="/about" className="underline hover:[color:var(--color-footer-muted-hover)]">
                About
              </a>
              {' · '}
              Made with love for my amazing wife, Dana 🐸❤️
            </footer>
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
