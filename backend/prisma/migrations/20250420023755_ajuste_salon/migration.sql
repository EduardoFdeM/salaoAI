/*
  Warnings:

  - Added the required column `duration` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "services" ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;
