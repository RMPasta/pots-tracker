import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SettingsNameForm } from '@/components/SettingsNameForm';

export default async function SettingsPage() {
  const session = await auth();
  if (!session) {
    redirect('/auth/signin');
  }

  const initialName = session.user?.name ?? '';

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <header className="flex items-center justify-between rounded-2xl bg-card-bg px-3 py-2.5 shadow-(--shadow-soft) sm:px-4 sm:py-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground-soft">
          POTS Tracker
        </h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="rounded-full bg-btn-primary px-4 py-2 text-sm font-medium text-foreground-soft transition-colors hover:bg-btn-primary-hover"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4">
        <h2 className="text-xl font-medium text-foreground-soft">Settings</h2>

        <div className="rounded-2xl bg-card-bg p-4 shadow-(--shadow-soft) sm:p-5">
          <h3 className="text-sm font-medium text-foreground-soft/80">Profile</h3>
          <div className="mt-3">
            <SettingsNameForm initialName={initialName} />
          </div>
        </div>
      </main>
    </div>
  );
}
