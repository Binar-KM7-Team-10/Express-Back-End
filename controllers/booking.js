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
    create: async (req, res, async) => {
        try {
            await BookingValidation.validatePostData(req.body);
        } catch (err) {
            next(err);
        }
    }
};