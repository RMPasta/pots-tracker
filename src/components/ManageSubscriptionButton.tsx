'use client';

import { useState } from 'react';

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();

      if (data.success && typeof data.url === 'string') {
        window.location.href = data.url;
        return;
      }

      setError(data?.error?.message ?? 'Unable to open billing.');
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-full bg-btn-primary px-4 py-2 text-sm font-medium text-foreground-soft transition-colors hover:bg-btn-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Opening…' : 'Manage subscription'}
      </button>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
