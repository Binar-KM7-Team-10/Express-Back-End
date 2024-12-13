const { PrismaClient } = require('@prisma/client');
const QueryParser = require('../utils/queryParser');
const Schedule = require('./schedule');
const Passenger = require('./passenger');
const Payment = require('./payment');
const Invoice = require('./invoice');
const { customAlphabet } = require('nanoid');
const prisma = new PrismaClient();

class Booking {
    static async getDTO(id){
        const booking = await prisma.booking.findUnique({
            where: {
                id: parseInt(id),
            }
        });

        const itinerary = await prisma.itinerary.findMany({
            where: {
                bookingId: parseInt(id),
            }
        });

        const schedules = await Promise.all(itinerary.map((it) => Schedule.getDTO(it.scheduleId)));
        const passenger = await Passenger.getDTO(booking.id);
        const invoice = await Invoice.getDTO(booking.id);
        const payment = await Payment.getDTO(invoice.invoiceId);

        return {
            bookingId: booking.id,
            bookingCode: booking.bookingCode,
            date: booking.date,
            status: booking.status,
            journeyType: booking.journeyType,
            itinerary: {
                outbound: schedules[0],
                inbound: schedules.length === 2 ? schedules[1] : null
            },
            passenger,
            invoice,
            payment
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

    static async create(data, userId) {
        const {
            itinerary,
            passenger,
            seat
        } = data;

        const bookingCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 10)();
        const date = new Date(Date.now());
        const journeyType = itinerary.journeyType;
        const status = 'Unpaid';

        // Booking <- User
        const bookingData = await prisma.booking.create({
            data: {
                userId,
                bookingCode,
                date,
                status,
                journeyType
            }
        });

        // Itinerary -> Schedule
        await prisma.itinerary.create({
            data: {
                bookingId: bookingData.id,
                scheduleId: parseInt(itinerary.outbound),
                tripDirection: 'Outbound'
            }
        });

        if (journeyType === 'Round-trip') {
            await prisma.itinerary.create({
                data: {
                    bookingId: bookingData.id,
                    scheduleId: parseInt(itinerary.inbound),
                    tripDirection: 'Inbound'
                }
            });
        }

        const outboundSchedule = await prisma.schedule.findUnique({
            where: {
                id: parseInt(itinerary.outbound)
            }
        });

        const inboundSchedule = journeyType === 'Round-trip' ? await prisma.schedule.findUnique({
            where: {
                id: parseInt(itinerary.inbound)
            }
        }) : null;

        const subtotal = journeyType === 'Round-trip' ?
            (parseInt(passenger.total) * (outboundSchedule.ticketPrice + inboundSchedule.ticketPrice)) :
            (parseInt(passenger.total) * outboundSchedule.ticketPrice);
        const taxAmount = Math.round(subtotal * 0.1);
        const totalAmount = subtotal + taxAmount;
        const paymentDueDateTime = new Date(Date.now() + 15 * 60 * 1000);

        // Invoice
        await prisma.invoice.create({
            data: {
                bookingId: bookingData.id,
                subtotal,
                taxAmount,
                totalAmount,
                paymentDueDateTime
            }
        });
        
        const outboundSeatData = await Promise.all(seat.outbound.map(async (s) => {
            const seat = await prisma.seat.findUnique({
                where: {
                    scheduleId: parseInt(itinerary.outbound),
                    seatNumber: s.seatNumber
                }
            });

            const bookedSeat = await prisma.bookedSeat.create({
                data: {
                    seatId: seat.id,
                    bookingId: bookingData.id
                }
            });

            return {
                label: s.label,
                seatId: seat.id,
                bookedSeatId: bookedSeat.id
            }
        }));

        // Passnger -> BookedSeat -> Seat -> Schedule
        passenger.data.map(async (p) => {
            await prisma.passenger.create({
                data: {
                    bookingId: bookingData.id,
                    bookedSeatId: outboundSeatData.find((s) => s.label === p.label).bookedSeatId || null,
                    label: p.label || null,
                    ageGroup: p.ageGroup,
                    title: p.title || null,
                    fullName: p.fullName || null,
                    familyName: p.familyName || null,
                    birthDate: new Date(p.birthDate) || null,
                    nationality: p.nationality || null,
                    identityNumber: p.identityNumber || null,
                    issuingCountry: p.issuingCountry || null,
                    expiryDate: new Date(p.expiryDate) || null
                }
            });
        });

        const inboundSeatData = journeyType === 'Round-trip' ? await Promise.all(seat.inbound.map(async (s) => {
            const seat = await prisma.seat.findUnique({
                where: {
                    scheduleId: parseInt(itinerary.inbound),
                    seatNumber: s.seatNumber
                }
            });

            const bookedSeat = await prisma.bookedSeat.create({
                data: {
                    seatId: seat.id,
                    bookingId: bookingData.id
                }
            });

            return {
                label: s.label,
                seatId: seat.id,
                bookedSeatId: bookedSeat.id
            }
        })) : null;

        if (journeyType === 'Round-trip') {
            passenger.data.map(async (p) => {
                await prisma.passenger.create({
                    data: {
                        bookingId: bookingData.id,
                        bookedSeatId: inboundSeatData.find((s) => s.label === p.label).bookedSeatId,
                        label: p.label,
                        ageGroup: p.ageGroup,
                        title: p.title,
                        fullName: p.fullName,
                        familyName: p.familyName,
                        birthDate: new Date(p.birthDate),
                        nationality: p.nationality,
                        identityNumber: p.identityNumber,
                        issuingCountry: p.issuingCountry,
                        expiryDate: new Date(p.expiryDate),
                    }
                });
            });
        }

        return {
            bookingId: bookingData.id,
            bookingCode
        };
    }
}

module.exports = Booking;