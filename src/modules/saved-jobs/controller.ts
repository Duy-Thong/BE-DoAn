import { Request, Response } from 'express';
import { SavedJobService } from './service.js';
import { CreateSavedJobDto, UpdateSavedJobDto } from './dto.js';

export class SavedJobController {
  private savedJobService: SavedJobService;

  constructor() {
    this.savedJobService = new SavedJobService();
  }

  async createSavedJob(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const data: CreateSavedJobDto = req.body;
      const savedJob = await this.savedJobService.createSavedJob(userId, data);

      res.status(201).json({
        success: true,
        data: savedJob,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save job',
      });
    }
  }

  async getSavedJobs(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.savedJobService.getSavedJobs(userId, { page, limit });

      res.json({
        success: true,
        data: result.savedJobs,
        pagination: result.pagination,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch saved jobs',
      });
    }
  }

  async getSavedJobById(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { id } = req.params;
      const savedJob = await this.savedJobService.getSavedJobById(userId, id);

      if (!savedJob) {
        return res.status(404).json({
          success: false,
          error: 'Saved job not found',
        });
      }

      res.json({
        success: true,
        data: savedJob,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch saved job',
      });
    }
  }

  async deleteSavedJob(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { id } = req.params;
      await this.savedJobService.deleteSavedJob(userId, id);

      res.json({
        success: true,
        message: 'Saved job deleted successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete saved job',
      });
    }
  }

  async deleteSavedJobByJobId(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { jobId } = req.params;
      await this.savedJobService.deleteSavedJobByJobId(userId, jobId);

      res.json({
        success: true,
        message: 'Saved job deleted successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete saved job',
      });
    }
  }

  async isJobSaved(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { jobId } = req.params;
      const isSaved = await this.savedJobService.isJobSaved(userId, jobId);

      res.json({
        success: true,
        data: { isSaved },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to check saved status',
      });
    }
  }

  async getSavedJobCount(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const count = await this.savedJobService.getSavedJobCount(userId);

      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get saved job count',
      });
    }
  }
}
