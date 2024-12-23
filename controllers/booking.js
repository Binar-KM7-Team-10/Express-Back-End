const Booking = require('../models/booking');
const BookingValidation = require('../validations/booking');
const Notification = require('../models/notification');

module.exports = {
    getAll: async (req, res, next) => {
        try {
            BookingValidation.validateQueryParams(req.query);
            const bookings = await Booking.getManyDTO(req.query);

            return res.status(200).json({
                status: 'Success',
                statusCode: 200,
                message: bookings.length > 0 ? 'Data riwayat pemesanan berhasil diambil.' : 'Data riwayat pemesanan tidak tersedia.',
                pagination: {
                    total: bookings.length
                },
                data: {
                    bookings
                }
            });
        } catch (err) {
            next(err);
        }
    },
    getById: async (req, res, next) => {
        try {
            const data = await Booking.getDTO(req.params.id);

            return res.status(200).json({
                status: 'Success',
                statusCode: 200,
                message: 'Data riwayat pemesanan berhasil diambil.',
                data
            });
        } catch (err) {
            next(err);
        }
    },
    create: async (req, res, next) => {
        try {
            await BookingValidation.validatePostData(req.body);
            const data = await Booking.create(req.body, req.user.id);
            const formattedDate = new Intl.DateTimeFormat('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Jakarta',
            }).format(data.paymentDueDateTime);

            await Notification.create(
                req.user.id,
                `Status Pembayaran (Unpaid)`,
                `Pemesanan dengan kode booking ${data.bookingCode} telah berhasil dibuat. Selesaikan pembayaran Anda sebelum tanggal ${formattedDate}.`,
                { bookingId: data.bookingId }
            );

            return res.status(201).json({
                status: 'Success',
                statusCode: 201,
                message: 'Berhasil membuat pesanan tiket penerbangan. Silahkan selesaikan pembayaran Anda.',
                data
            });
        } catch (err) {
            next(err);
        }
    },
    createPayment: async (req, res, next) => {
        try {
            await BookingValidation.validateBookingId(req.params);
            await BookingValidation.validatePaymentData(req.body);
            const data = await Booking.payment(req.body, req.params.id);
            await Notification.create(
                req.user.id,
                `Pembayaran Berhasil`,
                `Selamat! Transaksi pembayaran tiket sukses! Penerbangan Anda dengan kode booking ${data.bookingCode} telah berhasil diisukan. Terima kasih telah menggunakan layanan kami.`,
                { bookingId: data.bookingId, paymentId: data.paymentId }
            );

            return res.status(201).json({
                status: 'Success',
                statusCode: 201,
                message: 'Berhasil melakukan pembayaran tiket penerbangan.'
            });
        } catch (err) {
            next(err);
        }
    }
};