import Link from 'next/link';
import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LogFormView } from '@/components/LogFormView';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <header className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 shadow-(--shadow-soft) dark:bg-pastel-purple/10">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground-soft">
          POTS Tracker
        </h1>
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/' });
          }}
        >
          <button
            type="submit"
            className="rounded-full border-2 border-pastel-pink/50 bg-pastel-pink/20 px-4 py-2 text-sm text-foreground-soft transition-colors hover:bg-pastel-pink/30"
          >
            Sign out
          </button>
        </form>
      </header>
      <main className="flex flex-1 flex-col gap-4">
        <div className="rounded-2xl bg-white/80 p-6 shadow-(--shadow-soft) dark:bg-pastel-purple/10">
          <p className="text-foreground-soft/90">
            Welcome back. Log your day or add an incident when you&apos;re ready.
          </p>
          <Link
            href="/dashboard/history"
            className="mt-2 inline-block text-sm font-medium text-pastel-purple underline hover:opacity-90"
          >
            View history
          </Link>
        </div>
        <LogFormView />
      </main>
    </div>
  );
}
