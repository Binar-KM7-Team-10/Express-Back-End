const { PrismaClient } = require('@prisma/client');
const HttpRequestError = require('../utils/error');
const prisma = new PrismaClient();

class Homepage {
    static async findMany(query) {
        const {
            page = 1,
            continent = 'All'
        } = query;

        const limit = 5;
        const currentPage = parseInt(page);
        const offset = (currentPage - 1) * limit;

        const filters = continent !== 'All' ? {
            arrivalAirport: {
                city: {
                    continent: continent
                }
            }
        } : {};

        const flights = await prisma.flight.findMany({
            skip: offset,
            take: limit,
            where: {
                ...filters,
                Schedule: {
                    some: {}
                }
            },
            include: {
                departureAirport: {
                    include: {
                        city: true,
                    },
                },
                arrivalAirport: {
                    include: {
                        city: true,
                    },
                },
                airline: true,
                Schedule: {
                    select: {
                        departureDateTime: true,
                        arrivalDateTime: true,
                        ticketPrice: true,
                    },
                },
            },
            orderBy: {
                id: "asc", // Order by flight ID or customize
            },
        });

        flights.sort((a, b) => new Date(a.Schedule.departureDateTime) - new Date(b.Schedule.departureDateTime));

        const cards = flights.map((flight) => {
            const sortedSchedule = flight.Schedule.sort((a, b) => new Date(a.departureDateTime) - new Date(b.departureDateTime));
            const minPrice = flight.Schedule.reduce((min, schedule) => Math.min(min, schedule.ticketPrice), Infinity);

            return {
                departureCity: flight.departureAirport.city.name,
                arrivalCity: flight.arrivalAirport.city.name,
                arrivalCityImageUrl: flight.arrivalAirport.city.imageUrl,
                airline: flight.airline.name,
                startDate: sortedSchedule[0]?.departureDateTime,
                endDate: sortedSchedule[sortedSchedule.length - 1]?.arrivalDateTime,
                minPrice: minPrice || null,
            };
        });

        const total = await prisma.flight.count({
            where: {
                ...filters,
                Schedule: {
                    some: {}
                }
            }
        });

        const totalPage = Math.ceil(total / limit);

        if (totalPage !== 0 && totalPage < page) {
            throw new HttpRequestError('Validasi gagal. Pastikan page tidak melebih total halaman.', 400);
        }

        return {
            pagination: {
                currentPage,
                totalPage,
                count: cards.length,
                total,
                hasNextPage: currentPage < totalPage,
                hasPreviousPage: currentPage > 1
            },
            data: {
                cards
            }
        };
    }
    static async getCities() {
        try {
          const cities = await prisma.city.findMany();
          return cities;
        } catch (error) {
          console.error("Error:", error);
          return error;
        }
      }
}

module.exports = Homepage;