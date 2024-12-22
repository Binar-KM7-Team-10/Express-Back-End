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

                AuthValidation.userIdParam(req.params);

                if (!(decoded.role === 'Buyer' || decoded.role === 'Admin') ||
                    (decoded.id !== parseInt(req.params.id) && decoded.role === 'Buyer')) {
                    throw new HttpRequestError('Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.', 403);
                }

                req.user = decoded;
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
    
                    req.user = decoded;
                    next();
                } catch (err) {
                    next(err);
                }
            });
        } catch (err) {
            next(err);
        }
    },
    sameUserQueryBooking: async (req, res, next) => {
        try {
            AuthValidation.headers(req.headers);

            const token = req.headers.authorization.split(' ')[1];
            let decoded;

            try {
                decoded = jwt.verify(token, JWT_SECRET);
            } catch (err) {
                if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
                    throw new HttpRequestError('Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.', 401);
                }
                throw err;
            }

            if ((Object.keys(req.query).length === 0 || (Object.keys(req.query).length === 1 && req.query.date)) && decoded.role !== 'Admin') {
                throw new HttpRequestError('Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.', 403);
            }

            if (req.query.userId) {
                AuthValidation.userIdQuery(req.query);

                if (decoded.role === 'Buyer' && decoded.id !== parseInt(req.query.userId)) {
                    throw new HttpRequestError('Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.', 403);
                }
            }

            if (req.query.bookingCode) {
                AuthValidation.bookingCode(req.query);

                const booking = await prisma.booking.findUnique({
                    where: {
                        bookingCode: req.query.bookingCode
                    }
                });

                if (booking && booking.userId !== parseInt(decoded.id) && decoded.role !== 'Admin') {
                    throw new HttpRequestError('Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.', 403);
                }
            }

            next();
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
    sameUserQueryNotification: (req, res, next) => {
        try {
            AuthValidation.headers(req.headers);

            const token = req.headers.authorization.split(' ')[1];
            let decoded;

            try {
                decoded = jwt.verify(token, JWT_SECRET);
            } catch (err) {
                if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
                    throw new HttpRequestError('Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.', 401);
                }
                throw err;
            }

            if (Object.keys(req.query).length === 0 && decoded.role !== 'Admin') {
                throw new HttpRequestError('Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.', 403);
            }

            if (req.query.userId) {
                AuthValidation.userIdQuery(req.query);

                if (decoded.role === 'Buyer' && decoded.id !== parseInt(req.query.userId)) {
                    throw new HttpRequestError('Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.', 403);
                }
            }

            next();
        } catch (err) {
            next(err);
        }
    },
    sameUserParamNotification: async (req, res, next) => {
        try {
            AuthValidation.headers(req.headers);

            const token = req.headers.authorization.split(' ')[1];
            let decoded;

            try {
                decoded = jwt.verify(token, JWT_SECRET);
            } catch (err) {
                if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
                    throw new HttpRequestError('Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.', 401);
                }
                throw err;
            }

            AuthValidation.notificationId(req.params);
            const notification = await prisma.notification.findUnique({
                where: {
                    id: parseInt(req.params.id)
                }
            });

            if (!notification) {
                throw new HttpRequestError('Notifikasi tidak ditemukan.', 404);
            }

            if (!(decoded.role === 'Buyer' || decoded.role === 'Admin') ||
                (decoded.id !== parseInt(notification.userId) && decoded.role === 'Buyer')
            ) {
                throw new HttpRequestError('Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini.', 403);
            }

            next();
        } catch (err) {
            next(err);
        }
    },
};