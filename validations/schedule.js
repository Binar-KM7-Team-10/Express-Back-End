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
    validateInputData: (data) => {
        const {
            flightId,
            duration,
            ticketPrice,
            seatAvailability,
            seatClass,
            terminalGate,
            arrivalDateTime,
            departureDateTime} = data;
            
        // validasi tipe data flightId sampai terminalGate
        if(typeof flightId !== 'number',
            typeof duration !== 'number',
            typeof ticketPrice !== 'number',
            typeof seatAvailability !== 'number',
            typeof seatClass !== 'string',
            typeof terminalGate !== 'string'
        ){
            throw new HttpRequestError('Field yang dimasukkan salah format', 400);
        };

        // validasi tipe data departure dan arrival date time
        if (isNaN(new Date(departureDateTime)) || isNaN(new Date(arrivalDateTime))){
            throw new HttpRequestError('departureDateTime and arrivalDateTime must be valid dates', 400);
        };

        //validasi waktu yang lebih dulu antara departureTime dan arrivalTime
        if (new Date(departureDateTime) >= new Date(arrivalDateTime)){
            throw new HttpRequestError("Departure time harus lebih dulu daipada arrival time", 400);
        };

        //validasi durasi dengan selisih antara departureTime dan arrivalTIme
        const selisih = (new Date(arrivalDateTime) - new Date(departureDateTime)) / (1000 * 60);
        if(duration !== selisih){
            throw new HttpRequestError("Durasi tidak sama dengan selisih dari arrivalDateTime dan departureDateTime", 400);
        };

        // validasi input untuk seatClass (Economy, Premium Economy, Bussiness, First Class)
        const seatClassEnum = ['Economy', 'Premium Economy', 'Bussiness', 'First Class'];
        if (!seatClassEnum.includes(seatClass)){
            throw new HttpRequestError("hanya untuk Economy, Premium Economy, Bussiness, First Class", 400);
        };

        // validasi nilai dari ticketPrice dan seatAvalability
        if (ticketPrice < 0) {
            throw new HttpRequestError("ticketPrice tidak boleh negatif", 400);
        }
        if (seatAvailability < 0) {
            throw new HttpRequestError("seatAvailability tidak boleh negatif", 400);
        }
    },

    // VALIDASI EDIT DATA
    validatePatchField: (data) => { 
        const { 
            flightId,
            duration,
            ticketPrice,
            seatAvailability,
            seatClass,
            terminalGate,
            arrivalDateTime,
            departureDateTime} = data;

        // validasi field yang akan diedit
        if (!flightId || !duration || !ticketPrice || !seatAvailability || !seatClass || !terminalGate || !arrivalDateTime || !departureDateTime){
            throw new HttpRequestError("Semua field yang akan diedit harus diisi", 400);
        };
    },
    // VALIDASI POST DATA
    validatePostField: (data) => {
        const {
            flightId,
            duration,
            ticketPrice,
            seatAvailability,
            seatClass,
            terminalGate,
            arrivalDateTime,
            departureDateTime} = data;

        // validasi semua field yang akan dimasukkan
        if (!flightId && !duration && !ticketPrice && !seatAvailability && !seatClass && !terminalGate && !arrivalDateTime && !departureDateTime){
            throw new HttpRequestError("Semua field yang akan dibuat harus diisi", 400);
        };
    },
    // INI MASIH KURANG YAKIN AKU BUAT YANG DELETE
    // validateDelete: (data) => {
    //     const {scheduleId, id} = data;
    //     const bookedSeats = prisma.bookedSeats.findFirst({
    //         where: {
    //             seat: {
    //                 scheduleId: scheduleId,
    //             },
    //         },
    //         include: {
    //             seat: true,
    //         },
    //     });
    //     if(bookedSeats){
    //         throw new HttpRequestError("Jadwal tidak dapat dihapus karena sudah ada yang pesan kursi");
    //     }
    // }
};