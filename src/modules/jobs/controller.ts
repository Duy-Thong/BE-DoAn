import type { Request, Response } from 'express';
import { JobsService } from './service.js';
import { CreateJobDto, UpdateJobDto } from './dto.js';

const service = new JobsService();

export const listJobs = async (_req: Request, res: Response) => {
  res.json({ data: await service.list() });
};

export const createJob = async (req: Request, res: Response) => {
  const input = CreateJobDto.parse(req.body);
  const job = await service.create(input);
  res.status(201).json({ data: job });
};

export const getJob = async (req: Request, res: Response) => {
  const job = await service.getById(req.params.id!);
  if (!job) return res.status(404).json({ error: { message: 'Not found', status: 404 } });
  res.json({ data: job });
};

export const updateJob = async (req: Request, res: Response) => {
  const input = UpdateJobDto.parse(req.body);
  const job = await service.update(req.params.id!, input);
  res.json({ data: job });
};

export const deleteJob = async (req: Request, res: Response) => {
  await service.remove(req.params.id!);
  res.status(204).end();
};

