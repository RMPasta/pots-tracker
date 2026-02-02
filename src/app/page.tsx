import Link from 'next/link';
import { auth } from '@/lib/auth';

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <main className="flex max-w-2xl flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">POTS Tracker</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Track symptoms and behavior to identify triggers and patterns. Log daily or log
          incidents; export for your doctor; get gentle AI insights.
        </p>
        {session ? (
          <Link
            href="/dashboard"
            className="rounded-full bg-pastel-pink px-6 py-3 text-zinc-900 transition-colors hover:opacity-90"
          >
            Go to Dashboard
          </Link>
        ) : (
          <Link
            href="/auth/signin"
            className="rounded-full bg-pastel-purple px-6 py-3 text-zinc-900 transition-colors hover:opacity-90"
          >
            Get Started
          </Link>
        )}
      </main>
    </div>
  );
}
