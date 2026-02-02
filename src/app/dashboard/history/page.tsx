import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ThemeToggle } from '@/components/ThemeToggle';
import { formatCalendarDate } from '@/lib/dates';
import { todayStartUTC } from '@/lib/dates';

const DEFAULT_DAYS = 90;

function reportSummary(report: {
  source: string;
  overallFeeling: string | null;
  overallRating: number | null;
}): string {
  if (report.source === 'compiled') {
    return report.overallFeeling ?? 'Compiled from incidents';
  }
  return report.overallRating != null ? `${report.overallRating}/10` : 'Daily log';
}

export default async function HistoryPage() {
  const session = await auth();
  if (!session) {
    redirect('/auth/signin');
  }

  const now = new Date();
  const end = todayStartUTC();
  const from = new Date(now);
  from.setDate(from.getDate() - DEFAULT_DAYS);
  const start = new Date(
    Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  );

  const reports = await prisma.dailyReport.findMany({
    where: {
      userId: session.user.id,
      date: { gte: start, lte: end },
    },
    orderBy: { date: 'desc' },
  });

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
        <h2 className="text-xl font-medium text-foreground-soft">History</h2>

        {reports.length === 0 ? (
          <div className="rounded-2xl bg-card-bg p-6 text-center shadow-(--shadow-soft)">
            <p className="text-foreground-soft/90">No logs yet.</p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block rounded-full bg-btn-primary px-6 py-3 font-medium text-foreground-soft transition-colors hover:opacity-90"
            >
              Log your day
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {reports.map((report) => (
              <li key={report.id}>
                <Link
                  href={`/dashboard/history/${report.id}`}
                  className="block rounded-2xl bg-card-bg p-3 shadow-(--shadow-soft) transition-colors hover:bg-pastel-mint/40 sm:p-4"
                >
                  <span className="font-medium text-foreground-soft">
                    {formatCalendarDate(report.date)}
                  </span>
                  <p className="mt-1 truncate text-sm text-foreground-soft/80">
                    {reportSummary(report)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
