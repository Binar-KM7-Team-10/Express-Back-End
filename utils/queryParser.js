const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class QueryParser {
    static async parseScheduleFilters(query) {
        const {
            dpCity,
            arCity,
            dpDate,
            seatClass,
            minPrice = 0,
            maxPrice,
            psg,
            facility
        } = query;

        const facilityMapping = {
            entertainment: "In-Flight Entertainment",
            meal: "In-Flight Meal",
            wifi: "WiFi",
        };

        const facilities = facility ? facility.split('.').map(f => facilityMapping[f]).filter(Boolean) : [];
        const [adults = 0, children = 0] = psg ? psg.split('.').map(Number) : [undefined, undefined];
        const totalPassengers = adults + children;

        // WARNING!!!
        // Below if-else block is such a shenanigans
        // that you might lose thousand strands of hairs
        // But it works ¯\_(ツ)_/¯, nvm it does not work
        // Oops, it works now, don't touch it

        let dpCityId, arCityId;
        if (!dpCity & !arCity) {
            dpCityId = undefined;
            arCityId = undefined;
        } else if (dpCity || arCity) {
            let dpData = await prisma.city.findFirst({
                where: {
                    name: dpCity
                }
            });

            if (dpData === null) {
                dpData = {};
                dpData.id = -1;
            }

            let arData = await prisma.city.findFirst({
                where: {
                    name: arCity
                }
            });

            if (arData === null) {
                arData = {};
                arData.id = -1;
            }

            dpCityId = dpCity ? dpData.id : undefined;
            arCityId = arCity ? arData.id : undefined;
        }
    
        return {
            flight: {
                departureAirport: dpCity ? {
                    cityId: dpCityId
                } : undefined,
                arrivalAirport: arCity ? {
                    cityId: arCityId
                } : undefined,
                AND: facilities.length ? facilities.map(f => ({
                    FlightService: {
                        some: {
                            service: {
                                title: f
                            }
                        }
                    }
                })) : undefined,
            },
            seatAvailability: {
                gte: totalPassengers,
            },
            departureDateTime: dpDate ? {
                    gte: new Date(`${dpDate}T00:00:00Z`),
                    lte: new Date(`${dpDate}T23:59:59Z`),
            } : undefined,
            seatClass: seatClass || undefined,
            ticketPrice: minPrice || maxPrice ? {
                gte: parseInt(minPrice),
                lte: parseInt(maxPrice) || undefined
            } : undefined
        };
    }

    static parseScheduleSort(query) {
        const { sort = 'dpTime' } = query;
        const orderBy = {};

        switch (sort) {
            case 'price':
                orderBy.ticketPrice = 'asc';
                break;
            case '-price':
                orderBy.ticketPrice = 'desc';
                break;
            case 'duration':
                orderBy.duration = 'asc';
                break;
            case '-duration':
                orderBy.duration = 'desc';
                break;
            case 'dpTime':
                orderBy.departureDateTime = 'asc';
                break;
            case '-dpTime':
                orderBy.departureDateTime = 'desc';
                break;
            case 'arTime':
                orderBy.arrivalDateTime = 'asc';
                break;
            case '-arTime':
                orderBy.arrivalDateTime = 'desc';
                break;
        }

        return orderBy;
    }
};

module.exports = QueryParser;