import type { Request, Response } from 'express';
import { ApplicationsService } from './service.js';
import { CreateApplicationDto, UpdateApplicationDto, UpdateApplicationStatusDto } from './dto.js';
import { ResponseUtils } from '../../utils/response.js';
import { AppError, NotFoundError, ValidationError } from '../../utils/error.js';

const service = new ApplicationsService();

/**
 * List all applications (Admin only)
 */
export const listApplications = async (_req: Request, res: Response) => {
  try {
    const applications = await service.list();
    ResponseUtils.success(res, applications);
  } catch (error) {
    ResponseUtils.internalError(res, 'Lỗi khi lấy danh sách đơn ứng tuyển');
  }
};

/**
 * Get application by ID
 */
export const getApplication = async (req: Request, res: Response) => {
  try {
    const application = await service.getById(req.params.id!);
    if (!application) {
      return ResponseUtils.notFound(res, 'Không tìm thấy đơn ứng tuyển');
    }
    ResponseUtils.success(res, application);
  } catch (error) {
    ResponseUtils.internalError(res, 'Lỗi khi lấy thông tin đơn ứng tuyển');
  }
};

/**
 * Create new application (Candidate)
 */
export const createApplication = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return ResponseUtils.unauthorized(res, 'Vui lòng đăng nhập');
    }

    const input = CreateApplicationDto.parse(req.body);
    const application = await service.create(userId, input);

    ResponseUtils.created(res, application, 'Ứng tuyển thành công');
  } catch (error) {
    if (error instanceof ValidationError) {
      return ResponseUtils.badRequest(res, error.message);
    }
    if (error instanceof AppError) {
      return ResponseUtils.error(res, error.message, error.statusCode);
    }
    ResponseUtils.internalError(res, error instanceof Error ? error.message : 'Lỗi khi tạo đơn ứng tuyển');
  }
};

/**
 * Update application (Candidate - only own applications)
 */
export const updateApplication = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return ResponseUtils.unauthorized(res, 'Vui lòng đăng nhập');
    }

    const input = UpdateApplicationDto.parse(req.body);
    const application = await service.update(req.params.id!, userId, input);

    ResponseUtils.success(res, application, 'Cập nhật đơn ứng tuyển thành công');
  } catch (error) {
    if (error instanceof ValidationError) {
      return ResponseUtils.badRequest(res, error.message);
    }
    if (error instanceof NotFoundError) {
      return ResponseUtils.notFound(res, error.message);
    }
    if (error instanceof AppError) {
      return ResponseUtils.error(res, error.message, error.statusCode);
    }
    ResponseUtils.internalError(res, error instanceof Error ? error.message : 'Lỗi khi cập nhật đơn ứng tuyển');
  }
};

/**
 * Delete application (Candidate - only own applications)
 */
export const deleteApplication = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return ResponseUtils.unauthorized(res, 'Vui lòng đăng nhập');
    }

    await service.delete(req.params.id!, userId);

    ResponseUtils.success(res, null, 'Xóa đơn ứng tuyển thành công');
  } catch (error) {
    if (error instanceof NotFoundError) {
      return ResponseUtils.notFound(res, error.message);
    }
    if (error instanceof AppError) {
      return ResponseUtils.error(res, error.message, error.statusCode);
    }
    ResponseUtils.internalError(res, error instanceof Error ? error.message : 'Lỗi khi xóa đơn ứng tuyển');
  }
};

/**
 * Update application status (Recruiter/Company)
 */
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return ResponseUtils.unauthorized(res, 'Vui lòng đăng nhập');
    }

    const input = UpdateApplicationStatusDto.parse(req.body);
    const application = await service.updateStatus(req.params.id!, userId, input);

    ResponseUtils.success(res, application, 'Cập nhật trạng thái đơn ứng tuyển thành công');
  } catch (error) {
    if (error instanceof ValidationError) {
      return ResponseUtils.badRequest(res, error.message);
    }
    if (error instanceof NotFoundError) {
      return ResponseUtils.notFound(res, error.message);
    }
    if (error instanceof AppError) {
      return ResponseUtils.error(res, error.message, error.statusCode);
    }
    ResponseUtils.internalError(res, error instanceof Error ? error.message : 'Lỗi khi cập nhật trạng thái');
  }
};

/**
 * Get user's applications (Candidate - own applications)
 */
export const getUserApplications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return ResponseUtils.unauthorized(res, 'Vui lòng đăng nhập');
    }

    const applications = await service.getUserApplications(userId);
    ResponseUtils.success(res, applications);
  } catch (error) {
    ResponseUtils.internalError(res, 'Lỗi khi lấy danh sách đơn ứng tuyển');
  }
};

/**
 * Get applications for a job (Recruiter/Company)
 */
export const getJobApplications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { jobId } = req.params;

    if (!userId) {
      return ResponseUtils.unauthorized(res, 'Vui lòng đăng nhập');
    }

    const applications = await service.getJobApplications(jobId, userId);
    ResponseUtils.success(res, applications);
  } catch (error) {
    if (error instanceof AppError) {
      return ResponseUtils.error(res, error.message, error.statusCode);
    }
    ResponseUtils.internalError(res, error instanceof Error ? error.message : 'Lỗi khi lấy danh sách đơn ứng tuyển');
  }
};
