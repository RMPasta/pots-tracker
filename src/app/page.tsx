import Link from 'next/link';
import { auth } from '@/lib/auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AppLogo } from '@/components/AppLogo';

export default async function Home() {
  const session = await auth();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <main className="flex min-h-[520px] w-full max-w-md flex-col items-center rounded-2xl bg-card-bg p-4 text-center shadow-(--shadow-soft)">
        <div className="mb-1 flex h-[280px] w-[280px] shrink-0 items-center justify-center overflow-hidden">
          <AppLogo size="xl" className="scale-125 object-center" />
        </div>
        <p className="mb-5 text-lg leading-snug text-foreground-soft/90">
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
