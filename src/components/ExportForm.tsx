'use client';

import Link from 'next/link';
import { useState } from 'react';
import { todayDateString } from '@/lib/dates';

const MAX_RANGE_DAYS = 365;

function dateStringDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type ExportFormProps = {
  canUsePDF: boolean;
};

export function ExportForm({ canUsePDF }: ExportFormProps) {
  const [from, setFrom] = useState(() => dateStringDaysAgo(30));
  const [to, setTo] = useState(todayDateString);
  const [error, setError] = useState<string | null>(null);

  function handleDownload(format: 'csv' | 'pdf') {
    setError(null);

    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (fromDate.getTime() > toDate.getTime()) {
      setError('From date must be on or before to date.');
      return;
    }

    const rangeDays =
      Math.round((toDate.getTime() - fromDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    if (rangeDays > MAX_RANGE_DAYS) {
      setError(`Date range must be ${MAX_RANGE_DAYS} days or less.`);
      return;
    }

    const params = new URLSearchParams({ from, to });
    if (format === 'pdf') {
      params.set('format', 'pdf');
    }
    window.open(`/api/export?${params.toString()}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="rounded-2xl bg-card-bg p-4 shadow-(--shadow-soft) sm:p-5">
      <h3 className="text-sm font-medium text-foreground-soft/80">Export for physician</h3>
      <div className="mt-3 flex flex-wrap items-end gap-3 sm:gap-4">
        <div>
          <label
            htmlFor="export-from"
            className="mb-1 block text-xs font-medium text-foreground-soft/70"
          >
            From
          </label>
          <input
            id="export-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-xl border border-pastel-outline-pink/70 bg-input-bg px-3 py-2 text-sm text-input-text focus:border-pastel-outline-pink focus:outline-none focus:ring-2 focus:ring-pastel-outline-pink/40"
          />
        </div>
        <div>
          <label
            htmlFor="export-to"
            className="mb-1 block text-xs font-medium text-foreground-soft/70"
          >
            To
          </label>
          <input
            id="export-to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-xl border border-pastel-outline-pink/70 bg-input-bg px-3 py-2 text-sm text-input-text focus:border-pastel-outline-pink focus:outline-none focus:ring-2 focus:ring-pastel-outline-pink/40"
          />
        </div>
        <button
          type="button"
          onClick={() => handleDownload('csv')}
          className="rounded-full bg-btn-outline px-4 py-2 text-sm font-medium text-foreground-soft transition-colors hover:opacity-90"
        >
          Download CSV
        </button>
        {canUsePDF && (
          <button
            type="button"
            onClick={() => handleDownload('pdf')}
            className="rounded-full bg-btn-primary px-4 py-2 text-sm font-medium text-foreground-soft transition-colors hover:bg-btn-primary-hover"
          >
            Download PDF
          </button>
        )}
      </div>
      {!canUsePDF && (
        <p className="mt-2 text-xs text-foreground-soft/70">
          Want a PDF report for your doctor?{' '}
          <Link
            href="/pricing"
            className="font-medium text-foreground-soft underline hover:no-underline"
          >
            Upgrade to Pro
          </Link>
        </p>
      )}
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
