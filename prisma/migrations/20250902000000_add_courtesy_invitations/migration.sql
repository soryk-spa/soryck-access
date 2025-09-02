-- CreateEnum para el estado de las invitaciones de cortesía
CREATE TYPE "CourtesyInvitationStatus" AS ENUM ('PENDING', 'SENT', 'ACCEPTED', 'EXPIRED');

-- Tabla para las invitaciones de cortesía directas
CREATE TABLE "courtesy_invitations" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "invitedEmail" TEXT NOT NULL,
    "invitedName" TEXT,
    "message" TEXT,
    "status" "CourtesyInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "invitationCode" TEXT UNIQUE,
    "sentAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "ticketId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courtesy_invitations_pkey" PRIMARY KEY ("id")
);

-- Índices para optimizar búsquedas
CREATE INDEX "courtesy_invitations_eventId_idx" ON "courtesy_invitations"("eventId");
CREATE INDEX "courtesy_invitations_invitedEmail_idx" ON "courtesy_invitations"("invitedEmail");
CREATE INDEX "courtesy_invitations_invitationCode_idx" ON "courtesy_invitations"("invitationCode");
CREATE INDEX "courtesy_invitations_status_idx" ON "courtesy_invitations"("status");

-- Único email por evento para evitar duplicados
CREATE UNIQUE INDEX "courtesy_invitations_eventId_invitedEmail_key" ON "courtesy_invitations"("eventId", "invitedEmail");

-- Foreign Keys
ALTER TABLE "courtesy_invitations" ADD CONSTRAINT "courtesy_invitations_eventId_fkey" 
FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "courtesy_invitations" ADD CONSTRAINT "courtesy_invitations_createdBy_fkey" 
FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "courtesy_invitations" ADD CONSTRAINT "courtesy_invitations_ticketId_fkey" 
FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
