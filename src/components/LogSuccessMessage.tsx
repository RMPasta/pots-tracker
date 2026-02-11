'use client';

import Link from 'next/link';

type LogSuccessMessageProps = {
  variant: 'daily' | 'incident';
  onAddAnother: () => void;
};

export function LogSuccessMessage({
  variant,
  onAddAnother,
}: LogSuccessMessageProps): React.ReactElement {
  const heading = variant === 'daily' ? 'Daily log saved.' : 'Incident logged.';
  const addAnotherLabel = variant === 'daily' ? 'add another log' : 'log another incident';

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-btn-secondary/60 p-6 text-foreground-soft">
        <p className="font-medium">{heading}</p>
        <p className="mt-1 text-sm text-foreground-soft/80">
          You can{' '}
          <Link href="/dashboard/history" className="underline">
            view history
          </Link>{' '}
          or{' '}
          <button
            type="button"
            onClick={onAddAnother}
            className="cursor-pointer underline hover:opacity-90"
          >
            {addAnotherLabel}
          </button>
          .
        </p>
      </div>
      <div className="rounded-2xl bg-btn-secondary/60 p-6 text-foreground-soft">
        <p className="text-sm text-foreground-soft/90">
          We&apos;d love your{' '}
          <Link href="/contact" className="underline">
            feedback
          </Link>
          .
        </p>
        <p className="mt-2 text-sm text-foreground-soft/80">
          Please share POTS Companion in POTS communities—like Reddit—or with friends. We want to
          help as many people as possible.
        </p>
      </div>
    </div>
  );
}
