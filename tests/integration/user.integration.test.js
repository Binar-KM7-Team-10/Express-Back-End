const request = require('supertest');
const { server, job } = require('../../app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

const generateToken = (payload, expiresIn = '7d') => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

describe('GET /users & GET /users/{userId}', () => {
    let adminUser, buyerUser;

    beforeAll(async () => {
        adminUser = await prisma.user.create({
            data: {
                email: "admin@mail.com",
                phoneNumber: "628144124265",
                password: await bcrypt.hash('admin123', 10),
                fullName: "Admin Cuy",
                role: "Admin"
            }
        });

        buyerUser = await prisma.user.create({
            data: {
                email: "johndoe@mail.com",
                phoneNumber: "628144123213",
                password: await bcrypt.hash('johndoe123', 10),
                fullName: "John Doe",
                role: "Buyer"
            }
        });

        adminToken = generateToken({ userId: adminUser.id, role: 'Admin' }, '7d');
        userToken = generateToken({ userId: buyerUser.id, role: 'Buyer' }, '7d');
    });

    afterAll(async () => {
        await prisma.user.deleteMany();
        await resetDatabase();
        await prisma.$disconnect(); 
        server.close();
        if (job) {
            job.cancel();
        }
    });

    test("GET /users successed (200)", async () => {
        const response = await request(server)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("Success");
        expect(response.body.message).toBe("Data pengguna berhasil diambil.");
        expect(response.body.data).toBeInstanceOf(Array);

        response.body.data.forEach(user => {
            expect(user).toHaveProperty("id");
            expect(user).toHaveProperty("fullName");
            expect(user).toHaveProperty("email");
            expect(user).toHaveProperty("phoneNumber");
            expect(user).toHaveProperty("role");

            expect(user.id).not.toBeNull();
            expect(user.fullName).not.toBeNull();
            expect(user.email).not.toBeNull();
            expect(user.phoneNumber).not.toBeNull();
            expect(user.role).not.toBeNull();
        })
    });

    test("GET /users/:id successed (200)", async () => {
        const id =  adminUser.id;
        const response = await request(server)
        .get(`/users/${id}`)
        .set('Authorization', `Bearer ${adminToken || userToken}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("Success");
        expect(response.body.message).toBe("Data pengguna berhasil diambil.");

        //console.log(id, "<==== userId Get By Id");
    });

    test("GET /users successed but data is empty (200)", async () => {
        await prisma.user.deleteMany();

        const response = await request(server)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`);
        
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("Success");
        expect(response.body.message).toBe("Tidak ada data pengguna yang ditemukan.");
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data).toHaveLength(0);
    });

    test("GET /users failed due to no authorization headers (401)", async () => {
        const response = await request(server)
        .get('/users')

        expect(response.status).toBe(401);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.");
    });

    test("GET /users failed due to invalid token (401)", async () => {
        const response = await request(server)
        .get('/users')
        .set('Authorization', `Bearer ${null}`);

        expect(response.status).toBe(401);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.");
    });

    test("GET /users/:id failed due to no authorization headers (401)", async () => {
        const id =  adminUser.id;
        const response = await request(server)
        .get(`/users/${id}`)

        expect(response.status).toBe(401);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.");

        // console.log(id, "<==== userId Get By Id");
    });

    test("GET /users failed due to role isn't admin (403)", async () => {
        const response = await request(server)
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(403);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.");
    });

    test("GET /users/:id failed due to invalid token (401)", async () => {
        const id =  adminUser.id;
        const response = await request(server)
        .get(`/users/${id}`)
        .set('Authorization', `Bearer ${null}`);

        expect(response.status).toBe(401);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.");

        // console.log(id, "<==== userId Get By Id");
    });

    test("GET /users/:id failed due to invalid role (403)", async () => {
        const invalidToken = generateToken({ userId: adminUser.id, role: 'Intruder' }, '7d');
        const id =  adminUser.id;
        const response = await request(server)
        .get(`/users/${id}`)
        .set('Authorization', `Bearer ${invalidToken}`);

        expect(response.status).toBe(403);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.");

    });

    test("GET /users/:id failed due to invalid id (400)", async () => {
        const id = 'w';
        const response = await request(server)
        .get(`/users/${id}`)
        .set('Authorization', `Bearer ${adminToken || userToken}`);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("userId tidak valid. Pastikan userId yang Anda masukkan dalam format yang benar.");
    });

    test("GET /users/:id failed due to unexisted id (404)", async () => {
        const id = 9999;
        const response = await request(server)
        .get(`/users/${id}`)
        .set('Authorization', `Bearer ${adminToken || userToken}`);

        expect(response.status).toBe(404);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Pengguna tidak ditemukan. Pastikan userId yang Anda masukkan benar.");
    });

});

describe('POST /users', () => {
    let adminUser, buyerUser;

    beforeAll(async () => {
        adminUser = await prisma.user.create({
            data: {
                email: "admin@mail.com",
                phoneNumber: "628144124265",
                password: await bcrypt.hash('admin123', 10),
                fullName: "Admin Cuy",
                role: "Admin"
            }
        });

        buyerUser = await prisma.user.create({
            data: {
                email: "milos123@mail.com",
                phoneNumber: "628144123111",
                password: await bcrypt.hash('milos123', 10),
                fullName: "Ricardo Milos",
                role: "Buyer"
            }
        });


        adminToken = generateToken({ userId: adminUser.id, role: 'Admin' }, '7d');
        userToken = generateToken({ userId: buyerUser.id, role: 'Buyer' }, '7d');
    });

    afterAll(async () => {
        await prisma.user.deleteMany();
        await resetDatabase();
        await prisma.$disconnect();
        server.close();
        if (job) {
            job.cancel();
        }
    });

    test("POST /users successed (201)", async () => {
        const user = {
            email: "johndoe@mail.com",
            phoneNumber: "628123456789",
            password: "johndoe123",
            fullName: "John Doe",
            role: "Buyer"
        };

        const response = await request(server)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(user);

        expect(response.statusCode).toBe(201);
        expect(response.body.status).toBe("Success");
        expect(response.body.message).toBe("Pengguna berhasil ditambahkan.");

        // userId = parseInt(response.body.data.user.id);
        // console.log(userId, "<==== INI userId");
    });

    test("POST /users failed due to no authorization headers (401)", async () => {
        const user = {
            email: "johndoe@mail.com",
            phoneNumber: "628123456789",
            password: "johndoe123",
            fullName: "John Doe",
            role: "Buyer"
        };

        const response = await request(server)
        .post('/users')
        .send(user);

        expect(response.statusCode).toBe(401);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.");

    });

    test("POST /users failed due to invalid token (401)", async () => {
        const user = {
            email: "johndoe@mail.com",
            phoneNumber: "628123456789",
            password: "johndoe123",
            fullName: "John Doe",
            role: "Buyer"
        };

        const response = await request(server)
        .post('/users')
        .set('Authorization', `Bearer ${null}`)
        .send(user);

        expect(response.statusCode).toBe(401);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.");

    });

    test("POST /users failed due to role isn't admin (403)", async () => {
        const user = {
            email: "johndoe@mail.com",
            phoneNumber: "628123456789",
            password: "johndoe123",
            fullName: "John Doe",
            role: "Buyer"
        };

        const response = await request(server)
        .post('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send(user);

        expect(response.statusCode).toBe(403);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.");

    });

    test("POST /users failed due to one of the req.body is empty (400)", async () => {
        const user = {
            email: null,
            phoneNumber: "628123456789",
            password: "johndoe123",
            fullName: "John Doe",
            role: "Buyer"
        };

        const response = await request(server)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(user);

        expect(response.statusCode).toBe(400);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Validasi gagal. Pastikan fullName, email, phoneNumber, password, dan role telah diisi.");

    });

    test("POST /users failed due to email, phone number, password, fullname, or role must be a string (400)", async () => {
        const user = {
            email: 123,
            phoneNumber: "628123456789",
            password: "johndoe123",
            fullName: "John Doe",
            role: "Buyer"
        };

        const response = await request(server)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(user);

        expect(response.statusCode).toBe(400);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Validasi gagal. email, phoneNumber, fullName, password, googleId, dan role harus berupa string.");

    });

    test("POST /users failed due to phone number must be start with '628' (400)", async () => {
        const user = {
            email: "doejohn@mail.com",
            phoneNumber: "0001234567893765437322",
            password: "johndoe123",
            fullName: "John Doe",
            role: "Buyer"
        };

        const response = await request(server)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(user);

        expect(response.statusCode).toBe(400);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Validasi gagal. Nomor telepon harus dimulai dengan '628' dan memiliki panjang 11-15 digit.");

    });

    test("POST /users failed due to phone number is already registered (409)", async () => {
        const user = {
            email: "doejohn@mail.com",
            phoneNumber: "628123456789",
            password: "johndoe123",
            fullName: "John Doe",
            role: "Buyer"
        };

        const response = await request(server)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(user);

        expect(response.statusCode).toBe(409);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Nomor telepon sudah terdaftar. Silakan gunakan nomor telepon lain.");

    });

    test("POST /users failed due to password length is invalid (400)", async () => {
        const user = {
            email: "doejohn@mail.com",
            phoneNumber: "628123456987",
            password: "john",
            fullName: "John Doe",
            role: "Buyer"
        };

        const response = await request(server)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(user);

        expect(response.statusCode).toBe(400);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Validasi gagal. password harus memiliki 8 hingga 70 digit.");

    });

    test("POST /users failed due to role isn't 'Admin' or 'Buyer' (400)", async () => {
        const user = {
            email: "doejohn@mail.com",
            phoneNumber: "628123456987",
            password: "john098765",
            fullName: "Doe John",
            role: "User"
        };

        const response = await request(server)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(user);

        expect(response.statusCode).toBe(400);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Validasi gagal. Pastikan role memiliki nilai \'Buyer\' atau \'Admin\'.");

    });

    test("POST /user failed due to invalid email (400)", async () => {
        const user = {
            email: "sumanto.com",
            phoneNumber: "628123456789",
            password:  "johndoe123",
            fullName: "John Doe",
            googleId: null,
            role: 'Buyer',
            isVerified: false
        }

        const response = await request(server)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(user);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar.");
    });

    test("POST /users failed due to Email already registered (409)", async () => {
        const user = {
            email: "johndoe@mail.com",
            phoneNumber: "628123456789",
            password:  "johndoe123",
            fullName: "John Doe",
            googleId: null,
            role: "Buyer",
            isVerified: false
        }

        const response = await request(server).post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(user);

        expect(response.status).toBe(409);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Email sudah terdaftar. Silakan gunakan email lain atau login dengan email tersebut.");
    });
});

describe('PATCH /users', () => {
    let adminUser, user;

    beforeAll(async () => {
        adminUser = await prisma.user.create({
            data: {
                email: "admin@mail.com",
                phoneNumber: "628144124265",
                password: await bcrypt.hash('admin123', 10),
                fullName: "Admin Ganteng",
                role: "Admin"
            }
        });

        user = await prisma.user.create({
            data: {
                email: "johndoe@mail.com",
                phoneNumber: "628144441652",
                password: await bcrypt.hash('johndoe123', 10),
                fullName: "John Doe",
                role: "Buyer"
            }
        });

        adminToken = generateToken({ id: adminUser.id, role: 'Admin' }, '7d');
        userToken = generateToken({ id: user.id, role: 'Buyer' }, '7d');
        // console.log(user, '<=== INI DATA USER');
    });

    afterAll(async () => {
        await prisma.user.deleteMany();
        await resetDatabase();
        await prisma.$disconnect();
        server.close();
        if (job) {
            job.cancel();
        }
    });

    test("PATCH /users/:id failed due to input are empty (400)", async () => {
        const id = user.id;
        const patchUser = {
            email: null,
            phoneNumber: null,
            password: null,
            fullName: null,
        }

        const response = await request(server)
        .patch(`/users/${id}`)
        .send(patchUser)
        .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Validasi gagal. Pastikan terdapat paling tidak satu field untuk diubah.");

        // console.log(id, "<=== Patch user success");
        // console.log(response.body.status);
        // console.log(response.body.message);
    });

    test("PATCH /users/:id failed due to email already registered (409)", async () => {
        // console.log(user, "<=== INI DATA USER SEBELUM")
        const id = user.id;
        const sameEmailUser = {
            fullName: "Rudi Tabuti",
            email: "admin@mail.com",
            password:  "rudi12345",
            phoneNumber: "628123456789"
        }

        const response = await request(server)
        .patch(`/users/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(sameEmailUser);

        expect(response.status).toBe(409);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Email sudah terdaftar. Silakan gunakan email lain.");

        // console.log(user, "<=== INI DATA USER SETELAH")
    });

    test("PATCH /users/:id failed due to phone number already registered (409)", async () => {
        const id = user.id;
        const patchUser = {
            fullName: "Rudi Tabuti",
            email: "Rudi123@gmail.com",
            password:  "rudi12345",
            phoneNumber: "628144124265"
        }

        const response = await request(server)
        .patch(`/users/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(patchUser);

        expect(response.status).toBe(409);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Nomor telepon sudah terdaftar. Silakan gunakan nomor telepon lain.");

        // console.log(id, "<=== Patch user failed");
        // console.log(patchUser, "<=== DATA SETELAH")
    });

    test("PATCH /users/:id successed (200)", async () => {
        const id = user.id;
        const patchUser = {
            fullName: "Rudi Tabuti",
            email: "Tabuti123@gmail.com",
            password:  "rudi12345",
            phoneNumber: "628123456789"
        }

        const response = await request(server)
        .patch(`/users/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(patchUser);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("Success");
        expect(response.body.message).toBe("Data pengguna berhasil diperbarui.");

        // console.log(id, "<=== Patch user success");
        // console.log(patchUser, "<=== DATA SETELAH")
    });

    test("PATCH /users/:id failed due to no authorization headers (401)", async () => {
        const id = user.id;
        const patchUser = {
            fullName: "Rudi Tabuti",
            email: "Tabuti123@gmail.com",
            password:  "rudi12345",
            phoneNumber: "628123456789"
        }

        const response = await request(server)
        .patch(`/users/${id}`)
        .send(patchUser);

        expect(response.status).toBe(401);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.");

    });

    test("PATCH /users/:id failed due to invalid token (401)", async () => {
        const id = user.id;
        const patchUser = {
            fullName: "Rudi Tabuti",
            email: "Tabuti123@gmail.com",
            password:  "rudi12345",
            phoneNumber: "628123456789"
        }

        const response = await request(server)
        .patch(`/users/${id}`)
        .set('Authorization', `Bearer ${null}`)
        .send(patchUser);

        expect(response.status).toBe(401);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.");

    });

    test("PATCH /users/:id failed due to modified field isn't a string (400)", async () => {
        const id = user.id;
        const patchUser = {
            fullName: 911,
            email: "Rudi123.com",
            password:  "rudi123",
            phoneNumber: "628123456789"
        }

        const response = await request(server)
        .patch(`/users/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(patchUser);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Validasi gagal. email, phoneNumber, fullName, dan password harus berupa string.");
    });

    test("PATCH /users/:id failed due to phone number isn't starts with '628' (400)", async () => {
        const id = user.id;
        const patchUser = {
            fullName: "Rudi Tabuti",
            email: "Rudi123@mail.com",
            password:  "rudi123",
            phoneNumber: "000123"
        }

        const response = await request(server)
        .patch(`/users/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(patchUser);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Validasi gagal. Nomor telepon harus dimulai dengan '628' dan memiliki panjang 11-15 digit.");
    });

    test("PATCH /users/:id failed due to Invalid email (400)", async () => {
        const id = user.id;
        const patchUser = {
            fullName: "Rudi Tabuti",
            email: "Rudi123.com",
            password:  "rudi123",
            phoneNumber: "628123456789"
        }

        const response = await request(server)
        .patch(`/users/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(patchUser);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar.");

        // console.log(id, "<=== userId patch failed invalid email 400");
        // console.log(response.body.status);
        // console.log(response.body.message);
    });

    test("PATCH /users/:id failed due to password length is invalid (400)", async () => {
        const id = user.id;
        const patchUser = {
            fullName: "Rudi Tabuti",
            email: "Boboiboy@mail.com",
            password:  "rudi1",
            phoneNumber: "628123477677"
        }

        const response = await request(server)
        .patch(`/users/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(patchUser);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Validasi gagal. password harus memiliki 8 hingga 70 digit.");
    });
});

describe('DELETE /users', () => {
    let adminUser, buyerUser;

    beforeAll(async () => {
        adminUser = await prisma.user.create({
            data: {
                email: "admin@mail.com",
                phoneNumber: "628144124265",
                password: await bcrypt.hash('admin123', 10),
                fullName: "Admin Cuy",
                role: "Admin"
            }
        });

        buyerUser = await prisma.user.create({
            data: {
                email: "milos123@mail.com",
                phoneNumber: "628144123111",
                password: await bcrypt.hash('milos123', 10),
                fullName: "Ricardo Milos",
                role: "Buyer"
            }
        });

        adminToken = generateToken({ userId: adminUser.id, role: 'Admin' }, '7d');
        userToken = generateToken({ userId: buyerUser.id, role: 'Buyer' }, '7d');
    });

    afterAll(async () => {
        await prisma.user.deleteMany();
        await resetDatabase();
        await prisma.$disconnect();
        server.close();
        if (job) {
            job.cancel();
        }
    });

    test("DELETE /users/:id failed due to User not found (404)", async () => {
        const id = 9999;
        const response = await request(server)
        .delete(`/users/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(404);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Pengguna tidak ditemukan. Pastikan userId yang Anda masukkan benar.");
    });

    test("DELETE /users/:id failed due to invalid id format (400)", async () => {
        const id = 'w';
        const response = await request(server)
        .delete(`/users/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("userId tidak valid. Pastikan userId yang Anda masukkan dalam format yang benar.");
    })

    test("DELETE /users/:id failed due to no authorization headers (401)", async () => {
        const id = adminUser.id;
        const response = await request(server)
        .delete(`/users/${id}`)

        expect(response.status).toBe(401);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.");
    });

    test("DELETE /users/:id failed due to invalid token (401)", async () => {
        const id = adminUser.id;
        const response = await request(server)
        .delete(`/users/${id}`)
        .set('Authorization', `Bearer ${null}`);

        expect(response.status).toBe(401);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.");
    });

    test("DELETE /users/:id failed due to role isn't admin (403)", async () => {
        const id = buyerUser.id;
        const response = await request(server)
        .delete(`/users/${id}`)
        .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(403);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.");
    });

    test("DELETE /users/:id successed (200)", async () => {
        const id = adminUser.id;
        const response = await request(server)
        .delete(`/users/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("Success");
        expect(response.body.message).toBe("Pengguna berhasil dihapus.");
    });
});