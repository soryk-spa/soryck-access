-- CreateEnum
CREATE TYPE "commission_types" AS ENUM ('PLATFORM_FEE', 'PROCESSING_FEE', 'PROMOTIONAL');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "totalCommissions" DOUBLE PRECISION,
ADD COLUMN     "totalRevenue" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "baseAmount" DOUBLE PRECISION,
ADD COLUMN     "commissionAmount" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "commissions" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "commission_types" NOT NULL DEFAULT 'PLATFORM_FEE',
    "baseAmount" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CLP',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
