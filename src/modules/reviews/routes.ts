import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.js';
import { prisma } from '../../loaders/prisma.js';
import { z } from 'zod';

export const reviewsRouter = Router();

const CreateReviewSchema = z.object({
  companyId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(200),
  comment: z.string().min(10).max(2000),
  pros: z.string().max(1000).optional(),
  cons: z.string().max(1000).optional(),
  workLifeBalance: z.number().min(1).max(5).optional(),
  salaryBenefits: z.number().min(1).max(5).optional(),
  careerGrowth: z.number().min(1).max(5).optional(),
  management: z.number().min(1).max(5).optional(),
  culture: z.number().min(1).max(5).optional(),
  isAnonymous: z.boolean().default(false)
});

const UpdateReviewSchema = CreateReviewSchema.partial().omit({ companyId: true });

// Get company reviews
reviewsRouter.get('/company/:companyId', async (req, res) => {
  try {
    const companyId = req.params.companyId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sortBy = (req.query.sortBy as string) || 'newest'; // newest, oldest, highest, lowest

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'oldest') orderBy = { createdAt: 'asc' };
    if (sortBy === 'highest') orderBy = { rating: 'desc' };
    if (sortBy === 'lowest') orderBy = { rating: 'asc' };

    const [reviews, total, stats] = await Promise.all([
      prisma.companyReview.findMany({
        where: { companyId },
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  headline: true
                }
              }
            }
          }
        }
      }),
      prisma.companyReview.count({ where: { companyId } }),
      prisma.companyReview.aggregate({
        where: { companyId },
        _avg: {
          rating: true,
          workLifeBalance: true,
          salaryBenefits: true,
          careerGrowth: true,
          management: true,
          culture: true
        },
        _count: { rating: true }
      })
    ]);

    res.json({
      success: true,
      data: reviews,
      stats: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.rating,
        workLifeBalance: stats._avg.workLifeBalance || 0,
        salaryBenefits: stats._avg.salaryBenefits || 0,
        careerGrowth: stats._avg.careerGrowth || 0,
        management: stats._avg.management || 0,
        culture: stats._avg.culture || 0
      },
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
      error: 'Failed to fetch company reviews'
    });
  }
});

// Get user's reviews
reviewsRouter.get('/my-reviews', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.companyReview.findMany({
        where: { userId: req.user!.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true
            }
          }
        }
      }),
      prisma.companyReview.count({ where: { userId: req.user!.id } })
    ]);

    res.json({
      success: true,
      data: reviews,
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
      error: 'Failed to fetch user reviews'
    });
  }
});

// Create review
reviewsRouter.post('/', requireAuth, async (req, res) => {
  try {
    const data = CreateReviewSchema.parse(req.body);

    // Check if user already reviewed this company
    const existingReview = await prisma.companyReview.findFirst({
      where: {
        userId: req.user!.id,
        companyId: data.companyId
      }
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        error: 'You have already reviewed this company'
      });
    }

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: data.companyId }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    const review = await prisma.companyReview.create({
      data: {
        ...data,
        userId: req.user!.id
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profile: {
              select: {
                headline: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create review'
    });
  }
});

// Update review
reviewsRouter.put('/:id', requireAuth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const data = UpdateReviewSchema.parse(req.body);

    const review = await prisma.companyReview.findFirst({
      where: {
        id: reviewId,
        userId: req.user!.id
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    const updatedReview = await prisma.companyReview.update({
      where: { id: reviewId },
      data,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profile: {
              select: {
                headline: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedReview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update review'
    });
  }
});

// Delete review
reviewsRouter.delete('/:id', requireAuth, async (req, res) => {
  try {
    const reviewId = req.params.id;

    const review = await prisma.companyReview.findFirst({
      where: {
        id: reviewId,
        userId: req.user!.id
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    await prisma.companyReview.delete({
      where: { id: reviewId }
    });

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete review'
    });
  }
});

// Get review by ID
reviewsRouter.get('/:id', async (req, res) => {
  try {
    const review = await prisma.companyReview.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profile: {
              select: {
                headline: true
              }
            }
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        }
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch review'
    });
  }
});

// Like/Unlike review
reviewsRouter.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user!.id;

    const existingLike = await prisma.reviewLike.findFirst({
      where: {
        reviewId,
        userId
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.reviewLike.delete({
        where: { id: existingLike.id }
      });
      
      res.json({
        success: true,
        message: 'Review unliked',
        liked: false
      });
    } else {
      // Like
      await prisma.reviewLike.create({
        data: {
          reviewId,
          userId
        }
      });
      
      res.json({
        success: true,
        message: 'Review liked',
        liked: true
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to like/unlike review'
    });
  }
});

// Report review
reviewsRouter.post('/:id/report', requireAuth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { reason, description } = req.body;

    const report = await prisma.reviewReport.create({
      data: {
        reviewId,
        reporterId: req.user!.id,
        reason,
        description
      }
    });

    res.status(201).json({
      success: true,
      data: report,
      message: 'Review reported successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to report review'
    });
  }
});
