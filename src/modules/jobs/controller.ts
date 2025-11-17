import type { Request, Response } from 'express';
import { JobsService } from './service.js';
import { CreateJobDto, UpdateJobDto, RepostJobDto, JobQueryDto } from './dto.js';
import { aiConfig } from '../../config/ai.js';

const service = new JobsService();

export const listJobs = async (req: Request, res: Response) => {
  try {
    // Parse query parameters
    const query = JobQueryDto.parse(req.query);
    
    // Get user ID from query parameter (optional)
    const userId = query.userId;
    let jobIds: string[] | undefined;

    // If userId is provided, call AI service to get job recommendations first
    if (userId) {
      try {
        // Get k parameter from query, default to 5
        const k = query.limit ? Math.min(query.limit, 50) : 5; // Limit k to max 50
        
        // Call AI service to get job recommendations
        // Endpoint: /api/recommendations/{userId}?k=5
        const aiUrl = `${aiConfig.AI_SERVICE_URL}/api/recommendations/${userId}?k=${k}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), aiConfig.AI_SERVICE_TIMEOUT);
        
        try {
          const aiResponse = await fetch(aiUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            // Extract job IDs from AI response
            // AI response format: { jobIds: string[] } or similar
            if (aiData.jobIds && Array.isArray(aiData.jobIds)) {
              jobIds = aiData.jobIds;
            } else if (Array.isArray(aiData)) {
              // If response is array of job IDs directly
              jobIds = aiData;
            }
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          throw fetchError;
        }
      } catch (aiError) {
        // If AI service fails, log error but continue with normal query
        console.warn('AI recommendation service failed, falling back to normal query:', aiError);
        // Continue without jobIds - will use normal query
      }
    }

    // Query database with job IDs from AI (if available) or use normal query
    let result;
    if (jobIds && jobIds.length > 0) {
      // Query jobs by IDs from AI recommendations
      const jobs = await service.getByIds(jobIds);
      
      // Apply pagination
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;
      const paginatedJobs = jobs.slice(skip, skip + limit);
      
      result = {
        data: paginatedJobs,
        meta: {
          total: jobs.length,
          page,
          limit,
          totalPages: Math.ceil(jobs.length / limit)
        }
      };
    } else {
      // Normal query
      result = await service.list({
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
    }
    
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

