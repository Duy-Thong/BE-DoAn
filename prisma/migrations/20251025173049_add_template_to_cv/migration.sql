-- AlterTable
ALTER TABLE "public"."CV" ADD COLUMN     "templateId" TEXT;

-- CreateIndex
CREATE INDEX "CV_templateId_idx" ON "public"."CV"("templateId");

-- AddForeignKey
ALTER TABLE "public"."CV" ADD CONSTRAINT "CV_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."CVTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
