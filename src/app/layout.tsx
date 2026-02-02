import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'POTS Tracker',
  description: 'Track POTS symptoms and behavior to identify triggers and patterns',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
