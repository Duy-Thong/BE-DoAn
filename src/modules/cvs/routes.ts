import { Router } from 'express';
import { CVController } from './controller.js';
import { requireAuth } from '../../middlewares/auth.js';

const router = Router();
const cvController = new CVController();

// Tất cả routes đều cần authentication
router.use(requireAuth);

// CV management routes
router.post('/', cvController.createCV.bind(cvController));
router.get('/', cvController.getUserCVs.bind(cvController));
router.get('/main', cvController.getMainCV.bind(cvController));
router.get('/:cvId', cvController.getCVById.bind(cvController));
router.put('/:cvId', cvController.updateCV.bind(cvController));
router.delete('/:cvId', cvController.deleteCV.bind(cvController));
router.post('/set-main', cvController.setMainCV.bind(cvController));

// CV nested submodules routes
router.use('/:cvId/work-experience', require('./work-experience/routes.js').default);
router.use('/:cvId/education', require('./education/routes.js').default);
router.use('/:cvId/languages', require('./languages/routes.js').default);
router.use('/:cvId/skills', require('./skills/routes.js').default);
router.use('/:cvId/certifications', require('./certifications/routes.js').default);
router.use('/:cvId/projects', require('./projects/routes.js').default);
router.use('/:cvId/achievements', require('./achievements/routes.js').default);
router.use('/:cvId/references', require('./references/routes.js').default);
router.use('/:cvId/activities', require('./activities/routes.js').default);
router.use('/:cvId/social-media', require('./social-media/routes.js').default);

export default router;
