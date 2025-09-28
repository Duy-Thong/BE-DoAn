import { Router } from 'express';
import { ApplicationManagementController } from './controller.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = Router();
const applicationController = new ApplicationManagementController();

// Tất cả routes đều cần authentication
router.use(authMiddleware);

// Application management routes
// Ứng viên
router.post('/apply', applicationController.createApplication.bind(applicationController));
router.get('/my-applications', applicationController.getUserApplications.bind(applicationController));

// Nhà tuyển dụng
router.get('/company/:companyId', applicationController.getApplicationsForRecruiter.bind(applicationController));
router.put('/company/:companyId/status', applicationController.updateApplicationStatus.bind(applicationController));
router.post('/company/:companyId/note', applicationController.addInternalNote.bind(applicationController));
router.get('/company/:companyId/candidate/:candidateId', applicationController.getCandidateDetails.bind(applicationController));

export default router;
