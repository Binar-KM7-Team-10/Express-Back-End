const HttpRequestError = require("../utils/error");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    validateQueryParams: (query) => {
        const {
            userId,
            bookingCode,
            dpDate,
            retDate
        } = query;

        if (userId && (typeof userId !== 'string' || isNaN(userId))) {
            throw HttpRequestError('userId tidak valid. Pastikan userId yang Anda masukkan dalam format yang benar.', 400);
        }

        if (bookingCode && typeof bookingCode !== 'string') {
            throw HttpRequestError('Validasi gagal. Pastikan bookingCode yang Anda masukkan dalam format yang benar.', 400);
        }

        const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

        if (dpDate && (typeof dpDate !== 'string' || !dpDate.match(dateRegex))) {
            throw new HttpRequestError('Validasi gagal. Pastikan dpDate yang Anda masukkan dalam format yang benar (YYYY-MM-DD).', 400);
        }
        
        if (retDate && (typeof retDate !== 'string' || !retDate.match(dateRegex))) {
            throw new HttpRequestError('Validasi gagal. Pastikan retDate yang Anda masukkan dalam format yang benar (YYYY-MM-DD).', 400);
        }

        if (dpDate && retDate && (new Date(dpDate) >= new Date(retDate))) {
            throw new HttpRequestError('Validasi gagal. Pastikan dpDate lebih awal daripada retDate.', 400);
        }
    },
    validataPathParams: async (params) => {
        const { id } = params;

        if (!id) {
            throw new HttpRequestError('Validasi gagal. Pastikan Anda memasukkan bookingId.', 400);
        }

        if (isNaN(id)) {
            throw new HttpRequestError('bookingId tidak valid. Pastikan bookingId yang Anda masukkan dalam format yang benar.', 400);
        }

        const bookingData = await prisma.booking.findUnique({
            where: {
                id: parseInt(id)
            }
        });

        if (!bookingData) {
            throw new HttpRequestError('Riwayat pemesanan tidak ditemukan.', 404);
        }
    },
    validatePostData: async (data) => {
        const {
            itinerary,
            passenger,
            seat
        } = data;

        if (!itinerary || !passenger || !seat) {
            throw new HttpRequestError('Validasi gagal. Pastikan itinerary, passenger, dan seat telah diisi.', 400);
        }

        if (!itinerary.hasOwnProperty('journeyType') ||
            !itinerary.hasOwnProperty('outbound') ||
            !itinerary.hasOwnProperty('inbound')
        ) {
            throw new HttpRequestError('Validasi gagal. Pastikan itinerary memiliki properti journeyType, outbound, dan inbound.', 400);
        }

        if (!passenger.hasOwnProperty('total') ||
            !passenger.hasOwnProperty('adult') ||
            !passenger.hasOwnProperty('child') ||
            !passenger.hasOwnProperty('baby') ||
            !passenger.hasOwnProperty('data')
        ){
            throw new HttpRequestError('Validasi gagal. Pastikan passenger memiliki properi total, adult, child, baby, dan data.', 400);
        }

        if (!seat.hasOwnProperty('outbound') || !seat.hasOwnProperty('inbound')) {
            throw new HttpRequestError('Validasi gagal. Pastikan seat memiliki properti outbound dan inbound.', 400);
        }

        if (typeof itinerary.journeyType !== 'string' ||
            typeof itinerary.outbound !== 'string' ||
            isNaN(itinerary.outbound) ||
            typeof itinerary.inbound !== 'string' ||
            isNaN(itinerary.inbound)
        ) {
            throw new HttpRequestError('Validasi gagal. Pastikan itinerary.journeyType, itinerary.outbound, dan itinerary.inbound yang Anda masukkan dalam format yang benar.', 400);
        }

        const journeyTypeOptions = ['One-way', 'Round-trip'];
        if (!journeyTypeOptions.includes(itinerary.journeyType)) {
            throw new HttpRequestError('Validasi gagal. Pastikan itinerary.journeyType yang Anda masukkan memiliki nilai \'One-way\' atau \'Round-trip\'.', 400);
        }
        
        const outboundSchedule = await prisma.schedule.findUnique({
            where: {
                id: itinerary.outbound
            }
        });

        const inboundSchedule = await prisma.schedule.findUnique({
            where: {
                id: itinerary.inbound ? itinerary.inbound : -1
            }
        });

        if (!outboundSchedule) {
            throw new HttpRequestError('Validasi gagal. Pastikan itinerary.outbound memiliki nilai scheduleId yang ada.', 400);
        }

        if (itinerary.journeyType === 'Round-trip') {
            if (itinerary.inbound === null) {
                throw new HttpRequestError('Validasi gagal. Pastikan Anda memasukkan jadwal penerbangan kepulangan (outbound) pada rencana penerbangan Round-trip.', 400);
            }

            if (!inboundSchedule) {
                throw new HttpRequestError('Validasi gagal. Pastikan itinerary.outbound memiliki nilai scheduleId yang ada.', 400);
            }
        }

        if (typeof passenger.total !== 'string' ||
            isNaN(passenger.total) ||
            passenger.total < 0 ||
            typeof passenger.adult !== 'string' ||
            isNaN(passenger.adult) ||
            passenger.adult < 0 ||
            typeof passenger.child !== 'string' ||
            isNaN(passenger.child) ||
            passenger.child < 0 ||
            typeof passenger.baby !== 'string' ||
            isNaN(passenger.baby) ||
            passenger.baby < 0
        ) {
            throw new HttpRequestError('Validasi gagal. Pastikan passenger.total, passenger.adult, passenger.child, dan passenger.baby yang Anda masukkan dalam format yang benar.', 400);
        }

        if (passenger.total !== (parseInt(passenger.adult) + parseInt(passenger.child))) {
            throw new HttpRequestError('Validasi gagal. Pastikan passenger.total memiliki nilai jumlah dari passenger.adult dan passenger.child.', 400);
        }

        if (passenger.data.length !== (parseInt(passenger.total) + parseInt(passenger.baby))) {
            throw new HttpRequestError('Validasi gagal. Pastikan passenger.data memiliki jumlah data passenger.total ditambah passenger.baby.', 400);
        }

        passenger.data.map((p) => {
            const ageGroupOptions = ['Adult', 'Child', 'Baby'];
            if (!p.ageGroup || typeof p.ageGroup !== 'string' || !ageGroupOptions.includes(p.ageGroup)) {
                throw new HttpRequestError('Validasi gagal. Pastikan ageGroup pada passenger.data yang Anda masukkan dalam format yang benar dan memiliki nilai \'Adult\', \'Child\', atau \'Baby\'.', 400);
            }

            if (p.ageGroup !== 'Baby') {
                if (!p.label || typeof p.label !== 'string' || !p.label.match(/^P([1-9]|[1-6][0-9]|7[0-2])$/)) {
                    throw new HttpRequestError('Validasi gagal. Pastikan label pada passenger.data yang Anda masukkan dalam format yang benar.', 400);
                }

                const titleOptions = ['Mr.', 'Master', 'Mrs.', 'Miss.', 'Ms.'];
                if (!p.title || typeof p.title !== 'string' || !titleOptions.includes(p.title)) {
                    throw new HttpRequestError('Validasi gagal. Pastikan title pada passenger.data yang Anda masukkan dalam format yang benar dan memiliki nilai \'Mr.\', \'Master\', \'Mrs.\', \'Miss.\', atau \'Ms.\'.', 400);
                }

                if (!p.fullName || typeof p.fullName !== 'string' || !isNaN(p.fullName)) {
                    throw new HttpRequestError('Validasi gagal. Pastikan fullName pada passenger.data yang Anda masukkan dalam format yang benar.', 400);
                }

                if (p.familyName && (typeof p.familyName !== 'string' || !isNaN(p.familyName))) {
                    throw new HttpRequestError('Validasi gagal. Pastikan familyName pada passenger.data yang Anda masukkan dalam format yang benar.', 400);
                }

                if (!p.birthDate || typeof p.birthDate !== 'string' || !p.birthDate.match(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)) {
                    throw new HttpRequestError('Validasi gagal. Pastikan birthDate pada passenger.data yang Anda masukkan dalam format yang benar (YYYY-MM-DD).', 400);
                }

                if (!p.nationality || typeof p.nationality !== 'string' || !isNaN(p.nationality)) {
                    throw new HttpRequestError('Validasi gagal. Pastikan nationality pada passenger.data yang Anda masukkan dalam format yang benar.', 400);
                }

                if (!p.identityNumber || typeof p.identityNumber !== 'string') {
                    throw new HttpRequestError('Validasi gagal. Pastikan identityNumber pada passenger.data yang Anda masukkan dalam format yang benar.', 400);
                }

                if (p.issuingCountry && (typeof p.issuingCountry !== 'string' || !isNaN(p.issuingCountry))) {
                    throw new HttpRequestError('Validasi gagal. Pastikan issuingCountry pada passenger.data yang Anda masukkan dalam format yang benar.', 400);
                }

                if (p.expiryDate && (typeof p.expiryDate !== 'string' || !p.expiryDate.match(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/))) {
                    throw new HttpRequestError('Validasi gagal. Pastikan expiryDate pada passenger.data yang Anda masukkan dalam format yang benar (YYYY-MM-DD).', 400);
                }
            }
        });

        if (itinerary.journeyType === 'Round-trip' && seat.inbound.length === 0) {
            throw new HttpRequestError('Validasi gagal. Pastikan Anda memasukkan data tempat duduk pada penerbangan kepulangan (outbound) untuk rencana penerbangan Round-trip.', 400);
        }

        if (!Array.isArray(seat.outbound)) {
            throw new HttpRequestError('Validasi gagal. Pastikan data tempat duduk penumpang yang Anda kirim dalam format array.', 400);
        }

        if (seat.outbound.length !== parseInt(passenger.total)) {
            throw new HttpRequestError('Validasi gagal. Pastikan jumlah data tempat duduk penumpang bernilai sama dengan total penumpang.', 400);
        }

        seat.outbound.map((s) => {
            if (!s.label || typeof s.label !== 'string' || !s.label.match(/^P([1-9]|[1-6][0-9]|7[0-2])$/)) {
                throw new HttpRequestError('Validasi gagal. Pastikan label pada seat.outbound yang Anda masukkan dalam format yang benar.', 400);
            }

            if (!s.seatNumber || typeof s.seatNumber !== 'string' || !s.seatNumber.match(/^[A-F](?:1[0-2]|[1-9])$/)) {
                throw new HttpRequestError('Validasi gagal. Pastikan seatNumber pada seat.outbound yang Anda masukkan dalam format yang benar.', 400);
            }
        });
    },
};