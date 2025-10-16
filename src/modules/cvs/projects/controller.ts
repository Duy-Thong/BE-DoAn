import { Request, Response } from 'express';
import { ProjectService } from './service.js';
import { createProjectDto, updateProjectDto } from './dto.js';

const service = new ProjectService();

export class ProjectController {
  async create(req: Request, res: Response) {
    try {
      const { cvId } = req.params;
      const data = createProjectDto.parse(req.body);
      const project = await service.createProject(cvId, data);
      res.status(201).json({ 
        success: true,
        data: project,
        message: 'Tạo dự án thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo dự án'
      });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const { cvId } = req.params;
      const projects = await service.getProjects(cvId);
      res.json({ 
        success: true,
        data: projects 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy danh sách dự án'
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { cvId, id } = req.params;
      const project = await service.getProjectById(cvId, id);
      if (!project) {
        return res.status(404).json({ 
          success: false,
          error: 'Dự án không tìm thấy' 
        });
      }
      res.json({ 
        success: true,
        data: project 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy thông tin dự án'
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { cvId, id } = req.params;
      const data = updateProjectDto.parse(req.body);
      const project = await service.updateProject(cvId, id, data);
      res.json({ 
        success: true,
        data: project,
        message: 'Cập nhật dự án thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể cập nhật dự án'
      });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { cvId, id } = req.params;
      await service.deleteProject(cvId, id);
      res.json({
        success: true,
        message: 'Xóa dự án thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể xóa dự án'
      });
    }
  }
}
