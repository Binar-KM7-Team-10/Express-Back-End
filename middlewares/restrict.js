const jwt = require('jsonwebtoken');
const AuthValidation = require('../validations/auth');
const HttpRequestError = require('../utils/error');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
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

                req.user = decoded;
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
    sameUserParamBooking: async (req, res, next) => {
        try {
            AuthValidation.headers(req.headers);

            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, JWT_SECRET, async (err, decoded) => {
                try {
                    if (err) {
                        throw new HttpRequestError('Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.', 401);
                    }
    
                    AuthValidation.bookingId(req.params);
    
                    const bookingData = await prisma.booking.findUnique({
                        where: {
                            id: parseInt(req.params.id)
                        }
                    });
    
                    if (!bookingData) {
                        throw new HttpRequestError('Riwayat pemesanan tidak ditemukan.', 404);
                    }
                    
                    if (!(decoded.role === 'Buyer' || decoded.role === 'Admin') ||
                        (decoded.id !== bookingData.userId && decoded.role === 'Buyer')) {
                        throw new HttpRequestError('Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.', 403);
                    }
    
                    next();
                } catch (err) {
                    next(err);
                }
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

                if (req.query.userId) {
                    AuthValidation.userId(req.query);

                    if (decoded.role === 'Buyer' && decoded.id !== parseInt(req.query.userId)) {
                        throw new HttpRequestError('Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.', 403);
                    }
                } else if (!req.query.userId && decoded.role !== 'Admin') {
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