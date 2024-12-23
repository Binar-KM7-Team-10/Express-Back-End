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

describe('GET /notifications', () => {
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

    it('should successfully retrieves all notifications data as Admin with 200 status code', async () => {
        const response = await request(server)
            .get('/notifications')
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(200);

        expect(response.body.status).toBe('Success');
        expect(response.body.statusCode).toBe(200);
        expect(response.body.message).toBe('Data notifikasi berhasil diambil.');

        expect(response.body.pagination).toHaveProperty('total');
        expect(response.body.pagination.total).toBe(response.body.data.length);

        expect(Array.isArray(response.body.data)).toBe(true);

        const { data } = response.body;
        if (data.length) {
            data.forEach((d) => {
                expect(d).toHaveProperty('id');
                expect(d).toHaveProperty('userId');
                expect(d).toHaveProperty('bookingId');
                expect(d).toHaveProperty('scheduleId');
                expect(d).toHaveProperty('paymentId');
                expect(d).toHaveProperty('title');
                expect(d).toHaveProperty('message');
                expect(d).toHaveProperty('createdAt');
                expect(d).toHaveProperty('readStatus');
            });
        }
    });

    it('should successfully retrieves all notifications data with userId query as Buyer with 200 status code', async () => {
        const response = await request(server)
            .get('/notifications?userId=1')
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(200);

        expect(response.body.status).toBe('Success');
        expect(response.body.statusCode).toBe(200);
        expect(response.body.message).toBe('Data notifikasi berhasil diambil.');

        expect(response.body.pagination).toHaveProperty('total');
        expect(response.body.pagination.total).toBe(response.body.data.length);

        expect(Array.isArray(response.body.data)).toBe(true);

        const { data } = response.body;
        if (data.length) {
            data.forEach((d) => {
                expect(d).toHaveProperty('id');
                expect(d).toHaveProperty('userId');
                expect(d).toHaveProperty('bookingId');
                expect(d).toHaveProperty('scheduleId');
                expect(d).toHaveProperty('paymentId');
                expect(d).toHaveProperty('title');
                expect(d).toHaveProperty('message');
                expect(d).toHaveProperty('createdAt');
                expect(d).toHaveProperty('readStatus');
            });
        }
    });

    it('should fail to retrieves all notifications data with 401 status code', async () => {
        const response = await request(server)
            .get('/notifications')
            .set('Authorization', `Bearer InvalidToken`);

        expect(response.status).toBe(401);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(401);
        expect(response.body.message).toBe('Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.');
    });

    it('should fail to retrieves all notifications data with 403 status code', async () => {
        const response = await request(server)
            .get('/notifications')
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(403);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(403);
        expect(response.body.message).toBe('Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.');
    });

    it('should fail to retrieves all notifications data with non-existing userId with 404 status code', async () => {
        const response = await request(server)
            .get('/notifications?userId=4040404')
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(404);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(404);
        expect(response.body.message).toBe('Pengguna tidak ditemukan. Pastikan userId yang Anda masukkan benar.');
    });

    it('should fail to retrieves all notifications data with invalid userId with 400 status code', async () => {
        const response = await request(server)
            .get('/notifications?userId=abc')
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('userId tidak valid. Pastikan userId yang Anda masukkan dalam format yang benar.');
    });
});

describe('GET /notifications/{notificationId}', () => {
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

    it('should successfully retrieves a notification details with 200 status code', async () => {
        const response = await request(server)
            .get('/notifications/1')
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(200);

        expect(response.body.status).toBe('Success');
        expect(response.body.statusCode).toBe(200);
        expect(response.body.message).toBe('Data notifikasi berhasil diambil');

        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).toHaveProperty('userId');
        expect(response.body.data).toHaveProperty('bookingId');
        expect(response.body.data).toHaveProperty('scheduleId');
        expect(response.body.data).toHaveProperty('paymentId');
        expect(response.body.data).toHaveProperty('title');
        expect(response.body.data).toHaveProperty('message');
        expect(response.body.data).toHaveProperty('createdAt');
        expect(response.body.data).toHaveProperty('readStatus');
    });

    it('should fail to retrieves a notification details with 401 status code', async () => {
        const response = await request(server)
            .get('/notifications/1')
            .set('Authorization', `Bearer InvalidTOken`);

        expect(response.status).toBe(401);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(401);
        expect(response.body.message).toBe('Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.');
    });

    it('should fail to retrieves a notification details with 403 status code', async () => {
        const response = await request(server)
            .get('/notifications/5')
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(403);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(403);
        expect(response.body.message).toBe('Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.');
    });

    it('should fail to retrieves a notification details with 404 status code', async () => {
        const response = await request(server)
            .get('/notifications/404040404')
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(404);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(404);
        expect(response.body.message).toBe('Notifikasi tidak ditemukan.');
    });

    it('should fail to retrieves a notification details with invalid notificationId with 400 status code', async () => {
        const response = await request(server)
            .get('/notifications/abc')
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan notificationId yang Anda masukkan dalam format yang benar.');
    });
});

describe('PATCH /notifications/{notificationId}', () => {
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

    it('should successfully edits a notification with 200 status code', async () => {
        const response = await request(server)
            .patch('/notifications/1')
            .send({ readStatus: true })
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(200);

        expect(response.body.status).toBe('Success');
        expect(response.body.statusCode).toBe(200);
        expect(response.body.message).toBe('Notifikasi telah berhasil dibaca.');
    });

    it('should fail to edits a notification with invalid notificationId with 400 status code', async () => {
        const response = await request(server)
            .patch('/notifications/abc')
            .send({ readStatus: true })
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan notificationId yang Anda masukkan dalam format yang benar.');
    });
    
    it('should fail to edits a notification with empty data with 400 status code', async () => {
        const response = await request(server)
            .patch('/notifications/1')
            .send({})
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan readStatus telah diisi.');
    });

    it('should fail to edits a notification with invalid type with 400 status code', async () => {
        const response = await request(server)
            .patch('/notifications/1')
            .send({ readStatus: 'I have read it' })
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan readStatus bertipe boolean.');
    });

    it('should fail to edits a notification with 401 status code', async () => {
        const response = await request(server)
            .patch('/notifications/1')
            .send({ readStatus: true })
            .set('Authorization', `Bearer InvalidToken`);

        expect(response.status).toBe(401);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(401);
        expect(response.body.message).toBe('Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.');
    });

    it('should fail to edits a notification with 403 status code', async () => {
        const response = await request(server)
            .patch('/notifications/5')
            .send({ readStatus: true })
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(403);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(403);
        expect(response.body.message).toBe('Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.');
    });

    it('should fail to edits a notification with 404 status code', async () => {
        const response = await request(server)
            .patch('/notifications/4040404')
            .send({ readStatus: true })
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(404);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(404);
        expect(response.body.message).toBe('Notifikasi tidak ditemukan.');
    });
});