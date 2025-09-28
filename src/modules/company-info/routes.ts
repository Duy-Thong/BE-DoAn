import { Router } from 'express';
import { CompanyInfoController } from './controller.js';

const router = Router();
const companyInfoController = new CompanyInfoController();

// Public routes - không cần authentication
router.get('/search', companyInfoController.searchCompanies.bind(companyInfoController));
router.get('/featured', companyInfoController.getFeaturedCompanies.bind(companyInfoController));
router.get('/:companyId', companyInfoController.getCompanyInfo.bind(companyInfoController));
router.get('/:companyId/jobs', companyInfoController.getCompanyJobs.bind(companyInfoController));

export default router;
