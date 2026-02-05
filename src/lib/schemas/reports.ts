import { z } from 'zod';
import { parseCalendarDateUTC } from '@/lib/dates';

const dateSchema = z
  .union([z.string().datetime(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.coerce.date()])
  .transform((val) => {
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      return parseCalendarDateUTC(val);
    }
    const d = typeof val === 'string' ? new Date(val) : val;
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  });

export const reportCreateSchema = z.object({
  date: dateSchema,
  diet: z.string().max(10000).optional(),
  exercise: z.string().max(10000).optional(),
  medicine: z.string().max(10000).optional(),
  waterIntake: z.string().max(2000).optional(),
  sodiumIntake: z.string().max(2000).optional(),
  feelingMorning: z.string().max(2000).optional(),
  feelingAfternoon: z.string().max(2000).optional(),
  feelingNight: z.string().max(2000).optional(),
  overallRating: z.number().int().min(1).max(10).optional(),
});

export const reportUpdateSchema = z.object({
  diet: z.string().max(10000).optional(),
  exercise: z.string().max(10000).optional(),
  medicine: z.string().max(10000).optional(),
  waterIntake: z.string().max(2000).optional(),
  sodiumIntake: z.string().max(2000).optional(),
  feelingMorning: z.string().max(2000).optional(),
  feelingAfternoon: z.string().max(2000).optional(),
  feelingNight: z.string().max(2000).optional(),
  overallRating: z.number().int().min(1).max(10).optional(),
});

export const incidentCreateSchema = z.object({
  date: dateSchema,
  time: z.string().max(20).optional(),
  symptoms: z.string().max(10000).optional(),
  notes: z.string().max(10000).optional(),
});

export type ReportCreateInput = z.infer<typeof reportCreateSchema>;
export type ReportUpdateInput = z.infer<typeof reportUpdateSchema>;
export type IncidentCreateInput = z.infer<typeof incidentCreateSchema>;
