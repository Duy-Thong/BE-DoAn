import { Router } from 'express';
import { prisma } from '../../loaders/prisma.js';
import { requireAuth } from '../../middlewares/auth.js';

export const searchRouter = Router();

// Search Jobs (Public)
searchRouter.get('/jobs', async (req, res) => {
  try {
    const q = (req.query.q as string) || '';
    const location = (req.query.location as string) || undefined;
    const type = (req.query.type as string) || undefined;
    const experience = (req.query.experience as string) || undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      isApproved: true,
      AND: [
        q ? { 
          OR: [
            { title: { contains: q, mode: 'insensitive' as const } }, 
            { description: { contains: q, mode: 'insensitive' as const } },
            { requirements: { contains: q, mode: 'insensitive' as const } }
          ] 
        } : {},
        location ? { location: { contains: location, mode: 'insensitive' as const } } : {},
        type ? { type: type as any } : {},
        experience ? { experienceLevel: experience as any } : {},
      ],
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.job.count({ where })
    ]);

    res.json({ 
      success: true,
      data: jobs,
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
      error: 'Search failed'
    });
  }
});

// Search Companies (Public)
searchRouter.get('/companies', async (req, res) => {
  try {
    const q = (req.query.q as string) || '';
    const industry = (req.query.industry as string) || undefined;
    const size = (req.query.size as string) || undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      AND: [
        q ? { 
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } }, 
            { description: { contains: q, mode: 'insensitive' as const } },
            { industry: { contains: q, mode: 'insensitive' as const } }
          ] 
        } : {},
        industry ? { industry: { contains: industry, mode: 'insensitive' as const } } : {},
        size ? { companySize: size as any } : {},
      ],
    };

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              jobs: {
                where: { isActive: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.company.count({ where })
    ]);

    res.json({ 
      success: true,
      data: companies,
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
      error: 'Search failed'
    });
  }
});

// Search Users (Auth Required)
searchRouter.get('/users', requireAuth, async (req, res) => {
  try {
    const q = (req.query.q as string) || '';
    const role = (req.query.role as string) || undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where = {
      AND: [
        q ? { 
          OR: [
            { fullName: { contains: q, mode: 'insensitive' as const } }, 
            { email: { contains: q, mode: 'insensitive' as const } }
          ] 
        } : {},
        role ? { role: role as any } : {},
      ],
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          phoneNumber: true,
          createdAt: true,
          profile: {
            select: {
              headline: true,
              location: true,
              experience: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({ 
      success: true,
      data: users,
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
      error: 'Search failed'
    });
  }
});

