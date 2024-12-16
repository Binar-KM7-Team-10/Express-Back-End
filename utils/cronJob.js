const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Job {
    static async checkPayment() {
        const bookings = await prisma.booking.updateMany({
            where: {
                AND: [
                    {
                        status: 'Unpaid'
                    },
                    {
                        Invoice: {
                            paymentDueDateTime: {
                                lte: new Date(Date.now())
                            }
                        }
                    },
                    {
                        Invoice: {
                            Payment: {
                                is: null
                            }
                        }
                    }
                ]
            },
            data: {
                status: 'Cancelled'
            }
        });

        const bookedSeats = await prisma.bookedSeat.deleteMany({
            where: {
                booking: {
                    status: 'Cancelled'
                }
            }
        });

        // if (bookings.count !== 0) {
        //     console.log(`Updated ${bookings.count} rows of Booking.`);
        //     console.log(`Deleted ${bookedSeats.count} rows of BookedSeat.`);
        // }
    }
}

module.exports = Job;