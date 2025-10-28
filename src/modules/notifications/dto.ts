import { z } from 'zod';

// Notification types enum - must match Prisma schema
export const NotificationTypeEnum = z.enum([
  'JOB_APPLICATION',
  'JOB_APPROVED',
  'JOB_REJECTED',
  'INTERVIEW_SCHEDULED',
  'APPLICATION_STATUS_CHANGED',
  'NEW_JOB_MATCH',
  'COMPANY_VERIFIED',
  'SYSTEM_ANNOUNCEMENT',
]);

export const createNotificationDto = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  message: z.string().min(1, 'Nội dung không được để trống'),
  type: NotificationTypeEnum,
  userId: z.string().cuid('User ID không hợp lệ'),
  isRead: z.boolean().default(false),
  data: z.record(z.string(), z.any()).optional(), // Store relatedType, relatedId, and other metadata here
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
