import type { Request, Response } from 'express';
import { ApplicationsService } from './service.js';
import { CreateApplicationDto, UpdateApplicationStatusDto } from './dto.js';

const service = new ApplicationsService();

export const listApplications = async (_req: Request, res: Response) => {
  res.json({ data: await service.list() });
};

export const createApplication = async (req: Request, res: Response) => {
  const input = CreateApplicationDto.parse(req.body);
  const app = await service.create(req.user!.id, input);
  res.status(201).json({ data: app });
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  const input = UpdateApplicationStatusDto.parse(req.body);
  const app = await service.updateStatus(req.params.id!, input.status);
  res.json({ data: app });
};

