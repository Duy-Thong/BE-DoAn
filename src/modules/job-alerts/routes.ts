import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middlewares/auth.js';
import { prisma } from '../../loaders/prisma.js';

export const jobAlertsRouter = Router();

const UpsertAlert = z.object({ keywords: z.string().optional(), location: z.string().optional(), type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']).optional() });

jobAlertsRouter.get('/', requireAuth, async (req, res) => {
  const items = await prisma.jobAlert.findMany({ where: { userId: req.user!.id } });
  res.json({ data: items });
});

jobAlertsRouter.put('/', requireAuth, async (req, res) => {
  const input = UpsertAlert.parse(req.body);
  const existing = await prisma.jobAlert.findFirst({ where: { userId: req.user!.id } });
  let alert;
  if (existing) {
    const data: any = {};
    if (input.keywords !== undefined) data.keywords = input.keywords ?? null;
    if (input.location !== undefined) data.location = input.location ?? null;
    if (input.type !== undefined) data.type = input.type as any;
    alert = await prisma.jobAlert.update({ where: { id: existing.id }, data });
  } else {
    alert = await prisma.jobAlert.create({
      data: {
        userId: req.user!.id,
        keywords: input.keywords ?? null,
        location: input.location ?? null,
        type: (input.type as any) ?? null,
      },
    });
  }
  res.json({ data: alert });
});

