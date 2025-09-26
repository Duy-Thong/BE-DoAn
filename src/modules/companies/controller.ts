import type { Request, Response } from 'express';
import { CompaniesService } from './service.js';
import { CreateCompanyDto, UpdateCompanyDto } from './dto.js';

const service = new CompaniesService();

export const listCompanies = async (_req: Request, res: Response) => {
  res.json({ data: await service.list() });
};

export const createCompany = async (req: Request, res: Response) => {
  const input = CreateCompanyDto.parse(req.body);
  const company = await service.create(input);
  res.status(201).json({ data: company });
};

export const getCompany = async (req: Request, res: Response) => {
  const company = await service.getById(req.params.id!);
  if (!company) return res.status(404).json({ error: { message: 'Not found', status: 404 } });
  res.json({ data: company });
};

export const updateCompany = async (req: Request, res: Response) => {
  const input = UpdateCompanyDto.parse(req.body);
  const company = await service.update(req.params.id!, input);
  res.json({ data: company });
};

export const deleteCompany = async (req: Request, res: Response) => {
  await service.remove(req.params.id!);
  res.status(204).end();
};

