import { prisma } from '../../loaders/prisma.js';
import { UpdateCompleteCVDto, SetMainCVDto, CreateCompleteCVDto } from './dto.js';
import { createNotFoundError, createAuthError } from '../../utils/error.js';
import { Gender } from './enums.js';

export class CVService {

  // Tạo CV hoàn chỉnh với tất cả thông tin
  async createCompleteCV(userId: string, data: CreateCompleteCVDto) {
    return await prisma.$transaction(async (tx) => {
      // Kiểm tra nếu user muốn đặt CV này làm main
      if (data.isMain) {
        // Kiểm tra xem user đã có CV main chưa
        const existingMainCV = await tx.cV.findFirst({
          where: { userId, isMain: true }
        });

        if (existingMainCV) {
          throw createNotFoundError('User đã có CV chính. Vui lòng bỏ chọn CV chính hiện tại trước khi tạo CV chính mới.');
        }
      }

      // Nếu đây là CV đầu tiên, tự động đặt làm CV chính
      const existingCVs = await tx.cV.count({
        where: { userId }
      });

      // Tạo CV cơ bản
      const cv = await tx.cV.create({
        data: {
          title: data.title,
          fullName: data.fullName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          gender: data.gender as Gender,
          nationality: data.nationality,
          address: data.address,
          avatarUrl: data.avatarUrl,
          currentPosition: data.currentPosition,
          summary: data.summary,
          objective: data.objective,
          userId,
          isMain: existingCVs === 0 || data.isMain,
          embedding: [],
        },
      });

      // Tạo Work Experience nếu có
      if (data.workExperience && data.workExperience.length > 0) {
        await tx.workExperience.createMany({
          data: data.workExperience.map(we => ({
            title: we.title,
            company: we.company,
            startDate: new Date(we.startDate),
            endDate: we.endDate ? new Date(we.endDate) : null,
            description: we.description,
            cvId: cv.id,
          }))
        });
      }

      // Tạo Education nếu có
      if (data.education && data.education.length > 0) {
        await tx.education.createMany({
          data: data.education.map(edu => ({
            institution: edu.institution,
            degree: edu.degree,
            startDate: new Date(edu.startDate),
            endDate: edu.endDate ? new Date(edu.endDate) : null,
            description: edu.description,
            cvId: cv.id,
          }))
        });
      }

      // Tạo Skills nếu có
      if (data.skills && data.skills.length > 0) {
        await tx.cVSkill.createMany({
          data: data.skills.map(skill => ({
            skillName: skill.skillName,
            level: skill.level as any,
            yearsOfExperience: skill.yearsOfExperience,
            description: skill.description,
            cvId: cv.id,
          }))
        });
      }

      // Tạo Projects nếu có
      if (data.projects && data.projects.length > 0) {
        await tx.project.createMany({
          data: data.projects.map(project => ({
            name: project.name,
            description: project.description,
            startDate: new Date(project.startDate),
            endDate: project.endDate ? new Date(project.endDate) : null,
            url: project.url,
            cvId: cv.id,
          }))
        });
      }

      // Tạo Certifications nếu có
      if (data.certifications && data.certifications.length > 0) {
        await tx.certification.createMany({
          data: data.certifications.map(cert => ({
            name: cert.name,
            issuer: cert.issuer,
            acquiredAt: new Date(cert.acquiredAt),
            description: cert.description,
            cvId: cv.id,
          }))
        });
      }

      // Tạo Languages nếu có
      if (data.languages && data.languages.length > 0) {
        await tx.language.createMany({
          data: data.languages.map(lang => ({
            name: lang.name,
            level: lang.proficiency as any,
            description: lang.description,
            cvId: cv.id,
          }))
        });
      }

      // Tạo Achievements nếu có
      if (data.achievements && data.achievements.length > 0) {
        await tx.achievement.createMany({
          data: data.achievements.map(achievement => ({
            title: achievement.title,
            acquiredAt: new Date(achievement.acquiredAt),
            description: achievement.description,
            cvId: cv.id,
          }))
        });
      }

      // Tạo References nếu có
      if (data.references && data.references.length > 0) {
        await tx.reference.createMany({
          data: data.references.map(ref => ({
            name: ref.name,
            position: ref.position,
            company: ref.company,
            description: ref.description,
            cvId: cv.id,
          }))
        });
      }

      // Tạo Activities nếu có
      if (data.activities && data.activities.length > 0) {
        await tx.activity.createMany({
          data: data.activities.map(activity => ({
            title: activity.title,
            organization: activity.organization,
            startDate: new Date(activity.startDate),
            endDate: activity.endDate ? new Date(activity.endDate) : null,
            description: activity.description,
            cvId: cv.id,
          }))
        });
      }

      // Trả về CV với tất cả thông tin liên quan
      return await tx.cV.findUnique({
        where: { id: cv.id },
        include: {
          workExperience: true,
          education: true,
          skills: true,
          projects: true,
          certifications: true,
          languages: true,
          achievements: true,
          references: true,
          activities: true,
        }
      });
    });
  }

  // Lấy danh sách CV của user
  async getUserCVs(userId: string) {
    return await prisma.cV.findMany({
      where: { userId },
      orderBy: [
        { isMain: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  // Lấy CV theo ID với tất cả nested data
  async getCVById(cvId: string, userId: string) {
    return await prisma.cV.findFirst({
      where: {
        id: cvId,
        userId
      },
      include: {
        workExperience: true,
        education: true,
        languages: true,
        certifications: true,
        projects: true,
        achievements: true,
        references: true,
        skills: true,
        activities: true,
        // SocialMedia được query riêng vì dùng polymorphic relationship
      }
    });
  }


  // Cập nhật CV hoàn chỉnh với nested data
  async updateCompleteCV(cvId: string, userId: string, data: UpdateCompleteCVDto) {
    return await prisma.$transaction(async (tx) => {
      // Kiểm tra quyền sở hữu
      const existingCV = await tx.cV.findFirst({
        where: { id: cvId, userId }
      });
      if (!existingCV) {
        throw createNotFoundError('CV');
      }

      // Nếu đặt làm CV chính, kiểm tra và bỏ CV chính cũ
      if (data.isMain) {
        const otherMainCV = await tx.cV.findFirst({
          where: { 
            userId, 
            isMain: true,
            id: { not: cvId }
          }
        });

        if (otherMainCV) {
          await tx.cV.update({
            where: { id: otherMainCV.id },
            data: { isMain: false }
          });
        }
      }

      // Cập nhật thông tin cơ bản CV
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.fullName !== undefined) updateData.fullName = data.fullName;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
      if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
      if (data.gender !== undefined) updateData.gender = data.gender as Gender;
      if (data.nationality !== undefined) updateData.nationality = data.nationality;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
      if (data.currentPosition !== undefined) updateData.currentPosition = data.currentPosition;
      if (data.summary !== undefined) updateData.summary = data.summary;
      if (data.objective !== undefined) updateData.objective = data.objective;
      if (data.isMain !== undefined) updateData.isMain = data.isMain;

      // Cập nhật CV cơ bản
      await tx.cV.update({
        where: { id: cvId },
        data: updateData
      });

      // Cập nhật nested data nếu có
      // 1. Work Experience
      if (data.workExperience !== undefined) {
        // Xóa tất cả work experience cũ
        await tx.workExperience.deleteMany({
          where: { cvId }
        });
        // Tạo work experience mới
        if (data.workExperience.length > 0) {
          await tx.workExperience.createMany({
            data: data.workExperience.map(we => ({
              title: we.title,
              company: we.company,
              startDate: new Date(we.startDate),
              endDate: we.endDate ? new Date(we.endDate) : null,
              description: we.description,
              cvId: cvId,
            }))
          });
        }
      }

      // 2. Education
      if (data.education !== undefined) {
        await tx.education.deleteMany({
          where: { cvId }
        });
        if (data.education.length > 0) {
          await tx.education.createMany({
            data: data.education.map(edu => ({
              institution: edu.institution,
              degree: edu.degree,
              startDate: new Date(edu.startDate),
              endDate: edu.endDate ? new Date(edu.endDate) : null,
              description: edu.description,
              cvId: cvId,
            }))
          });
        }
      }

      // 3. Skills
      if (data.skills !== undefined) {
        await tx.cVSkill.deleteMany({
          where: { cvId }
        });
        if (data.skills.length > 0) {
          await tx.cVSkill.createMany({
            data: data.skills.map(skill => ({
              skillName: skill.skillName,
              level: skill.level as any,
              yearsOfExperience: skill.yearsOfExperience,
              description: skill.description,
              cvId: cvId,
            }))
          });
        }
      }

      // 4. Projects
      if (data.projects !== undefined) {
        await tx.project.deleteMany({
          where: { cvId }
        });
        if (data.projects.length > 0) {
          await tx.project.createMany({
            data: data.projects.map(project => ({
              name: project.name,
              description: project.description,
              startDate: new Date(project.startDate),
              endDate: project.endDate ? new Date(project.endDate) : null,
              url: project.url,
              cvId: cvId,
            }))
          });
        }
      }

      // 5. Certifications
      if (data.certifications !== undefined) {
        await tx.certification.deleteMany({
          where: { cvId }
        });
        if (data.certifications.length > 0) {
          await tx.certification.createMany({
            data: data.certifications.map(cert => ({
              name: cert.name,
              issuer: cert.issuer,
              acquiredAt: new Date(cert.acquiredAt),
              description: cert.description,
              cvId: cvId,
            }))
          });
        }
      }

      // 6. Languages
      if (data.languages !== undefined) {
        await tx.language.deleteMany({
          where: { cvId }
        });
        if (data.languages.length > 0) {
          await tx.language.createMany({
            data: data.languages.map(lang => ({
              name: lang.name,
              level: lang.proficiency as any,
              description: lang.description,
              cvId: cvId,
            }))
          });
        }
      }

      // 7. Achievements
      if (data.achievements !== undefined) {
        await tx.achievement.deleteMany({
          where: { cvId }
        });
        if (data.achievements.length > 0) {
          await tx.achievement.createMany({
            data: data.achievements.map(achievement => ({
              title: achievement.title,
              acquiredAt: new Date(achievement.acquiredAt),
              description: achievement.description,
              cvId: cvId,
            }))
          });
        }
      }

      // 8. References
      if (data.references !== undefined) {
        await tx.reference.deleteMany({
          where: { cvId }
        });
        if (data.references.length > 0) {
          await tx.reference.createMany({
            data: data.references.map(ref => ({
              name: ref.name,
              position: ref.position,
              company: ref.company,
              description: ref.description,
              cvId: cvId,
            }))
          });
        }
      }

      // 9. Activities
      if (data.activities !== undefined) {
        await tx.activity.deleteMany({
          where: { cvId }
        });
        if (data.activities.length > 0) {
          await tx.activity.createMany({
            data: data.activities.map(activity => ({
              title: activity.title,
              organization: activity.organization,
              startDate: new Date(activity.startDate),
              endDate: activity.endDate ? new Date(activity.endDate) : null,
              description: activity.description,
              cvId: cvId,
            }))
          });
        }
      }

      // Trả về CV với tất cả thông tin liên quan
      return await tx.cV.findUnique({
        where: { id: cvId },
        include: {
          workExperience: true,
          education: true,
          skills: true,
          projects: true,
          certifications: true,
          languages: true,
          achievements: true,
          references: true,
          activities: true,
        }
      });
    });
  }

  // Đặt CV làm CV chính với transaction
  async setMainCV(userId: string, data: SetMainCVDto) {
    return await prisma.$transaction(async (tx) => {
      // Kiểm tra CV có tồn tại và thuộc về user
      const cv = await tx.cV.findFirst({
        where: {
          id: data.cvId,
          userId
        }
      });
      
      if (!cv) {
        throw createNotFoundError('CV');
      }

      // Bỏ CV chính cũ
      await tx.cV.updateMany({
        where: { userId, isMain: true },
        data: { isMain: false }
      });

      // Đặt CV mới làm chính
      return await tx.cV.update({
        where: { id: data.cvId },
        data: { isMain: true }
      });
    });
  }

  // Xóa CV với transaction và cascade delete
  async deleteCV(cvId: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      // Kiểm tra quyền sở hữu
      const cv = await tx.cV.findFirst({
        where: {
          id: cvId,
          userId
        }
      });
      
      if (!cv) {
        throw createNotFoundError('CV');
      }

      // Nếu đây là CV chính, đặt CV khác làm chính (nếu có)
      if (cv.isMain) {
        const otherCVs = await tx.cV.findMany({
          where: { userId, id: { not: cvId } },
          orderBy: { createdAt: 'desc' },
          take: 1
        });

        if (otherCVs.length > 0) {
          await tx.cV.update({
            where: { id: otherCVs[0].id },
            data: { isMain: true }
          });
        }
      }

      // Xóa tất cả các record liên quan trước
      // 1. Xóa Work Experience
      await tx.workExperience.deleteMany({
        where: { cvId }
      });

      // 2. Xóa Education
      await tx.education.deleteMany({
        where: { cvId }
      });

      // 3. Xóa Languages
      await tx.language.deleteMany({
        where: { cvId }
      });

      // 4. Xóa Certifications
      await tx.certification.deleteMany({
        where: { cvId }
      });

      // 5. Xóa Projects
      await tx.project.deleteMany({
        where: { cvId }
      });

      // 6. Xóa Achievements
      await tx.achievement.deleteMany({
        where: { cvId }
      });

      // 7. Xóa References
      await tx.reference.deleteMany({
        where: { cvId }
      });

      // 8. Xóa Skills
      await tx.cVSkill.deleteMany({
        where: { cvId }
      });

      // 9. Xóa Activities
      await tx.activity.deleteMany({
        where: { cvId }
      });

      // 10. Xóa Applications (nếu có)
      await tx.application.deleteMany({
        where: { cvId }
      });

      // 11. Xóa Social Media (polymorphic relationship)
      await tx.socialMedia.deleteMany({
        where: { 
          ownerType: 'CV',
          ownerId: cvId
        }
      });

      // Cuối cùng xóa CV
      return await tx.cV.delete({
        where: { id: cvId }
      });
    });
  }

  // Lấy CV chính của user với tất cả nested data
  async getMainCV(userId: string) {
    return await prisma.cV.findFirst({
      where: { userId, isMain: true },
      include: {
        workExperience: true,
        education: true,
        languages: true,
        certifications: true,
        projects: true,
        achievements: true,
        references: true,
        skills: true,
        activities: true,
        // SocialMedia được query riêng vì dùng polymorphic relationship
      }
    });
  }

  // Generate CV embedding (for AI recommendations)
  async generateEmbedding(cvId: string, userId: string) {
    const cv = await this.getCVById(cvId, userId);
    if (!cv) {
      throw createNotFoundError('CV');
    }

    // TODO: Call AI service to generate embedding
    // For now, return empty array
    const embedding: number[] = [];
    
    return await prisma.cV.update({
      where: { id: cvId },
      data: { 
        embedding,
        lastGeneratedAt: new Date()
      }
    });
  }

  // Get CV with all related data (alias for getCVById)
  async getCVWithDetails(cvId: string, userId: string) {
    return await this.getCVById(cvId, userId);
  }

  // Download CV (get full CV data for export)
  async downloadCV(cvId: string, userId: string) {
    return await this.getCVWithDetails(cvId, userId);
  }

  // Duplicate CV
  async duplicateCV(cvId: string, userId: string, newTitle: string) {
    return await prisma.$transaction(async (tx) => {
      // Lấy CV gốc với tất cả nested data
      const originalCV = await tx.cV.findFirst({
        where: { id: cvId, userId },
        include: {
          workExperience: true,
          education: true,
          languages: true,
          skills: true,
          certifications: true,
          projects: true,
          achievements: true,
          references: true,
          activities: true,
        }
      });

      if (!originalCV) {
        throw createNotFoundError('CV không tồn tại');
      }

      // Tạo CV mới với thông tin cơ bản
      const newCV = await tx.cV.create({
        data: {
          title: newTitle,
          fullName: originalCV.fullName,
          email: originalCV.email,
          phoneNumber: originalCV.phoneNumber,
          dateOfBirth: originalCV.dateOfBirth,
          gender: originalCV.gender,
          nationality: originalCV.nationality,
          address: originalCV.address,
          avatarUrl: originalCV.avatarUrl,
          currentPosition: originalCV.currentPosition,
          summary: originalCV.summary,
          objective: originalCV.objective,
          userId,
          isMain: false, // CV duplicate không bao giờ là main
          embedding: [],
        },
      });

      // Duplicate Work Experience
      if (originalCV.workExperience.length > 0) {
        await tx.workExperience.createMany({
          data: originalCV.workExperience.map(exp => ({
            cvId: newCV.id,
            title: exp.title,
            company: exp.company,
            startDate: exp.startDate,
            endDate: exp.endDate,
            description: exp.description,
          }))
        });
      }

      // Duplicate Education
      if (originalCV.education.length > 0) {
        await tx.education.createMany({
          data: originalCV.education.map(edu => ({
            cvId: newCV.id,
            institution: edu.institution,
            degree: edu.degree,
            startDate: edu.startDate,
            endDate: edu.endDate,
            description: edu.description,
          }))
        });
      }

      // Duplicate Languages
      if (originalCV.languages.length > 0) {
        await tx.language.createMany({
          data: originalCV.languages.map(lang => ({
            cvId: newCV.id,
            name: lang.name,
            level: lang.level,
            description: lang.description,
          }))
        });
      }

      // Duplicate Skills
      if (originalCV.skills.length > 0) {
        await tx.cVSkill.createMany({
          data: originalCV.skills.map(skill => ({
            cvId: newCV.id,
            skillName: skill.skillName,
            level: skill.level,
            yearsOfExperience: skill.yearsOfExperience,
            description: skill.description,
          }))
        });
      }

      // Duplicate Certifications
      if (originalCV.certifications.length > 0) {
        await tx.certification.createMany({
          data: originalCV.certifications.map(cert => ({
            cvId: newCV.id,
            name: cert.name,
            issuer: cert.issuer,
            acquiredAt: cert.acquiredAt,
            description: cert.description,
          }))
        });
      }

      // Duplicate Projects
      if (originalCV.projects.length > 0) {
        await tx.project.createMany({
          data: originalCV.projects.map(proj => ({
            cvId: newCV.id,
            name: proj.name,
            description: proj.description,
            startDate: proj.startDate,
            endDate: proj.endDate,
            url: proj.url,
            role: proj.role,
          }))
        });
      }

      // Duplicate Achievements
      if (originalCV.achievements.length > 0) {
        await tx.achievement.createMany({
          data: originalCV.achievements.map(ach => ({
            cvId: newCV.id,
            title: ach.title,
            description: ach.description,
            acquiredAt: ach.acquiredAt,
          }))
        });
      }

      // Duplicate References
      if (originalCV.references.length > 0) {
        await tx.reference.createMany({
          data: originalCV.references.map(ref => ({
            cvId: newCV.id,
            name: ref.name,
            position: ref.position,
            company: ref.company,
            description: ref.description,
          }))
        });
      }

      // Duplicate Activities
      if (originalCV.activities.length > 0) {
        await tx.activity.createMany({
          data: originalCV.activities.map(act => ({
            cvId: newCV.id,
            title: act.title,
            organization: act.organization,
            startDate: act.startDate,
            endDate: act.endDate,
            description: act.description,
          }))
        });
      }

      // Trả về CV mới với tất cả nested data
      return await tx.cV.findUnique({
        where: { id: newCV.id },
        include: {
          workExperience: true,
          education: true,
          languages: true,
          certifications: true,
          projects: true,
          achievements: true,
          references: true,
          skills: true,
          activities: true,
        }
      });
    });
  }
}
