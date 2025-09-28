import { Router } from 'express';
import { CompanyMemberController } from './controller.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = Router();
const companyMemberController = new CompanyMemberController();

// Tất cả routes đều cần authentication
router.use(authMiddleware);

// Company member management routes
router.post('/:companyId/invite', companyMemberController.inviteMember.bind(companyMemberController));
router.get('/:companyId', companyMemberController.getCompanyMembers.bind(companyMemberController));
router.put('/:companyId/role', companyMemberController.updateMemberRole.bind(companyMemberController));
router.delete('/:companyId/remove', companyMemberController.removeMember.bind(companyMemberController));
router.get('/:companyId/my-role', companyMemberController.getUserRole.bind(companyMemberController));

export default router;
