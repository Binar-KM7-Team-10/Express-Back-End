const HttpRequestError = require("../utils/error");

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
    }
};