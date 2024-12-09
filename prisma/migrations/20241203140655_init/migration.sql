/*
  Warnings:

  - You are about to drop the column `city` on the `Airport` table. All the data in the column will be lost.
  - You are about to drop the column `cityCode` on the `Airport` table. All the data in the column will be lost.
  - You are about to drop the column `continent` on the `Airport` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Airport` table. All the data in the column will be lost.
  - You are about to drop the column `draftDueDateTime` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `journeyType` on the `Itinerary` table. All the data in the column will be lost.
  - You are about to drop the `ItinerarySchedule` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `cityId` to the `Airport` table without a default value. This is not possible if the table is not empty.
  - Made the column `bookingCode` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Made the column `paymentDueDateTime` on table `Invoice` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `scheduleId` to the `Itinerary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `Passenger` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ItinerarySchedule" DROP CONSTRAINT "ItinerarySchedule_itineraryId_fkey";

-- DropForeignKey
ALTER TABLE "ItinerarySchedule" DROP CONSTRAINT "ItinerarySchedule_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "Passenger" DROP CONSTRAINT "Passenger_bookedSeatId_fkey";

-- DropIndex
DROP INDEX "Itinerary_bookingId_key";

-- AlterTable
ALTER TABLE "Airport" DROP COLUMN "city",
DROP COLUMN "cityCode",
DROP COLUMN "continent",
DROP COLUMN "country",
ADD COLUMN     "cityId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "draftDueDateTime",
ADD COLUMN     "journeyType" TEXT NOT NULL DEFAULT 'One-way',
ALTER COLUMN "status" SET DEFAULT 'Unpaid',
ALTER COLUMN "bookingCode" SET NOT NULL;

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "paymentDueDateTime" SET NOT NULL;

-- AlterTable
ALTER TABLE "Itinerary" DROP COLUMN "journeyType",
ADD COLUMN     "scheduleId" INTEGER NOT NULL,
ADD COLUMN     "tripDirection" TEXT NOT NULL DEFAULT 'Outbound';

-- AlterTable
ALTER TABLE "Passenger" ADD COLUMN     "label" TEXT NOT NULL,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "fullName" DROP NOT NULL,
ALTER COLUMN "birthDate" DROP NOT NULL,
ALTER COLUMN "identityNumber" DROP NOT NULL,
ALTER COLUMN "bookedSeatId" DROP NOT NULL,
ALTER COLUMN "nationality" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otpSecret" TEXT;

-- DropTable
DROP TABLE "ItinerarySchedule";

-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "continent" TEXT NOT NULL,
    "imageUrl" TEXT,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Airport" ADD CONSTRAINT "Airport_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Itinerary" ADD CONSTRAINT "Itinerary_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Passenger" ADD CONSTRAINT "Passenger_bookedSeatId_fkey" FOREIGN KEY ("bookedSeatId") REFERENCES "BookedSeat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
