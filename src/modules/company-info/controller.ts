import { Request, Response } from 'express';
import { CompanyInfoService } from './service.js';
import { getCompanyInfoDto, getCompanyJobsDto } from './dto.js';

const companyInfoService = new CompanyInfoService();

export class CompanyInfoController {
  // Lấy thông tin chi tiết công ty
  async getCompanyInfo(req: Request, res: Response) {
    try {
      const data = getCompanyInfoDto.parse({
        companyId: req.params.companyId
      });

      const company = await companyInfoService.getCompanyInfo(data);

      res.json({
        success: true,
        data: company
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch company info'
      });
    }
  }

  // Lấy danh sách việc làm của công ty
  async getCompanyJobs(req: Request, res: Response) {
    try {
      const data = getCompanyJobsDto.parse({
        companyId: req.params.companyId,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        type: req.query.type as any
      });

      const result = await companyInfoService.getCompanyJobs(data);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch company jobs'
      });
    }
  }

  // Tìm kiếm công ty
  async searchCompanies(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      const result = await companyInfoService.searchCompanies(query, page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to search companies'
      });
    }
  }

  // Lấy danh sách công ty nổi bật
  async getFeaturedCompanies(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const companies = await companyInfoService.getFeaturedCompanies(limit);

      res.json({
        success: true,
        data: companies
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch featured companies'
      });
    }
  }
}
