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

const resetDatabaseSchedule = async () => {
    const tables = [
        "Schedule",
        "Baggage",
        "Flight",
        "Airport",
        "City",
        "Airline",
        "FlightService",
    ];
    for (const table of tables) {
        await prisma.$executeRawUnsafe(
            `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`
        );
    }
};

describe("GET /schedules & GET /schedules/{scheduleId} Testing", () => {
    let adminToken, scheduleId;

    beforeAll(async () => {
        await resetDatabaseSchedule();
        const flight = await prisma.flight.create({
            data: {
                flightNumber: "TEST123",
                departureAirport: {
                    create: {
                        name: "Departure Airport",
                        iataCode: "DEP",
                        city: {
                            create: {
                                name: "Departure City",
                                code: "DPC",
                                country: "Country",
                                continent: "Continent",
                            },
                        },
                    },
                },
                arrivalAirport: {
                    create: {
                        name: "Arrival Airport",
                        iataCode: "ARR",
                        city: {
                            create: {
                                name: "Arrival City",
                                code: "ARC",
                                country: "Country",
                                continent: "Continent",
                            },
                        },
                    },
                },
                airline: {
                    create: {
                        name: "Test Airline",
                        country: "Test Country",
                        iataCode: "TA",
                    },
                },
                Baggage: {
                    create: {
                        maxBaggageWeight: 20,
                        maxCabinBaggageWeight: 7,
                    },
                },
            },
        });

        await prisma.service.createMany({
            data: [
                { title: "meal" },
                { title: "wifi" },
                { title: "entertainment" },
            ],
        });
        await prisma.flightService.createMany({
            data: [
                { flightId: flight.id, serviceId: 1 },
                { flightId: flight.id, serviceId: 2 },
                { flightId: flight.id, serviceId: 3 },
            ],
        });

        const schedule = await prisma.schedule.create({
            data: {
                flightId: flight.id,
                departureDateTime: new Date("2024-12-22T10:00:00Z"),
                arrivalDateTime: new Date("2024-12-22T12:00:00Z"),
                duration: 120,
                ticketPrice: 100,
                seatAvailability: 50,
                seatClass: "Economy",
                terminalGate: "A1",
            },
        });
        scheduleId = schedule.id;
        adminToken = generateToken({ userId: 1, role: "Admin" }, "7d");
    });

    afterAll(async () => {
        try {
            await resetDatabaseSchedule();
            await prisma.$disconnect();
            server.close();
            if (job) {
                job.cancel();
            }
        } catch (error) {
            console.error("Error during cleanup:", error);
        }
    });
    test("GET /schedules with psg query success (200)", async () => {
        const response = await request(server)
            .get(`/schedules?psg=5.1.0`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("Success");
        expect(response.body.message).toBe(
            "Data jadwal penerbangan berhasil diambil."
        );

        const outboundSchedules = response.body.data.schedule.outbound;
        expect(outboundSchedules).toBeInstanceOf(Array);

        outboundSchedules.forEach((schedule) => {
            expect(schedule).toHaveProperty("scheduleId");
            expect(schedule).toHaveProperty("availableSeat");
            expect(schedule.availableSeat).toBeGreaterThanOrEqual(5);
        });
    });
    test("GET /schedules with invalid psg query (400)", async () => {
        const response = await request(server)
            .get(`/schedules?psg=abc`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty("status", "Failed");
        expect(response.body).toHaveProperty(
            "message",
            "Validasi gagal. Pastikan psg yang Anda masukkan dalam format yang benar."
        );
        expect(response.body).not.toHaveProperty("data");
    });

    test("GET /schedules/:id success (200)", async () => {

        const response = await request(server)
            .get(`/schedules/${scheduleId}`)
            .set("Authorization", `Bearer ${adminToken}`);


        expect(response.status).toBe(200);
        expect(response.body.status).toBe("Success");
        expect(response.body.message).toBe(
            "Berhasil mendapatkan data jadwal penerbangan."
        );
        expect(response.body.data).toHaveProperty("scheduleId", scheduleId);
        expect(response.body.data).toHaveProperty("airlineName", "Test Airline");
        expect(response.body.data).toHaveProperty("flightNumber", "TEST123");
        expect(response.body.data).toHaveProperty("departure");
        expect(response.body.data.departure).toHaveProperty(
            "city",
            "Departure City"
        );
        expect(response.body.data.departure).toHaveProperty(
            "airportName",
            "Departure Airport"
        );
        expect(response.body.data).toHaveProperty("arrival");
        expect(response.body.data.arrival).toHaveProperty("city", "Arrival City");
        expect(response.body.data.arrival).toHaveProperty(
            "airportName",
            "Arrival Airport"
        );
        expect(response.body.data.facilities).toHaveProperty("baggage", 20);
        expect(response.body.data.facilities).toHaveProperty("cabinBaggage", 7);
    });
    test("GET /schedules/:id failed with invalid schedule ID", async () => {

        const response = await request(server)
            .get(`/schedules/abc`)
            .set("Authorization", `Bearer ${adminToken}`);


        expect(response.status).toBe(400);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe(
            "scheduleId tidak valid. Pastikan scheduleId yang Anda masukkan dalam format yang benar."
        );
    });
    test("GET /schedules/:id failed with schedule not found", async () => {

        const response = await request(server)
            .get(`/schedules/2`)
            .set("Authorization", `Bearer ${adminToken}`);


        expect(response.status).toBe(404);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Jadwal penerbangan tidak ditemukan.");
    });

    describe("GET /schedules Testing", () => {
        test("GET /schedules success (200)", async () => {

            const response = await request(server)
                .get(`/schedules`)
                .set("Authorization", `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.status).toBe("Success");
            expect(response.body.message).toBe(
                "Data jadwal penerbangan berhasil diambil."
            );

            expect(response.body.data).toHaveProperty("schedule");
            expect(response.body.data.schedule).toHaveProperty("outbound");
            expect(response.body.data.schedule.outbound).toBeInstanceOf(Array);
            expect(response.body.data.schedule.outbound.length).toBeGreaterThan(0);

            response.body.data.schedule.outbound.forEach((schedule) => {
                expect(schedule).toHaveProperty("scheduleId");
                expect(schedule).toHaveProperty("flightNumber");
                expect(schedule).toHaveProperty("airlineName");
                expect(schedule).toHaveProperty("departure");
                expect(schedule.departure).toHaveProperty("city");
                expect(schedule.departure).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("arrival");
                expect(schedule.arrival).toHaveProperty("city");
                expect(schedule.arrival).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("facilities");
                expect(schedule.facilities).toHaveProperty("baggage");
                expect(schedule.facilities).toHaveProperty("cabinBaggage");
            });
        });
        test("GET /schedules with pagination (200)", async () => {

            const response = await request(server)
                .get(`/schedules?page=1`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe("Success");
            expect(response.body.message).toBe(
                "Data jadwal penerbangan berhasil diambil."
            );

            expect(response.body.data).toHaveProperty("schedule");
            expect(response.body.data.schedule).toHaveProperty("outbound");
            expect(response.body.data.schedule.outbound).toBeInstanceOf(Array); // 
            expect(response.body.data.schedule.outbound.length).toBeGreaterThan(0);

            response.body.data.schedule.outbound.forEach((schedule) => {
                expect(schedule).toHaveProperty("scheduleId");
                expect(schedule).toHaveProperty("flightNumber");
                expect(schedule).toHaveProperty("airlineName");
                expect(schedule).toHaveProperty("departure");
                expect(schedule.departure).toHaveProperty("city");
                expect(schedule.departure).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("arrival");
                expect(schedule.arrival).toHaveProperty("city");
                expect(schedule.arrival).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("facilities");
                expect(schedule.facilities).toHaveProperty("baggage");
                expect(schedule.facilities).toHaveProperty("cabinBaggage");
            });
        });
        test("GET /schedules with pagination failed", async () => {

            const response = await request(server)
                .get(`/schedules?page=abc`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("Failed");
            expect(response.body.message).toBe(
                "Query parameter tidak valid. Pastikan parameter yang diberikan sesuai dengan format yang benar."
            );

            expect(response.body).not.toHaveProperty("data");
        });
        test("GET /schedules with page out of total page", async () => {

            const response = await request(server)
                .get(`/schedules?page=100`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("Failed");
            expect(response.body.message).toBe(
                "Validasi gagal. Nomor page yang Anda masukkan tidak tersedia."
            );

            // Pastikan response.body.data adalah null atau undefined karena error
            expect(response.body).not.toHaveProperty("data");
        });
        test("GET /schedules with dpDate success (200)", async () => {

            const response = await request(server)
                .get("/schedules?dpDate=2024-12-22")
                .set("Authorization", `Bearer ${adminToken}`);

            // Validasi status response
            expect(response.status).toBe(200);
            expect(response.body.status).toBe("Success");
            expect(response.body.message).toBe(
                "Data jadwal penerbangan berhasil diambil."
            );

            // Validasi bahwa data memiliki properti schedule
            expect(response.body.data).toHaveProperty("schedule");
            expect(response.body.data.schedule).toHaveProperty("outbound");
            expect(response.body.data.schedule.outbound).toBeInstanceOf(Array);
            expect(response.body.data.schedule.outbound.length).toBeGreaterThan(0);

            // Validasi struktur data outbound
            response.body.data.schedule.outbound.forEach((schedule) => {
                expect(schedule).toHaveProperty("scheduleId");
                expect(schedule).toHaveProperty("flightNumber");
                expect(schedule).toHaveProperty("airlineName");
                expect(schedule).toHaveProperty("departure");
                expect(schedule.departure).toHaveProperty("city");
                expect(schedule.departure).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("arrival");
                expect(schedule.arrival).toHaveProperty("city");
                expect(schedule.arrival).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("facilities");
                expect(schedule.facilities).toHaveProperty("baggage");
                expect(schedule.facilities).toHaveProperty("cabinBaggage");
            });
        });

        test("GET /schedules with dpDate failed (400)", async () => {

            const response = await request(server)
                .get("/schedules?dpDate=04-12-2024")
                .set("Authorization", `Bearer ${adminToken}`);

            // Validasi status response
            expect(response.status).toBe(400);
            expect(response.body.status).toBe("Failed");
            expect(response.body.message).toBe(
                "Validasi gagal. Pastikan dpDate atau retDate yang Anda masukkan dalam format yang benar (YYYY-MM-DD)."
            );

            // Pastikan bahwa respons tidak memiliki properti 'data'
            expect(response.body).not.toHaveProperty("data");
        });

        test("[Success] Retrieves all flight schedules (empty data, with dpDate)", async () => {

            const response = await request(server)
                .get("/schedules?dpDate=2025-12-22")
                .set("Authorization", `Bearer ${adminToken}`);

            // Validasi status response
            expect(response.status).toBe(200);
            expect(response.body.status).toBe("Success");
            expect(response.body.statusCode).toBe(200);
            expect(response.body.message).toBe(
                "Tidak ada data jadwal penerbangan yang tersedia"
            );

            // Validasi struktur data
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(0); // Memastikan data kosong
        });
        test("GET /schedules with dpCity succsess (200)", async () => {

            const response = await request(server)
                .get("/schedules?dpCity=Departure City")
                .set("Authorization", `Bearer ${adminToken}`);
            // Validasi status response
            expect(response.status).toBe(200);
            expect(response.body.status).toBe("Success");
            expect(response.body.message).toBe(
                "Data jadwal penerbangan berhasil diambil."
            );

            // Validasi bahwa data memiliki properti schedule
            expect(response.body.data).toHaveProperty("schedule");
            expect(response.body.data.schedule).toHaveProperty("outbound");
            expect(response.body.data.schedule.outbound).toBeInstanceOf(Array);
            expect(response.body.data.schedule.outbound.length).toBeGreaterThan(0);

            // Validasi struktur data outbound
            response.body.data.schedule.outbound.forEach((schedule) => {
                expect(schedule).toHaveProperty("scheduleId");
                expect(schedule).toHaveProperty("flightNumber");
                expect(schedule).toHaveProperty("airlineName");
                expect(schedule).toHaveProperty("departure");
                expect(schedule.departure).toHaveProperty("city");
                expect(schedule.departure).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("arrival");
                expect(schedule.arrival).toHaveProperty("city");
                expect(schedule.arrival).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("facilities");
                expect(schedule.facilities).toHaveProperty("baggage");
                expect(schedule.facilities).toHaveProperty("cabinBaggage");
            });
        });
        test("GET /schedules failed with invalid dpCity", async () => {

            const response = await request(server)
                .get(`/schedules?dpCity=123`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("Failed");
            expect(response.body.message).toBe(
                "Query parameter tidak valid. Pastikan parameter yang diberikan sesuai dengan format yang benar."
            );

            expect(response.body).not.toHaveProperty("data");
        });
        test("GET /schedules with dpCity and arCity succsess (200)", async () => {

            const response = await request(server)
                .get("/schedules?dpCity=Departure City&arCity=Arrival City")
                .set("Authorization", `Bearer ${adminToken}`);


            expect(response.status).toBe(200);
            expect(response.body.status).toBe("Success");
            expect(response.body.message).toBe(
                "Data jadwal penerbangan berhasil diambil."
            );

            expect(response.body.data).toHaveProperty("schedule");
            expect(response.body.data.schedule).toHaveProperty("outbound");
            expect(response.body.data.schedule.outbound).toBeInstanceOf(Array);
            expect(response.body.data.schedule.outbound.length).toBeGreaterThan(0);

            response.body.data.schedule.outbound.forEach((schedule) => {
                expect(schedule).toHaveProperty("scheduleId");
                expect(schedule).toHaveProperty("flightNumber");
                expect(schedule).toHaveProperty("airlineName");
                expect(schedule).toHaveProperty("departure");
                expect(schedule.departure).toHaveProperty("city");
                expect(schedule.departure).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("arrival");
                expect(schedule.arrival).toHaveProperty("city");
                expect(schedule.arrival).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("facilities");
                expect(schedule.facilities).toHaveProperty("baggage");
                expect(schedule.facilities).toHaveProperty("cabinBaggage");
            });
        });
        test("GET /schedules min price success(200)", async () => {

            const response = await request(server)
                .get("/schedules?schedules?minPrice=101")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe("Success");
            expect(response.body.message).toBe(
                "Data jadwal penerbangan berhasil diambil."
            );

            expect(response.body.data).toHaveProperty("schedule");
            expect(response.body.data.schedule).toHaveProperty("outbound");
            expect(response.body.data.schedule.outbound).toBeInstanceOf(Array);
            expect(response.body.data.schedule.outbound.length).toBeGreaterThan(0);

            response.body.data.schedule.outbound.forEach((schedule) => {
                expect(schedule).toHaveProperty("scheduleId");
                expect(schedule).toHaveProperty("flightNumber");
                expect(schedule).toHaveProperty("airlineName");
                expect(schedule).toHaveProperty("departure");
                expect(schedule.departure).toHaveProperty("city");
                expect(schedule.departure).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("arrival");
                expect(schedule.arrival).toHaveProperty("city");
                expect(schedule.arrival).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("facilities");
                expect(schedule.facilities).toHaveProperty("baggage");
                expect(schedule.facilities).toHaveProperty("cabinBaggage");
            });
        });
        test("GET /schedules min price success return empty data (200)", async () => {
            const response = await request(server)
                .get("/schedules?minPrice=15000000")
                .set("Authorization", `Bearer ${adminToken}`);


            expect(response.status).toBe(200);
            expect(response.body.status).toBe("Success");
            expect(response.body.statusCode).toBe(200);
            expect(response.body.message).toBe(
                "Tidak ada data jadwal penerbangan yang tersedia"
            );

            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(0);
        });

        test("GET /schedules with invalid min price", async () => {
            const response = await request(server)
                .get(`/schedules?minPrice=abc`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("Failed");
            expect(response.body.message).toBe(
                "Query parameter tidak valid. Pastikan parameter yang diberikan sesuai dengan format yang benar."
            );
            expect(response.body).not.toHaveProperty("data");
        });

        test("GET /schedules max price success(200)", async () => {
            const response = await request(server)
                .get("/schedules?maxPrice=2000000")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe("Success");
            expect(response.body.message).toBe(
                "Data jadwal penerbangan berhasil diambil."
            );

            expect(response.body.data).toHaveProperty("schedule");
            expect(response.body.data.schedule).toHaveProperty("outbound");
            expect(response.body.data.schedule.outbound).toBeInstanceOf(Array);
            expect(response.body.data.schedule.outbound.length).toBeGreaterThan(0);

            response.body.data.schedule.outbound.forEach((schedule) => {
                expect(schedule).toHaveProperty("scheduleId");
                expect(schedule).toHaveProperty("flightNumber");
                expect(schedule).toHaveProperty("airlineName");
                expect(schedule).toHaveProperty("departure");
                expect(schedule.departure).toHaveProperty("city");
                expect(schedule.departure).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("arrival");
                expect(schedule.arrival).toHaveProperty("city");
                expect(schedule.arrival).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("facilities");
                expect(schedule.facilities).toHaveProperty("baggage");
                expect(schedule.facilities).toHaveProperty("cabinBaggage");
            });
        });
        test("GET /schedules max price success return empty data (200)", async () => {
            const response = await request(server)
                .get("/schedules?maxPrice=10")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe("Success");
            expect(response.body.statusCode).toBe(200);
            expect(response.body.message).toBe(
                "Tidak ada data jadwal penerbangan yang tersedia"
            );

            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(0);
        });

        test("GET /schedules with invalid max price", async () => {

            const response = await request(server)
                .get(`/schedules?maxPrice=abc`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("Failed");
            expect(response.body.message).toBe(
                "Query parameter tidak valid. Pastikan parameter yang diberikan sesuai dengan format yang benar."
            );
            expect(response.body).not.toHaveProperty("data");
        });
        test("GET /schedules with min and max price success(200)", async () => {

            const response = await request(server)
                .get("/schedules?minPrice=50&maxPrice=150")
                .set("Authorization", `Bearer ${adminToken}`);


            // Validasi status response
            expect(response.status).toBe(200);
            expect(response.body.status).toBe("Success");
            expect(response.body.message).toBe(
                "Data jadwal penerbangan berhasil diambil."
            );

            // Validasi bahwa data memiliki properti schedule
            expect(response.body.data).toHaveProperty("schedule");
            expect(response.body.data.schedule).toHaveProperty("outbound");
            expect(response.body.data.schedule.outbound).toBeInstanceOf(Array);
            expect(response.body.data.schedule.outbound.length).toBeGreaterThan(0);

            // Validasi struktur data outbound
            response.body.data.schedule.outbound.forEach((schedule) => {
                expect(schedule).toHaveProperty("scheduleId");
                expect(schedule).toHaveProperty("flightNumber");
                expect(schedule).toHaveProperty("airlineName");
                expect(schedule).toHaveProperty("departure");
                expect(schedule.departure).toHaveProperty("city");
                expect(schedule.departure).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("arrival");
                expect(schedule.arrival).toHaveProperty("city");
                expect(schedule.arrival).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("facilities");
                expect(schedule.facilities).toHaveProperty("baggage");
                expect(schedule.facilities).toHaveProperty("cabinBaggage");
            });
        });
        test("GET /schedules with minPrice, maxPrice, and sort by price ascending", async () => {


            const response = await request(server)
                .get("/schedules?minPrice=50&maxPrice=150&sort=price")
                .set("Authorization", `Bearer ${adminToken}`);


            expect(response.status).toBe(200);
            expect(response.body.status).toBe("Success");
            expect(response.body.message).toBe(
                "Data jadwal penerbangan berhasil diambil."
            );


            expect(response.body.data).toHaveProperty("schedule");
            expect(response.body.data.schedule).toHaveProperty("outbound");
            expect(response.body.data.schedule.outbound).toBeInstanceOf(Array);
            expect(response.body.data.schedule.outbound.length).toBeGreaterThan(0);

            response.body.data.schedule.outbound.forEach((schedule) => {
                expect(schedule).toHaveProperty("scheduleId");
                expect(schedule).toHaveProperty("flightNumber");
                expect(schedule).toHaveProperty("airlineName");
                expect(schedule).toHaveProperty("departure");
                expect(schedule.departure).toHaveProperty("city");
                expect(schedule.departure).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("arrival");
                expect(schedule.arrival).toHaveProperty("city");
                expect(schedule.arrival).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("facilities");
                expect(schedule.facilities).toHaveProperty("baggage");
                expect(schedule.facilities).toHaveProperty("cabinBaggage");
            });
        });
        test("GET /schedules with minPrice, maxPrice, and sort by  by invalid param", async () => {

            const response = await request(server)
                .get("/schedules?minPrice=50&maxPrice=150&sort=invalid")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("Failed");
            expect(response.body.message).toBe(
                "Validasi gagal. Pastikan sort memiliki nilai 'price', '-price', 'duration', '-duration', 'dpTime', '-dpTime', 'arTime', atau '-arTime'."
            );
        });
        test("GET /schedules with dpDate & sort by dpTime ascending", async () => {


            const response = await request(server)
                .get("/schedules?dpDate=2024-12-22&sort=dpTime")
                .set("Authorization", `Bearer ${adminToken}`);

            // Validasi status response
            expect(response.status).toBe(200);
            expect(response.body.status).toBe("Success");
            expect(response.body.message).toBe(
                "Data jadwal penerbangan berhasil diambil."
            );

            // Validasi bahwa data memiliki properti schedule
            expect(response.body.data).toHaveProperty("schedule");
            expect(response.body.data.schedule).toHaveProperty("outbound");
            expect(response.body.data.schedule.outbound).toBeInstanceOf(Array);
            expect(response.body.data.schedule.outbound.length).toBeGreaterThan(0);

            // Validasi struktur data outbound
            response.body.data.schedule.outbound.forEach((schedule) => {
                expect(schedule).toHaveProperty("scheduleId");
                expect(schedule).toHaveProperty("flightNumber");
                expect(schedule).toHaveProperty("airlineName");
                expect(schedule).toHaveProperty("departure");
                expect(schedule.departure).toHaveProperty("city");
                expect(schedule.departure).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("arrival");
                expect(schedule.arrival).toHaveProperty("city");
                expect(schedule.arrival).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("facilities");
                expect(schedule.facilities).toHaveProperty("baggage");
                expect(schedule.facilities).toHaveProperty("cabinBaggage");
            });
        });
        test("GET /schedules with dpDate & sort by dpTime ascending", async () => {

            const response = await request(server)
                .get("/schedules?dpDate=2024-12-22&sort=-dpTime")
                .set("Authorization", `Bearer ${adminToken}`);



            // Validasi status response
            expect(response.status).toBe(200);
            expect(response.body.status).toBe("Success");
            expect(response.body.message).toBe(
                "Data jadwal penerbangan berhasil diambil."
            );

            // Validasi bahwa data memiliki properti schedule
            expect(response.body.data).toHaveProperty("schedule");
            expect(response.body.data.schedule).toHaveProperty("outbound");
            expect(response.body.data.schedule.outbound).toBeInstanceOf(Array);
            expect(response.body.data.schedule.outbound.length).toBeGreaterThan(0);

            // Validasi struktur data outbound
            response.body.data.schedule.outbound.forEach((schedule) => {
                expect(schedule).toHaveProperty("scheduleId");
                expect(schedule).toHaveProperty("flightNumber");
                expect(schedule).toHaveProperty("airlineName");
                expect(schedule).toHaveProperty("departure");
                expect(schedule.departure).toHaveProperty("city");
                expect(schedule.departure).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("arrival");
                expect(schedule.arrival).toHaveProperty("city");
                expect(schedule.arrival).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("facilities");
                expect(schedule.facilities).toHaveProperty("baggage");
                expect(schedule.facilities).toHaveProperty("cabinBaggage");
            });
        });
        test("GET /schedules with dpDate & sort by arTime ascending", async () => {


            const response = await request(server)
                .get("/schedules?dpDate=2024-12-22&sort=arTime")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe("Success");
            expect(response.body.message).toBe(
                "Data jadwal penerbangan berhasil diambil."
            );
            expect(response.body.data.schedule).toHaveProperty("outbound");
            expect(response.body.data.schedule.outbound).toBeInstanceOf(Array);
            expect(response.body.data.schedule.outbound.length).toBeGreaterThan(0);

            // Validasi struktur data outbound
            response.body.data.schedule.outbound.forEach((schedule) => {
                expect(schedule).toHaveProperty("scheduleId");
                expect(schedule).toHaveProperty("flightNumber");
                expect(schedule).toHaveProperty("airlineName");
                expect(schedule).toHaveProperty("departure");
                expect(schedule.departure).toHaveProperty("city");
                expect(schedule.departure).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("arrival");
                expect(schedule.arrival).toHaveProperty("city");
                expect(schedule.arrival).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("facilities");
                expect(schedule.facilities).toHaveProperty("baggage");
                expect(schedule.facilities).toHaveProperty("cabinBaggage");
            });
        });
        test("GET /schedules with dpDate & sort by arTime descending", async () => {


            const response = await request(server)
                .get("/schedules?dpDate=2024-12-22&sort=-arTime")
                .set("Authorization", `Bearer ${adminToken}`);


            expect(response.status).toBe(200);
            expect(response.body.status).toBe("Success");
            expect(response.body.message).toBe(
                "Data jadwal penerbangan berhasil diambil."
            );

            expect(response.body.data).toHaveProperty("schedule");
            expect(response.body.data.schedule).toHaveProperty("outbound");
            expect(response.body.data.schedule.outbound).toBeInstanceOf(Array);
            expect(response.body.data.schedule.outbound.length).toBeGreaterThan(0);

            // Validasi struktur data outbound
            response.body.data.schedule.outbound.forEach((schedule) => {
                expect(schedule).toHaveProperty("scheduleId");
                expect(schedule).toHaveProperty("flightNumber");
                expect(schedule).toHaveProperty("airlineName");
                expect(schedule).toHaveProperty("departure");
                expect(schedule.departure).toHaveProperty("city");
                expect(schedule.departure).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("arrival");
                expect(schedule.arrival).toHaveProperty("city");
                expect(schedule.arrival).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("facilities");
                expect(schedule.facilities).toHaveProperty("baggage");
                expect(schedule.facilities).toHaveProperty("cabinBaggage");
            });
        });
        test("GET /schedules with dpDate & sort by duration ascending", async () => {

            const response = await request(server)
                .get("/schedules?dpDate=2024-12-22&sort=duration")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe("Success");
            expect(response.body.message).toBe(
                "Data jadwal penerbangan berhasil diambil."
            );

            // Validasi bahwa data memiliki properti schedule
            expect(response.body.data).toHaveProperty("schedule");
            expect(response.body.data.schedule).toHaveProperty("outbound");
            expect(response.body.data.schedule.outbound).toBeInstanceOf(Array);
            expect(response.body.data.schedule.outbound.length).toBeGreaterThan(0);

            // Validasi struktur data outbound
            response.body.data.schedule.outbound.forEach((schedule) => {
                expect(schedule).toHaveProperty("scheduleId");
                expect(schedule).toHaveProperty("flightNumber");
                expect(schedule).toHaveProperty("airlineName");
                expect(schedule).toHaveProperty("departure");
                expect(schedule.departure).toHaveProperty("city");
                expect(schedule.departure).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("arrival");
                expect(schedule.arrival).toHaveProperty("city");
                expect(schedule.arrival).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("facilities");
                expect(schedule.facilities).toHaveProperty("baggage");
                expect(schedule.facilities).toHaveProperty("cabinBaggage");
            });
        });
        test("GET /schedules with dpDate & sort by duration descending", async () => {

            const response = await request(server)
                .get("/schedules?dpDate=2024-12-22&sort=-duration")
                .set("Authorization", `Bearer ${adminToken}`);

            // Validasi status response
            expect(response.status).toBe(200);
            expect(response.body.status).toBe("Success");
            expect(response.body.message).toBe(
                "Data jadwal penerbangan berhasil diambil."
            );

            // Validasi bahwa data memiliki properti schedule
            expect(response.body.data).toHaveProperty("schedule");
            expect(response.body.data.schedule).toHaveProperty("outbound");
            expect(response.body.data.schedule.outbound).toBeInstanceOf(Array);
            expect(response.body.data.schedule.outbound.length).toBeGreaterThan(0);

            // Validasi struktur data outbound
            response.body.data.schedule.outbound.forEach((schedule) => {
                expect(schedule).toHaveProperty("scheduleId");
                expect(schedule).toHaveProperty("flightNumber");
                expect(schedule).toHaveProperty("airlineName");
                expect(schedule).toHaveProperty("departure");
                expect(schedule.departure).toHaveProperty("city");
                expect(schedule.departure).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("arrival");
                expect(schedule.arrival).toHaveProperty("city");
                expect(schedule.arrival).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("facilities");
                expect(schedule.facilities).toHaveProperty("baggage");
                expect(schedule.facilities).toHaveProperty("cabinBaggage");
            });
        });
        test("GET /schedules with with dpDate & invalid sort", async () => {

            const response = await request(server)
                .get("/schedules?dpDate=2024-12-12&sort=invalid")
                .set("Authorization", `Bearer ${adminToken}`);


            // Validasi status response
            expect(response.status).toBe(400);
            expect(response.body.status).toBe("Failed");
            expect(response.body.message).toBe(
                "Validasi gagal. Pastikan sort memiliki nilai 'price', '-price', 'duration', '-duration', 'dpTime', '-dpTime', 'arTime', atau '-arTime'."
            );
        });
        test("GET /schedules with (with seatClass)", async () => {

            const response = await request(server)
                .get("/schedules?seatClass=Economy")
                .set("Authorization", `Bearer ${adminToken}`);

            // Validasi status response
            expect(response.status).toBe(200);
            expect(response.body.status).toBe("Success");
            expect(response.body.message).toBe(
                "Data jadwal penerbangan berhasil diambil."
            );

            // Validasi bahwa data memiliki properti schedule
            expect(response.body.data).toHaveProperty("schedule");
            expect(response.body.data.schedule).toHaveProperty("outbound");
            expect(response.body.data.schedule.outbound).toBeInstanceOf(Array);
            expect(response.body.data.schedule.outbound.length).toBeGreaterThan(0);

            // Validasi struktur data outbound
            response.body.data.schedule.outbound.forEach((schedule) => {
                expect(schedule).toHaveProperty("scheduleId");
                expect(schedule).toHaveProperty("flightNumber");
                expect(schedule).toHaveProperty("airlineName");
                expect(schedule).toHaveProperty("departure");
                expect(schedule.departure).toHaveProperty("city");
                expect(schedule.departure).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("arrival");
                expect(schedule.arrival).toHaveProperty("city");
                expect(schedule.arrival).toHaveProperty("airportName");
                expect(schedule).toHaveProperty("facilities");
                expect(schedule.facilities).toHaveProperty("baggage");
                expect(schedule.facilities).toHaveProperty("cabinBaggage");
            });
        });
        test("GET /schedules with invalid seatClass", async () => {

            const response = await request(server)
                .get("/schedules?seatClass=Invalid123")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("Failed");
            expect(response.body.message).toBe(
                "Validasi gagal. Pastikan seatClass memiliki nilai 'Economy', 'Premium Economy', 'Business', atau 'First Class'."
            );
        });
    });
    test("GET /schedules with with dpDate & invalid sort", async () => {


        const response = await request(server)
            .get("/schedules?dpDate=2024-12-12&sort=invalid")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe(
            "Validasi gagal. Pastikan sort memiliki nilai 'price', '-price', 'duration', '-duration', 'dpTime', '-dpTime', 'arTime', atau '-arTime'."
        );
    });
    test("GET /schedules with valid facility query 'meal'", async () => {
        // Pastikan token otorisasi ada
        const response = await request(server)
            .get("/schedules?facility=meal")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("Success");

        if (response.body.data.length === 0) {
            expect(response.body.message).toBe(
                "Tidak ada data jadwal penerbangan yang tersedia"
            );
            return;
        }

        expect(response.body.message).toBe("Data jadwal penerbangan berhasil diambil.");
        expect(response.body.data).toHaveProperty("schedule");
        expect(response.body.data.schedule).toHaveProperty("outbound");
        expect(response.body.data.schedule.outbound).toBeInstanceOf(Array);
        expect(response.body.data.schedule.outbound.length).toBeGreaterThan(0);

        response.body.data.schedule.outbound.forEach((schedule) => {
            expect(schedule).toHaveProperty("scheduleId");
            expect(schedule).toHaveProperty("flightNumber");
            expect(schedule).toHaveProperty("airlineName");
            expect(schedule).toHaveProperty("departure");
            expect(schedule.departure).toHaveProperty("city");
            expect(schedule.departure).toHaveProperty("airportName");
            expect(schedule).toHaveProperty("arrival");
            expect(schedule.arrival).toHaveProperty("city");
            expect(schedule.arrival).toHaveProperty("airportName");
            expect(schedule).toHaveProperty("facilities");
            expect(schedule.facilities).toHaveProperty("baggage");
            expect(schedule.facilities).toHaveProperty("cabinBaggage");
        });
    });
    test("GET /schedules with facility=meal.wifi", async () => {
        const response = await request(server)
            .get("/schedules?facility=meal.wifi")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("Success");

        if (response.body.data.length === 0) {
            expect(response.body.message).toBe("Tidak ada data jadwal penerbangan yang tersedia");
            return;
        }

        expect(response.body.message).toBe("Data jadwal penerbangan berhasil diambil.");
        expect(response.body.data.schedule.outbound).toBeInstanceOf(Array);
        expect(response.body.data.schedule.outbound.length).toBeGreaterThan(0);
    });

    test("GET /schedules with facility=meal.entertainment.wifi", async () => {
        const response = await request(server)
            .get("/schedules?facility=meal.entertainment.wifi")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("Success");

        if (response.body.data.length === 0) {
            expect(response.body.message).toBe("Tidak ada data jadwal penerbangan yang tersedia");
            return;
        }

        expect(response.body.message).toBe("Data jadwal penerbangan berhasil diambil.");
        expect(response.body.data.schedule.outbound).toBeInstanceOf(Array);
        expect(response.body.data.schedule.outbound.length).toBeGreaterThan(0);
    });

    test("GET /schedules with invalid facility query", async () => {
        const response = await request(server)
            .get("/schedules?facility=invalid")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.status).toBe(400); // Atau sesuaikan dengan status untuk query yang tidak valid
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("Validasi gagal. Pastikan facility memiliki nilai 'wifi', 'meal', atau 'entertainment'.");
    });

    test("GET /schedules with dpCity, arCity, dpDate, and psg (valid data)", async () => {
        const response = await request(server)
            .get("/schedules?dpCity=Paris&arCity=Siem Reap&dpDate=2024-12-10&psg=5.1.2")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("Success");

        if (response.body.data.length === 0) {
            expect(response.body.message).toBe("Tidak ada data jadwal penerbangan yang tersedia");
            return;
        }

        expect(response.body.message).toBe("Data jadwal penerbangan berhasil diambil.");
        expect(response.body.data.schedule.outbound).toBeInstanceOf(Array);
        expect(response.body.data.schedule.outbound.length).toBeGreaterThan(0);
    });

    test("GET /schedules with all required query params but unavailable seats (empty data)", async () => {
        const response = await request(server)
            .get("/schedules?dpCity=Jakarta&arCity=Buenos Aires&dpDate=2024-12-10&psg=50.30.3")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.status).toBe(200);

        expect(response.body.status).toBe("Success");
        expect(response.body.statusCode).toBe(200);
        expect(response.body.message).toBe("Tidak ada data jadwal penerbangan yang tersedia");

        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBe(0);
    });
    test("GET /schedules with all required query params but unavailable seats (return empty data)", async () => {
        const response = await request(server)
            .get("/schedules?dpCity=Jakarta&arCity=Buenos Aires&dpDate=2024-12-10&psg=50.30.3")
            .set("Authorization", `Bearer ${adminToken}`);

        // Validasi status HTTP
        expect(response.status).toBe(200);

        // Validasi status dan pesan dari response body
        expect(response.body).toHaveProperty("status", "Success");
        expect(response.body).toHaveProperty("statusCode", 200);
        expect(response.body).toHaveProperty("message", "Tidak ada data jadwal penerbangan yang tersedia");

        // Validasi data yang kosong
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBe(0);
    });

});

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

    afterEach(async () => await resetDatabase());

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

    afterEach(async () => await resetDatabase());

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
            .send({ departureDateTime: new Date(Date.now()).toISOString(), arrivalDateTime: new Date(Date.now() + 3600000).toISOString() })
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

    afterEach(async () => await resetDatabase());

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