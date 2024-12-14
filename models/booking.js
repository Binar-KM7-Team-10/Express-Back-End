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

        let paymentDueDateTime;
        const dayDiff = Math.floor((new Date(outboundSchedule.departureDateTime.toISOString().split('T')[0]) - new Date(bookingData.date.toISOString().split('T')[0])) / (24 * 60 * 60 * 1000));
        const isBeforeOneAM = outboundSchedule.departureDateTime.getHours() < 1 || (outboundSchedule.departureDateTime.getHours() === 1 && outboundSchedule.departureDateTime.getMinutes() === 0 && outboundSchedule.departureDateTime.getSeconds() === 0);

        if (dayDiff === 0) {
            // If user books flight the same date as the departure date, then payment due time is 1 hour before the departure time
            paymentDueDateTime = new Date(new Date(outboundSchedule.departureDateTime) - 60 * 60 * 1000);
        } else if (dayDiff === 1 && isBeforeOneAM) {
            // If user books flight the day before as the departure date and the departure time is 1 am or earlier, then payment due time is 1 hour before the departure time
            paymentDueDateTime = new Date(new Date(outboundSchedule.departureDateTime) - 60 * 60 * 1000);
        } else {
            // If user books flight the day before as the departure date and the departure time is later than 1 am, then payment due time is at 23:59:59 on the booking date. The same would applies when user books days earlier than the day before.
            const bookingDateCopy = new Date(bookingData.date);
            bookingDateCopy.setUTCHours(23, 59, 59, 999);
            paymentDueDateTime = bookingDateCopy;
        }

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

        await prisma.schedule.update({
            where: {
                id: parseInt(itinerary.outbound)
            },
            data: {
                seatAvailability: {
                    decrement: outboundSeatData.length
                }
            }
        });

        // Passenger -> BookedSeat -> Seat -> Schedule
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

            await prisma.schedule.update({
                where: {
                    id: parseInt(itinerary.inbound)
                },
                data: {
                    seatAvailability: {
                        decrement: inboundSeatData.length
                    }
                }
            });
        }

        return {
            bookingId: bookingData.id,
            bookingCode,
            paymentDueDateTime
        };
    }

    static async payment(data, bookingId) {
        const { 
            method,
            accountNumber,
            holderName,
            CVV,
            expiryDate
        } = data;

        const invoice = await prisma.invoice.findUnique({
            where: {
                bookingId: parseInt(bookingId)
            }
        });

        const payment = await prisma.payment.create({
            data: {
                invoiceId: invoice.id,
                date: new Date(Date.now()),
                method,
                accountNumber,
                holderName: holderName || null,
                CVV: CVV || null,
                expiryDate: expiryDate || null
            }
        });

        if (payment) {
            await prisma.booking.update({
                where: {
                    id: parseInt(bookingId)
                },
                data: {
                    status: 'Issued'
                }
            });
        }
    }
}

module.exports = Booking;