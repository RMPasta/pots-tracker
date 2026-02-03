import { prisma } from '@/lib/prisma';
import { formatCalendarDate } from '@/lib/dates';

export const MAX_ANALYSIS_RANGE_DAYS = 90;
const RECENT_DAYS_SAMPLE = 7;
const KEYWORD_TOP_N = 15;

const STOPWORDS = new Set(
  'a an the and or but in on at to for of with by from as is was are were be been being have has had do does did will would could should may might must can i you we they it this that'.split(
    ' '
  )
);

function dateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function extractKeywords(text: string | null, wordCount: Map<string, number>): void {
  if (!text || !text.trim()) return;
  const words = text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w) && !/^\d+$/.test(w));
  for (const w of words) {
    wordCount.set(w, (wordCount.get(w) ?? 0) + 1);
  }
}

export type AnalysisPayload = {
  dataSummary: string;
  dateRangeLabel: string;
  hasData: boolean;
};

export async function buildAnalysisPayload(
  userId: string,
  from: Date,
  to: Date
): Promise<AnalysisPayload> {
  const fromStr = formatCalendarDate(from);
  const toStr = formatCalendarDate(to);
  const dateRangeLabel = `${fromStr} to ${toStr}`;

  const dayCount =
    Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)) + 1;

  const [reports, incidents] = await Promise.all([
    prisma.dailyReport.findMany({
      where: {
        userId,
        date: { gte: from, lte: to },
      },
      orderBy: { date: 'asc' },
    }),
    prisma.incident.findMany({
      where: {
        userId,
        date: { gte: from, lte: to },
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }, { createdAt: 'asc' }],
    }),
  ]);

  const totalDaysWithReport = reports.length;
  const reportsWithRating = reports.filter((r) => r.overallRating != null);
  const daysWithRating = reportsWithRating.length;
  const averageRating =
    daysWithRating > 0
      ? reportsWithRating.reduce((s, r) => s + (r.overallRating ?? 0), 0) / daysWithRating
      : null;
  const ratingCounts: Record<number, number> = {};
  for (const r of reportsWithRating) {
    const v = r.overallRating ?? 0;
    ratingCounts[v] = (ratingCounts[v] ?? 0) + 1;
  }

  const daysWithDiet = reports.filter((r) => r.diet?.trim()).length;
  const daysWithExercise = reports.filter((r) => r.exercise?.trim()).length;
  const daysWithMedicine = reports.filter((r) => r.medicine?.trim()).length;
  const daysWithFeelings = reports.filter(
    (r) =>
      r.feelingMorning?.trim() ||
      r.feelingAfternoon?.trim() ||
      r.feelingNight?.trim()
  ).length;

  const incidentDates = new Set(incidents.map((i) => dateKey(i.date)));
  const incidentDays = incidentDates.size;
  const totalIncidents = incidents.length;
  const incidentsByDate = new Map<string, typeof incidents>();
  for (const i of incidents) {
    const key = dateKey(i.date);
    const list = incidentsByDate.get(key) ?? [];
    list.push(i);
    incidentsByDate.set(key, list);
  }
  let maxIncidentsInOneDay = 0;
  for (const list of incidentsByDate.values()) {
    if (list.length > maxIncidentsInOneDay) maxIncidentsInOneDay = list.length;
  }
  const avgIncidentsPerDay =
    incidentDays > 0 ? totalIncidents / incidentDays : 0;

  const hasData = totalDaysWithReport > 0 || totalIncidents > 0;
  if (!hasData) {
    return {
      dataSummary: '',
      dateRangeLabel,
      hasData: false,
    };
  }

  const lines: string[] = [];

  lines.push(`Period: ${dateRangeLabel} (${dayCount} days)`);
  lines.push('');
  lines.push('Reports:');
  lines.push(`  Days with a report: ${totalDaysWithReport}`);
  lines.push(`  Days with a rating: ${daysWithRating}`);
  if (averageRating != null) {
    lines.push(`  Average rating (when given): ${averageRating.toFixed(1)}/10`);
  }
  if (Object.keys(ratingCounts).length > 0) {
    const dist = Object.entries(ratingCounts)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(', ');
    lines.push(`  Rating distribution: ${dist}`);
  }
  lines.push(`  Days with diet logged: ${daysWithDiet}`);
  lines.push(`  Days with exercise logged: ${daysWithExercise}`);
  lines.push(`  Days with medicine logged: ${daysWithMedicine}`);
  lines.push(`  Days with feelings logged: ${daysWithFeelings}`);
  lines.push('');
  lines.push('Incidents:');
  lines.push(`  Total incidents: ${totalIncidents}`);
  lines.push(`  Days with at least one incident: ${incidentDays}`);
  lines.push(`  Avg incidents per incident-day: ${avgIncidentsPerDay.toFixed(1)}`);
  lines.push(`  Max incidents in one day: ${maxIncidentsInOneDay}`);

  if (dayCount >= 14) {
    const msPerDay = 24 * 60 * 60 * 1000;
    const weeks: { start: Date; end: Date; label: string }[] = [];
    let cursor = new Date(from.getTime());
    while (cursor.getTime() <= to.getTime()) {
      const weekEnd = new Date(cursor.getTime() + 6 * msPerDay);
      const endCap = weekEnd.getTime() > to.getTime() ? to : weekEnd;
      weeks.push({
        start: new Date(cursor),
        end: endCap,
        label: `${formatCalendarDate(cursor)} – ${formatCalendarDate(endCap)}`,
      });
      cursor = new Date(cursor.getTime() + 7 * msPerDay);
    }
    lines.push('');
    lines.push('By week:');
    for (const w of weeks) {
      const weekReports = reports.filter(
        (r) => r.date.getTime() >= w.start.getTime() && r.date.getTime() <= w.end.getTime()
      );
      const weekIncidents = incidents.filter(
        (i) => i.date.getTime() >= w.start.getTime() && i.date.getTime() <= w.end.getTime()
      );
      const weekRatings = weekReports.filter((r) => r.overallRating != null);
      const avgWeekRating =
        weekRatings.length > 0
          ? weekRatings.reduce((s, r) => s + (r.overallRating ?? 0), 0) / weekRatings.length
          : null;
      lines.push(
        `  ${w.label}: ${weekReports.length} reports, ${weekIncidents.length} incidents` +
          (avgWeekRating != null ? `, avg rating ${avgWeekRating.toFixed(1)}` : '')
      );
    }

    const midMs = from.getTime() + (to.getTime() - from.getTime()) / 2;
    const firstHalfReports = reports.filter((r) => r.date.getTime() <= midMs);
    const secondHalfReports = reports.filter((r) => r.date.getTime() > midMs);
    const firstHalfIncidents = incidents.filter((i) => i.date.getTime() <= midMs);
    const secondHalfIncidents = incidents.filter((i) => i.date.getTime() > midMs);
    const firstRatings = firstHalfReports.filter((r) => r.overallRating != null);
    const secondRatings = secondHalfReports.filter((r) => r.overallRating != null);
    const firstAvg =
      firstRatings.length > 0
        ? firstRatings.reduce((s, r) => s + (r.overallRating ?? 0), 0) / firstRatings.length
        : null;
    const secondAvg =
      secondRatings.length > 0
        ? secondRatings.reduce((s, r) => s + (r.overallRating ?? 0), 0) / secondRatings.length
        : null;
    lines.push('');
    lines.push('First half vs second half of period:');
    lines.push(
      `  First half: ${firstHalfReports.length} reports, ${firstHalfIncidents.length} incidents` +
        (firstAvg != null ? `, avg rating ${firstAvg.toFixed(1)}` : '')
    );
    lines.push(
      `  Second half: ${secondHalfReports.length} reports, ${secondHalfIncidents.length} incidents` +
        (secondAvg != null ? `, avg rating ${secondAvg.toFixed(1)}` : '')
    );
  }

  const sortedReports = [...reports].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );
  const recentReports = sortedReports.slice(0, RECENT_DAYS_SAMPLE);
  if (recentReports.length > 0) {
    lines.push('');
    lines.push(`Last ${recentReports.length} days (most recent first):`);
    for (const r of recentReports) {
      const key = dateKey(r.date);
      const count = (incidentsByDate.get(key) ?? []).length;
      const parts = [formatCalendarDate(r.date)];
      if (r.overallRating != null) parts.push(`rating ${r.overallRating}`);
      if (r.diet?.trim()) parts.push('diet yes');
      if (r.exercise?.trim()) parts.push('exercise yes');
      if (r.medicine?.trim()) parts.push('medicine yes');
      parts.push(`${count} incident(s)`);
      lines.push(`  ${parts.join(', ')}`);
    }
  }

  const wordCount = new Map<string, number>();
  for (const i of incidents) {
    extractKeywords(i.symptoms, wordCount);
    extractKeywords(i.notes, wordCount);
  }
  const topKeywords = [...wordCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, KEYWORD_TOP_N);
  if (topKeywords.length > 0) {
    lines.push('');
    lines.push('Frequent words in incident symptoms/notes:');
    lines.push(`  ${topKeywords.map(([w, c]) => `${w}:${c}`).join(', ')}`);
  }

  const dataSummary = lines.join('\n');
  return {
    dataSummary,
    dateRangeLabel,
    hasData: true,
  };
}
