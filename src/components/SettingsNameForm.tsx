'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Status = 'idle' | 'loading' | 'success' | 'error';

type SettingsNameFormProps = {
  initialName: string;
};

const inputClass =
  'w-full rounded-xl border border-pastel-outline-pink/70 bg-input-bg px-4 py-2 text-input-text placeholder:text-input-placeholder focus:border-pastel-outline-pink focus:outline-none focus:ring-2 focus:ring-pastel-outline-pink/40';

export function SettingsNameForm({ initialName }: SettingsNameFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setStatus('loading');
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: name.trim() || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setErrorMessage(
          (data?.error?.message as string) || 'Something went wrong. Try again.'
        );
        return;
      }
      setStatus('success');
      router.refresh();
    } catch {
      setStatus('error');
      setErrorMessage('Something went wrong. Try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="settings-name"
          className="mb-1 block text-xs font-medium text-foreground-soft/70"
        >
          Name
        </label>
        <input
          id="settings-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={status === 'loading'}
          placeholder="Your name"
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-fit rounded-full bg-btn-primary px-4 py-2 text-sm font-medium text-foreground-soft transition-colors hover:bg-btn-primary-hover disabled:opacity-60"
      >
        {status === 'loading' ? 'Saving…' : 'Save'}
      </button>
      {status === 'success' && (
        <p className="text-sm text-green-600 dark:text-green-400">Saved.</p>
      )}
      {status === 'error' && errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </form>
  );
}
