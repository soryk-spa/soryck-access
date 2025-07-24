-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'ORGANIZER', 'ADMIN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'CLIENT';
