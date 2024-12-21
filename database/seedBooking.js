const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { customAlphabet } = require('nanoid');

async function seedDatabase() {
    try {
        await prisma.booking.createMany({
            data: [
            {
                userId: 6,
                bookingCode: customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 10)(),
                date: new Date(Date.now()),
                status: 'Unpaid',
                journeyType: 'One Way'
            },
            {
                userId: 6,
                bookingCode: customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 10)(),
                date: new Date(Date.now() - 6 * 3600000),
                status: 'Cancelled',
                journeyType: 'One Way'
            },
            {
                userId: 6,
                bookingCode: customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 10)(),
                date: new Date(Date.now() - 1 * 3600000),
                status: 'Issued',
                journeyType: 'One Way'
            },
            ]
        });

        await prisma.itinerary.createMany({
            data: [
                {
                    bookingId: 1,
                    scheduleId: 1,
                    tripDirection: 'Outbound'
                },
                {
                    bookingId: 2,
                    scheduleId: 2,
                    tripDirection: 'Outbound'
                },
                {
                    bookingId: 3,
                    scheduleId: 3,
                    tripDirection: 'Outbound'
                },
            ]
        });

        const schedules = await prisma.schedule.findMany({
            where: {
                id: {
                    in: [1, 2, 3]
                }
            },
            orderBy: {
                id: 'asc'
            }
        });

        await prisma.bookedSeat.createMany({
            data: [
                {
                    bookingId: 1,
                    seatId: 1
                },
                {
                    bookingId: 3,
                    seatId: 145,
                },
                {
                    bookingId: 3,
                    seatId: 146,
                }
            ]
        });

        await prisma.schedule.update({
            where: { id: 1 },
            data: {
                seatAvailability: {
                    decrement: 1
                },
                version: {
                    increment: 1
                }
            }
        });

        await prisma.schedule.update({
            where: { id: 3 },
            data: {
                seatAvailability: {
                    decrement: 2
                },
                version: {
                    increment: 1
                }
            }
        });

        await prisma.passenger.createMany({
            data: [
                {
                    bookingId: 1,
                    bookedSeatId: 1,
                    label: 'P1',
                    ageGroup: 'Adult',
                    title: 'Mr.',
                    fullName: 'John Doe',
                    familyName: null,
                    birthDate: new Date(Date.now() - (50 * 365 * 24 * 3600000)),
                    nationality: 'United States',
                    identityNumber: '61717913129387',
                    issuingCountry: 'Canada',
                    expiryDate: new Date(Date.now() + (5 * 365 * 24 * 3600000))
                },
                {
                    bookingId: 2,
                    bookedSeatId: null,
                    label: 'P1',
                    ageGroup: 'Adult',
                    title: 'Mrs.',
                    fullName: 'Jane',
                    familyName: 'Foster',
                    birthDate: new Date(Date.now() - (30 * 365 * 24 * 3600000)),
                    nationality: 'Norwegia',
                    identityNumber: '617179189321',
                    issuingCountry: 'Norwegia',
                    expiryDate: new Date(Date.now() + (1 * 365 * 24 * 3600000))
                },
                {
                    bookingId: 3,
                    bookedSeatId: 2,
                    label: 'P1',
                    ageGroup: 'Adult',
                    title: 'Mr.',
                    fullName: 'Joko',
                    familyName: null,
                    birthDate: new Date(Date.now() - (25 * 365 * 24 * 3600000)),
                    nationality: 'Indonesia',
                    identityNumber: '617173217123',
                    issuingCountry: 'Indonesia',
                    expiryDate: new Date(Date.now() + (10 * 365 * 24 * 3600000))
                },
                {
                    bookingId: 3,
                    bookedSeatId: 3,
                    label: 'P2',
                    ageGroup: 'Child',
                    title: 'Master',
                    fullName: 'Wawa',
                    familyName: 'Wiwi',
                    birthDate: new Date(Date.now() - (5 * 365 * 24 * 3600000)),
                    nationality: 'Indonesia',
                    identityNumber: '61717321213312',
                    issuingCountry: 'Indonesia',
                    expiryDate: new Date(Date.now() + (10 * 365 * 24 * 3600000))
                }
            ]
        });

        await prisma.invoice.createMany({
            data: [
                {
                    bookingId: 1,
                    subtotal: schedules[0].ticketPrice,
                    taxAmount: schedules[0].ticketPrice * 0.1,
                    totalAmount: schedules[0].ticketPrice * 1.1,
                    paymentDueDateTime: new Date(Date.now() + (24 * 3600000)),
                },
                {
                    bookingId: 2,
                    subtotal: schedules[1].ticketPrice,
                    taxAmount: schedules[1].ticketPrice * 0.1,
                    totalAmount: schedules[1].ticketPrice * 1.1,
                    paymentDueDateTime: new Date(Date.now() - 3 * 3600000),
                },
                {
                    bookingId: 3,
                    subtotal: schedules[2].ticketPrice * 2,
                    taxAmount: schedules[2].ticketPrice * 2 * 0.1,
                    totalAmount: schedules[2].ticketPrice * 2 * 1.1,
                    paymentDueDateTime: new Date(Date.now()),
                }
            ]
        });

        await prisma.payment.createMany({
            data: [
                {
                    invoiceId: 3,
                    date: new Date(Date.now() - 3600000),
                    method: 'Credit Card',
                    accountNumber: '37216312861333',
                    holderName: 'Joko',
                    CVV: '117',
                    expiryDate: '05/27'
                }
            ]
        });

        const bookings = await prisma.booking.findMany({
            where: {
                id: {
                    in: [1, 2, 3]
                }
            },
            include: {
                Invoice: true
            },
            orderBy: {
                id: 'asc'
            }
        });

        await prisma.notification.createMany({
            data: [
                {
                    userId: 6,
                    bookingId: 1,
                    scheduleId: null,
                    paymentId: null,
                    title: 'Status Pembayaran (Unpaid)',
                    message: `Pemesanan dengan kode booking ${bookings[0].bookingCode} telah berhasil dibuat. Selesaikan pembayaran Anda sebelum tanggal ${new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).format(bookings[0].Invoice.paymentDueDateTime)}`,
                    createdAt: new Date(Date.now()),
                    readStatus: false
                },
                {
                    userId: 6,
                    bookingId: 3,
                    scheduleId: null,
                    paymentId: 1,
                    title: 'Pembayaran Berhasil',
                    message: `Selamat! Transaksi pembayaran tiket sukses! Penerbangan Anda dengan kode booking ${bookings[2].bookingCode} telah berhasil diisukan. Terima kasih telah menggunakan layanan kami.`,
                    createdAt: new Date(Date.now() - 3600000),
                    readStatus: false
                }
            ]
        });
    } catch (err) {
        console.error(err);
    }
}

seedDatabase()
    .then(() => console.log(`Successfully seeding Booking`))
    .catch((err) => console.log(`Failed seeding Booking\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });