/*
  Warnings:

  - You are about to drop the column `templateId` on the `CV` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CV" DROP CONSTRAINT "CV_templateId_fkey";

-- DropIndex
DROP INDEX "public"."Application_cvId_jobId_key";

-- DropIndex
DROP INDEX "public"."CV_templateId_idx";

-- AlterTable
ALTER TABLE "public"."CV" DROP COLUMN "templateId";

-- CreateIndex
CREATE INDEX "Application_cvId_jobId_status_idx" ON "public"."Application"("cvId", "jobId", "status");
