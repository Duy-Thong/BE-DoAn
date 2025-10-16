import { prisma } from '../../loaders/prisma.js';
import { CreateReviewDto, UpdateReviewDto } from './dto.js';

export class ReviewService {
  async createReview(userId: string, data: CreateReviewDto) {
    // Check if user has already reviewed this company
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        companyId: data.companyId,
      },
    });

    if (existingReview) {
      throw new Error('Bạn đã đánh giá công ty này rồi');
    }

    return prisma.review.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async getReviews(companyId: string, options: {
    page?: number;
    limit?: number;
    rating?: number;
  } = {}) {
    const { page = 1, limit = 10, rating } = options;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (rating) where.rating = rating;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getReviewById(id: string) {
    return prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    });
  }

  async updateReview(userId: string, id: string, data: UpdateReviewDto) {
    const existing = await prisma.review.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Review not found or access denied');
    }

    return prisma.review.update({
      where: { id },
      data,
    });
  }

  async deleteReview(userId: string, id: string) {
    const existing = await prisma.review.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Review not found or access denied');
    }

    return prisma.review.delete({
      where: { id },
    });
  }

  async getCompanyReviewStats(companyId: string) {
    const [total, average, byRating] = await Promise.all([
      prisma.review.count({ where: { companyId } }),
      prisma.review.aggregate({
        where: { companyId },
        _avg: { rating: true },
      }),
      prisma.review.groupBy({
        by: ['rating'],
        where: { companyId },
        _count: { rating: true },
      }),
    ]);

    return {
      total,
      average: average._avg.rating || 0,
      byRating: byRating.reduce((acc, item) => {
        acc[item.rating] = item._count.rating;
        return acc;
      }, {} as Record<number, number>),
    };
  }

  async getUserReviews(userId: string) {
    return prisma.review.findMany({
      where: { userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRecentReviews(limit: number = 10) {
    return prisma.review.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
