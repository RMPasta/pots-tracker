import { prisma } from '@/lib/prisma';
import { buildExportColumns, type ExportRow } from './columns';

function dateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function escapeCsvCell(s: string): string {
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildCsvRow(values: string[]): string {
  return values.map(escapeCsvCell).join(',');
}

function buildCsv(
  columns: { label: string; getValue: (row: ExportRow) => string }[],
  rows: ExportRow[]
): string {
  const header = buildCsvRow(columns.map((c) => c.label));
  const dataRows = rows.map((row) =>
    buildCsvRow(columns.map((c) => c.getValue(row)))
  );
  return [header, ...dataRows].join('\n');
}

export type ExportResult = {
  csv: string;
};

export async function runExport(
  userId: string,
  from: Date,
  to: Date
): Promise<ExportResult> {
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

  const incidentsByDateKey = new Map<string, typeof incidents>();
  for (const i of incidents) {
    const key = dateKey(i.date);
    const list = incidentsByDateKey.get(key) ?? [];
    list.push(i);
    incidentsByDateKey.set(key, list);
  }

  let maxIncidents = 0;
  for (const r of reports) {
    const key = dateKey(r.date);
    const count = (incidentsByDateKey.get(key) ?? []).length;
    if (count > maxIncidents) maxIncidents = count;
  }

  const columns = buildExportColumns(maxIncidents);

  const rows: ExportRow[] = [];
  for (const r of reports) {
    const key = dateKey(r.date);
    const dayIncidents = incidentsByDateKey.get(key) ?? [];

    const row: ExportRow = {
      date: r.date,
      diet: r.diet,
      exercise: r.exercise,
      medicine: r.medicine,
      feelingMorning: r.feelingMorning,
      feelingAfternoon: r.feelingAfternoon,
      feelingNight: r.feelingNight,
      overallRating: r.overallRating,
    };

    for (let n = 1; n <= maxIncidents; n++) {
      const i = dayIncidents[n - 1];
      const timeKey = `incident${n}Time`;
      const symptomsKey = `incident${n}Symptoms`;
      const notesKey = `incident${n}Notes`;
      if (i) {
        row[timeKey] = i.time;
        row[symptomsKey] = i.symptoms;
        row[notesKey] = i.notes;
      } else {
        row[timeKey] = null;
        row[symptomsKey] = null;
        row[notesKey] = null;
      }
    }

    rows.push(row);
  }

  const csv = buildCsv(columns, rows);
  return { csv };
}
