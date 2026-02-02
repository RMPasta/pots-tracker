import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) {
    redirect('/auth/signin');
  }

  const { id } = await params;

  const report = await prisma.dailyReport.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!report) {
    notFound();
  }

  let incidents: Awaited<ReturnType<typeof prisma.incident.findMany>> = [];

  if (report.source === 'compiled') {
    const startOfDay = new Date(
      Date.UTC(
        report.date.getUTCFullYear(),
        report.date.getUTCMonth(),
        report.date.getUTCDate()
      )
    );
    incidents = await prisma.incident.findMany({
      where: {
        userId: session.user.id,
        date: startOfDay,
      },
      orderBy: [{ time: 'asc' }, { createdAt: 'asc' }],
    });
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <header className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 shadow-(--shadow-soft) dark:bg-pastel-purple/10">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground-soft">
          POTS Tracker
        </h1>
        <Link
          href="/dashboard/history"
          className="rounded-full border-2 border-pastel-pink/50 bg-pastel-pink/20 px-4 py-2 text-sm font-medium text-foreground-soft transition-colors hover:bg-pastel-pink/30"
        >
          Back to history
        </Link>
      </header>

      <main className="flex flex-1 flex-col gap-4">
        <div className="rounded-2xl bg-white/80 p-6 shadow-(--shadow-soft) dark:bg-pastel-purple/10">
          <h2 className="text-lg font-medium text-foreground-soft">
            {formatDate(report.date)}
          </h2>
          <p className="mt-1 text-sm text-foreground-soft/70">
            {report.source === 'compiled'
              ? `Compiled from ${incidents.length} incident${incidents.length === 1 ? '' : 's'}`
              : 'Daily log'}
          </p>

          {report.source === 'full_log' && (
            <div className="mt-6 space-y-4">
              {report.symptoms && (
                <div>
                  <h3 className="text-sm font-medium text-foreground-soft/80">
                    Symptoms
                  </h3>
                  <p className="mt-1 whitespace-pre-wrap text-foreground-soft/90">
                    {report.symptoms}
                  </p>
                </div>
              )}
              {report.dietBehaviorNotes && (
                <div>
                  <h3 className="text-sm font-medium text-foreground-soft/80">
                    Diet / behavior notes
                  </h3>
                  <p className="mt-1 whitespace-pre-wrap text-foreground-soft/90">
                    {report.dietBehaviorNotes}
                  </p>
                </div>
              )}
              {report.overallFeeling && (
                <div>
                  <h3 className="text-sm font-medium text-foreground-soft/80">
                    Overall feeling
                  </h3>
                  <p className="mt-1 text-foreground-soft/90">
                    {report.overallFeeling}
                  </p>
                </div>
              )}
            </div>
          )}

          {report.source === 'compiled' && incidents.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-foreground-soft/80">
                Incidents
              </h3>
              <ul className="mt-3 space-y-4">
                {incidents.map((incident) => (
                  <li
                    key={incident.id}
                    className="rounded-xl border border-pastel-purple/30 bg-pastel-yellow/10 p-4 dark:bg-pastel-purple/5"
                  >
                    {incident.time && (
                      <p className="text-sm font-medium text-foreground-soft/80">
                        {incident.time}
                      </p>
                    )}
                    {incident.symptoms && (
                      <p className="mt-1 whitespace-pre-wrap text-foreground-soft/90">
                        {incident.symptoms}
                      </p>
                    )}
                    {incident.notes && (
                      <p className="mt-1 text-sm text-foreground-soft/70">
                        {incident.notes}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.source === 'compiled' && incidents.length === 0 && (
            <p className="mt-4 text-sm text-foreground-soft/70">
              No incidents for this day.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
