const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const notification = [
    {
        "userId": 5,
        "bookingId": 5,
        "scheduleId": null,
        "paymentId": null,
        "title": "Notifikasi",
        "message": "Pesanan tiket penerbangan dengan kode booking aWY61FAy1 berhasil dibuat. Selesaikan pembayaran Anda sebelum tanggal 31 Desember 2024 pada jam 23:59.",
        "createdAt": "2024-12-31T18:00:00.000Z",
        "readStatus": false
    },
    {
        "userId": 22,
        "bookingId": null,
        "scheduleId": 2,
        "paymentId": null,
        "title": "Jadwal Diperbarui",
        "message": "Jadwal penerbangan Anda dengan kode penerbangan ABC123 telah diperbarui ke tanggal 1 Januari 2025 pada pukul 10:00.",
        "createdAt": "2024-12-30T12:00:00.000Z",
        "readStatus": false
    },
    {
        "userId": 22,
        "bookingId": 5,
        "scheduleId": 2,
        "paymentId": 5,
        "title": "Pembayaran Berhasil",
        "message": "Pembayaran untuk tiket penerbangan Anda dengan kode booking bXZ72DFm telah berhasil. Terima kasih telah menggunakan layanan kami.",
        "createdAt": "2024-12-29T08:00:00.000Z",
        "readStatus": true
    },
    {
        "userId": 4,
        "bookingId": 5,
        "scheduleId": null,
        "paymentId": null,
        "title": "Pengingat Pembayaran",
        "message": "Jangan lupa untuk menyelesaikan pembayaran tiket Anda dengan kode booking cKY83GJq sebelum 1 Januari 2025 pukul 23:59.",
        "createdAt": "2024-12-28T15:00:00.000Z",
        "readStatus": false
    },
    {
        "userId": 1,
        "bookingId": null,
        "scheduleId": 2,
        "paymentId": 5,
        "title": "Promo Khusus!",
        "message": "Dapatkan diskon hingga 20% untuk penerbangan berikutnya. Promo berlaku hingga 5 Januari 2025.",
        "createdAt": "2024-12-27T09:00:00.000Z",
        "readStatus": true
    }
]

const seedDatabase = async () => {
    for (const data of notification) {
        try {
            await prisma.notification.create({ data });
        } catch (err) {
            console.error(err);
        }
    }
}

seedDatabase()
    .then(() => console.log('Successfully seeding notification'))
    .catch((err) => console.log(`Failed seeding notification\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });