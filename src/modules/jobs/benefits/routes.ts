import { Router } from 'express';
import { JobBenefitController } from './controller.js';
import { AuthMiddleware } from '../../../middlewares/auth.js';

const router = Router();
const jobBenefitController = new JobBenefitController();

// Tất cả routes đều cần authentication
router.use(AuthMiddleware.authenticate);

// Job Benefits routes
router.post('/', jobBenefitController.createJobBenefit.bind(jobBenefitController));
router.get('/', jobBenefitController.getJobBenefits.bind(jobBenefitController));
router.get('/:benefitId', jobBenefitController.getJobBenefitById.bind(jobBenefitController));
router.put('/:benefitId', jobBenefitController.updateJobBenefit.bind(jobBenefitController));
router.delete('/:benefitId', jobBenefitController.deleteJobBenefit.bind(jobBenefitController));

export default router;
