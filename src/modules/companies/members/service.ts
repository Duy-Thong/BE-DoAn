import { prisma } from '../../../loaders/prisma.js';
import { InviteMemberDto, UpdateMemberRoleDto, RemoveMemberDto } from './dto.js';

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
      throw new Error('Không có quyền mời thành viên');
    }

    // Tìm user theo email
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new Error('Không tìm thấy người dùng với email này');
    }

    // Kiểm tra user đã là thành viên chưa
    const existingMember = await prisma.companyMember.findFirst({
      where: {
        userId: user.id,
        companyId
      }
    });

    if (existingMember) {
      throw new Error('Người dùng đã là thành viên của công ty này');
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
            fullName: true,
            avatarUrl: true
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
      throw new Error('Không có quyền truy cập');
    }

    return await prisma.companyMember.findMany({
      where: { companyId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
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
      throw new Error('Không có quyền cập nhật role thành viên');
    }

    // Không cho phép thay đổi role của OWNER trừ khi chính OWNER đó
    const targetMember = await prisma.companyMember.findFirst({
      where: {
        id: data.memberId,
        companyId
      }
    });

    if (!targetMember) {
      throw new Error('Không tìm thấy thành viên');
    }

    if (targetMember.role === 'OWNER' && targetMember.userId !== requesterId) {
      throw new Error('Không thể thay đổi role của OWNER');
    }

    // Không cho phép OWNER thay đổi role của chính mình
    if (targetMember.userId === requesterId && requesterMember.role === 'OWNER') {
      throw new Error('OWNER không thể thay đổi role của chính mình');
    }

    return await prisma.companyMember.update({
      where: { id: data.memberId },
      data: { role: data.role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true
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
      throw new Error('Không có quyền xóa thành viên');
    }

    const targetMember = await prisma.companyMember.findFirst({
      where: {
        id: data.memberId,
        companyId
      }
    });

    if (!targetMember) {
      throw new Error('Không tìm thấy thành viên');
    }

    // Không cho phép xóa OWNER
    if (targetMember.role === 'OWNER') {
      throw new Error('Không thể xóa OWNER khỏi công ty');
    }

    // Không cho phép xóa chính mình
    if (targetMember.userId === requesterId) {
      throw new Error('Không thể xóa chính mình khỏi công ty');
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
        role: { in: requiredRoles as any[] }
      }
    });

    return !!member;
  }

  // Lấy danh sách công ty của user
  async getUserCompanies(userId: string) {
    const memberships = await prisma.companyMember.findMany({
      where: { userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            isVerified: true,
            _count: {
              select: {
                jobs: {
                  where: {
                    isActive: true,
                    isApproved: true
                  }
                },
                members: true
              }
            }
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });

    return memberships.map(membership => ({
      ...membership.company,
      userRole: membership.role,
      joinedAt: membership.joinedAt
    }));
  }
}
