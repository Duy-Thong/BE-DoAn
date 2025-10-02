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
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('🧹 Clearing existing data...');
  
  // Delete in reverse order of dependencies to avoid foreign key constraints
  await prisma.auditLog.deleteMany({});
  await prisma.internalNote.deleteMany({});
  await prisma.jobRecommendation.deleteMany({});
  await prisma.companyReview.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.jobAlert.deleteMany({});
  await prisma.savedJob.deleteMany({});
  await prisma.interview.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.cV.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.jobSkill.deleteMany({});
  await prisma.userSkill.deleteMany({});
  await prisma.companyMember.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.skill.deleteMany({});
  
  console.log('✅ Database cleared successfully!');
}

async function main() {
  console.log('🌱 Starting database seeding...');
  
  // Clear existing data first
  await clearDatabase();
  
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // 1. Create Skills
  console.log('📚 Creating skills...');
  const skills = await Promise.all([
    // Programming Languages
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
      where: { name: 'C#' },
      update: {},
      create: { name: 'C#', category: 'Programming' }
    }),
    prisma.skill.upsert({
      where: { name: 'PHP' },
      update: {},
      create: { name: 'PHP', category: 'Programming' }
    }),
    prisma.skill.upsert({
      where: { name: 'Go' },
      update: {},
      create: { name: 'Go', category: 'Programming' }
    }),
    prisma.skill.upsert({
      where: { name: 'Rust' },
      update: {},
      create: { name: 'Rust', category: 'Programming' }
    }),
    // Frontend Technologies
    prisma.skill.upsert({
      where: { name: 'React' },
      update: {},
      create: { name: 'React', category: 'Frontend' }
    }),
    prisma.skill.upsert({
      where: { name: 'Vue.js' },
      update: {},
      create: { name: 'Vue.js', category: 'Frontend' }
    }),
    prisma.skill.upsert({
      where: { name: 'Angular' },
      update: {},
      create: { name: 'Angular', category: 'Frontend' }
    }),
    prisma.skill.upsert({
      where: { name: 'HTML/CSS' },
      update: {},
      create: { name: 'HTML/CSS', category: 'Frontend' }
    }),
    prisma.skill.upsert({
      where: { name: 'Tailwind CSS' },
      update: {},
      create: { name: 'Tailwind CSS', category: 'Frontend' }
    }),
    prisma.skill.upsert({
      where: { name: 'Sass/SCSS' },
      update: {},
      create: { name: 'Sass/SCSS', category: 'Frontend' }
    }),
    // Backend Technologies
    prisma.skill.upsert({
      where: { name: 'Node.js' },
      update: {},
      create: { name: 'Node.js', category: 'Backend' }
    }),
    prisma.skill.upsert({
      where: { name: 'Express.js' },
      update: {},
      create: { name: 'Express.js', category: 'Backend' }
    }),
    prisma.skill.upsert({
      where: { name: 'Django' },
      update: {},
      create: { name: 'Django', category: 'Backend' }
    }),
    prisma.skill.upsert({
      where: { name: 'Flask' },
      update: {},
      create: { name: 'Flask', category: 'Backend' }
    }),
    prisma.skill.upsert({
      where: { name: 'Spring Boot' },
      update: {},
      create: { name: 'Spring Boot', category: 'Backend' }
    }),
    prisma.skill.upsert({
      where: { name: 'ASP.NET Core' },
      update: {},
      create: { name: 'ASP.NET Core', category: 'Backend' }
    }),
    prisma.skill.upsert({
      where: { name: 'Laravel' },
      update: {},
      create: { name: 'Laravel', category: 'Backend' }
    }),
    // Databases
    prisma.skill.upsert({
      where: { name: 'PostgreSQL' },
      update: {},
      create: { name: 'PostgreSQL', category: 'Database' }
    }),
    prisma.skill.upsert({
      where: { name: 'MySQL' },
      update: {},
      create: { name: 'MySQL', category: 'Database' }
    }),
    prisma.skill.upsert({
      where: { name: 'MongoDB' },
      update: {},
      create: { name: 'MongoDB', category: 'Database' }
    }),
    prisma.skill.upsert({
      where: { name: 'Redis' },
      update: {},
      create: { name: 'Redis', category: 'Database' }
    }),
    prisma.skill.upsert({
      where: { name: 'Oracle' },
      update: {},
      create: { name: 'Oracle', category: 'Database' }
    }),
    prisma.skill.upsert({
      where: { name: 'SQL Server' },
      update: {},
      create: { name: 'SQL Server', category: 'Database' }
    }),
    // DevOps & Cloud
    prisma.skill.upsert({
      where: { name: 'Docker' },
      update: {},
      create: { name: 'Docker', category: 'DevOps' }
    }),
    prisma.skill.upsert({
      where: { name: 'Kubernetes' },
      update: {},
      create: { name: 'Kubernetes', category: 'DevOps' }
    }),
    prisma.skill.upsert({
      where: { name: 'AWS' },
      update: {},
      create: { name: 'AWS', category: 'Cloud' }
    }),
    prisma.skill.upsert({
      where: { name: 'Azure' },
      update: {},
      create: { name: 'Azure', category: 'Cloud' }
    }),
    prisma.skill.upsert({
      where: { name: 'Google Cloud' },
      update: {},
      create: { name: 'Google Cloud', category: 'Cloud' }
    }),
    prisma.skill.upsert({
      where: { name: 'Jenkins' },
      update: {},
      create: { name: 'Jenkins', category: 'DevOps' }
    }),
    prisma.skill.upsert({
      where: { name: 'GitLab CI/CD' },
      update: {},
      create: { name: 'GitLab CI/CD', category: 'DevOps' }
    }),
    // Design & Other
    prisma.skill.upsert({
      where: { name: 'UI/UX Design' },
      update: {},
      create: { name: 'UI/UX Design', category: 'Design' }
    }),
    prisma.skill.upsert({
      where: { name: 'Figma' },
      update: {},
      create: { name: 'Figma', category: 'Design' }
    }),
    prisma.skill.upsert({
      where: { name: 'Adobe Photoshop' },
      update: {},
      create: { name: 'Adobe Photoshop', category: 'Design' }
    }),
    prisma.skill.upsert({
      where: { name: 'Sketch' },
      update: {},
      create: { name: 'Sketch', category: 'Design' }
    }),
    // Mobile Development
    prisma.skill.upsert({
      where: { name: 'React Native' },
      update: {},
      create: { name: 'React Native', category: 'Mobile' }
    }),
    prisma.skill.upsert({
      where: { name: 'Flutter' },
      update: {},
      create: { name: 'Flutter', category: 'Mobile' }
    }),
    prisma.skill.upsert({
      where: { name: 'Swift' },
      update: {},
      create: { name: 'Swift', category: 'Mobile' }
    }),
    prisma.skill.upsert({
      where: { name: 'Kotlin' },
      update: {},
      create: { name: 'Kotlin', category: 'Mobile' }
    }),
    // Data & AI
    prisma.skill.upsert({
      where: { name: 'Machine Learning' },
      update: {},
      create: { name: 'Machine Learning', category: 'AI/ML' }
    }),
    prisma.skill.upsert({
      where: { name: 'Deep Learning' },
      update: {},
      create: { name: 'Deep Learning', category: 'AI/ML' }
    }),
    prisma.skill.upsert({
      where: { name: 'TensorFlow' },
      update: {},
      create: { name: 'TensorFlow', category: 'AI/ML' }
    }),
    prisma.skill.upsert({
      where: { name: 'PyTorch' },
      update: {},
      create: { name: 'PyTorch', category: 'AI/ML' }
    }),
    prisma.skill.upsert({
      where: { name: 'Data Analysis' },
      update: {},
      create: { name: 'Data Analysis', category: 'Data Science' }
    }),
    prisma.skill.upsert({
      where: { name: 'Business Intelligence' },
      update: {},
      create: { name: 'Business Intelligence', category: 'Data Science' }
    })
  ]);

  // 2. Create Companies
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
        taxCode: '0123456789',
        address: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
        phone: '+84 28 1234 5678',
        email: 'contact@techcorp.vn',
        isVerified: true,
        isActive: true,
        socialMedia: {
          linkedin: 'https://linkedin.com/company/techcorp-vietnam',
          facebook: 'https://facebook.com/techcorp.vn',
          twitter: 'https://twitter.com/techcorp_vn'
        }
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
        taxCode: '0987654321',
        address: '456 Le Loi Boulevard, District 3, Ho Chi Minh City',
        phone: '+84 28 8765 4321',
        email: 'hello@startupxyz.com',
        isVerified: false,
        isActive: true,
        socialMedia: {
          linkedin: 'https://linkedin.com/company/startupxyz',
          facebook: 'https://facebook.com/startupxyz'
        }
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
        taxCode: '1122334455',
        address: '789 Dong Khoi Street, District 1, Ho Chi Minh City',
        phone: '+84 28 9999 8888',
        email: 'info@globalfinance.com',
        isVerified: true,
        isActive: true,
        socialMedia: {
          linkedin: 'https://linkedin.com/company/global-finance-ltd',
          facebook: 'https://facebook.com/globalfinance',
          twitter: 'https://twitter.com/globalfinance'
        }
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
        taxCode: '2233445566',
        address: '321 Hai Ba Trung Street, District 3, Ho Chi Minh City',
        phone: '+84 28 7777 6666',
        email: 'careers@ecommercepro.vn',
        isVerified: true,
        isActive: true,
        socialMedia: {
          linkedin: 'https://linkedin.com/company/ecommerce-pro',
          facebook: 'https://facebook.com/ecommercepro.vn'
        }
      }
    }),
    prisma.company.create({
      data: {
        name: 'HealthTech Solutions',
        website: 'https://healthtech.io',
        description: 'Healthcare technology company developing innovative medical software and devices',
        industry: 'Healthcare Technology',
        companySize: CompanySize.MEDIUM,
        foundedYear: 2018,
        taxCode: '3344556677',
        address: '555 Pasteur Street, District 3, Ho Chi Minh City',
        phone: '+84 28 5555 4444',
        email: 'contact@healthtech.io',
        isVerified: true,
        isActive: true,
        socialMedia: {
          linkedin: 'https://linkedin.com/company/healthtech-solutions'
        }
      }
    }),
    prisma.company.create({
      data: {
        name: 'GameStudio Creative',
        website: 'https://gamestudio.vn',
        description: 'Mobile game development studio creating engaging games for global audiences',
        industry: 'Gaming',
        companySize: CompanySize.SMALL,
        foundedYear: 2020,
        taxCode: '4455667788',
        address: '888 Vo Van Tan Street, District 3, Ho Chi Minh City',
        phone: '+84 28 3333 2222',
        email: 'jobs@gamestudio.vn',
        isVerified: false,
        isActive: true
      }
    }),
    prisma.company.create({
      data: {
        name: 'CloudOps Vietnam',
        website: 'https://cloudops.vn',
        description: 'Cloud infrastructure and DevOps consulting company helping businesses scale',
        industry: 'Cloud Computing',
        companySize: CompanySize.MEDIUM,
        foundedYear: 2019,
        taxCode: '5566778899',
        address: '999 Cach Mang Thang 8 Street, District 3, Ho Chi Minh City',
        phone: '+84 28 1111 9999',
        email: 'hiring@cloudops.vn',
        isVerified: true,
        isActive: true,
        socialMedia: {
          linkedin: 'https://linkedin.com/company/cloudops-vietnam',
          twitter: 'https://twitter.com/cloudops_vn'
        }
      }
    }),
    prisma.company.create({
      data: {
        name: 'DataInsights Analytics',
        website: 'https://datainsights.com',
        description: 'Big data analytics company providing business intelligence solutions',
        industry: 'Data Analytics',
        companySize: CompanySize.SMALL,
        foundedYear: 2021,
        taxCode: '6677889900',
        address: '111 Nguyen Thi Minh Khai Street, District 1, Ho Chi Minh City',
        phone: '+84 28 2222 8888',
        email: 'careers@datainsights.com',
        isVerified: false,
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
    // Recruiters for TechCorp Vietnam
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
        nationality: 'Vietnamese',
        isActive: true,
        isEmailVerified: true,
        companyId: companies[0].id
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
        nationality: 'Vietnamese',
        isActive: true,
        isEmailVerified: true,
        companyId: companies[0].id
      }
    }),
    // Recruiters for StartupXYZ
    prisma.user.upsert({
      where: { email: 'recruiter@startupxyz.com' },
      update: {},
      create: {
        email: 'recruiter@startupxyz.com',
        fullName: 'Le Thi Bich',
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
    // Recruiters for other companies
    prisma.user.upsert({
      where: { email: 'hr@globalfinance.com' },
      update: {},
      create: {
        email: 'hr@globalfinance.com',
        fullName: 'Pham Van Cuong',
        passwordHash,
        role: UserRole.RECRUITER,
        phoneNumber: '+84 924 567 890',
        dateOfBirth: new Date('1985-04-15'),
        gender: Gender.MALE,
        nationality: 'Vietnamese',
        isActive: true,
        isEmailVerified: true,
        companyId: companies[2].id
      }
    }),
    prisma.user.upsert({
      where: { email: 'hiring@ecommercepro.vn' },
      update: {},
      create: {
        email: 'hiring@ecommercepro.vn',
        fullName: 'Hoang Thi Mai',
        passwordHash,
        role: UserRole.RECRUITER,
        phoneNumber: '+84 925 678 901',
        dateOfBirth: new Date('1991-12-03'),
        gender: Gender.FEMALE,
        nationality: 'Vietnamese',
        isActive: true,
        isEmailVerified: true,
        companyId: companies[3].id
      }
    }),
    prisma.user.upsert({
      where: { email: 'talent@healthtech.io' },
      update: {},
      create: {
        email: 'talent@healthtech.io',
        fullName: 'Vu Van Hieu',
        passwordHash,
        role: UserRole.RECRUITER,
        phoneNumber: '+84 926 789 012',
        dateOfBirth: new Date('1989-09-18'),
        gender: Gender.MALE,
        nationality: 'Vietnamese',
        isActive: true,
        isEmailVerified: true,
        companyId: companies[4].id
      }
    }),
    // Candidates - Frontend/UI Developers
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
        nationality: 'Vietnamese',
        isActive: true,
        isEmailVerified: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'react.developer@gmail.com' },
      update: {},
      create: {
        email: 'react.developer@gmail.com',
        fullName: 'Nguyen Thi Linh',
        passwordHash,
        role: UserRole.CANDIDATE,
        phoneNumber: '+84 935 678 901',
        dateOfBirth: new Date('1993-02-28'),
        gender: Gender.FEMALE,
        nationality: 'Vietnamese',
        isActive: true,
        isEmailVerified: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'uiux.designer@gmail.com' },
      update: {},
      create: {
        email: 'uiux.designer@gmail.com',
        fullName: 'Tran Van Khai',
        passwordHash,
        role: UserRole.CANDIDATE,
        phoneNumber: '+84 936 789 012',
        dateOfBirth: new Date('1994-11-07'),
        gender: Gender.MALE,
        nationality: 'Vietnamese',
        isActive: true,
        isEmailVerified: true
      }
    }),
    // Candidates - Backend Developers
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
        nationality: 'Vietnamese',
        isActive: true,
        isEmailVerified: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'nodejs.developer@gmail.com' },
      update: {},
      create: {
        email: 'nodejs.developer@gmail.com',
        fullName: 'Do Van Minh',
        passwordHash,
        role: UserRole.CANDIDATE,
        phoneNumber: '+84 946 789 012',
        dateOfBirth: new Date('1990-08-14'),
        gender: Gender.MALE,
        nationality: 'Vietnamese',
        isActive: true,
        isEmailVerified: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'python.developer@gmail.com' },
      update: {},
      create: {
        email: 'python.developer@gmail.com',
        fullName: 'Bui Thi Nga',
        passwordHash,
        role: UserRole.CANDIDATE,
        phoneNumber: '+84 947 890 123',
        dateOfBirth: new Date('1991-06-22'),
        gender: Gender.FEMALE,
        nationality: 'Vietnamese',
        isActive: true,
        isEmailVerified: true
      }
    }),
    // Candidates - Fullstack & DevOps
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
        nationality: 'Vietnamese',
        isActive: true,
        isEmailVerified: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'devops.engineer@gmail.com' },
      update: {},
      create: {
        email: 'devops.engineer@gmail.com',
        fullName: 'Cao Thi Yen',
        passwordHash,
        role: UserRole.CANDIDATE,
        phoneNumber: '+84 949 012 345',
        dateOfBirth: new Date('1987-03-18'),
        gender: Gender.FEMALE,
        nationality: 'Vietnamese',
        isActive: true,
        isEmailVerified: true
      }
    }),
    // Candidates - Junior/Entry Level
    prisma.user.upsert({
      where: { email: 'junior.dev1@gmail.com' },
      update: {},
      create: {
        email: 'junior.dev1@gmail.com',
        fullName: 'Hoang Van Em',
        passwordHash,
        role: UserRole.CANDIDATE,
        phoneNumber: '+84 956 789 012',
        dateOfBirth: new Date('1998-09-22'),
        gender: Gender.MALE,
        nationality: 'Vietnamese',
        isActive: true,
        isEmailVerified: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'junior.dev2@gmail.com' },
      update: {},
      create: {
        email: 'junior.dev2@gmail.com',
        fullName: 'Nguyen Thi Thao',
        passwordHash,
        role: UserRole.CANDIDATE,
        phoneNumber: '+84 957 890 123',
        dateOfBirth: new Date('1999-01-10'),
        gender: Gender.FEMALE,
        nationality: 'Vietnamese',
        isActive: true,
        isEmailVerified: true
      }
    }),
    // Candidates - Mobile Developers
    prisma.user.upsert({
      where: { email: 'mobile.developer@gmail.com' },
      update: {},
      create: {
        email: 'mobile.developer@gmail.com',
        fullName: 'Dang Van Tuan',
        passwordHash,
        role: UserRole.CANDIDATE,
        phoneNumber: '+84 958 901 234',
        dateOfBirth: new Date('1992-07-15'),
        gender: Gender.MALE,
        nationality: 'Vietnamese',
        isActive: true,
        isEmailVerified: true
      }
    }),
    // Candidates - Data/AI Specialists
    prisma.user.upsert({
      where: { email: 'data.scientist@gmail.com' },
      update: {},
      create: {
        email: 'data.scientist@gmail.com',
        fullName: 'Trinh Thi Ha',
        passwordHash,
        role: UserRole.CANDIDATE,
        phoneNumber: '+84 959 012 345',
        dateOfBirth: new Date('1990-04-08'),
        gender: Gender.FEMALE,
        nationality: 'Vietnamese',
        isActive: true,
        isEmailVerified: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'ai.engineer@gmail.com' },
      update: {},
      create: {
        email: 'ai.engineer@gmail.com',
        fullName: 'Ngo Van Duc',
        passwordHash,
        role: UserRole.CANDIDATE,
        phoneNumber: '+84 960 123 456',
        dateOfBirth: new Date('1989-10-25'),
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
    // TechCorp Vietnam members
    prisma.companyMember.upsert({
      where: { 
        userId_companyId: {
          userId: users[1].id, // Nguyen Van Anh
          companyId: companies[0].id
        }
      },
      update: {},
      create: {
        role: CompanyRole.OWNER,
        userId: users[1].id,
        companyId: companies[0].id,
        invitedBy: users[0].id // admin
      }
    }),
    prisma.companyMember.upsert({
      where: { 
        userId_companyId: {
          userId: users[2].id, // Tran Minh Duc
          companyId: companies[0].id
        }
      },
      update: {},
      create: {
        role: CompanyRole.RECRUITER,
        userId: users[2].id,
        companyId: companies[0].id,
        invitedBy: users[1].id // invited by owner
      }
    }),
    // StartupXYZ members
    prisma.companyMember.upsert({
      where: { 
        userId_companyId: {
          userId: users[3].id, // Le Thi Bich
          companyId: companies[1].id
        }
      },
      update: {},
      create: {
        role: CompanyRole.OWNER,
        userId: users[3].id,
        companyId: companies[1].id,
        invitedBy: users[0].id // admin
      }
    }),
    // Global Finance members
    prisma.companyMember.upsert({
      where: { 
        userId_companyId: {
          userId: users[4].id, // Pham Van Cuong
          companyId: companies[2].id
        }
      },
      update: {},
      create: {
        role: CompanyRole.MANAGER,
        userId: users[4].id,
        companyId: companies[2].id,
        invitedBy: users[0].id // admin
      }
    }),
    // E-Commerce Pro members
    prisma.companyMember.upsert({
      where: { 
        userId_companyId: {
          userId: users[5].id, // Hoang Thi Mai
          companyId: companies[3].id
        }
      },
      update: {},
      create: {
        role: CompanyRole.MANAGER,
        userId: users[5].id,
        companyId: companies[3].id,
        invitedBy: users[0].id // admin
      }
    }),
    // HealthTech Solutions members
    prisma.companyMember.upsert({
      where: { 
        userId_companyId: {
          userId: users[6].id, // Vu Van Hieu
          companyId: companies[4].id
        }
      },
      update: {},
      create: {
        role: CompanyRole.RECRUITER,
        userId: users[6].id,
        companyId: companies[4].id,
        invitedBy: users[0].id // admin
      }
    })
  ]);

  // 5. Create User Skills
  console.log('🎯 Creating user skills...');
  const candidateUsers = users.slice(7); // Get candidate users (index 7 onwards)
  console.log('Candidate users count:', candidateUsers.length);
  
  await Promise.all([
    // Frontend Developer 1 (Le Van Cong) - skills
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[0].id,
          skillId: skills[0].id // JavaScript
        }
      },
      update: {},
      create: {
        level: SkillLevel.ADVANCED,
        yearsOfExperience: 3,
        userId: candidateUsers[0].id,
        skillId: skills[0].id
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[0].id,
          skillId: skills[1].id // TypeScript
        }
      },
      update: {},
      create: {
        level: SkillLevel.INTERMEDIATE,
        yearsOfExperience: 2,
        userId: candidateUsers[0].id,
        skillId: skills[1].id
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[0].id,
          skillId: skills[8].id // React
        }
      },
      update: {},
      create: {
        level: SkillLevel.ADVANCED,
        yearsOfExperience: 3,
        userId: candidateUsers[0].id,
        skillId: skills[8].id
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[0].id,
          skillId: skills[11].id // HTML/CSS
        }
      },
      update: {},
      create: {
        level: SkillLevel.EXPERT,
        yearsOfExperience: 4,
        userId: candidateUsers[0].id,
        skillId: skills[11].id
      }
    }),

    // React Developer (Nguyen Thi Linh) - skills
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[1].id,
          skillId: skills[0].id // JavaScript
        }
      },
      update: {},
      create: {
        level: SkillLevel.EXPERT,
        yearsOfExperience: 4,
        userId: candidateUsers[1].id,
        skillId: skills[0].id
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[1].id,
          skillId: skills[8].id // React
        }
      },
      update: {},
      create: {
        level: SkillLevel.EXPERT,
        yearsOfExperience: 4,
        userId: candidateUsers[1].id,
        skillId: skills[8].id
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[1].id,
          skillId: skills[1].id // TypeScript
        }
      },
      update: {},
      create: {
        level: SkillLevel.ADVANCED,
        yearsOfExperience: 3,
        userId: candidateUsers[1].id,
        skillId: skills[1].id
      }
    }),

    // UI/UX Designer (Tran Van Khai) - skills
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[2].id,
          skillId: skills[33].id // UI/UX Design
        }
      },
      update: {},
      create: {
        level: SkillLevel.EXPERT,
        yearsOfExperience: 5,
        userId: candidateUsers[2].id,
        skillId: skills[33].id
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[2].id,
          skillId: skills[34].id // Figma
        }
      },
      update: {},
      create: {
        level: SkillLevel.EXPERT,
        yearsOfExperience: 4,
        userId: candidateUsers[2].id,
        skillId: skills[34].id
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[2].id,
          skillId: skills[35].id // Adobe Photoshop
        }
      },
      update: {},
      create: {
        level: SkillLevel.ADVANCED,
        yearsOfExperience: 3,
        userId: candidateUsers[2].id,
        skillId: skills[35].id
      }
    }),

    // Backend Developer 1 (Pham Thi Dao) - skills
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[3].id,
          skillId: skills[14].id // Node.js
        }
      },
      update: {},
      create: {
        level: SkillLevel.EXPERT,
        yearsOfExperience: 5,
        userId: candidateUsers[3].id,
        skillId: skills[14].id
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[3].id,
          skillId: skills[21].id // PostgreSQL
        }
      },
      update: {},
      create: {
        level: SkillLevel.ADVANCED,
        yearsOfExperience: 4,
        userId: candidateUsers[3].id,
        skillId: skills[21].id
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[3].id,
          skillId: skills[15].id // Express.js
        }
      },
      update: {},
      create: {
        level: SkillLevel.EXPERT,
        yearsOfExperience: 4,
        userId: candidateUsers[3].id,
        skillId: skills[15].id
      }
    }),

    // Node.js Developer (Do Van Minh) - skills
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[4].id,
          skillId: skills[14].id // Node.js
        }
      },
      update: {},
      create: {
        level: SkillLevel.EXPERT,
        yearsOfExperience: 6,
        userId: candidateUsers[4].id,
        skillId: skills[14].id
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[4].id,
          skillId: skills[0].id // JavaScript
        }
      },
      update: {},
      create: {
        level: SkillLevel.EXPERT,
        yearsOfExperience: 6,
        userId: candidateUsers[4].id,
        skillId: skills[0].id
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[4].id,
          skillId: skills[22].id // MySQL
        }
      },
      update: {},
      create: {
        level: SkillLevel.ADVANCED,
        yearsOfExperience: 4,
        userId: candidateUsers[4].id,
        skillId: skills[22].id
      }
    }),

    // Python Developer (Bui Thi Nga) - skills
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[5].id,
          skillId: skills[2].id // Python
        }
      },
      update: {},
      create: {
        level: SkillLevel.EXPERT,
        yearsOfExperience: 5,
        userId: candidateUsers[5].id,
        skillId: skills[2].id
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[5].id,
          skillId: skills[16].id // Django
        }
      },
      update: {},
      create: {
        level: SkillLevel.ADVANCED,
        yearsOfExperience: 3,
        userId: candidateUsers[5].id,
        skillId: skills[16].id
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[5].id,
          skillId: skills[21].id // PostgreSQL
        }
      },
      update: {},
      create: {
        level: SkillLevel.INTERMEDIATE,
        yearsOfExperience: 2,
        userId: candidateUsers[5].id,
        skillId: skills[21].id
      }
    }),

    // Fullstack Developer (Lam Van Phuc) - skills
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[6].id,
          skillId: skills[0].id // JavaScript
        }
      },
      update: {},
      create: {
        level: SkillLevel.EXPERT,
        yearsOfExperience: 7,
        userId: candidateUsers[6].id,
        skillId: skills[0].id
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[6].id,
          skillId: skills[8].id // React
        }
      },
      update: {},
      create: {
        level: SkillLevel.ADVANCED,
        yearsOfExperience: 5,
        userId: candidateUsers[6].id,
        skillId: skills[8].id
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[6].id,
          skillId: skills[14].id // Node.js
        }
      },
      update: {},
      create: {
        level: SkillLevel.EXPERT,
        yearsOfExperience: 6,
        userId: candidateUsers[6].id,
        skillId: skills[14].id
      }
    }),

    // DevOps Engineer (Cao Thi Yen) - skills
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[7].id,
          skillId: skills[27].id // Docker
        }
      },
      update: {},
      create: {
        level: SkillLevel.EXPERT,
        yearsOfExperience: 5,
        userId: candidateUsers[7].id,
        skillId: skills[27].id
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[7].id,
          skillId: skills[28].id // Kubernetes
        }
      },
      update: {},
      create: {
        level: SkillLevel.ADVANCED,
        yearsOfExperience: 3,
        userId: candidateUsers[7].id,
        skillId: skills[28].id
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[7].id,
          skillId: skills[29].id // AWS
        }
      },
      update: {},
      create: {
        level: SkillLevel.EXPERT,
        yearsOfExperience: 4,
        userId: candidateUsers[7].id,
        skillId: skills[29].id
      }
    }),

    // Junior Dev 1 (Hoang Van Em) - skills
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[8].id,
          skillId: skills[2].id // Python
        }
      },
      update: {},
      create: {
        level: SkillLevel.INTERMEDIATE,
        yearsOfExperience: 1,
        userId: candidateUsers[8].id,
        skillId: skills[2].id
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[8].id,
          skillId: skills[3].id // Java
        }
      },
      update: {},
      create: {
        level: SkillLevel.BEGINNER,
        yearsOfExperience: 1,
        userId: candidateUsers[8].id,
        skillId: skills[3].id
      }
    }),

    // Junior Dev 2 (Nguyen Thi Thao) - skills
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[9].id,
          skillId: skills[0].id // JavaScript
        }
      },
      update: {},
      create: {
        level: SkillLevel.INTERMEDIATE,
        yearsOfExperience: 1,
        userId: candidateUsers[9].id,
        skillId: skills[0].id
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[9].id,
          skillId: skills[8].id // React
        }
      },
      update: {},
      create: {
        level: SkillLevel.BEGINNER,
        yearsOfExperience: 1,
        userId: candidateUsers[9].id,
        skillId: skills[8].id
      }
    }),

    // Mobile Developer (Dang Van Tuan) - skills
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[10].id,
          skillId: skills[37].id // React Native
        }
      },
      update: {},
      create: {
        level: SkillLevel.ADVANCED,
        yearsOfExperience: 3,
        userId: candidateUsers[10].id,
        skillId: skills[37].id
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[10].id,
          skillId: skills[38].id // Flutter
        }
      },
      update: {},
      create: {
        level: SkillLevel.INTERMEDIATE,
        yearsOfExperience: 2,
        userId: candidateUsers[10].id,
        skillId: skills[38].id
      }
    }),

    // Data Scientist (Trinh Thi Ha) - skills
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[11].id,
          skillId: skills[2].id // Python
        }
      },
      update: {},
      create: {
        level: SkillLevel.EXPERT,
        yearsOfExperience: 5,
        userId: candidateUsers[11].id,
        skillId: skills[2].id
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[11].id,
          skillId: skills[41].id // Machine Learning
        }
      },
      update: {},
      create: {
        level: SkillLevel.ADVANCED,
        yearsOfExperience: 4,
        userId: candidateUsers[11].id,
        skillId: skills[41].id
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[11].id,
          skillId: skills[45].id // Data Analysis
        }
      },
      update: {},
      create: {
        level: SkillLevel.EXPERT,
        yearsOfExperience: 5,
        userId: candidateUsers[11].id,
        skillId: skills[45].id
      }
    }),

    // AI Engineer (Ngo Van Duc) - skills
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[12].id,
          skillId: skills[2].id // Python
        }
      },
      update: {},
      create: {
        level: SkillLevel.EXPERT,
        yearsOfExperience: 6,
        userId: candidateUsers[12].id,
        skillId: skills[2].id
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[12].id,
          skillId: skills[42].id // Deep Learning
        }
      },
      update: {},
      create: {
        level: SkillLevel.ADVANCED,
        yearsOfExperience: 3,
        userId: candidateUsers[12].id,
        skillId: skills[42].id
      }
    }),
    prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: candidateUsers[12].id,
          skillId: skills[43].id // TensorFlow
        }
      },
      update: {},
      create: {
        level: SkillLevel.ADVANCED,
        yearsOfExperience: 3,
        userId: candidateUsers[12].id,
        skillId: skills[43].id
      }
    })
  ]);

  // 6. Create Jobs
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
        salary: '25,000,000 - 35,000,000 VND',
        requirements: '3+ years experience with React, TypeScript, and modern frontend tools. Experience with state management, testing frameworks, and responsive design.',
        benefits: 'Health insurance, flexible working hours, remote work options, performance bonus, training budget',
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
        description: 'Join our backend team to build scalable APIs and microservices using Node.js and PostgreSQL. You will work on high-traffic applications serving millions of users.',
        location: 'Ho Chi Minh City',
        type: JobType.FULL_TIME,
        industry: 'Technology',
        experienceLevel: ExperienceLevel.MID,
        salary: '20,000,000 - 30,000,000 VND',
        requirements: '2+ years experience with Node.js, PostgreSQL, and REST APIs. Knowledge of microservices architecture and cloud platforms preferred.',
        benefits: 'Competitive salary, learning opportunities, team building, health insurance',
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
        title: 'Full-Stack Developer',
        description: 'Looking for a versatile full-stack developer to work on both frontend and backend systems. You will be involved in the complete development lifecycle.',
        location: 'Ho Chi Minh City',
        type: JobType.FULL_TIME,
        industry: 'Technology',
        experienceLevel: ExperienceLevel.SENIOR,
        salary: '28,000,000 - 40,000,000 VND',
        requirements: 'Strong experience in both frontend (React/Vue) and backend (Node.js/Python) development. Experience with databases and cloud services.',
        benefits: 'High salary, flexible schedule, remote work, professional development',
        remoteWork: true,
        urgent: false,
        featured: true,
        isActive: true,
        isApproved: true,
        companyId: companies[0].id
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
        salary: '22,000,000 - 32,000,000 VND',
        requirements: 'Experience with Python, machine learning frameworks (TensorFlow/PyTorch), and data analysis. Background in statistics or computer science preferred.',
        benefits: 'Equity options, flexible schedule, cutting-edge technology, research opportunities',
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
        title: 'Data Scientist',
        description: 'Join our data science team to build predictive models and extract insights from large datasets. You will work directly with product teams to drive data-driven decisions.',
        location: 'Ho Chi Minh City',
        type: JobType.FULL_TIME,
        industry: 'Artificial Intelligence',
        experienceLevel: ExperienceLevel.SENIOR,
        salary: '30,000,000 - 45,000,000 VND',
        requirements: 'Strong Python skills, experience with ML frameworks, statistical analysis, and big data tools. PhD or Masters in relevant field preferred.',
        benefits: 'Competitive salary, research freedom, conference attendance, stock options',
        remoteWork: true,
        urgent: true,
        featured: true,
        isActive: true,
        isApproved: true,
        companyId: companies[1].id
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
        salary: '30,000,000 - 40,000,000 VND',
        requirements: 'Experience with Docker, AWS/Azure, CI/CD pipelines, and infrastructure automation. Knowledge of security best practices in financial services.',
        benefits: 'High salary, project-based work, latest tools, performance bonuses',
        remoteWork: true,
        urgent: false,
        featured: false,
        isActive: true,
        isApproved: true,
        companyId: companies[2].id
      }
    }),
    prisma.job.create({
      data: {
        title: 'Java Backend Developer',
        description: 'We need an experienced Java developer to work on our core banking systems. You will be responsible for building secure and scalable financial applications.',
        location: 'Ho Chi Minh City',
        type: JobType.FULL_TIME,
        industry: 'Finance',
        experienceLevel: ExperienceLevel.SENIOR,
        salary: '25,000,000 - 38,000,000 VND',
        requirements: 'Strong Java and Spring Boot experience, knowledge of financial systems, database design, and security best practices.',
        benefits: 'Stable environment, health insurance, performance bonus, professional development',
        remoteWork: false,
        urgent: true,
        featured: false,
        isActive: true,
        isApproved: true,
        companyId: companies[2].id
      }
    }),

    // E-Commerce Pro Jobs
    prisma.job.create({
      data: {
        title: 'React Native Developer',
        description: 'Join our mobile team to build and maintain our e-commerce mobile applications. You will work on features used by millions of customers daily.',
        location: 'Ho Chi Minh City',
        type: JobType.FULL_TIME,
        industry: 'E-commerce',
        experienceLevel: ExperienceLevel.MID,
        salary: '18,000,000 - 28,000,000 VND',
        requirements: 'Experience with React Native, mobile app development, API integration, and app store deployment processes.',
        benefits: 'Dynamic environment, learning opportunities, employee discounts, team events',
        remoteWork: false,
        urgent: false,
        featured: true,
        isActive: true,
        isApproved: true,
        companyId: companies[3].id
      }
    }),
    prisma.job.create({
      data: {
        title: 'UI/UX Designer',
        description: 'We are looking for a creative UI/UX designer to enhance our e-commerce platform user experience. You will work closely with product and engineering teams.',
        location: 'Ho Chi Minh City',
        type: JobType.FULL_TIME,
        industry: 'E-commerce',
        experienceLevel: ExperienceLevel.MID,
        salary: '15,000,000 - 25,000,000 VND',
        requirements: 'Strong portfolio in UI/UX design, proficiency with Figma/Sketch, understanding of user research and usability testing.',
        benefits: 'Creative environment, design tools provided, flexible hours, skill development',
        remoteWork: true,
        urgent: false,
        featured: false,
        isActive: true,
        isApproved: true,
        companyId: companies[3].id
      }
    }),

    // HealthTech Solutions Jobs
    prisma.job.create({
      data: {
        title: 'Software Engineer - Healthcare',
        description: 'Develop innovative healthcare software solutions that improve patient care. You will work on HIPAA-compliant applications using modern technologies.',
        location: 'Ho Chi Minh City',
        type: JobType.FULL_TIME,
        industry: 'Healthcare Technology',
        experienceLevel: ExperienceLevel.MID,
        salary: '20,000,000 - 30,000,000 VND',
        requirements: 'Experience with web development, database design, and healthcare regulations. Knowledge of security and compliance standards.',
        benefits: 'Meaningful work, health insurance, professional development, work-life balance',
        remoteWork: true,
        urgent: false,
        featured: true,
        isActive: true,
        isApproved: true,
        companyId: companies[4].id
      }
    }),

    // GameStudio Creative Jobs
    prisma.job.create({
      data: {
        title: 'Game Developer (Unity)',
        description: 'Create engaging mobile games using Unity. You will work on game mechanics, UI, and optimization for mobile platforms.',
        location: 'Ho Chi Minh City',
        type: JobType.FULL_TIME,
        industry: 'Gaming',
        experienceLevel: ExperienceLevel.JUNIOR,
        salary: '12,000,000 - 20,000,000 VND',
        requirements: 'Experience with Unity, C# programming, mobile game development, and understanding of game design principles.',
        benefits: 'Creative environment, game development experience, flexible hours, team events',
        remoteWork: false,
        urgent: false,
        featured: false,
        isActive: true,
        isApproved: true,
        companyId: companies[5].id
      }
    }),

    // CloudOps Vietnam Jobs
    prisma.job.create({
      data: {
        title: 'Cloud Infrastructure Engineer',
        description: 'Help our clients migrate to and optimize their cloud infrastructure. You will work with various cloud platforms and automation tools.',
        location: 'Ho Chi Minh City',
        type: JobType.FULL_TIME,
        industry: 'Cloud Computing',
        experienceLevel: ExperienceLevel.SENIOR,
        salary: '25,000,000 - 35,000,000 VND',
        requirements: 'Strong experience with AWS/Azure/GCP, infrastructure as code, monitoring, and cost optimization.',
        benefits: 'Latest cloud technologies, certification support, consulting experience, competitive salary',
        remoteWork: true,
        urgent: true,
        featured: true,
        isActive: true,
        isApproved: true,
        companyId: companies[6].id
      }
    }),

    // DataInsights Analytics Jobs
    prisma.job.create({
      data: {
        title: 'Business Intelligence Developer',
        description: 'Build data pipelines and create business intelligence solutions for our clients. You will work with big data technologies and visualization tools.',
        location: 'Ho Chi Minh City',
        type: JobType.FULL_TIME,
        industry: 'Data Analytics',
        experienceLevel: ExperienceLevel.MID,
        salary: '18,000,000 - 28,000,000 VND',
        requirements: 'Experience with SQL, data warehousing, ETL processes, and BI tools like Tableau or Power BI.',
        benefits: 'Data-driven environment, analytics tools, training opportunities, project variety',
        remoteWork: false,
        urgent: false,
        featured: false,
        isActive: true,
        isApproved: true,
        companyId: companies[7].id
      }
    }),

    // Additional Junior/Entry Level Positions
    prisma.job.create({
      data: {
        title: 'Junior Frontend Developer',
        description: 'Perfect opportunity for new graduates to start their career in frontend development. You will receive mentoring and work on real projects.',
        location: 'Ho Chi Minh City',
        type: JobType.FULL_TIME,
        industry: 'Technology',
        experienceLevel: ExperienceLevel.JUNIOR,
        salary: '10,000,000 - 15,000,000 VND',
        requirements: 'Basic knowledge of HTML, CSS, JavaScript. React experience is a plus. Fresh graduates welcome.',
        benefits: 'Mentoring program, training provided, career growth opportunities, friendly environment',
        remoteWork: false,
        urgent: false,
        featured: false,
        isActive: true,
        isApproved: true,
        companyId: companies[0].id
      }
    }),
    prisma.job.create({
      data: {
        title: 'Internship - Software Development',
        description: 'Join our internship program to gain hands-on experience in software development. You will work alongside experienced developers.',
        location: 'Ho Chi Minh City',
        type: JobType.INTERNSHIP,
        industry: 'Technology',
        experienceLevel: ExperienceLevel.ENTRY,
        salary: '3,000,000 - 5,000,000 VND',
        requirements: 'Currently pursuing or recently completed degree in Computer Science or related field. Enthusiasm to learn.',
        benefits: 'Learning experience, mentorship, potential full-time offer, project experience',
        remoteWork: false,
        urgent: false,
        featured: false,
        isActive: true,
        isApproved: true,
        companyId: companies[1].id
      }
    })
  ]);

  // 7. Create Job Skills
  console.log('🔧 Creating job skills...');
  await Promise.all([
    // Senior Frontend Developer skills (Job 0)
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
        skillId: skills[8].id, // React
        companyId: companies[0].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: false,
        jobId: jobs[0].id,
        skillId: skills[11].id, // HTML/CSS
        companyId: companies[0].id
      }
    }),

    // Backend Developer (Node.js) skills (Job 1)
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[1].id,
        skillId: skills[14].id, // Node.js
        companyId: companies[0].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[1].id,
        skillId: skills[21].id, // PostgreSQL
        companyId: companies[0].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: false,
        jobId: jobs[1].id,
        skillId: skills[15].id, // Express.js
        companyId: companies[0].id
      }
    }),

    // Full-Stack Developer skills (Job 2)
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[2].id,
        skillId: skills[0].id, // JavaScript
        companyId: companies[0].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[2].id,
        skillId: skills[8].id, // React
        companyId: companies[0].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[2].id,
        skillId: skills[14].id, // Node.js
        companyId: companies[0].id
      }
    }),

    // AI/ML Engineer skills (Job 3)
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[3].id,
        skillId: skills[2].id, // Python
        companyId: companies[1].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[3].id,
        skillId: skills[41].id, // Machine Learning
        companyId: companies[1].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: false,
        jobId: jobs[3].id,
        skillId: skills[43].id, // TensorFlow
        companyId: companies[1].id
      }
    }),

    // Data Scientist skills (Job 4)
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[4].id,
        skillId: skills[2].id, // Python
        companyId: companies[1].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[4].id,
        skillId: skills[45].id, // Data Analysis
        companyId: companies[1].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[4].id,
        skillId: skills[41].id, // Machine Learning
        companyId: companies[1].id
      }
    }),

    // DevOps Engineer skills (Job 5)
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[5].id,
        skillId: skills[27].id, // Docker
        companyId: companies[2].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[5].id,
        skillId: skills[29].id, // AWS
        companyId: companies[2].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: false,
        jobId: jobs[5].id,
        skillId: skills[28].id, // Kubernetes
        companyId: companies[2].id
      }
    }),

    // Java Backend Developer skills (Job 6)
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[6].id,
        skillId: skills[3].id, // Java
        companyId: companies[2].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[6].id,
        skillId: skills[18].id, // Spring Boot
        companyId: companies[2].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: false,
        jobId: jobs[6].id,
        skillId: skills[22].id, // MySQL
        companyId: companies[2].id
      }
    }),

    // React Native Developer skills (Job 7)
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[7].id,
        skillId: skills[37].id, // React Native
        companyId: companies[3].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[7].id,
        skillId: skills[0].id, // JavaScript
        companyId: companies[3].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: false,
        jobId: jobs[7].id,
        skillId: skills[8].id, // React
        companyId: companies[3].id
      }
    }),

    // UI/UX Designer skills (Job 8)
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[8].id,
        skillId: skills[33].id, // UI/UX Design
        companyId: companies[3].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[8].id,
        skillId: skills[34].id, // Figma
        companyId: companies[3].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: false,
        jobId: jobs[8].id,
        skillId: skills[35].id, // Adobe Photoshop
        companyId: companies[3].id
      }
    }),

    // Software Engineer - Healthcare skills (Job 9)
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[9].id,
        skillId: skills[0].id, // JavaScript
        companyId: companies[4].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[9].id,
        skillId: skills[21].id, // PostgreSQL
        companyId: companies[4].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: false,
        jobId: jobs[9].id,
        skillId: skills[8].id, // React
        companyId: companies[4].id
      }
    }),

    // Game Developer skills (Job 10)
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[10].id,
        skillId: skills[4].id, // C#
        companyId: companies[5].id
      }
    }),

    // Cloud Infrastructure Engineer skills (Job 11)
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[11].id,
        skillId: skills[29].id, // AWS
        companyId: companies[6].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[11].id,
        skillId: skills[27].id, // Docker
        companyId: companies[6].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: false,
        jobId: jobs[11].id,
        skillId: skills[30].id, // Azure
        companyId: companies[6].id
      }
    }),

    // Business Intelligence Developer skills (Job 12)
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[12].id,
        skillId: skills[46].id, // Business Intelligence
        companyId: companies[7].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[12].id,
        skillId: skills[45].id, // Data Analysis
        companyId: companies[7].id
      }
    }),

    // Junior Frontend Developer skills (Job 13)
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[13].id,
        skillId: skills[0].id, // JavaScript
        companyId: companies[0].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: true,
        jobId: jobs[13].id,
        skillId: skills[11].id, // HTML/CSS
        companyId: companies[0].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: false,
        jobId: jobs[13].id,
        skillId: skills[8].id, // React
        companyId: companies[0].id
      }
    }),

    // Internship skills (Job 14)
    prisma.jobSkill.create({
      data: {
        isRequired: false,
        jobId: jobs[14].id,
        skillId: skills[0].id, // JavaScript
        companyId: companies[1].id
      }
    }),
    prisma.jobSkill.create({
      data: {
        isRequired: false,
        jobId: jobs[14].id,
        skillId: skills[2].id, // Python
        companyId: companies[1].id
      }
    })
  ]);

  // 8. Create Profiles
  console.log('📄 Creating profiles...');
  await Promise.all([
    // Frontend Developer 1
    prisma.profile.create({
      data: {
        userId: candidateUsers[0].id,
        headline: 'Senior Frontend Developer with 3+ years experience in React and TypeScript',
        location: 'Ho Chi Minh City',
        experience: '3 years of frontend development experience specializing in React, TypeScript, and modern web technologies',
        education: 'Bachelor of Computer Science - Ho Chi Minh University of Science',
        skills: 'React, TypeScript, JavaScript, HTML5, CSS3, Sass, Git, Responsive Design',
        avatarUrl: 'https://example.com/avatars/avatar1.jpg'
      }
    }),
    // React Developer
    prisma.profile.create({
      data: {
        userId: candidateUsers[1].id,
        headline: 'Expert React Developer passionate about building scalable web applications',
        location: 'Ho Chi Minh City',
        experience: '4 years of React development with strong JavaScript and TypeScript skills',
        education: 'Bachelor of Information Technology - Ho Chi Minh University of Technology',
        skills: 'React, JavaScript, TypeScript, Redux, Next.js, Node.js, HTML/CSS',
        avatarUrl: 'https://example.com/avatars/avatar2.jpg'
      }
    }),
    // UI/UX Designer
    prisma.profile.create({
      data: {
        userId: candidateUsers[2].id,
        headline: 'Creative UI/UX Designer with 5+ years of experience in user-centered design',
        location: 'Ho Chi Minh City',
        experience: '5 years of UI/UX design experience across web and mobile platforms',
        education: 'Bachelor of Design - Ho Chi Minh University of Architecture',
        skills: 'UI/UX Design, Figma, Adobe Creative Suite, Sketch, Prototyping, User Research',
        avatarUrl: 'https://example.com/avatars/avatar3.jpg'
      }
    }),
    // Backend Developer 1
    prisma.profile.create({
      data: {
        userId: candidateUsers[3].id,
        headline: 'Full-stack Developer specializing in Node.js and PostgreSQL',
        location: 'Ho Chi Minh City',
        experience: '5 years of full-stack development with expertise in backend systems',
        education: 'Master of Software Engineering - University of Information Technology',
        skills: 'Node.js, PostgreSQL, Express.js, JavaScript, REST APIs, Microservices',
        avatarUrl: 'https://example.com/avatars/avatar4.jpg'
      }
    }),
    // Node.js Developer
    prisma.profile.create({
      data: {
        userId: candidateUsers[4].id,
        headline: 'Senior Node.js Developer with expertise in scalable backend systems',
        location: 'Ho Chi Minh City',
        experience: '6 years of Node.js development and system architecture',
        education: 'Bachelor of Computer Engineering - Ho Chi Minh University of Technology',
        skills: 'Node.js, JavaScript, MySQL, Express.js, API Development, System Design',
        avatarUrl: 'https://example.com/avatars/avatar5.jpg'
      }
    }),
    // Python Developer
    prisma.profile.create({
      data: {
        userId: candidateUsers[5].id,
        headline: 'Python Developer with strong background in web development and data analysis',
        location: 'Ho Chi Minh City',
        experience: '5 years of Python development using Django and data science tools',
        education: 'Bachelor of Computer Science - Vietnam National University',
        skills: 'Python, Django, PostgreSQL, Data Analysis, Machine Learning, REST APIs',
        avatarUrl: 'https://example.com/avatars/avatar6.jpg'
      }
    }),
    // Fullstack Developer
    prisma.profile.create({
      data: {
        userId: candidateUsers[6].id,
        headline: 'Senior Full-stack Developer with 7+ years of end-to-end development experience',
        location: 'Ho Chi Minh City',
        experience: '7 years of full-stack development across various technologies and industries',
        education: 'Bachelor of Software Engineering - FPT University',
        skills: 'JavaScript, React, Node.js, TypeScript, PostgreSQL, System Architecture',
        avatarUrl: 'https://example.com/avatars/avatar7.jpg'
      }
    }),
    // DevOps Engineer
    prisma.profile.create({
      data: {
        userId: candidateUsers[7].id,
        headline: 'DevOps Engineer specialized in cloud infrastructure and automation',
        location: 'Ho Chi Minh City',
        experience: '5 years of DevOps and cloud infrastructure experience',
        education: 'Bachelor of Information Systems - University of Economics Ho Chi Minh City',
        skills: 'Docker, Kubernetes, AWS, CI/CD, Infrastructure as Code, Monitoring',
        avatarUrl: 'https://example.com/avatars/avatar8.jpg'
      }
    }),
    // Junior Dev 1
    prisma.profile.create({
      data: {
        userId: candidateUsers[8].id,
        headline: 'Junior Developer eager to learn and grow in software development',
        location: 'Ho Chi Minh City',
        experience: '1 year of programming experience with Python and Java',
        education: 'Bachelor of Information Technology - Ho Chi Minh University of Technology',
        skills: 'Python, Java, SQL, Git, Object-Oriented Programming, Problem Solving',
        avatarUrl: 'https://example.com/avatars/avatar9.jpg'
      }
    }),
    // Junior Dev 2
    prisma.profile.create({
      data: {
        userId: candidateUsers[9].id,
        headline: 'Enthusiastic Junior Frontend Developer with React knowledge',
        location: 'Ho Chi Minh City',
        experience: '1 year of frontend development experience with modern technologies',
        education: 'Bachelor of Computer Science - Ton Duc Thang University',
        skills: 'JavaScript, React, HTML/CSS, Git, Responsive Design, Basic Node.js',
        avatarUrl: 'https://example.com/avatars/avatar10.jpg'
      }
    }),
    // Mobile Developer
    prisma.profile.create({
      data: {
        userId: candidateUsers[10].id,
        headline: 'Mobile Developer specialized in React Native and Flutter',
        location: 'Ho Chi Minh City',
        experience: '3 years of mobile app development for iOS and Android platforms',
        education: 'Bachelor of Computer Engineering - University of Technology VNU-HCM',
        skills: 'React Native, Flutter, JavaScript, Dart, Mobile UI/UX, App Store Deployment',
        avatarUrl: 'https://example.com/avatars/avatar11.jpg'
      }
    }),
    // Data Scientist
    prisma.profile.create({
      data: {
        userId: candidateUsers[11].id,
        headline: 'Data Scientist with expertise in machine learning and statistical analysis',
        location: 'Ho Chi Minh City',
        experience: '5 years of data science and analytics experience across various industries',
        education: 'Master of Data Science - Vietnam National University',
        skills: 'Python, Machine Learning, Data Analysis, Statistics, SQL, Visualization Tools',
        avatarUrl: 'https://example.com/avatars/avatar12.jpg'
      }
    }),
    // AI Engineer
    prisma.profile.create({
      data: {
        userId: candidateUsers[12].id,
        headline: 'AI Engineer passionate about deep learning and neural networks',
        location: 'Ho Chi Minh City',
        experience: '6 years of AI/ML development with focus on deep learning applications',
        education: 'PhD in Computer Science - Ho Chi Minh University of Science',
        skills: 'Python, Deep Learning, TensorFlow, PyTorch, Neural Networks, Computer Vision',
        avatarUrl: 'https://example.com/avatars/avatar13.jpg'
      }
    })
  ]);

  // 9. Create CVs
  console.log('📋 Creating CVs...');
  const cvs = await Promise.all([
    // Frontend Developer CVs
    prisma.cV.create({
      data: {
        title: 'Le Van Cong - Senior Frontend Developer CV',
        fileName: 'le_van_cong_frontend_cv.pdf',
        fileUrl: 'https://example.com/cvs/le_van_cong_frontend_cv.pdf',
        fileSize: 1024000,
        isMain: true,
        userId: candidateUsers[0].id
      }
    }),
    prisma.cV.create({
      data: {
        title: 'Nguyen Thi Linh - React Developer CV',
        fileName: 'nguyen_thi_linh_react_cv.pdf',
        fileUrl: 'https://example.com/cvs/nguyen_thi_linh_react_cv.pdf',
        fileSize: 1100000,
        isMain: true,
        userId: candidateUsers[1].id
      }
    }),
    prisma.cV.create({
      data: {
        title: 'Tran Van Khai - UI/UX Designer CV',
        fileName: 'tran_van_khai_uiux_cv.pdf',
        fileUrl: 'https://example.com/cvs/tran_van_khai_uiux_cv.pdf',
        fileSize: 1500000,
        isMain: true,
        userId: candidateUsers[2].id
      }
    }),
    // Backend Developer CVs
    prisma.cV.create({
      data: {
        title: 'Pham Thi Dao - Full-stack Developer CV',
        fileName: 'pham_thi_dao_fullstack_cv.pdf',
        fileUrl: 'https://example.com/cvs/pham_thi_dao_fullstack_cv.pdf',
        fileSize: 1200000,
        isMain: true,
        userId: candidateUsers[3].id
      }
    }),
    prisma.cV.create({
      data: {
        title: 'Do Van Minh - Node.js Developer CV',
        fileName: 'do_van_minh_nodejs_cv.pdf',
        fileUrl: 'https://example.com/cvs/do_van_minh_nodejs_cv.pdf',
        fileSize: 1080000,
        isMain: true,
        userId: candidateUsers[4].id
      }
    }),
    prisma.cV.create({
      data: {
        title: 'Bui Thi Nga - Python Developer CV',
        fileName: 'bui_thi_nga_python_cv.pdf',
        fileUrl: 'https://example.com/cvs/bui_thi_nga_python_cv.pdf',
        fileSize: 1150000,
        isMain: true,
        userId: candidateUsers[5].id
      }
    }),
    // Senior Developer CVs
    prisma.cV.create({
      data: {
        title: 'Lam Van Phuc - Senior Full-stack Developer CV',
        fileName: 'lam_van_phuc_senior_fullstack_cv.pdf',
        fileUrl: 'https://example.com/cvs/lam_van_phuc_senior_fullstack_cv.pdf',
        fileSize: 1300000,
        isMain: true,
        userId: candidateUsers[6].id
      }
    }),
    prisma.cV.create({
      data: {
        title: 'Cao Thi Yen - DevOps Engineer CV',
        fileName: 'cao_thi_yen_devops_cv.pdf',
        fileUrl: 'https://example.com/cvs/cao_thi_yen_devops_cv.pdf',
        fileSize: 1250000,
        isMain: true,
        userId: candidateUsers[7].id
      }
    }),
    // Junior Developer CVs
    prisma.cV.create({
      data: {
        title: 'Hoang Van Em - Junior Developer CV',
        fileName: 'hoang_van_em_junior_cv.pdf',
        fileUrl: 'https://example.com/cvs/hoang_van_em_junior_cv.pdf',
        fileSize: 950000,
        isMain: true,
        userId: candidateUsers[8].id
      }
    }),
    prisma.cV.create({
      data: {
        title: 'Nguyen Thi Thao - Junior Frontend Developer CV',
        fileName: 'nguyen_thi_thao_junior_frontend_cv.pdf',
        fileUrl: 'https://example.com/cvs/nguyen_thi_thao_junior_frontend_cv.pdf',
        fileSize: 980000,
        isMain: true,
        userId: candidateUsers[9].id
      }
    }),
    // Specialized Developer CVs
    prisma.cV.create({
      data: {
        title: 'Dang Van Tuan - Mobile Developer CV',
        fileName: 'dang_van_tuan_mobile_cv.pdf',
        fileUrl: 'https://example.com/cvs/dang_van_tuan_mobile_cv.pdf',
        fileSize: 1180000,
        isMain: true,
        userId: candidateUsers[10].id
      }
    }),
    prisma.cV.create({
      data: {
        title: 'Trinh Thi Ha - Data Scientist CV',
        fileName: 'trinh_thi_ha_data_scientist_cv.pdf',
        fileUrl: 'https://example.com/cvs/trinh_thi_ha_data_scientist_cv.pdf',
        fileSize: 1320000,
        isMain: true,
        userId: candidateUsers[11].id
      }
    }),
    prisma.cV.create({
      data: {
        title: 'Ngo Van Duc - AI Engineer CV',
        fileName: 'ngo_van_duc_ai_engineer_cv.pdf',
        fileUrl: 'https://example.com/cvs/ngo_van_duc_ai_engineer_cv.pdf',
        fileSize: 1400000,
        isMain: true,
        userId: candidateUsers[12].id
      }
    }),
    // Additional CVs for some candidates
    prisma.cV.create({
      data: {
        title: 'Le Van Cong - Frontend Portfolio',
        fileName: 'le_van_cong_portfolio.pdf',
        fileUrl: 'https://example.com/cvs/le_van_cong_portfolio.pdf',
        fileSize: 2100000,
        isMain: false,
        userId: candidateUsers[0].id
      }
    }),
    prisma.cV.create({
      data: {
        title: 'Tran Van Khai - Design Portfolio',
        fileName: 'tran_van_khai_design_portfolio.pdf',
        fileUrl: 'https://example.com/cvs/tran_van_khai_design_portfolio.pdf',
        fileSize: 3500000,
        isMain: false,
        userId: candidateUsers[2].id
      }
    })
  ]);

  // 10. Create Applications
  console.log('📝 Creating applications...');
  const applications = await Promise.all([
    // Applications for Senior Frontend Developer (Job 0)
    prisma.application.create({
      data: {
        status: AppStatus.PENDING,
        cvId: cvs[0].id, // Le Van Cong CV
        coverLetter: 'I am very interested in this Senior Frontend Developer position. I have 3+ years of experience with React and TypeScript, and I believe I would be a great fit for your team. My experience includes building responsive web applications and working with modern development tools.',
        expectedSalary: '30,000,000 VND',
        availableFrom: new Date('2024-02-01'),
        notes: 'Strong candidate with relevant experience in React and TypeScript',
        userId: candidateUsers[0].id,
        jobId: jobs[0].id
      }
    }),
    prisma.application.create({
      data: {
        status: AppStatus.REVIEWING,
        cvId: cvs[1].id, // Nguyen Thi Linh CV
        coverLetter: 'As an expert React developer with 4 years of experience, I am excited about the opportunity to contribute to your frontend team. I have extensive experience with React, TypeScript, and modern frontend architectures.',
        expectedSalary: '32,000,000 VND',
        availableFrom: new Date('2024-01-15'),
        notes: 'Excellent React skills, very experienced candidate',
        userId: candidateUsers[1].id,
        jobId: jobs[0].id
      }
    }),
    
    // Applications for Backend Developer (Job 1)
    prisma.application.create({
      data: {
        status: AppStatus.INTERVIEW,
        cvId: cvs[3].id, // Pham Thi Dao CV
        coverLetter: 'I am excited about the Backend Developer position. My 5 years of experience with Node.js and PostgreSQL makes me a perfect candidate for this role. I have built scalable APIs and worked with microservices architecture.',
        expectedSalary: '28,000,000 VND',
        availableFrom: new Date('2024-01-20'),
        notes: 'Strong backend skills, scheduled for technical interview',
        userId: candidateUsers[3].id,
        jobId: jobs[1].id
      }
    }),
    prisma.application.create({
      data: {
        status: AppStatus.PENDING,
        cvId: cvs[4].id, // Do Van Minh CV
        coverLetter: 'With 6 years of Node.js development experience, I am confident I can contribute significantly to your backend team. I have experience with high-traffic applications and performance optimization.',
        expectedSalary: '30,000,000 VND',
        availableFrom: new Date('2024-02-10'),
        notes: 'Very experienced Node.js developer',
        userId: candidateUsers[4].id,
        jobId: jobs[1].id
      }
    }),

    // Applications for Full-Stack Developer (Job 2)
    prisma.application.create({
      data: {
        status: AppStatus.OFFER,
        cvId: cvs[6].id, // Lam Van Phuc CV
        coverLetter: 'As a senior full-stack developer with 7 years of experience, I am excited about this full-stack opportunity. I have worked extensively with both React and Node.js, making me ideal for this position.',
        expectedSalary: '38,000,000 VND',
        availableFrom: new Date('2024-01-25'),
        notes: 'Excellent candidate, offer extended',
        userId: candidateUsers[6].id,
        jobId: jobs[2].id
      }
    }),

    // Applications for AI/ML Engineer (Job 3)
    prisma.application.create({
      data: {
        status: AppStatus.REVIEWING,
        cvId: cvs[12].id, // Ngo Van Duc CV
        coverLetter: 'I am passionate about AI and machine learning with 6 years of experience in the field. I have worked with TensorFlow, PyTorch, and have experience in deep learning applications.',
        expectedSalary: '30,000,000 VND',
        availableFrom: new Date('2024-02-01'),
        notes: 'Strong AI/ML background, PhD in Computer Science',
        userId: candidateUsers[12].id,
        jobId: jobs[3].id
      }
    }),
    prisma.application.create({
      data: {
        status: AppStatus.REJECTED,
        cvId: cvs[8].id, // Hoang Van Em CV - Junior applying for mid-level
        coverLetter: 'I am very interested in AI and machine learning. Although I am a junior developer, I am eager to learn and have some experience with Python and basic ML concepts.',
        expectedSalary: '18,000,000 VND',
        availableFrom: new Date('2024-01-30'),
        notes: 'Not enough experience for this mid-level position',
        userId: candidateUsers[8].id,
        jobId: jobs[3].id
      }
    }),

    // Applications for Data Scientist (Job 4)
    prisma.application.create({
      data: {
        status: AppStatus.INTERVIEW,
        cvId: cvs[11].id, // Trinh Thi Ha CV
        coverLetter: 'With 5 years of data science experience and a Master\'s degree, I am excited about this Data Scientist opportunity. I have extensive experience with Python, ML frameworks, and statistical analysis.',
        expectedSalary: '40,000,000 VND',
        availableFrom: new Date('2024-02-15'),
        notes: 'Excellent data science background, scheduled for final interview',
        userId: candidateUsers[11].id,
        jobId: jobs[4].id
      }
    }),

    // Applications for DevOps Engineer (Job 5)
    prisma.application.create({
      data: {
        status: AppStatus.PENDING,
        cvId: cvs[7].id, // Cao Thi Yen CV
        coverLetter: 'I am interested in the DevOps Engineer position. With 5 years of experience in cloud infrastructure and automation, I have strong skills in Docker, Kubernetes, and AWS.',
        expectedSalary: '35,000,000 VND',
        availableFrom: new Date('2024-02-20'),
        notes: 'Strong DevOps background',
        userId: candidateUsers[7].id,
        jobId: jobs[5].id
      }
    }),

    // Applications for Java Backend Developer (Job 6)
    prisma.application.create({
      data: {
        status: AppStatus.REVIEWING,
        cvId: cvs[8].id, // Hoang Van Em CV - has Java skills
        coverLetter: 'Although I am a junior developer, I have solid Java fundamentals and am eager to grow in backend development. I am particularly interested in financial software development.',
        expectedSalary: '15,000,000 VND',
        availableFrom: new Date('2024-01-28'),
        notes: 'Junior candidate but shows promise in Java',
        userId: candidateUsers[8].id,
        jobId: jobs[6].id
      }
    }),

    // Applications for React Native Developer (Job 7)
    prisma.application.create({
      data: {
        status: AppStatus.INTERVIEW,
        cvId: cvs[10].id, // Dang Van Tuan CV
        coverLetter: 'I am excited about the React Native Developer position. With 3 years of mobile development experience using React Native and Flutter, I can contribute to your mobile team.',
        expectedSalary: '25,000,000 VND',
        availableFrom: new Date('2024-02-05'),
        notes: 'Perfect fit for mobile development role',
        userId: candidateUsers[10].id,
        jobId: jobs[7].id
      }
    }),

    // Applications for UI/UX Designer (Job 8)
    prisma.application.create({
      data: {
        status: AppStatus.OFFER,
        cvId: cvs[2].id, // Tran Van Khai CV
        coverLetter: 'As a UI/UX designer with 5 years of experience, I am passionate about creating user-centered designs for e-commerce platforms. My portfolio includes various successful projects.',
        expectedSalary: '23,000,000 VND',
        availableFrom: new Date('2024-01-22'),
        notes: 'Excellent design portfolio, offer extended',
        userId: candidateUsers[2].id,
        jobId: jobs[8].id
      }
    }),

    // Applications for Software Engineer - Healthcare (Job 9)
    prisma.application.create({
      data: {
        status: AppStatus.PENDING,
        cvId: cvs[0].id, // Le Van Cong CV - has healthcare interest
        coverLetter: 'I am interested in contributing to healthcare technology. My frontend development skills and interest in meaningful work make me excited about this opportunity.',
        expectedSalary: '25,000,000 VND',
        availableFrom: new Date('2024-02-12'),
        notes: 'Good technical skills, interested in healthcare domain',
        userId: candidateUsers[0].id,
        jobId: jobs[9].id
      }
    }),

    // Applications for Game Developer (Job 10)
    prisma.application.create({
      data: {
        status: AppStatus.REJECTED,
        cvId: cvs[0].id, // Le Van Cong CV - doesn't have game dev skills
        coverLetter: 'Although my experience is in web development, I am very interested in game development and willing to learn Unity and C#.',
        expectedSalary: '18,000,000 VND',
        availableFrom: new Date('2024-02-08'),
        notes: 'No game development experience',
        userId: candidateUsers[0].id,
        jobId: jobs[10].id
      }
    }),

    // Applications for Cloud Infrastructure Engineer (Job 11)
    prisma.application.create({
      data: {
        status: AppStatus.REVIEWING,
        cvId: cvs[7].id, // Cao Thi Yen CV
        coverLetter: 'I am very interested in the Cloud Infrastructure Engineer position. My DevOps experience with AWS, Docker, and Kubernetes aligns perfectly with your requirements.',
        expectedSalary: '32,000,000 VND',
        availableFrom: new Date('2024-02-18'),
        notes: 'Strong cloud infrastructure background',
        userId: candidateUsers[7].id,
        jobId: jobs[11].id
      }
    }),

    // Applications for Business Intelligence Developer (Job 12)
    prisma.application.create({
      data: {
        status: AppStatus.PENDING,
        cvId: cvs[11].id, // Trinh Thi Ha CV - data scientist
        coverLetter: 'With my data science background and experience with analytics tools, I believe I can contribute to your BI development team.',
        expectedSalary: '26,000,000 VND',
        availableFrom: new Date('2024-02-22'),
        notes: 'Good data analysis background',
        userId: candidateUsers[11].id,
        jobId: jobs[12].id
      }
    }),

    // Applications for Junior Frontend Developer (Job 13)
    prisma.application.create({
      data: {
        status: AppStatus.INTERVIEW,
        cvId: cvs[9].id, // Nguyen Thi Thao CV
        coverLetter: 'As a recent graduate with 1 year of experience in JavaScript and React, I am excited about this junior frontend developer opportunity. I am eager to learn and grow.',
        expectedSalary: '12,000,000 VND',
        availableFrom: new Date('2024-01-25'),
        notes: 'Good junior candidate, scheduled for interview',
        userId: candidateUsers[9].id,
        jobId: jobs[13].id
      }
    }),

    // Applications for Internship (Job 14)
    prisma.application.create({
      data: {
        status: AppStatus.OFFER,
        cvId: cvs[8].id, // Hoang Van Em CV
        coverLetter: 'I am very excited about this internship opportunity. As a recent graduate, I am eager to gain practical experience and contribute to real projects.',
        expectedSalary: '4,000,000 VND',
        availableFrom: new Date('2024-01-20'),
        notes: 'Enthusiastic candidate, internship offer extended',
        userId: candidateUsers[8].id,
        jobId: jobs[14].id
      }
    })
  ]);

  // 11. Create Interviews
  console.log('🎤 Creating interviews...');
  await Promise.all([
    prisma.interview.create({
      data: {
        title: 'Technical Interview - Backend Developer',
        description: 'Technical interview focusing on Node.js, PostgreSQL, and system design',
        scheduledAt: new Date('2024-01-25T14:00:00Z'),
        duration: 60,
        location: 'TechCorp Vietnam Office - Meeting Room A',
        status: InterviewStatus.SCHEDULED,
        notes: 'Focus on Node.js skills and database design',
        applicationId: applications[2].id, // Pham Thi Dao's application
        interviewerId: users[1].id, // Nguyen Van Anh (recruiter)
        jobId: jobs[1].id
      }
    }),
    prisma.interview.create({
      data: {
        title: 'Final Interview - Data Scientist',
        description: 'Final interview with the technical team and project manager',
        scheduledAt: new Date('2024-01-28T10:00:00Z'),
        duration: 90,
        location: 'Online - Google Meet',
        meetingUrl: 'https://meet.google.com/data-scientist-final',
        status: InterviewStatus.SCHEDULED,
        notes: 'Final round, focus on project experience and culture fit',
        applicationId: applications[7].id, // Trinh Thi Ha's application
        interviewerId: users[3].id, // Le Thi Bich (recruiter)
        jobId: jobs[4].id
      }
    }),
    prisma.interview.create({
      data: {
        title: 'Technical Interview - React Native Developer',
        description: 'Technical interview covering mobile development, React Native, and app deployment',
        scheduledAt: new Date('2024-01-30T15:30:00Z'),
        duration: 75,
        location: 'E-Commerce Pro Office - Conference Room B',
        status: InterviewStatus.COMPLETED,
        notes: 'Candidate showed excellent mobile development skills',
        applicationId: applications[11].id, // Dang Van Tuan's application
        interviewerId: users[5].id, // Hoang Thi Mai (recruiter)
        jobId: jobs[7].id
      }
    }),
    prisma.interview.create({
      data: {
        title: 'Junior Developer Interview',
        description: 'Interview for junior frontend developer position',
        scheduledAt: new Date('2024-02-02T09:00:00Z'),
        duration: 45,
        location: 'TechCorp Vietnam Office - Meeting Room C',
        status: InterviewStatus.SCHEDULED,
        notes: 'Entry-level position, focus on fundamentals and learning attitude',
        applicationId: applications[17].id, // Nguyen Thi Thao's application
        interviewerId: users[2].id, // Tran Minh Duc (recruiter)
        jobId: jobs[13].id
      }
    })
  ]);

  // 12. Create Saved Jobs
  console.log('💾 Creating saved jobs...');
  await Promise.all([
    // Frontend developers saving backend jobs
    prisma.savedJob.create({
      data: {
        userId: candidateUsers[0].id, // Le Van Cong
        jobId: jobs[1].id // Backend Developer
      }
    }),
    prisma.savedJob.create({
      data: {
        userId: candidateUsers[1].id, // Nguyen Thi Linh
        jobId: jobs[2].id // Full-Stack Developer
      }
    }),
    // Backend developers saving related jobs
    prisma.savedJob.create({
      data: {
        userId: candidateUsers[3].id, // Pham Thi Dao
        jobId: jobs[5].id // DevOps Engineer
      }
    }),
    prisma.savedJob.create({
      data: {
        userId: candidateUsers[4].id, // Do Van Minh
        jobId: jobs[2].id // Full-Stack Developer
      }
    }),
    // DevOps engineer saving cloud jobs
    prisma.savedJob.create({
      data: {
        userId: candidateUsers[7].id, // Cao Thi Yen
        jobId: jobs[11].id // Cloud Infrastructure Engineer
      }
    }),
    // Data scientist saving AI jobs
    prisma.savedJob.create({
      data: {
        userId: candidateUsers[11].id, // Trinh Thi Ha
        jobId: jobs[3].id // AI/ML Engineer
      }
    }),
    // Junior developers saving entry level jobs
    prisma.savedJob.create({
      data: {
        userId: candidateUsers[8].id, // Hoang Van Em
        jobId: jobs[14].id // Internship
      }
    }),
    prisma.savedJob.create({
      data: {
        userId: candidateUsers[9].id, // Nguyen Thi Thao
        jobId: jobs[13].id // Junior Frontend Developer
      }
    })
  ]);

  // 13. Create Job Alerts
  console.log('🔔 Creating job alerts...');
  await Promise.all([
    prisma.jobAlert.create({
      data: {
        userId: candidateUsers[0].id, // Le Van Cong
        keywords: 'React, TypeScript, Frontend, JavaScript',
        location: 'Ho Chi Minh City',
        type: JobType.FULL_TIME
      }
    }),
    prisma.jobAlert.create({
      data: {
        userId: candidateUsers[1].id, // Nguyen Thi Linh
        keywords: 'React, Frontend, Full-stack, TypeScript',
        location: 'Ho Chi Minh City',
        type: JobType.FULL_TIME
      }
    }),
    prisma.jobAlert.create({
      data: {
        userId: candidateUsers[3].id, // Pham Thi Dao
        keywords: 'Node.js, Backend, API, PostgreSQL',
        location: 'Ho Chi Minh City',
        type: JobType.FULL_TIME
      }
    }),
    prisma.jobAlert.create({
      data: {
        userId: candidateUsers[7].id, // Cao Thi Yen
        keywords: 'DevOps, AWS, Docker, Kubernetes, Cloud',
        location: 'Ho Chi Minh City',
        type: JobType.FULL_TIME
      }
    }),
    prisma.jobAlert.create({
      data: {
        userId: candidateUsers[11].id, // Trinh Thi Ha
        keywords: 'Data Science, Machine Learning, Python, Analytics',
        location: 'Ho Chi Minh City',
        type: JobType.FULL_TIME
      }
    }),
    prisma.jobAlert.create({
      data: {
        userId: candidateUsers[8].id, // Hoang Van Em
        keywords: 'Junior, Entry Level, Python, Java, Internship',
        location: 'Ho Chi Minh City',
        type: JobType.INTERNSHIP
      }
    })
  ]);

  // 14. Create Notifications
  console.log('📢 Creating notifications...');
  await Promise.all([
    prisma.notification.create({
      data: {
        title: 'Application Status Update',
        message: 'Your application for Backend Developer position has been moved to interview stage.',
        type: NotificationType.APPLICATION_STATUS_CHANGED,
        data: {
          applicationId: applications[2].id,
          jobTitle: 'Backend Developer (Node.js)',
          status: 'INTERVIEW'
        },
        userId: candidateUsers[3].id // Pham Thi Dao
      }
    }),
    prisma.notification.create({
      data: {
        title: 'Interview Scheduled',
        message: 'Your interview for Data Scientist position has been scheduled for January 28, 2024.',
        type: NotificationType.INTERVIEW_SCHEDULED,
        data: {
          interviewId: 'interview-data-scientist',
          jobTitle: 'Data Scientist',
          scheduledAt: '2024-01-28T10:00:00Z'
        },
        userId: candidateUsers[11].id // Trinh Thi Ha
      }
    }),
    prisma.notification.create({
      data: {
        title: 'Job Application Received',
        message: 'Your application for Senior Frontend Developer has been received and is under review.',
        type: NotificationType.JOB_APPLICATION,
        data: {
          applicationId: applications[0].id,
          jobTitle: 'Senior Frontend Developer'
        },
        userId: candidateUsers[0].id // Le Van Cong
      }
    }),
    prisma.notification.create({
      data: {
        title: 'Job Offer Extended',
        message: 'Congratulations! You have received a job offer for Full-Stack Developer position.',
        type: NotificationType.JOB_APPROVED,
        data: {
          applicationId: applications[4].id,
          jobTitle: 'Full-Stack Developer',
          salary: '38,000,000 VND'
        },
        userId: candidateUsers[6].id // Lam Van Phuc
      }
    }),
    prisma.notification.create({
      data: {
        title: 'New Job Match',
        message: 'We found a new job that matches your skills: Cloud Infrastructure Engineer.',
        type: NotificationType.NEW_JOB_MATCH,
        data: {
          jobId: jobs[11].id,
          jobTitle: 'Cloud Infrastructure Engineer',
          matchScore: 0.92
        },
        userId: candidateUsers[7].id // Cao Thi Yen
      }
    }),
    prisma.notification.create({
      data: {
        title: 'Internship Offer',
        message: 'Great news! You have been selected for our Software Development Internship program.',
        type: NotificationType.JOB_APPROVED,
        data: {
          applicationId: applications[17].id,
          jobTitle: 'Internship - Software Development'
        },
        userId: candidateUsers[8].id // Hoang Van Em
      }
    })
  ]);

  // 15. Create Company Reviews
  console.log('⭐ Creating company reviews...');
  await Promise.all([
    prisma.companyReview.create({
      data: {
        rating: 5,
        title: 'Excellent place to work for tech professionals',
        comment: 'TechCorp Vietnam offers an amazing work environment with cutting-edge technology and supportive colleagues. The management is very understanding and promotes work-life balance.',
        pros: 'Great salary, modern tech stack, flexible working hours, learning opportunities',
        cons: 'Sometimes projects can have tight deadlines',
        isVerified: true,
        userId: candidateUsers[0].id, // Le Van Cong
        companyId: companies[0].id // TechCorp Vietnam
      }
    }),
    prisma.companyReview.create({
      data: {
        rating: 4,
        title: 'Innovative startup with great potential',
        comment: 'StartupXYZ is an exciting place to work on AI projects. The team is young and dynamic, and there are lots of opportunities to learn and grow.',
        pros: 'Innovative projects, equity options, flexible schedule, cutting-edge AI work',
        cons: 'Being a startup, sometimes resources can be limited',
        isVerified: false,
        userId: candidateUsers[12].id, // Ngo Van Duc
        companyId: companies[1].id // StartupXYZ
      }
    }),
    prisma.companyReview.create({
      data: {
        rating: 4,
        title: 'Stable financial company with good benefits',
        comment: 'Global Finance provides a stable work environment with excellent benefits. Good for those who prefer structured work and career stability.',
        pros: 'Job security, excellent benefits, professional development, stable income',
        cons: 'Less flexibility in technology choices, formal work environment',
        isVerified: true,
        userId: candidateUsers[7].id, // Cao Thi Yen
        companyId: companies[2].id // Global Finance Ltd
      }
    }),
    prisma.companyReview.create({
      data: {
        rating: 5,
        title: 'Great company for UI/UX designers',
        comment: 'E-Commerce Pro values design and user experience. As a designer, I feel my work is appreciated and I have access to the latest design tools.',
        pros: 'Design-focused culture, latest tools, creative freedom, good team collaboration',
        cons: 'Fast-paced environment can be challenging sometimes',
        isVerified: true,
        userId: candidateUsers[2].id, // Tran Van Khai
        companyId: companies[3].id // E-Commerce Pro
      }
    })
  ]);

  // 16. Create Job Recommendations
  console.log('🎯 Creating job recommendations...');
  await Promise.all([
    prisma.jobRecommendation.create({
      data: {
        score: 0.95,
        reason: 'Perfect match based on React and TypeScript expertise',
        jobId: jobs[0].id, // Senior Frontend Developer
        userId: candidateUsers[1].id // Nguyen Thi Linh
      }
    }),
    prisma.jobRecommendation.create({
      data: {
        score: 0.88,
        reason: 'Strong match for Node.js and PostgreSQL experience',
        jobId: jobs[1].id, // Backend Developer
        userId: candidateUsers[4].id // Do Van Minh
      }
    }),
    prisma.jobRecommendation.create({
      data: {
        score: 0.92,
        reason: 'Excellent fit based on full-stack development skills',
        jobId: jobs[2].id, // Full-Stack Developer
        userId: candidateUsers[6].id // Lam Van Phuc
      }
    }),
    prisma.jobRecommendation.create({
      data: {
        score: 0.85,
        reason: 'Great match for AI/ML expertise and Python skills',
        jobId: jobs[3].id, // AI/ML Engineer
        userId: candidateUsers[12].id // Ngo Van Duc
      }
    }),
    prisma.jobRecommendation.create({
      data: {
        score: 0.91,
        reason: 'Perfect match for DevOps and cloud infrastructure skills',
        jobId: jobs[5].id, // DevOps Engineer
        userId: candidateUsers[7].id // Cao Thi Yen
      }
    }),
    prisma.jobRecommendation.create({
      data: {
        score: 0.93,
        reason: 'Excellent match for mobile development expertise',
        jobId: jobs[7].id, // React Native Developer
        userId: candidateUsers[10].id // Dang Van Tuan
      }
    }),
    prisma.jobRecommendation.create({
      data: {
        score: 0.87,
        reason: 'Strong match for data science and analytics background',
        jobId: jobs[4].id, // Data Scientist
        userId: candidateUsers[11].id // Trinh Thi Ha
      }
    })
  ]);

  // 17. Create Internal Notes
  console.log('📝 Creating internal notes...');
  await Promise.all([
    prisma.internalNote.create({
      data: {
        content: 'Candidate shows exceptional React skills and has a good understanding of modern frontend architecture. Recommended for next round.',
        isPrivate: false,
        authorId: users[1].id, // Nguyen Van Anh (recruiter)
        applicationId: applications[1].id // Nguyen Thi Linh's application
      }
    }),
    prisma.internalNote.create({
      data: {
        content: 'Strong technical background in Node.js. Interview went well, candidate demonstrated good problem-solving skills.',
        isPrivate: false,
        authorId: users[1].id, // Nguyen Van Anh (recruiter)
        applicationId: applications[2].id // Pham Thi Dao's application
      }
    }),
    prisma.internalNote.create({
      data: {
        content: 'Candidate has impressive data science portfolio. PhD background is a plus. Salary expectation is within range.',
        isPrivate: true,
        authorId: users[3].id, // Le Thi Bich (recruiter)
        applicationId: applications[7].id // Trinh Thi Ha's application
      }
    }),
    prisma.internalNote.create({
      data: {
        content: 'Excellent cultural fit and shows great enthusiasm for learning. Perfect for our internship program.',
        isPrivate: false,
        authorId: users[3].id, // Le Thi Bich (recruiter)
        applicationId: applications[17].id // Hoang Van Em's application
      }
    })
  ]);

  // 18. Create Audit Logs
  console.log('📊 Creating audit logs...');
  await Promise.all([
    prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'Application',
        entityId: applications[0].id,
        newValues: {
          status: 'PENDING',
          jobId: jobs[0].id,
          userId: candidateUsers[0].id,
          expectedSalary: '30,000,000 VND'
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        userId: candidateUsers[0].id
      }
    }),
    prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'Application',
        entityId: applications[1].id,
        oldValues: {
          status: 'PENDING'
        },
        newValues: {
          status: 'REVIEWING'
        },
        ipAddress: '10.0.0.50',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        userId: users[1].id // Recruiter updating status
      }
    }),
    prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'Job',
        entityId: jobs[0].id,
        newValues: {
          title: 'Senior Frontend Developer',
          companyId: companies[0].id,
          type: 'FULL_TIME',
          isActive: true
        },
        ipAddress: '172.16.0.25',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        userId: users[1].id // Recruiter creating job
      }
    }),
    prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'User',
        entityId: candidateUsers[0].id,
        oldValues: {
          isEmailVerified: false
        },
        newValues: {
          isEmailVerified: true
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        userId: candidateUsers[0].id
      }
    })
  ]);

  console.log('✅ Database seeding completed successfully!');
  console.log(`📊 Created:`);
  console.log(`   - ${skills.length} skills across multiple categories`);
  console.log(`   - ${companies.length} companies with diverse industries`);
  console.log(`   - ${users.length} users (1 admin, 6 recruiters, 13 candidates)`);
  console.log(`   - ${jobs.length} jobs with varied requirements and experience levels`);
  console.log(`   - ${cvs.length} CVs for candidates`);
  console.log(`   - ${applications.length} applications with different statuses`);
  console.log(`   - 4 interviews with various statuses`);
  console.log(`   - 8 saved jobs`);
  console.log(`   - 6 job alerts`);
  console.log(`   - 6 notifications`);
  console.log(`   - 4 company reviews`);
  console.log(`   - 7 job recommendations`);
  console.log(`   - 4 internal notes`);
  console.log(`   - 4 audit logs`);
  console.log(`   - Multiple user skills and job skills mappings`);
  console.log(`   - Company members for each company`);
  console.log(`   - Comprehensive profiles for all candidates`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
