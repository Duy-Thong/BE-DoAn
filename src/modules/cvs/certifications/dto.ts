import { z } from 'zod';

export const createCertificationDto = z.object({
  name: z.string().min(1, 'Tên chứng chỉ không được để trống'),
  issuer: z.string().min(1, 'Tổ chức cấp không được để trống'),
  issueDate: z.string().datetime('Ngày cấp không hợp lệ'),
  expiryDate: z.string().datetime('Ngày hết hạn không hợp lệ').optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().url('URL chứng chỉ không hợp lệ').optional(),
  description: z.string().optional(),
});
export type CreateCertificationDto = z.infer<typeof createCertificationDto>;

export const updateCertificationDto = createCertificationDto.partial();
export type UpdateCertificationDto = z.infer<typeof updateCertificationDto>;
