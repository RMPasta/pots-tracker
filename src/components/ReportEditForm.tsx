'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formatCalendarDate } from '@/lib/dates';

type Report = {
  id: string;
  date: Date;
  diet: string | null;
  exercise: string | null;
  medicine: string | null;
  feelingMorning: string | null;
  feelingAfternoon: string | null;
  feelingNight: string | null;
  overallRating: number | null;
};

type ReportEditFormProps = {
  report: Report;
};

const inputClass =
  'w-full rounded-xl border border-pastel-outline-pink/70 bg-input-bg px-4 py-2 text-input-text placeholder:text-input-placeholder focus:border-pastel-outline-pink focus:outline-none focus:ring-2 focus:ring-pastel-outline-pink/40';

export function ReportEditForm({ report }: ReportEditFormProps) {
  const router = useRouter();
  const [diet, setDiet] = useState(report.diet ?? '');
  const [exercise, setExercise] = useState(report.exercise ?? '');
  const [medicine, setMedicine] = useState(report.medicine ?? '');
  const [feelingMorning, setFeelingMorning] = useState(report.feelingMorning ?? '');
  const [feelingAfternoon, setFeelingAfternoon] = useState(report.feelingAfternoon ?? '');
  const [feelingNight, setFeelingNight] = useState(report.feelingNight ?? '');
  const [overallRating, setOverallRating] = useState<string>(
    report.overallRating != null ? String(report.overallRating) : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const ratingNum = overallRating.trim() === '' ? undefined : parseInt(overallRating, 10);

    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diet: diet || undefined,
          exercise: exercise || undefined,
          medicine: medicine || undefined,
          feelingMorning: feelingMorning || undefined,
          feelingAfternoon: feelingAfternoon || undefined,
          feelingNight: feelingNight || undefined,
          overallRating: ratingNum,
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

      router.push(`/dashboard/history/${report.id}`);
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

      <div>
        <p className="text-sm font-medium text-foreground-soft/80">Date</p>
        <p className="mt-1 text-foreground-soft">{formatCalendarDate(report.date)}</p>
      </div>

      <div>
        <label htmlFor="edit-diet" className="mb-1 block text-sm font-medium text-foreground-soft">
          Diet (optional)
        </label>
        <textarea
          id="edit-diet"
          value={diet}
          onChange={(e) => setDiet(e.target.value)}
          rows={2}
          placeholder="What you ate"
          className={inputClass}
        />
        {fieldErrors.diet && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.diet.join(', ')}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="edit-exercise"
          className="mb-1 block text-sm font-medium text-foreground-soft"
        >
          Exercise (optional)
        </label>
        <textarea
          id="edit-exercise"
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          rows={2}
          placeholder="What you did"
          className={inputClass}
        />
        {fieldErrors.exercise && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.exercise.join(', ')}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="edit-medicine"
          className="mb-1 block text-sm font-medium text-foreground-soft"
        >
          Medicine (optional)
        </label>
        <textarea
          id="edit-medicine"
          value={medicine}
          onChange={(e) => setMedicine(e.target.value)}
          rows={2}
          placeholder="Medications or supplements"
          className={inputClass}
        />
        {fieldErrors.medicine && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.medicine.join(', ')}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="edit-feeling-morning"
          className="mb-1 block text-sm font-medium text-foreground-soft"
        >
          How I felt — morning (optional)
        </label>
        <input
          id="edit-feeling-morning"
          type="text"
          value={feelingMorning}
          onChange={(e) => setFeelingMorning(e.target.value)}
          placeholder="e.g. okay, groggy"
          className={inputClass}
        />
        {fieldErrors.feelingMorning && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.feelingMorning.join(', ')}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="edit-feeling-afternoon"
          className="mb-1 block text-sm font-medium text-foreground-soft"
        >
          How I felt — afternoon (optional)
        </label>
        <input
          id="edit-feeling-afternoon"
          type="text"
          value={feelingAfternoon}
          onChange={(e) => setFeelingAfternoon(e.target.value)}
          placeholder="e.g. good, tired"
          className={inputClass}
        />
        {fieldErrors.feelingAfternoon && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.feelingAfternoon.join(', ')}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="edit-feeling-night"
          className="mb-1 block text-sm font-medium text-foreground-soft"
        >
          How I felt — night (optional)
        </label>
        <input
          id="edit-feeling-night"
          type="text"
          value={feelingNight}
          onChange={(e) => setFeelingNight(e.target.value)}
          placeholder="e.g. worn out, calm"
          className={inputClass}
        />
        {fieldErrors.feelingNight && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.feelingNight.join(', ')}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="edit-overall-rating"
          className="mb-1 block text-sm font-medium text-foreground-soft"
        >
          Overall rating (optional, 1–10)
        </label>
        <input
          id="edit-overall-rating"
          type="number"
          min={1}
          max={10}
          value={overallRating}
          onChange={(e) => setOverallRating(e.target.value)}
          placeholder="1–10"
          className={inputClass}
        />
        {fieldErrors.overallRating && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.overallRating.join(', ')}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-btn-primary px-6 py-3 font-medium text-foreground-soft transition-colors hover:bg-btn-primary-hover disabled:opacity-50"
      >
        {loading ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}
