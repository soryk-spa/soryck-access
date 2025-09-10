/*
  Warnings:

  - You are about to drop the column `venueSeatId` on the `event_seats` table. All the data in the column will be lost.
  - You are about to drop the column `x` on the `event_seats` table. All the data in the column will be lost.
  - You are about to drop the column `y` on the `event_seats` table. All the data in the column will be lost.
  - You are about to drop the column `capacity` on the `sections` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `sections` table. All the data in the column will be lost.
  - You are about to drop the column `priceZone` on the `sections` table. All the data in the column will be lost.
  - You are about to drop the column `rotation` on the `sections` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `sections` table. All the data in the column will be lost.
  - You are about to drop the column `x` on the `sections` table. All the data in the column will be lost.
  - You are about to drop the column `y` on the `sections` table. All the data in the column will be lost.
  - You are about to drop the column `layout` on the `venues` table. All the data in the column will be lost.
  - You are about to drop the `venue_seats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `venue_sections` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "event_seats" DROP CONSTRAINT "event_seats_venueSeatId_fkey";

-- DropForeignKey
ALTER TABLE "venue_seats" DROP CONSTRAINT "venue_seats_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "venue_sections" DROP CONSTRAINT "venue_sections_venueId_fkey";

-- AlterTable
ALTER TABLE "event_seats" DROP COLUMN "venueSeatId",
DROP COLUMN "x",
DROP COLUMN "y",
ADD COLUMN     "displayName" TEXT;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "address" TEXT,
ADD COLUMN     "comuna" TEXT,
ADD COLUMN     "comunaId" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "regionId" TEXT;

-- AlterTable
ALTER TABLE "sections" DROP COLUMN "capacity",
DROP COLUMN "height",
DROP COLUMN "priceZone",
DROP COLUMN "rotation",
DROP COLUMN "width",
DROP COLUMN "x",
DROP COLUMN "y",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "hasSeats" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "rowCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "seatCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "seatsPerRow" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "venues" DROP COLUMN "layout",
ADD COLUMN     "layoutElements" JSONB;

-- DropTable
DROP TABLE "venue_seats";

-- DropTable
DROP TABLE "venue_sections";

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comunas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "regionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comunas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_tiers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CLP',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "ticketTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "regions_name_key" ON "regions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "regions_code_key" ON "regions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "comunas_name_regionId_key" ON "comunas"("name", "regionId");

-- AddForeignKey
ALTER TABLE "comunas" ADD CONSTRAINT "comunas_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_comunaId_fkey" FOREIGN KEY ("comunaId") REFERENCES "comunas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_tiers" ADD CONSTRAINT "price_tiers_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "ticket_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
