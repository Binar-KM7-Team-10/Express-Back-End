const HttpRequestError = require('../utils/error');

module.exports = {
    headers: ({ authorization }) => {
        if (!authorization || authorization.split(' ')[0] !== 'Bearer' || !authorization.split(' ')[1]) {
            throw new HttpRequestError('Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.', 401);
        }
    },
    userId: ({ id }) => {
        if (isNaN(id)) {
            throw new HttpRequestError('userId tidak valid. Pastikan userId yang Anda masukkan dalam format yang benar.', 400);
        }
    },
    bookingId: ({ id }) => {
        if (isNaN(id)) {
            throw new HttpRequestError('bookingId tidak valid. Pastikan bookingId yang Anda masukkan dalam format yang benar.', 400);
        }
    },
    bookingCode: ({ bookingCode }) => {
        if (typeof bookingCode !== 'string' || !bookingCode.match(/^[A-Za-z0-9]{10}$/)) {
            throw new HttpRequestError('bookingCode tidak valid. Pastikan bookingCode yang Anda masukkan dalam format yang benar.', 400);
        }
    },
    notificationId: ({ id }) => {
        if (!id || isNaN(id)) {
            throw new HttpRequestError('Validasi gagal. Pastikan notificationId yang Anda masukkan dalam format yang benar.', 400);
        }
    }
};