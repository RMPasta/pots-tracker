import Link from 'next/link';
import { auth } from '@/lib/auth';
import { canUsePDFExport } from '@/lib/subscription';
import { AppLogo } from '@/components/AppLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SubscribeButton } from '@/components/SubscribeButton';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  path: '/pricing',
  title: 'Plans & pricing — POTS Tracker',
  description:
    'Free tier: symptom and trigger logging, history, CSV export. Pro: AI insights and PDF doctor report for POTS symptom tracking.',
});

type Props = {
  searchParams: Promise<{ canceled?: string }>;
};

const CHECK = (
  <svg
    className="h-4 w-4 shrink-0 text-pastel-outline-pink"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-foreground-soft/90">
      {CHECK}
      <span>{children}</span>
    </li>
  );
}

export default async function PricingPage({ searchParams }: Props) {
  const session = await auth();
  const { canceled } = await searchParams;
  const showCanceledMessage = canceled === '1';
  const isSubscribed = session ? canUsePDFExport(session) : false;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 p-4 sm:p-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="flex w-full max-w-2xl flex-col items-center gap-4 rounded-2xl bg-card-bg p-4 text-center shadow-(--shadow-soft)">
        <div className="-mb-16 flex h-[280px] w-[280px] shrink-0 items-center justify-center overflow-hidden">
          <AppLogo size="xl" className="scale-125 object-center" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground-soft">Plans</h1>
        <p className="text-sm text-foreground-soft/80">Symptom tracking for POTS: Free and Pro.</p>

        {showCanceledMessage && (
          <p
            className="w-full rounded-xl bg-pastel-outline-pink/20 px-3 py-2 text-sm text-foreground-soft"
            role="status"
          >
            Checkout canceled. You can try again whenever you’re ready.
          </p>
        )}

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <section
            className="flex flex-col rounded-2xl bg-card-bg p-5 text-left shadow-(--shadow-soft)"
            aria-labelledby="tier-free"
          >
            <h2 id="tier-free" className="text-xl font-semibold text-foreground-soft">
              Free
            </h2>
            <ul className="mt-4 space-y-2.5">
              <FeatureItem>Logging (daily + incidents)</FeatureItem>
              <FeatureItem>History</FeatureItem>
              <FeatureItem>CSV export</FeatureItem>
            </ul>
          </section>

          <section
            className="relative flex flex-col rounded-2xl border-2 border-pastel-outline-pink/60 bg-pastel-outline-pink/5 p-5 text-left shadow-(--shadow-soft)"
            aria-labelledby="tier-pro"
          >
            <span className="absolute right-4 top-4 rounded-full bg-pastel-outline-pink/30 px-2.5 py-0.5 text-xs font-medium text-foreground-soft">
              Recommended
            </span>
            <h2 id="tier-pro" className="text-xl font-semibold text-foreground-soft">
              Pro
            </h2>
            <p className="mt-1 text-sm text-foreground-soft/80">$1/month</p>
            <ul className="mt-4 space-y-2.5">
              <FeatureItem>Everything in Free</FeatureItem>
              <FeatureItem>AI insights</FeatureItem>
              <FeatureItem>PDF doctor report</FeatureItem>
            </ul>
            <div className="mt-6 flex flex-col gap-2">
              {!session && (
                <Link
                  href="/auth/signin?callbackUrl=/pricing"
                  className="rounded-full bg-btn-primary px-6 py-3 text-center text-foreground-soft transition-colors hover:bg-btn-primary-hover"
                >
                  Sign in to subscribe
                </Link>
              )}
              {session && isSubscribed && (
                <>
                  <p className="text-sm text-foreground-soft/90">You’re on Pro.</p>
                  <Link
                    href="/dashboard"
                    className="rounded-full bg-btn-primary px-6 py-3 text-center text-foreground-soft transition-colors hover:bg-btn-primary-hover"
                  >
                    Back to Dashboard
                  </Link>
                </>
              )}
              {session && !isSubscribed && <SubscribeButton />}
            </div>
          </section>
        </div>
        <Link
          href="/contact"
          className="text-sm text-foreground-soft/80 underline hover:text-foreground-soft"
        >
          Contact
        </Link>
      </div>
    </div>
  );
}
