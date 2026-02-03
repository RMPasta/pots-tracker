import { z } from 'zod';

export const userProfileUpdateSchema = z.object({
  name: z.string().max(200).optional().nullable(),
});
