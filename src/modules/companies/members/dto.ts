import { z } from 'zod';

export const inviteMemberDto = z.object({
  email: z.string().email('Email không hợp lệ'),
  role: z.enum(['OWNER', 'MANAGER', 'RECRUITER', 'VIEWER']),
});

export const updateMemberRoleDto = z.object({
  memberId: z.string().cuid('ID thành viên không hợp lệ'),
  role: z.enum(['OWNER', 'MANAGER', 'RECRUITER', 'VIEWER']),
});

export const removeMemberDto = z.object({
  memberId: z.string().cuid('ID thành viên không hợp lệ'),
});

export type InviteMemberDto = z.infer<typeof inviteMemberDto>;
export type UpdateMemberRoleDto = z.infer<typeof updateMemberRoleDto>;
export type RemoveMemberDto = z.infer<typeof removeMemberDto>;
