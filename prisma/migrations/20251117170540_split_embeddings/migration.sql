/*
  Warnings:

  - You are about to drop the column `embedding` on the `CV` table. All the data in the column will be lost.
  - You are about to drop the column `embedding` on the `Job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."CV" DROP COLUMN "embedding",
ADD COLUMN     "experienceEmbedding" DOUBLE PRECISION[],
ADD COLUMN     "skillEmbedding" DOUBLE PRECISION[],
ADD COLUMN     "titleEmbedding" DOUBLE PRECISION[];

-- AlterTable
ALTER TABLE "public"."Job" DROP COLUMN "embedding",
ADD COLUMN     "descriptionEmbedding" DOUBLE PRECISION[],
ADD COLUMN     "requirementEmbedding" DOUBLE PRECISION[],
ADD COLUMN     "titleEmbedding" DOUBLE PRECISION[];
