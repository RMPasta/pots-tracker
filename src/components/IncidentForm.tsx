'use client';

import { useState } from 'react';

type IncidentFormProps = {
  onSuccess?: () => void;
};

export function IncidentForm({ onSuccess }: IncidentFormProps) {
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [time, setTime] = useState(() => {
    const d = new Date();
    return d.toTimeString().slice(0, 5);
  });
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
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
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          time: time || undefined,
          symptoms: symptoms || undefined,
          notes: notes || undefined,
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
        <p className="font-medium">Incident logged.</p>
        <p className="mt-1 text-sm text-foreground-soft/80">
          You can <a href="/dashboard/history" className="underline">view history</a> or log another incident.
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="incident-date" className="mb-1 block text-sm font-medium text-foreground-soft">
            Date
          </label>
          <input
            id="incident-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded-xl border border-pastel-outline-pink/70 bg-input-bg px-4 py-2 text-input-text focus:border-pastel-outline-pink focus:outline-none focus:ring-2 focus:ring-pastel-outline-pink/40"
          />
          {fieldErrors.date && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.date.join(', ')}</p>
          )}
        </div>
        <div>
          <label htmlFor="incident-time" className="mb-1 block text-sm font-medium text-foreground-soft">
            Time (optional)
          </label>
          <input
            id="incident-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-xl border border-pastel-outline-pink/70 bg-input-bg px-4 py-2 text-input-text focus:border-pastel-outline-pink focus:outline-none focus:ring-2 focus:ring-pastel-outline-pink/40"
          />
          {fieldErrors.time && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.time.join(', ')}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="incident-symptoms" className="mb-1 block text-sm font-medium text-foreground-soft">
          Symptoms (optional)
        </label>
        <textarea
          id="incident-symptoms"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          rows={2}
          placeholder="What happened"
          className="w-full rounded-xl border border-pastel-outline-pink/70 bg-input-bg px-4 py-2 text-input-text placeholder:text-input-placeholder focus:border-pastel-outline-pink focus:outline-none focus:ring-2 focus:ring-pastel-outline-pink/40"
        />
        {fieldErrors.symptoms && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.symptoms.join(', ')}</p>
        )}
      </div>

      <div>
        <label htmlFor="incident-notes" className="mb-1 block text-sm font-medium text-foreground-soft">
          Notes (optional)
        </label>
        <textarea
          id="incident-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Context or triggers"
          className="w-full rounded-xl border border-pastel-outline-pink/70 bg-input-bg px-4 py-2 text-input-text placeholder:text-input-placeholder focus:border-pastel-outline-pink focus:outline-none focus:ring-2 focus:ring-pastel-outline-pink/40"
        />
        {fieldErrors.notes && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.notes.join(', ')}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-btn-outline px-6 py-3 font-medium text-foreground-soft transition-colors hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Saving…' : 'Log incident'}
      </button>
    </form>
  );
}
