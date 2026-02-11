'use client';

import { useState } from 'react';

const inputClass =
  'w-full rounded-xl border border-pastel-outline-pink/70 bg-input-bg px-4 py-2 text-input-text placeholder:text-input-placeholder focus:border-pastel-outline-pink focus:outline-none focus:ring-2 focus:ring-pastel-outline-pink/40';

export function ContactForm(): React.ReactElement {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          message: message.trim(),
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.error?.fields) setFieldErrors(json.error.fields);
        setError(json.error?.message ?? 'Something went wrong. Try again.');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div
        className="rounded-2xl bg-btn-secondary/60 p-6 text-foreground-soft"
        role="status"
        aria-live="polite"
      >
        <p className="font-medium">Thanks, we got your message.</p>
        <p className="mt-1 text-sm text-foreground-soft/80">We&apos;ll read it soon.</p>
        <p className="mt-2 text-sm text-foreground-soft/80">
          Please share POTS Companion in POTS communities—like Reddit—or with friends. We want to
          help as many people as possible.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      aria-busy={loading}
      aria-describedby={error ? 'contact-error' : undefined}
    >
      {error && (
        <p
          id="contact-error"
          className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-900 dark:border-red-800 dark:bg-red-950/60 dark:text-red-100"
          role="alert"
        >
          {error}
        </p>
      )}

      <div>
        <label
          htmlFor="contact-name"
          className="mb-1 block text-sm font-medium text-foreground-soft"
        >
          Name (optional)
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={200}
          disabled={loading}
          className={`${inputClass} disabled:opacity-60`}
        />
        {fieldErrors.name && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.name.join(', ')}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="contact-email"
          className="mb-1 block text-sm font-medium text-foreground-soft"
        >
          Email (optional)
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={200}
          disabled={loading}
          className={`${inputClass} disabled:opacity-60`}
        />
        {fieldErrors.email && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.email.join(', ')}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="mb-1 block text-sm font-medium text-foreground-soft"
        >
          Message (required)
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          required
          maxLength={3000}
          disabled={loading}
          className={`${inputClass} disabled:opacity-60`}
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.message)}
        />
        {fieldErrors.message && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.message.join(', ')}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="min-h-[44px] rounded-full bg-btn-primary px-6 py-3 font-medium text-foreground-soft transition-colors hover:bg-btn-primary-hover disabled:opacity-50"
      >
        {loading ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
