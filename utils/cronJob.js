const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Notification = require('../models/notification');

class Job {
    static async checkPayment() {
        const updatedBookings = await prisma.booking.findMany({
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
            }
        });

        await prisma.booking.updateMany({
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

        await prisma.bookedSeat.deleteMany({
            where: {
                booking: {
                    status: 'Cancelled'
                }
            }
        });

        await Promise.all(updatedBookings.map(async (booking) => {
            await Notification.create(
                booking.userId,
                `Pembayaran Melewati Batas Waktu`,
                `Pemesanan tiket Anda dengan kode booking ${booking.bookingCode} telah dibatalkan karena pembayaran melewati batas waktu yang ditentukan. Mohon lakukan pemesanan ulang jika masih diperlukan. Terima kasih.`,
                { bookingId: booking.id }
            );
        }));
    }
}

module.exports = Job;