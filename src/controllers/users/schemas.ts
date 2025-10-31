import { z } from 'zod'

export const CreateUserBody = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
})

export type CreateUserBody = z.infer<typeof CreateUserBody>

export const UpdateUserBody = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: 'At least one field must be provided',
  })

export type UpdateUserBody = z.infer<typeof UpdateUserBody>
