const HttpRequestError = require("../utils/error");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    // VALIDASI PENCARIAN ID SCHEDULE
    validateId: async (data) => {
        const { id } = data;

        if(!id){
            throw new HttpRequestError("scheduleId is required!", 400);
        } else if(isNaN(id)){
            throw new HttpRequestError("scheduleId must be a number!", 400);
        }

        const findSchedule = await prisma.schedule.findUnique({
            where: {
                id: parseInt(id)
            }
        });
        
        if(!findSchedule){
            throw new HttpRequestError("Schedule does not exist", 404);
        }
    },
    // VALIDASI DATA YANG AKAN DIINPUT KE TABEL SCHEDULE
    validateInputData: async (data) => {
        const {
            flightId,
            ticketPrice,
            seatAvailability,
            seatClass,
            terminalGate,
            arrivalDateTime,
            departureDateTime
        } = data;
            
        // validasi tipe data flightId sampai terminalGate
        if (typeof flightId !== 'number',
            typeof ticketPrice !== 'number',
            typeof seatAvailability !== 'number',
            typeof seatClass !== 'string',
            typeof terminalGate !== 'string'
        ) {
            throw new HttpRequestError('Invalid field data type!', 400);
        };

        const findFlight = await prisma.flight.findUnique({
            where: {
                id: parseInt(flightId)
            }
        });

        if (!findFlight) {
            throw new HttpRequestError('Flight does not exist. Schedule must be created from existing flight!', 400);
        }

        // validasi tipe data departure dan arrival date time
        if (isNaN(new Date(departureDateTime)) || isNaN(new Date(arrivalDateTime))){
            throw new HttpRequestError('departureDateTime or arrivalDateTime must be valid dates!', 400);
        };

        //validasi waktu yang lebih dulu antara departureTime dan arrivalTime
        if (new Date(departureDateTime) >= new Date(arrivalDateTime)){
            throw new HttpRequestError("departureDateTime must be earlier than arrivalDateTime!", 400);
        };

        // validasi input untuk seatClass (Economy, Premium Economy, Bussiness, First Class)
        const seatClassEnum = ['Economy', 'Premium Economy', 'Business', 'First Class'];
        if (!seatClassEnum.includes(seatClass)){
            throw new HttpRequestError("seatClass must be either Economy, Premium Economy, Business, or First Class!", 400);
        };

        // validasi nilai dari ticketPrice dan seatAvalability
        if (ticketPrice < 0) {
            throw new HttpRequestError("ticketPrice must be non-negative number!", 400);
        }

        if (seatAvailability < 0) {
            throw new HttpRequestError("seatAvailability must be non-negative number!", 400);
        }
    },

    // VALIDASI EDIT DATA
    validatePatchField: (data) => { 
        const {
            id,
            flightId,
            ticketPrice,
            seatAvailability,
            seatClass,
            terminalGate,
            arrivalDateTime,
            departureDateTime
        } = data;

        if (id || flightId) {
            throw new HttpRequestError('id or flightId must not be changed!', 400);
        }
        // validasi field yang akan diedit
        if (!ticketPrice && !seatAvailability && !seatClass && !terminalGate && !arrivalDateTime && !departureDateTime) {
            throw new HttpRequestError('At least 1 field must be modified!', 400);
        };

        if (ticketPrice && isNaN(ticketPrice)) {
            throw new HttpRequestError('ticketPrice must be a number!', 400);
        }

        if (ticketPrice && ticketPrice < 0) {
            throw new HttpRequestError('ticketPrice must be a non-negative number!', 400);
        }

        if (seatAvailability && isNaN(seatAvailability)) {
            throw new HttpRequestError('seatAvailability must be a number!', 400);
        }

        if (seatAvailability && seatAvailability < 0) {
            throw new HttpRequestError('seatAvailability must be a non-negative number!', 400);
        }

        if (seatClass && typeof seatClass !== 'string') {
            throw new HttpRequestError('seatClass must be a string!', 400);
        }

        if (terminalGate && typeof terminalGate !== 'string') {
            throw new HttpRequestError('terminalDate must be a string!', 400);
        }

        if ((departureDateTime || arrivalDateTime) && (isNaN(new Date(departureDateTime)) || isNaN(new Date(arrivalDateTime)))){
            throw new HttpRequestError('departureDateTime or arrivalDateTime must be valid dates!', 400);
        };

        if ((departureDateTime || arrivalDateTime) && (new Date(departureDateTime) >= new Date(arrivalDateTime))) {
            throw new HttpRequestError("departureDateTime must be earlier than arrivalDateTime!", 400);
        };

        const seatClassEnum = ['Economy', 'Premium Economy', 'Business', 'First Class'];
        if (seatClass && !seatClassEnum.includes(seatClass)) {
            throw new HttpRequestError("seatClass must be either Economy, Premium Economy, Business, or First Class!", 400);
        };
    }
};