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
          className="rounded-full border-2 border-pastel-purple/50 bg-pastel-yellow/30 px-4 py-2 text-center text-sm font-medium text-foreground-soft transition-colors hover:bg-pastel-yellow/50"
        >
          View history
        </Link>
      </div>

      <div className="rounded-2xl bg-white/80 p-6 shadow-(--shadow-soft) dark:bg-pastel-purple/10">
        {mode === 'daily' ? <DailyLogForm /> : <IncidentForm />}
      </div>
    </div>
  );
}
