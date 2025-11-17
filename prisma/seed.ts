import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Load environment variables FIRST, before importing PrismaClient
dotenv.config({ path: '.env' });

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
  NotificationType
} from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('🧹 Clearing existing data...');
  
  // Delete in reverse order of dependencies to avoid foreign key constraints
  await prisma.notification.deleteMany({});
  await prisma.savedJob.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.upload.deleteMany({});
  await prisma.jobBenefit.deleteMany({});
  await prisma.jobRequirement.deleteMany({});
  await prisma.cVSkill.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.reference.deleteMany({});
  await prisma.achievement.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.certification.deleteMany({});
  await prisma.language.deleteMany({});
  await prisma.education.deleteMany({});
  await prisma.workExperience.deleteMany({});
  await prisma.socialMedia.deleteMany({});
  await prisma.cV.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.company.deleteMany({});
  
  console.log('✅ Database cleared successfully!');
}

async function main() {
  console.log('🌱 Starting database seeding...');
  
  // Clear existing data first
  await clearDatabase();
  
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // 1. Create Companies
  console.log('🏢 Creating companies...');
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'TechCorp Vietnam',
        website: 'https://techcorp.vn',
        description: 'Leading technology company in Vietnam specializing in enterprise software solutions',
        industry: 'Technology',
        companySize: CompanySize.LARGE,
        foundedYear: 2010,
        address: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
        phone: '+84 28 1234 5678',
        email: 'contact@techcorp.vn',
        status: 'ACTIVE'
      }
    }),
    prisma.company.create({
      data: {
        name: 'StartupXYZ',
        website: 'https://startupxyz.com',
        description: 'Innovative startup focusing on AI and Machine Learning solutions for businesses',
        industry: 'Artificial Intelligence',
        companySize: CompanySize.STARTUP,
        foundedYear: 2022,
        address: '456 Le Loi Boulevard, District 3, Ho Chi Minh City',
        phone: '+84 28 8765 4321',
        email: 'hello@startupxyz.com',
        status: 'REGISTERED'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Global Finance Ltd',
        website: 'https://globalfinance.com',
        description: 'International financial services company providing banking and investment solutions',
        industry: 'Finance',
        companySize: CompanySize.ENTERPRISE,
        foundedYear: 2005,
        address: '789 Dong Khoi Street, District 1, Ho Chi Minh City',
        phone: '+84 28 9999 8888',
        email: 'info@globalfinance.com',
        status: 'ACTIVE'
      }
    }),
    prisma.company.create({
      data: {
        name: 'E-Commerce Pro',
        website: 'https://ecommercepro.vn',
        description: 'Leading e-commerce platform serving millions of customers across Southeast Asia',
        industry: 'E-commerce',
        companySize: CompanySize.LARGE,
        foundedYear: 2015,
        address: '321 Hai Ba Trung Street, District 3, Ho Chi Minh City',
        phone: '+84 28 7777 6666',
        email: 'careers@ecommercepro.vn',
        status: 'ACTIVE'
      }
    })
  ]);

  // 2. Create Users (Admin, Recruiters, Candidates)
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
        status: 'ACTIVE'
      }
    }),
    // Recruiters
    prisma.user.upsert({
      where: { email: 'recruiter1@techcorp.vn' },
      update: {},
      create: {
        email: 'recruiter1@techcorp.vn',
        fullName: 'Nguyen Van Anh',
        passwordHash,
        role: UserRole.RECRUITER,
        phoneNumber: '+84 912 345 678',
        dateOfBirth: new Date('1990-03-20'),
        gender: Gender.FEMALE,
        status: 'ACTIVE'
      }
    }),
    prisma.user.upsert({
      where: { email: 'recruiter2@techcorp.vn' },
      update: {},
      create: {
        email: 'recruiter2@techcorp.vn',
        fullName: 'Tran Minh Duc',
        passwordHash,
        role: UserRole.RECRUITER,
        phoneNumber: '+84 913 456 789',
        dateOfBirth: new Date('1987-08-12'),
        gender: Gender.MALE,
        status: 'ACTIVE'
      }
    }),
    // Candidates
    prisma.user.upsert({
      where: { email: 'frontend.dev1@gmail.com' },
      update: {},
      create: {
        email: 'frontend.dev1@gmail.com',
        fullName: 'Le Van Cong',
        passwordHash,
        role: UserRole.CANDIDATE,
        phoneNumber: '+84 934 567 890',
        dateOfBirth: new Date('1995-05-15'),
        gender: Gender.MALE,
        status: 'ACTIVE'
      }
    }),
    prisma.user.upsert({
      where: { email: 'backend.dev1@gmail.com' },
      update: {},
      create: {
        email: 'backend.dev1@gmail.com',
        fullName: 'Pham Thi Dao',
        passwordHash,
        role: UserRole.CANDIDATE,
        phoneNumber: '+84 945 678 901',
        dateOfBirth: new Date('1992-11-30'),
        gender: Gender.FEMALE,
        status: 'ACTIVE'
      }
    }),
    prisma.user.upsert({
      where: { email: 'fullstack.dev@gmail.com' },
      update: {},
      create: {
        email: 'fullstack.dev@gmail.com',
        fullName: 'Lam Van Phuc',
        passwordHash,
        role: UserRole.CANDIDATE,
        phoneNumber: '+84 948 901 234',
        dateOfBirth: new Date('1988-12-05'),
        gender: Gender.MALE,
        status: 'ACTIVE'
      }
    })
  ]);

  // 3. Create Company Members
  console.log('👔 Creating company members...');
  await Promise.all([
    prisma.companyMember.create({
      data: {
        userId: users[1].id, // recruiter1@techcorp.vn
        companyId: companies[0].id, // TechCorp Vietnam
        companyRole: 'OWNER'
      }
    }),
    prisma.companyMember.create({
      data: {
        userId: users[2].id, // recruiter2@techcorp.vn
        companyId: companies[0].id, // TechCorp Vietnam
        companyRole: 'RECRUITER'
      }
    })
  ]);

  // 4. Create Salaries
  console.log('💰 Creating salaries...');
  const salaries = await Promise.all([
    prisma.salary.create({
      data: {
        minAmount: 25000000,
        maxAmount: 35000000,
        currency: 'VND',
        isNegotiable: false,
        hideAmount: false
      }
    }),
    prisma.salary.create({
      data: {
        minAmount: 20000000,
        maxAmount: 30000000,
        currency: 'VND',
        isNegotiable: false,
        hideAmount: false
      }
    }),
    prisma.salary.create({
      data: {
        minAmount: 25000000,
        maxAmount: 35000000,
        currency: 'VND',
        isNegotiable: true,
        hideAmount: false
      }
    }),
    prisma.salary.create({
      data: {
        minAmount: 30000000,
        maxAmount: 40000000,
        currency: 'VND',
        isNegotiable: false,
        hideAmount: false
      }
    })
  ]);

  // 5. Create Jobs
  console.log('💼 Creating jobs...');
  const jobs = await Promise.all([
    // TechCorp Vietnam Jobs
    prisma.job.create({
      data: {
        title: 'Senior Frontend Developer',
        description: 'We are looking for a Senior Frontend Developer to join our team. You will be responsible for building user-facing features using React and TypeScript, working with a modern tech stack and agile development practices.',
        location: 'Ho Chi Minh City',
        type: JobType.FULL_TIME,
        industry: 'Technology',
        experienceLevel: ExperienceLevel.SENIOR,
        titleEmbedding: [],
        descriptionEmbedding: [],
        requirementEmbedding: [],
        urgent: false,
        status: 'ACTIVE',
        expiresAt: new Date('2024-12-31'),
        companyId: companies[0].id,
        salaryId: salaries[0].id
      }
    }),
    prisma.job.create({
      data: {
        title: 'Backend Developer (Node.js)',
        description: 'Join our backend team to build scalable APIs and microservices using Node.js and PostgreSQL. You will work on high-traffic applications serving millions of users.',
        location: 'Ho Chi Minh City',
        type: JobType.FULL_TIME,
        industry: 'Technology',
        experienceLevel: ExperienceLevel.MID,
        titleEmbedding: [],
        descriptionEmbedding: [],
        requirementEmbedding: [],
        urgent: true,
        status: 'ACTIVE',
        expiresAt: new Date('2024-12-31'),
        companyId: companies[0].id,
        salaryId: salaries[1].id
      }
    }),
    // StartupXYZ Jobs
    prisma.job.create({
      data: {
        title: 'AI/ML Engineer',
        description: 'We are a fast-growing AI startup looking for talented ML engineers to help us build the next generation of AI products. You will work on cutting-edge machine learning models.',
        location: 'Ho Chi Minh City',
        type: JobType.FULL_TIME,
        industry: 'Artificial Intelligence',
        experienceLevel: ExperienceLevel.MID,
        titleEmbedding: [],
        descriptionEmbedding: [],
        requirementEmbedding: [],
        urgent: false,
        status: 'ACTIVE',
        expiresAt: new Date('2024-12-31'),
        companyId: companies[1].id,
        salaryId: salaries[2].id
      }
    }),
    // Global Finance Jobs
    prisma.job.create({
      data: {
        title: 'DevOps Engineer',
        description: 'Looking for a DevOps engineer to help us scale our infrastructure and improve our deployment processes. You will work with modern cloud technologies and automation tools.',
        location: 'Ho Chi Minh City',
        type: JobType.CONTRACT,
        industry: 'Finance',
        experienceLevel: ExperienceLevel.SENIOR,
        titleEmbedding: [],
        descriptionEmbedding: [],
        requirementEmbedding: [],
        urgent: false,
        status: 'ACTIVE',
        expiresAt: new Date('2024-12-31'),
        companyId: companies[2].id,
        salaryId: salaries[3].id
      }
    })
  ]);

  // 6. Create CVs
  console.log('📋 Creating CVs...');
  const cvs = await Promise.all([
    prisma.cV.create({
      data: {
        title: 'Le Van Cong - Senior Frontend Developer CV',
        isMain: true,
        fullName: 'Le Van Cong',
        email: 'frontend.dev1@gmail.com',
        phoneNumber: '+84 934 567 890',
        dateOfBirth: new Date('1995-05-15'),
        gender: Gender.MALE,
        address: '123 Le Loi Street, District 1, Ho Chi Minh City',
        currentPosition: 'Senior Frontend Developer at TechCorp',
        summary: 'Experienced frontend developer with 3+ years of experience in React and TypeScript. Passionate about creating user-friendly interfaces and optimizing web performance.',
        objective: 'Looking for challenging frontend development opportunities in innovative companies',
        titleEmbedding: [],
        experienceEmbedding: [],
        targetEmbedding: [],
        userId: users[3].id
      }
    }),
    prisma.cV.create({
      data: {
        title: 'Pham Thi Dao - Backend Developer CV',
        isMain: true,
        fullName: 'Pham Thi Dao',
        email: 'backend.dev1@gmail.com',
        phoneNumber: '+84 945 678 901',
        dateOfBirth: new Date('1992-11-30'),
        gender: Gender.FEMALE,
        address: '456 Nguyen Trai Street, District 5, Ho Chi Minh City',
        currentPosition: 'Backend Developer at StartupXYZ',
        summary: 'Full-stack developer with expertise in Node.js and PostgreSQL. Strong background in building scalable APIs and microservices.',
        objective: 'Seeking backend development roles in growing companies with modern tech stacks',
        titleEmbedding: [],
        experienceEmbedding: [],
        targetEmbedding: [],
        userId: users[4].id
      }
    }),
    prisma.cV.create({
      data: {
        title: 'Lam Van Phuc - Full-stack Developer CV',
        isMain: true,
        fullName: 'Lam Van Phuc',
        email: 'fullstack.dev@gmail.com',
        phoneNumber: '+84 948 901 234',
        dateOfBirth: new Date('1988-12-05'),
        gender: Gender.MALE,
        address: '789 Dong Khoi Street, District 1, Ho Chi Minh City',
        currentPosition: 'Senior Full-stack Developer at E-Commerce Pro',
        summary: 'Senior full-stack developer with 7+ years of experience. Expert in both frontend and backend technologies with strong leadership skills.',
        objective: 'Looking for senior full-stack development opportunities and team leadership roles',
        titleEmbedding: [],
        experienceEmbedding: [],
        targetEmbedding: [],
        userId: users[5].id
      }
    }),
    // Additional CVs for more diversity
    prisma.cV.create({
      data: {
        title: 'Le Van Cong - Alternative CV (Mobile Focus)',
        isMain: false,
        fullName: 'Le Van Cong',
        email: 'frontend.dev1@gmail.com',
        phoneNumber: '+84 934 567 890',
        dateOfBirth: new Date('1995-05-15'),
        gender: Gender.MALE,
        address: '123 Le Loi Street, District 1, Ho Chi Minh City',
        currentPosition: 'Mobile App Developer',
        summary: 'Mobile app developer with experience in React Native and Flutter. Passionate about cross-platform development.',
        objective: 'Seeking mobile development opportunities',
        titleEmbedding: [],
        experienceEmbedding: [],
        targetEmbedding: [],
        userId: users[3].id
      }
    }),
    prisma.cV.create({
      data: {
        title: 'Pham Thi Dao - DevOps Engineer CV',
        isMain: false,
        fullName: 'Pham Thi Dao',
        email: 'backend.dev1@gmail.com',
        phoneNumber: '+84 945 678 901',
        dateOfBirth: new Date('1992-11-30'),
        gender: Gender.FEMALE,
        address: '456 Nguyen Trai Street, District 5, Ho Chi Minh City',
        currentPosition: 'DevOps Engineer',
        summary: 'DevOps engineer with expertise in AWS, Docker, and CI/CD pipelines. Strong background in infrastructure automation.',
        objective: 'Seeking DevOps and infrastructure roles',
        titleEmbedding: [],
        experienceEmbedding: [],
        targetEmbedding: [],
        userId: users[4].id
      }
    })
  ]);

  // 7. Create Work Experience
  console.log('💼 Creating work experience...');
  await Promise.all([
    // Le Van Cong work experience
    prisma.workExperience.create({
      data: {
        title: 'Senior Frontend Developer',
        company: 'TechCorp Vietnam',
        startDate: new Date('2021-06-01'),
        endDate: new Date('2024-12-31'),
        description: 'Led frontend development for multiple enterprise applications using React and TypeScript. Mentored junior developers and improved team productivity by 30%.',
        cvId: cvs[0].id
      }
    }),
    prisma.workExperience.create({
      data: {
        title: 'Frontend Developer',
        company: 'Digital Agency ABC',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2021-05-31'),
        description: 'Developed responsive web applications for various clients. Worked with Vue.js and modern CSS frameworks.',
        cvId: cvs[0].id
      }
    }),
    // Pham Thi Dao work experience
    prisma.workExperience.create({
      data: {
        title: 'Backend Developer',
        company: 'StartupXYZ',
        startDate: new Date('2020-03-01'),
        endDate: new Date('2024-12-31'),
        description: 'Built scalable APIs and microservices using Node.js and PostgreSQL. Implemented real-time features and optimized database performance.',
        cvId: cvs[1].id
      }
    }),
    prisma.workExperience.create({
      data: {
        title: 'Full-stack Developer',
        company: 'Web Solutions Ltd',
        startDate: new Date('2019-01-01'),
        endDate: new Date('2020-02-28'),
        description: 'Developed full-stack web applications using MEAN stack. Worked on e-commerce platforms and content management systems.',
        cvId: cvs[1].id
      }
    }),
    // Lam Van Phuc work experience
    prisma.workExperience.create({
      data: {
        title: 'Senior Full-stack Developer',
        company: 'E-Commerce Pro',
        startDate: new Date('2018-01-01'),
        endDate: new Date('2024-12-31'),
        description: 'Led development of high-traffic e-commerce platform serving millions of users. Architected microservices and implemented CI/CD pipelines.',
        cvId: cvs[2].id
      }
    }),
    prisma.workExperience.create({
      data: {
        title: 'Full-stack Developer',
        company: 'Tech Startup Inc',
        startDate: new Date('2017-06-01'),
        endDate: new Date('2017-12-31'),
        description: 'Developed MVP for fintech application using React and Node.js. Worked in agile environment with cross-functional team.',
        cvId: cvs[2].id
      }
    }),
    // Mobile CV work experience
    prisma.workExperience.create({
      data: {
        title: 'Mobile App Developer',
        company: 'Mobile Solutions Co',
        startDate: new Date('2021-01-01'),
        endDate: new Date('2022-12-31'),
        description: 'Developed cross-platform mobile applications using React Native and Flutter. Published 5+ apps on app stores.',
        cvId: cvs[3].id
      }
    }),
    // DevOps CV work experience
    prisma.workExperience.create({
      data: {
        title: 'DevOps Engineer',
        company: 'Cloud Infrastructure Ltd',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2023-12-31'),
        description: 'Managed AWS infrastructure for multiple projects. Implemented automated deployment pipelines and monitoring systems.',
        cvId: cvs[4].id
      }
    })
  ]);

  // 8. Create Education
  console.log('🎓 Creating education...');
  await Promise.all([
    // Le Van Cong education
    prisma.education.create({
      data: {
        institution: 'Ho Chi Minh City University of Technology',
        degree: 'Bachelor of Computer Science',
        startDate: new Date('2013-09-01'),
        endDate: new Date('2017-06-30'),
        description: 'Graduated with honors. Focused on software engineering and web development.',
        cvId: cvs[0].id
      }
    }),
    // Pham Thi Dao education
    prisma.education.create({
      data: {
        institution: 'Vietnam National University',
        degree: 'Bachelor of Information Technology',
        startDate: new Date('2010-09-01'),
        endDate: new Date('2014-06-30'),
        description: 'Specialized in database systems and software architecture.',
        cvId: cvs[1].id
      }
    }),
    prisma.education.create({
      data: {
        institution: 'Stanford University (Online)',
        degree: 'Machine Learning Certificate',
        startDate: new Date('2019-01-01'),
        endDate: new Date('2019-12-31'),
        description: 'Completed advanced machine learning course covering deep learning and AI applications.',
        cvId: cvs[1].id
      }
    }),
    // Lam Van Phuc education
    prisma.education.create({
      data: {
        institution: 'University of Science Ho Chi Minh City',
        degree: 'Master of Computer Science',
        startDate: new Date('2015-09-01'),
        endDate: new Date('2017-06-30'),
        description: 'Thesis on distributed systems and cloud computing.',
        cvId: cvs[2].id
      }
    }),
    prisma.education.create({
      data: {
        institution: 'University of Science Ho Chi Minh City',
        degree: 'Bachelor of Computer Science',
        startDate: new Date('2011-09-01'),
        endDate: new Date('2015-06-30'),
        description: 'Graduated magna cum laude. Active in programming competitions.',
        cvId: cvs[2].id
      }
    })
  ]);

  // 9. Create Languages
  console.log('🗣️ Creating languages...');
  await Promise.all([
    prisma.language.create({
      data: {
        name: 'Vietnamese',
        level: 'Native',
        description: 'Mother tongue',
        cvId: cvs[0].id
      }
    }),
    prisma.language.create({
      data: {
        name: 'English',
        level: 'Professional',
        description: 'Fluent in speaking, reading, and writing. TOEIC 850+',
        cvId: cvs[0].id
      }
    }),
    prisma.language.create({
      data: {
        name: 'Vietnamese',
        level: 'Native',
        description: 'Mother tongue',
        cvId: cvs[1].id
      }
    }),
    prisma.language.create({
      data: {
        name: 'English',
        level: 'Professional',
        description: 'Fluent in technical communication. IELTS 7.0',
        cvId: cvs[1].id
      }
    }),
    prisma.language.create({
      data: {
        name: 'Japanese',
        level: 'Conversational',
        description: 'Basic conversation skills. JLPT N3',
        cvId: cvs[1].id
      }
    }),
    prisma.language.create({
      data: {
        name: 'Vietnamese',
        level: 'Native',
        description: 'Mother tongue',
        cvId: cvs[2].id
      }
    }),
    prisma.language.create({
      data: {
        name: 'English',
        level: 'Professional',
        description: 'Fluent in technical and business communication. TOEFL 100+',
        cvId: cvs[2].id
      }
    })
  ]);

  // 10. Create Certifications
  console.log('🏆 Creating certifications...');
  await Promise.all([
    prisma.certification.create({
      data: {
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        acquiredAt: new Date('2023-06-15'),
        description: 'Certified in designing distributed systems on AWS',
        cvId: cvs[1].id
      }
    }),
    prisma.certification.create({
      data: {
        name: 'Google Cloud Professional Developer',
        issuer: 'Google Cloud',
        acquiredAt: new Date('2023-03-20'),
        description: 'Certified in developing applications on Google Cloud Platform',
        cvId: cvs[2].id
      }
    }),
    prisma.certification.create({
      data: {
        name: 'React Developer Certification',
        issuer: 'Meta',
        acquiredAt: new Date('2022-11-10'),
        description: 'Certified React developer with advanced knowledge',
        cvId: cvs[0].id
      }
    }),
    prisma.certification.create({
      data: {
        name: 'Docker Certified Associate',
        issuer: 'Docker Inc',
        acquiredAt: new Date('2023-01-15'),
        description: 'Certified in containerization and orchestration',
        cvId: cvs[4].id
      }
    })
  ]);

  // 11. Create Projects
  console.log('🚀 Creating projects...');
  await Promise.all([
    prisma.project.create({
      data: {
        name: 'E-commerce Dashboard',
        description: 'Built a comprehensive dashboard for e-commerce analytics using React and D3.js',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-06-30'),
        url: 'https://github.com/levancong/ecommerce-dashboard',
        role: 'Lead Developer',
        cvId: cvs[0].id
      }
    }),
    prisma.project.create({
      data: {
        name: 'Real-time Chat API',
        description: 'Developed scalable real-time chat API using Node.js, Socket.io, and Redis',
        startDate: new Date('2023-03-01'),
        endDate: new Date('2023-08-31'),
        url: 'https://github.com/phamthidao/chat-api',
        role: 'Backend Developer',
        cvId: cvs[1].id
      }
    }),
    prisma.project.create({
      data: {
        name: 'Microservices Architecture',
        description: 'Designed and implemented microservices architecture for high-traffic application',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-12-31'),
        url: 'https://github.com/lamvanphuc/microservices',
        role: 'Architecture Lead',
        cvId: cvs[2].id
      }
    }),
    prisma.project.create({
      data: {
        name: 'Mobile Banking App',
        description: 'Cross-platform mobile banking application using React Native',
        startDate: new Date('2022-06-01'),
        endDate: new Date('2023-03-31'),
        url: 'https://github.com/levancong/mobile-banking',
        role: 'Mobile Developer',
        cvId: cvs[3].id
      }
    })
  ]);

  // 12. Create CV Skills
  console.log('🎯 Creating CV skills...');
  await Promise.all([
    // Le Van Cong skills (Frontend CV)
    prisma.cVSkill.create({
      data: {
        skillName: 'JavaScript',
        level: SkillLevel.ADVANCED,
        yearsOfExperience: 3,
        description: 'Expert in ES6+, async programming, and modern JavaScript features',
        cvId: cvs[0].id
      }
    }),
    prisma.cVSkill.create({
      data: {
        skillName: 'TypeScript',
        level: SkillLevel.INTERMEDIATE,
        yearsOfExperience: 2,
        description: 'Strong typing, interfaces, and advanced TypeScript features',
        cvId: cvs[0].id
      }
    }),
    prisma.cVSkill.create({
      data: {
        skillName: 'React',
        level: SkillLevel.ADVANCED,
        yearsOfExperience: 3,
        description: 'Hooks, Context API, performance optimization, and testing',
        cvId: cvs[0].id
      }
    }),
    prisma.cVSkill.create({
      data: {
        skillName: 'CSS',
        level: SkillLevel.ADVANCED,
        yearsOfExperience: 3,
        description: 'CSS3, Flexbox, Grid, animations, and responsive design',
        cvId: cvs[0].id
      }
    }),
    // Pham Thi Dao skills (Backend CV)
    prisma.cVSkill.create({
      data: {
        skillName: 'Node.js',
        level: SkillLevel.EXPERT,
        yearsOfExperience: 5,
        description: 'Express.js, middleware, async programming, and performance optimization',
        cvId: cvs[1].id
      }
    }),
    prisma.cVSkill.create({
      data: {
        skillName: 'PostgreSQL',
        level: SkillLevel.ADVANCED,
        yearsOfExperience: 4,
        description: 'Database design, query optimization, and advanced SQL features',
        cvId: cvs[1].id
      }
    }),
    prisma.cVSkill.create({
      data: {
        skillName: 'MongoDB',
        level: SkillLevel.INTERMEDIATE,
        yearsOfExperience: 2,
        description: 'Document modeling, aggregation pipelines, and indexing',
        cvId: cvs[1].id
      }
    }),
    prisma.cVSkill.create({
      data: {
        skillName: 'Redis',
        level: SkillLevel.INTERMEDIATE,
        yearsOfExperience: 2,
        description: 'Caching strategies, session management, and pub/sub',
        cvId: cvs[1].id
      }
    }),
    // Lam Van Phuc skills (Full-stack CV)
    prisma.cVSkill.create({
      data: {
        skillName: 'JavaScript',
        level: SkillLevel.EXPERT,
        yearsOfExperience: 7,
        description: 'Advanced JavaScript, design patterns, and performance optimization',
        cvId: cvs[2].id
      }
    }),
    prisma.cVSkill.create({
      data: {
        skillName: 'React',
        level: SkillLevel.ADVANCED,
        yearsOfExperience: 5,
        description: 'Advanced React patterns, state management, and testing',
        cvId: cvs[2].id
      }
    }),
    prisma.cVSkill.create({
      data: {
        skillName: 'Node.js',
        level: SkillLevel.EXPERT,
        yearsOfExperience: 6,
        description: 'Microservices, API design, and system architecture',
        cvId: cvs[2].id
      }
    }),
    prisma.cVSkill.create({
      data: {
        skillName: 'Docker',
        level: SkillLevel.ADVANCED,
        yearsOfExperience: 3,
        description: 'Containerization, orchestration, and DevOps practices',
        cvId: cvs[2].id
      }
    }),
    // Mobile CV skills
    prisma.cVSkill.create({
      data: {
        skillName: 'React Native',
        level: SkillLevel.ADVANCED,
        yearsOfExperience: 2,
        description: 'Cross-platform mobile development and native modules',
        cvId: cvs[3].id
      }
    }),
    prisma.cVSkill.create({
      data: {
        skillName: 'Flutter',
        level: SkillLevel.INTERMEDIATE,
        yearsOfExperience: 1,
        description: 'Dart programming and Flutter framework',
        cvId: cvs[3].id
      }
    }),
    // DevOps CV skills
    prisma.cVSkill.create({
      data: {
        skillName: 'AWS',
        level: SkillLevel.EXPERT,
        yearsOfExperience: 4,
        description: 'EC2, S3, RDS, Lambda, and cloud architecture',
        cvId: cvs[4].id
      }
    }),
    prisma.cVSkill.create({
      data: {
        skillName: 'Docker',
        level: SkillLevel.EXPERT,
        yearsOfExperience: 3,
        description: 'Containerization, Docker Compose, and orchestration',
        cvId: cvs[4].id
      }
    }),
    prisma.cVSkill.create({
      data: {
        skillName: 'Kubernetes',
        level: SkillLevel.ADVANCED,
        yearsOfExperience: 2,
        description: 'Container orchestration, scaling, and service mesh',
        cvId: cvs[4].id
      }
    })
  ]);

  // 13. Create Job Requirements
  console.log('📋 Creating job requirements...');
  await Promise.all([
    // Senior Frontend Developer requirements
    prisma.jobRequirement.create({
      data: {
        title: 'Technical Skills',
        description: '3+ years of experience with React, TypeScript, and modern JavaScript. Experience with state management libraries (Redux, Zustand).',
        jobId: jobs[0].id
      }
    }),
    prisma.jobRequirement.create({
      data: {
        title: 'Education',
        description: 'Bachelor degree in Computer Science or related field, or equivalent practical experience.',
        jobId: jobs[0].id
      }
    }),
    prisma.jobRequirement.create({
      data: {
        title: 'Soft Skills',
        description: 'Strong communication skills, ability to work in agile environment, mentoring experience preferred.',
        jobId: jobs[0].id
      }
    }),
    // Backend Developer requirements
    prisma.jobRequirement.create({
      data: {
        title: 'Technical Skills',
        description: '2+ years of experience with Node.js, PostgreSQL, and RESTful API development. Experience with microservices architecture.',
        jobId: jobs[1].id
      }
    }),
    prisma.jobRequirement.create({
      data: {
        title: 'Database Experience',
        description: 'Strong SQL skills, experience with database optimization and performance tuning.',
        jobId: jobs[1].id
      }
    }),
    // AI/ML Engineer requirements
    prisma.jobRequirement.create({
      data: {
        title: 'Machine Learning',
        description: 'Experience with Python, TensorFlow/PyTorch, and machine learning model development.',
        jobId: jobs[2].id
      }
    }),
    prisma.jobRequirement.create({
      data: {
        title: 'Research Background',
        description: 'PhD or Master degree in Computer Science, Mathematics, or related field with focus on AI/ML.',
        jobId: jobs[2].id
      }
    }),
    // DevOps Engineer requirements
    prisma.jobRequirement.create({
      data: {
        title: 'Cloud Platforms',
        description: '3+ years of experience with AWS, Azure, or Google Cloud. Experience with infrastructure as code (Terraform, CloudFormation).',
        jobId: jobs[3].id
      }
    }),
    prisma.jobRequirement.create({
      data: {
        title: 'Containerization',
        description: 'Expert knowledge of Docker and Kubernetes. Experience with CI/CD pipelines and automation.',
        jobId: jobs[3].id
      }
    })
  ]);

  // 14. Create Job Benefits
  console.log('🎁 Creating job benefits...');
  await Promise.all([
    // TechCorp Vietnam benefits
    prisma.jobBenefit.create({
      data: {
        title: 'Competitive Salary',
        description: 'Above market rate salary with performance bonuses and annual reviews.',
        jobId: jobs[0].id
      }
    }),
    prisma.jobBenefit.create({
      data: {
        title: 'Health Insurance',
        description: 'Comprehensive health insurance for employee and family members.',
        jobId: jobs[0].id
      }
    }),
    prisma.jobBenefit.create({
      data: {
        title: 'Remote Work',
        description: 'Flexible remote work policy with modern equipment provided.',
        jobId: jobs[0].id
      }
    }),
    prisma.jobBenefit.create({
      data: {
        title: 'Learning Budget',
        description: 'Annual budget for courses, conferences, and professional development.',
        jobId: jobs[0].id
      }
    }),
    // Backend Developer benefits
    prisma.jobBenefit.create({
      data: {
        title: 'Stock Options',
        description: 'Equity participation in the company growth.',
        jobId: jobs[1].id
      }
    }),
    prisma.jobBenefit.create({
      data: {
        title: 'Flexible Hours',
        description: 'Flexible working hours and work-life balance focus.',
        jobId: jobs[1].id
      }
    }),
    // AI/ML Engineer benefits
    prisma.jobBenefit.create({
      data: {
        title: 'Research Opportunities',
        description: 'Opportunity to work on cutting-edge AI research and publish papers.',
        jobId: jobs[2].id
      }
    }),
    prisma.jobBenefit.create({
      data: {
        title: 'Conference Attendance',
        description: 'Budget for attending international AI/ML conferences.',
        jobId: jobs[2].id
      }
    }),
    // DevOps Engineer benefits
    prisma.jobBenefit.create({
      data: {
        title: 'Premium Health Coverage',
        description: 'Premium health insurance with dental and vision coverage.',
        jobId: jobs[3].id
      }
    }),
    prisma.jobBenefit.create({
      data: {
        title: 'Certification Support',
        description: 'Support for obtaining cloud and DevOps certifications.',
        jobId: jobs[3].id
      }
    })
  ]);

  // 15. Create Applications
  console.log('📝 Creating applications...');
  const applications = await Promise.all([
    // Le Van Cong applies for Senior Frontend Developer
    prisma.application.create({
      data: {
        status: AppStatus.PENDING,
        cvId: cvs[0].id,
        coverLetter: 'I am very interested in this Senior Frontend Developer position at TechCorp Vietnam. With 3+ years of experience in React and TypeScript, I have successfully led frontend development for multiple enterprise applications. I am particularly excited about the opportunity to mentor junior developers and contribute to your innovative projects.',
        notes: 'Strong candidate with relevant experience and leadership potential',
        jobId: jobs[0].id
      }
    }),
    // Pham Thi Dao applies for Backend Developer
    prisma.application.create({
      data: {
        status: AppStatus.PENDING,
        cvId: cvs[1].id,
        coverLetter: 'I am excited about the Backend Developer position. My 5 years of experience with Node.js and PostgreSQL, combined with my expertise in building scalable APIs and microservices, makes me a perfect candidate for this role. I have successfully implemented real-time features and optimized database performance in my current role.',
        notes: 'Strong backend skills with proven track record',
        jobId: jobs[1].id
      }
    }),
    // Lam Van Phuc applies for Senior Frontend Developer (accepted)
    prisma.application.create({
      data: {
        status: AppStatus.ACCEPTED,
        cvId: cvs[2].id,
        coverLetter: 'As a senior full-stack developer with 7 years of experience, I am excited about this opportunity to join TechCorp Vietnam. My expertise in both frontend and backend technologies, combined with my leadership experience in architecting microservices and implementing CI/CD pipelines, aligns perfectly with your requirements.',
        notes: 'Excellent candidate, offer extended - strong technical and leadership skills',
        jobId: jobs[0].id
      }
    }),
    // Le Van Cong applies for AI/ML Engineer with mobile CV
    prisma.application.create({
      data: {
        status: AppStatus.REJECTED,
        cvId: cvs[3].id,
        coverLetter: 'I am interested in transitioning to AI/ML engineering. While my background is in mobile development, I have been learning machine learning concepts and have completed several online courses. I am eager to apply my programming skills to AI/ML projects.',
        notes: 'Good candidate but lacks ML experience - consider for future opportunities',
        jobId: jobs[2].id
      }
    }),
    // Pham Thi Dao applies for DevOps Engineer with DevOps CV
    prisma.application.create({
      data: {
        status: AppStatus.PENDING,
        cvId: cvs[4].id,
        coverLetter: 'I am interested in the DevOps Engineer position. My experience with AWS infrastructure management, automated deployment pipelines, and monitoring systems makes me a strong candidate. I have successfully implemented CI/CD processes and improved system reliability.',
        notes: 'Strong DevOps background, good fit for the role',
        jobId: jobs[3].id
      }
    }),
    // Lam Van Phuc applies for Backend Developer
    prisma.application.create({
      data: {
        status: AppStatus.PENDING,
        cvId: cvs[2].id,
        coverLetter: 'I am interested in the Backend Developer position. My extensive experience with Node.js and microservices architecture, combined with my full-stack background, would allow me to contribute effectively to your backend development team.',
        notes: 'Overqualified but interested in the role',
        jobId: jobs[1].id
      }
    })
  ]);

  // 16. Create Saved Jobs
  console.log('💾 Creating saved jobs...');
  await Promise.all([
    prisma.savedJob.create({
      data: {
        userId: users[3].id,
        jobId: jobs[1].id
      }
    }),
    prisma.savedJob.create({
      data: {
        userId: users[4].id,
        jobId: jobs[2].id
      }
    }),
    prisma.savedJob.create({
      data: {
        userId: users[5].id,
        jobId: jobs[3].id
      }
    }),
    prisma.savedJob.create({
      data: {
        userId: users[3].id,
        jobId: jobs[2].id
      }
    })
  ]);

  // 17. Create Social Media
  console.log('🌐 Creating social media profiles...');
  await Promise.all([
    // Le Van Cong social media
    prisma.socialMedia.create({
      data: {
        platform: 'LinkedIn',
        url: 'https://linkedin.com/in/levancong',
        isVerified: true,
        ownerType: 'User',
        ownerId: users[3].id
      }
    }),
    prisma.socialMedia.create({
      data: {
        platform: 'GitHub',
        url: 'https://github.com/levancong',
        isVerified: true,
        ownerType: 'User',
        ownerId: users[3].id
      }
    }),
    prisma.socialMedia.create({
      data: {
        platform: 'Twitter',
        url: 'https://twitter.com/levancong',
        isVerified: false,
        ownerType: 'User',
        ownerId: users[3].id
      }
    }),
    // Pham Thi Dao social media
    prisma.socialMedia.create({
      data: {
        platform: 'LinkedIn',
        url: 'https://linkedin.com/in/phamthidao',
        isVerified: true,
        ownerType: 'User',
        ownerId: users[4].id
      }
    }),
    prisma.socialMedia.create({
      data: {
        platform: 'GitHub',
        url: 'https://github.com/phamthidao',
        isVerified: true,
        ownerType: 'User',
        ownerId: users[4].id
      }
    }),
    prisma.socialMedia.create({
      data: {
        platform: 'Blog',
        url: 'https://phamthidao.dev',
        isVerified: true,
        ownerType: 'User',
        ownerId: users[4].id
      }
    }),
    // Lam Van Phuc social media
    prisma.socialMedia.create({
      data: {
        platform: 'LinkedIn',
        url: 'https://linkedin.com/in/lamvanphuc',
        isVerified: true,
        ownerType: 'User',
        ownerId: users[5].id
      }
    }),
    prisma.socialMedia.create({
      data: {
        platform: 'GitHub',
        url: 'https://github.com/lamvanphuc',
        isVerified: true,
        ownerType: 'User',
        ownerId: users[5].id
      }
    }),
    prisma.socialMedia.create({
      data: {
        platform: 'Website',
        url: 'https://lamvanphuc.com',
        isVerified: true,
        ownerType: 'User',
        ownerId: users[5].id
      }
    }),
    // Company social media
    prisma.socialMedia.create({
      data: {
        platform: 'LinkedIn',
        url: 'https://linkedin.com/company/techcorp-vietnam',
        isVerified: true,
        ownerType: 'Company',
        ownerId: companies[0].id
      }
    }),
    prisma.socialMedia.create({
      data: {
        platform: 'Website',
        url: 'https://techcorp.vn',
        isVerified: true,
        ownerType: 'Company',
        ownerId: companies[0].id
      }
    }),
    prisma.socialMedia.create({
      data: {
        platform: 'Facebook',
        url: 'https://facebook.com/techcorpvietnam',
        isVerified: true,
        ownerType: 'Company',
        ownerId: companies[0].id
      }
    }),
    prisma.socialMedia.create({
      data: {
        platform: 'LinkedIn',
        url: 'https://linkedin.com/company/startupxyz',
        isVerified: false,
        ownerType: 'Company',
        ownerId: companies[1].id
      }
    }),
    prisma.socialMedia.create({
      data: {
        platform: 'Website',
        url: 'https://startupxyz.com',
        isVerified: false,
        ownerType: 'Company',
        ownerId: companies[1].id
      }
    }),
    prisma.socialMedia.create({
      data: {
        platform: 'LinkedIn',
        url: 'https://linkedin.com/company/global-finance-ltd',
        isVerified: true,
        ownerType: 'Company',
        ownerId: companies[2].id
      }
    }),
    prisma.socialMedia.create({
      data: {
        platform: 'Website',
        url: 'https://globalfinance.com',
        isVerified: true,
        ownerType: 'Company',
        ownerId: companies[2].id
      }
    }),
    // CV social media (for portfolio links)
    prisma.socialMedia.create({
      data: {
        platform: 'Portfolio',
        url: 'https://levancong.dev/portfolio',
        isVerified: true,
        ownerType: 'CV',
        ownerId: cvs[0].id
      }
    }),
    prisma.socialMedia.create({
      data: {
        platform: 'GitHub',
        url: 'https://github.com/levancong/frontend-projects',
        isVerified: true,
        ownerType: 'CV',
        ownerId: cvs[0].id
      }
    }),
    prisma.socialMedia.create({
      data: {
        platform: 'Portfolio',
        url: 'https://phamthidao.dev/backend-projects',
        isVerified: true,
        ownerType: 'CV',
        ownerId: cvs[1].id
      }
    }),
    prisma.socialMedia.create({
      data: {
        platform: 'Portfolio',
        url: 'https://lamvanphuc.com/fullstack-projects',
        isVerified: true,
        ownerType: 'CV',
        ownerId: cvs[2].id
      }
    })
  ]);

  // 18. Create Notifications
  console.log('📢 Creating notifications...');
  await Promise.all([
    prisma.notification.create({
      data: {
        title: 'Application Status Update',
        message: 'Your application for Senior Frontend Developer position has been received and is under review.',
        type: NotificationType.JOB_APPLICATION,
        userId: users[3].id,
        data: {
          jobId: jobs[0].id,
          jobTitle: 'Senior Frontend Developer',
          companyName: 'TechCorp Vietnam'
        }
      }
    }),
    prisma.notification.create({
      data: {
        title: 'Job Offer Extended',
        message: 'Congratulations! You have received a job offer for Senior Frontend Developer position at TechCorp Vietnam.',
        type: NotificationType.JOB_APPROVED,
        userId: users[5].id,
        data: {
          jobId: jobs[0].id,
          jobTitle: 'Senior Frontend Developer',
          companyName: 'TechCorp Vietnam',
          salary: 30000000
        }
      }
    }),
    prisma.notification.create({
      data: {
        title: 'Application Rejected',
        message: 'Thank you for your interest in the AI/ML Engineer position. While we were impressed with your background, we have decided to move forward with other candidates.',
        type: NotificationType.JOB_REJECTED,
        userId: users[3].id,
        data: {
          jobId: jobs[2].id,
          jobTitle: 'AI/ML Engineer',
          companyName: 'StartupXYZ'
        }
      }
    }),
    prisma.notification.create({
      data: {
        title: 'New Job Match',
        message: 'We found a new job that matches your skills: DevOps Engineer at Global Finance Ltd.',
        type: NotificationType.NEW_JOB_MATCH,
        userId: users[4].id,
        data: {
          jobId: jobs[3].id,
          jobTitle: 'DevOps Engineer',
          companyName: 'Global Finance Ltd',
          matchScore: 85
        }
      }
    }),
    prisma.notification.create({
      data: {
        title: 'Company Verified',
        message: 'TechCorp Vietnam has been verified and is now a trusted employer on our platform.',
        type: NotificationType.COMPANY_VERIFIED,
        userId: users[1].id,
        data: {
          companyId: companies[0].id,
          companyName: 'TechCorp Vietnam'
        }
      }
    })
  ]);

  console.log('✅ Database seeding completed successfully!');
  console.log(`📊 Created:`);
  console.log(`   - ${companies.length} companies`);
  console.log(`   - ${users.length} users (1 admin, 2 recruiters, 3 candidates)`);
  console.log(`   - ${jobs.length} jobs`);
  console.log(`   - ${cvs.length} CVs (including alternative CVs)`);
  console.log(`   - ${applications.length} applications`);
  console.log(`   - 4 saved jobs`);
  console.log(`   - 5 notifications`);
  console.log(`   - 20 social media profiles`);
  console.log(`   - Multiple work experiences, education, languages, certifications, and projects`);
  console.log(`   - Job requirements and benefits for all positions`);
  console.log(`   - Comprehensive CV skills with detailed descriptions`);
  console.log(`   - Users are now directly linked to companies (one-to-many relationship)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

