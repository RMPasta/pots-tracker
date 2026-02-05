import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DashboardHeader } from '@/components/DashboardHeader';
import { formatCalendarDate } from '@/lib/dates';

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const startOfDay = new Date(
    Date.UTC(report.date.getUTCFullYear(), report.date.getUTCMonth(), report.date.getUTCDate())
  );
  const incidents = await prisma.incident.findMany({
    where: {
      userId: session.user.id,
      date: startOfDay,
    },
    orderBy: [{ time: 'asc' }, { createdAt: 'asc' }],
  });

  const hasDailyLogContent =
    (report.diet != null && report.diet !== '') ||
    (report.exercise != null && report.exercise !== '') ||
    (report.medicine != null && report.medicine !== '') ||
    (report.waterIntake != null && report.waterIntake !== '') ||
    (report.sodiumIntake != null && report.sodiumIntake !== '') ||
    (report.feelingMorning != null && report.feelingMorning !== '') ||
    (report.feelingAfternoon != null && report.feelingAfternoon !== '') ||
    (report.feelingNight != null && report.feelingNight !== '') ||
    report.overallRating != null;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <DashboardHeader links={[{ href: '/dashboard/history', label: 'Back to history' }]} />

      <main className="flex flex-1 flex-col gap-4">
        <div className="rounded-2xl bg-card-bg p-4 shadow-(--shadow-soft) sm:p-5">
          <h2 className="text-lg font-medium text-foreground-soft">
            {formatCalendarDate(report.date)}
          </h2>
          <p className="mt-1 text-sm text-foreground-soft/70">
            {report.source === 'compiled'
              ? `Compiled from ${incidents.length} incident${incidents.length === 1 ? '' : 's'}`
              : 'Daily log'}
          </p>

          <p className="mt-2">
            <Link
              href={`/dashboard/history/${report.id}/edit`}
              className="text-sm font-medium text-pastel-outline-pink underline hover:opacity-90"
            >
              {report.source === 'full_log'
                ? 'Edit report'
                : hasDailyLogContent
                  ? 'Edit daily log'
                  : 'Add daily log'}
            </Link>
          </p>

          {hasDailyLogContent && (
            <div className="mt-6 space-y-4">
              {report.diet != null && report.diet !== '' && (
                <div>
                  <h3 className="text-sm font-medium text-foreground-soft/80">Diet</h3>
                  <p className="mt-1 break-words whitespace-pre-wrap text-foreground-soft/90">
                    {report.diet}
                  </p>
                </div>
              )}
              {report.exercise != null && report.exercise !== '' && (
                <div>
                  <h3 className="text-sm font-medium text-foreground-soft/80">Exercise</h3>
                  <p className="mt-1 break-words whitespace-pre-wrap text-foreground-soft/90">
                    {report.exercise}
                  </p>
                </div>
              )}
              {report.medicine != null && report.medicine !== '' && (
                <div>
                  <h3 className="text-sm font-medium text-foreground-soft/80">Medicine</h3>
                  <p className="mt-1 break-words whitespace-pre-wrap text-foreground-soft/90">
                    {report.medicine}
                  </p>
                </div>
              )}
              {report.waterIntake != null && report.waterIntake !== '' && (
                <div>
                  <h3 className="text-sm font-medium text-foreground-soft/80">Water intake</h3>
                  <p className="mt-1 break-words text-foreground-soft/90">{report.waterIntake}</p>
                </div>
              )}
              {report.sodiumIntake != null && report.sodiumIntake !== '' && (
                <div>
                  <h3 className="text-sm font-medium text-foreground-soft/80">Sodium / salt</h3>
                  <p className="mt-1 break-words text-foreground-soft/90">{report.sodiumIntake}</p>
                </div>
              )}
              {report.feelingMorning != null && report.feelingMorning !== '' && (
                <div>
                  <h3 className="text-sm font-medium text-foreground-soft/80">
                    How I felt — morning
                  </h3>
                  <p className="mt-1 break-words text-foreground-soft/90">
                    {report.feelingMorning}
                  </p>
                </div>
              )}
              {report.feelingAfternoon != null && report.feelingAfternoon !== '' && (
                <div>
                  <h3 className="text-sm font-medium text-foreground-soft/80">
                    How I felt — afternoon
                  </h3>
                  <p className="mt-1 break-words text-foreground-soft/90">
                    {report.feelingAfternoon}
                  </p>
                </div>
              )}
              {report.feelingNight != null && report.feelingNight !== '' && (
                <div>
                  <h3 className="text-sm font-medium text-foreground-soft/80">
                    How I felt — night
                  </h3>
                  <p className="mt-1 break-words text-foreground-soft/90">{report.feelingNight}</p>
                </div>
              )}
              {report.overallRating != null && (
                <div>
                  <h3 className="text-sm font-medium text-foreground-soft/80">Overall rating</h3>
                  <p className="mt-1 text-foreground-soft/90">{report.overallRating}/10</p>
                </div>
              )}
            </div>
          )}

          {incidents.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-foreground-soft/80">Incidents</h3>
              <ul className="mt-3 space-y-4">
                {incidents.map((incident) => (
                  <li
                    key={incident.id}
                    className="rounded-xl border border-pastel-outline-pink/40 bg-pastel-yellow/30 p-3 sm:p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {incident.time && (
                          <p className="text-sm font-medium text-foreground-soft/80">
                            {incident.time}
                          </p>
                        )}
                        {incident.rating != null && (
                          <p className="text-sm text-foreground-soft/80">
                            Rating: {incident.rating}/10
                          </p>
                        )}
                        {incident.symptoms && (
                          <p className="mt-1 break-words whitespace-pre-wrap text-foreground-soft/90">
                            {incident.symptoms}
                          </p>
                        )}
                        {incident.notes && (
                          <p className="mt-1 break-words text-sm text-foreground-soft/70">
                            {incident.notes}
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/dashboard/incidents/${incident.id}/edit?returnTo=${encodeURIComponent(`/dashboard/history/${report.id}`)}`}
                        className="shrink-0 px-2 py-2 text-sm font-medium text-pastel-outline-pink underline hover:opacity-90 min-h-[44px] inline-flex items-center"
                      >
                        Edit
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {incidents.length === 0 && (
            <p className="mt-4 text-sm text-foreground-soft/70">No incidents for this day.</p>
          )}
        </div>
      </main>
    </div>
  );
}
