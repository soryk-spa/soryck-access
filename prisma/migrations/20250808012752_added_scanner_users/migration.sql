-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SCANNER';

-- CreateTable
CREATE TABLE "event_scanners" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "scannerId" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_scanners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_scanners_eventId_scannerId_key" ON "event_scanners"("eventId", "scannerId");

-- AddForeignKey
ALTER TABLE "event_scanners" ADD CONSTRAINT "event_scanners_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_scanners" ADD CONSTRAINT "event_scanners_scannerId_fkey" FOREIGN KEY ("scannerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_scanners" ADD CONSTRAINT "event_scanners_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
