/*
  Warnings:

  - A unique constraint covering the columns `[supersededById]` on the table `courtesy_invitations` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "CourtesyInvitationStatus" ADD VALUE 'SUPERSEDED';

-- AlterTable
ALTER TABLE "courtesy_invitations" ADD COLUMN     "supersededAt" TIMESTAMP(3),
ADD COLUMN     "supersededById" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "courtesy_invitations_supersededById_key" ON "courtesy_invitations"("supersededById");

-- AddForeignKey
ALTER TABLE "courtesy_invitations" ADD CONSTRAINT "courtesy_invitations_supersededById_fkey" FOREIGN KEY ("supersededById") REFERENCES "courtesy_invitations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
