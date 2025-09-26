import { PrismaClient, UserRole, JobType } from '../src/generated/prisma/index.js';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  const company = await prisma.company.upsert({
    where: { id: 'seed-company' },
    update: {},
    create: { id: 'seed-company', name: 'TopCV Co', website: 'https://topcv.local' },
  });
  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@topcv.local' },
    update: {},
    create: {
      email: 'recruiter@topcv.local',
      fullName: 'Recruiter One',
      passwordHash,
      role: UserRole.RECRUITER,
      companyId: company.id,
    },
  });
  const candidate = await prisma.user.upsert({
    where: { email: 'candidate@topcv.local' },
    update: {},
    create: {
      email: 'candidate@topcv.local',
      fullName: 'Candidate One',
      passwordHash,
      role: UserRole.CANDIDATE,
    },
  });
  await prisma.job.create({
    data: {
      title: 'Backend Developer',
      description: 'Build APIs',
      type: JobType.FULL_TIME,
      companyId: company.id,
    },
  });
  console.log({ company, recruiter, candidate });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

