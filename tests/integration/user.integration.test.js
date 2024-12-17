// const request = require('supertest');
// const app = require('../../app'); // Your main app file
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// describe('User Module Integration Tests', () => {
//   let adminToken;
//   let userId;

//   beforeAll(async () => {
//     const admin = await prisma.user.create({
//       data: {
//         email: 'admin@example.com',
//         password: await bcrypt.hash('admin123', 10),
//         fullName: 'Admin User',
//         phoneNumber: '6281234567890',
//         role: 'Admin',
//       },
//     });

//     const loginResponse = await request(app).post('/auth/login').send({
//       email: 'admin@example.com',
//       password: 'admin123',
//     });

//     adminToken = loginResponse.body.data.token;
//   });

//   afterAll(async () => {
//     // Clean up test data
//     await prisma.user.deleteMany();
//     await prisma.$disconnect();
//   });

//   test('Should get all users', async () => {
//     const res = await request(app)
//       .get('/users')
//       .set('Authorization', `Bearer ${adminToken}`);

//     expect(res.statusCode).toBe(200);
//     expect(res.body.status).toBe('Success');
//     expect(Array.isArray(res.body.data)).toBe(true);
//   });

//   test('Should create a new user', async () => {
//     const res = await request(app)
//       .post('/users')
//       .set('Authorization', `Bearer ${adminToken}`)
//       .send({
//         fullName: 'Test User',
//         email: 'testuser@example.com',
//         phoneNumber: '6281122334455',
//         password: 'password123',
//         role: 'Buyer',
//       });

//     expect(res.statusCode).toBe(201);
//     expect(res.body.status).toBe('Success');
//     userId = res.body.data.user.id;
//   });

//   test('Should get user by ID', async () => {
//     const res = await request(app)
//       .get(`/users/${userId}`)
//       .set('Authorization', `Bearer ${adminToken}`);

//     expect(res.statusCode).toBe(200);
//     expect(res.body.status).toBe('Success');
//     expect(res.body.data.id).toBe(userId);
//   });

//   test('Should update user details', async () => {
//     const res = await request(app)
//       .patch(`/users/${userId}`)
//       .set('Authorization', `Bearer ${adminToken}`)
//       .send({
//         fullName: 'Updated User',
//         phoneNumber: '6281231231234',
//       });

//     expect(res.statusCode).toBe(200);
//     expect(res.body.status).toBe('Success');
//     expect(res.body.data.user.fullName).toBe('Updated User');
//   });

//   test('Should delete user', async () => {
//     const res = await request(app)
//       .delete(`/users/${userId}`)
//       .set('Authorization', `Bearer ${adminToken}`);

//     expect(res.statusCode).toBe(200);
//     expect(res.body.status).toBe('Success');
//   });
// });
