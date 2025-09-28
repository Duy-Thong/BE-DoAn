import { PrismaClient } from '../../generated/prisma/index.js';
import { InviteMemberDto, UpdateMemberRoleDto, RemoveMemberDto } from './dto.js';

const prisma = new PrismaClient();

export class CompanyMemberService {
  // Mời thành viên vào công ty
  async inviteMember(companyId: string, inviterId: string, data: InviteMemberDto) {
    // Kiểm tra quyền của người mời
    const inviterMember = await prisma.companyMember.findFirst({
      where: {
        userId: inviterId,
        companyId,
        role: { in: ['OWNER', 'MANAGER'] }
      }
    });

    if (!inviterMember) {
      throw new Error('Insufficient permissions to invite members');
    }

    // Tìm user theo email
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new Error('User not found with this email');
    }

    // Kiểm tra user đã là thành viên chưa
    const existingMember = await prisma.companyMember.findFirst({
      where: {
        userId: user.id,
        companyId
      }
    });

    if (existingMember) {
      throw new Error('User is already a member of this company');
    }

    // Tạo thành viên mới
    const member = await prisma.companyMember.create({
      data: {
        userId: user.id,
        companyId,
        role: data.role,
        invitedBy: inviterId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        }
      }
    });

    return member;
  }

  // Lấy danh sách thành viên công ty
  async getCompanyMembers(companyId: string, requesterId: string) {
    // Kiểm tra quyền truy cập
    const requesterMember = await prisma.companyMember.findFirst({
      where: {
        userId: requesterId,
        companyId
      }
    });

    if (!requesterMember) {
      throw new Error('Access denied');
    }

    return await prisma.companyMember.findMany({
      where: { companyId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            createdAt: true
          }
        }
      },
      orderBy: [
        { role: 'asc' },
        { joinedAt: 'asc' }
      ]
    });
  }

  // Cập nhật role của thành viên
  async updateMemberRole(companyId: string, requesterId: string, data: UpdateMemberRoleDto) {
    // Kiểm tra quyền của người thực hiện
    const requesterMember = await prisma.companyMember.findFirst({
      where: {
        userId: requesterId,
        companyId,
        role: { in: ['OWNER', 'MANAGER'] }
      }
    });

    if (!requesterMember) {
      throw new Error('Insufficient permissions to update member roles');
    }

    // Không cho phép thay đổi role của OWNER trừ khi chính OWNER đó
    const targetMember = await prisma.companyMember.findFirst({
      where: {
        id: data.memberId,
        companyId
      }
    });

    if (!targetMember) {
      throw new Error('Member not found');
    }

    if (targetMember.role === 'OWNER' && targetMember.userId !== requesterId) {
      throw new Error('Cannot change OWNER role');
    }

    // Không cho phép OWNER thay đổi role của chính mình
    if (targetMember.userId === requesterId && requesterMember.role === 'OWNER') {
      throw new Error('OWNER cannot change their own role');
    }

    return await prisma.companyMember.update({
      where: { id: data.memberId },
      data: { role: data.role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        }
      }
    });
  }

  // Xóa thành viên khỏi công ty
  async removeMember(companyId: string, requesterId: string, data: RemoveMemberDto) {
    // Kiểm tra quyền của người thực hiện
    const requesterMember = await prisma.companyMember.findFirst({
      where: {
        userId: requesterId,
        companyId,
        role: { in: ['OWNER', 'MANAGER'] }
      }
    });

    if (!requesterMember) {
      throw new Error('Insufficient permissions to remove members');
    }

    const targetMember = await prisma.companyMember.findFirst({
      where: {
        id: data.memberId,
        companyId
      }
    });

    if (!targetMember) {
      throw new Error('Member not found');
    }

    // Không cho phép xóa OWNER
    if (targetMember.role === 'OWNER') {
      throw new Error('Cannot remove OWNER from company');
    }

    // Không cho phép xóa chính mình
    if (targetMember.userId === requesterId) {
      throw new Error('Cannot remove yourself from company');
    }

    return await prisma.companyMember.delete({
      where: { id: data.memberId }
    });
  }

  // Lấy thông tin role của user trong công ty
  async getUserRoleInCompany(userId: string, companyId: string) {
    const member = await prisma.companyMember.findFirst({
      where: {
        userId,
        companyId
      }
    });

    return member?.role || null;
  }

  // Kiểm tra quyền truy cập
  async hasPermission(userId: string, companyId: string, requiredRoles: string[]) {
    const member = await prisma.companyMember.findFirst({
      where: {
        userId,
        companyId,
        role: { in: requiredRoles }
      }
    });

    return !!member;
  }
}
