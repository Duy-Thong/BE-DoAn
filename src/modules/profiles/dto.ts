import { z } from 'zod';

export const UpsertProfileDto = z.object({
  headline: z.string().optional(),
  location: z.string().optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  skills: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});
export type UpsertProfileDto = z.infer<typeof UpsertProfileDto>;

