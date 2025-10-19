import { Router } from 'express';
import { JobRequirementController } from './controller.js';
import { AuthMiddleware } from '../../../middlewares/auth.js';

const router = Router();
const jobRequirementController = new JobRequirementController();

// Tất cả routes đều cần authentication
router.use(AuthMiddleware.authenticate);

// Job Requirements routes
router.post('/', jobRequirementController.createJobRequirement.bind(jobRequirementController));
router.get('/', jobRequirementController.getJobRequirements.bind(jobRequirementController));
router.get('/:requirementId', jobRequirementController.getJobRequirementById.bind(jobRequirementController));
router.put('/:requirementId', jobRequirementController.updateJobRequirement.bind(jobRequirementController));
router.delete('/:requirementId', jobRequirementController.deleteJobRequirement.bind(jobRequirementController));

export default router;
