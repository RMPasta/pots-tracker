'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { todayDateString } from '@/lib/dates';

const FALLBACK_TEXT = "Log your day or add an incident when you're ready.";
const SESSION_STORAGE_KEY = 'pots_on_open_message';

type CachedMessage = { message: string; date: string };

function getCachedMessage(): string | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      'message' in parsed &&
      'date' in parsed &&
      typeof (parsed as CachedMessage).message === 'string' &&
      typeof (parsed as CachedMessage).date === 'string'
    ) {
      const { message, date } = parsed as CachedMessage;
      if (date === todayDateString()) return message;
    }
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }
  return null;
}

function setCachedMessage(message: string): void {
  sessionStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({ message, date: todayDateString() })
  );
}

type OnOpenMessageProps = {
  userName: string;
};

export function OnOpenMessage({ userName }: OnOpenMessageProps) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const stored = getCachedMessage();
    if (stored) {
      setMessage(stored);
      return;
    }

    fetch('/api/ai/on-open-message', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data?.success && typeof data?.data?.message === 'string') {
          const text = data.data.message.trim() || FALLBACK_TEXT;
          setMessage(text);
          setCachedMessage(text);
        } else {
          setMessage(FALLBACK_TEXT);
          setCachedMessage(FALLBACK_TEXT);
        }
      })
      .catch(() => {
        setMessage(FALLBACK_TEXT);
        setCachedMessage(FALLBACK_TEXT);
      });
  }, []);

  const isLoading = message === null;
  const displayText = message ?? '';

  return (
    <div className="rounded-2xl bg-card-bg p-4 shadow-(--shadow-soft) sm:p-5">
      <p className="text-foreground-soft/90">Welcome {userName},</p>
      <p className="mt-1 text-foreground-soft/90">{isLoading ? '...' : displayText}</p>
      <Link
        href="/dashboard/history"
        className="mt-2 inline-block text-sm font-medium text-pastel-outline-pink underline hover:opacity-90"
      >
        View history
      </Link>
    </div>
  );
}
