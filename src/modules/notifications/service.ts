import { prisma } from '../../loaders/prisma.js';
import { CreateNotificationDto, UpdateNotificationDto, MarkAsReadDto, BulkMarkAsReadDto } from './dto.js';

export class NotificationService {
  async createNotification(data: CreateNotificationDto) {
    return prisma.notification.create({
      data,
    });
  }

  async getNotifications(userId: string, options: {
    page?: number;
    limit?: number;
    type?: string;
    isRead?: boolean;
  } = {}) {
    const { page = 1, limit = 10, type, isRead } = options;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (type) where.type = type;
    if (isRead !== undefined) where.isRead = isRead;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getNotificationById(userId: string, id: string) {
    return prisma.notification.findFirst({
      where: { id, userId },
    });
  }

  async updateNotification(userId: string, id: string, data: UpdateNotificationDto) {
    const existing = await this.getNotificationById(userId, id);
    if (!existing) {
      throw new Error('Notification not found or access denied');
    }

    return prisma.notification.update({
      where: { id },
      data,
    });
  }

  async deleteNotification(userId: string, id: string) {
    const existing = await this.getNotificationById(userId, id);
    if (!existing) {
      throw new Error('Notification not found or access denied');
    }

    return prisma.notification.delete({
      where: { id },
    });
  }

  async markAsRead(userId: string, id: string, data: MarkAsReadDto) {
    const existing = await this.getNotificationById(userId, id);
    if (!existing) {
      throw new Error('Notification not found or access denied');
    }

    return prisma.notification.update({
      where: { id },
      data: { isRead: data.isRead },
    });
  }

  async bulkMarkAsRead(userId: string, data: BulkMarkAsReadDto) {
    return prisma.notification.updateMany({
      where: {
        id: { in: data.notificationIds },
        userId,
      },
      data: { isRead: data.isRead },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async getNotificationStats(userId: string) {
    const [total, unread, byType] = await Promise.all([
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.notification.groupBy({
        by: ['type'],
        where: { userId },
        _count: { type: true },
      }),
    ]);

    return {
      total,
      unread,
      read: total - unread,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  async deleteOldNotifications(userId: string, daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return prisma.notification.deleteMany({
      where: {
        userId,
        createdAt: { lt: cutoffDate },
        isRead: true,
      },
    });
  }

  async createBulkNotifications(notifications: Omit<CreateNotificationDto, 'userId'>[], userIds: string[]) {
    const data = userIds.flatMap(userId =>
      notifications.map(notification => ({
        ...notification,
        userId,
      }))
    );

    return prisma.notification.createMany({
      data,
    });
  }
}
