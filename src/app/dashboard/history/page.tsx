import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

const DEFAULT_DAYS = 90;

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function reportSummary(report: {
  source: string;
  symptoms: string | null;
  overallFeeling: string | null;
}): string {
  if (report.source === 'compiled') {
    return report.overallFeeling ?? 'Compiled from incidents';
  }
  const first = report.symptoms?.split('\n')[0]?.trim() || report.overallFeeling;
  return first ?? 'Daily log';
}

export default async function HistoryPage() {
  const session = await auth();
  if (!session) {
    redirect('/auth/signin');
  }

  const from = new Date();
  from.setDate(from.getDate() - DEFAULT_DAYS);
  const start = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate())
  );
  const end = new Date(
    Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate()
    )
  );

  const reports = await prisma.dailyReport.findMany({
    where: {
      userId: session.user.id,
      date: { gte: start, lte: end },
    },
    orderBy: { date: 'desc' },
  });

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <header className="flex items-center justify-between rounded-2xl bg-card-bg px-4 py-3 shadow-(--shadow-soft)">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground-soft">
          POTS Tracker
        </h1>
        <Link
          href="/dashboard"
          className="rounded-full bg-btn-primary px-4 py-2 text-sm font-medium text-foreground-soft transition-colors hover:bg-btn-primary-hover"
        >
          Back to dashboard
        </Link>
      </header>

      <main className="flex flex-1 flex-col gap-4">
        <h2 className="text-xl font-medium text-foreground-soft">History</h2>

        {reports.length === 0 ? (
          <div className="rounded-2xl bg-card-bg p-8 text-center shadow-(--shadow-soft)">
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
                  className="block rounded-2xl bg-card-bg p-4 shadow-(--shadow-soft) transition-colors hover:bg-pastel-mint/40"
                >
                  <span className="font-medium text-foreground-soft">
                    {formatDate(report.date)}
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
