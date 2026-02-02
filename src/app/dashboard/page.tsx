import Link from 'next/link';
import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LogFormView } from '@/components/LogFormView';
import { ThemeToggle } from '@/components/ThemeToggle';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <header className="flex items-center justify-between rounded-2xl bg-card-bg px-4 py-3 shadow-(--shadow-soft)">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground-soft">
          POTS Tracker
        </h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/' });
            }}
          >
            <button
              type="submit"
              className="rounded-full bg-btn-primary px-4 py-2 text-sm text-foreground-soft transition-colors hover:bg-btn-primary-hover"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4">
        <div className="rounded-2xl bg-card-bg p-6 shadow-(--shadow-soft)">
          <p className="text-foreground-soft/90">
            Welcome back. Log your day or add an incident when you&apos;re ready.
          </p>
          <Link
            href="/dashboard/history"
            className="mt-2 inline-block text-sm font-medium text-pastel-outline-pink underline hover:opacity-90"
          >
            View history
          </Link>
        </div>
        <LogFormView />
      </main>
    </div>
  );
}
