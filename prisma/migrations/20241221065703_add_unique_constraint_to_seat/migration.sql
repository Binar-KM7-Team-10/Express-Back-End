/*
  Warnings:

  - A unique constraint covering the columns `[scheduleId,seatNumber]` on the table `Seat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Seat_scheduleId_seatNumber_key" ON "Seat"("scheduleId", "seatNumber");
