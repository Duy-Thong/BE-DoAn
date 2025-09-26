import type { Request, Response } from 'express';
import { UsersService } from './service.js';
import { CreateUserDto, UpdateUserDto } from './dto.js';

const service = new UsersService();

export const listUsers = async (_req: Request, res: Response) => {
  const users = await service.list();
  res.json({ data: users });
};

export const createUser = async (req: Request, res: Response) => {
  const input = CreateUserDto.parse(req.body);
  const user = await service.create(input);
  res.status(201).json({ data: user });
};

export const getUser = async (req: Request, res: Response) => {
  const user = await service.getById(req.params.id!);
  if (!user) return res.status(404).json({ error: { message: 'Not found', status: 404 } });
  res.json({ data: user });
};

export const updateUser = async (req: Request, res: Response) => {
  const input = UpdateUserDto.parse(req.body);
  const user = await service.update(req.params.id!, input);
  res.json({ data: user });
};

export const deleteUser = async (req: Request, res: Response) => {
  await service.remove(req.params.id!);
  res.status(204).end();
};

