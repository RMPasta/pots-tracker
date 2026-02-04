'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { todayDateString } from '@/lib/dates';

const MAX_RANGE_DAYS = 90;

function dateStringDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type AnalysisData = {
  summary: string;
  trends: string[];
  insights: string[];
  suggestions: string[];
  weeklyHighlight?: string;
};

type AnalysisPanelProps = {
  canUseInsights: boolean;
};

export function AnalysisPanel({ canUseInsights }: AnalysisPanelProps) {
  const [from, setFrom] = useState(() => dateStringDaysAgo(30));
  const [to, setTo] = useState(() => todayDateString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisData | null>(null);

  useEffect(() => {
    if (!canUseInsights) return;
    fetch('/api/ai/insight-cache', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.data != null) {
          if (typeof data.from === 'string') setFrom(data.from);
          if (typeof data.to === 'string') setTo(data.to);
          setResult({
            summary: data.data.summary ?? '',
            trends: Array.isArray(data.data.trends) ? data.data.trends : [],
            insights: Array.isArray(data.data.insights) ? data.data.insights : [],
            suggestions: Array.isArray(data.data.suggestions) ? data.data.suggestions : [],
            weeklyHighlight: data.data.weeklyHighlight,
          });
        }
      })
      .catch(() => {});
  }, [canUseInsights]);

  function setPreset(days: number) {
    setFrom(dateStringDaysAgo(days));
    setTo(todayDateString());
    setError(null);
    setResult(null);
  }

  async function handleAnalyze() {
    setError(null);
    setResult(null);

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

    setLoading(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ from, to }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 402 || data?.error?.code === 'SUBSCRIPTION_REQUIRED') {
          setError('Active subscription required for AI insights. Upgrade to continue.');
          return;
        }
        if (res.status === 429) {
          setError((data?.error?.message as string) || 'Rate limit exceeded. Try again later.');
          return;
        }
        setError((data?.error?.message as string) || 'Something went wrong. Try again later.');
        return;
      }

      if (data?.success && data?.data) {
        setResult({
          summary: data.data.summary ?? '',
          trends: Array.isArray(data.data.trends) ? data.data.trends : [],
          insights: Array.isArray(data.data.insights) ? data.data.insights : [],
          suggestions: Array.isArray(data.data.suggestions) ? data.data.suggestions : [],
          weeklyHighlight: data.data.weeklyHighlight,
        });
      } else {
        setError('Invalid response. Try again later.');
      }
    } catch {
      setError('Something went wrong. Try again later.');
    } finally {
      setLoading(false);
    }
  }

  if (!canUseInsights) {
    return (
      <div className="rounded-2xl bg-card-bg p-4 shadow-(--shadow-soft) sm:p-5">
        <h3 className="text-sm font-medium text-foreground-soft/80">
          Upgrade to unlock AI insights
        </h3>
        <p className="mt-1 text-xs text-foreground-soft/70">
          Get personalized analysis of your logs and incidents.
        </p>
        <Link
          href="/pricing"
          className="mt-3 inline-block rounded-full bg-btn-primary px-4 py-2 text-sm font-medium text-foreground-soft transition-colors hover:bg-btn-primary-hover"
        >
          View plans
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card-bg p-4 shadow-(--shadow-soft) sm:p-5">
      <h3 className="text-sm font-medium text-foreground-soft/80">Get insights</h3>
      <p className="mt-1 text-xs text-foreground-soft/70">
        AI analysis of your logs and incidents for the selected period.
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-3 sm:gap-4">
        <div>
          <label
            htmlFor="analysis-from"
            className="mb-1 block text-xs font-medium text-foreground-soft/70"
          >
            From
          </label>
          <input
            id="analysis-from"
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setError(null);
              setResult(null);
            }}
            disabled={loading}
            className="rounded-xl border border-pastel-outline-pink/70 bg-input-bg px-3 py-2 text-sm text-input-text focus:border-pastel-outline-pink focus:outline-none focus:ring-2 focus:ring-pastel-outline-pink/40 disabled:opacity-60"
          />
        </div>
        <div>
          <label
            htmlFor="analysis-to"
            className="mb-1 block text-xs font-medium text-foreground-soft/70"
          >
            To
          </label>
          <input
            id="analysis-to"
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setError(null);
              setResult(null);
            }}
            disabled={loading}
            className="rounded-xl border border-pastel-outline-pink/70 bg-input-bg px-3 py-2 text-sm text-input-text focus:border-pastel-outline-pink focus:outline-none focus:ring-2 focus:ring-pastel-outline-pink/40 disabled:opacity-60"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPreset(7)}
            disabled={loading}
            className="rounded-full bg-btn-outline px-3 py-1.5 text-xs font-medium text-foreground-soft transition-colors hover:opacity-90 disabled:opacity-60"
          >
            Last 7 days
          </button>
          <button
            type="button"
            onClick={() => setPreset(30)}
            disabled={loading}
            className="rounded-full bg-btn-outline px-3 py-1.5 text-xs font-medium text-foreground-soft transition-colors hover:opacity-90 disabled:opacity-60"
          >
            Last 30 days
          </button>
          <button
            type="button"
            onClick={() => setPreset(90)}
            disabled={loading}
            className="rounded-full bg-btn-outline px-3 py-1.5 text-xs font-medium text-foreground-soft transition-colors hover:opacity-90 disabled:opacity-60"
          >
            Last 90 days
          </button>
        </div>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading}
          className="rounded-full bg-btn-primary px-4 py-2 text-sm font-medium text-foreground-soft transition-colors hover:bg-btn-primary-hover disabled:opacity-60"
        >
          {loading ? 'Analyzing…' : 'Get insights'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {result && !loading && (
        <div className="mt-4 space-y-4 border-t border-pastel-outline-pink/30 pt-4">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground-soft/70">
              Summary
            </h4>
            <p className="mt-1 text-sm text-foreground-soft/90">{result.summary}</p>
          </div>
          {result.weeklyHighlight && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground-soft/70">
                This week
              </h4>
              <p className="mt-1 text-sm text-foreground-soft/90">{result.weeklyHighlight}</p>
            </div>
          )}
          {result.trends.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground-soft/70">
                Trends
              </h4>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm text-foreground-soft/90">
                {result.trends.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
          {result.insights.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground-soft/70">
                Insights
              </h4>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm text-foreground-soft/90">
                {result.insights.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
          {result.suggestions.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground-soft/70">
                Suggestions
              </h4>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm text-foreground-soft/90">
                {result.suggestions.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
