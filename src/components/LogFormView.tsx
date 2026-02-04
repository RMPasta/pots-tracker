'use client';

import { useState } from 'react';
import { LogTypeToggle, type Mode } from './LogTypeToggle';
import { DailyLogForm } from './DailyLogForm';
import { IncidentForm } from './IncidentForm';
import { ExportForm } from './ExportForm';
import { AnalysisPanel } from './AnalysisPanel';
import Link from 'next/link';

type LogFormViewProps = {
  canUseInsights: boolean;
  canUsePDF: boolean;
};

export function LogFormView({ canUseInsights, canUsePDF }: LogFormViewProps) {
  const [mode, setMode] = useState<Mode>('incident');

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <LogTypeToggle value={mode} onChange={setMode} />
        <Link
          href="/dashboard/history"
          className="flex min-h-[44px] items-center justify-center rounded-full bg-btn-secondary px-4 py-2 text-center text-sm font-medium text-foreground-soft transition-colors hover:bg-btn-secondary-hover"
        >
          View history
        </Link>
      </div>

      {mode === 'export' && <ExportForm canUsePDF={canUsePDF} />}
      {mode === 'insights' && <AnalysisPanel canUseInsights={canUseInsights} />}
      {(mode === 'daily' || mode === 'incident') && (
        <div className="rounded-2xl bg-card-bg p-4 shadow-(--shadow-soft) sm:p-5">
          {mode === 'daily' ? <DailyLogForm /> : <IncidentForm />}
        </div>
      )}
    </div>
  );
}
