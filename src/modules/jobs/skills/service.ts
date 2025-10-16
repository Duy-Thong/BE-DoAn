import { prisma } from '../../../loaders/prisma.js';
import { CreateJobSkillDto, UpdateJobSkillDto } from './dto.js';

export class JobSkillService {
  // Tạo kỹ năng công việc mới
  async createJobSkill(jobId: string, userId: string, data: CreateJobSkillDto) {
    // Kiểm tra quyền truy cập job
    await this.verifyJobAccess(jobId, userId);

    // Kiểm tra kỹ năng đã tồn tại chưa
    const existingSkill = await prisma.jobSkill.findUnique({
      where: {
        jobId_skillName: {
          jobId,
          skillName: data.skillName
        }
      }
    });

    if (existingSkill) {
      throw new Error('Kỹ năng này đã tồn tại trong job');
    }

    return await prisma.jobSkill.create({
      data: {
        skillName: data.skillName,
        isRequired: data.isRequired,
        jobId
      }
    });
  }

  // Lấy danh sách kỹ năng của job
  async getJobSkills(jobId: string, userId: string) {
    // Kiểm tra quyền truy cập job
    await this.verifyJobAccess(jobId, userId);

    return await prisma.jobSkill.findMany({
      where: { jobId },
      orderBy: [
        { isRequired: 'desc' },
        { skillName: 'asc' }
      ]
    });
  }

  // Lấy kỹ năng theo ID
  async getJobSkillById(skillId: string, jobId: string, userId: string) {
    // Kiểm tra quyền truy cập job
    await this.verifyJobAccess(jobId, userId);

    return await prisma.jobSkill.findFirst({
      where: {
        id: skillId,
        jobId
      }
    });
  }

  // Cập nhật kỹ năng
  async updateJobSkill(skillId: string, jobId: string, userId: string, data: UpdateJobSkillDto) {
    // Kiểm tra quyền truy cập job
    await this.verifyJobAccess(jobId, userId);

    // Kiểm tra skill tồn tại
    const skill = await this.getJobSkillById(skillId, jobId, userId);
    if (!skill) {
      throw new Error('Kỹ năng không tìm thấy');
    }

    // Nếu thay đổi tên kỹ năng, kiểm tra trùng lặp
    if (data.skillName && data.skillName !== skill.skillName) {
      const existingSkill = await prisma.jobSkill.findUnique({
        where: {
          jobId_skillName: {
            jobId,
            skillName: data.skillName
          }
        }
      });

      if (existingSkill) {
        throw new Error('Kỹ năng này đã tồn tại trong job');
      }
    }

    const updateData: any = {};
    if (data.skillName !== undefined) updateData.skillName = data.skillName;
    if (data.isRequired !== undefined) updateData.isRequired = data.isRequired;

    return await prisma.jobSkill.update({
      where: { id: skillId },
      data: updateData
    });
  }

  // Xóa kỹ năng
  async deleteJobSkill(skillId: string, jobId: string, userId: string) {
    // Kiểm tra quyền truy cập job
    await this.verifyJobAccess(jobId, userId);

    // Kiểm tra skill tồn tại
    const skill = await this.getJobSkillById(skillId, jobId, userId);
    if (!skill) {
      throw new Error('Kỹ năng không tìm thấy');
    }

    return await prisma.jobSkill.delete({
      where: { id: skillId }
    });
  }

  // Kiểm tra quyền truy cập job
  private async verifyJobAccess(jobId: string, userId: string) {
    // Kiểm tra job thuộc về công ty mà user có quyền
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        company: {
          members: {
            some: {
              userId,
              role: { in: ['OWNER', 'MANAGER', 'RECRUITER'] }
            }
          }
        }
      }
    });

    if (!job) {
      throw new Error('Job không tìm thấy hoặc không có quyền truy cập');
    }

    return job;
  }
}
