import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DashboardHeader } from '@/components/DashboardHeader';
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
      <DashboardHeader links={[{ href: `/dashboard/history/${id}`, label: 'Cancel' }]} />

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
              waterIntake: report.waterIntake,
              sodiumIntake: report.sodiumIntake,
            }}
          />
        </div>
      </main>
    </div>
  );
}
