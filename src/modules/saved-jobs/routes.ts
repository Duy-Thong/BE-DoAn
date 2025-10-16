import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.js';
import { prisma } from '../../loaders/prisma.js';

export const savedJobsRouter = Router();

savedJobsRouter.get('/', requireAuth, async (req, res) => {
  try {
    const items = await prisma.savedJob.findMany({ 
      where: { userId: req.user!.id }, 
      include: { 
        job: {
          include: {
            company: {
              select: {
                name: true,
                logoUrl: true,
                isVerified: true
              }
            },
            _count: {
              select: {
                applications: true,
                views: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ 
      success: true,
      data: items 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Không thể lấy danh sách công việc đã lưu'
    });
  }
});

savedJobsRouter.post('/:jobId', requireAuth, async (req, res) => {
  try {
    // Kiểm tra job tồn tại
    const job = await prisma.job.findFirst({
      where: {
        id: req.params.jobId!,
        isActive: true,
        isApproved: true
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Công việc không tìm thấy hoặc không còn hoạt động'
      });
    }

    const item = await prisma.savedJob.upsert({
      where: { userId_jobId: { userId: req.user!.id, jobId: req.params.jobId! } },
      update: {},
      create: { userId: req.user!.id, jobId: req.params.jobId! },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true,
                logoUrl: true,
                isVerified: true
              }
            }
          }
        }
      }
    });
    res.status(201).json({ 
      success: true,
      data: item,
      message: 'Đã lưu công việc thành công'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Không thể lưu công việc'
    });
  }
});

savedJobsRouter.delete('/:jobId', requireAuth, async (req, res) => {
  try {
    await prisma.savedJob.delete({ 
      where: { userId_jobId: { userId: req.user!.id, jobId: req.params.jobId! } } 
    });
    res.json({
      success: true,
      message: 'Đã bỏ lưu công việc thành công'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Không thể bỏ lưu công việc'
    });
  }
});

