import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AppLogo } from '@/components/AppLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { formatCalendarDate } from '@/lib/dates';
import { todayStartUTC } from '@/lib/dates';

const DEFAULT_DAYS = 90;

function reportSummary(report: { overallRating: number | null }, incidentCount: number): string {
  const rating = report.overallRating != null ? `${report.overallRating}/10` : null;
  const incidents =
    incidentCount > 0 ? `${incidentCount} incident${incidentCount === 1 ? '' : 's'}` : null;
  if (rating && incidents) return `${rating} · ${incidents}`;
  if (rating) return rating;
  if (incidents) return incidents;
  return 'Daily log';
}

function hasDailyLogContent(report: {
  diet: string | null;
  exercise: string | null;
  medicine: string | null;
  feelingMorning: string | null;
  feelingAfternoon: string | null;
  feelingNight: string | null;
  overallRating: number | null;
}): boolean {
  return (
    (report.diet != null && report.diet !== '') ||
    (report.exercise != null && report.exercise !== '') ||
    (report.medicine != null && report.medicine !== '') ||
    (report.feelingMorning != null && report.feelingMorning !== '') ||
    (report.feelingAfternoon != null && report.feelingAfternoon !== '') ||
    (report.feelingNight != null && report.feelingNight !== '') ||
    report.overallRating != null
  );
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
  const start = new Date(Date.UTC(from.getFullYear(), from.getMonth(), from.getDate()));

  const reports = await prisma.dailyReport.findMany({
    where: {
      userId: session.user.id,
      date: { gte: start, lte: end },
    },
    orderBy: { date: 'desc' },
  });

  function dateKey(d: Date): string {
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  }

  const reportDates = reports.map((r) => r.date);
  const incidentCounts =
    reportDates.length > 0
      ? await prisma.incident.groupBy({
          by: ['date'],
          where: {
            userId: session.user.id,
            date: { in: reportDates },
          },
          _count: { id: true },
        })
      : [];
  const countByDate = new Map(incidentCounts.map((row) => [dateKey(row.date), row._count.id]));

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <header className="flex min-h-[88px] items-center justify-between rounded-2xl bg-card-bg px-3 py-4 shadow-(--shadow-soft) sm:px-4 sm:py-5">
        <div className="flex items-center gap-2">
          <AppLogo size="header" />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground-soft">
            POTS Tracker
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/dashboard/settings"
            className="rounded-full bg-btn-outline px-4 py-2 text-sm font-medium text-foreground-soft transition-colors hover:opacity-90"
          >
            Settings
          </Link>
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
                <div className="flex items-start justify-between gap-3 rounded-2xl bg-card-bg p-3 shadow-(--shadow-soft) transition-colors hover:bg-pastel-mint/40 sm:p-4">
                  <Link href={`/dashboard/history/${report.id}`} className="min-w-0 flex-1">
                    <span className="font-medium text-foreground-soft">
                      {formatCalendarDate(report.date)}
                    </span>
                    <p className="mt-1 truncate text-sm text-foreground-soft/80">
                      {reportSummary(report, countByDate.get(dateKey(report.date)) ?? 0)}
                    </p>
                  </Link>
                  <Link
                    href={`/dashboard/history/${report.id}/edit`}
                    className="shrink-0 text-sm font-medium text-pastel-outline-pink underline hover:opacity-90"
                  >
                    {hasDailyLogContent(report) ? 'Edit' : 'Add daily log'}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
