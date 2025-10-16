import { Router } from 'express';
import { WorkExperienceController } from './controller.js';
import { requireAuth } from '../../../middlewares/auth.js';

const router = Router();
const workExperienceController = new WorkExperienceController();

// Tất cả routes đều cần authentication
router.use(requireAuth);

// Work Experience routes
router.post('/:cvId/work-experience', workExperienceController.createWorkExperience.bind(workExperienceController));
router.get('/:cvId/work-experience', workExperienceController.getWorkExperiences.bind(workExperienceController));
router.get('/:cvId/work-experience/:workExperienceId', workExperienceController.getWorkExperienceById.bind(workExperienceController));
router.put('/:cvId/work-experience/:workExperienceId', workExperienceController.updateWorkExperience.bind(workExperienceController));
router.delete('/:cvId/work-experience/:workExperienceId', workExperienceController.deleteWorkExperience.bind(workExperienceController));

export default router;
