const HttpRequestError = require("../utils/error");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    // VALIDASI PENCARIAN ID SCHEDULE
    validateId: async (data) => {
        const { id } = data;

        if (!id){
            throw new HttpRequestError("Validasi gagal. Pastikan Anda memasukkan scheduleId.", 400);
        } else if(isNaN(id)){
            throw new HttpRequestError("scheduleId tidak valid. Pastikan scheduleId yang Anda masukkan dalam format yang benar.", 400);
        }

        const findSchedule = await prisma.schedule.findUnique({
            where: {
                id: parseInt(id)
            }
        });
        
        if(!findSchedule){
            throw new HttpRequestError("Jadwal penerbangan tidak ditemukan.", 404);
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

        if (!flightId ||
            !ticketPrice ||
            !seatAvailability ||
            !seatClass ||
            !terminalGate ||
            !arrivalDateTime ||
            !departureDateTime
        ) {
            throw new HttpRequestError('Validasi gagal. Pastikan flightId, departureDateTime, arrivalDateTime, ticketPrice, seatAvailability, seatClass, dan terminalGate telah diisi.', 400);
        }
            
        // validasi tipe data flightId sampai terminalGate
        if (typeof flightId !== 'number' ||
            typeof ticketPrice !== 'number' ||
            typeof seatAvailability !== 'number' ||
            typeof seatClass !== 'string' ||
            typeof terminalGate !== 'string' ||
            typeof departureDateTime !== 'string' ||
            typeof arrivalDateTime !== 'string'
        ) {
            throw new HttpRequestError('Validasi gagal. Pastikan data yang Anda masukkan dalam format yang benar.', 400);
        };

        const findFlight = await prisma.flight.findUnique({
            where: {
                id: parseInt(flightId)
            }
        });

        if (!findFlight) {
            throw new HttpRequestError('Jadwal penerbangan gagal dibuat. Jadwal penerbangan harus berdasarkan penerbangan yang terdaftar.', 400);
        }

        // validasi tipe data departure dan arrival date time
        if (isNaN(new Date(departureDateTime)) || isNaN(new Date(arrivalDateTime))){
            throw new HttpRequestError('Validasi gagal. Pastikan departureDateTime dan arrivalDateTime yang Anda masukkan dalam format yang benar.', 400);
        };

        //validasi waktu yang lebih dulu antara departureTime dan arrivalTime
        if (new Date(departureDateTime) >= new Date(arrivalDateTime)){
            throw new HttpRequestError("Validasi gagal. Pastikan departureDateTime lebih awal dari arrivalDateTime.", 400);
        };

        // validasi input untuk seatClass (Economy, Premium Economy, Bussiness, First Class)
        const seatClassEnum = ['Economy', 'Premium Economy', 'Business', 'First Class'];
        if (!seatClassEnum.includes(seatClass)){
            throw new HttpRequestError("Validasi gagal. Pastikan seatClass memiliki nilai \'Economy\', \'Premium Economy\', \'Business\', atau \'First Class\'.", 400);
        };

        // validasi nilai dari ticketPrice dan seatAvalability
        if (ticketPrice < 0) {
            throw new HttpRequestError("Validasi gagal. Pastikan ticketPrice yang Anda masukkan bernilai non-negatif.", 400);
        }

        if (seatAvailability < 0) {
            throw new HttpRequestError("Validasi gagal. Pastikan seatAvailability yang Anda masukkan bernilai non-negatif.", 400);
        }
    },
    // VALIDASI EDIT DATA
    validatePatchField: async (data, params) => { 
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

        const { id: scheduleId } = params;

        if (id || flightId) {
            throw new HttpRequestError('Validasi gagal. id dan flightId tidak boleh diperbarui.', 400);
        }
        // validasi field yang akan diedit
        if (!ticketPrice && !seatAvailability && !seatClass && !terminalGate && !arrivalDateTime && !departureDateTime) {
            throw new HttpRequestError('Validasi gagal. Pastikan Anda memasukkan data ke request body.', 400);
        };

        if (ticketPrice) {
            if (isNaN(ticketPrice)) {
                throw new HttpRequestError('Validasi gagal. Pastikan ticketPrice yang Anda masukkan dalam format yang benar.', 400);
            }
    
            if (ticketPrice < 0) {
                throw new HttpRequestError('Validasi gagal. Pastikan ticketPrice yang Anda masukkan bernilai non-negatif.', 400);
            }
        }

        if (seatAvailability) {
            if (isNaN(seatAvailability) || seatAvailability === true) {
                throw new HttpRequestError('Validasi gagal. Pastikan seatAvailability yang Anda masukkan dalam format yang benar.', 400);
            }
    
            if (seatAvailability < 0) {
                throw new HttpRequestError('Validasi gagal. Pastikan seatAvailability yang Anda masukkan bernilai non-negatif.', 400);
            }
        }

        if (seatClass) {
            if (seatClass && typeof seatClass !== 'string') {
                throw new HttpRequestError('Validasi gagal. Pastikan seatClass yang Anda masukkan dalam format yang benar.', 400);
            }
    
            const seatClassEnum = ['Economy', 'Premium Economy', 'Business', 'First Class'];
            if (seatClass && !seatClassEnum.includes(seatClass)) {
                throw new HttpRequestError('Validasi gagal. Pastikan seatClass memiliki nilai \'Economy\', \'Premium Economy\', \'Business\', atau \'First Class\'.', 400);
            };
        }

        if (terminalGate && typeof terminalGate !== 'string') {
            throw new HttpRequestError('Validasi gagal. Pastikan terminalGate yang Anda masukkan dalam format yang benar.', 400);
        }

        const scheduleData = await prisma.schedule.findUnique({
            where: {
                id: parseInt(scheduleId)
            }
        })

        if (departureDateTime) {
            if (isNaN(new Date(departureDateTime))){
                throw new HttpRequestError('Validasi gagal. Pastikan departureDateTime yang Anda masukkan dalam format yang benar.', 400);
            };
    
            if (new Date(departureDateTime) >= new Date(scheduleData.arrivalDateTime)) {
                throw new HttpRequestError("Validasi gagal. Pastikan departureDateTime lebih awal dari arrivalDateTime.", 400);
            };
        }

        if (arrivalDateTime) {
            if (isNaN(new Date(arrivalDateTime))){
                throw new HttpRequestError('Validasi gagal. Pastikan arrivalDateTime yang Anda masukkan dalam format yang benar.', 400);
            };
    
            if (new Date(scheduleData.departureDateTime) >= new Date(arrivalDateTime)) {
                throw new HttpRequestError("Validasi gagal. Pastikan departureDateTime lebih awal dari arrivalDateTime.", 400);
            };
        }
    },
    validateQueryParams: (data) => {
        const {
            dpCity,
            arCity,
            dpDate,
            retDate,
            psg,
            seatClass,
            airline,
            minPrice,
            maxPrice,
            sort,
            page,
            facility
        } = data;

        const sortOptions = ['price', '-price', 'duration', '-duration', 'dpTime', '-dpTime', 'arTime', '-arTime'];
        const facilityOptions = ['wifi', 'meal', 'entertainment'];
        const seatClassOptions = ['Economy', 'Premium Economy', 'Business', 'First Class'];

        if (dpCity && typeof dpCity !== 'string' ||
            dpCity && !isNaN(dpCity) ||
            arCity && typeof arCity !== 'string' ||
            arCity && !isNaN(arCity) ||
            dpDate && typeof dpDate !== 'string' ||
            retDate && typeof retDate !== 'string' ||
            psg && typeof psg !== 'string' ||
            seatClass && typeof seatClass !== 'string' ||
            seatClass && !isNaN(seatClass) ||
            airline && typeof airline !== 'string' ||
            airline && !isNaN(airline) ||
            minPrice && isNaN(minPrice) ||
            maxPrice && isNaN(maxPrice) ||
            sort && typeof sort !== 'string' ||
            sort && !isNaN(sort) ||
            page && isNaN(page) ||
            facility && typeof facility !== 'string' ||
            facility && !isNaN(facility)
        ) {
            throw new HttpRequestError('Query parameter tidak valid. Pastikan parameter yang diberikan sesuai dengan format yang benar.', 400);
        }

        if (seatClass && !seatClassOptions.includes(seatClass)) {
            throw new HttpRequestError('Validasi gagal. Pastikan seatClass memiliki nilai \'Economy\', \'Premium Economy\', \'Business\', atau \'First Class\'.', 400);
        }

        if (sort && !sortOptions.includes(sort)) {
            throw new HttpRequestError('Validasi gagal. Pastikan sort memiliki nilai \'price\', \'-price\', \'duration\', \'-duration\', \'dpTime\', \'-dpTime\', \'arTime\', atau \'-arTime\'.', 400);
        }

        if (facility && !facilityOptions.includes(facility)) {
            throw new HttpRequestError('Validasi gagal. Pastikan facility memiliki nilai \'wifi\', \'meal\', atau \'entertainment\'.', 400);
        }

        if (dpDate && !dpDate.match(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/) ||
            retDate && !retDate.match(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)
        ) {
            throw new HttpRequestError('Validasi gagal. Pastikan dpDate atau retDate yang Anda masukkan dalam format yang benar (YYYY-MM-DD).', 400);
        }

        if (psg && !psg.match(/^\d+\.\d+\.\d+$/)) {
            throw new HttpRequestError('Validasi gagal. Pastikan psg yang Anda masukkan dalam format yang benar.', 400);
        }

        if (facility && !facility.match(/^([a-zA-Z]+)(\.[a-zA-Z]+){0,2}$/)) {
            throw new HttpRequestError('Validasi gagal. Pastikan facility yang Anda masukkan dalam format yang benar.', 400);
        }

        if (page && page <= 0) {
            throw new HttpRequestError('Validasi gagal. Pastikan page yang Anda masukkan dalam format angka bernilai positif.', 400);
        }
    },
};