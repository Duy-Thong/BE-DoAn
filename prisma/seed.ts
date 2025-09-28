import { 
  PrismaClient, 
  UserRole, 
  JobType, 
  CompanyRole, 
  AppStatus, 
  Gender, 
  CompanySize, 
  ExperienceLevel, 
  SkillLevel,
  InterviewStatus,
  NotificationType
} from '../src/generated/prisma/index.js';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');
  
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // 1. Create Skills
  console.log('📚 Creating skills...');
  const skills = await Promise.all([
    prisma.skill.upsert({
      where: { name: 'JavaScript' },
      update: {},
      create: { name: 'JavaScript', category: 'Programming' }
    }),
    prisma.skill.upsert({
      where: { name: 'TypeScript' },
      update: {},
      create: { name: 'TypeScript', category: 'Programming' }
    }),
    prisma.skill.upsert({
      where: { name: 'React' },
      update: {},
      create: { name: 'React', category: 'Frontend' }
    }),
    prisma.skill.upsert({
      where: { name: 'Node.js' },
      update: {},
      create: { name: 'Node.js', category: 'Backend' }
    }),
    prisma.skill.upsert({
      where: { name: 'PostgreSQL' },
      update: {},
      create: { name: 'PostgreSQL', category: 'Database' }
    }),
    prisma.skill.upsert({
      where: { name: 'Docker' },
      update: {},
      create: { name: 'Docker', category: 'DevOps' }
    }),
    prisma.skill.upsert({
      where: { name: 'AWS' },
      update: {},
      create: { name: 'AWS', category: 'Cloud' }
    }),
    prisma.skill.upsert({
      where: { name: 'Python' },
      update: {},
      create: { name: 'Python', category: 'Programming' }
    }),
    prisma.skill.upsert({
      where: { name: 'Java' },
      update: {},
      create: { name: 'Java', category: 'Programming' }
    }),
    prisma.skill.upsert({
      where: { name: 'UI/UX Design' },
      update: {},
      create: { name: 'UI/UX Design', category: 'Design' }
    })
  ]);

  // 2. Create Companies
  console.log('🏢 Creating companies...');
  const companies = await Promise.all([
    prisma.company.upsert({
      where: { id: 'company-1' },
      update: {},
      create: {
        id: 'company-1',
        name: 'TechCorp Vietnam',
        website: 'https://techcorp.vn',
        description: 'Leading technology company in Vietnam',
        industry: 'Technology',
        companySize: CompanySize.LARGE,
        foundedYear: 2010,
        taxCode: '0123456789',
        address: '123 Nguyen Hue, District 1, HCMC',
        phone: '+84 28 1234 5678',
        email: 'contact@techcorp.vn',
        isVerified: true,
        isActive: true,
        socialMedia: {
          linkedin: 'https://linkedin.com/company/techcorp-vietnam',
          facebook: 'https://facebook.com/techcorp.vn'
        }
      }
    }),
    prisma.company.upsert({
      where: { id: 'company-2' },
      update: {},
      create: {
        id: 'company-2',
        name: 'StartupXYZ',
        website: 'https://startupxyz.com',
        description: 'Innovative startup focusing on AI and ML',
        industry: 'Artificial Intelligence',
        companySize: CompanySize.STARTUP,
        foundedYear: 2022,
        taxCode: '0987654321',
        address: '456 Le Loi, District 3, HCMC',
        phone: '+84 28 8765 4321',
        email: 'hello@startupxyz.com',
        isVerified: false,
        isActive: true
      }
    }),
    prisma.company.upsert({
      where: { id: 'company-3' },
      update: {},
      create: {
        id: 'company-3',
        name: 'Global Finance Ltd',
        website: 'https://globalfinance.com',
        description: 'International financial services company',
        industry: 'Finance',
        companySize: CompanySize.ENTERPRISE,
        foundedYear: 2005,
        taxCode: '1122334455',
        address: '789 Dong Khoi, District 1, HCMC',
        phone: '+84 28 9999 8888',
        email: 'info@globalfinance.com',
        isVerified: true,
        isActive: true
      }
    })
  ]);

  // 3. Create Users (Admin, Recruiters, Candidates)
  console.log('👥 Creating users...');
  const users = await Promise.all([
    // Admin
    prisma.user.upsert({
      where: { email: 'admin@recruitment.com' },
      update: {},
      create: {
        email: 'admin@recruitment.com',
        fullName: 'System Administrator',
        passwordHash: adminPasswordHash,
        role: UserRole.ADMIN,
        phoneNumber: '+84 901 234 567',
        dateOfBirth: new Date('1985-01-15'),
        gender: Gender.MALE,
        nationality: 'Vietnamese',
        isActive: true,
        isEmailVerified: true
      }
    }),
    // Recruiters
    prisma.user.upsert({
      where: { email: 'recruiter1@techcorp.vn' },
      update: {},
      create: {
        email: 'recruiter1@techcorp.vn',
        fullName: 'Nguyen Van A',
        passwordHash,
        role: UserRole.RECRUITER,
        phoneNumber: '+84 912 345 678',
        dateOfBirth: new Date('1990-03-20'),
        gender: Gender.FEMALE,
        nationality: 'Vietnamese',
        isActive: true,
        isEmailVerified: true,
        companyId: companies[0].id
      }
    }),
    prisma.user.upsert({
      where: { email: 'recruiter2@startupxyz.com' },
      update: {},
      create: {
        email: 'recruiter2@startupxyz.com',
        fullName: 'Tran Thi B',
        passwordHash,
        role: UserRole.RECRUITER,
        phoneNumber: '+84 923 456 789',
        dateOfBirth: new Date('1988-07-10'),
        gender: Gender.FEMALE,
        nationality: 'Vietnamese',
        isActive: true,
        isEmailVerified: true,
        companyId: companies[1].id
      }
    }),
    // Candidates
    prisma.user.upsert({
      where: { email: 'candidate1@gmail.com' },
      update: {},
      create: {
        email: 'candidate1@gmail.com',
        fullName: 'Le Van C',
        passwordHash,
        role: UserRole.CANDIDATE,
        phoneNumber: '+84 934 567 890',
        dateOfBirth: new Date('1995-05-15'),
        gender: Gender.MALE,
        nationality: 'Vietnamese',
        isActive: true,
        isEmailVerified: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'candidate2@gmail.com' },
      update: {},
      create: {
        email: 'candidate2@gmail.com',
        fullName: 'Pham Thi D',
        passwordHash,
        role: UserRole.CANDIDATE,
        phoneNumber: '+84 945 678 901',
        dateOfBirth: new Date('1992-11-30'),
        gender: Gender.FEMALE,
        nationality: 'Vietnamese',
        isActive: true,
        isEmailVerified: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'candidate3@gmail.com' },
      update: {},
      create: {
        email: 'candidate3@gmail.com',
        fullName: 'Hoang Van E',
        passwordHash,
        role: UserRole.CANDIDATE,
        phoneNumber: '+84 956 789 012',
        dateOfBirth: new Date('1998-09-22'),
        gender: Gender.MALE,
        nationality: 'Vietnamese',
        isActive: true,
        isEmailVerified: true
      }
    })
  ]);

  // 4. Create Company Members
  console.log('👔 Creating company members...');
  await Promise.all([
    prisma.companyMember.upsert({
      where: { 
        userId_companyId: {
          userId: users[1].id,
          companyId: companies[0].id
        }
      },
      update: {},
      create: {
        role: CompanyRole.OWNER,
        userId: users[1].id, // recruiter1
        companyId: companies[0].id,
        invitedBy: users[0].id // admin
      }
    }),
    prisma.companyMember.upsert({
      where: { 
        userId_companyId: {
          userId: users[2].id,
          companyId: companies[1].id
        }
      },
      update: {},
      create: {
        role: CompanyRole.MANAGER,
        userId: users[2].id, // recruiter2
        companyId: companies[1].id,
        invitedBy: users[0].id // admin
      }
    })
  ]);

  // 5. Create User Skills
  console.log('🎯 Creating user skills...');
  console.log('Users created:', users.length);
  const candidateUsers = users.slice(3); // Get candidate users
  console.log('Candidate users:', candidateUsers.length);
  await Promise.all([
    // Candidate 1 skills
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[0].id,
          skillId: skills[0].id
        }
      },
      update: {},
      create: {
        level: SkillLevel.ADVANCED,
        yearsOfExperience: 3,
        userId: candidateUsers[0].id,
        skillId: skills[0].id // JavaScript
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[0].id,
          skillId: skills[1].id
        }
      },
      update: {},
      create: {
        level: SkillLevel.INTERMEDIATE,
        yearsOfExperience: 2,
        userId: candidateUsers[0].id,
        skillId: skills[1].id // TypeScript
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[0].id,
          skillId: skills[2].id
        }
      },
      update: {},
      create: {
        level: SkillLevel.ADVANCED,
        yearsOfExperience: 3,
        userId: candidateUsers[0].id,
        skillId: skills[2].id // React
      }
    }),
    // Candidate 2 skills
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[1].id,
          skillId: skills[3].id
        }
      },
      update: {},
      create: {
        level: SkillLevel.EXPERT,
        yearsOfExperience: 5,
        userId: candidateUsers[1].id,
        skillId: skills[3].id // Node.js
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[1].id,
          skillId: skills[4].id
        }
      },
      update: {},
      create: {
        level: SkillLevel.ADVANCED,
        yearsOfExperience: 4,
        userId: candidateUsers[1].id,
        skillId: skills[4].id // PostgreSQL
      }
    }),
    // Candidate 3 skills
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[2].id,
          skillId: skills[7].id
        }
      },
      update: {},
      create: {
        level: SkillLevel.INTERMEDIATE,
        yearsOfExperience: 1,
        userId: candidateUsers[2].id,
        skillId: skills[7].id // Python
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[2].id,
          skillId: skills[8].id
        }
      },
      update: {},
      create: {
        level: SkillLevel.BEGINNER,
        yearsOfExperience: 1,
        userId: candidateUsers[2].id,
        skillId: skills[8].id // Java
      }
    })
  ]);

  // 6. Create Jobs
  console.log('💼 Creating jobs...');
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        title: 'Senior Frontend Developer',
        description: 'We are looking for a Senior Frontend Developer to join our team. You will be responsible for building user-facing features using React and TypeScript.',
        location: 'Ho Chi Minh City',
        type: JobType.FULL_TIME,
        industry: 'Technology',
        experienceLevel: ExperienceLevel.SENIOR,
        salary: '25,000,000 - 35,000,000 VND',
        requirements: '3+ years experience with React, TypeScript, and modern frontend tools',
        benefits: 'Health insurance, flexible working hours, remote work options',
        remoteWork: true,
        urgent: false,
        featured: true,
        isActive: true,
        isApproved: true,
        companyId: companies[0].id
      }
    }),
    prisma.job.create({
      data: {
        title: 'Backend Developer (Node.js)',
        description: 'Join our backend team to build scalable APIs and microservices using Node.js and PostgreSQL.',
        location: 'Ho Chi Minh City',
        type: JobType.FULL_TIME,
        industry: 'Technology',
        experienceLevel: ExperienceLevel.MID,
        salary: '20,000,000 - 30,000,000 VND',
        requirements: '2+ years experience with Node.js, PostgreSQL, and REST APIs',
        benefits: 'Competitive salary, learning opportunities, team building',
        remoteWork: false,
        urgent: true,
        featured: false,
        isActive: true,
        isApproved: true,
        companyId: companies[0].id
      }
    }),
    prisma.job.create({
      data: {
        title: 'AI/ML Engineer',
        description: 'We are a fast-growing AI startup looking for talented ML engineers to help us build the next generation of AI products.',
        location: 'Ho Chi Minh City',
        type: JobType.FULL_TIME,
        industry: 'Artificial Intelligence',
        experienceLevel: ExperienceLevel.JUNIOR,
        salary: '15,000,000 - 25,000,000 VND',
        requirements: 'Experience with Python, machine learning frameworks, and data analysis',
        benefits: 'Equity options, flexible schedule, cutting-edge technology',
        remoteWork: true,
        urgent: false,
        featured: true,
        isActive: true,
        isApproved: true,
        companyId: companies[1].id
      }
    }),
    prisma.job.create({
      data: {
        title: 'DevOps Engineer',
        description: 'Looking for a DevOps engineer to help us scale our infrastructure and improve our deployment processes.',
        location: 'Ho Chi Minh City',
        type: JobType.CONTRACT,
        industry: 'Technology',
        experienceLevel: ExperienceLevel.SENIOR,
        salary: '30,000,000 - 40,000,000 VND',
        requirements: 'Experience with Docker, AWS, CI/CD pipelines, and infrastructure automation',
        benefits: 'High salary, project-based work, latest tools',
        remoteWork: true,
        urgent: false,
        featured: false,
        isActive: true,
        isApproved: true,
        companyId: companies[2].id
      }
    })
  ]);

  // 7. Create Job Skills
  console.log('🔧 Creating job skills...');
  await Promise.all([
    // Frontend Developer job skills
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[0].id,
        skillId: skills[0].id, // JavaScript
        companyId: companies[0].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[0].id,
        skillId: skills[1].id, // TypeScript
        companyId: companies[0].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[0].id,
        skillId: skills[2].id, // React
        companyId: companies[0].id
      }
    }),
    // Backend Developer job skills
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[1].id,
        skillId: skills[3].id, // Node.js
        companyId: companies[0].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[1].id,
        skillId: skills[4].id, // PostgreSQL
        companyId: companies[0].id
      }
    }),
    // AI/ML Engineer job skills
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[2].id,
        skillId: skills[7].id, // Python
        companyId: companies[1].id
      }
    }),
    // DevOps Engineer job skills
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[3].id,
        skillId: skills[5].id, // Docker
        companyId: companies[2].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[3].id,
        skillId: skills[6].id, // AWS
        companyId: companies[2].id
      }
    })
  ]);

  // 8. Create Profiles
  console.log('📄 Creating profiles...');
  await Promise.all([
    prisma.profile.create({
      data: {
        userId: candidateUsers[0].id,
        headline: 'Frontend Developer with 3+ years experience in React and TypeScript',
        location: 'Ho Chi Minh City',
        experience: '3 years of frontend development experience',
        education: 'Bachelor of Computer Science - HCMUS',
        skills: 'React, TypeScript, JavaScript, HTML, CSS, Git',
        avatarUrl: 'https://example.com/avatar1.jpg'
      }
    }),
    prisma.profile.create({
      data: {
        userId: candidateUsers[1].id,
        headline: 'Full-stack Developer specializing in Node.js and PostgreSQL',
        location: 'Ho Chi Minh City',
        experience: '5 years of full-stack development experience',
        education: 'Master of Software Engineering - UIT',
        skills: 'Node.js, PostgreSQL, JavaScript, Express, REST APIs',
        avatarUrl: 'https://example.com/avatar2.jpg'
      }
    }),
    prisma.profile.create({
      data: {
        userId: candidateUsers[2].id,
        headline: 'Junior Developer eager to learn and grow in AI/ML field',
        location: 'Ho Chi Minh City',
        experience: '1 year of programming experience',
        education: 'Bachelor of Information Technology - HCMUT',
        skills: 'Python, Java, Machine Learning basics, Data Analysis',
        avatarUrl: 'https://example.com/avatar3.jpg'
      }
    })
  ]);

  // 9. Create CVs
  console.log('📋 Creating CVs...');
  console.log('candidateUsers[0]:', candidateUsers[0]);
  const cvs = await Promise.all([
    prisma.cV.create({
      data: {
        title: 'Le Van C - Frontend Developer CV',
        fileName: 'le_van_c_cv.pdf',
        fileUrl: 'https://example.com/cvs/le_van_c_cv.pdf',
        fileSize: 1024000,
        isMain: true,
        userId: candidateUsers[0].id
      }
    }),
    prisma.cV.create({
      data: {
        title: 'Pham Thi D - Full-stack Developer CV',
        fileName: 'pham_thi_d_cv.pdf',
        fileUrl: 'https://example.com/cvs/pham_thi_d_cv.pdf',
        fileSize: 1200000,
        isMain: true,
        userId: candidateUsers[1].id
      }
    }),
    prisma.cV.create({
      data: {
        title: 'Hoang Van E - Junior Developer CV',
        fileName: 'hoang_van_e_cv.pdf',
        fileUrl: 'https://example.com/cvs/hoang_van_e_cv.pdf',
        fileSize: 950000,
        isMain: true,
        userId: candidateUsers[2].id
      }
    })
  ]);

  // 10. Create Applications
  console.log('📝 Creating applications...');
  const applications = await Promise.all([
    prisma.application.create({
      data: {
        status: AppStatus.PENDING,
        cvId: cvs[0].id,
        coverLetter: 'I am very interested in this Frontend Developer position. I have 3+ years of experience with React and TypeScript, and I believe I would be a great fit for your team.',
        expectedSalary: '30,000,000 VND',
        availableFrom: new Date('2024-02-01'),
        notes: 'Strong candidate with relevant experience',
        userId: candidateUsers[0].id,
        jobId: jobs[0].id
      }
    }),
    prisma.application.create({
      data: {
        status: AppStatus.REVIEWING,
        cvId: cvs[1].id,
        coverLetter: 'I am excited about the Backend Developer position. My experience with Node.js and PostgreSQL makes me a perfect candidate for this role.',
        expectedSalary: '28,000,000 VND',
        availableFrom: new Date('2024-01-15'),
        notes: 'Excellent technical skills',
        userId: candidateUsers[1].id,
        jobId: jobs[1].id
      }
    }),
    prisma.application.create({
      data: {
        status: AppStatus.INTERVIEW,
        cvId: cvs[2].id,
        coverLetter: 'I am a recent graduate with a passion for AI and machine learning. I am eager to learn and contribute to your innovative projects.',
        expectedSalary: '18,000,000 VND',
        availableFrom: new Date('2024-01-20'),
        notes: 'Fresh graduate with potential',
        userId: candidateUsers[2].id,
        jobId: jobs[2].id
      }
    })
  ]);

  // 11. Create Interviews
  console.log('🎤 Creating interviews...');
  await prisma.interview.create({
    data: {
      title: 'Technical Interview - AI/ML Engineer',
      description: 'Technical interview focusing on Python programming and machine learning concepts',
      scheduledAt: new Date('2024-01-25T14:00:00Z'),
      duration: 60,
      location: 'Online - Google Meet',
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      status: InterviewStatus.SCHEDULED,
      notes: 'Focus on Python skills and ML fundamentals',
      applicationId: applications[2].id,
      interviewerId: users[2].id, // recruiter2
      jobId: jobs[2].id
    }
  });

  // 12. Create Saved Jobs
  console.log('💾 Creating saved jobs...');
  await Promise.all([
    prisma.savedJob.create({
      data: {
        userId: candidateUsers[0].id,
        jobId: jobs[1].id // Backend Developer
      }
    }),
    prisma.savedJob.create({
      data: {
        userId: candidateUsers[1].id,
        jobId: jobs[3].id // DevOps Engineer
      }
    })
  ]);

  // 13. Create Job Alerts
  console.log('🔔 Creating job alerts...');
  await Promise.all([
    prisma.jobAlert.create({
      data: {
        userId: candidateUsers[0].id,
        keywords: 'React, TypeScript, Frontend',
        location: 'Ho Chi Minh City',
        type: JobType.FULL_TIME
      }
    }),
    prisma.jobAlert.create({
      data: {
        userId: candidateUsers[1].id,
        keywords: 'Node.js, Backend, API',
        location: 'Ho Chi Minh City',
        type: JobType.FULL_TIME
      }
    })
  ]);

  // 14. Create Notifications
  console.log('📢 Creating notifications...');
  await Promise.all([
    prisma.notification.create({
      data: {
        title: 'Application Status Update',
        message: 'Your application for Backend Developer position has been moved to reviewing stage.',
        type: NotificationType.APPLICATION_STATUS_CHANGED,
        data: {
          applicationId: applications[1].id,
          jobTitle: 'Backend Developer (Node.js)'
        },
        userId: candidateUsers[1].id
      }
    }),
    prisma.notification.create({
      data: {
        title: 'Interview Scheduled',
        message: 'Your interview for AI/ML Engineer position has been scheduled for January 25, 2024.',
        type: NotificationType.INTERVIEW_SCHEDULED,
        data: {
          interviewId: 'interview-1',
          jobTitle: 'AI/ML Engineer',
          scheduledAt: '2024-01-25T14:00:00Z'
        },
        userId: candidateUsers[2].id
      }
    })
  ]);

  // 15. Create Company Reviews
  console.log('⭐ Creating company reviews...');
  await prisma.companyReview.create({
    data: {
      rating: 5,
      title: 'Great company to work for',
      comment: 'Excellent work environment, supportive team, and great learning opportunities.',
      pros: 'Good salary, flexible hours, great team',
      cons: 'Sometimes long hours during project deadlines',
      isVerified: true,
      userId: candidateUsers[0].id,
      companyId: companies[0].id
    }
  });

  // 16. Create Job Recommendations
  console.log('🎯 Creating job recommendations...');
  await Promise.all([
    prisma.jobRecommendation.create({
      data: {
        score: 0.85,
        reason: 'Strong match based on React and TypeScript skills',
        jobId: jobs[0].id,
        userId: candidateUsers[0].id
      }
    }),
    prisma.jobRecommendation.create({
      data: {
        score: 0.92,
        reason: 'Excellent match for Node.js and PostgreSQL experience',
        jobId: jobs[1].id,
        userId: candidateUsers[1].id
      }
    })
  ]);

  // 17. Create Internal Notes
  console.log('📝 Creating internal notes...');
  await prisma.internalNote.create({
    data: {
      content: 'Candidate shows strong technical skills and good communication. Recommended for next round.',
      isPrivate: false,
      authorId: users[1].id, // recruiter1
      applicationId: applications[1].id
    }
  });

  // 18. Create Audit Logs
  console.log('📊 Creating audit logs...');
  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entityType: 'Application',
      entityId: applications[0].id,
      newValues: {
        status: 'PENDING',
        jobId: jobs[0].id,
        userId: candidateUsers[0].id
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      userId: candidateUsers[0].id
    }
  });

  console.log('✅ Database seeding completed successfully!');
  console.log(`📊 Created:`);
  console.log(`   - ${skills.length} skills`);
  console.log(`   - ${companies.length} companies`);
  console.log(`   - ${users.length} users`);
  console.log(`   - ${jobs.length} jobs`);
  console.log(`   - ${cvs.length} CVs`);
  console.log(`   - ${applications.length} applications`);
  console.log(`   - 1 interview`);
  console.log(`   - 2 saved jobs`);
  console.log(`   - 2 job alerts`);
  console.log(`   - 2 notifications`);
  console.log(`   - 1 company review`);
  console.log(`   - 2 job recommendations`);
  console.log(`   - 1 internal note`);
  console.log(`   - 1 audit log`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
