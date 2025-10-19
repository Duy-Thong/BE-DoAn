import { Router } from 'express';
import { JobSkillController } from './controller.js';
import { AuthMiddleware } from '../../../middlewares/auth.js';

const router = Router();
const jobSkillController = new JobSkillController();

// Tất cả routes đều cần authentication
router.use(AuthMiddleware.authenticate);

// Job Skills routes
router.post('/', jobSkillController.createJobSkill.bind(jobSkillController));
router.get('/', jobSkillController.getJobSkills.bind(jobSkillController));
router.get('/:skillId', jobSkillController.getJobSkillById.bind(jobSkillController));
router.put('/:skillId', jobSkillController.updateJobSkill.bind(jobSkillController));
router.delete('/:skillId', jobSkillController.deleteJobSkill.bind(jobSkillController));

export default router;
