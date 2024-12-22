const request = require('supertest');
const { server, job } = require('../../app');
const { generateToken } = require('../../utils/jwtHelper');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDatabase() {
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

    await prisma.schedule.create({
        data: {
            flightId: 1,
            departureDateTime: new Date(Date.now() + 3600000),
            arrivalDateTime: new Date(Date.now() + 2 * 3600000),
            duration: 60,
            ticketPrice: 5650000,
            seatAvailability: 72,
            seatClass: 'Premium Economy',
            terminalGate: '3A'
        }
    });
}

describe('POST /schedules', () => {
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

    it('should successfully creates a flight schedule with 201 status code', async () => {
        const schedule = {
            flightId: 1,
            departureDateTime: new Date(Date.now() + 3600000),
            arrivalDateTime: new Date(Date.now() + 2 * 3600000),
            ticketPrice: 5650000,
            seatAvailability: 72,
            seatClass: 'Premium Economy',
            terminalGate: '3A'
        };

        const response = await request(server)
            .post('/schedules')
            .send(schedule)
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(201);

        expect(response.body.status).toBe('Success');
        expect(response.body.statusCode).toBe(201);
        expect(response.body.message).toBe('Berhasil membuat jadwal penerbangan.');

        expect(response.body.data).toHaveProperty('scheduleId');
        expect(response.body.data.scheduleId).not.toBeNull();
        expect(typeof response.body.data.scheduleId).toBe('number');
    });
    
    it('should fail to creates a flight schedule with 401 status code', async () => {
        const schedule = {
            flightId: 1,
            departureDateTime: new Date(Date.now() + 3600000),
            arrivalDateTime: new Date(Date.now() + 2 * 3600000),
            ticketPrice: 5650000,
            seatAvailability: 72,
            seatClass: 'Premium Economy',
            terminalGate: '3A'
        };

        const response = await request(server)
            .post('/schedules')
            .send(schedule)
            .set('Authorization', `Bearer InvalidToken`);

        expect(response.status).toBe(401);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(401);
        expect(response.body.message).toBe('Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.');
    });

    it('should fail to creates a flight schedule with 403 status code', async () => {
        const schedule = {
            flightId: 1,
            departureDateTime: new Date(Date.now() + 3600000),
            arrivalDateTime: new Date(Date.now() + 2 * 3600000),
            ticketPrice: 5650000,
            seatAvailability: 72,
            seatClass: 'Premium Economy',
            terminalGate: '3A'
        };

        const response = await request(server)
            .post('/schedules')
            .send(schedule)
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(403);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(403);
        expect(response.body.message).toBe('Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.');
    });

    it('should fail to creates a flight schedule with 400 status code', async () => {
        const schedule = {
            departureDateTime: new Date(Date.now() + 3600000),
            arrivalDateTime: new Date(Date.now() + 2 * 3600000),
            ticketPrice: 5650000,
            seatAvailability: 72,
            seatClass: 'Premium Economy',
            terminalGate: '3A'
        };

        const response = await request(server)
            .post('/schedules')
            .send(schedule)
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan flightId, departureDateTime, arrivalDateTime, ticketPrice, seatAvailability, seatClass, dan terminalGate telah diisi.');
    });

    it('should fail to creates a flight schedule with 400 status code', async () => {
        const schedule = {
            flightId: '1',
            departureDateTime: new Date(Date.now() + 3600000),
            arrivalDateTime: new Date(Date.now() + 2 * 3600000),
            ticketPrice: 5650000,
            seatAvailability: 72,
            seatClass: 'Premium Economy',
            terminalGate: '3A'
        };

        const response = await request(server)
            .post('/schedules')
            .send(schedule)
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan data yang Anda masukkan dalam format yang benar.');
    });

    it('should fail to creates a flight schedule with 400 status code', async () => {
        const schedule = {
            flightId: 4040404,
            departureDateTime: new Date(Date.now() + 3600000),
            arrivalDateTime: new Date(Date.now() + 2 * 3600000),
            ticketPrice: 5650000,
            seatAvailability: 72,
            seatClass: 'Premium Economy',
            terminalGate: '3A'
        };

        const response = await request(server)
            .post('/schedules')
            .send(schedule)
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Jadwal penerbangan gagal dibuat. Jadwal penerbangan harus berdasarkan penerbangan yang terdaftar.');
    });

    it('should fail to creates a flight schedule with 400 status code', async () => {
        const schedule = {
            flightId: 1,
            departureDateTime: 'Invalid Date',
            arrivalDateTime: new Date(Date.now() + 2 * 3600000),
            ticketPrice: 5650000,
            seatAvailability: 72,
            seatClass: 'Premium Economy',
            terminalGate: '3A'
        };

        const response = await request(server)
            .post('/schedules')
            .send(schedule)
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan departureDateTime dan arrivalDateTime yang Anda masukkan dalam format yang benar.');
    });

    it('should fail to creates a flight schedule with 400 status code', async () => {
        const schedule = {
            flightId: 1,
            departureDateTime: new Date(Date.now() + 2 * 3600000),
            arrivalDateTime: new Date(Date.now() + 3600000),
            ticketPrice: 5650000,
            seatAvailability: 72,
            seatClass: 'Premium Economy',
            terminalGate: '3A'
        };

        const response = await request(server)
            .post('/schedules')
            .send(schedule)
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan departureDateTime lebih awal dari arrivalDateTime.');
    });

    it('should fail to creates a flight schedule with 400 status code', async () => {
        const schedule = {
            flightId: 1,
            departureDateTime: new Date(Date.now() + 3600000),
            arrivalDateTime: new Date(Date.now() + 2 * 3600000),
            ticketPrice: 5650000,
            seatAvailability: 72,
            seatClass: 'Ekonomi',
            terminalGate: '3A'
        };

        const response = await request(server)
            .post('/schedules')
            .send(schedule)
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan seatClass memiliki nilai \'Economy\', \'Premium Economy\', \'Business\', atau \'First Class\'.');
    });

    it('should fail to creates a flight schedule with 400 status code', async () => {
        const schedule = {
            flightId: 1,
            departureDateTime: new Date(Date.now() + 3600000),
            arrivalDateTime: new Date(Date.now() + 2 * 3600000),
            ticketPrice: -5650000,
            seatAvailability: 72,
            seatClass: 'Economy',
            terminalGate: '3A'
        };

        const response = await request(server)
            .post('/schedules')
            .send(schedule)
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan ticketPrice yang Anda masukkan bernilai non-negatif.');
    });

    it('should fail to creates a flight schedule with 400 status code', async () => {
        const schedule = {
            flightId: 1,
            departureDateTime: new Date(Date.now() + 3600000),
            arrivalDateTime: new Date(Date.now() + 2 * 3600000),
            ticketPrice: 5650000,
            seatAvailability: -72,
            seatClass: 'Economy',
            terminalGate: '3A'
        };

        const response = await request(server)
            .post('/schedules')
            .send(schedule)
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan seatAvailability yang Anda masukkan bernilai non-negatif.');
    });
});

describe('PATCH /schedules/{scheduleId}', () => {
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

    it('should successfully edits a flight schedule with 200 status code', async () => {
        const response = await request(server)
            .patch('/schedules/1')
            .send({ ticketPrice: 1000000 })
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(200);

        expect(response.body.status).toBe('Success');
        expect(response.body.statusCode).toBe(200);
        expect(response.body.message).toBe('Berhasil memperbarui jadwal penerbangan.');
    });

    it('should successfully edits a flight schedule with 200 status code', async () => {
        const response = await request(server)
            .patch('/schedules/1')
            .send({ departureDateTime: '2024-12-22T00:00:00.000Z', arrivalDateTime: '2024-12-22T23:59:00.000Z' })
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(200);

        expect(response.body.status).toBe('Success');
        expect(response.body.statusCode).toBe(200);
        expect(response.body.message).toBe('Berhasil memperbarui jadwal penerbangan.');
    });

    it('should successfully edits a flight schedule with 200 status code', async () => {
        const response = await request(server)
            .patch('/schedules/1')
            .send({ departureDateTime: '2000-12-22T00:00:00.000Z' })
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(200);

        expect(response.body.status).toBe('Success');
        expect(response.body.statusCode).toBe(200);
        expect(response.body.message).toBe('Berhasil memperbarui jadwal penerbangan.');
    });

    it('should successfully edits a flight schedule with 200 status code', async () => {
        const response = await request(server)
            .patch('/schedules/1')
            .send({ arrivalDateTime: '2100-12-22T00:00:00.000Z' })
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(200);

        expect(response.body.status).toBe('Success');
        expect(response.body.statusCode).toBe(200);
        expect(response.body.message).toBe('Berhasil memperbarui jadwal penerbangan.');
    });

    it('should fail to edits a flight schedule with 401 status code', async () => {
        const response = await request(server)
            .patch('/schedules/1')
            .send({ ticketPrice: 1000000 })
            .set('Authorization', `Bearer InvalidToken`);

        expect(response.status).toBe(401);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(401);
        expect(response.body.message).toBe('Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.');
    });

    it('should fail to edits a flight schedule with 403 status code', async () => {
        const response = await request(server)
            .patch('/schedules/1')
            .send({ ticketPrice: 1000000 })
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(403);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(403);
        expect(response.body.message).toBe('Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.');
    });

    it('should fail to edits a flight schedule with 404 status code', async () => {
        const response = await request(server)
            .patch('/schedules/4040404')
            .send({})
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(404);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(404);
        expect(response.body.message).toBe('Jadwal penerbangan tidak ditemukan.');
    });

    it('should fail to edits a flight schedule with 400 status code', async () => {
        const response = await request(server)
            .patch('/schedules/abc')
            .send({})
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('scheduleId tidak valid. Pastikan scheduleId yang Anda masukkan dalam format yang benar.');
    });

    it('should fail to edits a flight schedule with 400 status code', async () => {
        const response = await request(server)
            .patch('/schedules/1')
            .send({})
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan Anda memasukkan data ke request body.');
    });

    it('should fail to edits a flight schedule with 400 status code', async () => {
        const response = await request(server)
            .patch('/schedules/1')
            .send({ id: 1, flightId: 2 })
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. id dan flightId tidak boleh diperbarui.');
    });

    it('should fail to edits a flight schedule with 400 status code', async () => {
        const response = await request(server)
            .patch('/schedules/1')
            .send({ ticketPrice: 'abc' })
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan ticketPrice yang Anda masukkan dalam format yang benar.');
    });

    it('should fail to edits a flight schedule with 400 status code', async () => {
        const response = await request(server)
            .patch('/schedules/1')
            .send({ ticketPrice: -1000000 })
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan ticketPrice yang Anda masukkan bernilai non-negatif.');
    });

    it('should fail to edits a flight schedule with 400 status code', async () => {
        const response = await request(server)
            .patch('/schedules/1')
            .send({ seatAvailability: true })
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan seatAvailability yang Anda masukkan dalam format yang benar.');
    });

    it('should fail to edits a flight schedule with 400 status code', async () => {
        const response = await request(server)
            .patch('/schedules/1')
            .send({ seatAvailability: -72 })
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan seatAvailability yang Anda masukkan bernilai non-negatif.');
    });

    it('should fail to edits a flight schedule with 400 status code', async () => {
        const response = await request(server)
            .patch('/schedules/1')
            .send({ seatClass: 124 })
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan seatClass yang Anda masukkan dalam format yang benar.');
    });

    it('should fail to edits a flight schedule with 400 status code', async () => {
        const response = await request(server)
            .patch('/schedules/1')
            .send({ seatClass: 'Ekonomi' })
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan seatClass memiliki nilai \'Economy\', \'Premium Economy\', \'Business\', atau \'First Class\'.');
    });

    it('should fail to edits a flight schedule with 400 status code', async () => {
        const response = await request(server)
            .patch('/schedules/1')
            .send({ terminalGate: 123 })
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan terminalGate yang Anda masukkan dalam format yang benar.');
    });

    it('should fail to edits a flight schedule with 400 status code', async () => {
        const response = await request(server)
            .patch('/schedules/1')
            .send({ departureDateTime: 'abcde' })
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan departureDateTime yang Anda masukkan dalam format yang benar.');
    });

    it('should fail to edits a flight schedule with 400 status code', async () => {
        const response = await request(server)
            .patch('/schedules/1')
            .send({ arrivalDateTime: 'abcde' })
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan arrivalDateTime yang Anda masukkan dalam format yang benar.');
    });

    it('should fail to edits a flight schedule with 400 status code', async () => {
        const response = await request(server)
            .patch('/schedules/1')
            .send({ arrivalDateTime: '2024-12-06T00:23:24.000Z' })
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan departureDateTime lebih awal dari arrivalDateTime.');
    });

    it('should fail to edits a flight schedule with 400 status code', async () => {
        const response = await request(server)
            .patch('/schedules/1')
            .send({ departureDateTime: '2100-12-06T00:23:24.000Z' })
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('Validasi gagal. Pastikan departureDateTime lebih awal dari arrivalDateTime.');
    });
});

describe('DELETE /schedules/{scheduleId}', () => {
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

    it('should successfully deletes a flight schedule with 200 status code', async () => {
        const response = await request(server)
            .delete('/schedules/1')
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(200);

        expect(response.body.status).toBe('Success');
        expect(response.body.statusCode).toBe(200);
        expect(response.body.message).toBe('Berhasil menghapus jadwal penerbangan.');
    });

    it('should fail to deletes a flight schedule with 401 status code', async () => {
        const response = await request(server)
            .delete('/schedules/1')
            .set('Authorization', `Bearer InvalidToken`);

        expect(response.status).toBe(401);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(401);
        expect(response.body.message).toBe('Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.');
    });

    it('should fail to deletes a flight schedule with 403 status code', async () => {
        const response = await request(server)
            .delete('/schedules/1')
            .set('Authorization', `Bearer ${buyerAccessToken}`);

        expect(response.status).toBe(403);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(403);
        expect(response.body.message).toBe('Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.');
    });

    it('should successfully deletes a flight schedule with 404 status code', async () => {
        const response = await request(server)
            .delete('/schedules/4040404')
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(404);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(404);
        expect(response.body.message).toBe('Jadwal penerbangan tidak ditemukan.');
    });

    it('should successfully deletes a flight schedule with 400 status code', async () => {
        const response = await request(server)
            .delete('/schedules/abc')
            .set('Authorization', `Bearer ${adminAccessToken}`);

        expect(response.status).toBe(400);

        expect(response.body.status).toBe('Failed');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('scheduleId tidak valid. Pastikan scheduleId yang Anda masukkan dalam format yang benar.');
    });
});