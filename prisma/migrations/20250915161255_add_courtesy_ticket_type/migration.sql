-- AlterTable
ALTER TABLE "courtesy_invitations" ADD COLUMN     "ticketTypeId" TEXT;

-- AddForeignKey
ALTER TABLE "courtesy_invitations" ADD CONSTRAINT "courtesy_invitations_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "ticket_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
