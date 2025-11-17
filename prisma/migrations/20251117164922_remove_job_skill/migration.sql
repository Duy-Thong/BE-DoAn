/*
  Warnings:

  - You are about to drop the `JobSkill` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."JobSkill" DROP CONSTRAINT "JobSkill_jobId_fkey";

-- DropTable
DROP TABLE "public"."JobSkill";
