const HttpRequestError = require('../utils/error');

module.exports = {
    headers: ({ authorization }) => {
        if (!authorization || authorization.split(' ')[0] !== 'Bearer' || !authorization.split(' ')[1]) {
            throw new HttpRequestError('Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.', 401);
        }
    },
    userId: ({ id }) => {
        if (!id || (id && isNaN(id))) {
            throw new HttpRequestError('userId tidak valid. Pastikan userId yang Anda masukkan dalam format yang benar.', 400);
        }
    }
};