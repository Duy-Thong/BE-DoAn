/*
  Warnings:

  - You are about to drop the column `skillEmbedding` on the `CV` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."CV" DROP COLUMN "skillEmbedding",
ADD COLUMN     "targetEmbedding" DOUBLE PRECISION[];
