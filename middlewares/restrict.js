const jwt = require('jsonwebtoken');
const AuthValidation = require('../validations/auth');
const HttpRequestError = require('../utils/error');
const { JWT_SECRET } = process.env;

module.exports = {
    allUser: (req, res, next) => {
        try {
            AuthValidation.headers(req.headers);

            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, JWT_SECRET, (err, decoded) => {
                if (err) {
                    throw new HttpRequestError('Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.', 401);
                }

                if (!(decoded.role === 'Buyer' || decoded.role === 'Admin')) {
                    throw new HttpRequestError('Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.', 403);
                }

                next();
            });
        } catch (err) {
            next(err);
        }
    },
    sameUserParam: (req, res, next) => {
        try {
            AuthValidation.headers(req.headers);

            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, JWT_SECRET, (err, decoded) => {
                if (err) {
                    throw new HttpRequestError('Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.', 401);
                }

                AuthValidation.userId(req.params);

                if (!(decoded.role === 'Buyer' || decoded.role === 'Admin') ||
                    (decoded.id !== parseInt(req.params.id) && decoded.role === 'Buyer')) {
                    throw new HttpRequestError('Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.', 403);
                }

                next();
            });
        } catch (err) {
            next(err);
        }
    },
    sameUserQuery: (req, res, next) => {
        try {
            AuthValidation.headers(req.headers);

            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, JWT_SECRET, (err, decoded) => {
                if (err) {
                    throw new HttpRequestError('Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.', 401);
                }

                AuthValidation.userId(req.query);

                if (!(decoded.role === 'Buyer' || decoded.role === 'Admin') ||
                    (decoded.id !== req.params.id && decoded.role === 'Buyer')) {
                    throw new HttpRequestError('Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.', 403);
                }

                next();
            });
        } catch (err) {
            next(err);
        }
    },
    admin: (req, res, next) => {
        try {
            AuthValidation.headers(req.headers);

            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, JWT_SECRET, (err, decoded) => {
                if (err) {
                    throw new HttpRequestError('Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.', 401);
                }

                if (decoded.role !== 'Admin') {
                    throw new HttpRequestError('Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.', 403);
                }

                next();
            });
        } catch (err) {
            next(err);
        }
    },
};