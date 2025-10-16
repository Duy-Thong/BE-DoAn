import { Router } from 'express';
import { JobBenefitController } from './controller.js';
import { requireAuth } from '../../../middlewares/auth.js';

const router = Router();
const jobBenefitController = new JobBenefitController();

// Tất cả routes đều cần authentication
router.use(requireAuth);

// Job Benefits routes
router.post('/:jobId/benefits', jobBenefitController.createJobBenefit.bind(jobBenefitController));
router.get('/:jobId/benefits', jobBenefitController.getJobBenefits.bind(jobBenefitController));
router.get('/:jobId/benefits/:benefitId', jobBenefitController.getJobBenefitById.bind(jobBenefitController));
router.put('/:jobId/benefits/:benefitId', jobBenefitController.updateJobBenefit.bind(jobBenefitController));
router.delete('/:jobId/benefits/:benefitId', jobBenefitController.deleteJobBenefit.bind(jobBenefitController));

export default router;
