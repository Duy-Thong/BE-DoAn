import { Router } from 'express';
import { JobSkillController } from './controller.js';
import { requireAuth } from '../../../middlewares/auth.js';

const router = Router();
const jobSkillController = new JobSkillController();

// Tất cả routes đều cần authentication
router.use(requireAuth);

// Job Skills routes
router.post('/:jobId/skills', jobSkillController.createJobSkill.bind(jobSkillController));
router.get('/:jobId/skills', jobSkillController.getJobSkills.bind(jobSkillController));
router.get('/:jobId/skills/:skillId', jobSkillController.getJobSkillById.bind(jobSkillController));
router.put('/:jobId/skills/:skillId', jobSkillController.updateJobSkill.bind(jobSkillController));
router.delete('/:jobId/skills/:skillId', jobSkillController.deleteJobSkill.bind(jobSkillController));

export default router;
