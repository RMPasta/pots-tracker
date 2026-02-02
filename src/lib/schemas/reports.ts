import { z } from 'zod';

const dateSchema = z
  .union([z.string().datetime(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.coerce.date()])
  .transform((val) => {
    const d = typeof val === 'string' ? new Date(val) : val;
    const normalized = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    return normalized;
  });

export const reportCreateSchema = z.object({
  date: dateSchema,
  symptoms: z.string().max(10000).optional(),
  dietBehaviorNotes: z.string().max(10000).optional(),
  overallFeeling: z.string().max(500).optional(),
});

export const incidentCreateSchema = z.object({
  date: dateSchema,
  time: z.string().max(20).optional(),
  symptoms: z.string().max(10000).optional(),
  notes: z.string().max(10000).optional(),
});

export type ReportCreateInput = z.infer<typeof reportCreateSchema>;
export type IncidentCreateInput = z.infer<typeof incidentCreateSchema>;
