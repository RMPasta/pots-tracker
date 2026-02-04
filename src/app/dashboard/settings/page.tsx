import Link from 'next/link';
import { auth } from '@/lib/auth';
import { hasActiveSubscription } from '@/lib/subscription';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/DashboardHeader';
import { SettingsNameForm } from '@/components/SettingsNameForm';
import { ManageSubscriptionButton } from '@/components/ManageSubscriptionButton';

export default async function SettingsPage() {
  const session = await auth();
  if (!session) {
    redirect('/auth/signin');
  }

  const initialName = session.user?.name ?? '';

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <DashboardHeader links={[{ href: '/dashboard', label: 'Back to dashboard' }]} />

      <main className="flex flex-1 flex-col gap-4">
        <h2 className="text-xl font-medium text-foreground-soft">Settings</h2>

        <div className="rounded-2xl bg-card-bg p-4 shadow-(--shadow-soft) sm:p-5">
          <h3 className="text-sm font-medium text-foreground-soft/80">Profile</h3>
          <div className="mt-3">
            <SettingsNameForm initialName={initialName} />
          </div>
        </div>

        <div className="rounded-2xl bg-card-bg p-4 shadow-(--shadow-soft) sm:p-5">
          <h3 className="text-sm font-medium text-foreground-soft/80">Subscription</h3>
          <div className="mt-3">
            {hasActiveSubscription(session) ? (
              <>
                <p className="text-sm text-foreground-soft/80">
                  Manage your subscription, payment method, or cancel.
                </p>
                <div className="mt-3">
                  <ManageSubscriptionButton />
                </div>
              </>
            ) : (
              <p className="text-sm text-foreground-soft/80">
                You&apos;re on the free plan.{' '}
                <Link
                  href="/pricing"
                  className="font-medium text-foreground-soft underline hover:no-underline"
                >
                  Upgrade
                </Link>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
