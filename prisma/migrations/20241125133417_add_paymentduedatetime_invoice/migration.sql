/*
  Warnings:

  - Added the required column `paymentDueDateTime` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "paymentDueDateTime" TIMESTAMP(3) NOT NULL;
