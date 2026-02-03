import Link from 'next/link';
import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LogFormView } from '@/components/LogFormView';
import { OnOpenMessage } from '@/components/OnOpenMessage';
import { ExportForm } from '@/components/ExportForm';
import { AnalysisPanel } from '@/components/AnalysisPanel';
import { ThemeToggle } from '@/components/ThemeToggle';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <header className="flex items-center justify-between rounded-2xl bg-card-bg px-3 py-2.5 shadow-(--shadow-soft) sm:px-4 sm:py-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground-soft">POTS Tracker</h1>
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
        <OnOpenMessage userName={session.user?.name ?? session.user?.email ?? 'there'} />
        <ExportForm />
        <AnalysisPanel />
        <LogFormView />
      </main>
    </div>
  );
}
