import { z } from 'zod';
import { Gender } from './enums.js';

export const createCVDto = z.object({
  title: z.string().min(1, 'Tiêu đề CV không được để trống'),
  fullName: z.string().min(1, 'Họ tên không được để trống'),
  email: z.string().email('Email không hợp lệ'),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.nativeEnum(Gender).optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  currentPosition: z.string().optional(),
  summary: z.string().optional(),
  objective: z.string().optional(),
  isMain: z.boolean().default(false),
});

export const updateCVDto = z.object({
  title: z.string().min(1, 'Tiêu đề CV không được để trống').optional(),
  fullName: z.string().min(1, 'Họ tên không được để trống').optional(),
  email: z.string().email('Email không hợp lệ').optional(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.nativeEnum(Gender).optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  currentPosition: z.string().optional(),
  summary: z.string().optional(),
  objective: z.string().optional(),
  isMain: z.boolean().optional(),
});

export const setMainCVDto = z.object({
  cvId: z.string().cuid('ID CV không hợp lệ'),
});

export const CVResponse = z.object({
  id: z.string(),
  title: z.string(),
  fullName: z.string(),
  email: z.string(),
  phoneNumber: z.string().nullable(),
  dateOfBirth: z.date().nullable(),
  gender: z.nativeEnum(Gender).nullable(),
  nationality: z.string().nullable(),
  address: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  currentPosition: z.string().nullable(),
  summary: z.string().nullable(),
  objective: z.string().nullable(),
  isMain: z.boolean(),
  version: z.number(),
  lastGeneratedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
});

export type CreateCVDto = z.infer<typeof createCVDto>;
export type UpdateCVDto = z.infer<typeof updateCVDto>;
export type SetMainCVDto = z.infer<typeof setMainCVDto>;
export type CVResponse = z.infer<typeof CVResponse>;
