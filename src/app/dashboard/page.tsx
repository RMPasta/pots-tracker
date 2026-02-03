import Link from 'next/link';
import { auth, signOut } from '@/lib/auth';
import { canUseAIInsights, canUsePDFExport, hasActiveSubscription } from '@/lib/subscription';
import { redirect } from 'next/navigation';
import { LogFormView } from '@/components/LogFormView';
import { OnOpenMessage } from '@/components/OnOpenMessage';
import { ThemeToggle } from '@/components/ThemeToggle';

type Props = {
  searchParams: Promise<{ subscription?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  const { subscription } = await searchParams;
  const showSuccessMessage = subscription === 'success';
  const canUseInsights = canUseAIInsights(session);
  const canUsePDF = canUsePDFExport(session);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <header className="flex items-center justify-between rounded-2xl bg-card-bg px-3 py-2.5 shadow-(--shadow-soft) sm:px-4 sm:py-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground-soft">POTS Tracker</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!hasActiveSubscription(session) && (
            <Link
              href="/pricing"
              className="rounded-full bg-btn-primary px-4 py-2 text-sm font-medium text-foreground-soft transition-colors hover:bg-btn-primary-hover"
            >
              Upgrade
            </Link>
          )}
          <Link
            href="/dashboard/settings"
            className="rounded-full bg-btn-primary px-4 py-2 text-sm font-medium text-foreground-soft transition-colors hover:bg-btn-primary-hover"
          >
            Settings
          </Link>
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
        {showSuccessMessage && (
          <p className="rounded-xl bg-pastel-outline-pink/20 px-3 py-2 text-sm text-foreground-soft">
            You&apos;re subscribed. You now have access to AI insights and PDF export.
          </p>
        )}
        <OnOpenMessage userName={session.user?.name ?? session.user?.email ?? 'there'} />
        <LogFormView canUseInsights={canUseInsights} canUsePDF={canUsePDF} />
      </main>
    </div>
  );
}
