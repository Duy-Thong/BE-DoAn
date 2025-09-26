import { z } from 'zod';

export const CreateUserDto = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  role: z.enum(['ADMIN', 'RECRUITER', 'CANDIDATE']).optional(),
  companyId: z.string().optional(),
});
export type CreateUserDto = z.infer<typeof CreateUserDto>;

export const UpdateUserDto = CreateUserDto.partial();
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;

export const UserResponse = z.object({
  id: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  role: z.enum(['ADMIN', 'RECRUITER', 'CANDIDATE']),
  companyId: z.string().nullable().optional(),
});
export type UserResponse = z.infer<typeof UserResponse>;

