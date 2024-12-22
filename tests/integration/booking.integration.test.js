const request = require('supertest');
const { app, server } = require('../../app');
const jwt = require('jsonwebtoken');
const {generateTOTP, generateSecret } = require ('../../utils/totp')
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const {generateToken} = require('../../utils/jwtHelper');
const user = require('../../validations/user');


describe('GET /schedules?psg=5.1.0', () => {
    it('should return a list of schedules based on the query', async () => {
        const response = await request(app).get('/schedules?psg=5.1.0');

        // Log response for debugging
        console.log('Response status:', response.status);
        console.log('Response body:', response.body);

        // Cek HTTP status
        expect(response.status).toBe(200);

        // Cek properti dasar respons
        expect(response.body).toHaveProperty('status', 'Success');
        expect(response.body).toHaveProperty('statusCode', 200);
        expect(response.body).toHaveProperty(
            'message',
            'Data jadwal penerbangan berhasil diambil.'
        );
        expect(response.body).toHaveProperty('pagination');
        expect(response.body.pagination).toMatchObject({
            currentPage: expect.any(Number),
            totalPage: expect.any(Number),
            count: expect.any(Number),
            total: expect.any(Number),
            hasNextPage: expect.any(Boolean),
            hasPreviousPage: expect.any(Boolean),
        });

        // Cek properti data
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('schedule');
        expect(response.body.data.schedule).toHaveProperty('outbound');
        expect(response.body.data.schedule.outbound).toBeInstanceOf(Array);
        expect(response.body.data.schedule.outbound.length).toBeGreaterThan(0);

        // Validasi properti salah satu data outbound
        const outbound = response.body.data.schedule.outbound[0];
        expect(outbound).toHaveProperty('scheduleId', expect.any(Number));
        expect(outbound).toHaveProperty('airlineName', expect.any(String));
        expect(outbound).toHaveProperty('seatClass', expect.any(String));
        expect(outbound).toHaveProperty('duration', expect.any(Number));
        expect(outbound).toHaveProperty('flightNumber', expect.any(String));
        expect(outbound).toHaveProperty('availableSeat', expect.any(Number));
        expect(outbound).toHaveProperty('price', expect.any(Number));

        expect(outbound.departure).toMatchObject({
            day: expect.any(String),
            dateTime: expect.any(String),
            city: expect.any(String),
            cityCode: expect.any(String),
            airportName: expect.any(String),
            terminalGate: expect.any(String),
        });

        expect(outbound.arrival).toMatchObject({
            day: expect.any(String),
            dateTime: expect.any(String),
            city: expect.any(String),
            cityCode: expect.any(String),
            airportName: expect.any(String),
        });

        expect(outbound.facilities).toMatchObject({
            baggage: expect.any(Number),
            cabinBaggage: expect.any(Number),
            entertainment: expect.any(Boolean),
            meal: expect.any(Boolean),
            wifi: expect.any(Boolean),
        });
    });
});