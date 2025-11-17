/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `CV` table. All the data in the column will be lost.
  - You are about to drop the column `nationality` on the `CV` table. All the data in the column will be lost.
  - You are about to drop the column `author` on the `CVTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `CVTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `CVTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `CVTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `downloadCount` on the `CVTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `isDefault` on the `CVTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `isPremium` on the `CVTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `previewUrl` on the `CVTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `CVTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `CVTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `CVTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `usageCount` on the `CVTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `CVTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailVerified` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `salary` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `SocialMedia` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `SocialMedia` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `companyRole` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isLocked` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `joinedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `nationality` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Upload` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `level` to the `Language` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Made the column `phoneNumber` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Achievement" DROP CONSTRAINT "Achievement_cvId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Activity" DROP CONSTRAINT "Activity_cvId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Application" DROP CONSTRAINT "Application_cvId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Application" DROP CONSTRAINT "Application_jobId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CV" DROP CONSTRAINT "CV_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CVSkill" DROP CONSTRAINT "CVSkill_cvId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CVTemplate" DROP CONSTRAINT "CVTemplate_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."CVTemplate" DROP CONSTRAINT "CVTemplate_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."Certification" DROP CONSTRAINT "Certification_cvId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Education" DROP CONSTRAINT "Education_cvId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Job" DROP CONSTRAINT "Job_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."JobBenefit" DROP CONSTRAINT "JobBenefit_jobId_fkey";

-- DropForeignKey
ALTER TABLE "public"."JobRequirement" DROP CONSTRAINT "JobRequirement_jobId_fkey";

-- DropForeignKey
ALTER TABLE "public"."JobSkill" DROP CONSTRAINT "JobSkill_jobId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Language" DROP CONSTRAINT "Language_cvId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Project" DROP CONSTRAINT "Project_cvId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Reference" DROP CONSTRAINT "Reference_cvId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SavedJob" DROP CONSTRAINT "SavedJob_jobId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SavedJob" DROP CONSTRAINT "SavedJob_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkExperience" DROP CONSTRAINT "WorkExperience_cvId_fkey";

-- DropIndex
DROP INDEX "public"."CVTemplate_category_idx";

-- DropIndex
DROP INDEX "public"."CVTemplate_isDefault_idx";

-- DropIndex
DROP INDEX "public"."CVTemplate_isPremium_idx";

-- DropIndex
DROP INDEX "public"."CVTemplate_slug_idx";

-- DropIndex
DROP INDEX "public"."CVTemplate_slug_key";

-- DropIndex
DROP INDEX "public"."CVTemplate_usageCount_idx";

-- DropIndex
DROP INDEX "public"."Company_isActive_isVerified_idx";

-- DropIndex
DROP INDEX "public"."Job_isActive_idx";

-- DropIndex
DROP INDEX "public"."User_companyId_idx";

-- DropIndex
DROP INDEX "public"."User_isActive_idx";

-- AlterTable
ALTER TABLE "public"."CV" DROP COLUMN "avatarUrl",
DROP COLUMN "nationality",
ADD COLUMN     "isOpenForJob" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."CVTemplate" DROP COLUMN "author",
DROP COLUMN "category",
DROP COLUMN "createdBy",
DROP COLUMN "description",
DROP COLUMN "downloadCount",
DROP COLUMN "isDefault",
DROP COLUMN "isPremium",
DROP COLUMN "previewUrl",
DROP COLUMN "slug",
DROP COLUMN "tags",
DROP COLUMN "updatedBy",
DROP COLUMN "usageCount",
DROP COLUMN "version";

-- AlterTable
ALTER TABLE "public"."Company" DROP COLUMN "isActive",
DROP COLUMN "isEmailVerified",
DROP COLUMN "isVerified",
ADD COLUMN     "documentUrl" TEXT,
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."Job" DROP COLUMN "isActive",
DROP COLUMN "salary",
ADD COLUMN     "salaryId" TEXT,
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."Language" DROP COLUMN "level",
ADD COLUMN     "level" "public"."LanguageLevel" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Notification" DROP COLUMN "data",
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."SocialMedia" DROP COLUMN "isVerified",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "companyId",
DROP COLUMN "companyRole",
DROP COLUMN "isActive",
DROP COLUMN "isEmailVerified",
DROP COLUMN "isLocked",
DROP COLUMN "joinedAt",
DROP COLUMN "nationality",
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "phoneNumber" SET NOT NULL;

-- DropTable
DROP TABLE "public"."Upload";

-- DropEnum
DROP TYPE "public"."UploadCategory";

-- CreateTable
CREATE TABLE "public"."CompanyMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "companyRole" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Salary" (
    "id" TEXT NOT NULL,
    "minAmount" DECIMAL(12,2) NOT NULL,
    "maxAmount" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "isNegotiable" BOOLEAN NOT NULL DEFAULT false,
    "hideAmount" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Salary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SimilarJob" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "similarJobId" TEXT NOT NULL,
    "similarity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SimilarJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RecommendJobforCV" (
    "id" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "similarity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecommendJobforCV_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyMember_userId_idx" ON "public"."CompanyMember"("userId");

-- CreateIndex
CREATE INDEX "CompanyMember_companyId_idx" ON "public"."CompanyMember"("companyId");

-- CreateIndex
CREATE INDEX "CompanyMember_companyRole_idx" ON "public"."CompanyMember"("companyRole");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyMember_userId_companyId_key" ON "public"."CompanyMember"("userId", "companyId");

-- CreateIndex
CREATE INDEX "Salary_currency_idx" ON "public"."Salary"("currency");

-- CreateIndex
CREATE INDEX "SimilarJob_jobId_idx" ON "public"."SimilarJob"("jobId");

-- CreateIndex
CREATE INDEX "SimilarJob_similarJobId_idx" ON "public"."SimilarJob"("similarJobId");

-- CreateIndex
CREATE INDEX "SimilarJob_similarity_idx" ON "public"."SimilarJob"("similarity");

-- CreateIndex
CREATE UNIQUE INDEX "SimilarJob_jobId_similarJobId_key" ON "public"."SimilarJob"("jobId", "similarJobId");

-- CreateIndex
CREATE INDEX "RecommendJobforCV_cvId_idx" ON "public"."RecommendJobforCV"("cvId");

-- CreateIndex
CREATE INDEX "RecommendJobforCV_jobId_idx" ON "public"."RecommendJobforCV"("jobId");

-- CreateIndex
CREATE INDEX "RecommendJobforCV_similarity_idx" ON "public"."RecommendJobforCV"("similarity");

-- CreateIndex
CREATE UNIQUE INDEX "RecommendJobforCV_cvId_jobId_key" ON "public"."RecommendJobforCV"("cvId", "jobId");

-- CreateIndex
CREATE INDEX "CV_isOpenForJob_idx" ON "public"."CV"("isOpenForJob");

-- CreateIndex
CREATE INDEX "Company_status_idx" ON "public"."Company"("status");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "public"."Job"("status");

-- CreateIndex
CREATE INDEX "Notification_expiresAt_idx" ON "public"."Notification"("expiresAt");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "public"."User"("status");

-- AddForeignKey
ALTER TABLE "public"."CompanyMember" ADD CONSTRAINT "CompanyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompanyMember" ADD CONSTRAINT "CompanyMember_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CV" ADD CONSTRAINT "CV_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_salaryId_fkey" FOREIGN KEY ("salaryId") REFERENCES "public"."Salary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "public"."CV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SavedJob" ADD CONSTRAINT "SavedJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SavedJob" ADD CONSTRAINT "SavedJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SimilarJob" ADD CONSTRAINT "SimilarJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SimilarJob" ADD CONSTRAINT "SimilarJob_similarJobId_fkey" FOREIGN KEY ("similarJobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecommendJobforCV" ADD CONSTRAINT "RecommendJobforCV_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "public"."CV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecommendJobforCV" ADD CONSTRAINT "RecommendJobforCV_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkExperience" ADD CONSTRAINT "WorkExperience_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "public"."CV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Education" ADD CONSTRAINT "Education_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "public"."CV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Certification" ADD CONSTRAINT "Certification_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "public"."CV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "public"."CV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Language" ADD CONSTRAINT "Language_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "public"."CV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Achievement" ADD CONSTRAINT "Achievement_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "public"."CV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "public"."CV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reference" ADD CONSTRAINT "Reference_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "public"."CV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CVSkill" ADD CONSTRAINT "CVSkill_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "public"."CV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobRequirement" ADD CONSTRAINT "JobRequirement_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobBenefit" ADD CONSTRAINT "JobBenefit_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobSkill" ADD CONSTRAINT "JobSkill_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
