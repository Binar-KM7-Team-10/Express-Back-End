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
            await BookingValidation.parseBookingFilters(req.body);
            const bookings = await Booking.getMany(req.body);
            const bookingDTOs = bookings.map(booking => ({
                id: booking.id,
                user: booking.user,
                schedule: booking.schedule,
                status: booking.status
            }));

            return res.status(200).json({
                status: 'Success',
                statusCode: 200,
                message: 'Berhasil mendapatkan data booking DTO.',
                data: bookingDTOs
            });
        } catch (err) {
            next(err);
        }
    }
};