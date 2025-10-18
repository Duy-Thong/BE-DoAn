import { prisma } from '../../../loaders/prisma.js';
import { CreateCVSkillDto, UpdateCVSkillDto } from './dto.js';
import { BaseCVService } from '../base-cv-service.js';
import { createNotFoundError, createConflictError } from '../../../utils/error.js';
import { SkillLevel } from '../enums.js';

export class CVSkillService extends BaseCVService {
  // Tạo kỹ năng mới
  async createCVSkill(cvId: string, userId: string, data: CreateCVSkillDto) {
    // Kiểm tra CV thuộc về user
    await this.verifyCVOwnership(cvId, userId);

    // Kiểm tra kỹ năng đã tồn tại chưa
    const existingSkill = await prisma.cVSkill.findUnique({
      where: {
        cvId_skillName: {
          cvId,
          skillName: data.skillName
        }
      }
    });

    if (existingSkill) {
      throw createConflictError('Kỹ năng này đã tồn tại trong CV');
    }

    return await prisma.cVSkill.create({
      data: {
        skillName: data.skillName,
        level: data.level as SkillLevel,
        yearsOfExperience: data.yearsOfExperience,
        description: data.description,
        cvId
      }
    });
  }

  // Lấy danh sách kỹ năng của CV
  async getCVSkills(cvId: string, userId: string) {
    // Kiểm tra CV thuộc về user
    await this.verifyCVOwnership(cvId, userId);

    return await prisma.cVSkill.findMany({
      where: { cvId },
      orderBy: [
        { level: 'desc' },
        { skillName: 'asc' }
      ]
    });
  }

  // Lấy kỹ năng theo ID
  async getCVSkillById(skillId: string, cvId: string, userId: string) {
    // Kiểm tra CV thuộc về user
    await this.verifyCVOwnership(cvId, userId);

    return await prisma.cVSkill.findFirst({
      where: {
        id: skillId,
        cvId
      }
    });
  }

  // Cập nhật kỹ năng
  async updateCVSkill(skillId: string, cvId: string, userId: string, data: UpdateCVSkillDto) {
    // Kiểm tra CV thuộc về user
    await this.verifyCVOwnership(cvId, userId);

    // Kiểm tra kỹ năng tồn tại
    const skill = await this.getCVSkillById(skillId, cvId, userId);
    if (!skill) {
      throw createNotFoundError('Kỹ năng');
    }

    // Nếu thay đổi tên kỹ năng, kiểm tra trùng lặp
    if (data.skillName && data.skillName !== skill.skillName) {
      const existingSkill = await prisma.cVSkill.findUnique({
        where: {
          cvId_skillName: {
            cvId,
            skillName: data.skillName
          }
        }
      });

    if (existingSkill) {
      throw createConflictError('Kỹ năng này đã tồn tại trong CV');
    }
    }

    const updateData: any = {};
    if (data.skillName !== undefined) updateData.skillName = data.skillName;
    if (data.level !== undefined) updateData.level = data.level as SkillLevel;
    if (data.yearsOfExperience !== undefined) updateData.yearsOfExperience = data.yearsOfExperience;
    if (data.description !== undefined) updateData.description = data.description;

    return await prisma.cVSkill.update({
      where: { id: skillId },
      data: updateData
    });
  }

  // Xóa kỹ năng
  async deleteCVSkill(skillId: string, cvId: string, userId: string) {
    // Kiểm tra CV thuộc về user
    await this.verifyCVOwnership(cvId, userId);

    // Kiểm tra kỹ năng tồn tại
    const skill = await this.getCVSkillById(skillId, cvId, userId);
    if (!skill) {
      throw createNotFoundError('Kỹ năng');
    }

    return await prisma.cVSkill.delete({
      where: { id: skillId }
    });
  }

}
