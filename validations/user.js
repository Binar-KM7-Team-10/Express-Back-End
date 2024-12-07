const HttpRequestError = require('../utils/error');

module.exports = {
    validateLogin: (data) => {
        const { email, password } = data;

        if (!email || !password) {
            throw new HttpRequestError('Validasi gagal. Pastikan email dan password telah diisi.', 400);
        }

        if (typeof email !== 'string' || typeof password !== 'string') {
            throw new HttpRequestError('Validasi gagal. email dan password harus berupa string.', 400);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new HttpRequestError('Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar.', 400);
        }

        if (password.length < 8 || password.length > 70) {
            throw new HttpRequestError('Validasi gagal. password harus memiliki 8 hingga 70 digit.', 400);
        }
    },
    validateEmail: (data) => {
        const { email } = data;

        if (!email) {
            throw new HttpRequestError('Validasi gagal. Pastikan email telah diisi.', 400);
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new HttpRequestError('Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar.', 400);
        }
    },
    validatePasswordReset: (data) => {
        const { passwordResetToken, newPassword, confirmNewPassword } = data;

        if (!passwordResetToken || !newPassword || !confirmNewPassword) {
            throw new HttpRequestError('Validasi gagal. Pastikan passwordResetToken, newPassword, dan confirmNewPassword telah diisi.', 400);
        }

        if (typeof passwordResetToken !== 'string' || typeof newPassword !== 'string' || typeof confirmNewPassword !== 'string') {
            throw new HttpRequestError('Validasi gagal. passwordResetToken, newPassword, dan confirmNewPassword harus berupa string.', 400);
        }

        if (newPassword.length < 8 || newPassword.length > 70) {
            throw new HttpRequestError('Password tidak valid. Pastikan password memiliki antara 8 hingga 70 karakter.', 400);
        }

        if (newPassword !== confirmNewPassword) {
            throw new HttpRequestError('Validasi gagal. Pastikan newPassword dan confirmNewPassword sama.', 400);
        }
    }
};