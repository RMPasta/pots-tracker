'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Incident = {
  id: string;
  date: Date;
  time: string | null;
  symptoms: string | null;
  notes: string | null;
};

type IncidentEditFormProps = {
  incident: Incident;
  returnTo?: string | null;
};

function dateToInputValue(d: Date): string {
  const x = new Date(d);
  return `${x.getUTCFullYear()}-${String(x.getUTCMonth() + 1).padStart(2, '0')}-${String(x.getUTCDate()).padStart(2, '0')}`;
}

export function IncidentEditForm({ incident, returnTo }: IncidentEditFormProps) {
  const router = useRouter();
  const [date, setDate] = useState(() => dateToInputValue(incident.date));
  const [time, setTime] = useState(incident.time ?? '');
  const [symptoms, setSymptoms] = useState(incident.symptoms ?? '');
  const [notes, setNotes] = useState(incident.notes ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const res = await fetch(`/api/incidents/${incident.id}`, {
        method: 'PATCH',
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

      router.push(returnTo ?? '/dashboard/history');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <label
            htmlFor="incident-edit-date"
            className="mb-1 block text-sm font-medium text-foreground-soft"
          >
            Date
          </label>
          <input
            id="incident-edit-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="min-w-0 max-w-full w-full box-border rounded-xl border border-pastel-outline-pink/70 bg-input-bg px-4 py-2 text-input-text focus:border-pastel-outline-pink focus:outline-none focus:ring-2 focus:ring-pastel-outline-pink/40"
          />
          {fieldErrors.date && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.date.join(', ')}</p>
          )}
        </div>
        <div className="min-w-0">
          <label
            htmlFor="incident-edit-time"
            className="mb-1 block text-sm font-medium text-foreground-soft"
          >
            Time (optional)
          </label>
          <input
            id="incident-edit-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="min-w-0 max-w-full w-full box-border rounded-xl border border-pastel-outline-pink/70 bg-input-bg px-4 py-2 text-input-text focus:border-pastel-outline-pink focus:outline-none focus:ring-2 focus:ring-pastel-outline-pink/40"
          />
          {fieldErrors.time && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.time.join(', ')}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="incident-edit-symptoms"
          className="mb-1 block text-sm font-medium text-foreground-soft"
        >
          Symptoms (optional)
        </label>
        <textarea
          id="incident-edit-symptoms"
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
        <label
          htmlFor="incident-edit-notes"
          className="mb-1 block text-sm font-medium text-foreground-soft"
        >
          Notes (optional)
        </label>
        <textarea
          id="incident-edit-notes"
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
        {loading ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}
