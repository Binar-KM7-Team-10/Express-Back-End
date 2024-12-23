const request = require("supertest");
const { app, server } = require("../../app");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

const generateToken = (payload, expiresIn = "7d") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const resetDatabase = async () => {
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

describe("GET /schedule/:id Testing", () => {
  let adminToken, scheduleId;

  beforeAll(async () => {
    console.log("Resetting database...");
    await resetDatabase();

    console.log("Setting up test data...");
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
    console.log("Schedule data created:", schedule);
    scheduleId = schedule.id;
    adminToken = generateToken({ userId: 1, role: "Admin" }, "7d");
  });

  afterAll(async () => {
    try {
      console.log("Cleaning up test data...");
      await resetDatabase();
      await prisma.$disconnect();
      server.close(() => {
        console.log("Server closed.");
      });
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
    console.log("Testing GET /schedules with facility 'meal'...");
  
    // Pastikan token otorisasi ada
    const response = await request(app)
      .get("/schedules?facility=meal")
      .set("Authorization", `Bearer ${adminToken}`);
  
    console.log("Response status:", response.status);
    console.log("Response body:", response.body);

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
    const response = await request(app)
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
    const response = await request(app)
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
    const response = await request(app)
      .get("/schedules?facility=invalid")
      .set("Authorization", `Bearer ${adminToken}`);
  
    expect(response.status).toBe(400); // Atau sesuaikan dengan status untuk query yang tidak valid
    expect(response.body.status).toBe("Failed");
    expect(response.body.message).toBe("Validasi gagal. Pastikan facility memiliki nilai 'wifi', 'meal', atau 'entertainment'.");
  });
  
  test("GET /schedules with dpCity, arCity, dpDate, and psg (valid data)", async () => {
    const response = await request(app)
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
    const response = await request(app)
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
    const response = await request(app)
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