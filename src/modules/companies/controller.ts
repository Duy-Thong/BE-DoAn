import type { Request, Response } from 'express';
import { CompaniesService } from './service.js';
import { CreateCompanyDto, UpdateCompanyDto } from './dto.js';

const service = new CompaniesService();

export const listCompanies = async (_req: Request, res: Response) => {
  try {
    const companies = await service.list();
    res.json({ 
      success: true,
      data: companies 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch companies'
    });
  }
};

export const createCompany = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const input = CreateCompanyDto.parse(req.body);
    const company = await service.create(input, userId);
    res.status(201).json({ 
      success: true,
      data: company,
      message: 'Company created successfully. Waiting for verification.'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create company'
    });
  }
};

export const getCompany = async (req: Request, res: Response) => {
  try {
    const company = await service.getById(req.params.id!);
    if (!company) {
      return res.status(404).json({ 
        success: false,
        error: 'Company not found' 
      });
    }
    res.json({ 
      success: true,
      data: company 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company'
    });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const input = UpdateCompanyDto.parse(req.body);
    const company = await service.update(req.params.id!, input, userId);
    res.json({ 
      success: true,
      data: company,
      message: 'Company updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update company'
    });
  }
};

export const deleteCompany = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await service.remove(req.params.id!, userId);
    res.json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete company'
    });
  }
};

// Lấy danh sách companies của user
export const getUserCompanies = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const companies = await service.getUserCompanies(userId);
    res.json({
      success: true,
      data: companies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user companies'
    });
  }
};

