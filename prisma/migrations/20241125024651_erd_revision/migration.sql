/*
  Warnings:

  - You are about to drop the column `scheduleId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `departureDate` on the `Flight` table. All the data in the column will be lost.
  - You are about to drop the column `journeyType` on the `Flight` table. All the data in the column will be lost.
  - You are about to drop the column `passengerCount` on the `Flight` table. All the data in the column will be lost.
  - You are about to drop the column `returnDate` on the `Flight` table. All the data in the column will be lost.
  - You are about to drop the column `citizenship` on the `Passenger` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfExpiry` on the `Passenger` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Passenger` table. All the data in the column will be lost.
  - You are about to drop the column `amountPaid` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `bookingId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `arrivalTime` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `departureTime` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `bookingId` on the `Seat` table. All the data in the column will be lost.
  - You are about to drop the column `isAvailable` on the `Seat` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bookingCode]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bookedSeatId]` on the table `Passenger` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invoiceId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bookingCode` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `flightNumber` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `flightType` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ageGroup` to the `Passenger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookedSeatId` to the `Passenger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nationality` to the `Passenger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoiceId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Made the column `date` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `arrivalDateTime` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departureDateTime` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "Seat" DROP CONSTRAINT "Seat_bookingId_fkey";

-- DropIndex
DROP INDEX "Payment_bookingId_key";

-- AlterTable
ALTER TABLE "Airline" ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "scheduleId",
DROP COLUMN "totalPrice",
ADD COLUMN     "bookingCode" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'Unpaid';

-- AlterTable
ALTER TABLE "Flight" DROP COLUMN "departureDate",
DROP COLUMN "journeyType",
DROP COLUMN "passengerCount",
DROP COLUMN "returnDate",
ADD COLUMN     "flightNumber" TEXT NOT NULL,
ADD COLUMN     "flightType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "bookingId" INTEGER,
ADD COLUMN     "paymentId" INTEGER,
ADD COLUMN     "scheduleId" INTEGER;

-- AlterTable
ALTER TABLE "Passenger" DROP COLUMN "citizenship",
DROP COLUMN "dateOfExpiry",
DROP COLUMN "type",
ADD COLUMN     "ageGroup" TEXT NOT NULL,
ADD COLUMN     "bookedSeatId" INTEGER NOT NULL,
ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "nationality" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "amountPaid",
DROP COLUMN "bookingId",
DROP COLUMN "status",
ADD COLUMN     "invoiceId" INTEGER NOT NULL,
ALTER COLUMN "date" SET NOT NULL;

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "arrivalTime",
DROP COLUMN "departureTime",
ADD COLUMN     "arrivalDateTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "departureDateTime" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Seat" DROP COLUMN "bookingId",
DROP COLUMN "isAvailable";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleId" TEXT,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'Buyer';

-- CreateTable
CREATE TABLE "Baggage" (
    "id" SERIAL NOT NULL,
    "flightId" INTEGER NOT NULL,
    "maxBaggageWeight" INTEGER,
    "maxCabinBaggageWeight" INTEGER NOT NULL,

    CONSTRAINT "Baggage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "flightId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItinerarySchedule" (
    "id" SERIAL NOT NULL,
    "itineraryId" INTEGER NOT NULL,
    "scheduleId" INTEGER NOT NULL,
    "tripDirection" TEXT NOT NULL DEFAULT 'Outbound',

    CONSTRAINT "ItinerarySchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Itinerary" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "journeyType" TEXT NOT NULL,

    CONSTRAINT "Itinerary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookedSeat" (
    "id" SERIAL NOT NULL,
    "seatId" INTEGER NOT NULL,
    "bookingId" INTEGER NOT NULL,

    CONSTRAINT "BookedSeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "taxAmount" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Baggage_flightId_key" ON "Baggage"("flightId");

-- CreateIndex
CREATE UNIQUE INDEX "Itinerary_bookingId_key" ON "Itinerary"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "BookedSeat_seatId_key" ON "BookedSeat"("seatId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_bookingId_key" ON "Invoice"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_bookingCode_key" ON "Booking"("bookingCode");

-- CreateIndex
CREATE UNIQUE INDEX "Passenger_bookedSeatId_key" ON "Passenger"("bookedSeatId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_invoiceId_key" ON "Payment"("invoiceId");

-- AddForeignKey
ALTER TABLE "Baggage" ADD CONSTRAINT "Baggage_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItinerarySchedule" ADD CONSTRAINT "ItinerarySchedule_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItinerarySchedule" ADD CONSTRAINT "ItinerarySchedule_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Itinerary" ADD CONSTRAINT "Itinerary_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookedSeat" ADD CONSTRAINT "BookedSeat_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookedSeat" ADD CONSTRAINT "BookedSeat_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Passenger" ADD CONSTRAINT "Passenger_bookedSeatId_fkey" FOREIGN KEY ("bookedSeatId") REFERENCES "BookedSeat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
