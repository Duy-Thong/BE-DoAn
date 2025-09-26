import type { Request, Response } from 'express';
import { ProfilesService } from './service.js';
import { UpsertProfileDto } from './dto.js';

const service = new ProfilesService();

export const getProfile = async (req: Request, res: Response) => {
  const profile = await service.get(req.user!.id);
  res.json({ data: profile });
};

export const upsertProfile = async (req: Request, res: Response) => {
  const input = UpsertProfileDto.parse(req.body);
  const profile = await service.upsert(req.user!.id, input);
  res.json({ data: profile });
};

