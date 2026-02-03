import { prisma } from '@/lib/prisma';

export async function compileDayReport(userId: string, date: Date): Promise<void> {
  const startOfDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );

  const existing = await prisma.dailyReport.findUnique({
    where: {
      userId_date: { userId, date: startOfDay },
    },
  });
  if (existing?.source === 'full_log') {
    return;
  }

  const incidents = await prisma.incident.findMany({
    where: {
      userId,
      date: startOfDay,
    },
    orderBy: [{ time: 'asc' }, { createdAt: 'asc' }],
  });

  if (incidents.length === 0) {
    await prisma.dailyReport.deleteMany({
      where: {
        userId,
        date: startOfDay,
        source: 'compiled',
      },
    });
    return;
  }

  const symptoms =
    incidents
      .map((i) => i.symptoms?.trim())
      .filter(Boolean)
      .join(' — ') || null;
  const dietBehaviorNotes =
    incidents
      .map((i) => i.notes?.trim())
      .filter(Boolean)
      .join(' — ') || null;
  const overallFeeling = `Compiled from ${incidents.length} incident${incidents.length === 1 ? '' : 's'}`;

  await prisma.dailyReport.upsert({
    where: {
      userId_date: { userId, date: startOfDay },
    },
    create: {
      userId,
      date: startOfDay,
      source: 'compiled',
      symptoms,
      dietBehaviorNotes,
      overallFeeling,
    },
    update: {
      source: 'compiled',
      symptoms,
      dietBehaviorNotes,
      overallFeeling,
    },
  });
}
