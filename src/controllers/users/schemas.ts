import { z } from 'zod';

const sanitizeString = (str: string) => {
  if (str.includes('<script>') || str.includes('</script>')) {
    throw new z.ZodError([
      {
        code: 'custom',
        message: 'Invalid characters detected',
        path: [],
      },
    ]);
  }
  return str;
};

export const CreateUserBodySchema = z.object({
  firstName: z.string().min(1).max(100).transform(sanitizeString),
  lastName: z.string().min(1).max(100).transform(sanitizeString),
});

export type CreateUserBody = z.infer<typeof CreateUserBodySchema>;

export const UpdateUserBodySchema = z
  .object({
    firstName: z.string().min(1).max(100).transform(sanitizeString).optional(),
    lastName: z.string().min(1).max(100).transform(sanitizeString).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: 'At least one field must be provided',
  });

export type UpdateUserBody = z.infer<typeof UpdateUserBodySchema>;
