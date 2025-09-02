/*
  Warnings:

  - A unique constraint covering the columns `[ticketId]` on the table `courtesy_invitations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "courtesy_invitations_ticketId_key" ON "courtesy_invitations"("ticketId");
