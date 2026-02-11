import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AppLogo } from '@/components/AppLogo';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  path: '/about',
  title: 'About — POTS Companion',
  description:
    'Why we built POTS Companion: a symptom diary and trigger tracker for people with POTS and dysautonomia. Export for your doctor, AI insights, and gentle support.',
});

export default function AboutPage(): React.ReactElement {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 p-4 sm:p-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="flex w-full max-w-2xl flex-col items-center gap-6 rounded-2xl bg-card-bg p-6 text-left shadow-(--shadow-soft)">
        <div className="mb-1 flex h-[200px] w-[200px] shrink-0 items-center justify-center overflow-hidden">
          <AppLogo size="xl" className="scale-110 object-center" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground-soft">
          About POTS Companion
        </h1>

        <section>
          <h2 className="mb-2 text-lg font-medium text-foreground-soft">Why we built it</h2>
          <p className="text-sm leading-relaxed text-foreground-soft/90">
            POTS Companion started as a small personal project for my wife, Dana, after she was
            finally diagnosed with POTS. As she began trying to manage hydration, diet, activity,
            and medications, we found that keeping up with tracking symptoms and daily habits was
            proving difficult. We wanted something simple, quiet, and easy to keep up with that
            still produced useful information for doctor visits. This app grew out of that need.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-foreground-soft">Who it’s for</h2>
          <p className="text-sm leading-relaxed text-foreground-soft/90">
            POTS Companion is for anyone with POTS or dysautonomia who wants an easier way to keep
            track of how they’re doing day to day. You can log how you’re feeling, record flare-ups
            when they happen, and look back over time to notice possible patterns. Your data can be
            exported as a CSV to share with your care team if that’s helpful.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-foreground-soft">What it does</h2>
          <ul className="list-inside list-disc space-y-1.5 text-sm leading-relaxed text-foreground-soft/90">
            <li>
              <strong className="text-foreground-soft">Daily log</strong> — Track symptoms and
              behavior day by day.
            </li>
            <li>
              <strong className="text-foreground-soft">Incident reports</strong> — Record flares or
              episodes when they happen, with notes.
            </li>
            <li>
              <strong className="text-foreground-soft">Export for your doctor</strong> — CSV for
              your records; Pro includes a PDF report tailored for doctor visits.
            </li>
            <li>
              <strong className="text-foreground-soft">AI insights</strong> — Gentle, optional
              summaries to help you notice patterns (Pro).
            </li>
          </ul>
        </section>

        <p className="text-sm leading-relaxed text-foreground-soft/90">
          We hope POTS Companion makes it a little easier to live with POTS and to have better
          conversations with your care team. If you have feedback or ideas, we’d love to hear from
          you—
          <Link href="/contact" className="underline hover:text-foreground-soft">
            get in touch
          </Link>
          .
        </p>

        <Link
          href="/"
          className="mt-2 text-sm text-foreground-soft/80 underline hover:text-foreground-soft"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
