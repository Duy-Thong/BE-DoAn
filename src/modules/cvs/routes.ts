import { Router } from 'express';
import { CVController } from './controller.js';
import { AuthMiddleware } from '../../middlewares/auth.js';

const router = Router();
const cvController = new CVController();

// Tất cả routes đều cần authentication
router.use(AuthMiddleware.authenticate);

// CV management routes
router.post('/', cvController.createCompleteCV.bind(cvController)); // Chỉ dùng Complete API
router.get('/', cvController.getUserCVs.bind(cvController));
router.get('/main', cvController.getMainCV.bind(cvController));
router.get('/main/download', cvController.downloadMainCV.bind(cvController)); // Download main CV as PDF
router.get('/templates', cvController.getTemplates.bind(cvController)); // Get available templates
router.get('/:cvId', cvController.getCVById.bind(cvController));
router.get('/:cvId/download', cvController.downloadCV.bind(cvController)); // Download CV as PDF
router.put('/:cvId', cvController.updateCompleteCV.bind(cvController)); // Chỉ dùng Complete API
router.delete('/:cvId', cvController.deleteCV.bind(cvController));
router.post('/set-main', cvController.setMainCV.bind(cvController));

// CV nested submodules routes
import workExperienceRoutes from './work-experience/routes.js';
import educationRoutes from './education/routes.js';
import languagesRoutes from './languages/routes.js';
import skillsRoutes from './skills/routes.js';
import certificationsRoutes from './certifications/routes.js';
import projectsRoutes from './projects/routes.js';
import achievementsRoutes from './achievements/routes.js';
import referencesRoutes from './references/routes.js';
import activitiesRoutes from './activities/routes.js';
import socialMediaRoutes from './social-media/routes.js';

router.use('/:cvId/work-experience', workExperienceRoutes);
router.use('/:cvId/education', educationRoutes);
router.use('/:cvId/languages', languagesRoutes);
router.use('/:cvId/skills', skillsRoutes);
router.use('/:cvId/certifications', certificationsRoutes);
router.use('/:cvId/projects', projectsRoutes);
router.use('/:cvId/achievements', achievementsRoutes);
router.use('/:cvId/references', referencesRoutes);
router.use('/:cvId/activities', activitiesRoutes);
router.use('/:cvId/social-media', socialMediaRoutes);

export default router;
