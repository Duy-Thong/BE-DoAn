import { z } from 'zod';

export const createReviewDto = z.object({
  companyId: z.string().cuid('Company ID không hợp lệ'),
  rating: z.number().min(1, 'Đánh giá phải từ 1-5').max(5, 'Đánh giá phải từ 1-5'),
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  content: z.string().min(1, 'Nội dung không được để trống'),
  pros: z.string().optional(),
  cons: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  isVerified: z.boolean().default(false),
});
export type CreateReviewDto = z.infer<typeof createReviewDto>;

export const updateReviewDto = createReviewDto.partial().omit({ companyId: true });
export type UpdateReviewDto = z.infer<typeof updateReviewDto>;
