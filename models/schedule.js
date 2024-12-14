const { PrismaClient } = require('@prisma/client');
const QueryParser = require('../utils/queryParser');
const HttpRequestError = require('../utils/error');
const prisma = new PrismaClient();

class Schedule {
    static async create(data) {
        const {
            flightId,
            departureDateTime,
            arrivalDateTime,
            ticketPrice,
            seatAvailability,
            seatClass,
            terminalGate
        } = data;

        const duration = (new Date(arrivalDateTime) - new Date(departureDateTime)) / (1000 * 60);

        const schedule = await prisma.schedule.create({
            data: {
                flightId,
                departureDateTime,
                arrivalDateTime,
                duration,
                ticketPrice,
                seatAvailability,
                seatClass,
                terminalGate
            }
        });

        return schedule.id;
    }

    static async delete(id) {
        await prisma.schedule.delete({
            where: {
                id: parseInt(id)
            }
        });
    }

    static async update(id, data) {
        if (data.departureDateTime && data.arrivalDateTime) {
            data.duration = (new Date(data.arrivalDateTime) - new Date(data.departureDateTime)) / (1000 * 60);
        } else if (data.departureDateTime) {
            const { arrivalDateTime } = await prisma.schedule.findUnique({
                where: {
                    id: parseInt(id)
                }
            });
            
            data.duration = (new Date(arrivalDateTime) - new Date(data.departureDateTime)) / (1000 * 60);
        } else if (data.arrivalDateTime) {
            const { departureDateTime } = await prisma.schedule.findUnique({
                where: {
                    id: parseInt(id)
                }
            });
            
            data.duration = (new Date(data.arrivalDateTime) - new Date(departureDateTime)) / (1000 * 60);
        }

        const scheduleData = Object.fromEntries(Object.entries(data).filter(([_, value]) => value !== undefined && value !== null));

        await prisma.schedule.update({
            where: {
                id: parseInt(id)
            },
            data: scheduleData
        });
    }

    static async getAvailableSeat(id) {
        const data = await prisma.seat.findMany({
            orderBy: {
                id: 'asc'
            },
            where: {
                scheduleId: parseInt(id),
                OR: [
                    {
                        BookedSeat: null
                    },
                    {
                        BookedSeat: {
                            is: {
                                booking: {
                                    status: 'Cancelled',
                                }
                            }
                        }
                    },
                    {
                        BookedSeat: {
                            is: {
                                booking: {
                                    status: 'Unpaid',
                                    Invoice: {
                                        paymentDueDateTime: {
                                            lte: new Date(Date.now())
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            }
        });

        const result = data.map((s) => s.seatNumber);

        return result;
    }

    static async getDTO(id) {
        const schedule = await prisma.schedule.findUnique({
            where: {
                id: parseInt(id)
            },
            select: {
                id: true,
                flightId: true,
                seatClass: true,
                duration: true,
                seatAvailability: true,
                ticketPrice: true,
                terminalGate: true,
                departureDateTime: true,
                arrivalDateTime: true,
                flight: {
                    select: {
                        flightNumber: true,
                        departureAirport: {
                            select: {
                                name: true,
                                city: {
                                    select: {
                                        name: true,
                                        code: true
                                    }
                                }
                            }
                        },
                        arrivalAirport: {
                            select: {
                                name: true,
                                city: {
                                    select: {
                                        name: true,
                                        code: true
                                    }
                                }
                            }
                        },
                        airline: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        const baggage = await prisma.baggage.findUnique({
            where: {
                flightId: schedule.flightId
            },
            select: {
                maxBaggageWeight: true,
                maxCabinBaggageWeight: true
            }
        });

        const flightServices = await prisma.flightService.findMany({
            where: {
                flightId: schedule.flightId
            },
            select: {
                service: {
                    select: {
                        title: true
                    }
                }
            }
        });

        const services = flightServices.map((index) => {
            return index.service.title;
        });

        const daysOfWeek = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

        const seatData = await this.getAvailableSeat(id);

        return {
            scheduleId: schedule.id,
            airlineName: schedule.flight.airline.name,
            seatClass: schedule.seatClass,
            duration: schedule.duration,
            flightNumber: schedule.flight.flightNumber,
            availableSeat: schedule.seatAvailability,
            price: schedule.ticketPrice,
            departure: {
                day: daysOfWeek[schedule.departureDateTime.getDay()],
                dateTime: schedule.departureDateTime,
                city: schedule.flight.departureAirport.city.name,
                cityCode: schedule.flight.departureAirport.city.code,
                airportName: schedule.flight.departureAirport.name,
                terminalGate: schedule.terminalGate
            },
            arrival: {
                day: daysOfWeek[schedule.arrivalDateTime.getDay()],
                dateTime: schedule.arrivalDateTime,
                city: schedule.flight.arrivalAirport.city.name,
                cityCode: schedule.flight.arrivalAirport.city.code,
                airportName: schedule.flight.arrivalAirport.name
            },
            facilities: {
                baggage: baggage.maxBaggageWeight,
                cabinBaggage: baggage.maxCabinBaggageWeight,
                entertainment: services.includes('In-Flight Entertainment'),
                meal: services.includes('In-Flight Meal'),
                wifi: services.includes('WiFi')
            },
            seat: {
                available: seatData.length,
                map: seatData
            }
        };
    }

    static async getManyDTO(query) {
        const page = query.page ? query.page : 1; // If query page is defined, the value will follow. Otherwise, it will be 1.
        const limit = 10; // The maximum number of content in a page is always 10.
        const offset = (parseInt(page) * limit) - limit;

        const where = await QueryParser.parseScheduleFilters(query);
        const orderBy = QueryParser.parseScheduleSort(query);

        const schedules = await prisma.schedule.findMany({
            skip: offset,
            take: limit,
            where,
            orderBy,
            include: {
                flight: {
                    include: {
                        departureAirport: {
                            include: {
                                city: true
                            }
                        },
                        arrivalAirport: {
                            include: {
                                city: true
                            }
                        },
                        airline: true,
                        Baggage: true,
                        FlightService: {
                            include: {
                                service: true
                            },
                        },
                    },
                },
            },
        });

        // Total rows of schedule with given condition without pagination
        const totalItem = await prisma.schedule.count({ where });

        const pagination = {
            currentPage: parseInt(page),
            totalPage: Math.ceil(totalItem / limit),
            count: schedules.length,
            total: totalItem,
            hasNextPage: totalItem - (page * limit) > 0 ? true : false,
            hasPreviousPage: (page - 1) <= 0 ? false : true
        };

        if (totalItem !== 0 && pagination.currentPage > pagination.totalPage) {
            throw new HttpRequestError('Validasi gagal. Nomor page yang Anda masukkan tidak tersedia.', 400);
        }

        const data = schedules.map((schedule) => {
            const flightServices = schedule.flight.FlightService.map(
                (fs) => fs.service.title
            );

            const daysOfWeek = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
            const terminalGate = `${schedule.terminalGate} ${schedule.flight.flightType}`;

            return {
                scheduleId: schedule.id,
                airlineName: schedule.flight.airline.name,
                seatClass: schedule.seatClass,
                duration: schedule.duration,
                flightNumber: schedule.flight.flightNumber,
                availableSeat: schedule.seatAvailability,
                price: schedule.ticketPrice,
                departure: {
                    day: daysOfWeek[schedule.departureDateTime.getDay()],
                    dateTime: schedule.departureDateTime,
                    city: schedule.flight.departureAirport.city.name,
                    cityCode: schedule.flight.departureAirport.city.code,
                    airportName: schedule.flight.departureAirport.name,
                    terminalGate,
                },
                arrival: {
                    day: daysOfWeek[schedule.arrivalDateTime.getDay()],
                    dateTime: schedule.arrivalDateTime,
                    city: schedule.flight.arrivalAirport.city.name,
                    cityCode: schedule.flight.arrivalAirport.city.code,
                    airportName: schedule.flight.arrivalAirport.name,
                },
                facilities: {
                    baggage: schedule.flight.Baggage?.maxBaggageWeight || null,
                    cabinBaggage: schedule.flight.Baggage?.maxCabinBaggageWeight || null,
                    entertainment: flightServices.includes('In-Flight Entertainment'),
                    meal: flightServices.includes('In-Flight Meal'),
                    wifi: flightServices.includes('WiFi'),
                },
            };
        });

        return {
            pagination,
            data
        };
    }
};

module.exports = Schedule;