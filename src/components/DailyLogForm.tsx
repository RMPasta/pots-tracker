'use client';

import { useState, useEffect } from 'react';
import { todayDateString } from '@/lib/dates';
import { LogSuccessMessage } from '@/components/LogSuccessMessage';

type DailyLogFormProps = {
  onSuccess?: () => void;
};

const inputClass =
  'w-full rounded-xl border border-pastel-outline-pink/70 bg-input-bg px-4 py-2 text-input-text placeholder:text-input-placeholder focus:border-pastel-outline-pink focus:outline-none focus:ring-2 focus:ring-pastel-outline-pink/40';

export function DailyLogForm({ onSuccess }: DailyLogFormProps) {
  const [date, setDate] = useState(todayDateString);
  const [diet, setDiet] = useState('');
  const [exercise, setExercise] = useState('');
  const [medicine, setMedicine] = useState('');
  const [waterIntake, setWaterIntake] = useState('');
  const [sodiumIntake, setSodiumIntake] = useState('');
  const [feelingMorning, setFeelingMorning] = useState('');
  const [feelingAfternoon, setFeelingAfternoon] = useState('');
  const [feelingNight, setFeelingNight] = useState('');
  const [overallRating, setOverallRating] = useState('');
  const [editReportId, setEditReportId] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let cancelled = false;
    setLoadingReport(true);
    setError(null);
    fetch(`/api/reports?date=${date}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (!json.success) {
          setEditReportId(null);
          setDiet('');
          setExercise('');
          setMedicine('');
          setWaterIntake('');
          setSodiumIntake('');
          setFeelingMorning('');
          setFeelingAfternoon('');
          setFeelingNight('');
          setOverallRating('');
          return;
        }
        const report = json.data;
        if (report?.source === 'full_log') {
          setEditReportId(report.id);
          setDiet(report.diet ?? '');
          setExercise(report.exercise ?? '');
          setMedicine(report.medicine ?? '');
          setWaterIntake(report.waterIntake ?? '');
          setSodiumIntake(report.sodiumIntake ?? '');
          setFeelingMorning(report.feelingMorning ?? '');
          setFeelingAfternoon(report.feelingAfternoon ?? '');
          setFeelingNight(report.feelingNight ?? '');
          setOverallRating(report.overallRating != null ? String(report.overallRating) : '');
        } else {
          setEditReportId(null);
          setDiet('');
          setExercise('');
          setMedicine('');
          setWaterIntake('');
          setSodiumIntake('');
          setFeelingMorning('');
          setFeelingAfternoon('');
          setFeelingNight('');
          setOverallRating('');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEditReportId(null);
          setDiet('');
          setExercise('');
          setMedicine('');
          setWaterIntake('');
          setSodiumIntake('');
          setFeelingMorning('');
          setFeelingAfternoon('');
          setFeelingNight('');
          setOverallRating('');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingReport(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const ratingNum = overallRating.trim() === '' ? undefined : parseInt(overallRating, 10);

    try {
      if (editReportId) {
        const res = await fetch(`/api/reports/${editReportId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            diet: diet || undefined,
            exercise: exercise || undefined,
            medicine: medicine || undefined,
            waterIntake: waterIntake || undefined,
            sodiumIntake: sodiumIntake || undefined,
            feelingMorning: feelingMorning || undefined,
            feelingAfternoon: feelingAfternoon || undefined,
            feelingNight: feelingNight || undefined,
            overallRating: ratingNum,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          if (json.error?.fields) setFieldErrors(json.error.fields);
          setError(json.error?.message ?? 'Something went wrong. Try again.');
          return;
        }
      } else {
        const res = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date,
            diet: diet || undefined,
            exercise: exercise || undefined,
            medicine: medicine || undefined,
            waterIntake: waterIntake || undefined,
            sodiumIntake: sodiumIntake || undefined,
            feelingMorning: feelingMorning || undefined,
            feelingAfternoon: feelingAfternoon || undefined,
            feelingNight: feelingNight || undefined,
            overallRating: ratingNum,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          if (json.error?.fields) setFieldErrors(json.error.fields);
          setError(json.error?.message ?? 'Something went wrong. Try again.');
          return;
        }
      }

      setDate(todayDateString());
      setEditReportId(null);
      setDiet('');
      setExercise('');
      setMedicine('');
      setWaterIntake('');
      setSodiumIntake('');
      setFeelingMorning('');
      setFeelingAfternoon('');
      setFeelingNight('');
      setOverallRating('');
      setSuccess(true);
      onSuccess?.();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return <LogSuccessMessage variant="daily" onAddAnother={() => setSuccess(false)} />;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </p>
      )}

      {editReportId && (
        <p className="text-sm text-foreground-soft/80">
          Editing existing log for this date. Changes will update the saved log.
        </p>
      )}

      <div className="min-w-0 overflow-hidden">
        <label htmlFor="daily-date" className="mb-1 block text-sm font-medium text-foreground-soft">
          Date
        </label>
        <input
          id="daily-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          disabled={loadingReport}
          className={`min-w-0 max-w-full box-border ${inputClass} disabled:opacity-60`}
          style={{ width: '100%' }}
        />
        {fieldErrors.date && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.date.join(', ')}</p>
        )}
      </div>

      <div>
        <label htmlFor="daily-diet" className="mb-1 block text-sm font-medium text-foreground-soft">
          Diet (optional)
        </label>
        <textarea
          id="daily-diet"
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
          htmlFor="daily-exercise"
          className="mb-1 block text-sm font-medium text-foreground-soft"
        >
          Exercise (optional)
        </label>
        <textarea
          id="daily-exercise"
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
          htmlFor="daily-medicine"
          className="mb-1 block text-sm font-medium text-foreground-soft"
        >
          Medicine (optional)
        </label>
        <textarea
          id="daily-medicine"
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="daily-water-intake"
            className="mb-1 block text-sm font-medium text-foreground-soft"
          >
            Water intake (optional)
          </label>
          <input
            id="daily-water-intake"
            type="text"
            value={waterIntake}
            onChange={(e) => setWaterIntake(e.target.value)}
            placeholder="e.g. 8 glasses, 2.5 L"
            className={inputClass}
          />
          {fieldErrors.waterIntake && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.waterIntake.join(', ')}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="daily-sodium-intake"
            className="mb-1 block text-sm font-medium text-foreground-soft"
          >
            Sodium / salt (optional)
          </label>
          <input
            id="daily-sodium-intake"
            type="text"
            value={sodiumIntake}
            onChange={(e) => setSodiumIntake(e.target.value)}
            placeholder="e.g. 3g"
            className={inputClass}
          />
          {fieldErrors.sodiumIntake && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.sodiumIntake.join(', ')}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="daily-feeling-morning"
          className="mb-1 block text-sm font-medium text-foreground-soft"
        >
          How I felt — morning (optional)
        </label>
        <input
          id="daily-feeling-morning"
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
          htmlFor="daily-feeling-afternoon"
          className="mb-1 block text-sm font-medium text-foreground-soft"
        >
          How I felt — afternoon (optional)
        </label>
        <input
          id="daily-feeling-afternoon"
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
          htmlFor="daily-feeling-night"
          className="mb-1 block text-sm font-medium text-foreground-soft"
        >
          How I felt — night (optional)
        </label>
        <input
          id="daily-feeling-night"
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
          htmlFor="daily-rating"
          className="mb-1 block text-sm font-medium text-foreground-soft"
        >
          Overall rating (optional, 1–10)
        </label>
        <input
          id="daily-rating"
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
        disabled={loading || loadingReport}
        className="rounded-full bg-btn-primary px-6 py-3 font-medium text-foreground-soft transition-colors hover:bg-btn-primary-hover disabled:opacity-50"
      >
        {loading ? 'Saving…' : editReportId ? 'Update daily log' : 'Save daily log'}
      </button>
    </form>
  );
}
