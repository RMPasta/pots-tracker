'use client';

import Link from 'next/link';
import { useState } from 'react';

type DailyLogFormProps = {
  onSuccess?: () => void;
};

export function DailyLogForm({ onSuccess }: DailyLogFormProps) {
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [symptoms, setSymptoms] = useState('');
  const [dietBehaviorNotes, setDietBehaviorNotes] = useState('');
  const [overallFeeling, setOverallFeeling] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          symptoms: symptoms || undefined,
          dietBehaviorNotes: dietBehaviorNotes || undefined,
          overallFeeling: overallFeeling || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.error?.fields) {
          setFieldErrors(json.error.fields);
        }
        setError(json.error?.message ?? 'Something went wrong');
        return;
      }

      setDate(() => {
        const d = new Date();
        return d.toISOString().slice(0, 10);
      });
      setSymptoms('');
      setDietBehaviorNotes('');
      setOverallFeeling('');
      setSuccess(true);
      onSuccess?.();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl bg-btn-secondary/60 p-6 text-foreground-soft">
        <p className="font-medium">Daily log saved.</p>
        <p className="mt-1 text-sm text-foreground-soft/80">
          You can <Link href="/dashboard/history" className="underline">view history</Link> or{' '}
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="cursor-pointer underline hover:opacity-90"
          >
            add another log
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="daily-date" className="mb-1 block text-sm font-medium text-foreground-soft">
          Date
        </label>
        <input
          id="daily-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full rounded-xl border border-pastel-outline-pink/70 bg-input-bg px-4 py-2 text-input-text placeholder:text-input-placeholder focus:border-pastel-outline-pink focus:outline-none focus:ring-2 focus:ring-pastel-outline-pink/40"
        />
        {fieldErrors.date && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.date.join(', ')}</p>
        )}
      </div>

      <div>
        <label htmlFor="daily-symptoms" className="mb-1 block text-sm font-medium text-foreground-soft">
          Symptoms (optional)
        </label>
        <textarea
          id="daily-symptoms"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          rows={3}
          placeholder="e.g. dizziness, rapid heartbeat"
          className="w-full rounded-xl border border-pastel-outline-pink/70 bg-input-bg px-4 py-2 text-input-text placeholder:text-input-placeholder focus:border-pastel-outline-pink focus:outline-none focus:ring-2 focus:ring-pastel-outline-pink/40"
        />
        {fieldErrors.symptoms && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.symptoms.join(', ')}</p>
        )}
      </div>

      <div>
        <label htmlFor="daily-diet" className="mb-1 block text-sm font-medium text-foreground-soft">
          Diet / behavior notes (optional)
        </label>
        <textarea
          id="daily-diet"
          value={dietBehaviorNotes}
          onChange={(e) => setDietBehaviorNotes(e.target.value)}
          rows={2}
          placeholder="What you ate or did"
          className="w-full rounded-xl border border-pastel-outline-pink/70 bg-input-bg px-4 py-2 text-input-text placeholder:text-input-placeholder focus:border-pastel-outline-pink focus:outline-none focus:ring-2 focus:ring-pastel-outline-pink/40"
        />
        {fieldErrors.dietBehaviorNotes && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.dietBehaviorNotes.join(', ')}</p>
        )}
      </div>

      <div>
        <label htmlFor="daily-feeling" className="mb-1 block text-sm font-medium text-foreground-soft">
          Overall feeling (optional)
        </label>
        <input
          id="daily-feeling"
          type="text"
          value={overallFeeling}
          onChange={(e) => setOverallFeeling(e.target.value)}
          placeholder="e.g. okay, rough morning"
          className="w-full rounded-xl border border-pastel-outline-pink/70 bg-input-bg px-4 py-2 text-input-text placeholder:text-input-placeholder focus:border-pastel-outline-pink focus:outline-none focus:ring-2 focus:ring-pastel-outline-pink/40"
        />
        {fieldErrors.overallFeeling && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.overallFeeling.join(', ')}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-btn-primary px-6 py-3 font-medium text-foreground-soft transition-colors hover:bg-btn-primary-hover disabled:opacity-50"
      >
        {loading ? 'Saving…' : 'Save daily log'}
      </button>
    </form>
  );
}
