import { prisma } from '../../../loaders/prisma.js';
import { AIService } from '../service.js';

export class EmbeddingService {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  // Generate embedding for CV
  async generateCVEmbedding(cvId: string, userId: string) {
    // Kiểm tra CV thuộc về user
    const cv = await prisma.cV.findFirst({
      where: {
        id: cvId,
        userId
      },
      include: {
        workExperience: true,
        education: true,
        skills: true,
        projects: true,
        achievements: true,
        languages: true,
        certifications: true,
        activities: true,
        references: true
      }
    });

    if (!cv) {
      throw new Error('CV không tìm thấy hoặc không có quyền truy cập');
    }

    // Tạo text content từ CV data
    const cvText = this.buildCVText(cv);

    // Generate embedding using AI service
    const embedding = await this.aiService.generateEmbedding({
      text: cvText,
      model: 'cv-embedding-model'
    });

    // Update CV with embedding
    const updatedCV = await prisma.cV.update({
      where: { id: cvId },
      data: {
        embedding: embedding.embedding,
        lastGeneratedAt: new Date()
      }
    });

    return updatedCV;
  }

  // Generate embedding for Job
  async generateJobEmbedding(jobId: string, userId: string) {
    // Kiểm tra quyền truy cập job
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
      },
      include: {
        requirements: true,
        benefits: true,
        jobSkills: true,
        company: {
          select: {
            name: true,
            description: true,
            industry: true
          }
        }
      }
    });

    if (!job) {
      throw new Error('Job không tìm thấy hoặc không có quyền truy cập');
    }

    // Tạo text content từ Job data
    const jobText = this.buildJobText(job);

    // Generate embedding using AI service
    const embedding = await this.aiService.generateEmbedding({
      text: jobText,
      model: 'job-embedding-model'
    });

    // Update Job with embedding
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        embedding: embedding.embedding
      }
    });

    return updatedJob;
  }

  // Build text content from CV data
  private buildCVText(cv: any): string {
    let text = '';
    
    // Basic info
    text += `Tên: ${cv.fullName}\n`;
    text += `Vị trí hiện tại: ${cv.currentPosition || ''}\n`;
    text += `Tóm tắt: ${cv.summary || ''}\n`;
    text += `Mục tiêu: ${cv.objective || ''}\n`;

    // Work experience
    if (cv.workExperience && cv.workExperience.length > 0) {
      text += '\nKinh nghiệm làm việc:\n';
      cv.workExperience.forEach((exp: any) => {
        text += `- ${exp.title} tại ${exp.company} (${exp.startDate} - ${exp.endDate || 'Hiện tại'})\n`;
        text += `  ${exp.description || ''}\n`;
      });
    }

    // Education
    if (cv.education && cv.education.length > 0) {
      text += '\nHọc vấn:\n';
      cv.education.forEach((edu: any) => {
        text += `- ${edu.degree} tại ${edu.institution} (${edu.startDate} - ${edu.endDate || 'Hiện tại'})\n`;
        text += `  ${edu.description || ''}\n`;
      });
    }

    // Skills
    if (cv.skills && cv.skills.length > 0) {
      text += '\nKỹ năng:\n';
      cv.skills.forEach((skill: any) => {
        text += `- ${skill.skillName} (${skill.level})`;
        if (skill.yearsOfExperience) {
          text += ` - ${skill.yearsOfExperience} năm kinh nghiệm`;
        }
        text += '\n';
        if (skill.description) {
          text += `  ${skill.description}\n`;
        }
      });
    }

    // Projects
    if (cv.projects && cv.projects.length > 0) {
      text += '\nDự án:\n';
      cv.projects.forEach((project: any) => {
        text += `- ${project.name} (${project.startDate} - ${project.endDate || 'Hiện tại'})\n`;
        text += `  ${project.description || ''}\n`;
      });
    }

    // Languages
    if (cv.languages && cv.languages.length > 0) {
      text += '\nNgôn ngữ:\n';
      cv.languages.forEach((lang: any) => {
        text += `- ${lang.language} (${lang.proficiency})\n`;
      });
    }

    // Certifications
    if (cv.certifications && cv.certifications.length > 0) {
      text += '\nChứng chỉ:\n';
      cv.certifications.forEach((cert: any) => {
        text += `- ${cert.name} từ ${cert.issuer} (${cert.issueDate})\n`;
        text += `  ${cert.description || ''}\n`;
      });
    }

    return text;
  }

  // Build text content from Job data
  private buildJobText(job: any): string {
    let text = '';
    
    // Basic job info
    text += `Tiêu đề: ${job.title}\n`;
    text += `Mô tả: ${job.description || ''}\n`;
    text += `Vị trí: ${job.location || ''}\n`;
    text += `Loại: ${job.type}\n`;
    text += `Lương: ${job.salary || ''}\n`;
    text += `Làm việc từ xa: ${job.remoteWork ? 'Có' : 'Không'}\n`;

    // Company info
    text += `\nCông ty: ${job.company.name}\n`;
    if (job.company.description) {
      text += `Mô tả công ty: ${job.company.description}\n`;
    }
    if (job.company.industry) {
      text += `Ngành: ${job.company.industry}\n`;
    }

    // Requirements
    if (job.requirements && job.requirements.length > 0) {
      text += '\nYêu cầu:\n';
      job.requirements.forEach((req: any) => {
        text += `- ${req.title}\n`;
        if (req.description) {
          text += `  ${req.description}\n`;
        }
      });
    }

    // Benefits
    if (job.benefits && job.benefits.length > 0) {
      text += '\nPhúc lợi:\n';
      job.benefits.forEach((benefit: any) => {
        text += `- ${benefit.title}\n`;
        if (benefit.description) {
          text += `  ${benefit.description}\n`;
        }
      });
    }

    // Skills
    if (job.jobSkills && job.jobSkills.length > 0) {
      text += '\nKỹ năng yêu cầu:\n';
      job.jobSkills.forEach((skill: any) => {
        text += `- ${skill.skillName} ${skill.isRequired ? '(Bắt buộc)' : '(Khuyến khích)'}\n`;
      });
    }

    return text;
  }

  // Batch generate embeddings for multiple CVs
  async batchGenerateCVEmbeddings(userId: string, cvIds?: string[]) {
    const whereClause: any = { userId };
    if (cvIds && cvIds.length > 0) {
      whereClause.id = { in: cvIds };
    }

    const cvs = await prisma.cV.findMany({
      where: whereClause,
      include: {
        workExperience: true,
        education: true,
        skills: true,
        projects: true,
        achievements: true,
        languages: true,
        certifications: true,
        activities: true,
        references: true
      }
    });

    const results = [];
    for (const cv of cvs) {
      try {
        const cvText = this.buildCVText(cv);
        const embedding = await this.aiService.generateEmbedding({
          text: cvText,
          model: 'cv-embedding-model'
        });

        const updatedCV = await prisma.cV.update({
          where: { id: cv.id },
          data: {
            embedding: embedding.embedding,
            lastGeneratedAt: new Date()
          }
        });

        results.push({ cvId: cv.id, success: true, data: updatedCV });
      } catch (error) {
        results.push({ 
          cvId: cv.id, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return results;
  }

  // Batch generate embeddings for multiple Jobs
  async batchGenerateJobEmbeddings(companyId: string, userId: string, jobIds?: string[]) {
    // Kiểm tra quyền truy cập company
    const hasPermission = await prisma.companyMember.findFirst({
      where: {
        userId,
        companyId,
        role: { in: ['OWNER', 'MANAGER', 'RECRUITER'] }
      }
    });

    if (!hasPermission) {
      throw new Error('Không có quyền truy cập công ty');
    }

    const whereClause: any = { companyId };
    if (jobIds && jobIds.length > 0) {
      whereClause.id = { in: jobIds };
    }

    const jobs = await prisma.job.findMany({
      where: whereClause,
      include: {
        requirements: true,
        benefits: true,
        jobSkills: true,
        company: {
          select: {
            name: true,
            description: true,
            industry: true
          }
        }
      }
    });

    const results = [];
    for (const job of jobs) {
      try {
        const jobText = this.buildJobText(job);
        const embedding = await this.aiService.generateEmbedding({
          text: jobText,
          model: 'job-embedding-model'
        });

        const updatedJob = await prisma.job.update({
          where: { id: job.id },
          data: {
            embedding: embedding.embedding
          }
        });

        results.push({ jobId: job.id, success: true, data: updatedJob });
      } catch (error) {
        results.push({ 
          jobId: job.id, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return results;
  }
}
