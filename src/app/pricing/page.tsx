import Link from 'next/link';
import { auth } from '@/lib/auth';
import { canUsePDFExport } from '@/lib/subscription';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SubscribeButton } from '@/components/SubscribeButton';

type Props = {
  searchParams: Promise<{ canceled?: string }>;
};

export default async function PricingPage({ searchParams }: Props) {
  const session = await auth();
  const { canceled } = await searchParams;
  const showCanceledMessage = canceled === '1';
  const isSubscribed = session ? canUsePDFExport(session) : false;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md rounded-2xl bg-card-bg p-6 shadow-(--shadow-soft)">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground-soft">Pricing</h1>

        {showCanceledMessage && (
          <p className="mt-3 rounded-xl bg-pastel-outline-pink/20 px-3 py-2 text-sm text-foreground-soft">
            Checkout canceled. You can try again whenever you’re ready.
          </p>
        )}

        <div className="mt-6 space-y-6">
          <section>
            <h2 className="text-lg font-medium text-foreground-soft">Free</h2>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-foreground-soft/90">
              <li>Logging (daily + incidents)</li>
              <li>History</li>
              <li>CSV export</li>
            </ul>
          </section>

          <div className="border-t border-pastel-outline-pink/40" />

          <section>
            <h2 className="text-lg font-medium text-foreground-soft">Pro</h2>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-foreground-soft/90">
              <li>Everything in Free</li>
              <li>AI insights</li>
              <li>PDF doctor report</li>
            </ul>
          </section>
        </div>

        <div className="mt-8">
          {!session && (
            <Link
              href="/auth/signin?callbackUrl=/pricing"
              className="inline-block rounded-full bg-btn-primary px-6 py-3 text-foreground-soft transition-colors hover:bg-btn-primary-hover"
            >
              Sign in to subscribe
            </Link>
          )}
          {session && isSubscribed && (
            <div>
              <p className="text-foreground-soft/90">You’re on Pro.</p>
              <Link
                href="/dashboard"
                className="mt-3 inline-block rounded-full bg-btn-primary px-6 py-3 text-foreground-soft transition-colors hover:bg-btn-primary-hover"
              >
                Back to Dashboard
              </Link>
            </div>
          )}
          {session && !isSubscribed && <SubscribeButton />}
        </div>
      </div>
    </div>
  );
}
