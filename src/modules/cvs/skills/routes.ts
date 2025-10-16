import { Router } from 'express';
import { CVSkillController } from './controller.js';
import { requireAuth } from '../../../middlewares/auth.js';

const router = Router();
const cvSkillController = new CVSkillController();

// Tất cả routes đều cần authentication
router.use(requireAuth);

// CV Skills routes
router.post('/:cvId/skills', cvSkillController.createCVSkill.bind(cvSkillController));
router.get('/:cvId/skills', cvSkillController.getCVSkills.bind(cvSkillController));
router.get('/:cvId/skills/:skillId', cvSkillController.getCVSkillById.bind(cvSkillController));
router.put('/:cvId/skills/:skillId', cvSkillController.updateCVSkill.bind(cvSkillController));
router.delete('/:cvId/skills/:skillId', cvSkillController.deleteCVSkill.bind(cvSkillController));

export default router;
