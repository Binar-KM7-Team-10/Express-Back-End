/*
  Warnings:

  - You are about to drop the column `flightId` on the `Service` table. All the data in the column will be lost.
  - Added the required column `cityCode` to the `Airport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `continent` to the `Airport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `draftDueDateTime` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountNumber` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_flightId_fkey";

-- AlterTable
ALTER TABLE "Airport" ADD COLUMN     "cityCode" TEXT NOT NULL,
ADD COLUMN     "continent" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "draftDueDateTime" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'Draft',
ALTER COLUMN "bookingCode" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Flight" ALTER COLUMN "flightType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "paymentDueDateTime" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "CVV" TEXT,
ADD COLUMN     "accountNumber" TEXT NOT NULL,
ADD COLUMN     "expiryDate" TEXT,
ADD COLUMN     "holderName" TEXT;

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "flightId";

-- CreateTable
CREATE TABLE "FlightService" (
    "id" SERIAL NOT NULL,
    "flightId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,

    CONSTRAINT "FlightService_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FlightService" ADD CONSTRAINT "FlightService_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightService" ADD CONSTRAINT "FlightService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
