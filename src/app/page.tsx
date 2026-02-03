import Link from 'next/link';
import { auth } from '@/lib/auth';
import { ThemeToggle } from '@/components/ThemeToggle';

export default async function Home() {
  const session = await auth();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <main className="flex max-w-2xl flex-col items-center gap-6 rounded-2xl bg-card-bg p-8 text-center shadow-(--shadow-soft)">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground-soft">POTS Tracker</h1>
        <p className="text-lg text-foreground-soft/90">
          Track symptoms and behavior to identify triggers and patterns. Log daily or log incidents;
          export for your doctor; get gentle AI insights.
        </p>
        {session ? (
          <Link
            href="/dashboard"
            className="rounded-full bg-btn-primary px-6 py-3 text-foreground-soft transition-colors hover:bg-btn-primary-hover"
          >
            Go to Dashboard
          </Link>
        ) : (
          <Link
            href="/auth/signin"
            className="rounded-full bg-btn-primary px-6 py-3 text-foreground-soft transition-colors hover:bg-btn-primary-hover"
          >
            Get Started
          </Link>
        )}
      </main>
    </div>
  );
}
