'use client';

import { useState } from 'react';
import { LogTypeToggle } from './LogTypeToggle';
import { DailyLogForm } from './DailyLogForm';
import { IncidentForm } from './IncidentForm';
import Link from 'next/link';

type Mode = 'daily' | 'incident';

export function LogFormView() {
  const [mode, setMode] = useState<Mode>('daily');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <LogTypeToggle value={mode} onChange={setMode} />
        <Link
          href="/dashboard/history"
          className="rounded-full bg-btn-secondary px-4 py-2 text-center text-sm font-medium text-foreground-soft transition-colors hover:bg-btn-secondary-hover"
        >
          View history
        </Link>
      </div>

      <div className="rounded-2xl bg-card-bg p-6 shadow-(--shadow-soft)">
        {mode === 'daily' ? <DailyLogForm /> : <IncidentForm />}
      </div>
    </div>
  );
}
