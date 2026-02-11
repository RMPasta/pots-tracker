import Link from 'next/link';
import { auth } from '@/lib/auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AppLogo } from '@/components/AppLogo';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  path: '/',
  title: 'POTS Companion — Symptom & trigger tracking for POTS',
  description:
    'Track POTS symptoms and triggers, log daily or by incident, export for your doctor, and get gentle AI insights. Symptom diary for postural orthostatic tachycardia syndrome.',
});

export default async function Home() {
  const session = await auth();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <main className="flex w-full max-w-md flex-col items-center rounded-2xl border border-white/60 bg-card-bg p-5 text-center shadow-(--shadow-soft) sm:p-6">
        <h1 className="sr-only">POTS Companion — Symptom tracking for POTS</h1>
        <div className="mb-3 flex shrink-0 items-center justify-center">
          <AppLogo size="xl" variant="withTitle" />
        </div>
        <p className="mb-0.5 text-sm font-medium uppercase tracking-wider text-foreground-soft/70">
          Symptom & trigger tracking
        </p>
        <h2 className="mb-2 text-xl font-semibold tracking-tight text-foreground-soft sm:text-2xl">
          For POTS and dysautonomia
        </h2>
        <p className="mb-4 max-w-sm text-base leading-relaxed text-foreground-soft/85">
          Track symptoms and behavior to identify triggers and patterns. Log daily or log incidents;
          export for your doctor; get gentle AI insights.
        </p>
        <div className="flex flex-col items-center gap-2">
          {session ? (
            <Link
              href="/dashboard"
              className="w-full max-w-[240px] rounded-full bg-btn-primary px-6 py-3.5 text-center font-medium text-foreground-soft shadow-sm transition-colors hover:bg-btn-primary-hover focus:outline-none focus:ring-2 focus:ring-pastel-outline-pink/40 focus:ring-offset-2"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="w-full max-w-[240px] rounded-full bg-btn-primary px-6 py-3.5 text-center font-medium text-foreground-soft shadow-sm transition-colors hover:bg-btn-primary-hover focus:outline-none focus:ring-2 focus:ring-pastel-outline-pink/40 focus:ring-offset-2"
            >
              Get Started
            </Link>
          )}
          <Link
            href="/contact"
            className="text-sm text-foreground-soft/70 underline decoration-foreground-soft/30 underline-offset-2 transition-colors hover:text-foreground-soft hover:decoration-foreground-soft/50"
          >
            Contact
          </Link>
        </div>
      </main>
    </div>
  );
}
