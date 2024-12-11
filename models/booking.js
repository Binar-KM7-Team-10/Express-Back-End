const { PrismaClient } = require('@prisma/client');
const QueryParser = require('../utils/queryParser');
const Schedule = require('./schedule');
const Passenger = require('./passenger');
const Payment = require('./payment');
const Invoice = require('./invoice');
const prisma = new PrismaClient();

class Booking {
    static async getDTO(id){
        const booking = await prisma.booking.findUnique({
            where: {
                id: parseInt(id),
            },
            select: {
                id : true,
                userId: true,
                bookingCode: true,
                date: true,
                status: true,
                journeyType: true,  
            },
        });

        const itinerary = await prisma.itinerary.findMany({
            where: {
                bookingId: parseInt(id),
            },
            select: {
                id: true,
                scheduleId: true,
                tripDirection: true,
            },
        });

        const schedules = await Promise.all(itinerary.map((it) => {
            const schedule = Schedule.getDTO(it.scheduleId);
            return schedule;
        }));

        const passenger = await Passenger.getDTO(booking.id);
        const invoice = await Invoice.getDTO(booking.id);
        const payment = await Payment.getDTO(invoice.invoiceId);

        return {
            bookingId : booking.id,
            bookingCode : booking.bookingCode,
            date : booking.date,
            status : booking.status,
            journeyType : booking.journeyType,
            itinerary :{
                outbound : schedules[0],
                inbound : null
            }, 
            passenger : passenger,
            invoice : invoice,
            payment : payment,
        };
    }

    static async getManyDTO(query) {
        const where = QueryParser.parseBookingFilters(query);
        const bookings = await prisma.booking.findMany({
            orderBy: {
                date: 'desc'
            },
            where
        });
    
        // Untuk setiap booking, ambil detailnya menggunakan getDTO
        const results = await Promise.all(
            bookings.map(async (booking) => {
                // Ambil itinerary
                const itinerary = await prisma.itinerary.findMany({
                    where: {
                        bookingId: booking.id
                    }
                });
    
                // Ambil schedules menggunakan itinerary
                const schedules = await Promise.all(itinerary.map((it) => Schedule.getDTO(it.scheduleId)));
    
                // Ambil data lain yang diperlukan
                const passenger = await Passenger.getDTO(booking.id);
                const invoice = await Invoice.getDTO(booking.id);
                const payment = await Payment.getDTO(invoice.invoiceId);
    
                // Strukturkan data DTO untuk setiap booking
                return {
                    bookingId: booking.id,
                    bookingCode: booking.bookingCode,
                    date: booking.date,
                    status: booking.status,
                    journeyType: booking.journeyType,
                    itinerary: {
                        outbound: schedules[0], // Asumsi outbound adalah index pertama
                        inbound: schedules.length === 2 ? schedules[1] : null, // Asumsi inbound adalah index kedua, jika ada
                    },
                    passenger,
                    invoice,
                    payment,
                };
            })
        );
    
        return results;
    }
}

module.exports = Booking;