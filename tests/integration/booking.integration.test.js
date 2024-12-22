const request = require('supertest');
const { server, job } = require('../../app');
const { generateToken } = require('../../utils/jwtHelper');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDatabase() {
    await prisma.passenger.deleteMany();
    await prisma.bookedSeat.deleteMany();
    await prisma.seat.deleteMany();
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

    const schedule = await prisma.schedule.create({
        data: {
            flightId: 1,
            departureDateTime: new Date(Date.now() + (3 * 24 * 3600000)),
            arrivalDateTime: new Date(Date.now() + (3 * 24 * 3600000) + (2 * 3600000)),
            duration: 60,
            ticketPrice: 5650000,
            seatAvailability: 72,
            seatClass: 'Premium Economy',
            terminalGate: '3A'
        }
    });

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

        await prisma.seat.create({
            data: {
                scheduleId: schedule.id,
                seatNumber
            }
        });
    }

    await prisma.booking.createMany({
        data: [
            {
                id: 1,
                userId: 1,
                bookingCode: 'BOOKING001',
                date: new Date(Date.now()),
                status: 'Unpaid',
                journeyType: 'One-way'
            },
            {
                id: 2,
                userId: 1,
                bookingCode: 'BOOKING002',
                date: new Date(Date.now() - (24 * 3600000)),
                status: 'Cancelled',
                journeyType: 'One-way'
            },
            {
                id: 3,
                userId: 1,
                bookingCode: 'BOOKING003',
                date: new Date(Date.now() - (2 * 3600000)),
                status: 'Issued',
                journeyType: 'One-way'
            },
            {
                id: 4,
                userId: 2,
                bookingCode: 'BOOKING004',
                date: new Date(Date.now() - (2 * 3600000)),
                status: 'Issued',
                journeyType: 'One-way'
            }
        ]
    });

    await prisma.itinerary.createMany({
        data: [
            {
                id: 1,
                bookingId: 1,
                scheduleId: 1,
                tripDirection: 'Outbound'
            },
            {
                id: 2,
                bookingId: 2,
                scheduleId: 1,
                tripDirection: 'Outbound'
            },
            {
                id: 3,
                bookingId: 3,
                scheduleId: 1,
                tripDirection: 'Outbound'
            },
            {
                id: 4,
                bookingId: 4,
                scheduleId: 1,
                tripDirection: 'Outbound'
            },
        ]
    });
    
    await prisma.invoice.createMany({
        data: [
            {
                id: 1,
                bookingId: 1,
                subtotal: schedule.ticketPrice,
                taxAmount: schedule.ticketPrice * 0.1,
                totalAmount: schedule.ticketPrice * 1.1,
                paymentDueDateTime: new Date(Date.now() + (24 * 3600000)).toISOString()
            },
            {
                id: 2,
                bookingId: 2,
                subtotal: schedule.ticketPrice,
                taxAmount: schedule.ticketPrice * 0.1,
                totalAmount: schedule.ticketPrice * 1.1,
                paymentDueDateTime: new Date(Date.now()).toISOString()
            },
            {
                id: 3,
                bookingId: 3,
                subtotal: schedule.ticketPrice,
                taxAmount: schedule.ticketPrice * 0.1,
                totalAmount: schedule.ticketPrice * 1.1,
                paymentDueDateTime: new Date(Date.now() + (24 * 3600000)).toISOString()
            },
            {
                id: 4,
                bookingId: 4,
                subtotal: schedule.ticketPrice,
                taxAmount: schedule.ticketPrice * 0.1,
                totalAmount: schedule.ticketPrice * 1.1,
                paymentDueDateTime: new Date(Date.now() + (24 * 3600000)).toISOString()
            },
        ]
    })

    await prisma.bookedSeat.createMany({
        data: [
            {
                id: 1,
                seatId: 1,
                bookingId: 1
            },
            {
                id: 3,
                seatId: 3,
                bookingId: 3
            },
            {
                id: 4,
                seatId: 4,
                bookingId: 4
            }
        ]
    });

    await prisma.payment.createMany({
        data: [
            {
                id: 1,
                invoiceId: 3,
                date: new Date(Date.now() - 3600000),
                method: 'Credit Card',
                accountNumber: '31276813219312',
                holderName: 'John Doe',
                CVV: '225',
                expiryDate: '09/25'
            },
            {
                id: 2,
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
                id: 1,
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
                id: 2,
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
                id: 3,
                bookingId: 3,
                bookedSeatId: 3,
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
                id: 4,
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
                id: 1,
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
                id: 2,
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
                id: 3,
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
                id: 4,
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
                id: 5,
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
});