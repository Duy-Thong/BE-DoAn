import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.js';
import { prisma } from '../../loaders/prisma.js';
import { z } from 'zod';

export const notificationsRouter = Router();

const CreateNotificationSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'APPLICATION', 'JOB', 'COMPANY']).default('INFO'),
  userId: z.string().optional(),
  relatedId: z.string().optional(),
  relatedType: z.enum(['JOB', 'APPLICATION', 'COMPANY', 'USER']).optional()
});

// Get user notifications
notificationsRouter.get('/', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unreadOnly === 'true';

    const where = {
      userId: req.user!.id,
      ...(unreadOnly && { isRead: false })
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where })
    ]);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    });
  }
});

// Get notification by ID
notificationsRouter.get('/:id', requireAuth, async (req, res) => {
  try {
    const notification = await prisma.notification.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification'
    });
  }
});

// Mark notification as read
notificationsRouter.put('/:id/read', requireAuth, async (req, res) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    if (notification.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
});

// Mark all notifications as read
notificationsRouter.put('/read-all', requireAuth, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user!.id,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read'
    });
  }
});

// Delete notification
notificationsRouter.delete('/:id', requireAuth, async (req, res) => {
  try {
    const notification = await prisma.notification.deleteMany({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (notification.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification'
    });
  }
});

// Delete all notifications
notificationsRouter.delete('/', requireAuth, async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: {
        userId: req.user!.id
      }
    });

    res.json({
      success: true,
      message: 'All notifications deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete all notifications'
    });
  }
});

// Create notification (Admin only)
notificationsRouter.post('/', requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { title, message, type, userId, relatedId, relatedType } = CreateNotificationSchema.parse(req.body);

    let notification;
    
    if (userId) {
      // Create for specific user
      notification = await prisma.notification.create({
        data: {
          title,
          message,
          type,
          userId,
          relatedId,
          relatedType
        }
      });
    } else {
      // Create for all users
      const users = await prisma.user.findMany({
        select: { id: true }
      });

      const notifications = await Promise.all(
        users.map(user => 
          prisma.notification.create({
            data: {
              title,
              message,
              type,
              userId: user.id,
              relatedId,
              relatedType
            }
          })
        )
      );

      return res.status(201).json({
        success: true,
        data: notifications,
        message: `Notification sent to ${notifications.length} users`
      });
    }

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create notification'
    });
  }
});

// Get notification stats
notificationsRouter.get('/stats', requireAuth, async (req, res) => {
  try {
    const [total, unread, byType] = await Promise.all([
      prisma.notification.count({
        where: { userId: req.user!.id }
      }),
      prisma.notification.count({
        where: { userId: req.user!.id, isRead: false }
      }),
      prisma.notification.groupBy({
        by: ['type'],
        where: { userId: req.user!.id },
        _count: { type: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        total,
        unread,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item._count.type;
          return acc;
        }, {} as Record<string, number>)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification stats'
    });
  }
});
