import { z } from 'zod';
import { ValidationError } from './errors';

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fields: Record<string, string[]> = {};
      const fieldMessages: string[] = [];

      error.issues.forEach((err) => {
        const path = err.path.join('.');
        if (!fields[path]) {
          fields[path] = [];
        }
        fields[path].push(err.message);
        if (path && !fieldMessages.includes(path)) {
          fieldMessages.push(path);
        }
      });

      const fieldList = fieldMessages.length > 0 ? `: ${fieldMessages.join(', ')}` : '';
      throw new ValidationError(`Validation failed${fieldList}`, fields);
    }
    throw error;
  }
}
