/*
  Warnings:

  - Added the required column `orgId` to the `Takeoff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `Takeoff` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Takeoff" ADD COLUMN     "orgId" TEXT NOT NULL,
ADD COLUMN     "projectId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Takeoff_projectId_idx" ON "Takeoff"("projectId");

-- AddForeignKey
ALTER TABLE "Takeoff" ADD CONSTRAINT "Takeoff_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Takeoff" ADD CONSTRAINT "Takeoff_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
