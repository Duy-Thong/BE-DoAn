import { Request, Response } from 'express';
import { CompanyMemberService } from './service.js';
import { inviteMemberDto, updateMemberRoleDto, removeMemberDto } from './dto.js';

const companyMemberService = new CompanyMemberService();

export class CompanyMemberController {
  // Mời thành viên vào công ty
  async inviteMember(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { companyId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const data = inviteMemberDto.parse(req.body);
      const member = await companyMemberService.inviteMember(companyId, userId, data);

      res.status(201).json({
        success: true,
        data: member
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to invite member'
      });
    }
  }

  // Lấy danh sách thành viên công ty
  async getCompanyMembers(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { companyId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const members = await companyMemberService.getCompanyMembers(companyId, userId);

      res.json({
        success: true,
        data: members
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch members'
      });
    }
  }

  // Cập nhật role của thành viên
  async updateMemberRole(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { companyId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const data = updateMemberRoleDto.parse(req.body);
      const member = await companyMemberService.updateMemberRole(companyId, userId, data);

      res.json({
        success: true,
        data: member
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update member role'
      });
    }
  }

  // Xóa thành viên khỏi công ty
  async removeMember(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { companyId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const data = removeMemberDto.parse(req.body);
      await companyMemberService.removeMember(companyId, userId, data);

      res.json({
        success: true,
        message: 'Member removed successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove member'
      });
    }
  }

  // Lấy role của user trong công ty
  async getUserRole(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { companyId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const role = await companyMemberService.getUserRoleInCompany(userId, companyId);

      res.json({
        success: true,
        data: { role }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get user role'
      });
    }
  }
}
