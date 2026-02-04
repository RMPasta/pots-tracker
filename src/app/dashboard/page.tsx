import Link from 'next/link';
import { auth, signOut } from '@/lib/auth';
import { canUseAIInsights, canUsePDFExport, hasActiveSubscription } from '@/lib/subscription';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/DashboardHeader';
import { LogFormView } from '@/components/LogFormView';
import { OnOpenMessage } from '@/components/OnOpenMessage';

type Props = {
  searchParams: Promise<{ subscription?: string }>;
};

async function signOutAction() {
  'use server';
  await signOut({ redirectTo: '/' });
}

export default async function DashboardPage({ searchParams }: Props) {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  const { subscription } = await searchParams;
  const showSuccessMessage = subscription === 'success';
  const isSubscribed = hasActiveSubscription(session);
  const canUseInsights = canUseAIInsights(session);
  const canUsePDF = canUsePDFExport(session);

  const links = [
    ...(!hasActiveSubscription(session)
      ? [{ href: '/pricing' as const, label: 'Upgrade' as const }]
      : []),
    { href: '/about' as const, label: 'About' as const },
    { href: '/contact' as const, label: 'Contact' as const },
    { href: '/dashboard/settings' as const, label: 'Settings' as const },
  ];

  const signOutButtonClass =
    'flex w-full min-h-[44px] items-center justify-center rounded-full bg-btn-primary px-4 py-3 text-center text-sm font-medium text-foreground-soft transition-colors hover:bg-btn-primary-hover';

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <DashboardHeader
        links={links}
        signOutSlot={
          <form action={signOutAction} className="w-full">
            <button type="submit" className={signOutButtonClass}>
              Sign out
            </button>
          </form>
        }
        signOutSlotMobile={
          <form action={signOutAction} className="w-full">
            <button type="submit" className={signOutButtonClass}>
              Sign out
            </button>
          </form>
        }
      />
      <main className="flex flex-1 flex-col gap-4">
        {showSuccessMessage && (
          <p className="rounded-xl bg-pastel-outline-pink/20 px-3 py-2 text-sm text-foreground-soft">
            {isSubscribed
              ? "You're subscribed. You now have access to AI insights and PDF export."
              : 'Payment successful. Your subscription is syncing—refresh in a moment to see your new features.'}
          </p>
        )}
        <OnOpenMessage userName={session.user?.name ?? session.user?.email ?? 'there'} />
        <LogFormView canUseInsights={canUseInsights} canUsePDF={canUsePDF} />
      </main>
    </div>
  );
}
