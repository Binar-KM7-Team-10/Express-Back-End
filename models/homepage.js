const { PrismaClient } = require('@prisma/client');
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
                ...filters
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

        const cards = flights.map((flight) => {
            const minPrice = flight.Schedule.reduce((min, schedule) => Math.min(min, schedule.ticketPrice), Infinity);
            
            return {
                departureCity: flight.departureAirport.city.name,
                arrivalCity: flight.arrivalAirport.city.name,
                arrivalCityImageUrl: flight.arrivalAirport.city.imageUrl,
                airline: flight.airline.name,
                startDate: flight.Schedule[0]?.departureDateTime,
                endDate: flight.Schedule[flight.Schedule.length - 1]?.arrivalDateTime,
                minPrice: minPrice || null,
            };
        });

        const total = await prisma.flight.count({
            where: {
                ...filters
            }
        });

        const totalPage = Math.ceil(total / limit);

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
}

module.exports = Homepage;