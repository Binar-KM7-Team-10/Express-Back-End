/*
  Warnings:

  - You are about to alter the column `seatNumber` on the `Seat` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(3)`.

*/
-- AlterTable
ALTER TABLE "Seat" ALTER COLUMN "seatNumber" SET DATA TYPE VARCHAR(3);
