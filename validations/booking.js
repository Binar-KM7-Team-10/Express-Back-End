const Schedule = require("../models/schedule");
const HttpRequestError = require("../utils/error");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    validateQueryParams: (query) => {
        const {
            userId,
            bookingCode,
            date
        } = query;

        if (userId && (typeof userId !== 'string' || isNaN(userId))) {
            throw HttpRequestError('userId tidak valid. Pastikan userId yang Anda masukkan dalam format yang benar.', 400);
        }

        if (bookingCode && typeof bookingCode !== 'string') {
            throw HttpRequestError('Validasi gagal. Pastikan bookingCode yang Anda masukkan dalam format yang benar.', 400);
        }

        const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

        if (date && (typeof date !== 'string' || !date.match(dateRegex))) {
            throw new HttpRequestError('Validasi gagal. Pastikan date yang Anda masukkan dalam format yang benar (YYYY-MM-DD).', 400);
        }
    },
    validatePathParams: async (params) => {
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
            typeof itinerary.outbound !== 'number' ||
            (itinerary.inbound && typeof itinerary.inbound !== 'number')
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
        
        if (!outboundSchedule) {
            throw new HttpRequestError('Validasi gagal. Pastikan itinerary.outbound memiliki nilai scheduleId yang ada.', 400);
        }

        // Disallow ticket booking purchase for 2 hours or less before departure time
        if (new Date(Date.now()) > new Date(outboundSchedule.departureDateTime) - (2 * 60 * 60 * 1000)) {
            throw new HttpRequestError('Pemesanan ditolak. Tiket hanya dapat dipesan paling lambat 2 jam sebelum waktu keberangkatan.', 400);
        }

        const inboundSchedule = await prisma.schedule.findUnique({
            where: {
                id: itinerary.inbound ? itinerary.inbound : -1
            }
        });

        if (itinerary.journeyType === 'Round-trip') {
            if (itinerary.inbound === null) {
                throw new HttpRequestError('Validasi gagal. Pastikan Anda memasukkan jadwal penerbangan kepulangan (outbound) pada rencana penerbangan Round-trip.', 400);
            }

            if (!inboundSchedule) {
                throw new HttpRequestError('Validasi gagal. Pastikan itinerary.outbound memiliki nilai scheduleId yang tersedia.', 400);
            }

            if (new Date(outboundSchedule.arrivalDateTime) >= new Date(inboundSchedule.departureDateTime)) {
                throw new HttpRequestError('Pemesanan ditolak. Tiket pulang-pergi hanya dapat dipesan jika waktu kedatangan jadwal pergi tidak melewati waktu keberangkatan jadwal pulang.', 400);
            }
        }

        if (typeof passenger.total !== 'number' ||
            passenger.total < 0 ||
            typeof passenger.adult !== 'number' ||
            passenger.adult < 0 ||
            typeof passenger.child !== 'number' ||
            passenger.child < 0 ||
            typeof passenger.baby !== 'number' ||
            passenger.baby < 0
        ) {
            throw new HttpRequestError('Validasi gagal. Pastikan passenger.total, passenger.adult, passenger.child, dan passenger.baby yang Anda masukkan dalam format yang benar.', 400);
        }

        if (passenger.total === 0) {
            throw new HttpRequestError('Validasi gagal. Pastikan Anda memasukkan paling tidak satu penumpang pada pemesanan.', 400);
        }

        if (passenger.total !== (parseInt(passenger.adult) + parseInt(passenger.child))) {
            throw new HttpRequestError('Validasi gagal. Pastikan passenger.total memiliki nilai jumlah dari passenger.adult dan passenger.child.', 400);
        }

        if (passenger.data.length !== (parseInt(passenger.total) + parseInt(passenger.baby))) {
            throw new HttpRequestError('Validasi gagal. Pastikan passenger.data memiliki jumlah data passenger.total ditambah passenger.baby.', 400);
        }

        passenger.data.map((p) => {
            if (!p.hasOwnProperty('ageGroup')) {
                throw new HttpRequestError('Validasi gagal. Pastikan setiap passenger.data memiliki properti ageGroup.', 400);
            }

            const ageGroupOptions = ['Adult', 'Child', 'Baby'];
            if (!p.ageGroup || typeof p.ageGroup !== 'string' || !ageGroupOptions.includes(p.ageGroup)) {
                throw new HttpRequestError('Validasi gagal. Pastikan ageGroup pada passenger.data yang Anda masukkan dalam format yang benar dan memiliki nilai \'Adult\', \'Child\', atau \'Baby\'.', 400);
            }

            if (p.ageGroup !== 'Baby') {
                if (!p.hasOwnProperty('label') ||
                    !p.hasOwnProperty('title') ||
                    !p.hasOwnProperty('fullName') ||
                    !p.hasOwnProperty('birthDate') ||
                    !p.hasOwnProperty('nationality') ||
                    !p.hasOwnProperty('identityNumber')
                ) {
                    throw new HttpRequestError('Validasi gagal. Pastikan Anda memasukkan label, title, fullName, birthDate, nationality, dan identityNumber pada setiap passenger.data.', 400);
                }
                
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

            const age = Math.abs(new Date(Date.now() - new Date(p.birthDate).getTime()).getUTCFullYear() - 1970);
            
            if (p.ageGroup === 'Adult' && age < 12) {
                throw new HttpRequestError('Validasi gagal. Pastikan ageGroup \'Adult\' (lebih dari atau sama dengan 12 tahun) sesuai dengan usia penumpang.', 400);
            } else if (p.ageGroup === 'Child' && (age < 2 || age >= 12)) {
                throw new HttpRequestError('Validasi gagal. Pastikan ageGroup \'Child\' (lebih dari atau sama dengan 2 tahun dan kurang dari 12 tahun) sesuai dengan usia penumpang.', 400);
            } else if (p.ageGroup === 'Baby' && (age < 0 || age >= 2)) {
                throw new HttpRequestError('Validasi gagal. Pastikan ageGroup \'Baby\' (kurang dari 2 tahun) sesuai dengan usia penumpang.', 400);
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
        
        const seatData = await Schedule.getAvailableSeat(itinerary.outbound);
        const labels = passenger.data.map((p) => {
            if (p.ageGroup !== 'Baby') {
                return p.label;
            }
        });
        
        await Promise.all(seat.outbound.map(async (s) => {
            if (!s.label || typeof s.label !== 'string' || !s.label.match(/^P([1-9]|[1-6][0-9]|7[0-2])$/)) {
                throw new HttpRequestError('Validasi gagal. Pastikan label pada seat.outbound yang Anda masukkan dalam format yang benar.', 400);
            }

            if (!labels.includes(s.label)) {
                throw new HttpRequestError('Validasi gagal. Pastikan label pada seat.outbound yang Anda masukkan sesuai dengan data penumpang pada passenger.data.', 400);
            }

            if (!s.seatNumber || typeof s.seatNumber !== 'string' || !s.seatNumber.match(/^[A-F](?:1[0-2]|[1-9])$/)) {
                throw new HttpRequestError('Validasi gagal. Pastikan seatNumber pada seat.outbound yang Anda masukkan dalam format yang benar.', 400);
            }

            if (!seatData.includes(s.seatNumber)) {
                throw new HttpRequestError(`Pemesanan ditolak. Kursi nomor ${s.seatNumber} tidak tersedia.`, 400);
            }
        }));
    },
    validateBookingId: async (params) => {
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
            },
            include: {
                Invoice: true,
                Itinerary: true
            }
        });

        if (!bookingData) {
            throw new HttpRequestError('Pembayaran tiket penerbangan gagal dibuat. Pembayaran tiket penerbangan harus berdasarkan pesanan tiket penerbangan yang telah dibuat.', 404);
        }

        if (bookingData.status === 'Issued') {
            throw new HttpRequestError('Pembayaran tiket penerbangan gagal dibuat. Tiket penerbangan telah diisukan.', 400);
        }

        if (bookingData.status === 'Cancelled') {
            throw new HttpRequestError('Pembayaran tiket penerbangan gagal dibuat. Tiket penerbangan telah dibatalkan.', 400);
        }

        if (new Date(bookingData.Invoice.paymentDueDateTime) <= new Date(Date.now()) && bookingData.status === 'Unpaid') {
            await prisma.booking.update({
                where: {
                    id: parseInt(id)
                },
                data: {
                    status: 'Cancelled'
                }
            });

            const deletedBookedSeat = await prisma.bookedSeat.deleteMany({
                where: {
                    bookingId: parseInt(id)
                }
            });

            await prisma.schedule.update({
                where: {
                    id: bookingData.Itinerary[0].scheduleId
                },
                data: {
                    seatAvailability: {
                        increment: deletedBookedSeat.count
                    }
                }
            });

            throw new HttpRequestError('Pembayaran tiket penerbangan gagal dibuat. Batas pembayaran tiket penerbangan telah kedaluwarsa.', 400);
        }
    },
    validatePaymentData: async (data) => {
        const {
            method,
            accountNumber,
            holderName,
            CVV,
            expiryDate
        } = data;

        if (!method || !accountNumber) {
            throw new HttpRequestError('Validasi gagal. Pastikan method dan accountNumber telah diisi.', 400);
        }

        if (typeof method !== 'string' || typeof accountNumber !== 'string') {
            throw new HttpRequestError('Validasi gagal. Pastikan method dan accountNumber yang Anda masukkan dalam format yang benar.', 400);
        }

        const methodOptions = ['Credit Card', 'Virtual Account', 'Gopay'];
        if (!methodOptions.includes(method)) {
            throw new HttpRequestError('Validasi gagal. Pastikan metode pembayaran yang Anda masukkan memiliki nilai \'Credit Card\', \'Virtual Account\', atau \'Gopay\'.', 400);
        }

        if (method === 'Credit Card') {
            if (!holderName || !CVV || !expiryDate) {
                throw new HttpRequestError('Validasi gagal. Pastikan holderName, CVV, dan expiryDate telah diisi.', 400);
            }

            if (typeof holderName !== 'string' || typeof CVV !== 'string' || typeof expiryDate !== 'string') {
                throw new HttpRequestError('Validasi gagal. Pastikan holderName, CVV, dan expiryDate yang Anda masukkan dalam format yang benar.', 400);
            }

            if (accountNumber.length < 15 || accountNumber.length > 19 || isNaN(accountNumber)) {
                throw new HttpRequestError('Validasi gagal. Pastikan accountNumber yang Anda masukkan dalam format yang benar.', 400);
            }

            if (isNaN(CVV)) {
                throw new HttpRequestError('Validasi gagal. Pastikan CVV yang Anda masukkan dalam format yang benar.', 400);
            }

            if (!expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
                throw new HttpRequestError('Validasi gagal. Pastikan expiryDate yang Anda masukkan dalam format yang benar (MM/YY).', 400);
            }
        }
    },
};