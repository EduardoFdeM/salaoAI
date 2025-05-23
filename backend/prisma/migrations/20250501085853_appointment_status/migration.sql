-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AppointmentStatus" ADD VALUE 'SCHEDULED';
ALTER TYPE "AppointmentStatus" ADD VALUE 'WAITING';
ALTER TYPE "AppointmentStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "AppointmentStatus" ADD VALUE 'CANCELLED_BY_CLIENT';
ALTER TYPE "AppointmentStatus" ADD VALUE 'CANCELLED_BY_SALON';
ALTER TYPE "AppointmentStatus" ADD VALUE 'NO_SHOW';

-- AlterTable
ALTER TABLE "clients" ALTER COLUMN "phone" DROP NOT NULL;
