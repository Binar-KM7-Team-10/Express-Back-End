const Booking = require('../models/booking');
const BookingValidation = require('../validations/booking');

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
            await BookingValidation.validataPathParams(req.params);
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
    createPayment: async (req, res, async) => {
        try {

        } catch (err) {
            next(err);
        }
    }
};