import { PrismaClient, UserRole, JobType } from '../src/generated/prisma/index.js';

console.log('PrismaClient:', PrismaClient);
console.log('prisma instance:', new PrismaClient());
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting simple database seeding...');
  
  const passwordHash = await bcrypt.hash('password123', 10);

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.internalNote.deleteMany();
  await prisma.jobRecommendation.deleteMany();
  await prisma.companyReview.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.jobAlert.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.application.deleteMany();
  await prisma.cV.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.jobSkill.deleteMany();
  await prisma.job.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.companyMember.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // Create Skills
  console.log('📚 Creating skills...');
  const skills = await Promise.all([
    prisma.skill.create({
      data: { name: 'JavaScript', category: 'Programming' }
    }),
    prisma.skill.create({
      data: { name: 'TypeScript', category: 'Programming' }
    }),
    prisma.skill.create({
      data: { name: 'React', category: 'Frontend' }
    })
  ]);

  // Create Company
  console.log('🏢 Creating company...');
  const company = await prisma.company.create({
    data: {
      name: 'TechCorp Vietnam',
      website: 'https://techcorp.vn',
      description: 'Leading technology company in Vietnam',
      industry: 'Technology',
      isVerified: true,
      isActive: true
    }
  });

  // Create Users
  console.log('👥 Creating users...');
  const recruiter = await prisma.user.create({
    data: {
      email: 'recruiter@techcorp.vn',
      fullName: 'Nguyen Van A',
      passwordHash,
      role: UserRole.RECRUITER,
      phoneNumber: '+84 912 345 678',
      isActive: true,
      isEmailVerified: true,
      companyId: company.id
    }
  });

  const candidate = await prisma.user.create({
    data: {
      email: 'candidate@gmail.com',
      fullName: 'Le Van C',
      passwordHash,
      role: UserRole.CANDIDATE,
      phoneNumber: '+84 934 567 890',
      isActive: true,
      isEmailVerified: true
    }
  });

  // Create Job
  console.log('💼 Creating job...');
  const job = await prisma.job.create({
    data: {
      title: 'Frontend Developer',
      description: 'We are looking for a Frontend Developer to join our team.',
      location: 'Ho Chi Minh City',
      type: JobType.FULL_TIME,
      isActive: true,
      isApproved: true,
      companyId: company.id
    }
  });

  // Create Profile
  console.log('📄 Creating profile...');
  await prisma.profile.create({
    data: {
      userId: candidate.id,
      headline: 'Frontend Developer with React experience',
      location: 'Ho Chi Minh City',
      experience: '2 years of frontend development',
      education: 'Bachelor of Computer Science',
      skills: 'React, JavaScript, HTML, CSS'
    }
  });

  // Create CV
  console.log('📋 Creating CV...');
  const cv = await prisma.cV.create({
    data: {
      title: 'Le Van C - Frontend Developer CV',
      fileName: 'le_van_c_cv.pdf',
      fileUrl: 'https://example.com/cvs/le_van_c_cv.pdf',
      fileSize: 1024000,
      isMain: true,
      userId: candidate.id
    }
  });

  // Create Application
  console.log('📝 Creating application...');
  await prisma.application.create({
    data: {
      status: 'PENDING',
      cvId: cv.id,
      coverLetter: 'I am interested in this Frontend Developer position.',
      expectedSalary: '25,000,000 VND',
      userId: candidate.id,
      jobId: job.id
    }
  });

  console.log('✅ Simple database seeding completed successfully!');
  console.log(`📊 Created:`);
  console.log(`   - ${skills.length} skills`);
  console.log(`   - 1 company`);
  console.log(`   - 2 users (1 recruiter, 1 candidate)`);
  console.log(`   - 1 job`);
  console.log(`   - 1 profile`);
  console.log(`   - 1 CV`);
  console.log(`   - 1 application`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
