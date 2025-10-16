import { z } from 'zod';
import { NOTIFICATION_TYPES, NOTIFICATION_RELATED_TYPES } from '../../utils/constants.js';

export const createNotificationDto = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  message: z.string().min(1, 'Nội dung không được để trống'),
  type: z.enum(NOTIFICATION_TYPES as [string, ...string[]], {
    errorMap: () => ({ message: 'Loại thông báo không hợp lệ' }),
  }),
  relatedType: z.enum(NOTIFICATION_RELATED_TYPES as [string, ...string[]]).optional(),
  relatedId: z.string().cuid('ID liên quan không hợp lệ').optional(),
  userId: z.string().cuid('User ID không hợp lệ'),
  isRead: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
});
export type CreateNotificationDto = z.infer<typeof createNotificationDto>;

export const updateNotificationDto = createNotificationDto.partial().omit({ userId: true });
export type UpdateNotificationDto = z.infer<typeof updateNotificationDto>;

export const markAsReadDto = z.object({
  isRead: z.boolean(),
});
export type MarkAsReadDto = z.infer<typeof markAsReadDto>;

export const bulkMarkAsReadDto = z.object({
  notificationIds: z.array(z.string().cuid()),
  isRead: z.boolean(),
});
export type BulkMarkAsReadDto = z.infer<typeof bulkMarkAsReadDto>;
