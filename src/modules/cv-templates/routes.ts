import { Router } from 'express';
import { CVTemplateController } from './controller.js';
import { AuthMiddleware } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/permissions.js';
import { uploadTemplateFiles, handleTemplateUploadError } from '../../middlewares/templateUpload.js';

const router = Router();
const cvTemplateController = new CVTemplateController();

// Admin CRUD only (Template management is admin-only)
// End users don't interact with templates directly - they use CV download API

router.post('/admin/templates',
  AuthMiddleware.authenticate,
  requireRole(['ADMIN']),
  uploadTemplateFiles,
  handleTemplateUploadError,
  cvTemplateController.createTemplate
);

router.get('/admin/templates',
  AuthMiddleware.authenticate,
  requireRole(['ADMIN']),
  cvTemplateController.getTemplates
);

router.get('/admin/templates/stats',
  AuthMiddleware.authenticate,
  requireRole(['ADMIN']),
  cvTemplateController.getTemplateStats
);

router.get('/admin/templates/:id',
  AuthMiddleware.authenticate,
  requireRole(['ADMIN']),
  cvTemplateController.getTemplateById
);

router.put('/admin/templates/:id',
  AuthMiddleware.authenticate,
  requireRole(['ADMIN']),
  uploadTemplateFiles,
  handleTemplateUploadError,
  cvTemplateController.updateTemplate
);

router.delete('/admin/templates/:id',
  AuthMiddleware.authenticate,
  requireRole(['ADMIN']),
  cvTemplateController.deleteTemplate
);

export default router;
