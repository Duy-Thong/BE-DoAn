import { Router } from 'express';
import { JobRequirementController } from './controller.js';
import { requireAuth } from '../../../middlewares/auth.js';

const router = Router();
const jobRequirementController = new JobRequirementController();

// Tất cả routes đều cần authentication
router.use(requireAuth);

// Job Requirements routes
router.post('/:jobId/requirements', jobRequirementController.createJobRequirement.bind(jobRequirementController));
router.get('/:jobId/requirements', jobRequirementController.getJobRequirements.bind(jobRequirementController));
router.get('/:jobId/requirements/:requirementId', jobRequirementController.getJobRequirementById.bind(jobRequirementController));
router.put('/:jobId/requirements/:requirementId', jobRequirementController.updateJobRequirement.bind(jobRequirementController));
router.delete('/:jobId/requirements/:requirementId', jobRequirementController.deleteJobRequirement.bind(jobRequirementController));

export default router;
