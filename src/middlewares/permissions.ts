/**
 * Permission middleware
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../loaders/prisma.js';
import { AuthorizationError, NotFoundError } from '../utils/error.js';
import { USER_ROLES, COMPANY_MEMBER_ROLES } from '../utils/constants.js';

/**
 * Check if user has required role
 */
export function requireRole(roles: string | string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthorizationError('Không có quyền truy cập'));
    }

    const userRole = req.user.role;
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    if (!requiredRoles.includes(userRole)) {
      return next(new AuthorizationError('Không có quyền truy cập'));
    }

    next();
  };
}

/**
 * Check if user is admin
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole(USER_ROLES.ADMIN)(req, res, next);
}

/**
 * Check if user is recruiter or admin
 */
export function requireRecruiter(req: Request, res: Response, next: NextFunction) {
  return requireRole([USER_ROLES.RECRUITER, USER_ROLES.ADMIN])(req, res, next);
}

/**
 * Check if user owns the resource
 */
export function requireOwnership(resourceField: string = 'userId') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthorizationError('Không có quyền truy cập'));
    }

    const resourceId = req.params.id;
    if (!resourceId) {
      return next(new AuthorizationError('ID tài nguyên không hợp lệ'));
    }

    // Check if user owns the resource
    if (req.user.id !== resourceId && req.user.role !== USER_ROLES.ADMIN) {
      return next(new AuthorizationError('Không có quyền truy cập tài nguyên này'));
    }

    next();
  };
}

/**
 * Check if user is company member with required role
 */
export function requireCompanyRole(companyIdField: string = 'companyId', roles: string[] = []) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthorizationError('Không có quyền truy cập'));
    }

    const companyId = req.params[companyIdField] || req.body[companyIdField];
    if (!companyId) {
      return next(new AuthorizationError('ID công ty không hợp lệ'));
    }

    try {
      const member = await prisma.companyMember.findFirst({
        where: {
          companyId,
          userId: req.user.id,
        },
      });

      if (!member) {
        return next(new AuthorizationError('Bạn không phải là thành viên của công ty này'));
      }

      if (roles.length > 0 && !roles.includes(member.role)) {
        return next(new AuthorizationError('Không có quyền truy cập'));
      }

      // Add member info to request
      req.companyMember = member;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check if user is company owner
 */
export function requireCompanyOwner(companyIdField: string = 'companyId') {
  return requireCompanyRole(companyIdField, [COMPANY_MEMBER_ROLES.OWNER]);
}

/**
 * Check if user is company manager or owner
 */
export function requireCompanyManager(companyIdField: string = 'companyId') {
  return requireCompanyRole(companyIdField, [COMPANY_MEMBER_ROLES.OWNER, COMPANY_MEMBER_ROLES.MANAGER]);
}

/**
 * Check if user is company recruiter or higher
 */
export function requireCompanyRecruiter(companyIdField: string = 'companyId') {
  return requireCompanyRole(companyIdField, [
    COMPANY_MEMBER_ROLES.OWNER,
    COMPANY_MEMBER_ROLES.MANAGER,
    COMPANY_MEMBER_ROLES.RECRUITER,
  ]);
}

/**
 * Check if user can access job
 */
export function requireJobAccess() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthorizationError('Không có quyền truy cập'));
    }

    const jobId = req.params.jobId || req.params.id;
    if (!jobId) {
      return next(new AuthorizationError('ID công việc không hợp lệ'));
    }

    try {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
          company: {
            include: {
              members: true,
            },
          },
        },
      });

      if (!job) {
        return next(new NotFoundError('Công việc không tìm thấy'));
      }

      // Check if user is admin
      if (req.user.role === USER_ROLES.ADMIN) {
        req.job = job;
        return next();
      }

      // Check if user is company member
      const member = job.company.members.find(m => m.userId === req.user.id);
      if (member) {
        req.job = job;
        req.companyMember = member;
        return next();
      }

      // Check if job is published and user is candidate
      if (job.isActive && job.isApproved && req.user.role === USER_ROLES.CANDIDATE) {
        req.job = job;
        return next();
      }

      return next(new AuthorizationError('Không có quyền truy cập công việc này'));
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check if user can access CV
 */
export function requireCVAccess() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthorizationError('Không có quyền truy cập'));
    }

    const cvId = req.params.cvId || req.params.id;
    if (!cvId) {
      return next(new AuthorizationError('ID CV không hợp lệ'));
    }

    try {
      const cv = await prisma.cV.findUnique({
        where: { id: cvId },
      });

      if (!cv) {
        return next(new NotFoundError('CV không tìm thấy'));
      }

      // Check if user owns the CV or is admin
      if (cv.userId === req.user.id || req.user.role === USER_ROLES.ADMIN) {
        req.cv = cv;
        return next();
      }

      return next(new AuthorizationError('Không có quyền truy cập CV này'));
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check if user can access application
 */
export function requireApplicationAccess() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthorizationError('Không có quyền truy cập'));
    }

    const applicationId = req.params.id;
    if (!applicationId) {
      return next(new AuthorizationError('ID đơn ứng tuyển không hợp lệ'));
    }

    try {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          job: {
            include: {
              company: {
                include: {
                  members: true,
                },
              },
            },
          },
        },
      });

      if (!application) {
        return next(new NotFoundError('Đơn ứng tuyển không tìm thấy'));
      }

      // Check if user is admin
      if (req.user.role === USER_ROLES.ADMIN) {
        req.application = application;
        return next();
      }

      // Check if user is the applicant
      if (application.userId === req.user.id) {
        req.application = application;
        return next();
      }

      // Check if user is company member
      const member = application.job.company.members.find(m => m.userId === req.user.id);
      if (member && [COMPANY_MEMBER_ROLES.OWNER, COMPANY_MEMBER_ROLES.MANAGER, COMPANY_MEMBER_ROLES.RECRUITER].includes(member.role as any)) {
        req.application = application;
        req.companyMember = member;
        return next();
      }

      return next(new AuthorizationError('Không có quyền truy cập đơn ứng tuyển này'));
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check if user can access company
 */
export function requireCompanyAccess() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthorizationError('Không có quyền truy cập'));
    }

    const companyId = req.params.id;
    if (!companyId) {
      return next(new AuthorizationError('ID công ty không hợp lệ'));
    }

    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: {
          members: true,
        },
      });

      if (!company) {
        return next(new NotFoundError('Công ty không tìm thấy'));
      }

      // Check if user is admin
      if (req.user.role === USER_ROLES.ADMIN) {
        req.company = company;
        return next();
      }

      // Check if user is company member
      const member = company.members.find(m => m.userId === req.user.id);
      if (member) {
        req.company = company;
        req.companyMember = member;
        return next();
      }

      // Check if company is public and user is candidate
      if (company.isActive && req.user.role === USER_ROLES.CANDIDATE) {
        req.company = company;
        return next();
      }

      return next(new AuthorizationError('Không có quyền truy cập công ty này'));
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check if user can access user profile
 */
export function requireUserAccess() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthorizationError('Không có quyền truy cập'));
    }

    const userId = req.params.id;
    if (!userId) {
      return next(new AuthorizationError('ID người dùng không hợp lệ'));
    }

    // Check if user is accessing their own profile or is admin
    if (req.user.id === userId || req.user.role === USER_ROLES.ADMIN) {
      return next();
    }

    return next(new AuthorizationError('Không có quyền truy cập thông tin người dùng này'));
  };
}

/**
 * Check if user can access notification
 */
export function requireNotificationAccess() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthorizationError('Không có quyền truy cập'));
    }

    const notificationId = req.params.id;
    if (!notificationId) {
      return next(new AuthorizationError('ID thông báo không hợp lệ'));
    }

    try {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        return next(new NotFoundError('Thông báo không tìm thấy'));
      }

      // Check if user is admin or owns the notification
      if (req.user.role === USER_ROLES.ADMIN || notification.userId === req.user.id) {
        req.notification = notification;
        return next();
      }

      return next(new AuthorizationError('Không có quyền truy cập thông báo này'));
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check if user can access file upload
 */
export function requireFileAccess() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthorizationError('Không có quyền truy cập'));
    }

    const fileId = req.params.id;
    if (!fileId) {
      return next(new AuthorizationError('ID file không hợp lệ'));
    }

    try {
      const file = await prisma.upload.findUnique({
        where: { id: fileId },
      });

      if (!file) {
        return next(new NotFoundError('File không tìm thấy'));
      }

      // Check if user is admin or owns the file
      if (req.user.role === USER_ROLES.ADMIN || file.uploadedBy === req.user.id) {
        req.upload = file;
        return next();
      }

      return next(new AuthorizationError('Không có quyền truy cập file này'));
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check if user can access AI service
 */
export function requireAIAccess() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthorizationError('Không có quyền truy cập'));
    }

    // Check if user has AI access (can be extended with specific permissions)
    if (req.user.role === USER_ROLES.ADMIN || req.user.role === USER_ROLES.CANDIDATE) {
      return next();
    }

    return next(new AuthorizationError('Không có quyền truy cập dịch vụ AI'));
  };
}

/**
 * Check if user can access admin functions
 */
export function requireAdminAccess() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthorizationError('Không có quyền truy cập'));
    }

    if (req.user.role !== USER_ROLES.ADMIN) {
      return next(new AuthorizationError('Chỉ quản trị viên mới có quyền truy cập'));
    }

    next();
  };
}

/**
 * Check if user can access recruiter functions
 */
export function requireRecruiterAccess() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthorizationError('Không có quyền truy cập'));
    }

    if (![USER_ROLES.ADMIN, USER_ROLES.RECRUITER].includes(req.user.role as any)) {
      return next(new AuthorizationError('Chỉ nhà tuyển dụng mới có quyền truy cập'));
    }

    next();
  };
}

/**
 * Check if user can access candidate functions
 */
export function requireCandidateAccess() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthorizationError('Không có quyền truy cập'));
    }

    if (![USER_ROLES.ADMIN, USER_ROLES.CANDIDATE].includes(req.user.role as any)) {
      return next(new AuthorizationError('Chỉ ứng viên mới có quyền truy cập'));
    }

    next();
  };
}

/**
 * Check if user can access public resources
 */
export function requirePublicAccess() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Public access - no authentication required
    next();
  };
}

/**
 * Check if user can access authenticated resources
 */
export function authenticatedAccess() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthorizationError('Cần đăng nhập để truy cập'));
    }

    next();
  };
}
