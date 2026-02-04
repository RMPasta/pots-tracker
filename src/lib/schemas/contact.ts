import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().max(200).optional(),
  email: z
    .string()
    .max(200)
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: 'Invalid email',
    }),
  message: z.string().min(1, 'Message is required').max(3000),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
