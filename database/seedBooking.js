const bookings = require('./seeds/booking.json'); // Pastikan ini merujuk ke file JSON yang benar
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function insertBookings() {
    for (const booking of bookings) {
        await prisma.booking.create({
        data: {
            userId: booking.userId,
            bookingCode: booking.bookingCode,
            date: new Date(booking.date), // Pastikan format date valid
            status: booking.status,
            journeyType: booking.journeyType,
        },
        });
    }
    console.log('Semua data berhasil disimpan.');
}

insertBookings()
    .then(() => prisma.$disconnect())
    .catch((error) => {
        console.error('Terjadi kesalahan:', error);
        prisma.$disconnect();
});
