import { Router } from 'express';
import { prisma } from '../../loaders/prisma.js';

export const searchRouter = Router();

searchRouter.get('/jobs', async (req, res) => {
  const q = (req.query.q as string) || '';
  const location = (req.query.location as string) || undefined;
  const type = (req.query.type as string) || undefined;
  const jobs = await prisma.job.findMany({
    where: {
      isActive: true,
      AND: [
        q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] } : {},
        location ? { location: { contains: location, mode: 'insensitive' } } : {},
        type ? { type: type as any } : {},
      ],
    },
    select: { id: true, title: true, location: true, type: true, companyId: true },
  });
  res.json({ data: jobs });
});

