const { PrismaClient } = require('@prisma/client');
const QueryParser = require('../utils/queryParser');
const Schedule = require('./schedule');
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

        // const schedules = await prisma.schedule.findMany({
        //     where: {
        //         id: {
        //             in: itinerary.map((i) => i.scheduleId),
        //         },
        //     },
        //     select: {
        //         id: true,
        //         departureDateTime: true,
        //         arrivalDateTime: true,
        //         duration: true,
        //         ticketPrice: true,
        //         seatClass: true,
        //             flight: {
        //                 include: {
        //                     departureAirport: true,
        //                     arrivalAirport: true,
        //                     airline: true,
        //                     Baggage: true,
        //                     FlightService: {
        //                         include: { service: true },
        //                     },
        //                 },
        //         }
        //     },
        // });

        const schedules = Promise.all( itinerary.map((it) => {
            const schedule =  Schedule.getDTO(it.scheduleId);
            return schedule;
        }));


        const data =  {
            bookingId : booking.id,
            bookingCode : booking.bookingCode,
            date : booking.date,
            status : booking.status,
            journeyType : booking.journeyType,
            itinerary :{
                outbound : schedules[0],
                inbound : null 
            }
                
            }


        // 
        console.log(schedules);


    }

    static async getMany(query){
        const parsedQuery = QueryParser.parseBooking(query);
        const bookings = await prisma.booking.findMany({
            where ,
            select: {
                id: true,
                userId: true,
                bookingCode: true,
                date: true,
                status: true,
                journeyType: true,
            },
        });

        return bookings;
    }
}

(async () => {
    const bookingData = await Booking.getDTO(1); // Ubah `1` ke ID yang valid
    // console.log('Booking Data:', bookingData);  // Output hasilnya di konsol
})();