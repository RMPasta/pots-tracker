'use client';

import { useState } from 'react';

export function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();

      if (data.success && typeof data.url === 'string') {
        window.location.href = data.url;
        return;
      }

      if (res.status === 401) {
        window.location.href = '/auth/signin?callbackUrl=/pricing';
        return;
      }

      setError(data?.error?.message ?? 'Payments unavailable.');
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
        className="rounded-full bg-btn-primary px-6 py-3 text-foreground-soft transition-colors hover:bg-btn-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Redirecting…' : 'Subscribe'}
      </button>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
