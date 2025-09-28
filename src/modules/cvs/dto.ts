import { z } from 'zod';

export const createCVDto = z.object({
  title: z.string().min(1, 'CV title is required'),
  fileName: z.string().min(1, 'File name is required'),
  fileUrl: z.string().url('Invalid file URL'),
  fileSize: z.number().positive('File size must be positive'),
});

export const updateCVDto = z.object({
  title: z.string().min(1, 'CV title is required').optional(),
  isMain: z.boolean().optional(),
});

export const setMainCVDto = z.object({
  cvId: z.string().cuid('Invalid CV ID'),
});

export type CreateCVDto = z.infer<typeof createCVDto>;
export type UpdateCVDto = z.infer<typeof updateCVDto>;
export type SetMainCVDto = z.infer<typeof setMainCVDto>;
