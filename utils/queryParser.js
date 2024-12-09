class QueryParser {
    static parseScheduleFilters(query) {
        const {
            dpCity,
            arCity,
            dpDate,
            seatClass,
            minPrice,
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
        const [adults = 0, children = 0, babies = 0] = psg ? psg.split('.').map(Number) : [undefined, undefined, undefined];
        const totalPassengers = adults + children;
    
        return {
            flight: {
                departureAirport: dpCity ? { city: dpCity } : undefined,
                arrivalAirport: arCity ? { city: arCity } : undefined,
                FlightService: facilities.length
                    ? {
                        some: {
                            service: {
                                title: { in: facilities },
                            },
                        },
                    }
                    : undefined,
            },
            seatAvailability: {
                gte: totalPassengers,
            },
            departureDateTime: dpDate
                ? {
                    gte: new Date(`${dpDate}T00:00:00Z`),
                    lte: new Date(`${dpDate}T23:59:59Z`),
                }
              : undefined,
            seatClass: seatClass || undefined,
            ticketPrice: minPrice || maxPrice
                ? { gte: parseInt(minPrice), lte: parseInt(maxPrice) || undefined }
                : undefined,
        };
    }

    static parseScheduleSort(query) {
        const { sort } = query;
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

    static parseBookingFilters(query) {
        const {userId, bookingCode, dpDate } = query;

        return {
            bookingCode : bookingCode || undefined,
            userId: userId,
            Itinerary : {
                some : {
                    Schedule : {
                        departureDateTime : dpDate ? {
                            gte : new Date(`${dpDate}T00:00:00Z`),
                            lte : new Date(`${dpDate}T23:59:59Z`),
                        } : undefined,
                    },
                },
            },
        }
    }
};



module.exports = QueryParser;