function formatDateUTC(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export type ExportRow = {
  date: Date;
  diet: string | null;
  exercise: string | null;
  medicine: string | null;
  waterIntake: string | null;
  sodiumIntake: string | null;
  feelingMorning: string | null;
  feelingAfternoon: string | null;
  feelingNight: string | null;
  overallRating: number | null;
  [key: string]: Date | string | number | null | undefined;
};

export type ExportColumn = {
  key: string;
  label: string;
  getValue: (r: ExportRow) => string;
};

const dailyColumns: ExportColumn[] = [
  { key: 'date', label: 'Date', getValue: (r) => formatDateUTC(r.date) },
  { key: 'diet', label: 'Diet', getValue: (r) => r.diet ?? '' },
  { key: 'exercise', label: 'Exercise', getValue: (r) => r.exercise ?? '' },
  { key: 'medicine', label: 'Medicine', getValue: (r) => r.medicine ?? '' },
  { key: 'waterIntake', label: 'Water intake', getValue: (r) => r.waterIntake ?? '' },
  { key: 'sodiumIntake', label: 'Sodium / salt', getValue: (r) => r.sodiumIntake ?? '' },
  {
    key: 'feelingMorning',
    label: 'Feeling (morning)',
    getValue: (r) => r.feelingMorning ?? '',
  },
  {
    key: 'feelingAfternoon',
    label: 'Feeling (afternoon)',
    getValue: (r) => r.feelingAfternoon ?? '',
  },
  {
    key: 'feelingNight',
    label: 'Feeling (night)',
    getValue: (r) => r.feelingNight ?? '',
  },
  {
    key: 'overallRating',
    label: 'Overall rating',
    getValue: (r) => (r.overallRating != null ? String(r.overallRating) : ''),
  },
];

export function buildExportColumns(maxIncidents: number): ExportColumn[] {
  const incidentColumns: ExportColumn[] = [];
  for (let n = 1; n <= maxIncidents; n++) {
    const timeKey = `incident${n}Time`;
    const symptomsKey = `incident${n}Symptoms`;
    const notesKey = `incident${n}Notes`;
    const ratingKey = `incident${n}Rating`;
    incidentColumns.push(
      {
        key: timeKey,
        label: `Incident ${n} - Time`,
        getValue: (r) => String(r[timeKey] ?? ''),
      },
      {
        key: symptomsKey,
        label: `Incident ${n} - Symptoms`,
        getValue: (r) => String(r[symptomsKey] ?? ''),
      },
      {
        key: notesKey,
        label: `Incident ${n} - Notes`,
        getValue: (r) => String(r[notesKey] ?? ''),
      },
      {
        key: ratingKey,
        label: `Incident ${n} - Rating`,
        getValue: (r) => String(r[ratingKey] ?? ''),
      }
    );
  }
  return [...dailyColumns, ...incidentColumns];
}
