import { Router } from 'express';
import { AdminController } from './controller.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = Router();
const adminController = new AdminController();

// Middleware kiểm tra quyền admin
const adminMiddleware = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin role required.'
    });
  }
  next();
};

// Tất cả routes đều cần authentication và admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Admin management routes
router.get('/dashboard', adminController.getDashboardStats.bind(adminController));

// User management
router.get('/users', adminController.getUsers.bind(adminController));
router.put('/users/status', adminController.updateUserStatus.bind(adminController));
router.delete('/users', adminController.deleteUser.bind(adminController));

// Job management
router.get('/jobs', adminController.getJobs.bind(adminController));
router.put('/jobs/approve', adminController.approveJob.bind(adminController));

// Company management
router.get('/companies', adminController.getCompanies.bind(adminController));
router.put('/companies/verify', adminController.verifyCompany.bind(adminController));

export default router;
