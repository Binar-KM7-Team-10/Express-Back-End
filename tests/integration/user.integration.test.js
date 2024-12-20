const request = require('supertest');
const { app, server } = require('../../app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (payload, expiresIn = '7d') => {
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
    };

describe('GET User Testing', () => {
    let adminUser, validToken;

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


        adminToken = generateToken({ userId: adminUser.id, role: 'Admin' }, '7d');
        userToken = generateToken({ userId: adminUser.id, role: 'Buyer' }, '7d');
    })

    afterAll(async () => {
        //await prisma.user.deleteMany();
        await prisma.$disconnect(); 
    });

    test("GET /users successed (200)", async () => {
        const response = await request(app)
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
        const response = await request(app)
        .get(`/users/${id}`)
        .set('Authorization', `Bearer ${adminToken || userToken}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("Success");
        expect(response.body.message).toBe("Data pengguna berhasil diambil.");

        console.log(id, "<==== userId Get By Id");
    });

    test("GET /users successed but data is empty (200)", async () => {
        await prisma.user.deleteMany();

        const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`);
        
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("Success");
        expect(response.body.message).toBe("Tidak ada data pengguna yang ditemukan.");
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data).toHaveLength(0);
    });

    test("GET /users/:id failed due to invalid id (400)", async () => {
        const id = 'w';
        const response = await request(app)
        .get(`/users/${id}`)
        .set('Authorization', `Bearer ${adminToken || userToken}`);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("userId tidak valid. Pastikan userId yang Anda masukkan dalam format yang benar.");
    });

    test("GET /users/:id failed due to params.id is empty (400)", async () => {
        const id = 'w';
        const response = await request(app)
        .get(`/users/${isNaN(id)}`)
        .set('Authorization', `Bearer ${adminToken || userToken}`);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("userId tidak valid. Pastikan userId yang Anda masukkan dalam format yang benar.");
    });

    test("GET /users/:id failed due to unexisted id (404)", async () => {
        const id = 9999;
        const response = await request(app)
        .get(`/users/${id}`)
        .set('Authorization', `Bearer ${adminToken || userToken}`);

        expect(response.status).toBe(404);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Pengguna tidak ditemukan. Pastikan userId yang Anda masukkan benar.");
    });

});

// describe('POST User Testing', () => {
//     test("POST /users successed (201)", async () => {
//         const user = {
//             email: "johndoe@mail.com",
//             phoneNumber: "628123456789",
//             password: "johndoe123",
//             fullName: "John Doe",
//             role: "Buyer"
//         };

//         const response = await request(app)
//         .post('/users')
//         .send(user);

//         expect(response.statusCode).toBe(201);
//         expect(response.body.status).toBe("Success");
//         expect(response.body.message).toBe("Pengguna berhasil ditambahkan.");

//         userId = parseInt(response.body.data.user.id);
//         console.log(userId, "<==== INI userId");
//     });

//     test("POST /user failed due to invalid email (400)", async () => {
//         const user = {
//             email: "sumanto.com",
//             phoneNumber: "628123456789",
//             password:  "johndoe123",
//             fullName: "John Doe",
//             googleId: null,
//             role: 'Buyer',
//             isVerified: false
//         }

//         const response = await request(app)
//         .post('/users')
//         .send(user);

//         expect(response.status).toBe(400);
//         expect(response.body.status).toBe("Failed");
//         expect(response.body.message).toBe("Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar.");
//     });

//     test("POST /users failed due to Email already registered (409)", async () => {
//         const user = {
//             email: "johndoe@mail.com",
//             phoneNumber: "628123456789",
//             password:  "johndoe123",
//             fullName: "John Doe",
//             googleId: null,
//             role: "Buyer",
//             isVerified: false
//         }

//         const response = await request(app).post('/users').send(user);

//         expect(response.status).toBe(409);
//         expect(response.body.status).toBe("Failed");
//         expect(response.body.message).toBe("Email sudah terdaftar. Silakan gunakan email lain atau login dengan email tersebut.");
//     });
// });

// describe('PATCH User Testing', () => {
//     test("PATCH /users/:id successed (200)", async () => {
//         const id = userId;
//         const patchUser = {
//             fullName: "Rudi Tabuti",
//             email: "Rudi123@gmail.com",
//             password:  "rudi12345",
//             phoneNumber: "628123456789"
//         }

//         const response = await request(app).patch(`/users/${id}`).send(patchUser);

//         expect(response.status).toBe(200);
//         expect(response.body.status).toBe("Success");
//         expect(response.body.message).toBe("Data pengguna berhasil diperbarui.");

//         console.log(userId, "<=== Patch user success");
//         console.log(response.body.status);
//         console.log(response.body.message);
//     });

//     test("PATCH /users/:id failed due to email already registered (409)", async () => {
//         const id = userId;
//         const sameEmailUser = {
//             fullName: "John Doe",
//             email: "Rudi123@gmail.com",
//             password:  "rudi12345",
//             phoneNumber: "628123456789"
//         }

//         const response = await request(app).patch(`/users/${id}`).send(sameEmailUser);

//         expect(response.status).toBe(409);
//         expect(response.body.status).toBe("Failed");
//         expect(response.body.message).toBe("Email sudah terdaftar. Silakan gunakan email lain.");

//         console.log(userId, "<=== userId Patch Failed Email Already Registered 409");
//         console.log(response.body.status);
//         console.log(response.body.message);
//     });

//     test("PATCH /users/:id failed due to Invalid email (400)", async () => {
//         const id = userId;
//         const patchUser = {
//             fullName: "Rudi Tabuti",
//             email: "Rudi123.com",
//             password:  "rudi123",
//             phoneNumber: "628123456789"
//         }

//         const response = await request(app).patch(`/users/${id}`).send(patchUser);

//         expect(response.status).toBe(400);
//         expect(response.body.status).toBe("Failed");
//         expect(response.body.message).toBe("Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar.");

//         console.log(userId, "<=== userId patch failed invalid email 400");
//         console.log(response.body.status);
//         console.log(response.body.message);
//     });
// });

// describe('DELETE User Testing', () => {
//     test("DELETE /users/:id successed (200)", async () => {
//         const id = userId;
//         const response = await request(app).delete(`/users/${id}`);

//         expect(response.status).toBe(200);
//         expect(response.body.status).toBe("Success");
//         expect(response.body.message).toBe("Pengguna berhasil dihapus.");
//     });

//     test("DELETE /users/:id failed due to User not found (404)", async () => {
//         const id = 9999;
//         const response = await request(app).delete(`/users/${id}`);

//         expect(response.status).toBe(404);
//         expect(response.body.status).toBe("Failed");
//         expect(response.body.message).toBe("Pengguna tidak ditemukan. Pastikan userId yang Anda masukkan benar.");
//     });

//     test("DELETE /users/:id failed due to invalid id format (400)", async () => {
//         const id = 'w';
//         const response = await request(app).delete(`/users/${id}`);

//         expect(response.status).toBe(400);
//         expect(response.body.status).toBe("Failed");
//         expect(response.body.message).toBe("userId tidak valid. Pastikan userId yang Anda masukkan dalam format yang benar.");
//     })
// });





// ///////////////////////////////////////////////////////////



// describe("User Controller Test ", () => {
//     let userId;

//     //login dulu pake admin
//     // access token simpen di header
//     // req.headers.authorization = Bearer ${accessToken};

//     beforeAll(() => {
//         prisma.user.deleteMany();
//     });

//     test("GET /users successed but data is empty (200)", async () => {

//         const response = await request(app)
//         .get('/users');
        
//         expect(response.status).toBe(200);
//         expect(response.body.status).toBe("Success");
//         expect(response.body.message).toBe("Tidak ada data pengguna yang ditemukan.");
//         expect(response.body.data).toBeInstanceOf(Array);
//         expect(response.body.data).toHaveLength(0);
//     });

    

//     test("POST /users successed (201)", async () => {
//         const user = {
//             email: "johndoe@mail.com",
//             phoneNumber: "628123456789",
//             password: "johndoe123",
//             fullName: "John Doe",
//             role: "Buyer"
//         };

//         const response = await request(app)
//         .post('/users')
//         .send(user);

//         expect(response.statusCode).toBe(201);
//         expect(response.body.status).toBe("Success");
//         expect(response.body.message).toBe("Pengguna berhasil ditambahkan.");

//         userId = parseInt(response.body.data.user.id);
//         console.log(userId, "<==== INI userId");
//     });

//     test("POST /user failed due to invalid email (400)", async () => {
//         const user = {
//             email: "sumanto.com",
//             phoneNumber: "628123456789",
//             password:  "johndoe123",
//             fullName: "John Doe",
//             googleId: null,
//             role: 'Buyer',
//             isVerified: false
//         }

//         const response = await request(app)
//         .post('/users')
//         .send(user);

//         expect(response.status).toBe(400);
//         expect(response.body.status).toBe("Failed");
//         expect(response.body.message).toBe("Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar.");
//     });

//     test("POST /users failed due to Email already registered (409)", async () => {
//         const user = {
//             email: "johndoe@mail.com",
//             phoneNumber: "628123456789",
//             password:  "johndoe123",
//             fullName: "John Doe",
//             googleId: null,
//             role: "Buyer",
//             isVerified: false
//         }

//         const response = await request(app).post('/users').send(user);

//         expect(response.status).toBe(409);
//         expect(response.body.status).toBe("Failed");
//         expect(response.body.message).toBe("Email sudah terdaftar. Silakan gunakan email lain atau login dengan email tersebut.");
//     });

//     test("GET /users successed (200)", async () => {
//         const response = await request(app).get('/users');

//         expect(response.status).toBe(200);
//         expect(response.body.status).toBe("Success");
//         expect(response.body.message).toBe("Data pengguna berhasil diambil.");
//         expect(response.body.data).toBeInstanceOf(Array);

//         response.body.data.forEach(user => {
//             expect(user).toHaveProperty("id");
//             expect(user).toHaveProperty("fullName");
//             expect(user).toHaveProperty("email");
//             expect(user).toHaveProperty("phoneNumber");
//             expect(user).toHaveProperty("role");

//             expect(user.id).not.toBeNull();
//             expect(user.fullName).not.toBeNull();
//             expect(user.email).not.toBeNull();
//             expect(user.phoneNumber).not.toBeNull();
//             expect(user.role).not.toBeNull();
//         })
//     });

//     test("GET /users/:id successed (200)", async () => {
//         const id = userId;
//         const response = await request(app).get(`/users/${id}`);

//         expect(response.status).toBe(200);
//         expect(response.body.status).toBe("Success");
//         expect(response.body.message).toBe("Data pengguna berhasil diambil.");

//         console.log(userId, "<==== userId Get By Id");
//     });

//     test("GET /users/:id failed due to invalid id (400)", async () => {
//         const id = 'w';
//         const response = await request(app).get(`/users/${id}`);

//         expect(response.status).toBe(400);
//         expect(response.body.status).toBe("Failed");
//         expect(response.body.message).toBe("userId tidak valid. Pastikan userId yang Anda masukkan dalam format yang benar.");
//     });

//     test("GET /users/:id failed due to unexisted id (404)", async () => {
//         const id = 9999;
//         const response = await request(app).get(`/users/${id}`);

//         expect(response.status).toBe(404);
//         expect(response.body.status).toBe("Failed");
//         expect(response.body.message).toBe("Pengguna tidak ditemukan. Pastikan userId yang Anda masukkan benar.");
//     });

//     test("PATCH /users/:id successed (200)", async () => {
//         const id = userId;
//         const patchUser = {
//             fullName: "Rudi Tabuti",
//             email: "Rudi123@gmail.com",
//             password:  "rudi12345",
//             phoneNumber: "628123456789"
//         }

//         const response = await request(app).patch(`/users/${id}`).send(patchUser);

//         expect(response.status).toBe(200);
//         expect(response.body.status).toBe("Success");
//         expect(response.body.message).toBe("Data pengguna berhasil diperbarui.");

//         console.log(userId, "<=== Patch user success");
//         console.log(response.body.status);
//         console.log(response.body.message);
//     });

//     test("PATCH /users/:id failed due to email already registered (409)", async () => {
//         const id = userId;
//         const sameEmailUser = {
//             fullName: "John Doe",
//             email: "Rudi123@gmail.com",
//             password:  "rudi12345",
//             phoneNumber: "628123456789"
//         }

//         const response = await request(app).patch(`/users/${id}`).send(sameEmailUser);

//         expect(response.status).toBe(409);
//         expect(response.body.status).toBe("Failed");
//         expect(response.body.message).toBe("Email sudah terdaftar. Silakan gunakan email lain.");

//         console.log(userId, "<=== userId Patch Failed Email Already Registered 409");
//         console.log(response.body.status);
//         console.log(response.body.message);
//     });

//     test("PATCH /users/:id failed due to Invalid email (400)", async () => {
//         const id = userId;
//         const patchUser = {
//             fullName: "Rudi Tabuti",
//             email: "Rudi123.com",
//             password:  "rudi123",
//             phoneNumber: "628123456789"
//         }

//         const response = await request(app).patch(`/users/${id}`).send(patchUser);

//         expect(response.status).toBe(400);
//         expect(response.body.status).toBe("Failed");
//         expect(response.body.message).toBe("Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar.");

//         console.log(userId, "<=== userId patch failed invalid email 400");
//         console.log(response.body.status);
//         console.log(response.body.message);
//     });

//     test("DELETE /users/:id successed (200)", async () => {
//         const id = userId;
//         const response = await request(app).delete(`/users/${id}`);

//         expect(response.status).toBe(200);
//         expect(response.body.status).toBe("Success");
//         expect(response.body.message).toBe("Pengguna berhasil dihapus.");
//     });

//     test("DELETE /users/:id failed due to User not found (404)", async () => {
//         const id = 9999;
//         const response = await request(app).delete(`/users/${id}`);

//         expect(response.status).toBe(404);
//         expect(response.body.status).toBe("Failed");
//         expect(response.body.message).toBe("Pengguna tidak ditemukan. Pastikan userId yang Anda masukkan benar.");
//     });

//     test("DELETE /users/:id failed due to invalid id format (400)", async () => {
//         const id = 'w';
//         const response = await request(app).delete(`/users/${id}`);

//         expect(response.status).toBe(400);
//         expect(response.body.status).toBe("Failed");
//         expect(response.body.message).toBe("userId tidak valid. Pastikan userId yang Anda masukkan dalam format yang benar.");
//     })
// });

afterAll(() => {
    server.close();
});


