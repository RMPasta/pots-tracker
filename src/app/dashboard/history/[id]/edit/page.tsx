import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AppLogo } from '@/components/AppLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ReportEditForm } from '@/components/ReportEditForm';

export default async function ReportEditPage({ params }: { params: Promise<{ id: string }> }) {
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

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <header className="flex items-center justify-between rounded-2xl bg-card-bg px-3 py-2.5 shadow-(--shadow-soft) sm:px-4 sm:py-3">
        <div className="flex items-center gap-2">
          <AppLogo size="sm" className="shrink-0" />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground-soft">
            POTS Tracker
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href={`/dashboard/history/${id}`}
            className="rounded-full bg-btn-primary px-4 py-2 text-sm font-medium text-foreground-soft transition-colors hover:bg-btn-primary-hover"
          >
            Cancel
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4">
        <h2 className="text-xl font-medium text-foreground-soft">
          {report.source === 'compiled' ? 'Add daily log for this day' : 'Edit daily report'}
        </h2>
        <div className="rounded-2xl bg-card-bg p-4 shadow-(--shadow-soft) sm:p-5">
          <ReportEditForm
            report={{
              id: report.id,
              date: report.date,
              diet: report.diet,
              exercise: report.exercise,
              medicine: report.medicine,
              feelingMorning: report.feelingMorning,
              feelingAfternoon: report.feelingAfternoon,
              feelingNight: report.feelingNight,
              overallRating: report.overallRating,
            }}
          />
        </div>
      </main>
    </div>
  );
}
