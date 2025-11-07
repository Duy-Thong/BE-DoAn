import type { Request, Response } from 'express';
import { JobsService } from './service.js';
import { CreateJobDto, UpdateJobDto, RepostJobDto, JobQueryDto } from './dto.js';

const service = new JobsService();

export const listJobs = async (req: Request, res: Response) => {
  try {
    // Parse query parameters
    const query = JobQueryDto.parse(req.query);
    
    const result = await service.list({
      page: query.page,
      limit: query.limit,
      search: query.search,
      location: query.location,
      industry: query.industry,
      experienceLevel: query.experienceLevel,
      type: query.type,
      isActive: query.isActive,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    });
    
    res.json({ 
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch jobs'
    });
  }
};

export const createJob = async (req: Request, res: Response) => {
  try {
    const input = CreateJobDto.parse(req.body);
    const job = await service.create(input);
    res.status(201).json({ 
      success: true,
      data: job,
      message: 'Job created successfully. Waiting for approval.'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create job'
    });
  }
};

export const getJob = async (req: Request, res: Response) => {
  try {
    const job = await service.getById(req.params.id!);
    if (!job) {
      return res.status(404).json({ 
        success: false,
        error: 'Job not found' 
      });
    }
    res.json({ 
      success: true,
      data: job 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job'
    });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const input = UpdateJobDto.parse(req.body);
    const job = await service.update(req.params.id!, input);
    res.json({ 
      success: true,
      data: job,
      message: 'Job updated successfully. Waiting for approval.'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update job'
    });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    await service.remove(req.params.id!);
    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete job'
    });
  }
};

// Tái đăng tin tuyển dụng
export const repostJob = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { companyId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const input = RepostJobDto.parse(req.body);
    const job = await service.repostJob(companyId, userId, input);
    
    res.json({
      success: true,
      data: job,
      message: 'Job reposted successfully. Waiting for approval.'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to repost job'
    });
  }
};

// Lấy danh sách jobs của công ty (cho HR - tất cả jobs)
export const getCompanyJobs = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { companyId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Parse query params
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
    
    // Parse isActive filter (nếu có)
    let isActive: boolean | undefined;
    if (req.query.isActive !== undefined) {
      isActive = req.query.isActive === 'true';
    }

    const result = await service.getCompanyJobs(companyId, userId, {
      page,
      limit,
      sortBy,
      sortOrder,
      isActive
    });
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch company jobs'
    });
  }
};

