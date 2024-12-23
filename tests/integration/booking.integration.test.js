const request = require('supertest');
const { server, job } = require('../../app');
const { generateToken } = require('../../utils/jwtHelper');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDatabase() {
    await prisma.notification.deleteMany();
    await prisma.passenger.deleteMany();
    await prisma.bookedSeat.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.seat.deleteMany();
    await prisma.itinerary.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.baggage.deleteMany();
    await prisma.flightService.deleteMany();
    await prisma.flight.deleteMany();
    await prisma.airport.deleteMany();
    await prisma.city.deleteMany();
    await prisma.airline.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany();

    const tables = ['City', 'Airport', 'Airline', 'Flight', 'Baggage', 'Service', 'FlightService', 'Schedule', 'Seat', 'Itinerary', 'Seat', 'BookedSeat', 'User', 'Booking', 'Invoice', 'Payment', 'Passenger', 'Notification'];

    await Promise.all(tables.map(async (table) => await prisma.$queryRawUnsafe(`ALTER SEQUENCE \"${table}_id_seq\" RESTART WITH 1;`)));
}

async function seedDatabase() {
    await prisma.user.createMany({
        data: [
            {
                id: 1,
                fullName: 'Buyer 1',
                email: 'buyer@tiketgo.com',
                phoneNumber: '6280000000000',
                role: 'Buyer',
                isVerified: true
            },
            {
                id: 2,
                fullName: 'Admin 1',
                email: 'admin@tiketgo.com',
                phoneNumber: '6280000000001',
                role: 'Admin',
                isVerified: true
            }
        ]
    });

    await prisma.city.createMany({
        data: [
            {
                id: 1,
                name: 'Jakarta',
                code: 'JKT',
                country: 'Indonesia',
                continent: 'Asia'
            },
            {
                id: 2,
                name: 'Berlin',
                code: 'BER',
                country: 'Germany',
                continent: 'Europe'
            }
        ]
    });

    await prisma.airport.createMany({
        data: [
            {
                id: 1,
                cityId: 1,
                name: 'Soekarno-Hatta International Airport',
                iataCode: 'CGK'
            },
            {
                id: 2,
                cityId: 2,
                name: 'Berlin Bradenburg Airport',
                iataCode: 'BER'
            }
        ]
    });

    const airline = await prisma.airline.create({
        data: {
            id: 1,
            name: 'Garuda',
            country: 'Indonesia',
            iataCode: 'GA',
        }
    });

    const service = await prisma.service.create({
        data: {
            id: 1,
            title: 'WiFi'
        }
    });
    
    const flight = await prisma.flight.create({
        data: {
            id: 1,
            departureAirportId: 1,
            arrivalAirportId: 2,
            airlineId: airline.id,
            flightNumber: 'GA000',
            flightType: 'International'
        }
    });

    await prisma.baggage.create({
        data: {
            id: 1,
            flightId: flight.id,
            maxBaggageWeight: 30,
            maxCabinBaggageWeight: 7
        }
    });

    await prisma.flightService.create({
        data: {
            id: 1,
            flightId: flight.id,
            serviceId: service.id
        }
    });
    
    const tomorrow = new Date(Date.now());
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setUTCHours(0, 30, 0, 0);

    await prisma.schedule.createMany({
        data: [
            {
                flightId: 1,
                departureDateTime: new Date(Date.now() + (3 * 24 * 3600000)),
                arrivalDateTime: new Date(Date.now() + (3 * 24 * 3600000) + (2 * 3600000)),
                duration: 60,
                ticketPrice: 5650000,
                seatAvailability: 72,
                seatClass: 'Premium Economy',
                terminalGate: '3A'
            },
            {
                flightId: 1,
                departureDateTime: new Date(Date.now()),
                arrivalDateTime: new Date(Date.now() + 3600000),
                duration: 60,
                ticketPrice: 4500000,
                seatAvailability: 64,
                seatClass: 'Economy',
                terminalGate: '1A'
            },
            {
                flightId: 1,
                departureDateTime: new Date(Date.now() + (3 * 3600000)),
                arrivalDateTime: new Date(Date.now() + (4 * 3600000)),
                duration: 60,
                ticketPrice: 4500000,
                seatAvailability: 5,
                seatClass: 'Economy',
                terminalGate: '1A'
            },
            {
                flightId: 1,
                departureDateTime: new Date(tomorrow + 1800000),
                arrivalDateTime: new Date(tomorrow + 3600000),
                duration: 30,
                ticketPrice: 4500000,
                seatAvailability: 5,
                seatClass: 'Business',
                terminalGate: '2A'
            },
        ]
    });

    const schedule = await prisma.schedule.findUnique({ where: { id: 1 }});

    const nextChar = (c) => String.fromCharCode(c.charCodeAt(0) + 1);

    let col = 'A';
    let row = 1;
    for (let j = 1; j <= 72; j++) {
        if (j % 12 === 1 && j != 1) {
            col = nextChar(col);
            row = 1;
        }

        const seatNumber = col + row;
        row++;

        await prisma.seat.createMany({
            data: [
                {
                    scheduleId: 1,
                    seatNumber
                },
                {
                    scheduleId: 2,
                    seatNumber
                },
                {
                    scheduleId: 3,
                    seatNumber
                },
                {
                    scheduleId: 4,
                    seatNumber
                },
            ]
        });
    }

    await prisma.booking.createMany({
        data: [
            {
                userId: 1,
                bookingCode: 'BOOKING001',
                date: new Date(Date.now()),
                status: 'Unpaid',
                journeyType: 'One-way'
            },
            {
                userId: 1,
                bookingCode: 'BOOKING002',
                date: new Date(Date.now() - (24 * 3600000)),
                status: 'Cancelled',
                journeyType: 'One-way'
            },
            {
                userId: 1,
                bookingCode: 'BOOKING003',
                date: new Date(Date.now() - (2 * 3600000)),
                status: 'Issued',
                journeyType: 'One-way'
            },
            {
                userId: 2,
                bookingCode: 'BOOKING004',
                date: new Date(Date.now() - (2 * 3600000)),
                status: 'Issued',
                journeyType: 'One-way'
            },
            {
                userId: 1,
                bookingCode: 'BOOKING005',
                date: new Date(Date.now() - (2 * 3600000)),
                status: 'Unpaid',
                journeyType: 'One-way'
            },
        ]
    });

    await prisma.itinerary.createMany({
        data: [
            {
                bookingId: 1,
                scheduleId: 1,
                tripDirection: 'Outbound'
            },
            {
                bookingId: 2,
                scheduleId: 1,
                tripDirection: 'Outbound'
            },
            {
                bookingId: 3,
                scheduleId: 1,
                tripDirection: 'Outbound'
            },
            {
                bookingId: 4,
                scheduleId: 1,
                tripDirection: 'Outbound'
            },
            {
                bookingId: 5,
                scheduleId: 2,
                tripDirection: 'Outbound'
            },
        ]
    });
    
    await prisma.invoice.createMany({
        data: [
            {
                bookingId: 1,
                subtotal: schedule.ticketPrice,
                taxAmount: schedule.ticketPrice * 0.1,
                totalAmount: schedule.ticketPrice * 1.1,
                paymentDueDateTime: new Date(Date.now() + (24 * 3600000)).toISOString()
            },
            {
                bookingId: 2,
                subtotal: schedule.ticketPrice,
                taxAmount: schedule.ticketPrice * 0.1,
                totalAmount: schedule.ticketPrice * 1.1,
                paymentDueDateTime: new Date(Date.now()).toISOString()
            },
            {
                bookingId: 3,
                subtotal: schedule.ticketPrice,
                taxAmount: schedule.ticketPrice * 0.1,
                totalAmount: schedule.ticketPrice * 1.1,
                paymentDueDateTime: new Date(Date.now() + (24 * 3600000)).toISOString()
            },
            {
                bookingId: 4,
                subtotal: schedule.ticketPrice,
                taxAmount: schedule.ticketPrice * 0.1,
                totalAmount: schedule.ticketPrice * 1.1,
                paymentDueDateTime: new Date(Date.now() + (24 * 3600000)).toISOString()
            },
            {
                bookingId: 5,
                subtotal: schedule.ticketPrice,
                taxAmount: schedule.ticketPrice * 0.1,
                totalAmount: schedule.ticketPrice * 1.1,
                paymentDueDateTime: new Date(Date.now() - (3600000)).toISOString()
            },
        ]
    })

    await prisma.bookedSeat.createMany({
        data: [
            {
                seatId: 1,
                bookingId: 1
            },
            {
                seatId: 3,
                bookingId: 3
            },
            {
                seatId: 4,
                bookingId: 4
            },
            {
                seatId: 5,
                bookingId: 5
            }
        ]
    });

    await prisma.payment.createMany({
        data: [
            {
                invoiceId: 3,
                date: new Date(Date.now() - 3600000),
                method: 'Credit Card',
                accountNumber: '31276813219312',
                holderName: 'John Doe',
                CVV: '225',
                expiryDate: '09/25'
            },
            {
                invoiceId: 4,
                date: new Date(Date.now() - 3600000),
                method: 'Gopay',
                accountNumber: '08231873218931'
            },
        ]
    });

    await prisma.passenger.createMany({
        data: [
            {
                bookingId: 1,
                bookedSeatId: 1,
                label: 'P1',
                ageGroup: 'Adult',
                title: 'Mr.',
                fullName: 'John Doe',
                familyName: null,
                birthDate: '1995-05-20T00:00:00.000Z',
                nationality: 'Indonesia',
                identityNumber: '61712381263831',
                issuingCountry: 'Indonesia',
                expiryDate: '2029-01-01T00:00:00.000Z'
            },
            {
                bookingId: 2,
                bookedSeatId: null,
                label: 'P1',
                ageGroup: 'Adult',
                title: 'Mrs.',
                fullName: 'Jane',
                familyName: 'Dore',
                birthDate: '1995-05-20T00:00:00.000Z',
                nationality: 'Malaysia',
                identityNumber: '617122817321',
                issuingCountry: 'Vietnam',
                expiryDate: '2031-01-01T00:00:00.000Z'
            },
            {
                bookingId: 3,
                bookedSeatId: 2,
                label: 'P1',
                ageGroup: 'Child',
                title: 'Master',
                fullName: 'Joko',
                familyName: null,
                birthDate: '2019-01-01T00:00:00.000Z',
                nationality: 'Malaysia',
                identityNumber: '61712213321',
                issuingCountry: 'India',
                expiryDate: '2035-01-01T00:00:00.000Z'
            },
            {
                bookingId: 4,
                bookedSeatId: 3,
                label: 'P1',
                ageGroup: 'Adult',
                title: 'Miss',
                fullName: 'Mas',
                familyName: 'Mos',
                birthDate: '2000-01-01T00:00:00.000Z',
                nationality: 'Thailand',
                identityNumber: '6171221231321',
                issuingCountry: 'Papua New Guinea',
                expiryDate: '2030-01-01T00:00:00.000Z'
            },
            {
                bookingId: 4,
                ageGroup: 'Baby'
            },
            {
                bookingId: 4,
                bookedSeatId: 4,
                label: 'P1',
                ageGroup: 'Adult',
                title: 'Miss',
                fullName: 'Mas',
                familyName: 'Mos',
                birthDate: '2000-01-01T00:00:00.000Z',
                nationality: 'Thailand',
                identityNumber: '6171221231321',
                issuingCountry: 'Papua New Guinea',
                expiryDate: '2030-01-01T00:00:00.000Z'
            },
        ]
    });

    await prisma.notification.createMany({
        data: [
            {
                userId: 1,
                bookingId: 1,
                scheduleId: null,
                paymentId: null,
                title: 'Status Pembayaran (Unpaid)',
                message: 'Pemesanan dengan kode booking BOOKING1 telah berhasil dibuat. Selesaikan pembayaran Anda sebelum tanggal DD Month YYYY.',
                createdAt: new Date(Date.now()),
                readStatus: false
            },
            {
                userId: 1,
                bookingId: 2,
                scheduleId: null,
                paymentId: null,
                title: 'Status Pembayaran (Unpaid)',
                message: 'Pemesanan dengan kode booking BOOKING2 telah berhasil dibuat. Selesaikan pembayaran Anda sebelum tanggal DD Month YYYY.',
                createdAt: new Date(Date.now() - (24 * 3600000)),
                readStatus: true
            },
            {
                userId: 1,
                bookingId: 3,
                scheduleId: null,
                paymentId: null,
                title: 'Status Pembayaran (Unpaid)',
                message: 'Pemesanan dengan kode booking BOOKING3 telah berhasil dibuat. Selesaikan pembayaran Anda sebelum tanggal DD Month YYYY.',
                createdAt: new Date(Date.now() - (2 * 3600000)),
                readStatus: false
            },
            {
                userId: 1,
                bookingId: 3,
                scheduleId: null,
                paymentId: 1,
                title: 'Pembayaran Berhasil',
                message: 'Selamat! Transaksi pembayaran tiket sukses! Penerbangan Anda dengan kode booking BOOKING3 telah berhasil diisukan. Terima kasih telah menggunakan layanan kami.',
                createdAt: new Date(Date.now() - 3600000),
                readStatus: false
            },
            {
                userId: 2,
                bookingId: 4,
                scheduleId: null,
                paymentId: 2,
                title: 'Pembayaran Berhasil',
                message: 'Selamat! Transaksi pembayaran tiket sukses! Penerbangan Anda dengan kode booking BOOKING004 telah berhasil diisukan. Terima kasih telah menggunakan layanan kami.',
                createdAt: new Date(Date.now() - 3600000),
                readStatus: false
            },
        ]
    });
}

describe('GET /bookings', () => {
    let buyerAccessToken, adminAccessToken;

    beforeAll(() => {
        buyerAccessToken = generateToken({
            id: 1,
            fullName: 'Buyer 1',
            email: 'buyer@tiketgo.com',
            phoneNumber: '6280000000000',
            role: 'Buyer'
        });

        adminAccessToken = generateToken({
            id: 2,
            fullName: 'Admin 1',
            email: 'admin@tiketgo.com',
            phoneNumber: '6280000000001',
            role: 'Admin'
        });
    });

    afterAll(() => {
        server.close();

        if (job) {
            job.cancel();
        }
    });

    beforeEach(async () => {
        await resetDatabase();
        await seedDatabase();
    });

    afterEach(async() => await resetDatabase());

    it('should successfully retrieves all booking transactions with 200 status code', async () => {
        const response = await request(server)
            .get('/bookings')
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(200);

        expect(response.body.status).toBe('Success');
        expect(response.body.statusCode).toBe(200);
        expect(response.body.message).toBe('Data riwayat pemesanan berhasil diambil.');

        expect(response.body.pagination).toHaveProperty('total');
        expect(response.body.pagination.total).not.toBeNull();
        expect(response.body.pagination.total).toBe(response.body.data.bookings.length);

        expect(response.body.data).toHaveProperty('bookings');
        expect(Array.isArray(response.body.data.bookings)).toBe(true);

        const { bookings } = response.body.data;
        bookings.forEach((b) => {
            expect(b).toHaveProperty('bookingId');
            expect(b).toHaveProperty('bookingCode');
            expect(b).toHaveProperty('date');
            expect(b).toHaveProperty('status');
            expect(b).toHaveProperty('journeyType');
            expect(b).toHaveProperty('itinerary');
            expect(b).toHaveProperty('passenger');
            expect(b).toHaveProperty('invoice');
            expect(b).toHaveProperty('payment');

            expect(typeof b.bookingId).toBe('number');
            expect(typeof b.bookingCode).toBe('string');
            expect(typeof b.date).toBe('string');
            expect(typeof b.status).toBe('string');
            expect(typeof b.journeyType).toBe('string');

            expect(b.itinerary).toHaveProperty('outbound');
            expect(b.itinerary).toHaveProperty('inbound');
            expect(b.passenger).toHaveProperty('total');
            expect(b.passenger).toHaveProperty('adult');
            expect(b.passenger).toHaveProperty('child');
            expect(b.passenger).toHaveProperty('baby');
            expect(b.passenger).toHaveProperty('data');
            expect(b.invoice).toHaveProperty('invoiceId');
            expect(b.invoice).toHaveProperty('paymentDueDateTime');
            expect(b.invoice).toHaveProperty('subtotal');
            expect(b.invoice).toHaveProperty('taxAmount');
            expect(b.invoice).toHaveProperty('totalAmount');

            if (b.payment) {
                expect(b.payment).toHaveProperty('paymentId');
                expect(b.payment).toHaveProperty('date');
                expect(b.payment).toHaveProperty('method');
            }

            expect(b.itinerary.outbound).toHaveProperty('scheduleId');
            expect(b.itinerary.outbound).toHaveProperty('airlineName');
            expect(b.itinerary.outbound).toHaveProperty('seatClass');
            expect(b.itinerary.outbound).toHaveProperty('duration');
            expect(b.itinerary.outbound).toHaveProperty('flightNumber');
            expect(b.itinerary.outbound).toHaveProperty('availableSeat');
            expect(b.itinerary.outbound).toHaveProperty('price');
            expect(b.itinerary.outbound).toHaveProperty('departure');
            expect(b.itinerary.outbound).toHaveProperty('arrival');
            expect(b.itinerary.outbound).toHaveProperty('facilities');

            expect(b.itinerary.outbound.departure).toHaveProperty('day');
            expect(b.itinerary.outbound.departure).toHaveProperty('dateTime');
            expect(b.itinerary.outbound.departure).toHaveProperty('city');
            expect(b.itinerary.outbound.departure).toHaveProperty('cityCode');
            expect(b.itinerary.outbound.departure).toHaveProperty('airportName');
            expect(b.itinerary.outbound.departure).toHaveProperty('terminalGate');
            expect(b.itinerary.outbound.arrival).toHaveProperty('day');
            expect(b.itinerary.outbound.arrival).toHaveProperty('dateTime');
            expect(b.itinerary.outbound.arrival).toHaveProperty('city');
            expect(b.itinerary.outbound.arrival).toHaveProperty('cityCode');
            expect(b.itinerary.outbound.arrival).toHaveProperty('airportName');
            expect(b.itinerary.outbound.facilities).toHaveProperty('baggage');
            expect(b.itinerary.outbound.facilities).toHaveProperty('cabinBaggage');
            expect(b.itinerary.outbound.facilities).toHaveProperty('entertainment');
            expect(b.itinerary.outbound.facilities).toHaveProperty('meal');
            expect(b.itinerary.outbound.facilities).toHaveProperty('wifi');

            expect(Array.isArray(b.passenger.data)).toBe(true);
            
            b.passenger.data.forEach((p) => {
                expect(p).toHaveProperty('passengerId');
                expect(p).toHaveProperty('ageGroup');

                if (p.ageGroup !== 'Baby') {
                    expect(p).toHaveProperty('label');
                    expect(p).toHaveProperty('title');
                    expect(p).toHaveProperty('fullName');
                    expect(p).toHaveProperty('familyName');
                    expect(p).toHaveProperty('seatNumber');
                }
            });
        });
    });

    it('should successfully retrieves empty booking transactions data with 200 status code', async () => {
        await resetDatabase();
        const response = await request(server)
            .get('/bookings')
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(200);

        expect(response.body.status).toBe('Success');
        expect(response.body.statusCode).toBe(200);
        expect(response.body.message).toBe('Data riwayat pemesanan tidak tersedia.');

        expect(response.body.pagination).toHaveProperty('total');
        expect(response.body.pagination.total).not.toBeNull();
        expect(response.body.pagination.total).toBe(response.body.data.bookings.length);
    });
    
    it('should successfully retrieves all booking transactions data of a user with 200 status code', async () => {
        const response = await request(server)
            .get('/bookings?userId=1')
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(200);

        expect(response.body.status).toBe('Success');
        expect(response.body.statusCode).toBe(200);
        expect(response.body.message).toBe('Data riwayat pemesanan berhasil diambil.');

        expect(response.body.pagination).toHaveProperty('total');
        expect(response.body.pagination.total).not.toBeNull();
        expect(response.body.pagination.total).toBe(response.body.data.bookings.length);

        expect(response.body.data).toHaveProperty('bookings');
        expect(Array.isArray(response.body.data.bookings)).toBe(true);

        const { bookings } = response.body.data;
        bookings.forEach((b) => {
            expect(b).toHaveProperty('bookingId');
            expect(b).toHaveProperty('bookingCode');
            expect(b).toHaveProperty('date');
            expect(b).toHaveProperty('status');
            expect(b).toHaveProperty('journeyType');
            expect(b).toHaveProperty('itinerary');
            expect(b).toHaveProperty('passenger');
            expect(b).toHaveProperty('invoice');
            expect(b).toHaveProperty('payment');

            expect(typeof b.bookingId).toBe('number');
            expect(typeof b.bookingCode).toBe('string');
            expect(typeof b.date).toBe('string');
            expect(typeof b.status).toBe('string');
            expect(typeof b.journeyType).toBe('string');

            expect(b.itinerary).toHaveProperty('outbound');
            expect(b.itinerary).toHaveProperty('inbound');
            expect(b.passenger).toHaveProperty('total');
            expect(b.passenger).toHaveProperty('adult');
            expect(b.passenger).toHaveProperty('child');
            expect(b.passenger).toHaveProperty('baby');
            expect(b.passenger).toHaveProperty('data');
            expect(b.invoice).toHaveProperty('invoiceId');
            expect(b.invoice).toHaveProperty('paymentDueDateTime');
            expect(b.invoice).toHaveProperty('subtotal');
            expect(b.invoice).toHaveProperty('taxAmount');
            expect(b.invoice).toHaveProperty('totalAmount');

            if (b.payment) {
                expect(b.payment).toHaveProperty('paymentId');
                expect(b.payment).toHaveProperty('date');
                expect(b.payment).toHaveProperty('method');
            }

            expect(b.itinerary.outbound).toHaveProperty('scheduleId');
            expect(b.itinerary.outbound).toHaveProperty('airlineName');
            expect(b.itinerary.outbound).toHaveProperty('seatClass');
            expect(b.itinerary.outbound).toHaveProperty('duration');
            expect(b.itinerary.outbound).toHaveProperty('flightNumber');
            expect(b.itinerary.outbound).toHaveProperty('availableSeat');
            expect(b.itinerary.outbound).toHaveProperty('price');
            expect(b.itinerary.outbound).toHaveProperty('departure');
            expect(b.itinerary.outbound).toHaveProperty('arrival');
            expect(b.itinerary.outbound).toHaveProperty('facilities');

            expect(b.itinerary.outbound.departure).toHaveProperty('day');
            expect(b.itinerary.outbound.departure).toHaveProperty('dateTime');
            expect(b.itinerary.outbound.departure).toHaveProperty('city');
            expect(b.itinerary.outbound.departure).toHaveProperty('cityCode');
            expect(b.itinerary.outbound.departure).toHaveProperty('airportName');
            expect(b.itinerary.outbound.departure).toHaveProperty('terminalGate');
            expect(b.itinerary.outbound.arrival).toHaveProperty('day');
            expect(b.itinerary.outbound.arrival).toHaveProperty('dateTime');
            expect(b.itinerary.outbound.arrival).toHaveProperty('city');
            expect(b.itinerary.outbound.arrival).toHaveProperty('cityCode');
            expect(b.itinerary.outbound.arrival).toHaveProperty('airportName');
            expect(b.itinerary.outbound.facilities).toHaveProperty('baggage');
            expect(b.itinerary.outbound.facilities).toHaveProperty('cabinBaggage');
            expect(b.itinerary.outbound.facilities).toHaveProperty('entertainment');
            expect(b.itinerary.outbound.facilities).toHaveProperty('meal');
            expect(b.itinerary.outbound.facilities).toHaveProperty('wifi');

            expect(Array.isArray(b.passenger.data)).toBe(true);
            
            b.passenger.data.forEach((p) => {
                expect(p).toHaveProperty('passengerId');
                expect(p).toHaveProperty('ageGroup');

                if (p.ageGroup !== 'Baby') {
                    expect(p).toHaveProperty('label');
                    expect(p).toHaveProperty('title');
                    expect(p).toHaveProperty('fullName');
                    expect(p).toHaveProperty('familyName');
                    expect(p).toHaveProperty('seatNumber');
                }
            });
        });
    });

    it('should successfully retrieves a booking transaction matching bookingCode with 200 status code', async () => {
        const response = await request(server)
            .get('/bookings?bookingCode=BOOKING001')
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(200);

        expect(response.body.status).toBe('Success');
        expect(response.body.statusCode).toBe(200);
        expect(response.body.message).toBe('Data riwayat pemesanan berhasil diambil.');

        expect(response.body.pagination).toHaveProperty('total');
        expect(response.body.pagination.total).not.toBeNull();
        expect(response.body.pagination.total).toBe(response.body.data.bookings.length);

        expect(response.body.data).toHaveProperty('bookings');
        expect(Array.isArray(response.body.data.bookings)).toBe(true);

        const { bookings } = response.body.data;
        bookings.forEach((b) => {
            expect(b).toHaveProperty('bookingId');
            expect(b).toHaveProperty('bookingCode');
            expect(b).toHaveProperty('date');
            expect(b).toHaveProperty('status');
            expect(b).toHaveProperty('journeyType');
            expect(b).toHaveProperty('itinerary');
            expect(b).toHaveProperty('passenger');
            expect(b).toHaveProperty('invoice');
            expect(b).toHaveProperty('payment');

            expect(b.bookingCode).toBe('BOOKING001');

            expect(typeof b.bookingId).toBe('number');
            expect(typeof b.bookingCode).toBe('string');
            expect(typeof b.date).toBe('string');
            expect(typeof b.status).toBe('string');
            expect(typeof b.journeyType).toBe('string');

            expect(b.itinerary).toHaveProperty('outbound');
            expect(b.itinerary).toHaveProperty('inbound');
            expect(b.passenger).toHaveProperty('total');
            expect(b.passenger).toHaveProperty('adult');
            expect(b.passenger).toHaveProperty('child');
            expect(b.passenger).toHaveProperty('baby');
            expect(b.passenger).toHaveProperty('data');
            expect(b.invoice).toHaveProperty('invoiceId');
            expect(b.invoice).toHaveProperty('paymentDueDateTime');
            expect(b.invoice).toHaveProperty('subtotal');
            expect(b.invoice).toHaveProperty('taxAmount');
            expect(b.invoice).toHaveProperty('totalAmount');

            if (b.payment) {
                expect(b.payment).toHaveProperty('paymentId');
                expect(b.payment).toHaveProperty('date');
                expect(b.payment).toHaveProperty('method');
            }

            expect(b.itinerary.outbound).toHaveProperty('scheduleId');
            expect(b.itinerary.outbound).toHaveProperty('airlineName');
            expect(b.itinerary.outbound).toHaveProperty('seatClass');
            expect(b.itinerary.outbound).toHaveProperty('duration');
            expect(b.itinerary.outbound).toHaveProperty('flightNumber');
            expect(b.itinerary.outbound).toHaveProperty('availableSeat');
            expect(b.itinerary.outbound).toHaveProperty('price');
            expect(b.itinerary.outbound).toHaveProperty('departure');
            expect(b.itinerary.outbound).toHaveProperty('arrival');
            expect(b.itinerary.outbound).toHaveProperty('facilities');

            expect(b.itinerary.outbound.departure).toHaveProperty('day');
            expect(b.itinerary.outbound.departure).toHaveProperty('dateTime');
            expect(b.itinerary.outbound.departure).toHaveProperty('city');
            expect(b.itinerary.outbound.departure).toHaveProperty('cityCode');
            expect(b.itinerary.outbound.departure).toHaveProperty('airportName');
            expect(b.itinerary.outbound.departure).toHaveProperty('terminalGate');
            expect(b.itinerary.outbound.arrival).toHaveProperty('day');
            expect(b.itinerary.outbound.arrival).toHaveProperty('dateTime');
            expect(b.itinerary.outbound.arrival).toHaveProperty('city');
            expect(b.itinerary.outbound.arrival).toHaveProperty('cityCode');
            expect(b.itinerary.outbound.arrival).toHaveProperty('airportName');
            expect(b.itinerary.outbound.facilities).toHaveProperty('baggage');
            expect(b.itinerary.outbound.facilities).toHaveProperty('cabinBaggage');
            expect(b.itinerary.outbound.facilities).toHaveProperty('entertainment');
            expect(b.itinerary.outbound.facilities).toHaveProperty('meal');
            expect(b.itinerary.outbound.facilities).toHaveProperty('wifi');

            expect(Array.isArray(b.passenger.data)).toBe(true);
            
            b.passenger.data.forEach((p) => {
                expect(p).toHaveProperty('passengerId');
                expect(p).toHaveProperty('ageGroup');

                if (p.ageGroup !== 'Baby') {
                    expect(p).toHaveProperty('label');
                    expect(p).toHaveProperty('title');
                    expect(p).toHaveProperty('fullName');
                    expect(p).toHaveProperty('familyName');
                    expect(p).toHaveProperty('seatNumber');
                }
            });
        });
    });

    it('should successfully retrieves all booking transactions matching date with 200 status code', async () => {
        const response = await request(server)
            .get(`/bookings?date=${new Date(Date.now()).toISOString().split('T')[0]}`)
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(200);

        expect(response.body.status).toBe('Success');
        expect(response.body.statusCode).toBe(200);
        expect(response.body.message).toBe('Data riwayat pemesanan berhasil diambil.');

        expect(response.body.pagination).toHaveProperty('total');
        expect(response.body.pagination.total).not.toBeNull();
        expect(response.body.pagination.total).toBe(response.body.data.bookings.length);

        expect(response.body.data).toHaveProperty('bookings');
        expect(Array.isArray(response.body.data.bookings)).toBe(true);

        const { bookings } = response.body.data;
        bookings.forEach((b) => {
            expect(b).toHaveProperty('bookingId');
            expect(b).toHaveProperty('bookingCode');
            expect(b).toHaveProperty('date');
            expect(b).toHaveProperty('status');
            expect(b).toHaveProperty('journeyType');
            expect(b).toHaveProperty('itinerary');
            expect(b).toHaveProperty('passenger');
            expect(b).toHaveProperty('invoice');
            expect(b).toHaveProperty('payment');

            expect(typeof b.bookingId).toBe('number');
            expect(typeof b.bookingCode).toBe('string');
            expect(typeof b.date).toBe('string');
            expect(typeof b.status).toBe('string');
            expect(typeof b.journeyType).toBe('string');

            expect(b.itinerary).toHaveProperty('outbound');
            expect(b.itinerary).toHaveProperty('inbound');
            expect(b.passenger).toHaveProperty('total');
            expect(b.passenger).toHaveProperty('adult');
            expect(b.passenger).toHaveProperty('child');
            expect(b.passenger).toHaveProperty('baby');
            expect(b.passenger).toHaveProperty('data');
            expect(b.invoice).toHaveProperty('invoiceId');
            expect(b.invoice).toHaveProperty('paymentDueDateTime');
            expect(b.invoice).toHaveProperty('subtotal');
            expect(b.invoice).toHaveProperty('taxAmount');
            expect(b.invoice).toHaveProperty('totalAmount');

            if (b.payment) {
                expect(b.payment).toHaveProperty('paymentId');
                expect(b.payment).toHaveProperty('date');
                expect(b.payment).toHaveProperty('method');
            }

            expect(b.itinerary.outbound).toHaveProperty('scheduleId');
            expect(b.itinerary.outbound).toHaveProperty('airlineName');
            expect(b.itinerary.outbound).toHaveProperty('seatClass');
            expect(b.itinerary.outbound).toHaveProperty('duration');
            expect(b.itinerary.outbound).toHaveProperty('flightNumber');
            expect(b.itinerary.outbound).toHaveProperty('availableSeat');
            expect(b.itinerary.outbound).toHaveProperty('price');
            expect(b.itinerary.outbound).toHaveProperty('departure');
            expect(b.itinerary.outbound).toHaveProperty('arrival');
            expect(b.itinerary.outbound).toHaveProperty('facilities');

            expect(b.itinerary.outbound.departure).toHaveProperty('day');
            expect(b.itinerary.outbound.departure).toHaveProperty('dateTime');
            expect(b.itinerary.outbound.departure).toHaveProperty('city');
            expect(b.itinerary.outbound.departure).toHaveProperty('cityCode');
            expect(b.itinerary.outbound.departure).toHaveProperty('airportName');
            expect(b.itinerary.outbound.departure).toHaveProperty('terminalGate');
            expect(b.itinerary.outbound.arrival).toHaveProperty('day');
            expect(b.itinerary.outbound.arrival).toHaveProperty('dateTime');
            expect(b.itinerary.outbound.arrival).toHaveProperty('city');
            expect(b.itinerary.outbound.arrival).toHaveProperty('cityCode');
            expect(b.itinerary.outbound.arrival).toHaveProperty('airportName');
            expect(b.itinerary.outbound.facilities).toHaveProperty('baggage');
            expect(b.itinerary.outbound.facilities).toHaveProperty('cabinBaggage');
            expect(b.itinerary.outbound.facilities).toHaveProperty('entertainment');
            expect(b.itinerary.outbound.facilities).toHaveProperty('meal');
            expect(b.itinerary.outbound.facilities).toHaveProperty('wifi');

            expect(Array.isArray(b.passenger.data)).toBe(true);
            
            b.passenger.data.forEach((p) => {
                expect(p).toHaveProperty('passengerId');
                expect(p).toHaveProperty('ageGroup');

                if (p.ageGroup !== 'Baby') {
                    expect(p).toHaveProperty('label');
                    expect(p).toHaveProperty('title');
                    expect(p).toHaveProperty('fullName');
                    expect(p).toHaveProperty('familyName');
                    expect(p).toHaveProperty('seatNumber');
                }
            });
        });
    });

    it('should successfully retrieves all booking transactions matching userId and date with 200 status code', async () => {
        const response = await request(server)
            .get(`/bookings?userId=1&date=${new Date(Date.now()).toISOString().split('T')[0]}`)
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(200);

        expect(response.body.status).toBe('Success');
        expect(response.body.statusCode).toBe(200);
        expect(response.body.message).toBe('Data riwayat pemesanan berhasil diambil.');

        expect(response.body.pagination).toHaveProperty('total');
        expect(response.body.pagination.total).not.toBeNull();
        expect(response.body.pagination.total).toBe(response.body.data.bookings.length);

        expect(response.body.data).toHaveProperty('bookings');
        expect(Array.isArray(response.body.data.bookings)).toBe(true);

        const { bookings } = response.body.data;
        bookings.forEach((b) => {
            expect(b).toHaveProperty('bookingId');
            expect(b).toHaveProperty('bookingCode');
            expect(b).toHaveProperty('date');
            expect(b).toHaveProperty('status');
            expect(b).toHaveProperty('journeyType');
            expect(b).toHaveProperty('itinerary');
            expect(b).toHaveProperty('passenger');
            expect(b).toHaveProperty('invoice');
            expect(b).toHaveProperty('payment');

            expect(typeof b.bookingId).toBe('number');
            expect(typeof b.bookingCode).toBe('string');
            expect(typeof b.date).toBe('string');
            expect(typeof b.status).toBe('string');
            expect(typeof b.journeyType).toBe('string');

            expect(b.itinerary).toHaveProperty('outbound');
            expect(b.itinerary).toHaveProperty('inbound');
            expect(b.passenger).toHaveProperty('total');
            expect(b.passenger).toHaveProperty('adult');
            expect(b.passenger).toHaveProperty('child');
            expect(b.passenger).toHaveProperty('baby');
            expect(b.passenger).toHaveProperty('data');
            expect(b.invoice).toHaveProperty('invoiceId');
            expect(b.invoice).toHaveProperty('paymentDueDateTime');
            expect(b.invoice).toHaveProperty('subtotal');
            expect(b.invoice).toHaveProperty('taxAmount');
            expect(b.invoice).toHaveProperty('totalAmount');

            if (b.payment) {
                expect(b.payment).toHaveProperty('paymentId');
                expect(b.payment).toHaveProperty('date');
                expect(b.payment).toHaveProperty('method');
            }

            expect(b.itinerary.outbound).toHaveProperty('scheduleId');
            expect(b.itinerary.outbound).toHaveProperty('airlineName');
            expect(b.itinerary.outbound).toHaveProperty('seatClass');
            expect(b.itinerary.outbound).toHaveProperty('duration');
            expect(b.itinerary.outbound).toHaveProperty('flightNumber');
            expect(b.itinerary.outbound).toHaveProperty('availableSeat');
            expect(b.itinerary.outbound).toHaveProperty('price');
            expect(b.itinerary.outbound).toHaveProperty('departure');
            expect(b.itinerary.outbound).toHaveProperty('arrival');
            expect(b.itinerary.outbound).toHaveProperty('facilities');

            expect(b.itinerary.outbound.departure).toHaveProperty('day');
            expect(b.itinerary.outbound.departure).toHaveProperty('dateTime');
            expect(b.itinerary.outbound.departure).toHaveProperty('city');
            expect(b.itinerary.outbound.departure).toHaveProperty('cityCode');
            expect(b.itinerary.outbound.departure).toHaveProperty('airportName');
            expect(b.itinerary.outbound.departure).toHaveProperty('terminalGate');
            expect(b.itinerary.outbound.arrival).toHaveProperty('day');
            expect(b.itinerary.outbound.arrival).toHaveProperty('dateTime');
            expect(b.itinerary.outbound.arrival).toHaveProperty('city');
            expect(b.itinerary.outbound.arrival).toHaveProperty('cityCode');
            expect(b.itinerary.outbound.arrival).toHaveProperty('airportName');
            expect(b.itinerary.outbound.facilities).toHaveProperty('baggage');
            expect(b.itinerary.outbound.facilities).toHaveProperty('cabinBaggage');
            expect(b.itinerary.outbound.facilities).toHaveProperty('entertainment');
            expect(b.itinerary.outbound.facilities).toHaveProperty('meal');
            expect(b.itinerary.outbound.facilities).toHaveProperty('wifi');

            expect(Array.isArray(b.passenger.data)).toBe(true);
            
            b.passenger.data.forEach((p) => {
                expect(p).toHaveProperty('passengerId');
                expect(p).toHaveProperty('ageGroup');

                if (p.ageGroup !== 'Baby') {
                    expect(p).toHaveProperty('label');
                    expect(p).toHaveProperty('title');
                    expect(p).toHaveProperty('fullName');
                    expect(p).toHaveProperty('familyName');
                    expect(p).toHaveProperty('seatNumber');
                }
            });
        });
    });

    it('should fail to retrieves all booking transactions with 401 status code', async () => {
        const response = await request(server)
            .get('/bookings')
            .set('Authorization', `Bearer InvalidToken`);

        expect(response.status).toBe(401);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(401);
        expect(response.body.message).toBe('Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.');
    });

    it('should fail to retrieves all booking transactions with 401 status code', async () => {
        const response = await request(server)
            .get('/bookings')
            .set('Authorization', `InvalidToken`);

        expect(response.status).toBe(401);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(401);
        expect(response.body.message).toBe('Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.');
    });

    it('should fail to retrieves all booking transactions matching only date with 403 status code', async () => {
        const response = await request(server)
            .get(`/bookings?date=${new Date(Date.now()).toISOString().split('T')[0]}`)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(403);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(403);
        expect(response.body.message).toBe('Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.');
    });

    it('should fail to retrieves all booking transactions with 403 status code', async () => {
        const response = await request(server)
            .get('/bookings')
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(403);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(403);
        expect(response.body.message).toBe('Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.');
    });

    it('should fail to retrieves all booking transactions matching userId of other user with 403 status code', async () => {
        const response = await request(server)
            .get('/bookings?userId=2')
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(403);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(403);
        expect(response.body.message).toBe('Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.');
    });

    it('should fail to retrieves all booking transactions with 400 status code', async () => {
        const response = await request(server)
            .get('/bookings?userId=abc')
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('userId tidak valid. Pastikan userId yang Anda masukkan dalam format yang benar.');
    });

    it('should fail to retrieves all booking transactions with 400 status code', async () => {
        const response = await request(server)
            .get('/bookings?bookingCode=1')
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('bookingCode tidak valid. Pastikan bookingCode yang Anda masukkan dalam format yang benar.');
    });

    it('should fail to retrieves all booking transactions with 400 status code', async () => {
        const response = await request(server)
            .get('/bookings?userId=1&date=10-12-2024')
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan date yang Anda masukkan dalam format yang benar (YYYY-MM-DD).');
    });
});

describe('GET /bookings/{bookingId}', () => {
    let buyerAccessToken, adminAccessToken;

    beforeAll(() => {
        buyerAccessToken = generateToken({
            id: 1,
            fullName: 'Buyer 1',
            email: 'buyer@tiketgo.com',
            phoneNumber: '6280000000000',
            role: 'Buyer'
        });

        adminAccessToken = generateToken({
            id: 2,
            fullName: 'Admin 1',
            email: 'admin@tiketgo.com',
            phoneNumber: '6280000000001',
            role: 'Admin'
        });
    });

    afterAll(() => {
        server.close();

        if (job) {
            job.cancel();
        }
    });

    beforeEach(async () => {
        await resetDatabase();
        await seedDatabase();
    });

    afterEach(async() => await resetDatabase());

    it('should successfully retrieves a booking transaction details with 200 status code', async () => {
        const response = await request(server)
            .get('/bookings/1')
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(200);

        expect(response.body.status).toBe('Success');
        expect(response.body.statusCode).toBe(200);
        expect(response.body.message).toBe('Data riwayat pemesanan berhasil diambil.');

        expect(response.body).toHaveProperty('data');
        expect(response.body.data).not.toBeNull();

        const { data } = response.body;

        expect(data).toHaveProperty('bookingId');
        expect(data).toHaveProperty('bookingCode');
        expect(data).toHaveProperty('date');
        expect(data).toHaveProperty('status');
        expect(data).toHaveProperty('journeyType');
        expect(data).toHaveProperty('itinerary');
        expect(data).toHaveProperty('passenger');
        expect(data).toHaveProperty('invoice');
        expect(data).toHaveProperty('payment');

        expect(typeof data.bookingId).toBe('number');
        expect(typeof data.bookingCode).toBe('string');
        expect(typeof data.date).toBe('string');
        expect(typeof data.status).toBe('string');
        expect(typeof data.journeyType).toBe('string');

        expect(data.itinerary).toHaveProperty('outbound');
        expect(data.itinerary).toHaveProperty('inbound');
        expect(data.passenger).toHaveProperty('total');
        expect(data.passenger).toHaveProperty('adult');
        expect(data.passenger).toHaveProperty('child');
        expect(data.passenger).toHaveProperty('baby');
        expect(data.passenger).toHaveProperty('data');
        expect(data.invoice).toHaveProperty('invoiceId');
        expect(data.invoice).toHaveProperty('paymentDueDateTime');
        expect(data.invoice).toHaveProperty('subtotal');
        expect(data.invoice).toHaveProperty('taxAmount');
        expect(data.invoice).toHaveProperty('totalAmount');

        if (data.payment) {
            expect(data.payment).toHaveProperty('paymentId');
            expect(data.payment).toHaveProperty('date');
            expect(data.payment).toHaveProperty('method');
        }

        expect(data.itinerary.outbound).toHaveProperty('scheduleId');
        expect(data.itinerary.outbound).toHaveProperty('airlineName');
        expect(data.itinerary.outbound).toHaveProperty('seatClass');
        expect(data.itinerary.outbound).toHaveProperty('duration');
        expect(data.itinerary.outbound).toHaveProperty('flightNumber');
        expect(data.itinerary.outbound).toHaveProperty('availableSeat');
        expect(data.itinerary.outbound).toHaveProperty('price');
        expect(data.itinerary.outbound).toHaveProperty('departure');
        expect(data.itinerary.outbound).toHaveProperty('arrival');
        expect(data.itinerary.outbound).toHaveProperty('facilities');

        expect(data.itinerary.outbound.departure).toHaveProperty('day');
        expect(data.itinerary.outbound.departure).toHaveProperty('dateTime');
        expect(data.itinerary.outbound.departure).toHaveProperty('city');
        expect(data.itinerary.outbound.departure).toHaveProperty('cityCode');
        expect(data.itinerary.outbound.departure).toHaveProperty('airportName');
        expect(data.itinerary.outbound.departure).toHaveProperty('terminalGate');
        expect(data.itinerary.outbound.arrival).toHaveProperty('day');
        expect(data.itinerary.outbound.arrival).toHaveProperty('dateTime');
        expect(data.itinerary.outbound.arrival).toHaveProperty('city');
        expect(data.itinerary.outbound.arrival).toHaveProperty('cityCode');
        expect(data.itinerary.outbound.arrival).toHaveProperty('airportName');
        expect(data.itinerary.outbound.facilities).toHaveProperty('baggage');
        expect(data.itinerary.outbound.facilities).toHaveProperty('cabinBaggage');
        expect(data.itinerary.outbound.facilities).toHaveProperty('entertainment');
        expect(data.itinerary.outbound.facilities).toHaveProperty('meal');
        expect(data.itinerary.outbound.facilities).toHaveProperty('wifi');

        expect(Array.isArray(data.passenger.data)).toBe(true);
        
        data.passenger.data.forEach((p) => {
            expect(p).toHaveProperty('passengerId');
            expect(p).toHaveProperty('ageGroup');

            if (p.ageGroup !== 'Baby') {
                expect(p).toHaveProperty('label');
                expect(p).toHaveProperty('title');
                expect(p).toHaveProperty('fullName');
                expect(p).toHaveProperty('familyName');
                expect(p).toHaveProperty('seatNumber');
            }
        });
    });

    it('should fail to retrieves a booking transaction details with 401 status code', async () => {
        const response = await request(server)
            .get('/bookings/1')
            .set('Authorization', `Bearer InvalidToken`);

        expect(response.status).toBe(401);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(401);
        expect(response.body.message).toBe('Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.');
    });

    it('should fail to retrieves a booking transaction details of different user as Buyer with 403 status code', async () => {
        const response = await request(server)
            .get('/bookings/4')
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(403);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(403);
        expect(response.body.message).toBe('Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.');
    });

    it('should fail to retrieves a booking transaction details with 404 status code', async () => {
        const response = await request(server)
            .get('/bookings/4040404')
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(404);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(404);
        expect(response.body.message).toBe('Riwayat pemesanan tidak ditemukan.');
    });

    it('should fail to retrieves a booking transaction details with 400 status code', async () => {
        const response = await request(server)
            .get('/bookings/abc')
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('bookingId tidak valid. Pastikan bookingId yang Anda masukkan dalam format yang benar.');
    });
});

describe('POST /bookings', () => {
    let buyerAccessToken, adminAccessToken;

    beforeAll(() => {
        buyerAccessToken = generateToken({
            id: 1,
            fullName: 'Buyer 1',
            email: 'buyer@tiketgo.com',
            phoneNumber: '6280000000000',
            role: 'Buyer'
        });

        adminAccessToken = generateToken({
            id: 2,
            fullName: 'Admin 1',
            email: 'admin@tiketgo.com',
            phoneNumber: '6280000000001',
            role: 'Admin'
        });
    });

    afterAll(() => {
        server.close();

        if (job) {
            job.cancel();
        }
    });

    beforeEach(async () => {
        await resetDatabase();
        await seedDatabase();
    });

    afterEach(async() => await resetDatabase());

    it('should successfully creates a One-way booking with 201 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(201);

        expect(response.body.status).toBe('Success');
        expect(response.body.statusCode).toBe(201);
        expect(response.body.message).toBe('Berhasil membuat pesanan tiket penerbangan. Silahkan selesaikan pembayaran Anda.');

        expect(response.body).toHaveProperty('data');
        expect(response.body.data).not.toBeNull();

        expect(response.body.data).toHaveProperty('bookingId');
        expect(response.body.data).toHaveProperty('bookingCode');
        expect(response.body.data).toHaveProperty('paymentDueDateTime');

        expect(typeof response.body.data.bookingId).toBe('number');
        expect(typeof response.body.data.bookingCode).toBe('string');
        expect(typeof response.body.data.paymentDueDateTime).toBe('string');
    });

    it('should successfully creates a One-way booking within the same day as departure date with 201 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 3,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(201);

        expect(response.body.status).toBe('Success');
        expect(response.body.statusCode).toBe(201);
        expect(response.body.message).toBe('Berhasil membuat pesanan tiket penerbangan. Silahkan selesaikan pembayaran Anda.');

        expect(response.body).toHaveProperty('data');
        expect(response.body.data).not.toBeNull();

        expect(response.body.data).toHaveProperty('bookingId');
        expect(response.body.data).toHaveProperty('bookingCode');
        expect(response.body.data).toHaveProperty('paymentDueDateTime');

        expect(typeof response.body.data.bookingId).toBe('number');
        expect(typeof response.body.data.bookingCode).toBe('string');
        expect(typeof response.body.data.paymentDueDateTime).toBe('string');
    });

    it('should successfully creates a One-way booking within the a day before as departure date and time of earlier than 01:00 with 201 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 4,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(201);

        expect(response.body.status).toBe('Success');
        expect(response.body.statusCode).toBe(201);
        expect(response.body.message).toBe('Berhasil membuat pesanan tiket penerbangan. Silahkan selesaikan pembayaran Anda.');

        expect(response.body).toHaveProperty('data');
        expect(response.body.data).not.toBeNull();

        expect(response.body.data).toHaveProperty('bookingId');
        expect(response.body.data).toHaveProperty('bookingCode');
        expect(response.body.data).toHaveProperty('paymentDueDateTime');

        expect(typeof response.body.data.bookingId).toBe('number');
        expect(typeof response.body.data.bookingCode).toBe('string');
        expect(typeof response.body.data.paymentDueDateTime).toBe('string');
    });

    it('should successfully creates a Round-trip booking with 201 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'Round-trip',
                outbound: 3,
                inbound: 1
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ]
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(201);

        expect(response.body.status).toBe('Success');
        expect(response.body.statusCode).toBe(201);
        expect(response.body.message).toBe('Berhasil membuat pesanan tiket penerbangan. Silahkan selesaikan pembayaran Anda.');

        expect(response.body).toHaveProperty('data');
        expect(response.body.data).not.toBeNull();

        expect(response.body.data).toHaveProperty('bookingId');
        expect(response.body.data).toHaveProperty('bookingCode');
        expect(response.body.data).toHaveProperty('paymentDueDateTime');

        expect(typeof response.body.data.bookingId).toBe('number');
        expect(typeof response.body.data.bookingCode).toBe('string');
        expect(typeof response.body.data.paymentDueDateTime).toBe('string');
    });

    it('should fail to creates a booking with 401 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer Invalid Token`);

        expect(response.status).toBe(401);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(401);
        expect(response.body.message).toBe('Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.');
    });
    
    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);
        
        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan itinerary, passenger, dan seat telah diisi.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan itinerary, passenger, dan seat telah diisi.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan itinerary, passenger, dan seat telah diisi.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const response = await request(server)
            .post('/bookings')
            .send({})
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan itinerary, passenger, dan seat telah diisi.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan itinerary memiliki properti journeyType, outbound, dan inbound.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan itinerary memiliki properti journeyType, outbound, dan inbound.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan itinerary memiliki properti journeyType, outbound, dan inbound.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: null,
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan itinerary.journeyType, itinerary.outbound, dan itinerary.inbound yang Anda masukkan dalam format yang benar.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 4040404,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan itinerary.outbound memiliki nilai scheduleId yang ada.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan passenger memiliki properi total, adult, child, baby, dan data.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan passenger memiliki properi total, adult, child, baby, dan data.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan passenger memiliki properi total, adult, child, baby, dan data.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan passenger memiliki properi total, adult, child, baby, dan data.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: '3',
                adult: '2',
                child: null,
                baby: '1',
                data: '123'
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan passenger.total, passenger.adult, passenger.child, dan passenger.baby yang Anda masukkan dalam format yang benar.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 0,
                adult: 0,
                child: 0,
                baby: 0,
                data: []
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan Anda memasukkan paling tidak satu penumpang pada pemesanan.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 0,
                adult: 0,
                child: 0,
                baby: 2,
                data: [
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan Anda memasukkan paling tidak satu penumpang pada pemesanan.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 1,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan passenger.total memiliki nilai jumlah dari passenger.adult dan passenger.child.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan passenger.data memiliki jumlah data passenger.total ditambah passenger.baby.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan setiap passenger.data memiliki properti ageGroup.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        familyName: 'Romanoff',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan Anda memasukkan label, title, fullName, birthDate, nationality, dan identityNumber pada setiap passenger.data.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'Label Apa Ini',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan label pada passenger.data yang Anda masukkan dalam format yang benar.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Wrong Title',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan title pada passenger.data yang Anda masukkan dalam format yang benar dan memiliki nilai \'Mr.\', \'Master\', \'Mrs.\', \'Miss.\', atau \'Ms.\'.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Wrong Age Group',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan ageGroup pada passenger.data yang Anda masukkan dalam format yang benar dan memiliki nilai \'Adult\', \'Child\', atau \'Baby\'.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '01-12-1960',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan birthDate pada passenger.data yang Anda masukkan dalam format yang benar (YYYY-MM-DD).');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Child',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan ageGroup \'Child\' (lebih dari atau sama dengan 2 tahun dan kurang dari 12 tahun) sesuai dengan usia penumpang.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Baby',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan ageGroup \'Baby\' (kurang dari 2 tahun) sesuai dengan usia penumpang.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '2024-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan ageGroup \'Adult\' (lebih dari atau sama dengan 12 tahun) sesuai dengan usia penumpang.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {}
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan seat memiliki properti outbound dan inbound.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: null,
                inbound:  null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan data tempat duduk penumpang yang Anda kirim dalam format array.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'A1'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'B1'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan jumlah data tempat duduk penumpang bernilai sama dengan total penumpang.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P10',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan label pada seat.outbound yang Anda masukkan sesuai dengan data penumpang pada passenger.data.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'J99'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan seatNumber pada seat.outbound yang Anda masukkan dalam format yang benar.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'A1'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Pemesanan ditolak. Kursi nomor A1 tidak tersedia.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 2,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Pemesanan ditolak. Tiket hanya dapat dipesan paling lambat 2 jam sebelum waktu keberangkatan.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'Wrong Journey',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan itinerary.journeyType yang Anda masukkan memiliki nilai \'One-way\' atau \'Round-trip\'.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'Round-trip',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan Anda memasukkan jadwal penerbangan kepulangan (inbound) pada rencana penerbangan Round-trip.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'Round-trip',
                outbound: 1,
                inbound: 404040404
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan itinerary.inbound memiliki nilai scheduleId yang tersedia.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'Round-trip',
                outbound: 1,
                inbound: 404040404
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan itinerary.inbound memiliki nilai scheduleId yang tersedia.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'Round-trip',
                outbound: 1,
                inbound: 3
            },
            passenger: {
                total: 3,
                adult: 2,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ],
                inbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    }
                ]
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Pemesanan ditolak. Tiket pulang-pergi hanya dapat dipesan jika waktu kedatangan jadwal pergi tidak melewati waktu keberangkatan jadwal pulang.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 3,
                inbound: null
            },
            passenger: {
                total: 6,
                adult: 4,
                child: 2,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        label: 'P4',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P5',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P6',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    },
                    {
                        label: 'P4',
                        seatNumber: 'E10'
                    },
                    {
                        label: 'P5',
                        seatNumber: 'E11'
                    },
                    {
                        label: 'P6',
                        seatNumber: 'E12'
                    }
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Pemesanan gagal. Kursi yang dipesan sedang tidak tersedia.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 3,
                inbound: null
            },
            passenger: {
                total: 5,
                adult: 4,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 123,
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        label: 'P4',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P5',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    },
                    {
                        label: 'P4',
                        seatNumber: 'E10'
                    },
                    {
                        label: 'P5',
                        seatNumber: 'E11'
                    },
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan fullName pada passenger.data yang Anda masukkan dalam format yang benar.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 3,
                inbound: null
            },
            passenger: {
                total: 5,
                adult: 4,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Robery Wowney',
                        familyName: 123,
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        label: 'P4',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P5',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    },
                    {
                        label: 'P4',
                        seatNumber: 'E10'
                    },
                    {
                        label: 'P5',
                        seatNumber: 'E11'
                    },
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan familyName pada passenger.data yang Anda masukkan dalam format yang benar.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 3,
                inbound: null
            },
            passenger: {
                total: 5,
                adult: 4,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Robery Wowney',
                        familyName: 'Hey Hey',
                        birthDate: '1960-12-01',
                        nationality: 123,
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        label: 'P4',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P5',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    },
                    {
                        label: 'P4',
                        seatNumber: 'E10'
                    },
                    {
                        label: 'P5',
                        seatNumber: 'E11'
                    },
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan nationality pada passenger.data yang Anda masukkan dalam format yang benar.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 3,
                inbound: null
            },
            passenger: {
                total: 5,
                adult: 4,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Robery Wowney',
                        familyName: 'Hey Hey',
                        birthDate: '1960-12-01',
                        nationality: 'Indonesia',
                        identityNumber: 123,
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        label: 'P4',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P5',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    },
                    {
                        label: 'P4',
                        seatNumber: 'E10'
                    },
                    {
                        label: 'P5',
                        seatNumber: 'E11'
                    },
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan identityNumber pada passenger.data yang Anda masukkan dalam format yang benar.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 3,
                inbound: null
            },
            passenger: {
                total: 5,
                adult: 4,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Robery Wowney',
                        familyName: 'Hey Hey',
                        birthDate: '1960-12-01',
                        nationality: 'Indonesia',
                        identityNumber: '1231237132',
                        issuingCountry: 123,
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        label: 'P4',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P5',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    },
                    {
                        label: 'P4',
                        seatNumber: 'E10'
                    },
                    {
                        label: 'P5',
                        seatNumber: 'E11'
                    },
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan issuingCountry pada passenger.data yang Anda masukkan dalam format yang benar.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 3,
                inbound: null
            },
            passenger: {
                total: 5,
                adult: 4,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Robery Wowney',
                        familyName: 'Hey Hey',
                        birthDate: '1960-12-01',
                        nationality: 'Indonesia',
                        identityNumber: '1231237132',
                        issuingCountry: 'Indonesia',
                        expiryDate: 123123
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        label: 'P4',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P5',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    },
                    {
                        label: 'P4',
                        seatNumber: 'E10'
                    },
                    {
                        label: 'P5',
                        seatNumber: 'E11'
                    },
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan expiryDate pada passenger.data yang Anda masukkan dalam format yang benar (YYYY-MM-DD).');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'Round-trip',
                outbound: 3,
                inbound: 1
            },
            passenger: {
                total: 5,
                adult: 4,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Robery Wowney',
                        familyName: 'Hey Hey',
                        birthDate: '1960-12-01',
                        nationality: 'Indonesia',
                        identityNumber: '1231237132',
                        issuingCountry: 'Indonesia',
                        expiryDate: '2029-10-09'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        label: 'P4',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P5',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'P1',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    },
                    {
                        label: 'P4',
                        seatNumber: 'E10'
                    },
                    {
                        label: 'P5',
                        seatNumber: 'E11'
                    },
                ],
                inbound: []
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan Anda memasukkan data tempat duduk pada penerbangan kepulangan (inbound) untuk rencana penerbangan Round-trip.');
    });

    it('should fail to creates a booking with 400 status code', async () => {
        const booking = {
            itinerary: {
                journeyType: 'One-way',
                outbound: 1,
                inbound: null
            },
            passenger: {
                total: 5,
                adult: 4,
                child: 1,
                baby: 1,
                data: [
                    {
                        label: 'P1',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Robery Wowney',
                        familyName: 'Hey Hey',
                        birthDate: '1960-12-01',
                        nationality: 'Indonesia',
                        identityNumber: '1231237132',
                        issuingCountry: 'Indonesia',
                        expiryDate: '2029-10-09'
                    },
                    {
                        label: 'P2',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        label: 'P3',
                        title: 'Master',
                        ageGroup: 'Child',
                        fullName: 'Jasper',
                        familyName: 'Javier',
                        birthDate: '2019-01-01',
                        nationality: 'United States of America',
                        identityNumber: '61213321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2029-01-01'
                    },
                    {
                        label: 'P4',
                        title: 'Mr.',
                        ageGroup: 'Adult',
                        fullName: 'Tony Stark',
                        familyName: 'Downey Jr',
                        birthDate: '1960-12-01',
                        nationality: 'United States of America',
                        identityNumber: '61719321830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-01-01'
                    },
                    {
                        label: 'P5',
                        title: 'Mrs.',
                        ageGroup: 'Adult',
                        fullName: 'Nastasha',
                        familyName: 'Romanoff',
                        birthDate: '1980-11-21',
                        nationality: 'United States of America',
                        identityNumber: '617191111830219',
                        issuingCountry: 'United States of America',
                        expiryDate: '2027-05-01'
                    },
                    {
                        ageGroup: 'Baby'
                    }
                ]
            },
            seat: {
                outbound: [
                    {
                        label: 'PPPOPPPOPOP',
                        seatNumber: 'F10'
                    },
                    {
                        label: 'P2',
                        seatNumber: 'F11'
                    },
                    {
                        label: 'P3',
                        seatNumber: 'F12'
                    },
                    {
                        label: 'P4',
                        seatNumber: 'E10'
                    },
                    {
                        label: 'P5',
                        seatNumber: 'E11'
                    },
                ],
                inbound: null
            }
        };

        const response = await request(server)
            .post('/bookings')
            .send(booking)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan label pada seat.outbound yang Anda masukkan dalam format yang benar.');
    });
});

describe('POST /bookings/{bookingId}/payments', () => {
    let buyerAccessToken, adminAccessToken;

    beforeAll(() => {
        buyerAccessToken = generateToken({
            id: 1,
            fullName: 'Buyer 1',
            email: 'buyer@tiketgo.com',
            phoneNumber: '6280000000000',
            role: 'Buyer'
        });

        adminAccessToken = generateToken({
            id: 2,
            fullName: 'Admin 1',
            email: 'admin@tiketgo.com',
            phoneNumber: '6280000000001',
            role: 'Admin'
        });
    });

    afterAll(() => {
        server.close();

        if (job) {
            job.cancel();
        }
    });

    beforeEach(async () => {
        await resetDatabase();
        await seedDatabase();
    });

    afterEach(async() => await resetDatabase());

    it('should successfully creates a payment for a booking with Credit Card with 201 status code', async () => {
        const payment = {
            method: 'Credit Card',
            accountNumber: '123456789012345',
            holderName: 'John Doe',
            CVV: '233',
            expiryDate: '03/27'
        };

        const response = await request(server)
            .post('/bookings/1/payments')
            .send(payment)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(201);

        expect(response.body.status).toBe('Success');
        expect(response.body.statusCode).toBe(201);
        expect(response.body.message).toBe('Berhasil melakukan pembayaran tiket penerbangan.');
    });

    it('should successfully creates a payment for a booking with Gopay with 201 status code', async () => {
        const payment = {
            method: 'Gopay',
            accountNumber: '123456789012345'
        };

        const response = await request(server)
            .post('/bookings/1/payments')
            .send(payment)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(201);

        expect(response.body.status).toBe('Success');
        expect(response.body.statusCode).toBe(201);
        expect(response.body.message).toBe('Berhasil melakukan pembayaran tiket penerbangan.');
    });

    it('should successfully creates a payment for a booking with Virtual Account with 201 status code', async () => {
        const payment = {
            method: 'Virtual Account',
            accountNumber: '123456789012345'
        };

        const response = await request(server)
            .post('/bookings/1/payments')
            .send(payment)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(201);

        expect(response.body.status).toBe('Success');
        expect(response.body.statusCode).toBe(201);
        expect(response.body.message).toBe('Berhasil melakukan pembayaran tiket penerbangan.');
    });

    it('should fail to creates a payment for a booking with 401 status code', async () => {
        const payment = {
            method: 'Gopay',
            accountNumber: '08231981238912'
        };

        const response = await request(server)
            .post('/bookings/4/payments')
            .send(payment)
            .set('Authorization', `Bearer InvalidToken`);

        expect(response.status).toBe(401);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(401);
        expect(response.body.message).toBe('Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.');
    });

    it('should fail to creates a payment for a booking with expired payment due with 400 status code', async () => {
        const payment = {
            method: 'Gopay',
            accountNumber: '08231981238912'
        };

        const response = await request(server)
            .post('/bookings/5/payments')
            .send(payment)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Pembayaran tiket penerbangan gagal dibuat. Batas pembayaran tiket penerbangan telah kedaluwarsa.');
    });

    it('should fail to creates a payment for different user\'s booking with 403 status code', async () => {
        const payment = {
            method: 'Gopay',
            accountNumber: '08231981238912'
        };

        const response = await request(server)
            .post('/bookings/4/payments')
            .send(payment)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(403);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(403);
        expect(response.body.message).toBe('Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.');
    });

    it('should fail to creates a payment for a non-existing booking with 404 status code', async () => {
        const payment = {
            method: 'Gopay',
            accountNumber: '08231981238912'
        };

        const response = await request(server)
            .post('/bookings/4040404/payments')
            .send(payment)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(404);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(404);
        expect(response.body.message).toBe('Riwayat pemesanan tidak ditemukan.');
    });

    it('should fail to creates a payment for an issued booking with 400 status code', async () => {
        const payment = {
            method: 'Virtual Account',
            accountNumber: '123456789012345'
        };

        const response = await request(server)
            .post('/bookings/3/payments')
            .send(payment)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Pembayaran tiket penerbangan gagal dibuat. Tiket penerbangan telah diisukan.');
    });

    it('should fail to creates a payment for a cancelled booking with 400 status code', async () => {
        const payment = {
            method: 'Virtual Account',
            accountNumber: '123456789012345'
        };

        const response = await request(server)
            .post('/bookings/2/payments')
            .send(payment)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Pembayaran tiket penerbangan gagal dibuat. Tiket penerbangan telah dibatalkan.');
    });

    it('should fail to creates a payment for a booking with empty data with 400 status code', async () => {
        const payment = {};

        const response = await request(server)
            .post('/bookings/1/payments')
            .send(payment)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan method dan accountNumber telah diisi.');
    });

    it('should fail to creates a payment for a booking with invalid method with 400 status code', async () => {
        const payment = {
            method: 'DANA',
            accountNumber: '08231981238912'
        };

        const response = await request(server)
            .post('/bookings/1/payments')
            .send(payment)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan metode pembayaran yang Anda masukkan memiliki nilai \'Credit Card\', \'Virtual Account\', atau \'Gopay\'.');
    });

    it('should fail to creates a payment for a booking with invalid accountNumber type with 400 status code', async () => {
        const payment = {
            method: 'Gopay',
            accountNumber: 8231981238912
        };

        const response = await request(server)
            .post('/bookings/1/payments')
            .send(payment)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan method dan accountNumber yang Anda masukkan dalam format yang benar.');
    });

    it('should fail to creates a payment for a booking with Credit Card and incomplete data with 400 status code', async () => {
        const payment = {
            method: 'Credit Card',
            accountNumber: '8231981238912321'
        };

        const response = await request(server)
            .post('/bookings/1/payments')
            .send(payment)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan holderName, CVV, dan expiryDate telah diisi.');
    });

    it('should fail to creates a payment for a booking with Credit Card and invalid data type with 400 status code', async () => {
        const payment = {
            method: 'Credit Card',
            accountNumber: '8231916571231233',
            holderName: 123,
            CVV: 123,
            expiryDate: 123
        };

        const response = await request(server)
            .post('/bookings/1/payments')
            .send(payment)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan holderName, CVV, dan expiryDate yang Anda masukkan dalam format yang benar.');
    });

    it('should fail to creates a payment for a booking with Credit Card and invalid accountNumber with 400 status code', async () => {
        const payment = {
            method: 'Credit Card',
            accountNumber: '823191',
            holderName: 'John Doe',
            CVV: '322',
            expiryDate: '02/23'
        };

        const response = await request(server)
            .post('/bookings/1/payments')
            .send(payment)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan accountNumber yang Anda masukkan dalam format yang benar.');
    });

    it('should fail to creates a payment for a booking with Credit Card and invalid CVV with 400 status code', async () => {
        const payment = {
            method: 'Credit Card',
            accountNumber: '8231911234544444',
            holderName: 'John Doe',
            CVV: 'ABC',
            expiryDate: '02/23'
        };

        const response = await request(server)
            .post('/bookings/1/payments')
            .send(payment)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan CVV yang Anda masukkan dalam format yang benar.');
    });

    it('should fail to creates a payment for a booking with Credit Card and invalid expiryDate with 400 status code', async () => {
        const payment = {
            method: 'Credit Card',
            accountNumber: '8231911234544444',
            holderName: 'John Doe',
            CVV: '332',
            expiryDate: '2027-08-30'
        };

        const response = await request(server)
            .post('/bookings/1/payments')
            .send(payment)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan expiryDate yang Anda masukkan dalam format yang benar (MM/YY).');
    });
});