-- CreateEnum
CREATE TYPE "CourtesyStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'USED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CourtesyCodeType" AS ENUM ('FREE', 'DISCOUNT');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "allowCourtesy" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "courtesyLimit" INTEGER;

-- CreateTable
CREATE TABLE "courtesy_requests" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "status" "CourtesyStatus" NOT NULL DEFAULT 'PENDING',
    "code" TEXT,
    "codeType" "CourtesyCodeType",
    "discountValue" DOUBLE PRECISION,
    "expiresAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courtesy_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "courtesy_requests_code_key" ON "courtesy_requests"("code");

-- CreateIndex
CREATE INDEX "courtesy_requests_eventId_idx" ON "courtesy_requests"("eventId");

-- CreateIndex
CREATE INDEX "courtesy_requests_email_idx" ON "courtesy_requests"("email");

-- CreateIndex
CREATE INDEX "courtesy_requests_code_idx" ON "courtesy_requests"("code");

-- CreateIndex
CREATE UNIQUE INDEX "courtesy_requests_eventId_email_key" ON "courtesy_requests"("eventId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "courtesy_requests_eventId_rut_key" ON "courtesy_requests"("eventId", "rut");

-- AddForeignKey
ALTER TABLE "courtesy_requests" ADD CONSTRAINT "courtesy_requests_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courtesy_requests" ADD CONSTRAINT "courtesy_requests_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
