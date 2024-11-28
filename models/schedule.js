const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Schedule {
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
                                cityCode: true
                            }
                        },
                        arrivalAirport: {
                            select: {
                                name: true,
                                cityCode: true
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
                cityCode: schedule.flight.departureAirport.cityCode,
                airportName: schedule.flight.departureAirport.name,
                terminalGate: schedule.terminalGate
            },
            arrival: {
                day: daysOfWeek[schedule.arrivalDateTime.getDay()],
                dateTime: schedule.arrivalDateTime,
                cityCode: schedule.flight.arrivalAirport.cityCode,
                airportName: schedule.flight.arrivalAirport.name
            },
            facilities: {
                baggage: baggage.maxBaggageWeight,
                cabinBaggage: baggage.maxCabinBaggageWeight,
                entertainment: services.includes('In-Flight Entertainment'),
                meal: services.includes('In-Flight Meal'),
                wifi: services.includes('WiFi')
            }
        };
    }

    static async getAllDTO() {
        const schedules = await prisma.schedule.findMany({
            skip: 0,
            take: 10,
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
                                cityCode: true
                            }
                        },
                        arrivalAirport: {
                            select: {
                                name: true,
                                cityCode: true
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

        const data = await Promise.all(
            schedules.map(async (schedule) => {
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
                        cityCode: schedule.flight.departureAirport.cityCode,
                        airportName: schedule.flight.departureAirport.name,
                        terminalGate: schedule.terminalGate
                    },
                    arrival: {
                        day: daysOfWeek[schedule.arrivalDateTime.getDay()],
                        dateTime: schedule.arrivalDateTime,
                        cityCode: schedule.flight.arrivalAirport.cityCode,
                        airportName: schedule.flight.arrivalAirport.name
                    },
                    facilities: {
                        baggage: baggage.maxBaggageWeight,
                        cabinBaggage: baggage.maxCabinBaggageWeight,
                        entertainment: services.includes('In-Flight Entertainment'),
                        meal: services.includes('In-Flight Meal'),
                        wifi: services.includes('WiFi')
                    }
                };
            })
        );

        return data;
    }
};

module.exports = Schedule;