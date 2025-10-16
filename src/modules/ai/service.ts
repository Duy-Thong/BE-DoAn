import { prisma } from '../../loaders/prisma.js';
import { aiClient } from '../../services/ai-client.js';
import type { GenerateEmbeddingDto, JobRecommendationDto } from './dto.js';

export class AIService {
  // Generate embedding for CV or Job
  async generateEmbedding(data: GenerateEmbeddingDto) {
    try {
      const response = await aiClient.generateEmbedding({
        text: data.text,
        type: data.type
      });

      return {
        embedding: response.embedding,
        model: response.model || 'default',
        tokens: response.tokens || 0
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Không thể tạo embedding từ AI service');
    }
  }

  // Generate CV embedding and update database
  async generateCVEmbedding(cvId: string, userId: string) {
    // Get CV with all related data
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
        achievements: true
      }
    });

    if (!cv) {
      throw new Error('CV không tìm thấy hoặc không có quyền truy cập');
    }

    // Build text for embedding
    const text = this.buildCVText(cv);

    // Generate embedding
    const embeddingResult = await this.generateEmbedding({
      text,
      type: 'CV'
    });

    // Update CV with embedding
    return await prisma.cV.update({
      where: { id: cvId },
      data: {
        embedding: embeddingResult.embedding,
        lastGeneratedAt: new Date()
      }
    });
  }

  // Generate Job embedding and update database
  async generateJobEmbedding(jobId: string) {
    // Get Job with all related data
    const job = await prisma.job.findUnique({
      where: { id: jobId },
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
      throw new Error('Job không tìm thấy');
    }

    // Build text for embedding
    const text = this.buildJobText(job);

    // Generate embedding
    const embeddingResult = await this.generateEmbedding({
      text,
      type: 'JOB'
    });

    // Update Job with embedding
    return await prisma.job.update({
      where: { id: jobId },
      data: {
        embedding: embeddingResult.embedding
      }
    });
  }

  // Get job recommendations for a CV
  async getJobRecommendations(data: JobRecommendationDto) {
    // Get CV with embedding
    const cv = await prisma.cV.findUnique({
      where: { id: data.cvId },
      select: {
        id: true,
        embedding: true,
        userId: true
      }
    });

    if (!cv || !cv.embedding || cv.embedding.length === 0) {
      throw new Error('CV không có embedding. Vui lòng tạo embedding trước.');
    }

    // Build filter conditions
    const whereConditions: any = {
      isActive: true,
      isApproved: true,
      embedding: {
        not: null
      }
    };

    if (data.filters) {
      if (data.filters.location) {
        whereConditions.location = {
          contains: data.filters.location,
          mode: 'insensitive'
        };
      }
      if (data.filters.type) {
        whereConditions.type = data.filters.type;
      }
      if (data.filters.remoteWork !== undefined) {
        whereConditions.remoteWork = data.filters.remoteWork;
      }
    }

    // Get jobs with embeddings
    const jobs = await prisma.job.findMany({
      where: whereConditions,
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true,
            isVerified: true
          }
        }
      },
      take: data.limit * 2 // Get more to filter by similarity
    });

    // Calculate similarity scores
    const jobsWithScores = jobs
      .filter(job => job.embedding && job.embedding.length > 0)
      .map(job => ({
        ...job,
        matchScore: this.calculateCosineSimilarity(cv.embedding, job.embedding!)
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, data.limit);

    // Format response
    return jobsWithScores.map(job => ({
      jobId: job.id,
      title: job.title,
      company: job.company.name,
      location: job.location,
      type: job.type,
      salary: job.salary,
      remoteWork: job.remoteWork,
      matchScore: job.matchScore,
      reason: this.generateRecommendationReason(job.matchScore)
    }));
  }

  // Build text from CV data for embedding
  private buildCVText(cv: any): string {
    let text = `CV: ${cv.title}\n`;
    text += `Name: ${cv.fullName}\n`;
    text += `Current Position: ${cv.currentPosition || ''}\n`;
    text += `Summary: ${cv.summary || ''}\n`;
    text += `Objective: ${cv.objective || ''}\n`;

    // Add work experience
    if (cv.workExperience && cv.workExperience.length > 0) {
      text += '\nWork Experience:\n';
      cv.workExperience.forEach((exp: any) => {
        text += `${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})\n`;
        text += `${exp.description || ''}\n`;
      });
    }

    // Add education
    if (cv.education && cv.education.length > 0) {
      text += '\nEducation:\n';
      cv.education.forEach((edu: any) => {
        text += `${edu.degree} at ${edu.institution}\n`;
        text += `${edu.description || ''}\n`;
      });
    }

    // Add skills
    if (cv.skills && cv.skills.length > 0) {
      text += '\nSkills:\n';
      cv.skills.forEach((skill: any) => {
        text += `${skill.skillName} (${skill.level})`;
        if (skill.yearsOfExperience) {
          text += ` - ${skill.yearsOfExperience} years`;
        }
        text += '\n';
      });
    }

    return text;
  }

  // Build text from Job data for embedding
  private buildJobText(job: any): string {
    let text = `Job: ${job.title}\n`;
    text += `Description: ${job.description || ''}\n`;
    text += `Location: ${job.location || ''}\n`;
    text += `Type: ${job.type}\n`;
    text += `Salary: ${job.salary || ''}\n`;
    text += `Remote Work: ${job.remoteWork ? 'Yes' : 'No'}\n`;

    // Add company info
    if (job.company) {
      text += `Company: ${job.company.name}\n`;
      text += `Industry: ${job.company.industry || ''}\n`;
      text += `Company Description: ${job.company.description || ''}\n`;
    }

    // Add requirements
    if (job.requirements && job.requirements.length > 0) {
      text += '\nRequirements:\n';
      job.requirements.forEach((req: any) => {
        text += `${req.title}: ${req.description || ''}\n`;
      });
    }

    // Add benefits
    if (job.benefits && job.benefits.length > 0) {
      text += '\nBenefits:\n';
      job.benefits.forEach((benefit: any) => {
        text += `${benefit.title}: ${benefit.description || ''}\n`;
      });
    }

    // Add skills
    if (job.jobSkills && job.jobSkills.length > 0) {
      text += '\nRequired Skills:\n';
      job.jobSkills.forEach((skill: any) => {
        text += `${skill.skillName} (${skill.isRequired ? 'Required' : 'Preferred'})\n`;
      });
    }

    return text;
  }

  // Calculate cosine similarity between two vectors
  private calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Generate recommendation reason based on match score
  private generateRecommendationReason(score: number): string {
    if (score >= 0.9) return 'Phù hợp hoàn hảo với hồ sơ của bạn';
    if (score >= 0.8) return 'Rất phù hợp với kỹ năng và kinh nghiệm của bạn';
    if (score >= 0.7) return 'Phù hợp tốt với hồ sơ của bạn';
    if (score >= 0.6) return 'Có thể phù hợp với một số kỹ năng của bạn';
    return 'Có thể tham khảo';
  }
}
