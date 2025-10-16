import { z } from 'zod';

export const createReferenceDto = z.object({
  name: z.string().min(1, 'Tên người tham khảo không được để trống'),
  position: z.string().min(1, 'Chức vụ không được để trống'),
  company: z.string().min(1, 'Công ty không được để trống'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().optional(),
  relationship: z.string().min(1, 'Mối quan hệ không được để trống'),
  description: z.string().optional(),
});
export type CreateReferenceDto = z.infer<typeof createReferenceDto>;

export const updateReferenceDto = createReferenceDto.partial();
export type UpdateReferenceDto = z.infer<typeof updateReferenceDto>;
