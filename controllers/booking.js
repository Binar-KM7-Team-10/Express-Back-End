const Booking = require('../models/booking');
const BookingValidation = require('../validations/booking');
const { getAll } = require('./schedule');

module.exports = {
    getAll: async (req, res, next) => {
        try {
            await BookingValidation.parseBookingFilters(req.body);
            const bookings = await Booking.getMany(req.body);
            return res.status(200).json({
                status: 'Success',
                statusCode: 200,
                message: 'Berhasil mendapatkan data booking.',
                data
            });
        } catch (error) {
            next(error);
        }
    },
    getDTO: async (req, res, next) => {
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
        } catch (error) {
            next(error);
        }
    }
};